

## Smart Car Spa Web - README

### Quy Tắc Commit Code

Để đảm bảo lịch sử commit rõ ràng, dễ theo dõi, và hỗ trợ tự động hóa (như tạo changelog hoặc semantic versioning), dự án **Smart Car Spa Web** sử dụng quy tắc commit dựa trên **Conventional Commits**. Quy tắc này áp dụng cho toàn bộ source code của giao diện người dùng (Next.js, Ant Design, Firebase OTP, REST APIs).

#### 1. Cấu Trúc Commit Message
Mỗi commit message phải tuân theo định dạng sau:

```
<type>(<scope>): <short description>
```

- **type**: Loại thay đổi (xem danh sách bên dưới).
- **scope** (tùy chọn): Phạm vi thay đổi, ví dụ: tên thư mục (`app/auth`, `components/ui`), hoặc tính năng (`otp`, `vehicles`).
- **short description**: Mô tả ngắn gọn, rõ ràng (bắt đầu bằng động từ, viết thường, không quá 50 ký tự nếu có thể).

Ví dụ:
```
feat(auth): add phone OTP form with Firebase
fix(vehicles): resolve API fetch error in vehicle list
docs(readme): update commit guidelines
```

#### 2. Các Loại Commit (Type)
- **feat**: Thêm tính năng mới (ví dụ: thêm form OTP, trang dashboard).
- **fix**: Sửa lỗi (bug fix) trong code (ví dụ: lỗi fetch API, lỗi responsive).
- **docs**: Thay đổi tài liệu (README, comments, JSDoc).
- **style**: Thay đổi định dạng code, UI (không ảnh hưởng logic, ví dụ: chỉnh Ant Design styles).
- **refactor**: Tái cấu trúc code (không thêm tính năng, không sửa lỗi).
- **test**: Thêm hoặc sửa test case (nếu có unit tests).
- **chore**: Các thay đổi khác (cập nhật dependencies, config Turbopack/Webpack).
- **perf**: Cải thiện hiệu suất (ví dụ: tối ưu API call, giảm thời gian load).
- **build**: Thay đổi build system (ví dụ: chuyển từ Turbopack sang Webpack).

#### 3. Phạm Vi Commit (Scope)
- Sử dụng scope để chỉ rõ phần code bị ảnh hưởng, ví dụ:
  - `app/auth`: Thay đổi trong route `/auth` (OTP login).
  - `app/vehicles`: Thay đổi trong route `/vehicles` (hồ sơ xe).
  - `components/ui`: Thay đổi Ant Design components (CustomButton, PhoneAuthForm).
  - `lib/api`: Thay đổi API client hoặc endpoints.
  - `lib/firebase`: Thay đổi Firebase config hoặc logic OTP.
  - `styles`: Thay đổi Ant Design theme hoặc CSS.
- Nếu thay đổi toàn cục, có thể bỏ scope.

#### 4. Ví Dụ Commit Message
- **Tính năng mới**:
  ```
  feat(components/ui): implement PhoneAuthForm with Ant Design
  feat(app/vehicles): add vehicle list page with API fetch
  ```
- **Sửa lỗi**:
  ```
  fix(app/auth): handle Firebase OTP error for invalid phone
  fix(components/ui): fix responsive layout for VehicleCard
  ```
- **Tài liệu**:
  ```
  docs(readme): add commit guidelines for project
  docs(api): document endpoints in endpoints.ts
  ```
- **Tái cấu trúc**:
  ```
  refactor(lib/api): simplify apiFetch with error handling
  ```
- **Khác**:
  ```
  chore(deps): upgrade antd to 5.21.5
  style(components/ui): adjust button padding for mobile
  ```

#### 5. Quy Tắc Bổ Sung
- **Ngắn gọn**: Giữ commit message dưới 72 ký tự nếu có thể.
- **Rõ ràng**: Mô tả cụ thể thay đổi (ví dụ: “fix error” → “fix API fetch error in vehicle list”).
- **Tách nhỏ commit**: Mỗi commit chỉ nên thay đổi một phần cụ thể (ví dụ: không kết hợp thêm form OTP và sửa API trong cùng commit).
- **Kiểm tra trước commit**:
  - Chạy `npm run lint` để đảm bảo code sạch (ESLint).
  - Test giao diện trên mobile (320px, 480px) với Chrome DevTools để đảm bảo Mobile First.
  - Kiểm tra API calls (REST APIs từ Spring Boot) và Firebase OTP (gửi/verify OTP).
- **Push thường xuyên**: Commit và push sau mỗi thay đổi hoàn chỉnh (feature, bug fix) để giữ lịch sử rõ ràng trên GitHub.
- **Branching** (khuyến nghị):
  - Sử dụng branch riêng cho mỗi feature/bug fix: `git checkout -b feat/auth-otp` hoặc `git checkout -b fix/vehicle-api`.
  - Merge vào `main` qua Pull Request (PR) trên GitHub, với mô tả chi tiết.

#### 6. Ví Dụ Workflow Commit
1. Thêm form OTP:
   ```
   git checkout -b feat/auth-otp
   git add src/components/ui/PhoneAuthForm.tsx
   git commit -m "feat(components/ui): implement PhoneAuthForm with Firebase OTP"
   git push origin feat/auth-otp
   ```
2. Sửa lỗi API:
   ```
   git checkout -b fix/vehicles-api
   git add src/lib/api/apiClient.ts
   git commit -m "fix(lib/api): handle 404 error in vehicle fetch"
   git push origin fix/vehicles-api
   ```
3. Cập nhật README:
   ```
   git add README.md
   git commit -m "docs(readme): add commit guidelines"
   git push origin main
   ```


