#!/usr/bin/env bash
# One-shot setup for a fresh Hostinger KVM VPS (Ubuntu 22.04/24.04).
# Run as root:  bash deploy/setup.sh yourdomain.com
set -euo pipefail

DOMAIN="${1:?Usage: bash deploy/setup.sh yourdomain.com}"
APP_DIR=/opt/4xcms
DATA_DIR=/var/lib/4xcms
REPO=https://github.com/mail4xstudios-netizen/4X-WEBSITES.git

echo "==> Installing Node.js 20, nginx, certbot"
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs nginx certbot python3-certbot-nginx git

echo "==> Fetching the app"
[ -d "$APP_DIR/.git" ] && git -C "$APP_DIR" pull || git clone "$REPO" "$APP_DIR"
mkdir -p "$DATA_DIR"

echo "==> Building"
cd "$APP_DIR"
npm ci
npm run build
cp -r .next/static .next/standalone/.next/
cp -r public .next/standalone/

echo "==> Writing environment"
cat > "$APP_DIR/.env.production" <<ENV
PLATFORM_HOSTS=$DOMAIN
DATA_DIR=$DATA_DIR
ADMIN_EMAIL=mail4xstudios@gmail.com
ADMIN_PASSWORD=$(head -c 18 /dev/urandom | base64 | tr -d '/+=')
RAZORPAY_WEBHOOK_SECRET=$(head -c 24 /dev/urandom | base64 | tr -d '/+=')
ENV
chmod 600 "$APP_DIR/.env.production"

echo "==> Installing the service"
install -m644 deploy/4xcms.service /etc/systemd/system/4xcms.service
systemctl daemon-reload
systemctl enable --now 4xcms

echo "==> Configuring nginx for $DOMAIN"
sed "s/DOMAIN_PLACEHOLDER/$DOMAIN/g" deploy/nginx.conf > /etc/nginx/sites-available/4xcms
ln -sf /etc/nginx/sites-available/4xcms /etc/nginx/sites-enabled/4xcms
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx

echo "==> Requesting a TLS certificate"
certbot --nginx -d "$DOMAIN" -d "www.$DOMAIN" --non-interactive --agree-tos -m mail4xstudios@gmail.com || \
  echo "!! certbot failed — check that $DOMAIN's A record points at this server, then rerun: certbot --nginx -d $DOMAIN"

echo
echo "Done. https://$DOMAIN should now serve the store."
echo "Your admin password is in $APP_DIR/.env.production — read it with:"
echo "    grep ADMIN_PASSWORD $APP_DIR/.env.production"
echo "Sign in at https://$DOMAIN/admin/login and change it straight away."
