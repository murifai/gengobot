#!/bin/bash

# Update NGROK_URL in .env.local from running ngrok instance
# Run this after starting ngrok to auto-update the URL

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

# Get ngrok URL from API
NGROK_URL=$(curl -s http://127.0.0.1:4040/api/tunnels 2>/dev/null | grep -o '"public_url":"https://[^"]*"' | head -1 | sed 's/"public_url":"//;s/"$//')

if [ -z "$NGROK_URL" ]; then
    echo -e "${RED}❌ Ngrok tidak running atau URL tidak ditemukan${NC}"
    echo ""
    echo "Jalankan ngrok dulu: ./scripts/start-ngrok.sh"
    exit 1
fi

ENV_FILE=".env.local"

# Update or add NGROK_URL
if [ -f "$ENV_FILE" ]; then
    if grep -q "^NGROK_URL=" "$ENV_FILE"; then
        # Update existing
        sed -i '' "s|^NGROK_URL=.*|NGROK_URL=${NGROK_URL}|" "$ENV_FILE"
    else
        # Add new
        echo "NGROK_URL=${NGROK_URL}" >> "$ENV_FILE"
    fi
else
    echo "NGROK_URL=${NGROK_URL}" > "$ENV_FILE"
fi

echo -e "${GREEN}✅ .env.local updated!${NC}"
echo ""
echo -e "   ${BLUE}NGROK_URL=${NGROK_URL}${NC}"
echo ""
echo -e "${YELLOW}Webhook URL untuk Midtrans:${NC}"
echo -e "   ${NGROK_URL}/api/webhooks/midtrans"
echo ""
echo -e "${YELLOW}Jangan lupa restart dev server setelah update .env.local${NC}"
