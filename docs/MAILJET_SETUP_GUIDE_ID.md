# Panduan Setup Mailjet - Langkah demi Langkah

## Penjelasan Singkat

Mailjet adalah layanan untuk mengirim email transaksional (seperti email verifikasi, reset password, dll). Untuk bisa mengirim email, Mailjet perlu memverifikasi bahwa kamu pemilik email/domain yang akan digunakan sebagai pengirim.

---

## Pilihan Setup

Ada 2 pilihan untuk setup sender email di Mailjet:

### **Pilihan 1: Pakai Email Personal (Mudah, Recommended untuk Testing)**

Cocok untuk development/testing. Tidak perlu domain sendiri.

### **Pilihan 2: Pakai Domain Sendiri (Untuk Production)**

Cocok untuk production. Butuh domain (misal: gengobot.com) dan akses ke DNS settings.

---

## Pilihan 1: Setup dengan Email Personal (Gmail/Outlook/dll)

### Langkah 1: Daftar Mailjet

1. Buka https://www.mailjet.com/
2. Klik **Sign Up** atau **Get Started for Free**
3. Isi form:
   - Email: `emailkamu@gmail.com` (atau email personal kamu)
   - Password: buat password
   - Company name: `Gengobot` atau nama project kamu
4. Klik **Sign Up**
5. Cek email untuk verifikasi akun Mailjet
6. Klik link verifikasi di email

### Langkah 2: Verifikasi Email Pengirim

Setelah login ke Mailjet dashboard:

1. **Klik menu kiri:** Account Settings → Sender addresses & domains

   Atau langsung ke: https://app.mailjet.com/account/sender

2. **Klik tombol:** "Add a Sender Domain or Address"

3. **Pilih:** "Email Address" (bukan Domain)

4. **Masukkan email personal kamu:**
   - Contoh: `murifai@gmail.com`
   - Atau email apapun yang kamu punya akses

5. **Klik:** "Continue"

6. **Mailjet akan kirim email verifikasi** ke email yang kamu masukkan

7. **Buka inbox email kamu** (misal Gmail)

8. **Cari email dari Mailjet** dengan subject seperti:
   - "Verify your sender email address"
   - "Validasi email pengirim Anda"

9. **Klik link verifikasi** di email tersebut

10. **Status akan berubah jadi "Validated"** di dashboard Mailjet

### Langkah 3: Dapatkan API Keys

1. **Klik menu kiri:** Account Settings → API Keys (REST API)

   Atau langsung ke: https://app.mailjet.com/account/apikeys

2. Kamu akan lihat:
   - **API Key** (Public Key) - string panjang huruf/angka
   - **Secret Key** (Private Key) - string panjang huruf/angka (hidden)

3. **Copy kedua keys ini**

4. **Update file `.env.local`:**

```bash
# Mailjet Configuration
MAILJET_API_PUBLIC_KEY=paste_api_key_di_sini
MAILJET_API_PRIVATE_KEY=paste_secret_key_di_sini
MAILJET_FROM_EMAIL=murifai@gmail.com  # Email yang sudah diverifikasi
MAILJET_FROM_NAME=Gengobot
```

### Langkah 4: Test Kirim Email

1. Start development server:

```bash
npm run dev
```

2. Buka browser: http://localhost:3000/login

3. Klik "Daftar" dan register dengan email test

4. Cek inbox email test - seharusnya terima email verifikasi dari Mailjet

5. **Jika tidak terima email:**
   - Cek folder Spam
   - Cek Mailjet dashboard → Statistics untuk lihat status pengiriman
   - Pastikan `MAILJET_FROM_EMAIL` sama persis dengan email yang diverifikasi

---

## Pilihan 2: Setup dengan Domain Sendiri (Advanced)

**Butuh:**

- Domain sendiri (misal: gengobot.com)
- Akses ke DNS settings domain

### Langkah 1: Tambah Domain di Mailjet

1. Login ke Mailjet dashboard

2. Klik: Account Settings → Sender addresses & domains

3. Klik: "Add a Sender Domain or Address"

4. Pilih: "Domain Name"

5. Masukkan domain kamu: `gengobot.com`

6. Klik: "Continue"

### Langkah 2: Verifikasi Ownership Domain

Mailjet akan kasih TXT record untuk ditambahkan ke DNS:

**Contoh:**

```
Type: TXT
Name: mailjet-validation
Value: abc123def456...
```

1. **Login ke domain provider kamu** (Namecheap, GoDaddy, Cloudflare, dll)

