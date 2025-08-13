# Demo: Read Figma - Tạo React Components

## 🎯 Mục tiêu
Dự án này giúp bạn tự động tạo React components từ Figma design thông qua Figma API.

## 🚀 Cách sử dụng

### 1. Chuẩn bị
- Cài đặt Node.js (version 16+)
- Có Figma Access Token
- Clone dự án này

### 2. Cài đặt
```bash
# Cài đặt tất cả dependencies
npm run install-all

# Hoặc cài đặt từng phần
npm install
cd server && npm install
cd ../client && npm install
```

### 3. Cấu hình
Tạo file `server/.env`:
```env
FIGMA_ACCESS_TOKEN=your_figma_access_token_here
PORT=5000
```

### 4. Khởi chạy
```bash
# Khởi chạy cả frontend và backend
npm run dev

# Hoặc khởi chạy riêng lẻ
npm run server    # Backend tại http://localhost:5000
npm run client    # Frontend tại http://localhost:3000
```

## 📱 Giao diện

### Bước 1: Nhập Figma URL
- Dán link Figma vào form
- Nhấn "Parse Figma Design"
- Hệ thống sẽ đọc design từ Figma API

### Bước 2: Chọn Components
- Xem danh sách components có sẵn
- Chọn components cần tạo
- Có thể tìm kiếm và chọn tất cả

### Bước 3: Tạo Code
- Xem preview của components
- Nhấn "Tạo React Components"
- Hệ thống sẽ tạo JSX files

### Bước 4: Hoàn thành
- Xem danh sách files đã tạo
- Components được lưu trong `server/generated-components/`

## 🔧 Tính năng kỹ thuật

### Backend (Node.js + Express)
- Parse Figma API
- Tạo React components
- File management
- RESTful API endpoints

### Frontend (React + Tailwind CSS)
- Modern UI/UX
- Responsive design
- Step-by-step workflow
- Real-time feedback

### Figma Integration
- Đọc design data
- Extract components
- Parse styles và properties
- Generate JSX code

## 📁 Cấu trúc dự án
```
read-figma/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── App.js         # Main app
│   │   └── index.js       # Entry point
│   ├── public/            # Static files
│   └── package.json       # Frontend dependencies
├── server/                # Node.js backend
│   ├── index.js          # Server main file
│   ├── package.json      # Backend dependencies
│   └── env.example       # Environment template
├── package.json           # Root dependencies
├── README.md             # Documentation
└── start.sh              # Startup script
```

## 🎨 Ví dụ Components được tạo

### Button Component
```jsx
import React from 'react';

const Button = ({ className = '', ...props }) => {
  return (
    <div className={`button ${className}`} {...props}>
      <p style={{ fontFamily: 'Inter', fontSize: 16 }}>Click me</p>
    </div>
  );
};

export default Button;
```

### Card Component
```jsx
import React from 'react';

const Card = ({ className = '', ...props }) => {
  return (
    <div className={`card ${className}`} {...props}>
      <div style={{ width: 300, height: 200, backgroundColor: '#f3f4f6' }}></div>
      <p style={{ fontFamily: 'Inter', fontSize: 18 }}>Card Title</p>
    </div>
  );
};

export default Card;
```

## 🔑 Lấy Figma Access Token

1. Đăng nhập vào [Figma](https://www.figma.com)
2. Vào **Account Settings** (click vào avatar)
3. Chọn **Personal Access Tokens**
4. Click **Create new token**
5. Đặt tên và copy token
6. Paste vào file `server/.env`

## 🚨 Lưu ý quan trọng

- **Figma Access Token** là bắt buộc để sử dụng API
- Token có quyền đọc file Figma
- Chỉ đọc được file public hoặc file bạn có quyền truy cập
- Components được tạo dựa trên design data từ Figma
- Code được generate tự động, có thể cần chỉnh sửa thủ công

## 🐛 Troubleshooting

### Lỗi "Figma Access Token chưa được cấu hình"
- Kiểm tra file `server/.env` có tồn tại
- Kiểm tra token có đúng format
- Restart server sau khi thay đổi .env

### Lỗi "URL Figma không hợp lệ"
- URL phải có dạng: `https://www.figma.com/file/...`
- Kiểm tra file có tồn tại và có quyền truy cập

### Lỗi kết nối server
- Kiểm tra server có đang chạy tại port 5000
- Kiểm tra firewall/antivirus
- Restart server nếu cần

## 📞 Hỗ trợ

Nếu gặp vấn đề, hãy kiểm tra:
1. Console logs của browser
2. Terminal logs của server
3. Network tab trong DevTools
4. File `.env` có đúng format

---

**Happy coding! 🎉**
