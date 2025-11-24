import axios from 'axios'

// Base API URL - Update this with your actual backend URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('hospitalAdminToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirect to login if unauthorized
      localStorage.removeItem('hospitalAdminToken')
      localStorage.removeItem('hospitalAdminData')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Auth API
export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  logout: () => api.post('/auth/logout'),
  changePassword: (currentPassword, newPassword) => 
    api.post('/auth/change-password', { currentPassword, newPassword })
}

// Donor API
export const donorAPI = {
  getAll: (params) => api.get('/donors', { params }),
  getById: (id) => api.get(`/donors/${id}`),
  create: (donorData) => api.post('/donors', donorData),
  update: (id, donorData) => api.put(`/donors/${id}`, donorData),
  delete: (id) => api.delete(`/donors/${id}`),
  updateStatus: (id, status) => api.patch(`/donors/${id}/status`, { status }),
  getDonationHistory: (id) => api.get(`/donors/${id}/donations`)
}

// Blood Request API
export const bloodRequestAPI = {
  getAll: (params) => api.get('/blood-requests', { params }),
  getById: (id) => api.get(`/blood-requests/${id}`),
  create: (requestData) => api.post('/blood-requests', requestData),
  update: (id, requestData) => api.put(`/blood-requests/${id}`, requestData),
  updateStatus: (id, status) => api.patch(`/blood-requests/${id}/status`, { status }),
  delete: (id) => api.delete(`/blood-requests/${id}`)
}

// Inventory API
export const inventoryAPI = {
  getAll: () => api.get('/inventory'),
  getByBloodType: (bloodType) => api.get(`/inventory/${bloodType}`),
  update: (bloodType, units) => api.put(`/inventory/${bloodType}`, { units })
}

// Hospital API
export const hospitalAPI = {
  getProfile: () => api.get('/hospital/profile'),
  updateProfile: (profileData) => api.put('/hospital/profile', profileData),
  getSettings: () => api.get('/hospital/settings'),
  updateSettings: (settings) => api.put('/hospital/settings', settings)
}

// Dashboard API
export const dashboardAPI = {
  getStats: () => api.get('/dashboard/stats'),
  getRecentDonations: () => api.get('/dashboard/recent-donations'),
  getUrgentRequests: () => api.get('/dashboard/urgent-requests')
}

export default api
