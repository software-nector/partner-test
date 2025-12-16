import api from './api'

export const videoService = {
    // Get all videos
    getVideos: async () => {
        return api.get('/videos/list')
    },

    // Get specific video
    getVideo: async (videoId) => {
        return api.get(`/videos/${videoId}`)
    },
}
