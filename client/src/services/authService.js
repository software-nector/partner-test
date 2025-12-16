import api from './api'

export const authService = {
    // Login with phone and coupon
    login: async (phone, coupon) => {
        return api.post('/auth/login', { phone, coupon })
    },

    // Verify coupon code
    verifyCoupon: async (coupon) => {
        return api.post('/auth/verify-coupon', { coupon })
    },

    // Get current user
    getCurrentUser: async () => {
        return api.get('/auth/me')
    },

    // Admin login
    adminLogin: async (email, password) => {
        return api.post('/admin/login', { email, password })
    },
}
