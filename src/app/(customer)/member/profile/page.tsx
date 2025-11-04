"use client";
import React, { useState, useEffect } from "react";
import {
  Card,
  Row,
  Col,
  Typography,
  Button,
  Avatar,
  Divider,
  Space,
  Tag,
  Spin,
  Form,
  Input,
  Upload,
  DatePicker,
  Select,
  App,
  Modal,
} from "antd";
import type { UploadFile, UploadChangeParam } from "antd/es/upload";
import {
  UserOutlined,
  EditOutlined,
  SaveOutlined,
  CloseOutlined,
  PhoneOutlined,
  MailOutlined,
  CalendarOutlined,
  CarOutlined,
  HistoryOutlined,
  CameraOutlined,
  CheckCircleOutlined,
  LockOutlined,
  ShoppingOutlined,
} from "@ant-design/icons";
import { useAuth } from "@/lib/api/hooks/useAuth";
import { useUser } from "@/lib/api/hooks/useUsers";
import { useRouter } from "next/navigation";
import dayjs from "dayjs";
import { UserService } from "@/lib/api/services/user.service";
import { AuthService } from "@/lib/api/services/auth.service";
import { useQueryClient } from "@tanstack/react-query";
import { TokenManager } from "@/lib/api/utils/token.manager";

const { Title, Text } = Typography;
const { Option } = Select;

