import api from './api'

export const rewardService = {
    // Submit reward claim
    submitReward: async (formData) => {
        return api.post('/rewards/submit', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        })
    },

    // Get user's rewards
    getMyRewards: async () => {
        return api.get('/rewards/my-claims')
    },

    // Submit free product request
    submitFreeProduct: async (formData) => {
        return api.post('/reels/submit', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        })
    },

    // Get user's reel submissions
    getMyReels: async () => {
        return api.get('/reels/my-submissions')
    },
}
