# Update Frontend untuk Render

## Setelah Deploy ke Render

### 1. Dapatkan URL Backend
Dari Render Dashboard, copy URL backend Anda.
Contoh: `https://sistem-izin-api.onrender.com`

### 2. Update .env.production
Edit file: `client/.env.production`

```env
VITE_API_URL=https://sistem-izin-api.onrender.com
```

Ganti dengan URL backend Anda yang sebenarnya.

### 3. Rebuild Frontend
```bash
npm run build
```

### 4. Redeploy ke Firebase
```bash
firebase deploy --only hosting
```

### 5. Test Aplikasi
Buka: https://kehadiran-2e5a5.web.app

Test:
- Login
- Registration
- Submit izin/cuti
- Admin dashboard

## Troubleshooting

### Cold Start (30 detik pertama kali)
- Normal untuk free tier
- Setelah warm, cepat

### CORS Error
Pastikan domain Firebase sudah ada di `server/index.js`:
```javascript
const allowedOrigins = [
  'http://localhost:3000',
  'https://kehadiran-2e5a5.web.app',
  'https://kehadiran-2e5a5.firebaseapp.com'
];
```

### Backend Not Responding
- Check Render logs
- Verify environment variables
- Check Supabase connection