const ProfileMemberPage = () => {
  const { user: authUser, isAuthenticated, isLoading: authLoading } = useAuth();
  const queryClient = useQueryClient();
  const router = useRouter();
  const [form] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string>("");
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] =
    useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const uploadInProgressRef = React.useRef(false);

  // Get fresh user data using React Query
  const {
    user,
    loading: userLoading,
    refetch: refetchUser,
  } = useUser(authUser?.user_id || null);
  const { message } = App.useApp();

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/auth/login");
    }
  }, [authLoading, isAuthenticated, router]);

  // Set form values when user data loads
  useEffect(() => {
    if (user) {
      console.log("User data loaded:", user);
      console.log("Created date:", user.created_date);
      console.log("Created at:", user.created_at);

      form.setFieldsValue({
        full_name: user.full_name,
        email: user.email,
        phone_number: user.phone_number,
        date_of_birth: user.date_of_birth ? dayjs(user.date_of_birth) : null,
        address: user.address || "",
        gender: user.gender ? convertGenderToVietnamese(user.gender) : "",
      });
      setAvatarUrl(user.avatar_url || "");
    }
  }, [user, form]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    form.resetFields();
    if (user) {
      form.setFieldsValue({
        full_name: user.full_name,
        email: user.email,
        phone_number: user.phone_number,
        date_of_birth: user.date_of_birth ? dayjs(user.date_of_birth) : null,
        address: user.address || "",
        gender: user.gender ? convertGenderToVietnamese(user.gender) : "",
      });
    }
  };

  // Convert gender from Vietnamese to English for API
  const convertGenderToEnglish = (gender: string): "MALE" | "FEMALE" => {
    const genderMap: { [key: string]: "MALE" | "FEMALE" } = {
      Nam: "MALE",
      Nữ: "FEMALE",
      nam: "MALE",
      nữ: "FEMALE",
      MALE: "MALE",
      FEMALE: "FEMALE",
      male: "MALE",
      female: "FEMALE",
    };

    return genderMap[gender] || "MALE";
  };

  // Convert gender from English to Vietnamese for display
  const convertGenderToVietnamese = (gender: string): string => {
    console.log(
      "Converting gender to Vietnamese:",
      gender,
      "type:",
      typeof gender
    );
    const genderMap: { [key: string]: string } = {
      MALE: "Nam",
      FEMALE: "Nữ",
      male: "Nam",
      female: "Nữ",
    };

    const result = genderMap[gender] || "Nam";
    console.log("Gender conversion result:", result);
    return result;
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const values = await form.validateFields();

      if (!user?.user_id) {
        message.error("Không tìm thấy thông tin người dùng!");
        return;
      }

      // Test API connection first
      console.log("Testing API connection...");
      console.log("Current user:", user);
      console.log("Form values:", values);

      // Prepare update data
      const updateData = {
        full_name: values.full_name,
        email: values.email,
        phone_number: values.phone_number,
        date_of_birth: values.date_of_birth
          ? values.date_of_birth.format("YYYY-MM-DD")
          : "",
        address: values.address || "",
        gender: values.gender ? convertGenderToEnglish(values.gender) : "MALE",
      };

      // Try different date formats if the first one fails
      if (values.date_of_birth) {
        const dateTimeFormat = values.date_of_birth.format(
          "YYYY-MM-DDTHH:mm:ss"
        );
        console.log("Alternative datetime format:", dateTimeFormat);
      }

      console.log("=== UPDATE PROFILE DEBUG ===");
      console.log("Update profile data:", updateData);
      console.log("Data types:", {
        full_name: typeof updateData.full_name,
        email: typeof updateData.email,
        phone_number: typeof updateData.phone_number,
        date_of_birth: typeof updateData.date_of_birth,
        gender: typeof updateData.gender,
        address: typeof updateData.address,
      });
      console.log("Date of birth value:", values.date_of_birth);
      console.log(
        "Formatted date:",
        values.date_of_birth
          ? values.date_of_birth.format("YYYY-MM-DD")
          : "null"
      );
      console.log("Gender value (from form):", values.gender);
      console.log(
        "Gender after conversion (for API):",
        values.gender ? convertGenderToEnglish(values.gender) : "MALE"
      );
      console.log("Gender conversion test:", {
        Nam: convertGenderToEnglish("Nam"),
        Nữ: convertGenderToEnglish("Nữ"),
        MALE: convertGenderToEnglish("MALE"),
        FEMALE: convertGenderToEnglish("FEMALE"),
      });
      console.log("User ID:", user.user_id);
      console.log("All form values:", values);
      console.log("=== END DEBUG ===");

      // Call API to update user profile
      let response;
      try {
        response = await UserService.updateUser(user.user_id, updateData);
        console.log("Update response:", response);
      } catch (error) {
        // If first attempt fails with date format error, try with datetime format
        if (error instanceof Error && error.message.includes("date_of_birth")) {
          console.log("First attempt failed, trying with datetime format...");
          const retryData = {
            ...updateData,
            date_of_birth: values.date_of_birth
              ? values.date_of_birth.format("YYYY-MM-DDTHH:mm:ss")
              : "",
            gender: values.gender
              ? convertGenderToEnglish(values.gender)
              : "MALE",
          };
          console.log("Retry data:", retryData);
          response = await UserService.updateUser(user.user_id, retryData);
          console.log("Retry response:", response);
        } else {
          throw error;
        }
      }

      message.success("Cập nhật thông tin thành công!");
      setIsEditing(false);

      // Refresh user data using React Query
      console.log("Refreshing user data...");
      await refetchUser();

      // Also invalidate related queries to ensure fresh data
      queryClient.invalidateQueries({
        queryKey: ["users", "detail", user.user_id],
      });
      queryClient.invalidateQueries({ queryKey: ["auth", "user"] });
      console.log("User data refreshed successfully!");
    } catch (error) {
      console.log("Error updating profile:", error);
      console.log("Error details:", {
        message: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
        response:
          error instanceof Error && "response" in error
            ? (error as { response?: unknown }).response
            : undefined,
      });

      // Show more specific error message
      if (error instanceof Error && error.message.includes("date_of_birth")) {
        message.error(
          "Lỗi cập nhật ngày sinh. Vui lòng thử lại sau khi backend được cập nhật."
        );
      } else {
        message.error("Có lỗi xảy ra khi cập nhật thông tin!");
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarUpload = async (file: File) => {
    // Prevent duplicate uploads
    if (uploadInProgressRef.current) {
      console.log("Upload already in progress, skipping duplicate call");
      return;
    }

    console.log("handleAvatarUpload called with file:", file);

    if (!user?.user_id) {
      message.error("Không tìm thấy thông tin người dùng!");
      return;
    }

    // Validate file type before upload
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
    ];
    if (!allowedTypes.includes(file.type)) {
      message.error("Chỉ chấp nhận file hình ảnh: JPG, PNG, GIF, WebP");
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      message.error("Kích thước file tối đa là 5MB");
      return;
    }

    // Set flag to prevent duplicate calls
    uploadInProgressRef.current = true;

    try {
      setIsUploadingAvatar(true);

      // Call API to upload avatar
      const response = await UserService.uploadAvatar(user.user_id, file);

      if (response.success && response.data) {
        // Update avatar URL from response - use avatar_url directly from response
        const newAvatarUrl = response.data.avatar_url || "";
        console.log("Profile: Avatar URL from upload response:", newAvatarUrl);
        setAvatarUrl(newAvatarUrl);

        message.success("Cập nhật ảnh đại diện thành công!");

        // Refresh user data using React Query
        await refetchUser();

        // Also invalidate related queries to ensure fresh data
        queryClient.invalidateQueries({
          queryKey: ["users", "detail", user.user_id],
        });
        queryClient.invalidateQueries({ queryKey: ["auth", "user"] });

        // Update auth context by updating user in storage with new avatar_url
        try {
          console.log("Profile: Updating user in storage with avatar_url from response:", newAvatarUrl);

          // Get current user from storage
          const currentUser = AuthService.getCurrentUserFromStorage();
          console.log("Profile: Current user from storage:", currentUser);

          if (currentUser && newAvatarUrl) {
            // Update user with new avatar_url
            const updatedUser = {
              ...currentUser,
              avatar_url: newAvatarUrl,
            };

            console.log("Profile: Updated user object with avatar_url:", updatedUser.avatar_url);

            // Save updated user to storage
            TokenManager.setUserInfo(updatedUser);

            // Verify it was saved correctly
            const verifyUser = AuthService.getCurrentUserFromStorage();
            console.log("Profile: Verified user from storage after save:", verifyUser);
            console.log("Profile: Verified avatar_url from storage:", verifyUser?.avatar_url);

            // Also sync to cookies for consistency
            const accessToken = TokenManager.getAccessToken();
            const refreshToken = TokenManager.getRefreshToken();
            if (accessToken && refreshToken) {
              TokenManager.syncToCookies(accessToken, refreshToken, updatedUser);
            }

            // Trigger a custom event to notify AccountPopup to refresh
            if (typeof window !== "undefined") {
              console.log("Profile: Dispatching userAvatarUpdated event with avatar_url:", updatedUser.avatar_url);
              window.dispatchEvent(new CustomEvent("userAvatarUpdated", {
                detail: updatedUser
              }));

              // Also dispatch a simpler event with just the avatar URL for immediate update
              window.dispatchEvent(new CustomEvent("avatarUrlUpdated", {
                detail: { avatar_url: updatedUser.avatar_url }
              }));
            }
          } else {
            // Fallback: try to get fresh user from API
            console.log("Profile: Falling back to API call...");
            const updatedUser = await AuthService.getCurrentUser();
            console.log("Profile: Updated user from API:", updatedUser);
            console.log("Profile: Avatar URL in updated user:", updatedUser?.avatar_url);

            if (updatedUser) {
              TokenManager.setUserInfo(updatedUser);
              const accessToken = TokenManager.getAccessToken();
              const refreshToken = TokenManager.getRefreshToken();
              if (accessToken && refreshToken) {
                TokenManager.syncToCookies(accessToken, refreshToken, updatedUser);
              }

              if (typeof window !== "undefined") {
                window.dispatchEvent(new CustomEvent("userAvatarUpdated", {
                  detail: updatedUser
                }));
                window.dispatchEvent(new CustomEvent("avatarUrlUpdated", {
                  detail: { avatar_url: updatedUser.avatar_url }
                }));
              }
            }
          }
        } catch (error) {
          console.log("Failed to refresh auth context:", error);
          // Continue anyway - the data will refresh on next page load
        }
      }
    } catch (error) {
      console.log("Error uploading avatar:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Có lỗi xảy ra khi cập nhật ảnh đại diện!";
      message.error(errorMessage);
    } finally {
      setIsUploadingAvatar(false);
      uploadInProgressRef.current = false;
    }
  };

  const handleAvatarChange = async (info: UploadChangeParam<UploadFile>) => {
    // Ignore onChange if upload is already in progress or if we're handling via beforeUpload
    if (uploadInProgressRef.current) {
      console.log("Upload in progress, ignoring onChange");
      return;
    }

    console.log("handleAvatarChange called:", info);
    console.log("File status:", info.file?.status);
    console.log("FileList:", info.fileList);

    // Only process if fileList exists and beforeUpload hasn't already triggered
    // Since we handle upload in beforeUpload, we can safely ignore onChange
    // This prevents duplicate calls
  };

  const handleChangePassword = async (values: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }) => {
    try {
      setIsChangingPassword(true);

      // Prepare change password request
      const request = {
        current_password: values.currentPassword,
        new_password: values.newPassword,
      };

      // Call API to change password
      await AuthService.changePassword(request);

      message.success("Đổi mật khẩu thành công!");
      setIsChangePasswordModalOpen(false);
      passwordForm.resetFields();
    } catch (error: unknown) {
      console.log("Error changing password:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Có lỗi xảy ra. Vui lòng thử lại!";
      message.error(errorMessage);
    } finally {
      setIsChangingPassword(false);
    }
  };

  if (authLoading || userLoading) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <Spin size="large" />
        <div style={{ marginTop: 16 }}>Đang tải thông tin...</div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <App>
      <div style={{ padding: "24px", maxWidth: "1200px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <Title level={2}>Thông tin cá nhân</Title>
          <Text type="secondary">
            Quản lý thông tin tài khoản và cài đặt cá nhân
          </Text>
        </div>

        <Row gutter={[24, 24]}>
          {/* Profile Card */}
          <Col
            xs={24}
            lg={8}
          >
            <Card
              style={{
                textAlign: "center",
                borderRadius: "16px",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
              }}
            >
              <div style={{ marginBottom: "24px" }}>
                <Avatar
                  size={120}
                  icon={<UserOutlined />}
                  src={
                    avatarUrl && avatarUrl.trim() !== "" ? avatarUrl : undefined
                  }
                  style={{
                    backgroundColor: "#1890ff",
                    fontSize: "48px",
                  }}
                />
                <div style={{ marginTop: "16px" }}>
                  <Title
                    level={3}
                    style={{ margin: 0 }}
                  >
                    {user.full_name}
                  </Title>
                  <Text type="secondary">Khách hàng VIP</Text>
                </div>
              </div>

              <Space
                direction="vertical"
                size="small"
                style={{ width: "100%" }}
              >
                <Upload
                  name="file"
                  showUploadList={false}
                  onChange={handleAvatarChange}
                  beforeUpload={(file) => {
                    // Prevent auto upload
                    console.log("beforeUpload called with file:", file);

                    // Trigger upload immediately when file is selected
                    // Only if upload is not already in progress
                    if (file instanceof File && !uploadInProgressRef.current) {
                      handleAvatarUpload(file);
                    }

                    return false;
                  }}
                  accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                  maxCount={1}
                >
                  <Button
                    icon={<CameraOutlined />}
                    loading={isUploadingAvatar}
                    disabled={isUploadingAvatar || isSaving}
                    style={{ width: "100%" }}
                  >
                    {isUploadingAvatar
                      ? "Đang tải lên..."
                      : "Đổi ảnh đại diện"}
                  </Button>
                </Upload>
                {!isEditing && (
                  <Button
                    type="primary"
                    icon={<EditOutlined />}
                    onClick={handleEdit}
                    disabled={isSaving}
                    style={{ width: "100%" }}
                  >
                    Chỉnh sửa thông tin
                  </Button>
                )}
                <Button
                  icon={<LockOutlined />}
                  onClick={() => setIsChangePasswordModalOpen(true)}
                  disabled={isSaving}
                  style={{ width: "100%" }}
                >
                  Đổi mật khẩu
                </Button>
              </Space>

              <Divider />

              <div style={{ textAlign: "left" }}>
                <div style={{ marginBottom: "12px" }}>
                  <Text strong>Trạng thái tài khoản:</Text>
                  <div style={{ marginTop: "4px" }}>
                    <Tag
                      color="green"
                      icon={<CheckCircleOutlined />}
                    >
                      Đã xác thực
                    </Tag>
                  </div>
                </div>

                <div style={{ marginBottom: "12px" }}>
                  <Text strong>Ngày tham gia:</Text>
                  <div style={{ marginTop: "4px" }}>
                    <Text type="secondary">
                      {user.created_date
                        ? dayjs(user.created_date).format("DD/MM/YYYY")
                        : "N/A"}
                    </Text>
                  </div>
                </div>
              </div>
            </Card>
          </Col>

          {/* Profile Information */}
          <Col
            xs={24}
            lg={16}
          >
            <Card
              title={
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    width: "100%",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <UserOutlined style={{ color: "#1890ff" }} />
                    <span>Thông tin cá nhân</span>
                  </div>
                </div>
              }
              style={{
                borderRadius: "16px",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
              }}
            >
              <Form
                form={form}
                layout="vertical"
                disabled={!isEditing}
                style={{ marginTop: "16px" }}
              >
                <Row gutter={[16, 16]}>
                  <Col
                    xs={24}
                    sm={12}
                  >
                    <Form.Item
                      label="Họ và tên"
                      name="full_name"
                      rules={[
                        { required: true, message: "Vui lòng nhập họ và tên!" },
                      ]}
                    >
                      <Input
                        prefix={<UserOutlined />}
                        placeholder="Nhập họ và tên"
                        size="large"
                      />
                    </Form.Item>
                  </Col>

                  <Col
                    xs={24}
                    sm={12}
                  >
                    <Form.Item
                      label="Số điện thoại"
                      name="phone_number"
                      rules={[
                        {
                          required: true,
                          message: "Vui lòng nhập số điện thoại!",
                        },
                        {
                          pattern: /^[0-9]{10,11}$/,
                          message: "Số điện thoại không hợp lệ!",
                        },
                      ]}
                    >
                      <Input
                        prefix={<PhoneOutlined />}
                        placeholder="Nhập số điện thoại"
                        size="large"
                      />
                    </Form.Item>
                  </Col>

                  <Col
                    xs={24}
                    sm={12}
                  >
                    <Form.Item
                      label="Email"
                      name="email"
                      rules={[
                        { type: "email", message: "Email không hợp lệ!" },
                      ]}
                    >
                      <Input
                        prefix={<MailOutlined />}
                        placeholder="Nhập email"
                        size="large"
                      />
                    </Form.Item>
                  </Col>

                  <Col
                    xs={24}
                    sm={12}
                  >
                    <Form.Item
                      label="Ngày sinh"
                      name="date_of_birth"
                    >
                      <DatePicker
                        style={{ width: "100%" }}
                        placeholder="Chọn ngày sinh"
                        size="large"
                        format="DD/MM/YYYY"
                      />
                    </Form.Item>
                  </Col>

                  <Col
                    xs={24}
                    sm={12}
                  >
                    <Form.Item
                      label="Giới tính"
                      name="gender"
                    >
                      <Select
                        placeholder="Chọn giới tính"
                        size="large"
                      >
                        <Option value="Nam">Nam</Option>
                        <Option value="Nữ">Nữ</Option>
                      </Select>
                    </Form.Item>
                  </Col>

                  <Col xs={24}>
                    <Form.Item
                      label="Địa chỉ"
                      name="address"
                    >
                      <Input.TextArea
                        placeholder="Nhập địa chỉ"
                        rows={3}
                        size="large"
                      />
                    </Form.Item>
                  </Col>
                </Row>

                {isEditing && (
                  <div style={{ textAlign: "right", marginTop: "24px" }}>
                    <Space>
                      <Button
                        onClick={handleCancel}
                        disabled={isSaving}
                        size="large"
                      >
                        <CloseOutlined />
                        Hủy
                      </Button>
                      <Button
                        type="primary"
                        onClick={handleSave}
                        loading={isSaving}
                        size="large"
                      >
                        <SaveOutlined />
                        Cập nhật thông tin
                      </Button>
                    </Space>
                  </div>
                )}
              </Form>
            </Card>
          </Col>
        </Row>

        {/* Quick Actions */}
        <Row
          gutter={[24, 24]}
          style={{ marginTop: "24px" }}
        >
          <Col
            xs={24}
            sm={12}
            md={6}
          >
            <Card
              hoverable
              style={{
                textAlign: "center",
                borderRadius: "12px",
                height: "200px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}
              onClick={() => router.push("/member/vehicle")}
            >
              <CarOutlined
                style={{
                  fontSize: "32px",
                  color: "#1890ff",
                  marginBottom: "12px",
                }}
              />
              <Title
                level={4}
                style={{ margin: "0 0 8px 0" }}
              >
                Quản lý xe
              </Title>
              <div
                style={{
                  minHeight: "42px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text type="secondary">
                  Xem và quản lý thông tin xe của bạn
                </Text>
              </div>
            </Card>
          </Col>

          <Col
            xs={24}
            sm={12}
            md={6}
          >
            <Card
              hoverable
              style={{
                textAlign: "center",
                borderRadius: "12px",
                height: "200px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}
              onClick={() => router.push("/member/booking")}
            >
              <CalendarOutlined
                style={{
                  fontSize: "32px",
                  color: "#52c41a",
                  marginBottom: "12px",
                }}
              />
              <Title
                level={4}
                style={{ margin: "0 0 8px 0" }}
              >
                Đặt lịch
              </Title>
              <div
                style={{
                  minHeight: "42px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text type="secondary">Đặt lịch chăm sóc xe mới</Text>
              </div>
            </Card>
          </Col>

          <Col
            xs={24}
            sm={12}
            md={6}
          >
            <Card
              hoverable
              style={{
                textAlign: "center",
                borderRadius: "12px",
                height: "200px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}
              onClick={() => router.push("/member/booking-list")}
            >
              <HistoryOutlined
                style={{
                  fontSize: "32px",
                  color: "#faad14",
                  marginBottom: "12px",
                }}
              />
              <Title
                level={4}
                style={{ margin: "0 0 8px 0" }}
              >
                Lịch sử đặt
              </Title>
              <div
                style={{
                  minHeight: "42px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text type="secondary">Xem lịch sử đặt lịch của bạn</Text>
              </div>
            </Card>
          </Col>

          <Col
            xs={24}
            sm={12}
            md={6}
          >
            <Card
              hoverable
              style={{
                textAlign: "center",
                borderRadius: "12px",
                height: "200px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}
              onClick={() => router.push("/member/orders")}
            >
              <ShoppingOutlined
                style={{
                  fontSize: "32px",
                  color: "#722ed1",
                  marginBottom: "12px",
                }}
              />
              <Title
                level={4}
                style={{ margin: "0 0 8px 0" }}
              >
                Lịch sử mua hàng
              </Title>
              <div
                style={{
                  minHeight: "42px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text type="secondary">Xem đơn hàng và sản phẩm đã mua</Text>
              </div>
            </Card>
          </Col>
        </Row>
      </div>

      {/* Change Password Modal */}
      <Modal
        title="Đổi mật khẩu"
        open={isChangePasswordModalOpen}
        onCancel={() => {
          setIsChangePasswordModalOpen(false);
          passwordForm.resetFields();
        }}
        footer={null}
        width={500}
      >
        <Form
          form={passwordForm}
          onFinish={handleChangePassword}
          layout="vertical"
        >
          <Form.Item
            label="Mật khẩu hiện tại"
            name="currentPassword"
            rules={[
              { required: true, message: "Vui lòng nhập mật khẩu hiện tại!" },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Nhập mật khẩu hiện tại"
              size="large"
            />
          </Form.Item>

          <Form.Item
            label="Mật khẩu mới"
            name="newPassword"
            rules={[
              { required: true, message: "Vui lòng nhập mật khẩu mới!" },
              { min: 6, message: "Mật khẩu phải có ít nhất 6 ký tự!" },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Nhập mật khẩu mới"
              size="large"
            />
          </Form.Item>

          <Form.Item
            label="Xác nhận mật khẩu mới"
            name="confirmPassword"
            dependencies={["newPassword"]}
            rules={[
              { required: true, message: "Vui lòng xác nhận mật khẩu!" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("newPassword") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(
                    new Error("Mật khẩu xác nhận không khớp!")
                  );
                },
              }),
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Nhập lại mật khẩu mới"
              size="large"
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: "right" }}>
            <Space>
              <Button
                onClick={() => {
                  setIsChangePasswordModalOpen(false);
                  passwordForm.resetFields();
                }}
                disabled={isChangingPassword}
                size="large"
              >
                Hủy
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={isChangingPassword}
                size="large"
              >
                Đổi mật khẩu
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </App>
  );
};

export default ProfileMemberPage;
