# 🚂 Railway Deployment Guide

## 📋 Step-by-Step Instructions

### Step 1: Login ke Railway
```bash
railway login
```
Ini akan membuka browser untuk login dengan GitHub account.

### Step 2: Initialize Railway Project
```bash
railway init
```
- Pilih "Create new project"
- Nama project: `sistem-izin-api` (atau nama lain)

### Step 3: Deploy
```bash
railway up
```
Tunggu proses deployment selesai (2-5 menit).

### Step 4: Set Environment Variables

**PENTING:** Anda perlu Supabase credentials!

```bash
# Set Supabase URL
railway variables set SUPABASE_URL=your_supabase_url

# Set Supabase Key
railway variables set SUPABASE_KEY=your_supabase_anon_key

# Set Port
railway variables set PORT=3001

# Set Node Environment
railway variables set NODE_ENV=production
```

**Cara mendapatkan Supabase credentials:**
1. Buka [Supabase Dashboard](https://app.supabase.com)
2. Pilih project Anda
3. Go to Settings → API
4. Copy:
   - **Project URL** → SUPABASE_URL
   - **anon/public key** → SUPABASE_KEY

### Step 5: Generate Domain
```bash
railway domain
```
Ini akan generate public URL untuk backend Anda.
Contoh: `sistem-izin-api.up.railway.app`

### Step 6: Verify Deployment
```bash
# Check logs
railway logs

# Check status
railway status
```

## 🔗 Get Backend URL

Setelah deploy, dapatkan URL dengan:
```bash
railway domain
```

Atau lihat di Railway Dashboard:
1. Go to [railway.app/dashboard](https://railway.app/dashboard)
2. Click project Anda
3. Click "Settings" tab
4. Lihat "Domains" section

## 📝 Environment Variables Checklist

- [ ] `SUPABASE_URL` - Supabase project URL
- [ ] `SUPABASE_KEY` - Supabase anon key
- [ ] `PORT` - 3001
- [ ] `NODE_ENV` - production

## 🧪 Test Backend

Setelah deploy, test dengan:
```bash
curl https://your-backend-url.railway.app/api/health
```

Expected response:
```json
{
  "status": "ok",
  "message": "Server is running"
}
```

## 🔄 Update & Redeploy

Jika ada perubahan code:
```bash
# Commit changes
git add .
git commit -m "Update backend"

# Redeploy
railway up
```

## 🐛 Troubleshooting

### Deployment Failed
```bash
# Check logs
railway logs

# Check build logs
railway logs --build
```

### Environment Variables Not Set
```bash
# List all variables
railway variables

# Set missing variable
railway variables set KEY=value
```

### Port Issues
Railway automatically assigns PORT. Pastikan code menggunakan:
```javascript
const PORT = process.env.PORT || 3001;
```

## 📊 Railway Dashboard

Access dashboard: https://railway.app/dashboard

Features:
- View logs
- Monitor metrics
- Manage environment variables
- View deployments
- Configure domains

## 💰 Pricing

Railway Free Tier:
- $5 credit per month
- Enough for small projects
- Auto-sleep after inactivity
- Can upgrade anytime

## ✅ Next Steps After Backend Deploy

1. Copy backend URL dari `railway domain`
2. Update `client/.env.production`:
   ```env
   VITE_API_URL=https://your-backend-url.railway.app
   ```
3. Rebuild frontend:
   ```bash
   npm run build
   ```
4. Redeploy frontend:
   ```bash
   firebase deploy --only hosting
   ```
5. Test aplikasi lengkap!
