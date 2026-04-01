# 🍔 ShopeeFood Clone - Food Delivery Ecosystem


## 📖 Giới thiệu (Introduction)
Đây là dự án cá nhân mô phỏng lại hệ sinh thái đặt đồ ăn (ShopeeFood/GrabFood). Dự án được thiết kế với kiến trúc Microservices cơ bản, bao gồm ứng dụng Mobile cho Khách hàng đặt món và nền tảng Web CMS cho Chủ quán quản lý đơn hàng.

Mục tiêu của dự án là giải quyết các bài toán logic thực tế trong ngành Food Delivery như: Quản lý giỏ hàng động (Dynamic Cart), Xử lý đồng thời tùy chọn món ăn (Option Groups), và Đảm bảo tính toàn vẹn dữ liệu khi thanh toán (Transactions).

## 🚀 Công nghệ sử dụng (Tech Stack)
- **Customer Mobile App:** React Native (Expo Router), Context API.
- **Merchant Web CMS:** ReactJS, Ant Design, Tailwind CSS.
- **Backend API:** Node.js, Express.js.
- **Database:** MySQL, Sequelize ORM.
- **Authentication:** JWT (JSON Web Token), Phân quyền Role-based Access Control (RBAC).

## 🔥 Tính năng nổi bật (Key Features)

### 1. Ứng dụng Khách hàng (Customer App)
- **Lazy Login Flow:** UX tối ưu, cho phép khách hàng xem menu và thêm vào giỏ hàng thoải mái. Chỉ yêu cầu đăng nhập khi tiến hành Thanh toán (Checkout).
- **Thuật toán Giỏ hàng thông minh (Cart Key Logic):** Xử lý hoàn hảo bài toán 1 món ăn nhưng chọn nhiều Topping/Size khác nhau. Tự động sinh `cartKey` từ cấu trúc JSON của Option để gom nhóm món ăn chuẩn xác.
- **Dynamic Options Form:** Giao diện Bottom Sheet tự động thay đổi giữa Radio Button (is_mandatory) và Checkbox (multi-select) dựa trên cấu hình lấy từ Database.

### 2. Quản trị Chủ quán (Merchant Web CMS)
- Quản lý Thực đơn & Nhóm tùy chọn (Menu & Option Groups Management).
- Xử lý mảng dữ liệu lồng nhau phức tạp (Nested JSON) khi Chủ quán tạo món ăn đi kèm nhiều nhóm Topping.
- Xem danh sách và xử lý đơn hàng theo thời gian thực (Đang phát triển).

### 3. Backend & System Architecture
- **Mô hình 3 lớp (3-Tier Architecture):** Tách biệt Router, Controller và Service giúp code dễ bảo trì và mở rộng.
- **Database Transactions:** Áp dụng `sequelize.transaction()` trong API Tạo đơn hàng (`createOrder`). Đảm bảo lưu dữ liệu đồng thời vào bảng `Orders` và `OrderDetails`, tự động Rollback nếu có bất kỳ lỗi nào xảy ra.
- **Snapshot Data Concept:** Lưu trực tiếp Tên món, Tên Topping và Giá tiền tại thời điểm đặt hàng vào bảng `OrderDetails` (Immutable Data), giúp hóa đơn không bị ảnh hưởng kể cả khi Chủ quán xóa hoặc đổi giá món ăn sau này.

## 🛠 Hướng dẫn cài đặt (Installation)

### 1. Backend
\`\`\`bash
cd shoppefood-backend
npm install
# Tạo file .env và cấu hình Database (DB_HOST, DB_USER, DB_PASS, JWT_SECRET)
npm run dev
\`\`\`

### 2. Customer App
\`\`\`bash
cd customer-app
npm install
npx expo start
\`\`\`

### 2. Customer App
\`\`\`bash
cd shoppefood-cms
npm install
npm run dev
\`\`\`

## 📝 Kế hoạch phát triển (To-do List)
- [x] Hoàn thiện luồng Đặt hàng (Checkout Flow).
- [ ] Tích hợp thanh toán qua ví điện tử (ZaloPay/MoMo).
- [ ] Áp dụng Socket.io để realtime trạng thái đơn hàng từ Chủ quán đến Khách hàng.
- [ ] Xây dựng App Tài Xế
- [ ] Deploy Backend lên Render và Database lên MySQL Clever-Cloud.

---
*Dự án được phát triển bởi [Trương Anh Tùng] - Sinh viên năm 4, PTIT. Luôn sẵn sàng học hỏi và đón nhận các thử thách thực tế!*