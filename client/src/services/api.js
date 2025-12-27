import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://194.238.18.10:8001'

const api = axios.create({
    baseURL: `${API_URL}/api`,
    headers: {
        'Content-Type': 'application/json',
    },
})

// Request interceptor to add auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token')
        const adminToken = localStorage.getItem('admin_token')

        // Prioritize admin token for admin routes or if user token is missing
        if (config.url.includes('/admin/') && adminToken) {
            config.headers.Authorization = `Bearer ${adminToken}`
        } else if (token) {
            config.headers.Authorization = `Bearer ${token}`
        } else if (adminToken) {
            // Fallback to admin token if only that exists
            config.headers.Authorization = `Bearer ${adminToken}`
        }
        return config
    },
    (error) => {
        return Promise.reject(error)
    }
)

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Check if we are in admin section
            const isAdminPath = window.location.pathname.startsWith('/admin')

            if (isAdminPath) {
                localStorage.removeItem('admin_token')
                window.location.href = '/admin/login'
            } else {
                localStorage.removeItem('token')
                localStorage.removeItem('user')
                window.location.href = '/'
            }
        }
        return Promise.reject(error)
    }
)

export default api
