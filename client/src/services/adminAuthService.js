import api from './api'

export const adminAuthService = {
    // Step 1: Login with email and password, get OTP
    login: async (email, password) => {
        return api.post('/admin/auth/login', { email, password })
    },

    // Step 2: Verify OTP and get token
    verifyOTP: async (email, otp) => {
        return api.post('/admin/auth/verify-otp', { email, otp })
    },

    // Resend OTP
    resendOTP: async (email) => {
        return api.post('/admin/auth/resend-otp', { email })
    },

    // Store admin token
    setAdminToken: (token) => {
        localStorage.setItem('admin_token', token)
    },

    // Get admin token
    getAdminToken: () => {
        return localStorage.getItem('admin_token')
    },

    // Remove admin token
    removeAdminToken: () => {
        localStorage.removeItem('admin_token')
    },

    // Check if admin is logged in
    isAdminLoggedIn: () => {
        return !!localStorage.getItem('admin_token')
    }
}
