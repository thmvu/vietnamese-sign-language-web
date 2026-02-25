# Cấu hình MediaPipe cho ứng dụng nhận diện ngôn ngữ ký hiệu

## Vấn đề

Ứng dụng gặp lỗi 404 khi cố gắng load các thư viện MediaPipe từ `/mediapipe/hands/hands.js`, `/mediapipe/camera_utils/camera_utils.js` và `/mediapipe/drawing_utils/drawing_utils.js`.

## Nguyên nhân

- Các thư viện MediaPipe không được sao chép tự động vào thư mục `public` trong quá trình phát triển
- Chỉ hoạt động trong môi trường build, không hoạt động trong môi trường dev

## Giải pháp

1. Đảm bảo các thư viện MediaPipe được cài đặt:
   - `@mediapipe/hands`
   - `@mediapipe/camera_utils`
   - `@mediapipe/drawing_utils`

2. Tạo script `copy-mediapipe-assets.cjs` để sao chép các tài nguyên vào thư mục `public/mediapipe`

3. Cập nhật package.json để chạy script này trước khi khởi động dev server

## Cách sử dụng

Khi chạy ứng dụng, script sẽ tự động sao chép các tài nguyên cần thiết:

```bash
npm run dev
```

Nếu cần sao chép tài nguyên thủ công:

```bash
npm run copy-assets
```

## Cấu trúc thư mục

Sau khi chạy script, thư mục `public/mediapipe` sẽ chứa:

```
public/mediapipe/
├── hands/
│   ├── hands.js
│   ├── hands_solution_packed_assets_loader.js
│   ├── hands_solution_simd_wasm_bin.js
│   ├── hands_solution_simd_wasm_bin.wasm
│   ├── hands_solution_wasm_bin.js
│   └── hands_solution_wasm_bin.wasm
├── camera_utils/
│   └── camera_utils.js
└── drawing_utils/
    └── drawing_utils.js
```

Các file này sẽ được load bởi hook `useHandTracking.js` khi ứng dụng chạy.