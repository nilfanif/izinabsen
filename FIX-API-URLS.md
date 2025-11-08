# 🔧 Fix API URLs - Manual Update Required

## Problem
Frontend menggunakan relative URLs (`/api/...`) yang tidak bisa reach Railway backend.

## Solution
Update semua `fetch('/api/...)` menjadi `fetch(\`${API_URL}/api/...\`)`

## Files yang Perlu Diupdate

### ✅ SUDAH DIUPDATE:
- [x] `/client/src/pages/Login.jsx`
- [x] `/client/src/pages/RegistrationPage.jsx`
- [x] `/client/src/config.js`

### ⏳ PERLU DIUPDATE:
- [ ] `/client/src/pages/AdminDashboard.jsx`
- [ ] `/client/src/pages/EmployeeDashboard.jsx`
- [ ] `/client/src/components/EmployeeList.jsx`

## Pattern

### Before:
```javascript
fetch('/api/endpoint', {
  method: 'POST',
  ...
})
```

### After:
```javascript
import { API_URL } from '../config'

fetch(`${API_URL}/api/endpoint`, {
  method: 'POST',
  ...
})
```

## Quick Fix Script

Jalankan command ini untuk update semua file sekaligus:

```bash
# Update AdminDashboard
sed -i '' "s|fetch('/api/|fetch(\`\${API_URL}/api/|g" client/src/pages/AdminDashboard.jsx
sed -i '' "s|fetch(\"/api/|fetch(\`\${API_URL}/api/|g" client/src/pages/AdminDashboard.jsx

# Update EmployeeDashboard  
sed -i '' "s|fetch('/api/|fetch(\`\${API_URL}/api/|g" client/src/pages/EmployeeDashboard.jsx
sed -i '' "s|fetch(\"/api/|fetch(\`\${API_URL}/api/|g" client/src/pages/EmployeeDashboard.jsx

# Update EmployeeList
sed -i '' "s|fetch('/api/|fetch(\`\${API_URL}/api/|g" client/src/components/EmployeeList.jsx
sed -i '' "s|fetch(\"/api/|fetch(\`\${API_URL}/api/|g" client/src/components/EmployeeList.jsx
```

Lalu tambahkan import di setiap file:
```javascript
import { API_URL } from '../config'  // atau '../../config' tergantung lokasi
```
