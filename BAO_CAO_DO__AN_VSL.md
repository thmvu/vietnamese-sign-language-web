# BÁO CÁO ĐỒ ÁN: VSL - NỀN TẢNG HỌC NGÔN NGỮ KÝ HIỆU VIỆT NAM

**Thành viên thực hiện:** Từ Hữu Minh Vũ, Phạm Thị Minh Ngọc
**Trạng thái hệ thống:** Hoàn thiện ~90%

---

## 1. Giới thiệu
Dự án VSL (Vietnamese Sign Language) là một nền tảng học tập trực tuyến kết hợp trí tuệ nhân tạo, nhằm cung cấp môi trường học ngôn ngữ ký hiệu Việt Nam (Thủ ngữ) một cách tương tác và hiệu quả nhất. Hệ thống không chỉ cung cấp kiến thức tĩnh qua video mà còn có khả năng phản hồi thời gian thực qua camera nhờ công nghệ học sâu.

## 2. Đặt vấn đề
### 2.1 Định nghĩa vấn đề
Người khiếm thính tại Việt Nam thường gặp rào cản lớn trong việc hòa nhập cộng đồng do sự thiếu hụt các công cụ học thủ ngữ phổ biến cho người bình thường. Các tài liệu hiện nay chủ yếu là video/hình ảnh rời rạc, thiếu sự kiểm tra và phản hồi xem người học đã ký hiệu đúng hay chưa. Điều này dẫn đến tâm lý e ngại và khó khăn trong việc tự học.

## 3. Các giải pháp đã có
- **Ứng dụng từ điển Thủ ngữ:** Cung cấp video mẫu nhưng người dùng chỉ xem và bắt chước theo, không được chấm điểm hay đánh giá.
- **Hệ thống Google Hand Tracking:** Cung cấp công nghệ nhận diện tay mạnh mẽ nhưng chưa có bộ dữ liệu chuyên sâu và logic học tập cho Thủ ngữ Việt Nam cụ thể.
### *Hạn chế:*
- Thiếu tính tương tác thời gian thực.
- Không có lộ trình học tập bài bản được cá nhân hóa qua hệ thống quản lý tiến độ.
- Khó khăn trong việc tiếp cận các khái niệm mới hoặc giải đáp thắc mắc tức thì.

## 4. Giải pháp đề xuất
Xây dựng một nền tảng Web toàn diện tích hợp:
- **Computer Vision:** Sử dụng MediaPipe Hands để trích xuất 21 điểm (Landmarks) bàn tay ngay trên trình duyệt.
- **AI Model (LSTM):** Sử dụng mạng Long Short-Term Memory để nhận diện các cử chỉ động từ chuỗi thời gian (frames), cho phép đánh giá độ chính xác của cử chỉ người dùng.
- **LLM (Gemini AI):** Tích hợp trợ lý ảo thông minh để giải đáp các thắc mắc về văn hóa và kiến thức ngôn ngữ ký hiệu.
- **Hệ thống quản lý học tập (LMS):** Theo dõi tiến độ chi tiết từng bài học, video và bài kiểm tra.

## 5. Thiết kế và triển khai
### 5.1 Các yêu cầu chức năng
- **Quản lý người dùng:** Đăng ký, đăng nhập bảo mật và quản lý thông tin tài khoản.
- **Học tập đa phương tiện:** Truy cập danh sách khóa học, xem video hướng dẫn chuẩn.
- **Kiểm tra tự động (Quiz):** Hệ thống câu hỏi trắc nghiệm đánh giá kiến thức sau mỗi bài học.
- **Luyện tập AI (Practice):** Sử dụng webcam để thực hiện ký hiệu và nhận kết quả đánh giá đạt/không đạt ngay lập tức.
- **Trợ lý ảo (Chatbot):** Cửa sổ chat hỗ trợ giải đáp nhanh.

### 5.2 Các yêu cầu phi chức năng
- **Hiệu năng:** Tốc độ phản hồi của AI Service phải đạt mức gần thời gian thực (real-time).
- **Tính bảo mật:** Sử dụng cơ chế JWT để xác thực và Bcrypt để mã hóa thông tin nhạy cảm.
- **Giao diện (UI/UX):** Thiết kế hiện đại, responsive, sử dụng Tailwind CSS để tối ưu trải nghiệm người dùng.

