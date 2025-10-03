# Security Guidelines - Gengobot

## 🔒 Environment Variables

### Files yang TIDAK BOLEH di-commit:

- `.env`
- `.env.local`
- `.env.development`
- `.env.production`
- `.env.test`

### File yang BOLEH di-commit:

- ✅ `.env.example` - Template tanpa kredensial

### Setup Environment Variables:

```bash
# 1. Copy template
cp .env.example .env.local

# 2. Edit dengan kredensial Anda
nano .env.local  # atau editor favorit Anda
```

## 🔑 Sensitive Information Checklist

**JANGAN PERNAH commit:**

- [ ] API Keys (OpenAI, Supabase, dll)
- [ ] Database passwords
- [ ] Service account credentials
- [ ] Private keys (.pem, .key)
- [ ] JWT secrets
- [ ] OAuth client secrets
- [ ] Encryption keys

## 📝 Best Practices

### 1. Environment Variables

```bash
# ❌ SALAH - Hardcoded credentials
const apiKey = "sk-proj-xxxxx";

# ✅ BENAR - Gunakan environment variables
const apiKey = process.env.OPENAI_API_KEY;
```

### 2. Database Connections

```bash
# ❌ SALAH - Expose credentials
DATABASE_URL=postgresql://admin:password123@localhost:5432/db

# ✅ BENAR - Gunakan environment variable
DATABASE_URL=process.env.DATABASE_URL
```

### 3. Git Pre-commit Checks

```bash
# Cek sebelum commit
git diff --cached | grep -i "api_key\|password\|secret"
```

## 🛡️ Protection Layers

### Layer 1: .gitignore

```
.env*
!.env.example
*.pem
*.key
```

### Layer 2: .claudeignore

Mencegah Claude Code membaca file sensitif:

```
.env
.env.local
*.pem
*.key
```

### Layer 3: Husky Pre-commit Hook

Validasi otomatis sebelum commit.

## 🚨 Emergency Response

### Jika Kredensial Ter-expose:

1. **Immediate Action:**

   ```bash
   # Remove dari Git history
   git filter-branch --force --index-filter \
     "git rm --cached --ignore-unmatch .env" \
     --prune-empty --tag-name-filter cat -- --all
   ```

2. **Rotate Credentials:**
   - [ ] Generate new API keys
   - [ ] Update Supabase keys
   - [ ] Change database passwords
   - [ ] Revoke compromised tokens

3. **Update .env.example:**
   ```bash
   # Pastikan hanya placeholder
   OPENAI_API_KEY=your_openai_api_key
   DATABASE_URL=postgresql://user:password@localhost:5432/db
   ```

## 🔍 Security Audit Commands

```bash
# Check untuk kredensial yang mungkin ter-commit
git log -S "api_key" --all --pretty=format:"%H %s"

# Scan files untuk potential secrets
grep -r "api.*key\|password\|secret" --exclude-dir=node_modules .

# Check .env files tidak di-track
git ls-files | grep "\.env$"  # Should return nothing
```

## 📚 Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Git Secrets](https://github.com/awslabs/git-secrets)
- [Prisma Security Best Practices](https://www.prisma.io/docs/guides/security)
- [Next.js Security Headers](https://nextjs.org/docs/advanced-features/security-headers)

## ✅ Security Checklist untuk Development

- [ ] `.env` files di-ignore oleh git
- [ ] `.claudeignore` configured
- [ ] No hardcoded credentials in code
- [ ] Husky pre-commit hooks active
- [ ] `.env.example` updated (tanpa kredensial)
- [ ] Database connection uses environment variables
- [ ] API keys stored securely
- [ ] Regular security audits

## 🤝 Reporting Security Issues

Jika Anda menemukan security vulnerability, **JANGAN** buat public issue.

Contact: [Your Security Contact Email]
