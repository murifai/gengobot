# Production Deployment Guide - GengoBot

## Overview

This document provides instructions for deploying GengoBot to production.

## Prerequisites

- Node.js 18+
- PostgreSQL database (with connection string)
- Midtrans account (for payment processing)
- OpenAI API key
- Google OAuth credentials (optional, for social login)

## Environment Variables

Create `.env` file based on `.env.example`:

```bash
# Database
DATABASE_URL="postgresql://..."

# Authentication
AUTH_SECRET="your-auth-secret-key"
NEXTAUTH_URL="https://your-domain.com"

# OAuth (optional)
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."

# OpenAI
OPENAI_API_KEY="sk-..."

# Midtrans Payment Gateway
MIDTRANS_SERVER_KEY="..."
MIDTRANS_CLIENT_KEY="..."
MIDTRANS_IS_PRODUCTION="true"
MIDTRANS_MERCHANT_ID="..."

# Application
NEXT_PUBLIC_APP_URL="https://your-domain.com"
```

## Database Setup

1. Run Prisma migrations:

```bash
npx prisma migrate deploy
```

2. Generate Prisma client:

```bash
npx prisma generate
```

## Build & Deploy

### Option 1: Standard Deployment (Vercel, Railway, etc.)

1. Connect your repository to the platform
2. Set environment variables
3. Deploy with default settings

### Option 2: Docker Deployment

```dockerfile
# Build stage
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx prisma generate
RUN npm run build

# Production stage
FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
EXPOSE 3000
CMD ["node", "server.js"]
```

### Option 3: Manual Server Deployment

```bash
# Install dependencies
npm ci --production=false

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# Build application
npm run build

# Start production server
npm run start
```

## Post-Deployment Checklist

### 1. Database Migrations

- [ ] All migrations applied successfully
- [ ] Database indices created

### 2. Environment Variables

- [ ] All required env vars set
- [ ] `MIDTRANS_IS_PRODUCTION=true` for production payments
- [ ] `NEXTAUTH_URL` matches actual domain

### 3. Payment Gateway

- [ ] Midtrans production credentials configured
- [ ] Webhook URL configured in Midtrans dashboard: `https://your-domain.com/api/payment/webhook`
- [ ] Test transaction successful

### 4. Scheduled Tasks (Cron Jobs)

Set up cron job for processing scheduled tier changes:

```bash
# Run daily at midnight
0 0 * * * curl -X POST https://your-domain.com/api/cron/process-scheduled-tier-changes -H "Authorization: Bearer YOUR_CRON_SECRET"
```

### 5. Monitoring

- [ ] Error tracking configured (Sentry, etc.)
- [ ] Performance monitoring active
- [ ] Database connection pool sized appropriately

## Recent Changes Summary (November 2024)

### New Features

- **Payment System Enhancements**: Improved Midtrans integration with tier change scheduling
- **Subscription Management**: Cancel, upgrade/downgrade with proration
- **Billing Page**: View payment history and manage subscription
- **Dictionary Lookup**: Vocabulary lookup with EN-ID translations
- **Active Time Tracking**: Calculate actual conversation time from chat history

### API Endpoints Added

- `POST /api/subscription/cancel` - Cancel subscription
- `POST /api/subscription/validate-change` - Validate tier changes
- `GET /api/subscription/plans` - Get available plans
- `GET /api/subscription/pricing` - Get pricing details
- `GET /api/subscription/usage-chart` - Get usage statistics
- `GET /api/payment/latest` - Get latest payment
- `GET /api/vocabulary/lookup` - Dictionary lookup
- `POST /api/vocabulary/add-to-deck` - Add word to deck
- `POST /api/cron/process-scheduled-tier-changes` - Process tier changes

### Database Schema Changes

- Added fields for subscription tier scheduling
- Added voucher and billing related fields

### Breaking Changes

- Removed `activeMinutes` and `lastActivityAt` fields from schema (calculated on-demand now)

## Rollback Procedure

If deployment fails:

1. Revert to previous commit:

```bash
git revert HEAD~N  # N = number of commits to revert
git push origin main
```

2. Rollback database (if needed):

```bash
npx prisma migrate reset --skip-seed
# Or restore from backup
```

## Support

For issues, create a ticket at: https://github.com/murifai/gengobot/issues
