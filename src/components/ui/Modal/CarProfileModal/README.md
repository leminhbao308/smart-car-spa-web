# Create Vehicle Profile Modal - Updated

Modal đã được thiết kế lại với tích hợp API thật và giao diện trực quan hơn.

## 🚀 Tính năng mới

### ✅ Tích hợp API thật
- **Vehicle Brands**: Lấy từ API `/vehicles/brands/dropdown`
- **Vehicle Types**: Lấy từ API `/vehicles/types/dropdown`  
- **Vehicle Models**: Lấy từ API `/vehicles/models/dropdown`
- **Customers**: Lấy từ API `/users/get-all?userType=CUSTOMER`

### ✅ Giao diện cải tiến
- Loading states cho tất cả dropdown
- Error handling với Alert component
- Form validation đầy đủ
- Hướng dẫn sử dụng chi tiết
- Responsive design
- **Modern UI Design**: Thiết kế hiện đại với gradient và card layout
- **Visual Hierarchy**: Phân chia rõ ràng các section với icon và màu sắc
- **Enhanced UX**: Trải nghiệm người dùng được cải thiện với visual cues

### ✅ UX/UI tốt hơn
- **CustomerSelect nâng cao**: Avatar, thông tin chi tiết, search mạnh mẽ
- **Search không call API**: Tìm kiếm local trong dữ liệu đã load
- **Enhanced Search**: Tìm kiếm theo tên, email, số điện thoại
- **Sorted Data**: Dữ liệu được sắp xếp theo tên alphabetically
- **Visual Feedback**: Empty state với hướng dẫn search
- **Performance**: Memoized data để tối ưu hiệu suất
- **Create Customer Integration**: Tích hợp với CustomerModal hiện có
- **Seamless Workflow**: Tạo khách hàng mới ngay trong quá trình thêm hồ sơ xe
- Disable form khi đang load data
- Visual feedback cho user

## 📋 Form Fields

| Field | Type | Source | Validation |
|-------|------|--------|------------|
| Biển số xe | Input | Manual | Required, Pattern |
| Số km đã đi | InputNumber | Manual | Required, Min: 0 |
| Hãng xe | Dropdown | API | Required |
| Loại xe | Dropdown | API | Required |
| Dòng xe | Dropdown | API | Required |
| Chủ xe | Dropdown | API | Required |
| Mô tả | TextArea | Manual | Optional, Max: 500 |

## 🔧 API Integration

### Vehicle Brands API
```typescript
GET /vehicles/brands/dropdown
Response: { success: true, data: [{ brand_id, brand_name, brand_logo }] }
```

### Vehicle Types API  
```typescript
GET /vehicles/types/dropdown
Response: { success: true, data: [{ type_id, type_name, type_icon }] }
```

### Vehicle Models API
```typescript
GET /vehicles/models/dropdown  
Response: { success: true, data: [{ model_id, model_name }] }
```

### Customers API
```typescript
GET /users/get-all?userType=CUSTOMER&size=1000
Response: { success: true, data: { content: [{ user_id, full_name, email, phone_number, avatar_url }] } }
```

## 💡 Usage Example

```typescript
import { CreateVehicleProfileModal } from "@/components/ui/Modal";
import { CreateVehicleProfileRequest } from "@/lib/api/types/vehicle-profile.types";

const MyComponent = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const { createProfile } = useVehicleProfiles();

  const handleCreateSuccess = async (data: CreateVehicleProfileRequest) => {
    try {
      await createProfile(data);
      message.success("Thêm hồ sơ xe thành công");
      setModalVisible(false);
    } catch (error) {
      message.error("Có lỗi xảy ra khi thêm hồ sơ xe");
    }
  };

  return (
    <CreateVehicleProfileModal
      visible={modalVisible}
      onCancel={() => setModalVisible(false)}
      onSuccess={handleCreateSuccess}
    />
  );
};
```

## 🎨 UI Components

### CustomerSelect
- Hiển thị avatar, tên, email, số điện thoại
- Search theo tên, email, số điện thoại
- Loading state và error handling

### VehicleModelSelect  
- Dropdown với search functionality
- Loading state và error handling
- Not found content

### VehicleBrandSelect & VehicleTypeSelect
- Đã có sẵn, được tích hợp vào modal
- Loading states được truyền từ modal

## 🔄 Loading States

1. **Initial Load**: Hiển thị spinner khi tải dữ liệu lần đầu
2. **Form Disabled**: Form bị disable khi đang load data
3. **Button Disabled**: Button submit bị disable khi có lỗi hoặc đang load
4. **Error Alert**: Hiển thị alert khi có lỗi API

## 🔍 Search Functionality

### CustomerSelect Search Features
- **Local Search**: Tìm kiếm trong dữ liệu đã load, không call API
- **Multi-field Search**: Tìm kiếm theo:
  - Tên khách hàng (full_name)
  - Email
  - Số điện thoại
- **Real-time Filtering**: Kết quả được lọc ngay lập tức khi gõ
- **Sorted Results**: Dữ liệu được sắp xếp theo tên alphabetically
- **Enhanced UI**: 
  - Search icon trong input
  - Empty state với hướng dẫn
  - Avatar và thông tin chi tiết cho mỗi option
  - Max height với scroll cho dropdown
- **Create Customer Option**: 
  - Option "Tạo khách hàng mới" luôn hiển thị ở đầu danh sách
  - Icon gradient xanh lá với PlusOutlined
  - Mô tả rõ ràng về chức năng
- **Performance**: Sử dụng useMemo để tối ưu hiệu suất

## 📱 Responsive Design

- Modal width: 1000px (tăng từ 900px)
- Grid system: xs=24, sm=12 cho responsive
- Form layout: vertical cho mobile-friendly
- Top margin: 20px để modal không dính sát top

## 🎨 Thiết kế mới

### 📱 Layout Structure
Modal được thiết kế lại với layout hiện đại và trực quan, ưu tiên chọn chủ xe trước:

1. **Header với Gradient Icon**: Icon xe với gradient đẹp mắt và mô tả
2. **Thông tin chủ xe** (Card vàng): Chọn khách hàng làm chủ xe với icon UserOutlined
3. **Thông tin cơ bản** (Card xanh dương): Biển số và số km với icon NumberOutlined
4. **Thông tin xe** (Card xanh lá): Hãng, loại, dòng xe với icon CarOutlined
5. **Thông tin bổ sung** (Card tím): Mô tả chi tiết với icon FileTextOutlined
6. **Hướng dẫn sử dụng** (Card vàng): Hướng dẫn với emoji và icon InfoCircleOutlined

### 🎨 Visual Design Features
- **Gradient Backgrounds**: Mỗi section có màu gradient riêng biệt
- **Icon Integration**: Icon phù hợp cho từng section với background gradient
- **Card Layout**: Mỗi section được bao bọc trong card riêng với border radius
- **Color Coding**: Màu sắc phân biệt rõ ràng các loại thông tin
- **Modern Typography**: Sử dụng Typography component với hierarchy rõ ràng
- **Enhanced Spacing**: Khoảng cách hợp lý giữa các elements (gutter={[20, 16]})
- **Form Styling**: Input fields với border radius và size large
- **Button Design**: Gradient button với hover effects
- **Loading States**: Spinner với background và styling đẹp mắt