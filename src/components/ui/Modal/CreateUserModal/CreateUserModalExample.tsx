/**
 * Example Usage of CreateUserModal
 * Component demo để sử dụng CreateUserModal
 */

"use client";

import React, { useState } from "react";
import { CreateUserModal } from "./CreateUserModal";
import { UserType } from "@/lib/api/types";
import { Button } from "@/components/ui/Button";

export function CreateUserModalExample() {
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);

  const handleCustomerSuccess = (user: any) => {
    console.log("Customer created:", user);
    // Có thể thêm logic khác như refresh danh sách, show notification, etc.
  };

  const handleStaffSuccess = (user: any) => {
    console.log("Staff created:", user);
    // Có thể thêm logic khác như refresh danh sách, show notification, etc.
  };

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Create User Modal Example</h1>
      
      <div className="space-x-4">
        <Button
          onClick={() => setIsCustomerModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          Tạo Khách Hàng Mới
        </Button>
        
        <Button
          onClick={() => setIsStaffModalOpen(true)}
          className="bg-green-600 hover:bg-green-700"
        >
          Tạo Nhân Viên Mới
        </Button>
      </div>

      {/* Customer Modal */}
      <CreateUserModal
        isOpen={isCustomerModalOpen}
        onClose={() => setIsCustomerModalOpen(false)}
        userType="CUSTOMER"
        onSuccess={handleCustomerSuccess}
      />

      {/* Staff Modal */}
      <CreateUserModal
        isOpen={isStaffModalOpen}
        onClose={() => setIsStaffModalOpen(false)}
        userType="EMPLOYEE"
        onSuccess={handleStaffSuccess}
      />
    </div>
  );
}
