# GengoBot VPS Deployment Guide (Contabo)

Complete fresh deployment guide for GengoBot on Contabo VPS with Ubuntu.

**Last Updated:** December 2024 (Subdomain Architecture + Mobile API)

---

## Architecture Overview

```
┌──────────────────────────────────────────────────────────────────────┐
│                         Contabo VPS                                  │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────────────┐ │
│  │ gengobot.com   │  │app.gengobot.com│  │   api.gengobot.com     │ │
│  │  (WordPress)   │  │  (Next.js UI)  │  │    (Next.js API)       │ │
│  │                │  │                │  │                        │ │
│  │ - Landing page │  │ - Dashboard    │  │ - /v1/auth/*           │ │
│  │ - Blog         │  │ - Drill        │  │ - /v1/decks/*          │ │
│  │ - Changelog    │  │ - Kaiwa        │  │ - /v1/kaiwa/*          │ │
│  │ - Legal pages  │  │ - Profile      │  │ - /v1/voice/*          │ │
│  └───────┬────────┘  └───────┬────────┘  └───────────┬────────────┘ │
│          │                   │                       │              │
│          │                   │    ┌──────────────────┘              │
│          │                   │    │                                 │
│          ▼                   ▼    ▼                                 │
│  ┌────────────────┐  ┌────────────────────────────────────────────┐ │
│  │   PHP-FPM      │  │              Next.js :3000                 │ │
│  │   + MySQL      │  │         (Single instance for all)          │ │
│  └────────────────┘  └────────────────────────────────────────────┘ │
│                                      │                              │
│                                      ▼                              │
│                      ┌────────────────────────────────────────────┐ │
│                      │              PostgreSQL                    │ │
│                      └────────────────────────────────────────────┘ │
│                                                                      │
│  ┌────────────────┐                                                 │
│  │admin.gengobot  │ ──► Next.js :3000 (Admin routes)               │
│  │    .com        │                                                 │
│  └────────────────┘                                                 │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                    Nginx (Reverse Proxy)                      │   │
│  │   - SSL termination (Let's Encrypt)                          │   │
│  │   - Rate limiting (different limits per subdomain)           │   │
│  │   - URL rewriting (api.gengobot.com/v1/* → /api/v1/*)        │   │
│  └──────────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────────┘

                    │                    │
                    ▼                    ▼
            ┌──────────────┐    ┌──────────────┐
            │  iOS App     │    │ Android App  │
            │  (Future)    │    │  (Future)    │
            └──────────────┘    └──────────────┘
                    │                    │
                    └────────┬───────────┘
                             │
                             ▼
                  api.gengobot.com/v1/*
                      (JWT Auth)
```

### Subdomain Structure

