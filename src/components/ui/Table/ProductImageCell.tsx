"use client";
import React from "react";
import { Image, Tooltip } from "antd";
import { ShoppingCartOutlined, StarOutlined } from "@ant-design/icons";
import { useProductMainImage } from "@/lib/api/hooks/useProductMainImage";

interface ProductImageCellProps {
  productId: string;
  productName: string;
  isFeatured?: boolean;
}

export const ProductImageCell: React.FC<ProductImageCellProps> = ({
  productId,
  productName,
  isFeatured,
}) => {
  const { mainImageUrl, loading } = useProductMainImage(productId);

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{ position: "relative" }}>
        {mainImageUrl ? (
          <Image
            src={mainImageUrl}
            alt={productName}
            width={60}
            height={60}
            style={{
              objectFit: "cover",
              borderRadius: 8,
              border: "2px solid #f0f0f0",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            }}
            preview={false}
            placeholder={
              <div
                style={{
                  width: 60,
                  height: 60,
                  backgroundColor: "#f5f5f5",
                  borderRadius: 8,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "2px solid #f0f0f0",
                }}
              >
                <ShoppingCartOutlined style={{ fontSize: 20, color: "#999" }} />
              </div>
            }
          />
        ) : (
          <div
            style={{
              width: 60,
              height: 60,
              background: loading
                ? "#f5f5f5"
                : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              borderRadius: 8,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              border: "2px solid #f0f0f0",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            }}
          >
            <ShoppingCartOutlined
              style={{
                fontSize: 20,
                color: loading ? "#999" : "#fff",
              }}
            />
          </div>
        )}

        {isFeatured && (
          <div
            style={{
              position: "absolute",
              top: -4,
              right: -4,
              backgroundColor: "#faad14",
              borderRadius: "50%",
              width: 20,
              height: 20,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
            }}
          >
            <Tooltip title="Sản phẩm nổi bật">
              <StarOutlined style={{ color: "#fff", fontSize: 10 }} />
            </Tooltip>
          </div>
        )}
      </div>
    </div>
  );
};
