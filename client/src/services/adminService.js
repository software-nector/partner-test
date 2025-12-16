import api from './api'

export const adminService = {
    // Analytics
    getAnalytics: async () => {
        return api.get('/admin/analytics')
    },

    // Rewards Management
    getAllRewards: async (status = null) => {
        const params = status ? { status } : {}
        return api.get('/admin/rewards', { params })
    },

    getRewardById: async (id) => {
        return api.get(`/admin/rewards/${id}`)
    },

    updateRewardStatus: async (id, status, notes = null) => {
        return api.put(`/admin/rewards/${id}`, { status, admin_notes: notes })
    },

    bulkPayment: async (rewardIds, transactionId = null) => {
        return api.post('/admin/rewards/bulk-payment', {
            reward_ids: rewardIds,
            transaction_id: transactionId,
            payment_method: 'UPI'
        })
    },

    // Reels Management
    getAllReels: async (status = null) => {
        const params = status ? { status } : {}
        return api.get('/admin/reels', { params })
    },

    getReelById: async (id) => {
        return api.get(`/admin/reels/${id}`)
    },

    updateReelStatus: async (id, status, trackingNumber = null, notes = null) => {
        return api.put(`/admin/reels/${id}`, {
            status,
            tracking_number: trackingNumber,
            admin_notes: notes
        })
    }
}
