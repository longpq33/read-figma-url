# Read Figma - Tạo React Components từ Figma Design

Dự án này giúp bạn tự động tạo React components và pages từ Figma design thông qua Figma API.

## Tính năng

- 🔗 Đọc design từ link Figma
- 🧩 Tự động tạo React components
- 📱 Responsive design
- 🎨 Hỗ trợ Figma styles và components
- ⚡ Hot reload development

## Cài đặt

1. Clone dự án:
```bash
git clone <repository-url>
cd read-figma
```

2. Cài đặt dependencies:
```bash
npm run install-all
```

3. Tạo file `.env` trong thư mục `server`:
```env
FIGMA_ACCESS_TOKEN=your_figma_access_token
PORT=5000
```

4. Chạy dự án:
```bash
npm run dev
```

## Sử dụng

1. Mở trình duyệt và truy cập `http://localhost:3000`
2. Nhập link Figma vào form
3. Chọn components/pages cần tạo
4. Nhấn "Generate Components" để tạo code

## Cấu trúc dự án

```
read-figma/
├── client/          # React frontend
├── server/          # Node.js backend API
├── package.json     # Root dependencies
└── README.md        # Hướng dẫn này
```

## API Endpoints

- `POST /api/figma/parse` - Parse Figma design
- `GET /api/figma/components` - Lấy danh sách components
- `POST /api/figma/generate` - Tạo React components

## Lưu ý

- Cần có Figma Access Token để sử dụng API
- Token có thể lấy từ Figma Account Settings > Personal Access Tokens
# read-figma-url
