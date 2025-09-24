"use client";
import React from "react";
import {
  FeaturedServices,
  ProductCategories,
  NewsSection,
} from "@/components/ui/Home";

export default function HomePage() {
  return (
    <div>
      {/* Featured Services Section */}
      <div style={{ paddingTop: "20px", paddingBottom: "40px" }}>
        <FeaturedServices />
      </div>

      {/* Product Categories Section */}
      <div style={{ paddingBottom: "40px" }}>
        <ProductCategories />
      </div>

      {/* News Section */}
      <div style={{ paddingBottom: "60px" }}>
        <NewsSection />
      </div>
    </div>
  );
}
