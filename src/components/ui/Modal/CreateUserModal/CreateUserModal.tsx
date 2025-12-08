/**
 * Create User Modal Component
 * Modal để tạo mới khách hàng hoặc nhân viên
 */

"use client";

import React, { useState, useEffect } from "react";
import { useUserManagement } from "@/lib/api/hooks/useUserManagement";
import { CreateUserRequest, UserType } from "@/lib/api/types";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  userType: UserType;
  onSuccess?: (user: any) => void;
}

interface FormData {
  email: string;
  password: string;
  fullName: string;
  phoneNumber: string;
  dateOfBirth: string;
  gender: "MALE" | "FEMALE" | "OTHER";
  address: string;
  avatarUrl?: string;
}

const initialFormData: FormData = {
  email: "",
  password: "",
  fullName: "",
  phoneNumber: "",
  dateOfBirth: "",
  gender: "MALE",
  address: "",
  avatarUrl: "",
};

export function CreateUserModal({
  isOpen,
  onClose,
  userType,
  onSuccess,
}: CreateUserModalProps) {
  const { createUser, isLoading, error, clearError } = useUserManagement();
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [formErrors, setFormErrors] = useState<Partial<FormData>>({});

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setFormData(initialFormData);
      setFormErrors({});
      clearError();
    }
  }, [isOpen, clearError]);

  // Handle form input changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error for this field
    if (formErrors[name as keyof FormData]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  // Validate form
  const validateForm = (): boolean => {
    const errors: Partial<FormData> = {};

    // Email validation
    if (!formData.email) {
      errors.email = "Email là bắt buộc";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Email không hợp lệ";
    }

    // Password validation
    if (!formData.password) {
      errors.password = "Mật khẩu là bắt buộc";
    } else if (formData.password.length < 6) {
      errors.password = "Mật khẩu phải có ít nhất 6 ký tự";
    }

    // Full name validation
    if (!formData.fullName.trim()) {
      errors.fullName = "Họ tên là bắt buộc";
    }

    // Phone number validation
    if (!formData.phoneNumber) {
      errors.phoneNumber = "Số điện thoại là bắt buộc";
    } else if (!/^[0-9]{10,11}$/.test(formData.phoneNumber.replace(/\s/g, ""))) {
      errors.phoneNumber = "Số điện thoại không hợp lệ";
    }

    // Date of birth validation
    if (!formData.dateOfBirth) {
      errors.dateOfBirth = "Ngày sinh là bắt buộc";
    } else {
      const birthDate = new Date(formData.dateOfBirth);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      if (age < 16 || age > 100) {
        errors.dateOfBirth = "Tuổi phải từ 16 đến 100";
      }
    }

    // Address validation
    if (!formData.address.trim()) {
      errors.address = "Địa chỉ là bắt buộc";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      // Prepare data for API
      const createUserData: CreateUserRequest = {
        email: formData.email,
        password: formData.password,
        googleId: null,
        fullName: formData.fullName,
        phoneNumber: formData.phoneNumber,
        dateOfBirth: new Date(formData.dateOfBirth).toISOString(),
        gender: formData.gender,
        address: formData.address,
        avatarUrl: formData.avatarUrl || null,
        roleCode: userType === "CUSTOMER" ? "CUSTOMER" : "STAFF",
      };

      console.log("Submitting user data:", createUserData);

      const response = await createUser(createUserData);

      console.log("User created successfully:", response);

      // Call success callback
      if (onSuccess) {
        onSuccess(response.data);
      }

      // Close modal
      onClose();

      // Show success message (you can use toast notification here)
      alert(`${userType === "CUSTOMER" ? "Khách hàng" : "Nhân viên"} đã được tạo thành công!`);

    } catch (error) {
      console.log("Error creating user:", error);
      // Error is already handled by the hook
    }
  };

  // Handle modal close
  const handleClose = () => {
    if (!isLoading) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Tạo {userType === "CUSTOMER" ? "Khách Hàng" : "Nhân Viên"} Mới
          </h2>
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email *
            </label>
            <Input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Nhập email"
              error={formErrors.email}
              disabled={isLoading}
            />
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Mật khẩu *
            </label>
            <Input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Nhập mật khẩu"
              error={formErrors.password}
              disabled={isLoading}
            />
          </div>

          {/* Full Name */}
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
              Họ và tên *
            </label>
            <Input
              type="text"
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleInputChange}
              placeholder="Nhập họ và tên"
              error={formErrors.fullName}
              disabled={isLoading}
            />
          </div>

          {/* Phone Number */}
          <div>
            <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
              Số điện thoại *
            </label>
            <Input
              type="tel"
              id="phoneNumber"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleInputChange}
              placeholder="Nhập số điện thoại"
              error={formErrors.phoneNumber}
              disabled={isLoading}
            />
          </div>

          {/* Date of Birth */}
          <div>
            <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 mb-1">
              Ngày sinh *
            </label>
            <Input
              type="date"
              id="dateOfBirth"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleInputChange}
              error={formErrors.dateOfBirth}
              disabled={isLoading}
            />
          </div>

          {/* Gender */}
          <div>
            <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">
              Giới tính *
            </label>
            <select
              id="gender"
              name="gender"
              value={formData.gender}
              onChange={handleInputChange}
              disabled={isLoading}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="MALE">Nam</option>
              <option value="FEMALE">Nữ</option>
              <option value="OTHER">Khác</option>
            </select>
          </div>

          {/* Address */}
          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
              Địa chỉ *
            </label>
            <textarea
              id="address"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              placeholder="Nhập địa chỉ"
              rows={3}
              disabled={isLoading}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed ${
                formErrors.address ? "border-red-500" : "border-gray-300"
              }`}
            />
            {formErrors.address && (
              <p className="mt-1 text-sm text-red-600">{formErrors.address}</p>
            )}
          </div>

          {/* Avatar URL (Optional) */}
          <div>
            <label htmlFor="avatarUrl" className="block text-sm font-medium text-gray-700 mb-1">
              URL Ảnh đại diện (tùy chọn)
            </label>
            <Input
              type="url"
              id="avatarUrl"
              name="avatarUrl"
              value={formData.avatarUrl}
              onChange={handleInputChange}
              placeholder="Nhập URL ảnh đại diện"
              disabled={isLoading}
            />
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="min-w-[120px]"
            >
              {isLoading ? "Đang tạo..." : "Tạo mới"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
