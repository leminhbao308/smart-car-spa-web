"use client";
import React from "react";
import {
  FeaturedServices,
  ProductCategories,
  NewsSection,
  FeaturedProductsSection,
} from "@/components/ui/Home";

export default function HomePage() {
  return (
    <div>
      {/* Featured Services Section */}
      <div style={{ paddingTop: "20px", paddingBottom: "40px" }}>
        <FeaturedServices />
      </div>

      {/* Featured Products Section */}
      <div style={{ paddingBottom: "40px" }}>
        <FeaturedProductsSection />
      </div>

      {/* Product Categories Section */}
      {/*<div style={{ paddingBottom: "40px" }}>*/}
      {/*  <ProductCategories />*/}
      {/*</div>*/}

      {/* News Section */}
      <div style={{ paddingBottom: "60px" }}>
        <NewsSection />
      </div>
    </div>
  );
}
