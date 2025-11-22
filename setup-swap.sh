#!/bin/bash

# Script để tạo swap space trên EC2 (giúp tăng memory ảo)
# Sử dụng: bash setup-swap.sh

echo "🔧 Setting up swap space for EC2..."

# Kiểm tra xem đã có swap chưa
if [ -f /swapfile ]; then
    echo "  Swap file đã tồn tại!"
    echo "Để xóa và tạo lại, chạy: sudo swapoff /swapfile && sudo rm /swapfile"
    exit 1
fi

# Tạo swap file 1GB (có thể tăng lên 2GB nếu cần)
SWAP_SIZE="1G"

echo "📦 Đang tạo swap file ${SWAP_SIZE}..."

# Tạo swap file
sudo fallocate -l $SWAP_SIZE /swapfile

# Set permissions
sudo chmod 600 /swapfile

# Format as swap
sudo mkswap /swapfile

# Enable swap
sudo swapon /swapfile

# Kiểm tra
echo ""
echo "✅ Swap đã được tạo thành công!"
echo ""
free -h

# Thêm vào /etc/fstab để tự động mount sau reboot
echo ""
echo "💾 Đang thêm vào /etc/fstab để tự động mount sau reboot..."
echo "/swapfile none swap sw 0 0" | sudo tee -a /etc/fstab

echo ""
echo "✅ Hoàn tất! Swap sẽ tự động được mount sau khi reboot."

