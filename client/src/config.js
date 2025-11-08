// API Configuration
export const API_URL = import.meta.env.VITE_API_URL || 
  (import.meta.env.MODE === 'production' 
    ? 'https://sistem-izin-api-production.up.railway.app'
    : 'http://localhost:3001')

export const config = {
  apiUrl: API_URL,
  isDevelopment: import.meta.env.MODE === 'development',
  isProduction: import.meta.env.MODE === 'production'
}

export default config
