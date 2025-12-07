"use client";
import { Carousel, Skeleton } from "antd";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useServices } from "@/lib/api/hooks/useServices";
import { MediaService } from "@/lib/api/services/media.service";
import { useEffect, useState } from "react";

export interface CarouselItem {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  linkUrl: string;
}

interface CustomerCarouselProps {
  carouselData?: CarouselItem[];
}

const carouselItemStyle: React.CSSProperties = {
  position: "relative",
  height: "calc(100vh - 100px)",
  overflow: "hidden",
};

const overlayStyle: React.CSSProperties = {
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: "linear-gradient(45deg, rgba(0,0,0,0.6), rgba(0,0,0,0.3))",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  textAlign: "center",
  padding: "2rem",
  color: "white",
};

const titleStyle: React.CSSProperties = {
  fontSize: "2.5rem",
  fontWeight: "bold",
  marginBottom: "1rem",
  textShadow: "2px 2px 4px rgba(0,0,0,0.8)",
};

const descriptionStyle: React.CSSProperties = {
  fontSize: "1.2rem",
  marginBottom: "2rem",
  maxWidth: "600px",
  lineHeight: "1.6",
  textShadow: "1px 1px 2px rgba(0,0,0,0.8)",
};

const linkStyle: React.CSSProperties = {
  display: "inline-block",
  padding: "12px 30px",
  backgroundColor: "#1890ff",
  color: "white",
  textDecoration: "none",
  borderRadius: "25px",
  fontSize: "1.1rem",
  fontWeight: "600",
  transition: "all 0.3s ease",
  boxShadow: "0 4px 15px rgba(24, 144, 255, 0.3)",
};

const imageStyle: React.CSSProperties = {
  width: "100%",
  height: "100%",
  objectFit: "cover",
};

