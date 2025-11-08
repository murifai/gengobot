# Quick Start Deployment Guide

Fast-track deployment guide for GengoBot on Ubuntu VPS.

## Prerequisites Checklist

- [ ] Ubuntu Server 20.04+ with root/sudo access
- [ ] Domain name pointed to VPS IP address
- [ ] OpenAI API key
- [ ] GitHub access to clone repository

## Step-by-Step Deployment

### 1. Initial Server Setup (5-10 minutes)

SSH into your server:
```bash
ssh your_username@your_vps_ip
```

Clone the repository:
```bash
cd ~
git clone https://github.com/murifai/gengobotnew.git
cd gengobotnew
```

Run automated setup:
```bash
chmod +x scripts/deploy.sh
./scripts/deploy.sh setup
```

This will install:
- Node.js 18.x
- PostgreSQL
- PM2 (process manager)
- Nginx (web server)
- Configure firewall

### 2. Configure Application (2-3 minutes)

Navigate to application directory:
```bash
cd /var/www/gengobot
```

Copy and edit environment file:
```bash
cp .env.example .env
nano .env
```

**Required environment variables:**
```env
# Database (created during setup)
DATABASE_URL="postgresql://gengobot_user:YOUR_DB_PASSWORD@localhost:5432/gengobot"

# NextAuth - IMPORTANT: Generate secure secret
NEXTAUTH_URL="https://yourdomain.com"
NEXTAUTH_SECRET="your_generated_secret_here"

# OpenAI
OPENAI_API_KEY="sk-your-openai-api-key"

# App
NODE_ENV="production"
PORT=3000
```

Generate `NEXTAUTH_SECRET`:
```bash
openssl rand -base64 32
```

### 3. Configure Nginx (2 minutes)

Copy Nginx configuration:
```bash
sudo cp docs/deployment/nginx.conf /etc/nginx/sites-available/gengobot
```

Edit configuration with your domain:
```bash
sudo nano /etc/nginx/sites-available/gengobot
# Replace 'yourdomain.com' with your actual domain
```

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/gengobot /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 4. Deploy Application (3-5 minutes)

Run deployment script:
```bash
./scripts/deploy.sh deploy
```

This will:
- Install dependencies
- Generate Prisma client
- Run database migrations
- Build Next.js app
- Start with PM2

### 5. Setup SSL Certificate (2 minutes)

Run SSL setup:
```bash
./scripts/deploy.sh ssl
```

Enter your domain when prompted. Certbot will:
- Install SSL certificate
- Configure Nginx for HTTPS
- Setup auto-renewal

### 6. Create Admin User (1 minute)

```bash
cd /var/www/gengobot
npx ts-node scripts/create-nextauth-user.ts
```

Follow prompts to create your admin account.

### 7. Verify Deployment

Check application status:
```bash
./scripts/deploy.sh status
```

Run health check:
```bash
./scripts/deploy.sh health
```

Visit your domain:
```
https://yourdomain.com
```

## Post-Deployment

### View Logs
```bash
pm2 logs gengobot
# or
./scripts/deploy.sh logs
```

### Restart Application
```bash
./scripts/deploy.sh restart
```

### Update Application
```bash
cd /var/www/gengobot
git pull origin main
./scripts/deploy.sh deploy
```

### Backup Database
```bash
./scripts/deploy.sh backup
```

## Common Issues

### Application won't start
```bash
# Check logs
pm2 logs gengobot --lines 100

# Check environment variables
cat .env

# Verify database connection
psql -U gengobot_user -d gengobot -h localhost
```

### Nginx errors
```bash
# Test configuration
sudo nginx -t

# Check error logs
sudo tail -f /var/log/nginx/error.log

# Restart Nginx
sudo systemctl restart nginx
```

### SSL certificate issues
```bash
# Test renewal
sudo certbot renew --dry-run

# Force renewal
sudo certbot renew --force-renewal
```

### Database connection errors
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Verify database exists
sudo -u postgres psql -l

# Test connection
psql "postgresql://gengobot_user:PASSWORD@localhost:5432/gengobot"
```

## Quick Commands Reference

```bash
# Application
pm2 restart gengobot          # Restart app
pm2 logs gengobot             # View logs
pm2 monit                     # Monitor resources
pm2 stop gengobot             # Stop app
pm2 start gengobot            # Start app

# Nginx
sudo systemctl reload nginx   # Reload config
sudo systemctl restart nginx  # Restart Nginx
sudo nginx -t                 # Test config

# Database
npm run db:migrate            # Run migrations
npm run db:seed              # Seed data
./scripts/deploy.sh backup   # Backup DB

# SSL
sudo certbot renew           # Renew certificate
sudo certbot certificates    # List certificates

# Deployment
./scripts/deploy.sh deploy   # Deploy update
./scripts/deploy.sh rollback # Rollback
./scripts/deploy.sh health   # Health check
```

## Security Checklist

- [ ] Strong database password set
- [ ] `NEXTAUTH_SECRET` is randomly generated
- [ ] Firewall enabled (UFW)
- [ ] SSL certificate installed
- [ ] Environment variables not committed to git
- [ ] Regular backups configured
- [ ] System packages updated

## Performance Tips

1. **Enable PM2 cluster mode** for better performance:
   ```bash
   # Edit ecosystem.config.js
   instances: 'max',
   exec_mode: 'cluster'
   ```

2. **Monitor resources**:
   ```bash
   htop           # CPU/Memory
   pm2 monit      # Application
   ```

3. **Optimize database**:
   ```bash
   # Add to crontab for weekly optimization
   0 2 * * 0 psql -U gengobot_user -d gengobot -c 'VACUUM ANALYZE;'
   ```

## Monitoring Setup

### Setup automated backups
```bash
# Edit crontab
crontab -e

# Add daily backup at 2 AM
0 2 * * * /var/www/gengobot/scripts/deploy.sh backup
```

### Setup log rotation
```bash
# PM2 logs are auto-rotated
# For custom logs:
sudo nano /etc/logrotate.d/gengobot
```

## Getting Help

- Check [Full Deployment Guide](./VPS_DEPLOYMENT_GUIDE.md)
- View application logs: `pm2 logs gengobot`
- Check Nginx logs: `sudo tail -f /var/log/nginx/error.log`
- Health check: `./scripts/deploy.sh health`

## Next Steps

1. Configure automatic backups
2. Setup monitoring (optional: PM2 Plus)
3. Configure email notifications
4. Setup CDN for static assets (optional)
5. Enable application analytics