| Domain               | Purpose                         | Technology      | Auth           |
| -------------------- | ------------------------------- | --------------- | -------------- |
| `gengobot.com`       | Landing, blog, changelog, legal | WordPress + PHP | None           |
| `app.gengobot.com`   | User web application            | Next.js         | Session        |
| `api.gengobot.com`   | REST API (mobile + web)         | Next.js         | JWT + Session  |
| `admin.gengobot.com` | Admin panel                     | Next.js         | Session + Role |

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [DNS Configuration](#dns-configuration)
3. [Initial Server Setup](#initial-server-setup)
4. [Install Required Software](#install-required-software)
5. [PostgreSQL Setup](#postgresql-setup)
6. [MySQL Setup (WordPress)](#mysql-setup-wordpress)
7. [WordPress Installation](#wordpress-installation)
8. [Next.js App Deployment](#nextjs-app-deployment)
9. [Nginx Configuration](#nginx-configuration)
10. [SSL Certificates](#ssl-certificates)
11. [PM2 Process Manager](#pm2-process-manager)
12. [Firewall Configuration](#firewall-configuration)
13. [Cron Jobs](#cron-jobs)
14. [Database Backups](#database-backups)
15. [Monitoring & Maintenance](#monitoring--maintenance)
16. [Troubleshooting](#troubleshooting)
17. [Scaling Guide](#scaling-guide)

---

## Prerequisites

- **Contabo VPS** with Ubuntu 22.04 LTS or higher
- **Domain name** with access to DNS settings
- **Root or sudo access** to the server

### Contabo VPS Recommended Specs

| Tier  | vCPU | RAM  | Storage   | Use Case                     |
| ----- | ---- | ---- | --------- | ---------------------------- |
| VPS S | 4    | 8GB  | 200GB SSD | Development/Testing          |
| VPS M | 6    | 16GB | 400GB SSD | **Production (Recommended)** |
| VPS L | 8    | 30GB | 800GB SSD | High Traffic                 |

---

## DNS Configuration

Configure ALL subdomains before starting:

| Type | Name  | Value          | TTL |
| ---- | ----- | -------------- | --- |
| A    | @     | YOUR_SERVER_IP | 300 |
| A    | www   | YOUR_SERVER_IP | 300 |
| A    | app   | YOUR_SERVER_IP | 300 |
| A    | api   | YOUR_SERVER_IP | 300 |
| A    | admin | YOUR_SERVER_IP | 300 |

Wait for DNS propagation (usually 5-30 minutes, can take up to 48 hours).

```bash
# Verify DNS
dig gengobot.com +short
dig app.gengobot.com +short
dig api.gengobot.com +short
dig admin.gengobot.com +short
```

---

## Initial Server Setup

### 1. Connect to Server

```bash
ssh root@YOUR_SERVER_IP
```

### 2. Create Deploy User

```bash
# Create user
adduser gengo

# Add to sudo group
usermod -aG sudo gengo

# Switch to new user
su - gengo
```

### 3. Update System

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl git build-essential software-properties-common unzip
```

### 4. Set Timezone

```bash
sudo timedatectl set-timezone Asia/Jakarta
```

---

## Install Required Software

### 1. Install Node.js 20.x (LTS)

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verify
node --version  # Should be v20.x.x
npm --version
```

### 2. Install PM2 (Process Manager)

```bash
sudo npm install -g pm2

# Configure PM2 to start on boot
pm2 startup systemd
# Run the command it outputs
```

### 3. Install Nginx

```bash
sudo apt install -y nginx
sudo systemctl enable nginx
sudo systemctl start nginx
```

### 4. Install PHP 8.2 (for WordPress)

```bash
# Add PHP repository
sudo add-apt-repository ppa:ondrej/php -y
sudo apt update

# Install PHP and extensions
sudo apt install -y php8.2-fpm php8.2-mysql php8.2-curl php8.2-gd \
    php8.2-intl php8.2-mbstring php8.2-soap php8.2-xml php8.2-zip \
    php8.2-bcmath php8.2-imagick

# Verify
php -v
```

### 5. Install Certbot (SSL)

```bash
sudo apt install -y certbot python3-certbot-nginx
```

---

## PostgreSQL Setup

### 1. Install PostgreSQL 15+

```bash
sudo sh -c 'echo "deb http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list'
wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | sudo apt-key add -
sudo apt update
sudo apt install -y postgresql-15 postgresql-contrib-15

sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### 2. Create Database and User

```bash
# Generate a secure password
openssl rand -base64 24
# SAVE THIS PASSWORD!

# Create database and user
sudo -u postgres psql << 'EOF'
CREATE DATABASE gengobot;
CREATE USER gengobot_user WITH PASSWORD 'YOUR_POSTGRES_PASSWORD';
GRANT ALL PRIVILEGES ON DATABASE gengobot TO gengobot_user;
ALTER DATABASE gengobot OWNER TO gengobot_user;
\c gengobot
GRANT ALL ON SCHEMA public TO gengobot_user;
\q
EOF
```

### 3. Configure Password Auth

```bash
sudo nano /etc/postgresql/15/main/pg_hba.conf

# Find: local all all peer
# Change to: local all all md5

sudo systemctl restart postgresql
```

---

## MySQL Setup (WordPress)

### 1. Install MySQL

```bash
sudo apt install -y mysql-server

sudo systemctl start mysql
sudo systemctl enable mysql

# Secure installation
sudo mysql_secure_installation
```

### 2. Create WordPress Database

```bash
# Generate password
openssl rand -base64 24
# SAVE THIS PASSWORD!

sudo mysql << 'EOF'
CREATE DATABASE wordpress DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'wordpress_user'@'localhost' IDENTIFIED BY 'YOUR_MYSQL_PASSWORD';
GRANT ALL PRIVILEGES ON wordpress.* TO 'wordpress_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
EOF
```

---

## WordPress Installation

### 1. Download WordPress

```bash
cd /var/www
sudo wget https://wordpress.org/latest.zip
sudo unzip latest.zip
sudo mv wordpress wordpress
sudo rm latest.zip

# Set permissions
sudo chown -R www-data:www-data /var/www/wordpress
sudo chmod -R 755 /var/www/wordpress
```

### 2. Configure WordPress

```bash
cd /var/www/wordpress
sudo cp wp-config-sample.php wp-config.php
sudo nano wp-config.php
```

Update the following:

```php
define( 'DB_NAME', 'wordpress' );
define( 'DB_USER', 'wordpress_user' );
define( 'DB_PASSWORD', 'YOUR_MYSQL_PASSWORD' );
define( 'DB_HOST', 'localhost' );
define( 'DB_CHARSET', 'utf8mb4' );

// Add these for security
define( 'FORCE_SSL_ADMIN', true );
define( 'WP_AUTO_UPDATE_CORE', true );

// Get fresh keys from https://api.wordpress.org/secret-key/1.1/salt/
define('AUTH_KEY',         'unique phrase here');
define('SECURE_AUTH_KEY',  'unique phrase here');
define('LOGGED_IN_KEY',    'unique phrase here');
define('NONCE_KEY',        'unique phrase here');
define('AUTH_SALT',        'unique phrase here');
define('SECURE_AUTH_SALT', 'unique phrase here');
define('LOGGED_IN_SALT',   'unique phrase here');
define('NONCE_SALT',       'unique phrase here');
```

### 3. Configure PHP

```bash
sudo nano /etc/php/8.2/fpm/php.ini
```

Update these values:

```ini
upload_max_filesize = 64M
post_max_size = 64M
memory_limit = 256M
max_execution_time = 300
max_input_time = 300
```

Restart PHP:

```bash
sudo systemctl restart php8.2-fpm
```

---

## Next.js App Deployment

### 1. Create Application Directory

```bash
sudo mkdir -p /var/www
sudo chown -R gengo:gengo /var/www
cd /var/www
```

### 2. Clone Repository

```bash
git clone https://github.com/murifai/gengobotnew.git gengobot
cd gengobot
```

### 3. Configure Environment

```bash
cp .env.example .env
nano .env
```

**Production `.env`:**

```env
# Database
DATABASE_URL="postgresql://gengobot_user:YOUR_POSTGRES_PASSWORD@localhost:5432/gengobot"

# NextAuth v5 - Generate new secret!
AUTH_SECRET="GENERATE_WITH_openssl_rand_-base64_32"
NEXTAUTH_URL="https://app.gengobot.com"

# JWT Secret for mobile API - Generate new!
JWT_SECRET="GENERATE_WITH_openssl_rand_-base64_32"

# OpenAI
OPENAI_API_KEY="sk-your-openai-api-key"

# Google OAuth (update redirect URI in Google Console!)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Mailjet
MAILJET_API_PUBLIC_KEY="your-mailjet-public-key"
MAILJET_API_PRIVATE_KEY="your-mailjet-private-key"
MAILJET_FROM_EMAIL="noreply@gengobot.com"
MAILJET_FROM_NAME="Gengobot"

# Midtrans Payment
MIDTRANS_SERVER_KEY_PRODUCTION="Mid-server-xxx"
MIDTRANS_CLIENT_KEY_PRODUCTION="Mid-client-xxx"
MIDTRANS_IS_PRODUCTION=true
MIDTRANS_MOCK_MODE=false

# Application URLs
NODE_ENV="production"
NEXT_PUBLIC_APP_URL="https://app.gengobot.com"
NEXT_PUBLIC_API_URL="https://api.gengobot.com"
NEXT_PUBLIC_ADMIN_URL="https://admin.gengobot.com"
NEXT_PUBLIC_MAIN_URL="https://gengobot.com"
```

**Important External Service Updates:**

| Service          | URL to Update                                                     |
| ---------------- | ----------------------------------------------------------------- |
| Google OAuth     | Redirect URI: `https://app.gengobot.com/api/auth/callback/google` |
| Midtrans Webhook | `https://api.gengobot.com/v1/webhooks/midtrans`                   |

### 4. Install & Build

```bash
npm ci
npm run db:generate
npm run db:migrate:deploy
npm run build
```

### 5. Seed Data (Optional)

```bash
npm run db:seed
npm run admin:seed
```

---

## Nginx Configuration

### 1. Copy Config File

```bash
sudo cp /var/www/gengobot/docs/deployment/nginx.conf /etc/nginx/sites-available/gengobot
```

### 2. Verify Configuration

The nginx.conf includes all 4 subdomains:

- `gengobot.com` → WordPress
- `app.gengobot.com` → Next.js Web UI
- `api.gengobot.com` → Next.js API (with URL rewriting `/v1/*` → `/api/v1/*`)
- `admin.gengobot.com` → Next.js Admin

```bash
sudo nano /etc/nginx/sites-available/gengobot
# Verify domain names are correct
```

### 3. Enable Site (Before SSL)

Create a temporary HTTP-only config for initial SSL setup:

```bash
sudo tee /etc/nginx/sites-available/gengobot-temp << 'EOF'
server {
    listen 80;
    server_name gengobot.com www.gengobot.com app.gengobot.com api.gengobot.com admin.gengobot.com;

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location / {
        return 200 'OK';
        add_header Content-Type text/plain;
    }
}
EOF

sudo mkdir -p /var/www/certbot
sudo ln -sf /etc/nginx/sites-available/gengobot-temp /etc/nginx/sites-enabled/gengobot
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx
```

---

## SSL Certificates

### 1. Obtain Certificates for All Subdomains

```bash
# Main domain + www
sudo certbot certonly --webroot -w /var/www/certbot \
    -d gengobot.com -d www.gengobot.com

# App subdomain
sudo certbot certonly --webroot -w /var/www/certbot \
    -d app.gengobot.com

# API subdomain
sudo certbot certonly --webroot -w /var/www/certbot \
    -d api.gengobot.com

# Admin subdomain
sudo certbot certonly --webroot -w /var/www/certbot \
    -d admin.gengobot.com
```

### 2. Generate DH Parameters

```bash
sudo openssl dhparam -out /etc/letsencrypt/ssl-dhparams.pem 2048
```

### 3. Create SSL Options File

```bash
sudo tee /etc/letsencrypt/options-ssl-nginx.conf << 'EOF'
ssl_session_cache shared:le_nginx_SSL:10m;
ssl_session_timeout 1440m;
ssl_session_tickets off;
ssl_protocols TLSv1.2 TLSv1.3;
ssl_prefer_server_ciphers off;
ssl_ciphers "ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:DHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384";
EOF
```

### 4. Enable Full Config

```bash
sudo ln -sf /etc/nginx/sites-available/gengobot /etc/nginx/sites-enabled/gengobot
sudo nginx -t
sudo systemctl reload nginx
```

### 5. Verify Auto-Renewal

```bash
sudo certbot renew --dry-run
```

---

## PM2 Process Manager

### 1. Start Application

```bash
cd /var/www/gengobot
pm2 start ecosystem.config.js
pm2 save
```

### 2. Verify Status

```bash
pm2 status
pm2 logs gengobot
```

### 3. Test All Subdomains

```bash
curl -I https://gengobot.com
curl -I https://app.gengobot.com
curl -I https://api.gengobot.com/v1/auth/me
curl -I https://admin.gengobot.com
```

---

## Firewall Configuration

```bash
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw enable
sudo ufw status verbose
```

---

## Cron Jobs

### 1. Create Cron Script

```bash
sudo nano /usr/local/bin/gengobot-cron.sh
```

```bash
#!/bin/bash
# Use API subdomain for cron jobs
BASE_URL="https://api.gengobot.com"
CRON_SECRET="your-cron-secret-here"

curl -s -X POST "$BASE_URL/v1/cron/trial-expiry" \
  -H "Authorization: Bearer $CRON_SECRET"

curl -s -X POST "$BASE_URL/v1/cron/subscription-renewal" \
  -H "Authorization: Bearer $CRON_SECRET"

curl -s -X POST "$BASE_URL/v1/cron/monthly-credits" \
  -H "Authorization: Bearer $CRON_SECRET"

curl -s -X POST "$BASE_URL/v1/cron/process-scheduled-tier-changes" \
  -H "Authorization: Bearer $CRON_SECRET"
```

```bash
sudo chmod +x /usr/local/bin/gengobot-cron.sh
```

### 2. Schedule Cron

```bash
sudo crontab -e
```

```cron
# GengoBot cron - Daily at 1 AM
0 1 * * * /usr/local/bin/gengobot-cron.sh >> /var/log/gengobot-cron.log 2>&1

# Monthly credits - 1st of month at 00:05
5 0 1 * * curl -s -X POST "https://api.gengobot.com/v1/cron/monthly-credits" -H "Authorization: Bearer YOUR_CRON_SECRET"
```

---

## Database Backups

### 1. Create Backup Script

```bash
sudo nano /usr/local/bin/backup-gengobot.sh
```

```bash
#!/bin/bash
BACKUP_DIR="/var/backups/gengobot"
DATE=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=7

mkdir -p $BACKUP_DIR

# PostgreSQL backup (Next.js app)
PGPASSWORD="YOUR_POSTGRES_PASSWORD" pg_dump -U gengobot_user -h localhost gengobot | gzip > "$BACKUP_DIR/postgres_$DATE.sql.gz"

# MySQL backup (WordPress)
mysqldump -u wordpress_user -p'YOUR_MYSQL_PASSWORD' wordpress | gzip > "$BACKUP_DIR/wordpress_$DATE.sql.gz"

# Remove old backups
find $BACKUP_DIR -name "*.sql.gz" -mtime +$RETENTION_DAYS -delete

echo "Backup completed: $DATE"
```

```bash
sudo chmod +x /usr/local/bin/backup-gengobot.sh
```

### 2. Schedule Backup

```bash
sudo crontab -e
```

```cron
# Database backup - Daily at 2 AM
0 2 * * * /usr/local/bin/backup-gengobot.sh >> /var/log/gengobot-backup.log 2>&1
```

---

## Monitoring & Maintenance

### Health Check Commands

```bash
# Application
pm2 status
curl -I https://app.gengobot.com
curl -I https://api.gengobot.com/v1/auth/me

# WordPress
curl -I https://gengobot.com

# Admin
curl -I https://admin.gengobot.com

# Nginx
sudo systemctl status nginx
sudo nginx -t

# Databases
sudo systemctl status postgresql
sudo systemctl status mysql

# Resources
df -h
free -h
htop
```

### Update Next.js App

```bash
cd /var/www/gengobot
git pull origin main
npm ci
npm run db:migrate:deploy
npm run build
pm2 restart gengobot
```

### Update WordPress

Use WordPress admin dashboard at `https://gengobot.com/wp-admin`

### View Logs

```bash
# Next.js app
pm2 logs gengobot

# Nginx logs by subdomain
sudo tail -f /var/log/nginx/app-access.log
sudo tail -f /var/log/nginx/app-error.log
sudo tail -f /var/log/nginx/api-access.log
sudo tail -f /var/log/nginx/api-error.log
sudo tail -f /var/log/nginx/admin-access.log
sudo tail -f /var/log/nginx/admin-error.log
sudo tail -f /var/log/nginx/wordpress-access.log
sudo tail -f /var/log/nginx/wordpress-error.log

# PHP
sudo tail -f /var/log/php8.2-fpm.log
```

---

## Troubleshooting

### Audio/Voice Not Working

```bash
# Check nginx buffering is disabled for voice routes
sudo grep -r "proxy_buffering" /etc/nginx/sites-available/gengobot
# Should show: proxy_buffering off;
```

### SSE Streaming Not Working

```bash
# Verify X-Accel-Buffering header
curl -H "Accept: text/event-stream" https://app.gengobot.com/api/task-attempts/test/stream -I
# Should include: X-Accel-Buffering: no
```

### API Returns 404

```bash
# Check nginx URL rewriting for api subdomain
curl https://api.gengobot.com/v1/auth/me -v
# Should rewrite to /api/v1/auth/me internally
```

### 502 Bad Gateway

```bash
pm2 status
pm2 logs gengobot --lines 100
pm2 restart gengobot
```

### WordPress White Screen

```bash
sudo tail -f /var/log/nginx/wordpress-error.log
sudo tail -f /var/log/php8.2-fpm.log

# Check permissions
sudo chown -R www-data:www-data /var/www/wordpress
```

### SSL Certificate Issues

```bash
sudo certbot certificates
sudo certbot renew --force-renewal
```

### JWT Authentication Not Working

```bash
# Test JWT endpoint
curl -X POST https://api.gengobot.com/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test"}'

# Verify JWT_SECRET is set in .env
grep JWT_SECRET /var/www/gengobot/.env
```

---

## Scaling Guide

### Current Setup (Stage 1: 0-10K users)

All subdomains point to single Next.js instance:

```
nginx → Next.js :3000 (handles all: app, api, admin)
```

### Stage 2 (10K-50K users): Separate Processes

Run two Next.js instances on same VPS:

```bash
# Update ecosystem.config.js
pm2 start ecosystem.config.js --name gengobot-web --env production -- start -p 3000
pm2 start ecosystem.config.js --name gengobot-api --env production -- start -p 3001
```

Update nginx to route:

- `app.gengobot.com` → `:3000`
- `api.gengobot.com` → `:3001`

### Stage 3 (50K+ users): Separate Servers

Move API to dedicated VPS:

1. Set up new VPS with PostgreSQL replica
2. Deploy API-only Next.js instance
3. Update DNS: `api.gengobot.com` → New VPS IP
4. Mobile apps continue working without changes!

---

## Quick Reference

### Important Paths

| Path                                  | Description            |
| ------------------------------------- | ---------------------- |
| `/var/www/gengobot`                   | Next.js application    |
| `/var/www/wordpress`                  | WordPress installation |
| `/etc/nginx/sites-available/gengobot` | Nginx config           |
| `~/.pm2/logs/`                        | PM2 logs               |
| `/var/backups/gengobot`               | Database backups       |

### Important URLs

| URL                                      | Purpose                  |
| ---------------------------------------- | ------------------------ |
| `https://gengobot.com`                   | Landing page (WordPress) |
| `https://gengobot.com/wp-admin`          | WordPress admin          |
| `https://app.gengobot.com`               | Next.js web app          |
| `https://api.gengobot.com`               | REST API (mobile + web)  |
| `https://api.gengobot.com/v1/auth/login` | JWT login endpoint       |
| `https://admin.gengobot.com`             | Admin panel              |

### API Endpoints (for mobile apps)

| Endpoint               | Method         | Auth | Purpose           |
| ---------------------- | -------------- | ---- | ----------------- |
| `/v1/auth/login`       | POST           | None | Get JWT tokens    |
| `/v1/auth/register`    | POST           | None | Create account    |
| `/v1/auth/refresh`     | POST           | JWT  | Refresh tokens    |
| `/v1/auth/me`          | GET            | JWT  | Get current user  |
| `/v1/decks`            | GET/POST       | JWT  | List/create decks |
| `/v1/decks/:id`        | GET/PUT/DELETE | JWT  | Deck operations   |
| `/v1/voice/synthesize` | POST           | JWT  | Text-to-speech    |
| `/v1/voice/transcribe` | POST           | JWT  | Speech-to-text    |

### Environment Variables Checklist

**Next.js App (`/var/www/gengobot/.env`):**

- [ ] `DATABASE_URL` - PostgreSQL connection
- [ ] `AUTH_SECRET` - Generate with `openssl rand -base64 32`
- [ ] `JWT_SECRET` - Generate with `openssl rand -base64 32`
- [ ] `NEXTAUTH_URL` - `https://app.gengobot.com`
- [ ] `NEXT_PUBLIC_APP_URL` - `https://app.gengobot.com`
- [ ] `NEXT_PUBLIC_API_URL` - `https://api.gengobot.com`
- [ ] `NEXT_PUBLIC_ADMIN_URL` - `https://admin.gengobot.com`
- [ ] `NEXT_PUBLIC_MAIN_URL` - `https://gengobot.com`
- [ ] `OPENAI_API_KEY`
- [ ] `GOOGLE_CLIENT_ID` & `GOOGLE_CLIENT_SECRET`
- [ ] `MAILJET_API_PUBLIC_KEY` & `MAILJET_API_PRIVATE_KEY`
- [ ] `MIDTRANS_SERVER_KEY_PRODUCTION` & `MIDTRANS_CLIENT_KEY_PRODUCTION`
- [ ] `NODE_ENV=production`

**WordPress (`/var/www/wordpress/wp-config.php`):**

- [ ] `DB_NAME`, `DB_USER`, `DB_PASSWORD`
- [ ] Security keys from WordPress API
- [ ] `FORCE_SSL_ADMIN` = true

---

## Security Checklist

- [ ] All 4 SSL certificates installed and auto-renewing
- [ ] Firewall configured (only SSH + Nginx)
- [ ] Strong passwords for PostgreSQL and MySQL
- [ ] `AUTH_SECRET` and `JWT_SECRET` are unique and secure
- [ ] WordPress xmlrpc.php blocked in nginx
- [ ] Admin subdomain has stricter rate limiting
- [ ] Database backups running daily
- [ ] PM2 configured for auto-restart
