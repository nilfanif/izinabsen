// API Configuration
export const API_URL = import.meta.env.VITE_API_URL || 
  (import.meta.env.MODE === 'production' 
    ? 'https://your-backend-url.com'  // Update this after deploying backend
    : 'http://localhost:3001')

export const config = {
  apiUrl: API_URL,
  isDevelopment: import.meta.env.MODE === 'development',
  isProduction: import.meta.env.MODE === 'production'
}

export default config
