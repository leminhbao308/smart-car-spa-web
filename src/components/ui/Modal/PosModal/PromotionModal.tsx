"use client";

import React from "react";
import { Modal } from "antd";
import type { CartItem } from "@/components/ui/Pos/CartSection";
import type { Promotion } from "@/lib/api/types/promotion.types";
import type { BranchDisplay } from "@/lib/api/types/branch.types";
import PromotionSection from "@/components/ui/Pos/PromotionSection";

interface PromotionModalProps {
  isVisible: boolean;
  promotions: Promotion[];
  selectedPromotions: Promotion[];
  cart: CartItem[];
  productLookup: Map<
    string,
    { name: string; price: number; stock: number; category: string }
  >;
  selectedBranch: BranchDisplay | null;
  onTogglePromotion: (promotion: Promotion) => void;
  onCancel: () => void;
}

const PromotionModal: React.FC<PromotionModalProps> = ({
  isVisible,
  promotions,
  selectedPromotions,
  cart,
  productLookup,
  selectedBranch,
  onTogglePromotion,
  onCancel,
}) => {
  return (
    <Modal
      title="Chọn khuyến mãi"
      open={isVisible}
      onCancel={onCancel}
      footer={null}
      width={800}
      styles={{
        body: {
          maxHeight: "70vh",
          overflow: "auto",
        },
      }}
    >
      <PromotionSection
        promotions={promotions}
        selectedPromotions={selectedPromotions}
        cart={cart}
        productLookup={productLookup}
        selectedBranch={selectedBranch}
        onTogglePromotion={onTogglePromotion}
      />
    </Modal>
  );
};

export default PromotionModal;
