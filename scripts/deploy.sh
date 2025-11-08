#!/bin/bash

#######################################
# GengoBot Deployment Script
#
# Automates deployment process for production VPS
#
# Usage:
#   ./scripts/deploy.sh [command]
#
# Commands:
#   setup     - Initial server setup
#   deploy    - Deploy/update application
#   restart   - Restart application
#   logs      - View application logs
#   status    - Check application status
#   backup    - Backup database
#   rollback  - Rollback to previous version
#######################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
APP_NAME="gengobot"
APP_DIR="/var/www/gengobot"
NGINX_CONFIG="/etc/nginx/sites-available/gengobot"
BACKUP_DIR="/var/backups/gengobot"
LOG_FILE="/var/log/gengobot-deploy.log"

# Functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1" | tee -a "$LOG_FILE"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1" | tee -a "$LOG_FILE"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1" | tee -a "$LOG_FILE"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a "$LOG_FILE"
}

check_root() {
    if [ "$EUID" -eq 0 ]; then
        log_error "Do not run this script as root. Use sudo when needed."
        exit 1
    fi
}

check_command() {
    if ! command -v $1 &> /dev/null; then
        log_error "$1 is not installed. Please install it first."
        exit 1
    fi
}

# Setup command
setup_server() {
    log_info "Starting server setup..."

    # Check if running as non-root
    check_root

    # Update system
    log_info "Updating system packages..."
    sudo apt update && sudo apt upgrade -y

    # Install Node.js
    log_info "Installing Node.js..."
    if ! command -v node &> /dev/null; then
        curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
        sudo apt install -y nodejs
    fi
    log_success "Node.js $(node --version) installed"

    # Install PostgreSQL
    log_info "Installing PostgreSQL..."
    if ! command -v psql &> /dev/null; then
        sudo apt install -y postgresql postgresql-contrib
        sudo systemctl enable postgresql
        sudo systemctl start postgresql
    fi
    log_success "PostgreSQL installed"

    # Setup PostgreSQL database
    log_info "Setting up database..."
    read -p "Enter database password: " -s db_password
    echo
    sudo -u postgres psql << EOF
CREATE DATABASE gengobot;
CREATE USER gengobot_user WITH PASSWORD '$db_password';
GRANT ALL PRIVILEGES ON DATABASE gengobot TO gengobot_user;
ALTER DATABASE gengobot OWNER TO gengobot_user;
\q
EOF
    log_success "Database created"

    # Install PM2
    log_info "Installing PM2..."
    sudo npm install -g pm2
    pm2 startup systemd -u $USER --hp $HOME
    log_success "PM2 installed"

    # Install Nginx
    log_info "Installing Nginx..."
    if ! command -v nginx &> /dev/null; then
        sudo apt install -y nginx
        sudo systemctl enable nginx
        sudo systemctl start nginx
    fi
    log_success "Nginx installed"

    # Configure firewall
    log_info "Configuring firewall..."
    sudo ufw allow OpenSSH
    sudo ufw allow 'Nginx Full'
    sudo ufw --force enable
    log_success "Firewall configured"

    # Create application directory
    log_info "Creating application directory..."
    sudo mkdir -p "$APP_DIR"
    sudo chown -R $USER:$USER "$APP_DIR"

    # Create backup directory
    sudo mkdir -p "$BACKUP_DIR"
    sudo chown -R $USER:$USER "$BACKUP_DIR"

    log_success "Server setup completed!"
    log_info "Next steps:"
    echo "1. Clone repository to $APP_DIR"
    echo "2. Configure .env file"
    echo "3. Run: ./scripts/deploy.sh deploy"
}

# Deploy command
deploy_app() {
    log_info "Starting deployment..."

    cd "$APP_DIR" || exit 1

    # Backup current version
    log_info "Creating backup..."
    backup_database

    # Pull latest changes
    log_info "Pulling latest changes..."
    git fetch origin
    git checkout main
    git pull origin main

    # Install dependencies
    log_info "Installing dependencies..."
    npm ci --only=production

    # Generate Prisma client
    log_info "Generating Prisma client..."
    npm run db:generate

    # Run migrations
    log_info "Running database migrations..."
    npm run db:migrate

    # Build application
    log_info "Building application..."
    npm run build

    # Restart application
    log_info "Restarting application..."
    if pm2 list | grep -q "$APP_NAME"; then
        pm2 restart "$APP_NAME"
    else
        pm2 start ecosystem.config.js
        pm2 save
    fi

    # Wait for application to start
    sleep 5

    # Check application status
    if pm2 list | grep -q "$APP_NAME.*online"; then
        log_success "Deployment completed successfully!"
        log_info "Application is running on port 3000"
    else
        log_error "Deployment failed! Check logs with: pm2 logs $APP_NAME"
        exit 1
    fi
}

# Restart command
restart_app() {
    log_info "Restarting application..."
    pm2 restart "$APP_NAME"
    log_success "Application restarted"
}