### 5.3 Các ràng buộc (Constraints)
- **Triển khai:** Hệ thống cần chạy ổn định trên các trình duyệt hiện đại có hỗ trợ truy cập Webcam.
- **Kinh tế:** Tận dụng các thư viện mã nguồn mở và gói API miễn phí để giảm thiểu chi phí vận hành.
- **Đạo đức:** Tuyệt đối không lưu trữ dữ liệu hình ảnh người dùng lên máy chủ để đảm bảo quyền riêng tư (chỉ xử lý tọa độ landmarks).

## 6. Mô hình hệ thống / Thiết kế giải pháp
### 6.1 Các kịch bản của hệ thống (Use-cases)
- **User:** Đăng nhập -> Chọn bài học -> Xem video -> Vượt qua bài Quiz (đạt > 50% câu đúng) -> Luyện tập với Camera -> Hệ thống lưu trạng thái hoàn thành.

### 6.2 Mô hình lớp và đối tượng (Database Design)
- **Users:** Lưu thông tin định danh và vai trò.
- **Lessons & Courses:** Cấu trúc bài học theo phân cấp.
- **Progress:** Lưu trữ điểm Quiz, danh sách video đã xem và trạng thái `is_completed`.
- **ChatMessages:** Lưu trữ lịch sử trò chuyện với trợ lý ảo.

### 6.3 Các biểu đồ tuần tự (Sequence Diagram)
- **Luồng Luyện tập:** Người dùng -> Bật Camera -> Frontend (MediaPipe) -> Trích xuất Landmarks -> Gửi tọa độ qua FastAPI -> Model LSTM dự đoán nhãn -> Trả về kết quả cho Frontend.

### 6.4 Các màn hình giao diện người dùng
- **Trang chủ:** Giới thiệu và định hướng.
- **Dashboard:** Hiển thị tiến độ hoàn thành các khóa học.
- **Quiz Page:** Giao diện trả lời câu hỏi và hiển thị popup chúc mừng khi đạt.
- **Practice Page:** Tích hợp camera và overlay kết quả nhận diện AI.

## 7. Một số thành phần khác
### 7.1 Kế hoạch dự án (Phân công nhiệm vụ)
- **Từ Hữu Minh Vũ:** Phát triển Backend (Node.js/Express), Xây dựng hệ thống AI (FastAPI, LSTM Model), Thiết kế Database và logic nghiệp vụ.
- **Phạm Thị Minh Ngọc:** Thiết kế UI/UX, Phát triển Frontend (React), Biên tập nội dung video bài học và hệ thống câu hỏi Quiz.

### 7.2 Đạo đức và làm việc chuyên nghiệp
Nhóm luôn tuân thủ quy trình quản lý mã nguồn qua Git, thực hiện fix bug và cập nhật tính năng dựa trên phản hồi thực tế của người dùng. Dữ liệu landmarks bàn tay được xử lý hướng tới tính bảo mật tối đa.

### 7.3 Tác động xã hội
Dự án không chỉ là một ứng dụng web, mà là một bước tiến trong việc ứng dụng AI vào giáo dục đặc biệt, giúp thu hẹp khoảng cách giữa cộng đồng người nghe và người khiếm thính tại Việt Nam.

## 8. Kết luận
Nhóm đã thực hiện thành công việc xây dựng hệ thống nền tảng móng vững chắc bao gồm Backend, Frontend và AI Service. Các chức năng chính như học qua video, thi Quiz và nhận diện AI đã hoạt động đồng bộ. Trong tương lai, nhóm sẽ mở rộng thêm bộ dữ liệu ký hiệu để hệ thống phong phú hơn.

## 9. Tài liệu tham khảo
[1] MediaPipe Hands Open Source Library.
[2] "Long Short-Term Memory", Hochreiter & Schmidhuber.
[3] React & Node.js Official Documentation.
[4] Google Gemini API Reference.
