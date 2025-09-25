# CreateUserModal Component

Modal component để tạo mới khách hàng hoặc nhân viên trong hệ thống.

## Tính năng

- ✅ Form validation đầy đủ
- ✅ Error handling từ API
- ✅ Loading states
- ✅ TypeScript support
- ✅ Responsive design
- ✅ Reusable cho cả Customer và Staff

## Cách sử dụng

### 1. Import component

```tsx
import { CreateUserModal } from "@/components/ui/Modal/CreateUserModal";
import { UserType } from "@/lib/api/types";
```

### 2. Sử dụng trong component

```tsx
function MyComponent() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSuccess = (user: any) => {
    console.log("User created:", user);
    // Refresh danh sách, show notification, etc.
  };

  return (
    <>
      <button onClick={() => setIsModalOpen(true)}>
        Tạo User Mới
      </button>

      <CreateUserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        userType="CUSTOMER" // hoặc "EMPLOYEE"
        onSuccess={handleSuccess}
      />
    </>
  );
}
```

### 3. Với UserManagement Hook

```tsx
import { useUserManagement } from "@/lib/api/hooks/useUserManagement";

function MyComponent() {
  const { createUser, isLoading, error } = useUserManagement();
  
  // Hook đã được tích hợp sẵn trong modal
  // Không cần gọi trực tiếp createUser
}
```

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `isOpen` | `boolean` | ✅ | Trạng thái mở/đóng modal |
| `onClose` | `() => void` | ✅ | Callback khi đóng modal |
| `userType` | `"CUSTOMER" \| "EMPLOYEE"` | ✅ | Loại user cần tạo |
| `onSuccess` | `(user: any) => void` | ❌ | Callback khi tạo thành công |

## Form Fields

### Required Fields
- **Email**: Email hợp lệ, không trùng lặp
- **Password**: Tối thiểu 6 ký tự
- **Full Name**: Họ và tên
- **Phone Number**: Số điện thoại 10-11 số
- **Date of Birth**: Ngày sinh (16-100 tuổi)
- **Gender**: Nam/Nữ/Khác
- **Address**: Địa chỉ

### Optional Fields
- **Avatar URL**: URL ảnh đại diện

## Validation Rules

### Email
- Bắt buộc
- Format email hợp lệ
- Không trùng lặp (server validation)

### Password
- Bắt buộc
- Tối thiểu 6 ký tự

### Phone Number
- Bắt buộc
- 10-11 chữ số
- Tự động loại bỏ khoảng trắng

### Date of Birth
- Bắt buộc
- Tuổi từ 16-100

### Address
- Bắt buộc
- Không được để trống

## Error Handling

Modal tự động xử lý các loại lỗi:

- **400 Bad Request**: Validation errors
- **409 Conflict**: Email đã tồn tại
- **500 Server Error**: Lỗi server
- **Network Error**: Lỗi kết nối

## API Integration

Modal sử dụng `useUserManagement` hook để gọi API:

```typescript
// API Endpoint
POST /api/users/create

// Request Body
{
  "email": "user@example.com",
  "password": "password123",
  "googleId": null,
  "fullName": "Nguyễn Văn A",
  "phoneNumber": "0123456789",
  "dateOfBirth": "1990-01-01T00:00:00.000Z",
  "gender": "MALE",
  "address": "Hà Nội, Việt Nam",
  "avatarUrl": null,
  "roleCode": "CUSTOMER"
}

// Success Response
{
  "success": true,
  "message": "User created successfully",
  "timestamp": "2025-01-01T00:00:00.000Z",
  "data": {
    "user_id": "uuid",
    "email": "user@example.com",
    "full_name": "Nguyễn Văn A",
    // ... other user data
  }
}
```

## Styling

Modal sử dụng Tailwind CSS classes:

- Responsive design
- Dark overlay
- Centered positioning
- Scrollable content
- Form styling
- Error states
- Loading states

## Dependencies

- React 18+
- TypeScript
- Tailwind CSS
- Custom UI components (Button, Input)
- API hooks (useUserManagement)

## Example

Xem file `CreateUserModalExample.tsx` để có ví dụ đầy đủ về cách sử dụng.
