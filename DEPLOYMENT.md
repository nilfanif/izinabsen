# 🚀 Deployment Guide - Firebase Hosting

## 📋 Prerequisites

1. **Firebase Account**
   - Buat akun di [Firebase Console](https://console.firebase.google.com/)
   - Buat project baru untuk aplikasi ini

2. **Firebase CLI**
   ```bash
   npm install -g firebase-tools
   ```

3. **Build Aplikasi**
   ```bash
   npm run build
   ```

## 🔧 Setup Firebase Hosting

### Step 1: Login ke Firebase
```bash
firebase login
```

### Step 2: Initialize Firebase
```bash
firebase init hosting
```

**Pilih:**
- ✅ Use an existing project (pilih project Anda)
- Public directory: `client/dist`
- Configure as single-page app: `Yes`
- Set up automatic builds with GitHub: `No` (optional)
- Overwrite index.html: `No`

### Step 3: Deploy Frontend
```bash
firebase deploy --only hosting
```

## 🖥️ Setup Backend (Node.js Server)

**PENTING:** Firebase Hosting hanya untuk static files (frontend).
Backend Node.js perlu di-deploy terpisah.

### Option 1: Deploy Backend ke Railway.app

1. **Install Railway CLI**
   ```bash
   npm install -g @railway/cli
   ```

2. **Login**
   ```bash
   railway login
   ```

3. **Deploy**
   ```bash
   cd /path/to/project
   railway init
   railway up
   ```

4. **Set Environment Variables**
   ```bash
   railway variables set SUPABASE_URL=your_url
   railway variables set SUPABASE_KEY=your_key
   railway variables set PORT=3001
   ```

### Option 2: Deploy Backend ke Render.com

1. Buat akun di [Render.com](https://render.com)
2. Connect GitHub repository
3. Create new Web Service
4. Set:
   - Build Command: `npm install`
   - Start Command: `node server/index.js`
   - Environment Variables:
     - `SUPABASE_URL`
     - `SUPABASE_KEY`
     - `PORT=3001`

### Option 3: Deploy Backend ke Google Cloud Run

1. **Install Google Cloud CLI**
2. **Create Dockerfile** (see below)
3. **Deploy**
   ```bash
   gcloud run deploy sistem-izin-api \
     --source . \
     --platform managed \
     --region asia-southeast2 \
     --allow-unauthenticated
   ```

## 📝 Update Frontend API URL

Setelah backend di-deploy, update API URL di frontend:

**File:** `client/src/config.js` (buat file ini)
```javascript
export const API_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-backend-url.com'  // Backend URL dari Railway/Render
  : 'http://localhost:3001'
```

**Update fetch calls:**
```javascript
// Before:
fetch('/api/login', ...)

// After:
import { API_URL } from './config'
fetch(`${API_URL}/api/login`, ...)
```

## 🔒 Environment Variables

### Backend (.env)
```env
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_anon_key
PORT=3001
NODE_ENV=production
```

### Frontend (Vite)
```env
VITE_API_URL=https://your-backend-url.com
```

## 📦 Dockerfile (untuk Cloud Run)

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY server/package*.json ./server/

# Install dependencies
RUN npm install
RUN cd server && npm install

# Copy source code
COPY . .

# Expose port
EXPOSE 3001

# Start server
CMD ["node", "server/index.js"]
```

## 🚀 Deployment Commands

### Build & Deploy Frontend
```bash
# Build
npm run build

# Deploy to Firebase
firebase deploy --only hosting
```

### Deploy Backend (Railway)
```bash
railway up
```

### Deploy Backend (Render)
```bash
# Push to GitHub, Render will auto-deploy
git push origin main
```

## ✅ Post-Deployment Checklist

- [ ] Frontend deployed ke Firebase Hosting
- [ ] Backend deployed ke Railway/Render/Cloud Run
- [ ] Environment variables configured
- [ ] API URL updated di frontend
- [ ] CORS configured di backend
- [ ] Database (Supabase) accessible
- [ ] Test login functionality
- [ ] Test registration flow
- [ ] Test admin dashboard
- [ ] Test employee dashboard

## 🔗 URLs

- **Frontend:** `https://your-project.web.app`
- **Backend:** `https://your-backend.railway.app` (atau Render/Cloud Run)
- **Database:** Supabase (sudah hosted)

## 🐛 Troubleshooting

### CORS Error
Add to `server/index.js`:
```javascript
app.use(cors({
  origin: 'https://your-project.web.app',
  credentials: true
}))
```

### API Not Found
Check API URL di frontend config

### Database Connection Failed
Verify Supabase credentials di environment variables

## 📞 Support

Jika ada masalah, check:
1. Firebase Console logs
2. Backend service logs (Railway/Render)
3. Browser console errors
4. Network tab di DevTools
