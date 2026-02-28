# MASTER REPORT: VSL - TỔNG KHO KỸ THUẬT VÀ KIẾN TRÚC HỆ THỐNG
**Tác giả:** Từ Hữu Minh Vũ & Phạm Thị Minh Ngọc
**Sản phẩm:** Nền tảng học Ngôn ngữ Ký hiệu Việt Nam (VSL) tích hợp AI

---

## I. TỔNG QUAN HỆ THỐNG (SYSTEM OVERVIEW)
Dự án VSL không đơn thuần là một website giáo dục, mà là một **Hệ sinh thái thông minh** hội tụ 3 yếu tố cốt lõi: **Học tập (LMS)**, **Trợ lý ảo (GenAI)** và **Đánh giá thực hành (Computer Vision)**. Hệ thống được triển khai trên kiến trúc phân tách mạnh mẽ (Decoupled Architecture) giữa Frontend, Backend và AI Inference Service.

---

## II. ĐẶC TẢ KỸ THUẬT TẦNG AI (DEEP DIVE AI & CV)

### 2.1 Thu thập dữ liệu (Data Acquisition)
- **Công nghệ chính:** MediaPipe Hands (V0.10.0) chạy trực tiếp trên Browser.
- **Dữ liệu đầu vào:** 21 điểm Landmarks 3D (x, y, z).
- **Cấu hình xử lý:** `maxNumHands: 2`, `minDetectionConfidence: 0.6`.
- **Sliding Window:** Hệ thống thu thập chuỗi **100 frames** (tương đương ~3 giây hành động) trước khi thực hiện dự đoán.

### 2.2 Toán học chuẩn hóa (Mathematical Normalization)
Để mô hình không bị ảnh hưởng bởi vị trí người đứng xa hay gần camera, chúng tôi áp dụng thuật toán chuẩn hóa:
1.  **Centered Translation:** Tính trọng tâm (Centroid) của 21 điểm: 
    $$C = \frac{1}{21}\sum_{i=1}^{21} P_i$$
    Sau đó dịch chuyển mọi điểm về tâm: $P'_i = P_i - C$.
2.  **Scaling:** Tìm khoảng cách lớn nhất từ tâm đến một điểm bất kỳ ($d_{max}$) và chia tất cả tọa độ cho $d_{max}$ để đưa về khoảng $[-1, 1]$.

### 2.3 Mô hình LSTM (Long Short-Term Memory)
- **Input:** Tensor shape `(1, 100, 42)`.
- **Lý do lựa chọn:** LSTM có khả năng ghi nhớ thông tin "trước - sau", phù hợp hoàn hảo để nhận diện cử chỉ động (Gesture) vốn là một chuỗi biến thiên của các frames thay vì chỉ là ảnh tĩnh.
- **Accuracy:** ~92% trên bộ dữ liệu kiểm thử nội bộ.

---

## III. KIẾN TRÚC BACKEND & BẢO MẬT (BACKEND ARCHITECTURE)

### 3.1 Stack Công nghệ
- **Runtime:** Node.js v20+ với kiến trúc hướng Module (ESM).
- **Database:** MySQL 8.0 với Connection Pool đạt giới hạn 10 connections đồng thời để tối ưu tài nguyên.
- **ORM-like Pattern:** Sử dụng `mysql2/promise` kết hợp với các `Model Class` tự định nghĩa để kiểm soát hoàn toàn truy vấn SQL Performance.

### 3.2 Cơ chế Bảo mật JWT (JSON Web Token)
Hệ thống sử dụng cơ chế xác thực 2 lớp:
1.  **Authentication:** `authMiddleware` kiểm tra Access Token trong Header `Authorization: Bearer <token>`.
2.  **Authorization:** `roleMiddleware` (`checkRole('admin')`) bảo vệ các trang quản trị, ngăn chặn việc người dùng thường truy cập vào kho quản lý Quiz hay bài học.

### 3.3 Relational Database Model
Thiết kế CSDL được chuẩn hóa để tránh dư thừa (Normal Form):
- **Bảng Progress:** Đóng vai trò cầu nối dữ liệu (Junction Table) giữa `Users` và `Lessons`.
- **Trạng thái Hoàn thành (`is_completed`):** Được kích hoạt thông qua logic nghiệp vụ tại Controller khi `quiz_score >= 50%`, đảm bảo tính chính xác tuyệt đối cho báo cáo tiến độ.

---

## IV. TRẢI NGHIỆM NGƯỜI DÙNG & FRONTEND (UX & FE)

### 4.1 Quản lý trạng thái (State Management)
- **AuthContext:** Sử dụng React Context API để quản lý Session toàn cục. Tích hợp `localStorage` để duy trì đăng nhập sau khi Refresh trang.
- **Navigation Guard:** `ProtectedRoute` ngăn chặn việc truy cập trái phép vào Dashboard khi chưa có Token hợp lệ.

### 4.2 Tối ưu hóa Computer Vision
- **Local Hosting MediaPipe:** Chúng tôi không sử dụng CDN mà host toàn bộ file `.js`, `.wasm` của MediaPipe tại thư mục `/public/mediapipe/`. 
- **Mục tiêu:** Tránh lỗi `ERR_BLOCKED_BY_CLIENT` do các trình duyệt hiện đại (như Edge hay Chrome) chặn các script tracking từ bên thứ ba (YouTube/Google Tracker).

### 4.3 Gamification & Celebration
- **Component:** `LessonCompleteModal` sử dụng thư viện `react-confetti` tạo hiệu ứng ăn mừng sinh động.
- **Smart Navigation:** Modal tự động tính toán `nextLessonId` để điều hướng người dùng đi đúng lộ trình học tập mà không cần quay lại trang danh sách.

---

## V. CHIẾN LƯỢC TRIỂN KHAI & QUẢN TRỊ (DEVOPS & PM)

### 5.1 Phân cấp Dịch vụ (Service Orchestration)
Dự án chạy đồng thời 3 cổng dịch vụ:
- Port 5173: Frontend (Vite)
- Port 5000: Backend API (Express)
- Port 8000: AI Service (FastAPI)

### 5.2 Đạo đức AI và Bảo mật dữ liệu
Hệ thống tuân thủ nghiêm ngặt quyền riêng tư:
- Không lưu trữ bản ghi hình ảnh từ Webcam.
- Chỉ dữ liệu tọa độ Landmarks (vô danh) được gửi lên AI Service.
- Toàn bộ quá trình Inference diễn ra trong mạng nội bộ của hệ thống.

---

## VI. KẾT LUẬN VÀ ĐÁNH GIÁ (CONCLUSION)
Hệ thống VSL đã đạt được những chỉ số ấn tượng cho một sản phẩm đồ án:
1.  **Tính đồng nhất:** Dữ liệu tiến độ học tập được đồng bộ hóa 100% giữa FE và BE.
2.  **Tính đột phá:** Tích hợp thành công mô hình LSTM realtime ngay trên giao diện web.
3.  **Tính mở rộng:** Kiến trúc cho phép dễ dàng thêm vào hàng ngàn bài học mới chỉ bằng cách cập nhật Database.

---
*Báo cáo được trích xuất từ phân tích mã nguồn thực tế - Phiên bản Master Tech Document v1.0*
