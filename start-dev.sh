#!/bin/bash

# Script để chạy Next.js dev server trên EC2
# Sử dụng: bash start-dev.sh

echo "Starting Smart Car Spa Web Development Server..."

# Tạo thư mục logs nếu chưa có
mkdir -p logs

# Kiểm tra xem PM2 đã được cài đặt chưa
if ! command -v pm2 &> /dev/null; then
    echo "PM2 chưa được cài đặt. Đang cài đặt PM2..."
    npm install -g pm2
    if [ $? -ne 0 ]; then
        echo "Lỗi: Không thể cài đặt PM2. Vui lòng cài đặt thủ công: npm install -g pm2"
        exit 1
    fi
fi

# Dừng process cũ nếu có
pm2 stop smart-car-spa-web 2>/dev/null || true
pm2 delete smart-car-spa-web 2>/dev/null || true

# Khởi động với PM2
echo "Đang khởi động ứng dụng với PM2..."
pm2 start ecosystem.config.js

# Hiển thị status
pm2 status

# Lưu PM2 process list để tự động restart sau khi reboot
pm2 save

# Cấu hình PM2 để tự động start sau reboot (chỉ cần chạy 1 lần)
echo ""
echo "  Lưu ý: Để tự động start sau khi EC2 reboot, chạy lệnh sau và làm theo hướng dẫn:"
echo "   pm2 startup"
echo ""

# Hiển thị logs
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Ứng dụng đã được khởi động thành công!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📋 Các lệnh hữu ích:"
echo "   • Xem logs:        pm2 logs smart-car-spa-web"
echo "   • Xem logs real-time: pm2 logs smart-car-spa-web --lines 50"
echo "   • Dừng:            pm2 stop smart-car-spa-web"
echo "   • Restart:         pm2 restart smart-car-spa-web"
echo "   • Xem status:      pm2 status"
echo "   • Monitor:         pm2 monit"
echo ""

