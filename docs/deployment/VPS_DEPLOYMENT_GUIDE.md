# VPS Deployment Guide

Complete guide for deploying GengoBot to Ubuntu VPS with domain configuration.

## Prerequisites

- Ubuntu Server (20.04 LTS or higher)
- Domain name pointed to your VPS IP
- Root or sudo access to the server
- Node.js 18+ and npm installed
- PostgreSQL installed

## Server Setup

### 1. Initial Server Configuration

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install required packages
sudo apt install -y curl git build-essential

# Install Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node --version
npm --version
```

### 2. Install PostgreSQL

```bash
# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Start and enable PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database and user
sudo -u postgres psql << EOF
CREATE DATABASE gengobot;
CREATE USER gengobot_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE gengobot TO gengobot_user;
ALTER DATABASE gengobot OWNER TO gengobot_user;
\q
EOF
```

### 3. Install PM2 (Process Manager)

```bash
# Install PM2 globally
sudo npm install -g pm2

# Configure PM2 to start on boot
pm2 startup systemd
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u $USER --hp /home/$USER
```

### 4. Install and Configure Nginx

```bash
# Install Nginx
sudo apt install -y nginx

# Enable and start Nginx
sudo systemctl enable nginx
sudo systemctl start nginx

# Allow Nginx through firewall
sudo ufw allow 'Nginx Full'
sudo ufw allow OpenSSH
sudo ufw enable
```

## Application Deployment

### 1. Clone Repository

```bash
# Create application directory
sudo mkdir -p /var/www
cd /var/www

# Clone repository
sudo git clone https://github.com/murifai/gengobotnew.git gengobot
cd gengobot

# Set proper permissions
sudo chown -R $USER:$USER /var/www/gengobot
```

### 2. Configure Environment

```bash
# Copy environment example
cp .env.example .env

# Edit environment file
nano .env
```

Update `.env` with production values:

```env
# Database
DATABASE_URL="postgresql://gengobot_user:your_secure_password@localhost:5432/gengobot"

# NextAuth
NEXTAUTH_URL="https://yourdomain.com"
NEXTAUTH_SECRET="generate_with_openssl_rand_base64_32"

# OpenAI
OPENAI_API_KEY="your_openai_api_key"

# Application
NODE_ENV="production"
PORT=3000
```

Generate `NEXTAUTH_SECRET`:
```bash
openssl rand -base64 32
```

### 3. Install Dependencies and Build

```bash
# Install dependencies
npm ci --only=production

# Generate Prisma client
npm run db:generate

# Run database migrations
npm run db:migrate

# Build application
npm run build
```

### 4. Database Initialization

```bash
# Seed initial data (if needed)
npm run db:seed

# Create admin user
npx ts-node scripts/create-nextauth-user.ts
```

### 5. Configure PM2

Use the provided `ecosystem.config.js` file (created below).

```bash
# Start application with PM2
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Check application status
pm2 status
pm2 logs gengobot
```

### 6. Configure Nginx

Use the provided Nginx configuration (created below).

```bash
# Create Nginx configuration
sudo nano /etc/nginx/sites-available/gengobot

# Enable the site
sudo ln -s /etc/nginx/sites-available/gengobot /etc/nginx/sites-enabled/

# Test Nginx configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

## SSL Certificate Setup

### Install Certbot

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtain SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Certbot will automatically configure Nginx for HTTPS
# Certificate auto-renewal is enabled by default
```

## Monitoring and Maintenance

### PM2 Commands

```bash
# View logs
pm2 logs gengobot

# Monitor resources
pm2 monit

# Restart application
pm2 restart gengobot

# Stop application
pm2 stop gengobot

# View detailed info
pm2 info gengobot
```

### Application Updates

```bash
# Navigate to application directory
cd /var/www/gengobot

# Pull latest changes
git pull origin main

# Install dependencies
npm ci --only=production

# Run migrations
npm run db:migrate

# Rebuild application
npm run build

# Restart with PM2
pm2 restart gengobot
```

### Database Backups

```bash
# Create backup script
sudo nano /usr/local/bin/backup-gengobot-db.sh
```

Add backup script:
```bash
#!/bin/bash
BACKUP_DIR="/var/backups/gengobot"
mkdir -p $BACKUP_DIR
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump -U gengobot_user gengobot | gzip > $BACKUP_DIR/gengobot_$DATE.sql.gz
find $BACKUP_DIR -name "gengobot_*.sql.gz" -mtime +7 -delete
```

Make executable and add to cron:
```bash
sudo chmod +x /usr/local/bin/backup-gengobot-db.sh
sudo crontab -e
# Add: 0 2 * * * /usr/local/bin/backup-gengobot-db.sh
```

## Security Best Practices

### 1. Firewall Configuration

```bash
# Allow only necessary ports
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow http
sudo ufw allow https
sudo ufw enable
```

### 2. PostgreSQL Security

```bash
# Edit PostgreSQL configuration
sudo nano /etc/postgresql/*/main/pg_hba.conf

# Ensure local connections use password authentication
# Change 'peer' to 'md5' for local connections
```

### 3. Environment Security

- Never commit `.env` to version control
- Use strong passwords for database
- Rotate `NEXTAUTH_SECRET` periodically
- Keep API keys secure and rotated

### 4. Regular Updates

```bash
# Update system packages regularly
sudo apt update && sudo apt upgrade -y

# Update Node.js packages
npm audit fix
```

## Troubleshooting

### Application Won't Start

```bash
# Check PM2 logs
pm2 logs gengobot --lines 100

# Check for port conflicts
sudo lsof -i :3000

# Verify environment variables
pm2 env gengobot
```

### Database Connection Issues

```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Test database connection
psql -U gengobot_user -d gengobot -h localhost
```

### Nginx Issues

```bash
# Check Nginx status
sudo systemctl status nginx

# Test configuration
sudo nginx -t

# View error logs
sudo tail -f /var/log/nginx/error.log
```

### SSL Certificate Issues

```bash
# Renew certificate manually
sudo certbot renew

# Test renewal
sudo certbot renew --dry-run
```

## Performance Optimization

### 1. Enable Nginx Caching

Add to Nginx configuration:
```nginx
# Cache static assets
location /_next/static {
    expires 365d;
    add_header Cache-Control "public, immutable";
}
```

### 2. Enable Compression

Already included in the Nginx config below with gzip settings.

### 3. PM2 Cluster Mode

For better performance, use cluster mode in `ecosystem.config.js`:
```javascript
instances: 'max', // Use all CPU cores
exec_mode: 'cluster'
```

## Monitoring Setup

### Install PM2 Monitoring (Optional)

```bash
# Link PM2 to monitoring service
pm2 link [secret_key] [public_key]
```

### Set Up Basic Monitoring

```bash
# Install monitoring tools
sudo apt install -y htop iotop

# Monitor system resources
htop

# Monitor disk I/O
sudo iotop
```

## Quick Reference

### Important Paths

- Application: `/var/www/gengobot`
- Nginx config: `/etc/nginx/sites-available/gengobot`
- PM2 logs: `~/.pm2/logs/`
- Database backups: `/var/backups/gengobot`

### Important Commands

```bash
# Application
pm2 restart gengobot
pm2 logs gengobot
pm2 monit

# Nginx
sudo systemctl reload nginx
sudo nginx -t

# Database
sudo -u postgres psql gengobot
npm run db:migrate

# SSL
sudo certbot renew
```

## Support and Additional Resources

- [Next.js Deployment Documentation](https://nextjs.org/docs/deployment)
- [PM2 Documentation](https://pm2.keymetrics.io/docs/usage/quick-start/)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
