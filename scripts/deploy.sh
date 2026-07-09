#!/bin/bash
# LUX Traffic Management — VPS Deployment Script (Ubuntu + Caddy + pm2)
# Usage: bash scripts/deploy.sh
# Prerequisites: git, node 20, npm, caddy, pm2 installed on server

set -e

APP_NAME="lux-traffic-management"
REPO_URL="https://github.com/ausgreekdev-cpu/lux-traffic-management-.git"
DOMAIN="${DOMAIN:-traffic.luxtrafficwa.com}"
PORT="${PORT:-3001}"
JWT_SECRET="${JWT_SECRET:-$(openssl rand -hex 32)}"

echo "==> Cloning repository..."
cd /opt
if [ -d "$APP_NAME" ]; then
  cd "$APP_NAME" && git pull
else
  git clone "$REPO_URL"
  cd "$APP_NAME"
fi

echo "==> Installing dependencies..."
npm install

echo "==> Building frontend..."
npm run build

echo "==> Setting up data directory..."
mkdir -p data uploads

echo "==> Configuring environment..."
cat > .env <<EOF
PORT=$PORT
JWT_SECRET=$JWT_SECRET
NODE_ENV=production
EOF

echo "==> Starting with pm2..."
pm2 delete "$APP_NAME" 2>/dev/null || true
pm2 start server.js --name "$APP_NAME" --env production
pm2 save

echo "==> Configuring Caddy..."
cat > /etc/caddy/sites/$DOMAIN <<CADDYEOF
$DOMAIN {
    reverse_proxy localhost:$PORT
    header /api/* Access-Control-Allow-Origin *
    encode gzip
    log {
        output file /var/log/caddy/$APP_NAME.log
    }
}
CADDYEOF
caddy reload

echo ""
echo "==> Deployment complete!"
echo "    https://$DOMAIN"
echo "    JWT_SECRET saved to /opt/$APP_NAME/.env"
echo ""
