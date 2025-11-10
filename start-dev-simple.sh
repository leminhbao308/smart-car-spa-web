#!/bin/bash

# Script đơn giản để chạy Next.js dev server trên EC2 (không dùng PM2)
# Sử dụng: bash start-dev-simple.sh
# Lưu ý: Script này sẽ dừng khi bạn đóng terminal. Để chạy background, dùng start-dev.sh với PM2

echo "Starting Smart Car Spa Web Development Server (Simple Mode)..."
echo "Lưu ý: Server sẽ dừng khi bạn đóng terminal. Để chạy background, dùng: bash start-dev.sh"

# Chạy dev server (hostname và port đã được cấu hình trong package.json script dev:ec2)
npm run dev:ec2

