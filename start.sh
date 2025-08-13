#!/bin/bash

echo "🚀 Khởi chạy dự án Read Figma..."

# Kiểm tra Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js chưa được cài đặt. Vui lòng cài đặt Node.js trước."
    exit 1
fi

# Kiểm tra npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm chưa được cài đặt. Vui lòng cài đặt npm trước."
    exit 1
fi

echo "✅ Node.js và npm đã sẵn sàng"

# Cài đặt dependencies
echo "📦 Đang cài đặt dependencies..."
npm run install-all

# Kiểm tra file .env
if [ ! -f "server/.env" ]; then
    echo "⚠️  File .env chưa được tạo trong thư mục server/"
    echo "📝 Vui lòng tạo file .env với nội dung:"
    echo "FIGMA_ACCESS_TOKEN=your_figma_access_token_here"
    echo "PORT=5000"
    echo ""
    echo "🔑 Để lấy Figma Access Token:"
    echo "1. Đăng nhập vào Figma"
    echo "2. Vào Account Settings > Personal Access Tokens"
    echo "3. Tạo token mới"
    echo "4. Copy token và paste vào file .env"
    echo ""
    read -p "Nhấn Enter để tiếp tục sau khi đã tạo file .env..."
fi

# Khởi chạy dự án
echo "🚀 Khởi chạy dự án..."
npm run dev
