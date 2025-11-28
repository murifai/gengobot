#!/bin/bash

# Gengobot - Start ngrok tunnel for Midtrans webhook testing
# Run this in a separate terminal, then run 'npm run dev' in another terminal

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🌐 Starting Ngrok Tunnel for Gengobot...${NC}"
echo ""

# Check if ngrok is installed
if ! command -v ngrok &> /dev/null; then
    echo -e "${RED}❌ ngrok is not installed.${NC}"
    echo ""
    echo "Install ngrok dengan salah satu cara berikut:"
    echo ""
    echo -e "  ${YELLOW}Homebrew (recommended):${NC}"
    echo "    brew install ngrok"
    echo ""
    echo -e "  ${YELLOW}Manual download:${NC}"
    echo "    1. Download dari https://ngrok.com/download"
    echo "    2. Unzip file yang didownload"
    echo "    3. Pindahkan ke PATH: sudo mv ngrok /usr/local/bin/"
    echo ""
    echo -e "  ${YELLOW}Setelah install, authenticate ngrok:${NC}"
    echo "    1. Buat akun gratis di https://dashboard.ngrok.com/signup"
    echo "    2. Copy authtoken dari https://dashboard.ngrok.com/get-started/your-authtoken"
    echo "    3. Run: ngrok config add-authtoken YOUR_TOKEN"
    echo ""
    exit 1
fi

# Kill existing ngrok processes
echo -e "${YELLOW}🔄 Stopping any existing ngrok processes...${NC}"
pkill -f ngrok 2>/dev/null || true
sleep 1

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}📋 PENTING - Google OAuth:${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "  Ngrok URL ${YELLOW}TIDAK BISA${NC} dipakai untuk Google OAuth login."
echo "  Gunakan http://localhost:3000 untuk login."
echo ""
echo "  Ngrok hanya untuk menerima webhook dari Midtrans."
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Start ngrok
echo -e "${GREEN}🚀 Starting ngrok...${NC}"
echo ""
echo -e "  Setelah ngrok running, copy URL HTTPS-nya dan:"
echo ""
echo -e "  1. ${YELLOW}Update .env.local:${NC}"
echo "     NGROK_URL=https://xxxx-xxx-xxx.ngrok-free.app"
echo ""
echo -e "  2. ${YELLOW}Set webhook di Midtrans Dashboard:${NC}"
echo "     https://xxxx-xxx-xxx.ngrok-free.app/api/webhooks/midtrans"
echo ""
echo -e "  3. ${YELLOW}Jalankan dev server di terminal lain:${NC}"
echo "     npm run dev"
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Run ngrok (foreground so user can see the URL)
ngrok http 3000
