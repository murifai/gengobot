# Plan: Subdomain Architecture & Mobile-Ready API

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                      Single VPS (Contabo)                       │
├─────────────────────────────────────────────────────────────────┤
│                           Nginx                                 │
│  ├── gengobot.com       → WordPress (PHP-FPM)                  │
│  ├── app.gengobot.com   → Next.js :3000 (Web UI)               │
│  ├── api.gengobot.com   → Next.js :3000 (API routes)           │
│  └── admin.gengobot.com → Next.js :3000 (Admin UI)             │
├─────────────────────────────────────────────────────────────────┤
│                    Next.js Application                          │
│  ├── src/app/(app)/*         → Web UI routes                   │
│  ├── src/app/(admin)/*       → Admin UI routes                 │
│  ├── src/app/api/v1/*        → Versioned API (JWT, mobile)     │
│  └── src/app/api/*           → Legacy API (session, web)       │
├─────────────────────────────────────────────────────────────────┤
│                PostgreSQL  │  Redis (future)                    │
└─────────────────────────────────────────────────────────────────┘
          │                    │                    │
          ▼                    ▼                    ▼
    ┌──────────┐        ┌──────────┐        ┌──────────┐
    │  Web App │        │ iOS App  │        │ Android  │
    │ (Browser)│        │ (Future) │        │ (Future) │
    └──────────┘        └──────────┘        └──────────┘
```

## Subdomain Structure

| Domain               | Purpose                         | Technology | Auth           |
| -------------------- | ------------------------------- | ---------- | -------------- |
| `gengobot.com`       | Landing, blog, changelog, legal | WordPress  | None           |
| `app.gengobot.com`   | User web application            | Next.js    | Session        |
| `api.gengobot.com`   | REST API for all clients        | Next.js    | JWT + Session  |
| `admin.gengobot.com` | Admin panel                     | Next.js    | Session + Role |

---

## Part 1: Route Restructure (Remove `/app/` prefix) ✅ DONE

### Problem

Current URL structure with subdomain:

| Current Path | Resulting URL                | Issue            |
| ------------ | ---------------------------- | ---------------- |
| `/app/drill` | `app.gengobot.com/app/drill` | Redundant `/app` |
| `/app/kaiwa` | `app.gengobot.com/app/kaiwa` | Redundant `/app` |

### Target URL Structure

#### app.gengobot.com (User Application)

| Feature     | Before             | After          |
| ----------- | ------------------ | -------------- |
| Dashboard   | `/app`             | `/`            |
| Drill       | `/app/drill`       | `/drill`       |
| Kaiwa       | `/app/kaiwa`       | `/kaiwa`       |
| Ujian       | `/app/ujian`       | `/ujian`       |
| Profile     | `/app/profile`     | `/profile`     |
| Onboarding  | `/app/onboarding`  | `/onboarding`  |
| Settings    | `/app/settings`    | `/settings`    |
| Payment     | `/app/payment/*`   | `/payment/*`   |
| Choose Plan | `/app/choose-plan` | `/choose-plan` |

#### api.gengobot.com (REST API)

| Endpoint            | Purpose          | Auth |
| ------------------- | ---------------- | ---- |
| `/v1/auth/login`    | Login, get JWT   | None |
| `/v1/auth/register` | Register         | None |
| `/v1/auth/refresh`  | Refresh token    | JWT  |
| `/v1/auth/me`       | Get current user | JWT  |
| `/v1/decks/*`       | Deck operations  | JWT  |
| `/v1/kaiwa/*`       | Conversation API | JWT  |
| `/v1/voice/*`       | TTS/STT          | JWT  |
| `/v1/stats/*`       | User statistics  | JWT  |

#### admin.gengobot.com (Admin Panel)

| Feature   | URL                            |
| --------- | ------------------------------ |
| Dashboard | `admin.gengobot.com/`          |
| Users     | `admin.gengobot.com/users`     |
| Analytics | `admin.gengobot.com/analytics` |

#### gengobot.com (WordPress)

| Page      | URL                             |
| --------- | ------------------------------- |
| Landing   | `gengobot.com/`                 |
| Blog      | `gengobot.com/blog`             |
| Changelog | `gengobot.com/changelog`        |
| Privacy   | `gengobot.com/privacy-policy`   |
| Terms     | `gengobot.com/terms-of-service` |

---

## Part 2: Directory Structure ✅ DONE

### Current Structure

```
src/app/
├── page.tsx                    # Landing (→ WordPress)
├── HomePage.tsx                # Landing component (→ DELETE)
├── layout.tsx                  # Root layout
├── login/                      # Auth pages
├── admin/                      # Admin panel
├── api/                        # API routes (no versioning)
├── privacypolicy/              # Legal (→ WordPress)
├── termsofservice/             # Legal (→ WordPress)
└── app/                        # USER APP (redundant /app/)
    ├── page.tsx
    ├── layout.tsx
    ├── drill/
    ├── kaiwa/
    └── ...
```

### Target Structure

```
src/app/
├── page.tsx                    # Redirect to dashboard or login
├── layout.tsx                  # Root layout
├── globals.css
│
├── (app)/                      # Route group - Web UI (no /app/ in URL)
│   ├── layout.tsx              # Auth guard + nav
│   ├── layout-client.tsx       # Client nav component
│   ├── page.tsx                # Dashboard (/)
│   ├── drill/                  # /drill
│   ├── kaiwa/                  # /kaiwa
│   ├── ujian/                  # /ujian
│   ├── profile/                # /profile
│   ├── settings/               # /settings
│   ├── choose-plan/            # /choose-plan
│   ├── onboarding/             # /onboarding
│   └── payment/                # /payment/*
│
├── (admin)/                    # Route group - Admin UI
│   ├── layout.tsx              # Admin auth + role guard
│   └── admin/                  # /admin/*
│
├── (auth)/                     # Route group - Auth pages
│   └── login/                  # /login
│
├── api/                        # Legacy API (session auth, web only)
│   ├── auth/                   # NextAuth routes
│   ├── decks/
│   ├── kaiwa/
│   ├── voice/
│   └── webhooks/
│
└── api/v1/                     # Versioned API (JWT auth, mobile-ready)
    ├── auth/
    │   ├── login/route.ts      # POST /v1/auth/login
    │   ├── register/route.ts   # POST /v1/auth/register
    │   ├── refresh/route.ts    # POST /v1/auth/refresh
    │   └── me/route.ts         # GET /v1/auth/me
    ├── decks/
    │   ├── route.ts            # GET/POST /v1/decks
    │   └── [deckId]/route.ts   # GET/PUT/DELETE /v1/decks/:id
    ├── kaiwa/
    │   └── ...
    ├── voice/
    │   ├── synthesize/route.ts # POST /v1/voice/synthesize
    │   └── transcribe/route.ts # POST /v1/voice/transcribe
    └── stats/
        └── ...
```

---

## Part 3: Migration Phases ✅ DONE

### Phase 1: Create Git Branch

```bash
# Create restructure branch (keeps main safe)
git checkout -b restructure/subdomain-architecture

# All work happens on this branch
# Main stays deployable for hotfixes
```

### Phase 2: Directory Migration

```bash
# Step 1: Create route group directories
mkdir -p "src/app/(app)"
mkdir -p "src/app/(admin)"
mkdir -p "src/app/(auth)"
mkdir -p "src/app/api/v1/auth"
mkdir -p "src/app/api/v1/decks"
mkdir -p "src/app/api/v1/kaiwa"
mkdir -p "src/app/api/v1/voice"
mkdir -p "src/app/api/v1/stats"

# Step 2: Move app routes to (app) route group
mv src/app/app/drill src/app/(app)/drill
mv src/app/app/kaiwa src/app/(app)/kaiwa
mv src/app/app/ujian src/app/(app)/ujian
mv src/app/app/profile src/app/(app)/profile
mv src/app/app/settings src/app/(app)/settings
mv src/app/app/choose-plan src/app/(app)/choose-plan
mv src/app/app/onboarding src/app/(app)/onboarding
mv src/app/app/payment src/app/(app)/payment

# Step 3: Move layout files
mv src/app/app/layout.tsx src/app/(app)/layout.tsx
mv src/app/app/layout-client.tsx src/app/(app)/layout-client.tsx
mv src/app/app/page.tsx src/app/(app)/page.tsx

# Step 4: Move admin to route group
mv src/app/admin src/app/(admin)/admin

# Step 5: Move login to auth route group
mv src/app/login src/app/(auth)/login

# Step 6: Cleanup
rm -rf src/app/app
rm -rf src/app/privacypolicy
rm -rf src/app/termsofservice
rm -f src/app/HomePage.tsx
```

### Phase 3: Update Root page.tsx

Replace `src/app/page.tsx`:

```tsx
import { auth } from '@/lib/auth/auth';
import { redirect } from 'next/navigation';

export default async function RootPage() {
  const session = await auth();

  if (session?.user) {
    // Authenticated: show dashboard
    // The (app) route group handles this
    return null;
  }

  // Not authenticated: redirect to login
  redirect('/login');
}
```

### Phase 4: Update Middleware

Replace `src/middleware.ts`:

```tsx
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Protected routes (require auth)
const protectedRoutes = [
  '/drill',
  '/kaiwa',
  '/ujian',
  '/profile',
  '/onboarding',
  '/settings',
  '/payment',
  '/choose-plan',
];

// Public routes
const publicRoutes = [
  '/login',
  '/auth',
  '/api/auth',
  '/api/v1/auth/login',
  '/api/v1/auth/register',
  '/api/webhooks',
  '/extension',
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Allow static files
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/images') ||
    pathname.startsWith('/fonts')
  ) {
    return NextResponse.next();
  }

  // Legacy redirect: /app/* → /*
  if (pathname.startsWith('/app/')) {
    const newPath = pathname.replace('/app', '') || '/';
    return NextResponse.redirect(new URL(newPath, request.url));
  }
  if (pathname === '/app') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // API v1 routes: JWT auth handled in route handlers
  if (pathname.startsWith('/api/v1/')) {
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|images|fonts).*)'],
};
```

### Phase 5: Update Hardcoded Routes

Files requiring `/app/` → `/` route updates:

| File                                                   | Change                      |
| ------------------------------------------------------ | --------------------------- |
| `src/app/(app)/layout-client.tsx`                      | `/app/*` → `/*`             |
| `src/app/(app)/drill/decks/[deckId]/page.tsx`          | `/app/drill` → `/drill`     |
| `src/app/(app)/kaiwa/page.tsx`                         | `/app/kaiwa` → `/kaiwa`     |
| `src/app/(app)/kaiwa/bebas/FreeConversationClient.tsx` | `/app/kaiwa` → `/kaiwa`     |
| `src/app/(app)/payment/*/page.tsx`                     | `/app/*` → `/*`             |
| `src/components/app/dashboard/AppDashboard.tsx`        | `/app/*` → `/*`             |
| `src/components/app/profile/*.tsx`                     | `/app/profile` → `/profile` |
| `src/components/deck/DeckBrowser.tsx`                  | `/app/drill` → `/drill`     |
| `src/components/kaiwa/bebas/empty-character-state.tsx` | `/app/profile` → `/profile` |
| `src/lib/auth/config.ts`                               | Update callbacks            |

Search command:

```bash
grep -r '"/app/' src/ --include="*.tsx" --include="*.ts" | grep -v node_modules
```

---

## Part 4: API Versioning & JWT Auth ✅ DONE

### Create JWT Utilities

Create `src/lib/auth/jwt.ts`:

```tsx
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_EXPIRES_IN = '7d';
const JWT_REFRESH_EXPIRES_IN = '30d';

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
}

export function signAccessToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function signRefreshToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_REFRESH_EXPIRES_IN });
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch {
    return null;
  }
}

export function getTokenFromHeader(authHeader: string | null): string | null {
  if (!authHeader?.startsWith('Bearer ')) return null;
  return authHeader.slice(7);
}
```

### Create API Auth Middleware

Create `src/lib/auth/api-auth.ts`:

```tsx
import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, getTokenFromHeader, JWTPayload } from './jwt';
import { auth } from './auth';

export type AuthResult =
  | { success: true; user: JWTPayload; authType: 'jwt' | 'session' }
  | { success: false; error: string };

export async function authenticateRequest(request: NextRequest): Promise<AuthResult> {
  // Try JWT first (mobile/API clients)
  const authHeader = request.headers.get('authorization');
  const token = getTokenFromHeader(authHeader);

  if (token) {
    const payload = verifyToken(token);
    if (payload) {
      return { success: true, user: payload, authType: 'jwt' };
    }
    return { success: false, error: 'Invalid or expired token' };
  }

  // Fall back to session auth (web client)
  const session = await auth();
  if (session?.user) {
    return {
      success: true,
      user: {
        userId: session.user.id!,
        email: session.user.email!,
        role: session.user.role || 'USER',
      },
      authType: 'session',
    };
  }

  return { success: false, error: 'Authentication required' };
}

export function unauthorizedResponse(message: string = 'Unauthorized') {
  return NextResponse.json({ error: message }, { status: 401 });
}
```

### Create V1 Auth Routes

Create `src/app/api/v1/auth/login/route.ts`:

```tsx
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { compare } from 'bcryptjs';
import { signAccessToken, signRefreshToken } from '@/lib/auth/jwt';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        password: true,
        role: true,
        name: true,
      },
    });

    if (!user || !user.password) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const isValid = await compare(password, user.password);
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error('[API v1] Login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

Create `src/app/api/v1/auth/me/route.ts`:

```tsx
import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest, unauthorizedResponse } from '@/lib/auth/api-auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const authResult = await authenticateRequest(request);

  if (!authResult.success) {
    return unauthorizedResponse(authResult.error);
  }

  const user = await prisma.user.findUnique({
    where: { id: authResult.user.userId },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      image: true,
      createdAt: true,
    },
  });

  if (!user) {
    return unauthorizedResponse('User not found');
  }

  return NextResponse.json({ user });
}
```

Create `src/app/api/v1/auth/refresh/route.ts`:

```tsx
import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, signAccessToken, signRefreshToken } from '@/lib/auth/jwt';

export async function POST(request: NextRequest) {
  try {
    const { refreshToken } = await request.json();

    if (!refreshToken) {
      return NextResponse.json({ error: 'Refresh token required' }, { status: 400 });
    }

    const payload = verifyToken(refreshToken);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid or expired refresh token' }, { status: 401 });
    }

    const newPayload = {
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
    };

    return NextResponse.json({
      accessToken: signAccessToken(newPayload),
      refreshToken: signRefreshToken(newPayload),
    });
  } catch (error) {
    console.error('[API v1] Refresh error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

### Example V1 API Route (Decks)

Create `src/app/api/v1/decks/route.ts`:

```tsx
import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest, unauthorizedResponse } from '@/lib/auth/api-auth';
import { prisma } from '@/lib/prisma';

// GET /api/v1/decks - List user's decks
export async function GET(request: NextRequest) {
  const authResult = await authenticateRequest(request);

  if (!authResult.success) {
    return unauthorizedResponse(authResult.error);
  }

  const decks = await prisma.deck.findMany({
    where: { userId: authResult.user.userId },
    orderBy: { updatedAt: 'desc' },
  });

  return NextResponse.json({ decks });
}

// POST /api/v1/decks - Create deck
export async function POST(request: NextRequest) {
  const authResult = await authenticateRequest(request);

  if (!authResult.success) {
    return unauthorizedResponse(authResult.error);
  }

  const body = await request.json();
  const { name, description } = body;

  const deck = await prisma.deck.create({
    data: {
      name,
      description,
      userId: authResult.user.userId,
    },
  });

  return NextResponse.json({ deck }, { status: 201 });
}
```

---

## Part 5: CORS Configuration ✅ DONE

Create `src/lib/cors.ts`:

```tsx
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const allowedOrigins = [
  'https://app.gengobot.com',
  'https://admin.gengobot.com',
  // Mobile apps will use capacitor/native - no origin needed
  // Add development origins
  ...(process.env.NODE_ENV === 'development'
    ? ['http://localhost:3000', 'http://localhost:8100']
    : []),
];

export function corsHeaders(request: NextRequest) {
  const origin = request.headers.get('origin');
  const headers: HeadersInit = {
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
  };

  // Allow specific origins or mobile apps (no origin)
  if (origin && allowedOrigins.includes(origin)) {
    headers['Access-Control-Allow-Origin'] = origin;
    headers['Access-Control-Allow-Credentials'] = 'true';
  }

  return headers;
}

export function handleCorsPreflightRequest(request: NextRequest) {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders(request),
  });
}
```

Add to API v1 routes:

```tsx
import { corsHeaders, handleCorsPreflightRequest } from '@/lib/cors';

// Add OPTIONS handler for CORS preflight
export async function OPTIONS(request: NextRequest) {
  return handleCorsPreflightRequest(request);
}

// Add CORS headers to responses
return NextResponse.json({ data }, { headers: corsHeaders(request) });
```

---

## Part 6: Nginx Configuration ✅ DONE

### Complete nginx.conf

```nginx
# ============================================
# RATE LIMITING ZONES
# ============================================
limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;
limit_req_zone $binary_remote_addr zone=api_v1_limit:10m rate=30r/s;
limit_req_zone $binary_remote_addr zone=general_limit:10m rate=30r/s;
limit_req_zone $binary_remote_addr zone=wp_limit:10m rate=5r/s;
limit_conn_zone $binary_remote_addr zone=addr:10m;

# ============================================
# UPSTREAM SERVERS
# ============================================
upstream nextjs_upstream {
    server 127.0.0.1:3000;
    keepalive 64;
}

upstream php_upstream {
    server unix:/run/php/php8.2-fpm.sock;
}

# ============================================
# MAIN DOMAIN: gengobot.com (WordPress)
# ============================================
server {
    listen 80;
    listen [::]:80;
    server_name gengobot.com www.gengobot.com;

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location / {
        return 301 https://gengobot.com$request_uri;
    }
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name www.gengobot.com;

    ssl_certificate /etc/letsencrypt/live/gengobot.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/gengobot.com/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    return 301 https://gengobot.com$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name gengobot.com;

    ssl_certificate /etc/letsencrypt/live/gengobot.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/gengobot.com/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    root /var/www/wordpress;
    index index.php index.html;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    access_log /var/log/nginx/wordpress-access.log combined;
    error_log /var/log/nginx/wordpress-error.log warn;

    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml;

    client_max_body_size 64M;
    limit_req zone=wp_limit burst=20 nodelay;

    location / {
        try_files $uri $uri/ /index.php?$args;
    }

    location ~ \.php$ {
        try_files $uri =404;
        fastcgi_split_path_info ^(.+\.php)(/.+)$;
        fastcgi_pass php_upstream;
        fastcgi_index index.php;
        include fastcgi_params;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # WordPress security
    location ~ /\.ht { deny all; }
    location ~ /wp-config\.php { deny all; }
    location ~ /xmlrpc\.php { deny all; }
}

# ============================================
# APP SUBDOMAIN: app.gengobot.com (Next.js Web)
# ============================================
server {
    listen 80;
    listen [::]:80;
    server_name app.gengobot.com;

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location / {
        return 301 https://app.gengobot.com$request_uri;
    }
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name app.gengobot.com;

    ssl_certificate /etc/letsencrypt/live/app.gengobot.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/app.gengobot.com/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    access_log /var/log/nginx/app-access.log combined;
    error_log /var/log/nginx/app-error.log warn;

    gzip on;
    gzip_types text/plain text/css application/json application/javascript;

    client_max_body_size 25M;
    proxy_connect_timeout 300s;
    proxy_send_timeout 300s;
    proxy_read_timeout 300s;

    limit_conn addr 20;

    # Streaming routes (SSE)
    location ~ ^/api/(task-attempts|free-conversation)/.*/(stream|transcribe-stream) {
        proxy_pass http://nextjs_upstream;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        proxy_buffering off;
        proxy_cache off;
        chunked_transfer_encoding on;
        proxy_read_timeout 3600s;

        add_header Cache-Control "no-cache, no-store, must-revalidate";
        add_header X-Accel-Buffering "no";
    }

    # Voice/Audio routes
    location ~ ^/api/voice/(synthesize|transcribe) {
        limit_req zone=api_limit burst=30 nodelay;

        proxy_pass http://nextjs_upstream;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        proxy_buffering off;
        proxy_request_buffering off;
        proxy_connect_timeout 120s;
        proxy_send_timeout 120s;
        proxy_read_timeout 120s;
    }

    # Webhooks (no rate limit)
    location /api/webhooks/ {
        proxy_pass http://nextjs_upstream;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Standard API routes
    location /api/ {
        limit_req zone=api_limit burst=20 nodelay;

        proxy_pass http://nextjs_upstream;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Static assets
    location /_next/static {
        proxy_pass http://nextjs_upstream;
        expires 365d;
        add_header Cache-Control "public, immutable";
    }

    # Main app
    location / {
        limit_req zone=general_limit burst=50 nodelay;

        proxy_pass http://nextjs_upstream;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_buffering off;
    }
}

# ============================================
# API SUBDOMAIN: api.gengobot.com (Next.js API)
# ============================================
server {
    listen 80;
    listen [::]:80;
    server_name api.gengobot.com;

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location / {
        return 301 https://api.gengobot.com$request_uri;
    }
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name api.gengobot.com;

    ssl_certificate /etc/letsencrypt/live/api.gengobot.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.gengobot.com/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    # Security headers
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    access_log /var/log/nginx/api-access.log combined;
    error_log /var/log/nginx/api-error.log warn;

    gzip on;
    gzip_types application/json;

    client_max_body_size 25M;

    # Higher rate limit for API
    limit_req zone=api_v1_limit burst=50 nodelay;
    limit_conn addr 30;

    # Voice synthesis/transcription
    location ~ ^/v1/voice/(synthesize|transcribe) {
        # Rewrite /v1/* to /api/v1/*
        rewrite ^/v1/(.*)$ /api/v1/$1 break;

        proxy_pass http://nextjs_upstream;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        proxy_buffering off;
        proxy_request_buffering off;
        proxy_connect_timeout 120s;
        proxy_send_timeout 120s;
        proxy_read_timeout 120s;
    }

    # All v1 API routes
    location /v1/ {
        # Rewrite /v1/* to /api/v1/*
        rewrite ^/v1/(.*)$ /api/v1/$1 break;

        proxy_pass http://nextjs_upstream;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Root redirect to docs (optional)
    location = / {
        return 200 '{"message": "Gengobot API v1", "docs": "https://gengobot.com/docs/api"}';
        add_header Content-Type application/json;
    }

    # Catch all - 404
    location / {
        return 404 '{"error": "Not found"}';
        add_header Content-Type application/json;
    }
}

# ============================================
# ADMIN SUBDOMAIN: admin.gengobot.com (Next.js Admin)
# ============================================
server {
    listen 80;
    listen [::]:80;
    server_name admin.gengobot.com;

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location / {
        return 301 https://admin.gengobot.com$request_uri;
    }
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name admin.gengobot.com;

    ssl_certificate /etc/letsencrypt/live/admin.gengobot.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/admin.gengobot.com/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    # Strict security headers for admin
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';" always;

    access_log /var/log/nginx/admin-access.log combined;
    error_log /var/log/nginx/admin-error.log warn;

    # Stricter rate limiting for admin
    limit_req zone=api_limit burst=10 nodelay;
    limit_conn addr 5;

    # Static assets (pass through without rewrite)
    location /_next/static {
        proxy_pass http://nextjs_upstream;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        expires 365d;
        add_header Cache-Control "public, immutable";
    }

    # Admin API routes
    location /api/admin/ {
        proxy_pass http://nextjs_upstream;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # NextAuth API (needed for session checks)
    location /api/auth/ {
        proxy_pass http://nextjs_upstream;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Main admin app - rewrite paths to /admin/*
    # admin.gengobot.com/ -> /admin
    # admin.gengobot.com/auth/login -> /admin/auth/login
    location / {
        rewrite ^/(.*)$ /admin/$1 break;

        proxy_pass http://nextjs_upstream;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## Part 7: Environment Variables (Manual)

### Production `.env`

```bash
# Database
DATABASE_URL=postgresql://gengobot:PASSWORD@localhost:5432/gengobot

# Auth
AUTH_SECRET=your_auth_secret_here
NEXTAUTH_URL=https://app.gengobot.com
JWT_SECRET=your_jwt_secret_here

# URLs
NEXT_PUBLIC_APP_URL=https://app.gengobot.com
NEXT_PUBLIC_API_URL=https://api.gengobot.com
NEXT_PUBLIC_ADMIN_URL=https://admin.gengobot.com
NEXT_PUBLIC_MAIN_URL=https://gengobot.com

# OAuth (update in Google Console)
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
# Redirect URI: https://app.gengobot.com/api/auth/callback/google

# OpenAI
OPENAI_API_KEY=your_openai_key

# Midtrans (update webhook URL)
MIDTRANS_SERVER_KEY_PRODUCTION=your_key
# Webhook: https://api.gengobot.com/v1/webhooks/midtrans

# Environment
NODE_ENV=production
```

### Add to `.env.example`

```bash
# JWT for mobile API
JWT_SECRET=generate_with_openssl_rand_base64_32

# API URL (for mobile apps)
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

---

## Part 8: DNS Configuration (Manual)

Add these A records at your DNS provider:

| Type | Name  | Value       | TTL  |
| ---- | ----- | ----------- | ---- |
| A    | @     | YOUR_VPS_IP | 3600 |
| A    | www   | YOUR_VPS_IP | 3600 |
| A    | app   | YOUR_VPS_IP | 3600 |
| A    | api   | YOUR_VPS_IP | 3600 |
| A    | admin | YOUR_VPS_IP | 3600 |

---

## Execution Checklist

### Pre-Migration

- [ ] Create git branch: `git checkout -b restructure/subdomain-architecture`
- [ ] Run `npm run build` to verify current state
- [ ] Backup database

### Phase 1-2: Directory Structure

- [ ] Create route group directories `(app)`, `(admin)`, `(auth)`
- [ ] Create `api/v1/` directory structure
- [ ] Move app routes to `(app)` group
- [ ] Move admin routes to `(admin)` group
- [ ] Move login to `(auth)` group
- [ ] Delete old directories and unused files

### Phase 3-5: Code Updates

- [ ] Update root `page.tsx`
- [ ] Update `middleware.ts`
- [ ] Update `(app)/layout.tsx` and `layout-client.tsx`
- [ ] Update all files with hardcoded `/app/` routes
- [ ] Update `src/lib/auth/config.ts`

### Phase 6: JWT & API v1

- [ ] Install `jsonwebtoken`: `npm install jsonwebtoken @types/jsonwebtoken`
- [ ] Create `src/lib/auth/jwt.ts`
- [ ] Create `src/lib/auth/api-auth.ts`
- [ ] Create `src/lib/cors.ts`
- [ ] Create `/api/v1/auth/*` routes
- [ ] Create sample `/api/v1/decks` route
- [ ] Add `JWT_SECRET` to `.env`

### Phase 7: Infrastructure

- [ ] Update nginx.conf with all 4 subdomains
- [ ] Configure DNS records
- [ ] Obtain SSL certificates for all subdomains
- [ ] Update `.env` with all URLs

### Phase 8: External Services

- [ ] Update Google OAuth redirect URIs
- [ ] Update Midtrans webhook URL
- [ ] Test OAuth flow

### Post-Migration

- [ ] Run `npm run build` - verify no errors
- [ ] Test all web routes locally
- [ ] Test API v1 routes with curl/Postman
- [ ] Test authentication (session + JWT)
- [ ] Test legacy `/app/*` redirects
- [ ] Merge to main when ready

---

## Rollback Plan

```bash
# If issues occur, revert to main
git checkout main

# Or reset branch
git checkout restructure/subdomain-architecture
git reset --hard origin/main
```

---

## Scaling Path (Future)

```
Stage 1 (Now)              Stage 2 (10K+ users)        Stage 3 (50K+ users)
──────────────────────────────────────────────────────────────────────────

Single VPS                  Same VPS, 2 processes       Separate servers
┌──────────────┐           ┌──────────────┐           ┌──────────────┐
│ Next.js :3000│           │ Web :3000    │           │ VPS 1 (Web)  │
│ - Web + API  │    ──▶    │ API :3001    │    ──▶    │ VPS 2 (API)  │
└──────────────┘           └──────────────┘           │ VPS 3 (DB)   │
                                                       └──────────────┘

Mobile apps always call api.gengobot.com - no changes needed when scaling!
```

---

## Notes

1. **Route Groups**: `(app)` parentheses create organization without affecting URLs.

2. **Dual Auth**: API supports both JWT (mobile) and session (web) authentication.

3. **API Versioning**: `/api/v1/` allows breaking changes in future `/api/v2/` without affecting mobile apps.

4. **Same Instance**: All subdomains point to the same Next.js app initially. Split later when needed.

5. **CORS**: Configured for web origins. Mobile apps (Capacitor/native) don't send Origin headers.

6. **Legacy Support**: Middleware redirects `/app/*` to `/*` for backwards compatibility.