const CustomerCarousel = ({ carouselData }: CustomerCarouselProps) => {
  const pathname = usePathname();
  // Gọi API service bình thường với filter is_featured=true và is_active=true
  const { data: servicesResponse, isLoading } = useServices({
    page: 0,
    size: 4, // Chỉ lấy 4 dịch vụ
    is_featured: true,
    is_active: true,
  });
  const [servicesWithImages, setServicesWithImages] = useState<CarouselItem[]>([]);

  // Load images for featured services
  useEffect(() => {
    // Only load if we're on the home page
    if (pathname !== "/") {
      return;
    }

    const loadServiceImages = async () => {
      // Lấy danh sách dịch vụ từ response
      // Response có thể là: { success: true, data: { content: [...], totalElements: ... } } hoặc { success: true, data: [...] }
      let servicesList: any[] = [];
      
      if (servicesResponse?.data) {
        const data = servicesResponse.data;
        
        // Type guard: Kiểm tra nếu data là array trực tiếp
        if (Array.isArray(data)) {
          servicesList = data;
        }
        // Nếu data là object có content (pagination response)
        else if (data && typeof data === 'object' && 'content' in data) {
          const paginatedData = data as { content: any[] };
          if (Array.isArray(paginatedData.content)) {
            servicesList = paginatedData.content;
          }
        }
      } else if (Array.isArray(servicesResponse)) {
        servicesList = servicesResponse;
      }
      
      // Chỉ sử dụng dữ liệu từ API, không dùng fallback data
      if (!servicesList || servicesList.length === 0) {
        console.log("[Carousel] No services from API, waiting for data...");
        setServicesWithImages([]);
        return;
      }

      console.log("[Carousel] Services from API:", servicesList.length, servicesList);

      // Lấy 4 dịch vụ đầu tiên (đã được filter is_featured=true và is_active=true từ API)
      const servicesToShow = servicesList.slice(0, 4);
      console.log("[Carousel] Services to show in carousel:", servicesToShow.length, servicesToShow.map(s => ({ name: s.service_name, id: s.service_id, url: s.service_url })));
      
      // If no services to show, return empty
      if (servicesToShow.length === 0) {
        setServicesWithImages([]);
        return;
      }
      
      try {
        console.log("[Carousel] Loading images for featured services:", servicesToShow.length);
        
        // Load main images for all services in parallel
        const serviceIds = servicesToShow
          .map(s => s.service_id)
          .filter((id): id is string => Boolean(id));
        
        if (serviceIds.length === 0) {
          console.warn("[Carousel] No service IDs to load images for");
          setServicesWithImages([]);
          return;
        }

        console.log("[Carousel] Service IDs to load:", serviceIds);

        // Load images from API - Logic: main image first, if not then first image
        // getMainImagesBatch already implements this logic correctly
        let imageMap: Record<string, string> = {};
        try {
          // Try batch load first - this already handles: main image first, then first image
          imageMap = await MediaService.getMainImagesBatch(serviceIds, "SERVICE");
          console.log("[Carousel] Loaded service images batch:", imageMap);
        } catch (imageError) {
          console.error("[Carousel] Error loading service images batch:", imageError);
          // Try to load images individually as fallback
          console.log("[Carousel] Attempting to load images individually...");
          for (const serviceId of serviceIds) {
            try {
              // First try to get main media (is_main = true)
              try {
                const mainMedia = await MediaService.getMainMediaByEntity("SERVICE", serviceId);
                if (mainMedia?.media_url) {
                  imageMap[serviceId] = mainMedia.media_url;
                  console.log(`[Carousel] Found main image for service ${serviceId}`);
                  continue; // Found main image, skip to next service
                }
              } catch {
                // Main media not found, continue to get all media
              }

              // Fallback: Get all media and use main one or first one
              const allMedia = await MediaService.getMediaByEntity("SERVICE", serviceId);
              if (allMedia && allMedia.length > 0) {
                // Try to find main image first (is_main = true)
                const mainMedia = allMedia.find(m => m.is_main === true);
                if (mainMedia?.media_url) {
                  imageMap[serviceId] = mainMedia.media_url;
                  console.log(`[Carousel] Found main image from all media for service ${serviceId}`);
                } else {
                  // If no main image, use first one (sorted by sort_order from backend)
                  const firstMedia = allMedia[0];
                  if (firstMedia?.media_url) {
                    imageMap[serviceId] = firstMedia.media_url;
                    console.log(`[Carousel] Using first image for service ${serviceId}`);
                  }
                }
              } else {
                console.warn(`[Carousel] No media found for service ${serviceId}`);
              }
            } catch (err) {
              console.warn(`[Carousel] Failed to load image for service ${serviceId}:`, err);
            }
          }
        }

        console.log("[Carousel] Final image map:", imageMap);

        // Map services to carousel items - include all 4 featured services
        // Use actual image if available, otherwise use placeholder
        const carouselItems: CarouselItem[] = servicesToShow.map((service, index) => {
          // Get image: prefer actual image from API, fallback to placeholder
          const imageUrl = imageMap[service.service_id] && 
                          imageMap[service.service_id].trim() !== "" 
                          ? imageMap[service.service_id] 
                          : "/images/background01.jpg";
          
          // Use service_url if available (preferred), otherwise use service_id for link
          // service_url is the URL-friendly identifier, service_id is the UUID
          const serviceUrl = service.service_url || service.service_id || "";
          const description = service.description || service.service_name || "Dịch vụ chăm sóc xe chuyên nghiệp";
          
          console.log(`[Carousel] Service ${index + 1}: ${service.service_name}, URL: ${serviceUrl}, Image: ${imageUrl ? 'Yes' : 'No'}`);
          
          return {
            id: index + 1,
            title: service.service_name || "Dịch vụ",
            description: description.length > 150 ? description.substring(0, 150) + "..." : description,
            imageUrl: imageUrl,
            linkUrl: `/services/${serviceUrl}`, // Link to service detail page using service_url or service_id
          };
        });

        console.log("[Carousel] Final carousel items:", carouselItems);
        setServicesWithImages(carouselItems);
      } catch (error) {
        console.error("[Carousel] Error loading service data:", error);
        // Fallback: show services without images
        const carouselItems: CarouselItem[] = servicesToShow.map((service, index) => {
          const serviceUrl = service.service_url || service.service_id || "";
          const description = service.description || service.service_name || "Dịch vụ chăm sóc xe chuyên nghiệp";
          
          console.log(`[Carousel] Fallback - Service ${index + 1}: ${service.service_name}, URL: ${serviceUrl}`);
          
          return {
            id: index + 1,
            title: service.service_name || "Dịch vụ",
            description: description.length > 150 ? description.substring(0, 150) + "..." : description,
            imageUrl: "/images/background01.jpg",
            linkUrl: `/services/${serviceUrl}`,
          };
        });
        setServicesWithImages(carouselItems);
      }
    };

    if (!isLoading) {
      loadServiceImages();
    }
  }, [servicesResponse, carouselData, isLoading, pathname]);

  // Chỉ hiển thị carousel ở trang chủ
  if (pathname !== "/") {
    return null;
  }

  // Show loading skeleton
  if (isLoading) {
    return (
      <div style={carouselItemStyle}>
        <Skeleton.Image
          active
          style={{ width: "100%", height: "100%" }}
        />
      </div>
    );
  }

  // Chỉ sử dụng dữ liệu từ API, không fallback về carouselData
  // Nếu chưa có dữ liệu từ API thì không hiển thị (đợi load xong)
  if (servicesWithImages.length === 0) {
    // Nếu đang loading hoặc chưa có dữ liệu từ API, không hiển thị gì
    return null;
  }

  const displayData = servicesWithImages;

  return (
    <Carousel autoplay autoplaySpeed={5000} effect="fade">
      {displayData.map((item) => (
        <div key={item.id}>
          <div style={carouselItemStyle}>
            <Image
              src={item.imageUrl}
              alt={item.title}
              fill
              sizes="100vw"
              style={imageStyle}
              priority={item.id === 1}
            />
            <div style={overlayStyle}>
              <h2 style={titleStyle}>{item.title}</h2>
              <p style={descriptionStyle}>{item.description}</p>
              <Link href={item.linkUrl} style={linkStyle}>
                Xem chi tiết
              </Link>
            </div>
          </div>
        </div>
      ))}
    </Carousel>
  );
};

export default CustomerCarousel;
