import { useQuery } from "@tanstack/react-query";
import { productService } from "@/lib/api/services/product.service";

/**
 * Hook to get the main image URL for a product
 * Uses React Query for automatic cache invalidation
 * @param productId - The ID of the product
 * @returns The main image URL or null if not found
 */
export const useProductMainImage = (productId: string | undefined) => {
  const {
    data: images,
    isLoading,
    dataUpdatedAt,
  } = useQuery({
    queryKey: ["productImages", productId],
    queryFn: () => productService.getProductImages(productId!),
    enabled: !!productId,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  // Find the main image (is_main === true)
  const mainImage = images?.find((img) => img.is_main);
  const mainImageUrl = mainImage?.media_url || null;

  // Debug logging (remove in production)
  if (process.env.NODE_ENV === "development" && productId) {
    console.log(`[useProductMainImage] Product ${productId}:`, {
      totalImages: images?.length,
      mainImageUrl,
      dataUpdatedAt: new Date(dataUpdatedAt),
    });
  }

  return { mainImageUrl, loading: isLoading };
};