# Logs command
show_logs() {
    log_info "Showing application logs..."
    pm2 logs "$APP_NAME" --lines 100
}

# Status command
show_status() {
    log_info "Application status:"
    pm2 status "$APP_NAME"
    echo
    log_info "System resources:"
    pm2 monit "$APP_NAME" --lines 20
}

# Backup command
backup_database() {
    log_info "Creating database backup..."
    TIMESTAMP=$(date +%Y%m%d_%H%M%S)
    BACKUP_FILE="$BACKUP_DIR/${APP_NAME}_${TIMESTAMP}.sql.gz"

    # Get database credentials from .env
    if [ -f "$APP_DIR/.env" ]; then
        DB_URL=$(grep DATABASE_URL "$APP_DIR/.env" | cut -d '=' -f2-)
        pg_dump "$DB_URL" | gzip > "$BACKUP_FILE"
        log_success "Database backed up to: $BACKUP_FILE"

        # Keep only last 7 backups
        find "$BACKUP_DIR" -name "${APP_NAME}_*.sql.gz" -mtime +7 -delete
    else
        log_error ".env file not found"
        exit 1
    fi
}

# Rollback command
rollback_deployment() {
    log_warning "Rolling back deployment..."

    cd "$APP_DIR" || exit 1

    # Show recent commits
    log_info "Recent commits:"
    git log --oneline -5

    # Ask for commit hash
    read -p "Enter commit hash to rollback to: " commit_hash

    if [ -z "$commit_hash" ]; then
        log_error "Commit hash is required"
        exit 1
    fi

    # Backup before rollback
    backup_database

    # Checkout commit
    git checkout "$commit_hash"

    # Reinstall dependencies
    npm ci --only=production

    # Rebuild
    npm run build

    # Restart
    pm2 restart "$APP_NAME"

    log_success "Rollback completed to commit: $commit_hash"
}

# SSL Setup command
setup_ssl() {
    log_info "Setting up SSL certificate..."

    # Check if domain is configured
    read -p "Enter your domain name: " domain

    if [ -z "$domain" ]; then
        log_error "Domain name is required"
        exit 1
    fi

    # Install Certbot
    log_info "Installing Certbot..."
    sudo apt install -y certbot python3-certbot-nginx

    # Obtain certificate
    log_info "Obtaining SSL certificate for $domain..."
    sudo certbot --nginx -d "$domain" -d "www.$domain"

    log_success "SSL certificate installed!"
    log_info "Certificate will auto-renew. Test renewal with: sudo certbot renew --dry-run"
}

# Health check command
health_check() {
    log_info "Running health check..."

    # Check if application is running
    if pm2 list | grep -q "$APP_NAME.*online"; then
        log_success "Application: RUNNING"
    else
        log_error "Application: NOT RUNNING"
        return 1
    fi

    # Check Nginx
    if sudo systemctl is-active --quiet nginx; then
        log_success "Nginx: RUNNING"
    else
        log_error "Nginx: NOT RUNNING"
        return 1
    fi

    # Check PostgreSQL
    if sudo systemctl is-active --quiet postgresql; then
        log_success "PostgreSQL: RUNNING"
    else
        log_error "PostgreSQL: NOT RUNNING"
        return 1
    fi

    # Check disk space
    DISK_USAGE=$(df -h / | awk 'NR==2 {print $5}' | sed 's/%//')
    if [ "$DISK_USAGE" -lt 80 ]; then
        log_success "Disk usage: ${DISK_USAGE}%"
    else
        log_warning "Disk usage: ${DISK_USAGE}% - Consider cleaning up"
    fi

    # Check memory
    MEM_USAGE=$(free | grep Mem | awk '{print int($3/$2 * 100)}')
    if [ "$MEM_USAGE" -lt 80 ]; then
        log_success "Memory usage: ${MEM_USAGE}%"
    else
        log_warning "Memory usage: ${MEM_USAGE}% - Consider increasing memory"
    fi

    log_success "Health check completed!"
}

# Main command handler
case "${1:-help}" in
    setup)
        setup_server
        ;;
    deploy)
        deploy_app
        ;;
    restart)
        restart_app
        ;;
    logs)
        show_logs
        ;;
    status)
        show_status
        ;;
    backup)
        backup_database
        ;;
    rollback)
        rollback_deployment
        ;;
    ssl)
        setup_ssl
        ;;
    health)
        health_check
        ;;
    *)
        echo "GengoBot Deployment Script"
        echo
        echo "Usage: $0 [command]"
        echo
        echo "Commands:"
        echo "  setup     - Initial server setup"
        echo "  deploy    - Deploy/update application"
        echo "  restart   - Restart application"
        echo "  logs      - View application logs"
        echo "  status    - Check application status"
        echo "  backup    - Backup database"
        echo "  rollback  - Rollback to previous version"
        echo "  ssl       - Setup SSL certificate"
        echo "  health    - Run health check"
        echo
        exit 1
        ;;
esac
