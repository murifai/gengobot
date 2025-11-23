# Cron Jobs Setup Guide

## Overview

Gengo menggunakan Vercel Cron Jobs untuk menjalankan tugas terjadwal seperti reset daily trial usage dan memproses expired trials.

---

## Cron Jobs yang Tersedia

### 1. Trial Daily Reset

**Endpoint**: `/api/cron/trial-reset`
**Schedule**: `0 0 * * *` (Setiap hari jam 00:00 UTC)

**Fungsi**:

- Reset `trialDailyUsed` ke 0 untuk semua trial users aktif
- Update `trialDailyReset` timestamp ke midnight berikutnya

**Response**:

```json
{
  "success": true,
  "message": "Reset daily usage for 42 trial users",
  "count": 42,
  "timestamp": "2024-01-15T00:00:00.000Z"
}
```

### 2. Trial Expiry Processing

**Endpoint**: `/api/cron/trial-expiry`
**Schedule**: `0 1 * * *` (Setiap hari jam 01:00 UTC)

**Fungsi**:

- Update status subscription menjadi `EXPIRED` untuk trial yang sudah berakhir
- Membuat transaction record untuk tracking
- Mengembalikan info trials yang akan expire dalam 1-3 hari (untuk notifikasi)

**Response**:

```json
{
  "success": true,
  "message": "Processed 5 expired trials",
  "processed": 5,
  "timestamp": "2024-01-15T01:00:00.000Z",
  "expiringSoon": {
    "in1Day": 3,
    "in3Days": 12
  }
}
```

### 3. Monthly Credits Grant

**Endpoint**: `/api/cron/monthly-credits`
**Schedule**: `0 2 * * *` (Setiap hari jam 02:00 UTC)

**Fungsi**:

- Grant monthly credits ke paid subscribers (Basic/Pro) yang periode billingnya sudah berakhir
- Reset `creditsUsed` ke 0 dan set `creditsRemaining` ke monthly allocation
- Update `currentPeriodStart` dan `currentPeriodEnd` untuk periode baru
- Unused credits tidak rollover (expire di akhir periode)

**Response**:

```json
{
  "success": true,
  "message": "Renewed 15 subscriptions",
  "renewed": 15,
  "failed": 0,
  "timestamp": "2024-01-15T02:00:00.000Z",
  "details": [
    { "userId": "user1", "tier": "BASIC", "credits": 6000 },
    { "userId": "user2", "tier": "PRO", "credits": 16500 }
  ]
}
```

**Credit Allocation per Tier**:

- Basic: 6,000 credits/bulan
- Pro: 16,500 credits/bulan

---

## Vercel Configuration

### vercel.json

File `vercel.json` di root project sudah dikonfigurasi:

```json
{
  "crons": [
    {
      "path": "/api/cron/trial-reset",
      "schedule": "0 0 * * *"
    },
    {
      "path": "/api/cron/trial-expiry",
      "schedule": "0 1 * * *"
    },
    {
      "path": "/api/cron/monthly-credits",
      "schedule": "0 2 * * *"
    }
  ]
}
```

### Cron Expression Format

```
┌───────────── minute (0 - 59)
│ ┌───────────── hour (0 - 23)
│ │ ┌───────────── day of the month (1 - 31)
│ │ │ ┌───────────── month (1 - 12)
│ │ │ │ ┌───────────── day of the week (0 - 6) (Sunday to Saturday)
│ │ │ │ │
│ │ │ │ │
* * * * *
```

---

## Environment Variables

### Required

```bash
# Secret untuk autentikasi cron requests
CRON_SECRET=your-secure-random-string-here
```

### Generating CRON_SECRET

```bash
# Menggunakan OpenSSL
openssl rand -hex 32

# Atau menggunakan Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## Security

### Authentication

Semua cron endpoints menggunakan Bearer token authentication:

```typescript
// Request dari Vercel Cron
Authorization: Bearer ${CRON_SECRET}
```

### Validation Flow

1. Vercel Cron mengirim request dengan header `Authorization`
2. Endpoint memverifikasi token terhadap `CRON_SECRET`
3. Jika tidak match, return 401 Unauthorized

### Development Mode

Dalam development (`NODE_ENV=development`):

- Jika `CRON_SECRET` tidak di-set, requests akan diizinkan
- Endpoint juga menerima POST request untuk manual testing

---

## Local Testing

### Manual Trigger (Development)

```bash
# Test trial reset
curl -X POST http://localhost:3000/api/cron/trial-reset