2. **Cari DNS Settings** atau DNS Management

3. **Tambah TXT record** dengan value dari Mailjet

4. **Tunggu propagasi** (5-30 menit)

5. **Kembali ke Mailjet** dan klik "Verify"

6. **Jika verified,** status akan jadi "Validated"

### Langkah 3: Setup SPF, DKIM, DMARC (Recommended)

Untuk deliverability yang lebih baik:

**SPF Record:**

```
Type: TXT
Name: @
Value: v=spf1 include:spf.mailjet.com ~all
```

**DKIM Records:**
Mailjet akan kasih 2 DKIM records untuk ditambahkan.

**DMARC Record:**

```
Type: TXT
Name: _dmarc
Value: v=DMARC1; p=none; rua=mailto:your-email@domain.com
```

### Langkah 4: Setup Email Address

Setelah domain verified:

1. Kamu bisa pakai email apapun dengan domain tersebut
2. Misal: `noreply@gengobot.com`, `hello@gengobot.com`

**Update `.env.local`:**

```bash
MAILJET_FROM_EMAIL=noreply@gengobot.com
MAILJET_FROM_NAME=Gengobot
```

**Catatan:** Email ini tidak perlu exist di email server kamu. Mailjet hanya butuh domain yang verified.

---

## Troubleshooting

### Email Tidak Diterima

**1. Cek Mailjet Dashboard:**

- Buka: https://app.mailjet.com/stats
- Lihat apakah email sent/delivered/bounced

**2. Email di Spam:**

- Cek folder Spam/Junk
- Tandai "Not Spam" untuk email dari Mailjet

**3. Sender Email Belum Verified:**

- Cek: Account Settings → Sender addresses
- Pastikan status = "Validated" (hijau)
- Jika belum, klik "Resend validation email"

**4. API Keys Salah:**

- Cek `.env.local`
- Pastikan tidak ada spasi ekstra
- Pastikan copy paste dengan benar
- Restart development server setelah update .env

**5. Wrong FROM Email:**

```bash
# SALAH - email tidak verified
MAILJET_FROM_EMAIL=test@example.com

# BENAR - harus sama dengan yang verified
MAILJET_FROM_EMAIL=murifai@gmail.com
```

---

## FAQ

### Q: Apakah harus pakai domain sendiri?

**A:** Tidak. Untuk development/testing, pakai email personal (Gmail, Outlook, dll) sudah cukup.

### Q: Email personal mana yang bisa dipakai?

**A:** Hampir semua: Gmail, Outlook, Yahoo, iCloud, email kantor, dll. Asal kamu punya akses ke inbox-nya untuk verifikasi.

### Q: Berapa lama proses verifikasi?

**A:** Email verifikasi biasanya sampai dalam 1-2 menit. DNS propagation untuk domain bisa 5-30 menit.

### Q: Apakah Mailjet gratis?

**A:** Ya. Free tier Mailjet:

- 6,000 emails per bulan
- 200 emails per hari
- Cukup untuk development dan small apps

### Q: Email saya di folder Spam terus?

**A:** Ini normal untuk email dari domain baru. Solusi:

1. Tambah SPF/DKIM/DMARC records
2. Pakai domain yang sudah established
3. Untuk testing, mark as "Not Spam"
4. Untuk production, consider warm-up domain

### Q: Bisa pakai multiple sender emails?

**A:** Ya. Verify semua email yang mau kamu pakai sebagai sender.

---

## Recommended Setup untuk Project Ini

**Development/Testing:**

```bash
MAILJET_FROM_EMAIL=emailpersonalkamu@gmail.com
MAILJET_FROM_NAME=Gengobot Dev
```

**Production:**

```bash
MAILJET_FROM_EMAIL=noreply@domainanda.com
MAILJET_FROM_NAME=Gengobot
```

---

## Kesimpulan

**Untuk mulai cepat (Recommended):**

1. Daftar Mailjet dengan email personal
2. Verify email personal kamu
3. Copy API keys
4. Update `.env.local`
5. Test kirim email

**Total waktu: ~10 menit**

Setelah semua berjalan, baru consider pakai domain sendiri untuk production.

---

## Support

Jika masih ada masalah:

1. Cek Mailjet documentation: https://dev.mailjet.com/
2. Cek server logs untuk error messages
3. Test dengan curl untuk isolate masalah
4. Contact Mailjet support jika perlu

---

**Selamat mencoba!** 🚀
