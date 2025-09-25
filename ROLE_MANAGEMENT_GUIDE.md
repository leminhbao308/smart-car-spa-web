# Hướng dẫn Quản lý Vai trò (Role Management)

## Tổng quan

Hệ thống quản lý vai trò đã được hoàn thiện với các chức năng:
- ✅ Call API `/roles/get-all` để lấy danh sách vai trò
- ✅ Hiển thị dữ liệu trong bảng với các cột thông tin chi tiết
- ✅ Modal xem chi tiết vai trò
- ✅ Modal chỉnh sửa vai trò
- ✅ Modal thêm vai trò mới
- ✅ Modal xem danh sách người dùng theo vai trò

## Cấu trúc Files

### 1. Types (src/lib/api/types/auth.types.ts)
```typescript
// Role interface phù hợp với API response
export interface Role {
  role_id: string;
  role_name: string;
  role_code: string;
  description: string;
  permissions?: Permission[];
}

// API Response types
export interface GetAllRolesResponse {
  success: boolean;
  message: string;
  timestamp: string;
  data: Role[];
}
```

### 2. Service (src/lib/api/services/role.service.ts)
```typescript
export class RoleService {
  static async getAllRoles(): Promise<GetAllRolesResponse>
  static async getRoleById(roleId: string): Promise<Role>
  static async createRole(roleData: CreateRoleRequest): Promise<RoleResponse>
  static async updateRole(roleId: string, roleData: UpdateRoleRequest): Promise<RoleResponse>
  static async deleteRole(roleId: string): Promise<void>
  static async getUsersByRole(roleId: string): Promise<any>
}
```

### 3. Components

#### RoleModal (src/components/ui/Modal/RoleModal/RoleModal.tsx)
- **Chức năng**: Thêm mới và chỉnh sửa vai trò
- **Props**:
  - `visible`: boolean - Hiển thị modal
  - `onCancel`: () => void - Đóng modal
  - `onSuccess`: (data: Role) => void - Callback khi thành công
  - `editData`: Role | null - Dữ liệu để chỉnh sửa
  - `viewMode`: boolean - Chế độ xem (chỉ đọc)
  - `title`: string - Tiêu đề modal

#### RoleDetailModal (src/components/ui/Modal/RoleModal/RoleDetailModal.tsx)
- **Chức năng**: Xem chi tiết vai trò với giao diện đẹp
- **Hiển thị**: Thông tin cơ bản, quyền hạn, thông tin bổ sung

#### RoleUsersModal (src/components/ui/Modal/RoleModal/RoleUsersModal.tsx)
- **Chức năng**: Xem danh sách người dùng có vai trò cụ thể
- **Hiển thị**: Bảng người dùng với thông tin liên hệ, trạng thái

### 4. Page (src/app/(admin)/dashboard/(account-permission)/permissions/page.tsx)
- **Chức năng chính**: Quản lý vai trò và quyền hạn
- **Tabs**: 
  - Tab 1: Quản lý vai trò
  - Tab 2: Quản lý quyền hạn

## Cách sử dụng

### 1. Xem danh sách vai trò
```typescript
// API call tự động khi component mount
useEffect(() => {
  fetchRoles();
}, []);

const fetchRoles = async () => {
  const response = await RoleService.getAllRoles();
  setRolesData(response.data);
};
```

### 2. Thêm vai trò mới
```typescript
const handleAddRole = () => {
  setEditData(null);
  setRoleModalVisible(true);
};
```

### 3. Chỉnh sửa vai trò
```typescript
const handleEditRole = (record: Role) => {
  setEditData(record);
  setRoleModalVisible(true);
};
```

### 4. Xem chi tiết vai trò
```typescript
const handleViewRole = (record: Role) => {
  setDetailData(record);
  setDetailModalVisible(true);
};
```

### 5. Xem người dùng theo vai trò
```typescript
const handleViewUsers = (record: Role) => {
  setDetailData(record);
  setUsersModalVisible(true);
};
```

## API Endpoints

### GET /roles/get-all
**Response:**
```json
{
  "success": true,
  "message": "Roles fetched successfully",
  "timestamp": "2025-09-25T19:32:30.9181484",
  "data": [
    {
      "role_id": "6250fd0d-dbce-4d59-881c-005a43f6a039",
      "role_name": "Customer Service",
      "role_code": "CS",
      "description": "Customer support access"
    }
  ]
}
```

### POST /roles/create
**Request:**
```json
{
  "role_name": "New Role",
  "role_code": "NEW_ROLE",
  "description": "Description of new role"
}
```

### PUT /roles/{roleId}
**Request:**
```json
{
  "role_name": "Updated Role Name",
  "description": "Updated description"
}
```

### GET /roles/{roleId}/users
**Response:**
```json
{
  "success": true,
  "data": [
    {
      "user_id": "user-id",
      "full_name": "User Name",
      "email": "user@example.com",
      "phone_number": "0123456789",
      "is_active": true,
      "user_type": "EMPLOYEE"
    }
  ]
}
```

## Tính năng nổi bật

### 1. Error Handling
- Xử lý lỗi API với thông báo cụ thể
- Fallback về mock data khi API lỗi
- Loading states cho tất cả operations

### 2. Validation
- Validation form với rules chi tiết
- Kiểm tra format mã vai trò (chỉ chữ hoa và gạch dưới)
- Giới hạn độ dài các trường

### 3. UI/UX
- Giao diện đẹp với gradient và icons
- Responsive design
- Loading states và error messages
- Confirmation dialogs

### 4. Data Management
- Real-time updates sau khi thao tác
- Optimistic updates
- Data consistency checks

## Troubleshooting

### 1. API không hoạt động
- Kiểm tra `NEXT_PUBLIC_API_URL` trong environment variables
- Kiểm tra network connection
- Xem console logs để debug

### 2. Modal không hiển thị
- Kiểm tra state `visible` có đúng không
- Kiểm tra props được truyền đúng không

### 3. Data không cập nhật
- Kiểm tra `fetchRoles()` có được gọi sau khi thao tác
- Kiểm tra API response format

## Mở rộng

### Thêm tính năng mới:
1. **Xóa vai trò**: Thêm button xóa và confirmation dialog
2. **Phân quyền**: Modal để assign permissions cho role
3. **Export/Import**: Xuất danh sách vai trò ra Excel/CSV
4. **Audit Log**: Theo dõi thay đổi vai trò

### Cải thiện UI:
1. **Drag & Drop**: Sắp xếp lại thứ tự vai trò
2. **Bulk Actions**: Chọn nhiều vai trò để thao tác
3. **Advanced Search**: Tìm kiếm nâng cao với filters
4. **Dark Mode**: Hỗ trợ chế độ tối

## Kết luận

Hệ thống quản lý vai trò đã được hoàn thiện với đầy đủ các chức năng CRUD, giao diện đẹp và xử lý lỗi tốt. Code được tổ chức rõ ràng, dễ maintain và mở rộng.
