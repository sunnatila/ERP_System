#!/bin/bash
# ============================================================
# StyleHub Server Setup Script
# Airnet VPS (Ubuntu 22.04) uchun
# Bir marta ishga tushiriladi
# ============================================================

set -e  # xato bo'lsa to'xtasin

echo "======================================"
echo " StyleHub Server Sozlash Boshlanmoqda"
echo "======================================"

# ─────────────────────────────────────────
# 1. Tizimni yangilash
# ─────────────────────────────────────────
echo ""
echo "==> [1/6] Tizim yangilanmoqda..."
apt-get update -y
apt-get upgrade -y

# ─────────────────────────────────────────
# 2. Docker o'rnatish
# ─────────────────────────────────────────
echo ""
echo "==> [2/6] Docker o'rnatilmoqda..."

# Eski versiyalarni o'chirish
apt-get remove -y docker docker-engine docker.io containerd runc 2>/dev/null || true

# Kerakli paketlar
apt-get install -y \
    ca-certificates \
    curl \
    gnupg \
    lsb-release \
    git \
    ufw

# Docker GPG key
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
chmod a+r /etc/apt/keyrings/docker.gpg

# Docker repo qo'shish
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
  https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null

# Docker o'rnatish
apt-get update -y
apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Docker service ishga tushirish
systemctl enable docker
systemctl start docker

echo "Docker versiyasi: $(docker --version)"
echo "Docker Compose versiyasi: $(docker compose version)"

# ─────────────────────────────────────────
# 3. Firewall sozlash
# ─────────────────────────────────────────
echo ""
echo "==> [3/6] Firewall sozlanmoqda..."
ufw allow ssh
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable
echo "Firewall holati:"
ufw status

# ─────────────────────────────────────────
# 4. Loyiha papkasi yaratish
# ─────────────────────────────────────────
echo ""
echo "==> [4/6] Loyiha papkasi yaratilmoqda..."
mkdir -p /opt/stylehub
cd /opt/stylehub

# ─────────────────────────────────────────
# 5. GitHub dan clone qilish
# ─────────────────────────────────────────
echo ""
echo "==> [5/6] Loyiha clone qilinmoqda..."
echo ""
echo "  GitHub repo URL ni kiriting (masalan: https://github.com/username/repo.git):"
read -r REPO_URL

if [ -z "$REPO_URL" ]; then
    echo "XATO: Repo URL bo'sh bo'lishi mumkin emas!"
    exit 1
fi

git clone "$REPO_URL" /opt/stylehub
cd /opt/stylehub

# ─────────────────────────────────────────
# 6. .env fayl yaratish
# ─────────────────────────────────────────
echo ""
echo "==> [6/6] .env fayl yaratilmoqda..."

if [ ! -f ".env" ]; then
    cp .env.example .env
    echo ""
    echo "  .env fayl yaratildi. Iltimos quyidagi ma'lumotlarni to'ldiring:"
    echo ""
    echo "  nano /opt/stylehub/.env"
    echo ""
fi

echo ""
echo "======================================"
echo " Server sozlash YAKUNLANDI!"
echo "======================================"
echo ""
echo " Keyingi qadamlar:"
echo "  1. nano /opt/stylehub/.env  — real qiymatlarni kiriting"
echo "  2. cd /opt/stylehub && docker compose up -d"
echo "  3. docker compose exec backend python manage.py migrate"
echo "  4. docker compose exec backend python manage.py createsuperuser"
echo ""
