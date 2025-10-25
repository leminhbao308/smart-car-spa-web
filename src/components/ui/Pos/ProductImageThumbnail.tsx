"use client";

import React from "react";
import { BarcodeOutlined } from "@ant-design/icons";
import { useProductMainImage } from "@/lib/api/hooks/useProductMainImage";
import Image from "next/image";

interface ProductImageThumbnailProps {
  productId: string;
  productName: string;
}

const ProductImageThumbnail: React.FC<ProductImageThumbnailProps> = ({
  productId,
  productName,
}) => {
  const { mainImageUrl, loading } = useProductMainImage(productId);

  // Show loading state
  if (loading) {
    return (
      <div
        style={{
          height: "80px",
          backgroundColor: "#f5f5f5",
          borderRadius: "4px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "12px",
        }}
      >
        <BarcodeOutlined style={{ fontSize: "32px", color: "#999" }} />
      </div>
    );
  }

  // Show image if available, otherwise show placeholder
  if (mainImageUrl) {
    return (
      <div
        style={{
          height: "80px",
          backgroundColor: "#f5f5f5",
          borderRadius: "4px",
          marginBottom: "12px",
          overflow: "hidden",
          position: "relative",
        }}
      >
        <Image
          src={mainImageUrl}
          alt={productName}
          fill
          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
          style={{
            objectFit: "cover",
          }}
          loading="lazy"
        />
      </div>
    );
  }

  // Fallback to placeholder icon
  return (
    <div
      style={{
        height: "80px",
        backgroundColor: "#f5f5f5",
        borderRadius: "4px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: "12px",
      }}
    >
      <BarcodeOutlined style={{ fontSize: "32px", color: "#999" }} />
    </div>
  );
};

export default ProductImageThumbnail;
