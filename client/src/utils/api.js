import { API_URL } from '../config'

// Helper function untuk API calls
export const apiCall = async (endpoint, options = {}) => {
  const url = `${API_URL}${endpoint}`
  const response = await fetch(url, options)
  return response
}

// Export API_URL juga untuk backward compatibility
export { API_URL }
