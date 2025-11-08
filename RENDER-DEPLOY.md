# 🎨 Render.com Deployment Guide

## ✅ Keuntungan Render.com

- ✅ **100% GRATIS selamanya** (Free tier)
- ✅ **Tidak perlu kartu kredit**
- ✅ **750 jam/bulan** (cukup untuk 1 app 24/7)
- ✅ **Auto-deploy** dari GitHub
- ✅ **Custom domain** gratis
- ✅ **HTTPS** otomatis
- ✅ **Environment variables** built-in

## 📋 Prerequisites

1. **GitHub Account** - Code harus di GitHub
2. **Render Account** - Buat di render.com (gratis)

---

## 🚀 Deployment Steps

### **Step 1: Push Code ke GitHub**

Jika code belum di GitHub:

```bash
# Initialize git (jika belum)
git init
git add .
git commit -m "Prepare for Render deployment"

# Create repository di GitHub, lalu:
git remote add origin https://github.com/YOUR_USERNAME/sistem-izin-kehadiran.git
git branch -M main
git push -u origin main
```

### **Step 2: Buat Akun Render**

1. Go to: https://render.com
2. Click **"Get Started"**
3. Sign up dengan **GitHub**
4. Authorize Render to access your repositories

### **Step 3: Create New Web Service**

1. Di Render Dashboard, click **"New +"**
2. Select **"Web Service"**
3. Connect your GitHub repository:
   - Search: `sistem-izin-kehadiran`
   - Click **"Connect"**

### **Step 4: Configure Service**

**Basic Settings:**
- **Name:** `sistem-izin-api`
- **Region:** `Singapore` (terdekat dengan Indonesia)
- **Branch:** `main`
- **Root Directory:** `.` (leave empty or put `.`)
- **Runtime:** `Node`

**Build Settings:**
- **Build Command:** `npm install`
- **Start Command:** `node server/index.js`

**Plan:**
- Select **"Free"** plan

### **Step 5: Set Environment Variables**

Scroll ke bagian **"Environment Variables"**, add:

1. **SUPABASE_URL**
   - Value: `https://eewgrlxgxalfnfwonmwa.supabase.co`

2. **SUPABASE_KEY**
   - Value: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVld2dybHhneGFsZm5md29ubXdhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0OTg5MDUsImV4cCI6MjA3ODA3NDkwNX0.ANscysxgwmPQmvTrerqzzTknik0AMGhvdzw5yuE_ipQ`

3. **PORT**
   - Value: `3001`

4. **NODE_ENV**
   - Value: `production`

### **Step 6: Deploy**

1. Click **"Create Web Service"**
2. Render akan mulai build & deploy
3. Tunggu 2-5 menit
4. Status akan berubah menjadi **"Live"**

### **Step 7: Get Backend URL**

Setelah deploy selesai:
- URL akan muncul di dashboard
- Format: `https://sistem-izin-api.onrender.com`
- Copy URL ini

---

## 🔧 Update Frontend

### **Step 1: Update API URL**

Edit file: `client/.env.production`

```env
VITE_API_URL=https://sistem-izin-api.onrender.com
```

### **Step 2: Update CORS di Backend**

Edit file: `server/index.js`

Tambahkan domain Render ke allowedOrigins:

```javascript
const allowedOrigins = [
  'http://localhost:3000',
  'https://kehadiran-2e5a5.web.app',
  'https://kehadiran-2e5a5.firebaseapp.com'
];
```

### **Step 3: Rebuild & Redeploy Frontend**

```bash
# Rebuild
npm run build

# Redeploy to Firebase
firebase deploy --only hosting
```

---

## 🧪 Testing

### **Test Backend Health**
```bash
curl https://sistem-izin-api.onrender.com/api/health
```

Expected response:
```json
{
  "status": "healthy",
  "database": "connected",
  "timestamp": "..."
}
```

### **Test Frontend**
1. Open: https://kehadiran-2e5a5.web.app
2. Try login
3. Test all features

---

## ⚠️ Important Notes

### **Cold Start**
- Free tier apps sleep after 15 minutes of inactivity
- First request after sleep takes ~30 seconds
- Subsequent requests are fast

### **Workaround untuk Cold Start:**
1. Use cron job untuk ping setiap 10 menit
2. Use UptimeRobot (gratis) untuk monitoring
3. Accept cold start (untuk free tier)

### **Auto-Deploy**
- Setiap push ke GitHub akan auto-deploy
- Tidak perlu manual deploy lagi

---

## 📊 Monitoring

### **View Logs**
1. Go to Render Dashboard
2. Click your service
3. Tab "Logs"

### **View Metrics**
- CPU usage
- Memory usage
- Request count
- Response time

---

## 🔄 Redeploy

### **Manual Redeploy**
1. Go to Render Dashboard
2. Click "Manual Deploy"
3. Select branch
4. Click "Deploy"

### **Auto Redeploy**
```bash
git add .
git commit -m "Update"
git push origin main
```
Render akan auto-deploy!

---

## 💡 Tips

### **Reduce Cold Start**
1. Keep app active dengan cron job
2. Use paid plan ($7/month) untuk no sleep

### **Custom Domain**
1. Go to Settings → Custom Domain
2. Add your domain
3. Update DNS records
4. Free HTTPS included

### **Environment Variables**
- Update via dashboard
- No need to redeploy
- Takes effect immediately

---

## 🆚 Railway vs Render

| Feature | Railway | Render |
|---------|---------|--------|
| Free Tier | $5 credit/month | 750 hours/month |
| Kartu Kredit | Required | Not required |
| Cold Start | No | Yes (~30s) |
| Auto-Deploy | Yes | Yes |
| Custom Domain | Yes | Yes |
| HTTPS | Yes | Yes |

---

## 🎯 Summary

**Render.com adalah pilihan terbaik untuk:**
- ✅ Hobby projects
- ✅ Small applications
- ✅ Learning & testing
- ✅ Budget $0

**Upgrade ke paid plan jika:**
- ❌ Cold start tidak acceptable
- ❌ Need 24/7 uptime
- ❌ High traffic

---

## 📞 Support

**Render Documentation:**
https://render.com/docs

**Community:**
https://community.render.com

**Status:**
https://status.render.com