# Test trial expiry
curl -X POST http://localhost:3000/api/cron/trial-expiry
```

### With Authentication

```bash
# Set environment variable
export CRON_SECRET=test-secret

# Test dengan authentication
curl -X GET http://localhost:3000/api/cron/trial-reset \
  -H "Authorization: Bearer test-secret"
```

---

## Vercel Dashboard

### Viewing Cron Jobs

1. Buka Vercel Dashboard
2. Pilih project Gengo
3. Go to **Settings** → **Cron Jobs**
4. Akan terlihat semua cron jobs yang terkonfigurasi

### Viewing Logs

1. Go to **Deployments** → pilih deployment
2. Click **Functions** tab
3. Filter by cron endpoint path
4. Lihat logs untuk setiap eksekusi

### Manual Trigger dari Dashboard

1. Go to **Settings** → **Cron Jobs**
2. Click **...** di sebelah cron job
3. Select **Trigger**

---

## Monitoring & Alerts

### Recommended Setup

1. **Vercel Monitoring**: Enable di dashboard untuk error tracking
2. **Logging**: Semua eksekusi di-log dengan timestamp dan count
3. **Error Alerts**: Setup email/Slack alerts untuk failed cron jobs

### Metrics to Track

- **Success Rate**: Persentase cron jobs yang berhasil
- **Execution Time**: Waktu eksekusi rata-rata
- **Records Processed**: Jumlah records yang di-process setiap run

---

## Timezone Considerations

### Default Timezone

Vercel Cron menggunakan **UTC timezone**.

### Indonesia Time (WIB = UTC+7)

| Cron (UTC)  | WIB Time  | Purpose            |
| ----------- | --------- | ------------------ |
| `0 0 * * *` | 07:00 WIB | Trial daily reset  |
| `0 1 * * *` | 08:00 WIB | Trial expiry check |

### Adjustment for Midnight WIB

Jika ingin reset tepat midnight WIB:

```json
{
  "path": "/api/cron/trial-reset",
  "schedule": "0 17 * * *" // 17:00 UTC = 00:00 WIB
}
```

---

## Troubleshooting

### Cron Not Running

1. Verify `vercel.json` syntax is correct
2. Check deployment logs for errors
3. Ensure `CRON_SECRET` is set in environment variables
4. Verify project is on Vercel Pro/Enterprise plan (free tier has limitations)

### 401 Unauthorized

- Check `CRON_SECRET` environment variable is set correctly
- Ensure Vercel is sending the correct Authorization header
- Check for typos in the secret value

### No Records Updated

- Verify there are active trial users in database
- Check database connection is working
- Look at function logs for errors

### Timeout Errors

Vercel Cron functions have execution time limits:

- Hobby: 10 seconds
- Pro: 60 seconds
- Enterprise: 900 seconds

Jika processing banyak records, pertimbangkan:

- Batch processing
- Pagination
- Background jobs (Vercel Queues)

---

## Future Cron Jobs

Planned cron jobs untuk Phase berikutnya:

```json
{
  "crons": [
    // Monthly credit grant (Phase 6)
    {
      "path": "/api/cron/monthly-credits",
      "schedule": "0 0 1 * *"
    },
    // Trial ending notifications (Phase 8)
    {
      "path": "/api/cron/trial-notifications",
      "schedule": "0 9 * * *"
    },
    // Usage warnings (Phase 8)
    {
      "path": "/api/cron/usage-warnings",
      "schedule": "0 */6 * * *"
    }
  ]
}
```

---

## Best Practices

1. **Idempotency**: Cron jobs harus bisa di-run multiple times dengan hasil yang sama
2. **Error Handling**: Selalu wrap dalam try-catch dan return meaningful errors
3. **Logging**: Log jumlah records processed untuk monitoring
4. **Timeouts**: Keep operations under time limits
5. **Testing**: Test locally sebelum deploy ke production
6. **Monitoring**: Set up alerts untuk failed cron jobs
