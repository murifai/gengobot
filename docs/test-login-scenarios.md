# Test Login Scenarios

## Test Cases

### 1. ✅ Login Berhasil (Valid Credentials)

**Email**: `student@gengobot.com`
**Password**: `test123`
**Expected**: Login berhasil, redirect ke dashboard

### 2. ❌ Email Tidak Terdaftar

**Email**: `tidakada@gengobot.com`
**Password**: `test123`
**Expected Error**: "Email tidak terdaftar. Silakan periksa kembali email Anda atau daftar akun baru."

### 3. ❌ Password Salah

**Email**: `student@gengobot.com`
**Password**: `passwordsalah`
**Expected Error**: "Password salah. Silakan periksa kembali password Anda."

### 4. ❌ Email Belum Diverifikasi

**Test**: Buat user baru tanpa verify email
**Expected Error**: "Email belum diverifikasi. Silakan cek inbox email Anda untuk link verifikasi."

### 5. ❌ OAuth-only Account

**Test**: Buat user via Google OAuth, coba login dengan password
**Expected Error**: "Akun ini menggunakan login Google. Silakan gunakan tombol 'Masuk dengan Google'."

### 6. ❌ Field Kosong

**Email**: (empty)
**Password**: (empty)
**Expected Error**: "Email dan password harus diisi"

### 7. ❌ Rate Limit Exceeded

**Test**: Login 5x dengan password salah
**Expected Error**: "Terlalu banyak percobaan login. Silakan coba lagi dalam X menit."

## Test Users

| Email                  | Password  | Status      | Notes       |
| ---------------------- | --------- | ----------- | ----------- |
| `student@gengobot.com` | `test123` | ✅ Verified | Normal user |
| `admin@gengobot.com`   | `test123` | ✅ Verified | Admin user  |
| `newuser@gengobot.com` | `test123` | ✅ Verified | New user    |

## Manual Testing Steps

1. Open http://localhost:3001/login
2. Try each test case above
3. Verify error messages are clear and specific
4. Check that successful login redirects to dashboard
