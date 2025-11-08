# Panduan Instalasi Lengkap

## Prasyarat

### 1. Install Node.js

Aplikasi ini memerlukan Node.js versi 16 atau lebih baru.

**Cara Install Node.js di macOS:**

#### Opsi 1: Menggunakan Homebrew (Recommended)
```bash
# Install Homebrew jika belum ada
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install Node.js
brew install node

# Verifikasi instalasi
node --version
npm --version
```

#### Opsi 2: Download dari Website Resmi
1. Kunjungi https://nodejs.org/
2. Download installer untuk macOS
3. Jalankan installer dan ikuti instruksi
4. Buka terminal baru dan verifikasi:
   ```bash
   node --version
   npm --version
   ```

## Instalasi Aplikasi

### Langkah 1: Buka Terminal
Buka Terminal di macOS (Applications > Utilities > Terminal)

### Langkah 2: Navigasi ke Folder Project
```bash
cd /Users/danielyovanda/CascadeProjects/sistem-izin-kehadiran
```

### Langkah 3: Install Dependencies Backend
```bash
npm install
```

### Langkah 4: Install Dependencies Frontend
```bash
cd client
npm install
cd ..
```

### Langkah 5: Jalankan Aplikasi
```bash
npm run dev
```

Perintah ini akan menjalankan:
- Backend server di `http://localhost:3001`
- Frontend di `http://localhost:3000`

### Langkah 6: Buka Browser
Buka browser dan akses: `http://localhost:3000`

## Akun Login Demo

### Admin (Kasubag Kepegawaian)
- **Username**: `admin`
- **Password**: `admin123`

### Pegawai
- **Username**: `pegawai`
- **Password**: `pegawai123`

## Troubleshooting

### Error: "command not found: npm"
- Node.js belum terinstall atau belum ada di PATH
- Solusi: Install Node.js menggunakan cara di atas

### Error: "Port 3000 already in use"
- Port sudah digunakan aplikasi lain
- Solusi: Matikan aplikasi yang menggunakan port tersebut atau ubah port di `client/vite.config.js`

### Error: "Port 3001 already in use"
- Port sudah digunakan aplikasi lain
- Solusi: Matikan aplikasi yang menggunakan port tersebut atau ubah PORT di `server/index.js`

### Error saat npm install
- Koneksi internet bermasalah
- Solusi: Pastikan koneksi internet stabil dan coba lagi

## Menghentikan Aplikasi

Tekan `Ctrl + C` di terminal untuk menghentikan server.

## Menjalankan Ulang

Setelah instalasi pertama kali, untuk menjalankan aplikasi cukup:

```bash
cd /Users/danielyovanda/CascadeProjects/sistem-izin-kehadiran
npm run dev
```

## Catatan Penting

1. **Data Sementara**: Aplikasi ini menggunakan in-memory storage, data akan hilang saat server di-restart
2. **Development Mode**: Aplikasi ini masih dalam mode development
3. **Production**: Untuk production, perlu setup database dan keamanan tambahan

## Bantuan Lebih Lanjut

Jika mengalami masalah, periksa:
1. Node.js sudah terinstall dengan benar
2. Semua dependencies sudah terinstall
3. Port 3000 dan 3001 tidak digunakan aplikasi lain
4. Koneksi internet stabil saat install dependencies
