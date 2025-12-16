import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Play, Pause, Volume2, VolumeX, Maximize } from 'lucide-react'
import { videoService } from '../services/videoService'
import toast from 'react-hot-toast'

export default function VideoPlayerModal({ isOpen, onClose, onVideoComplete, videoId = 'video_1' }) {
    const [isPlaying, setIsPlaying] = useState(false)
    const [isMuted, setIsMuted] = useState(false)
    const [progress, setProgress] = useState(0)
    const [hasCompleted, setHasCompleted] = useState(false)
    const [videoData, setVideoData] = useState(null)
    const [loading, setLoading] = useState(true)
    const videoRef = useRef(null)

    // Fetch video data from backend
    useEffect(() => {
        const fetchVideo = async () => {
            if (isOpen && videoId) {
                try {
                    setLoading(true)
                    const response = await videoService.getVideo(videoId)
                    setVideoData(response.data)
                } catch (error) {
                    console.error('Failed to fetch video:', error)
                    toast.error('Failed to load video')
                } finally {
                    setLoading(false)
                }
            }
        }
        fetchVideo()
    }, [isOpen, videoId])

    useEffect(() => {
        if (isOpen && videoRef.current && videoData) {
            // Auto-play when modal opens and video data is loaded
            videoRef.current.play()
            setIsPlaying(true)
        }
    }, [isOpen, videoData])

    const handleTimeUpdate = () => {
        if (videoRef.current) {
            const percent = (videoRef.current.currentTime / videoRef.current.duration) * 100
            setProgress(percent)
        }
    }

    const handleVideoEnd = () => {
        setHasCompleted(true)
        setIsPlaying(false)
        onVideoComplete?.()
    }

    const togglePlay = () => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause()
            } else {
                videoRef.current.play()
            }
            setIsPlaying(!isPlaying)
        }
    }

    const toggleMute = () => {
        if (videoRef.current) {
            videoRef.current.muted = !isMuted
            setIsMuted(!isMuted)
        }
    }

    const handleProgressClick = (e) => {
        if (videoRef.current) {
            const rect = e.currentTarget.getBoundingClientRect()
            const percent = (e.clientX - rect.left) / rect.width
            videoRef.current.currentTime = percent * videoRef.current.duration
        }
    }

    const toggleFullscreen = () => {
        if (videoRef.current) {
            if (videoRef.current.requestFullscreen) {
                videoRef.current.requestFullscreen()
            }
        }
    }

    if (!isOpen) return null

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="relative w-full max-w-4xl bg-gradient-to-br from-gray-900 to-black rounded-2xl overflow-hidden shadow-2xl"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/50 hover:bg-black/70 transition text-white"
                    >
                        <X className="w-6 h-6" />
                    </button>

                    {/* Video Container */}
                    <div className="relative aspect-video bg-black">
                        {loading ? (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="text-white text-xl">Loading video...</div>
                            </div>
                        ) : (
                            <>
                                <video
                                    ref={videoRef}
                                    className="w-full h-full"
                                    onTimeUpdate={handleTimeUpdate}
                                    onEnded={handleVideoEnd}
                                    onPlay={() => setIsPlaying(true)}
                                    onPause={() => setIsPlaying(false)}
                                >
                                    <source src={videoData?.video_url} type="video/mp4" />
                                    Your browser does not support the video tag.
                                </video>

                                {/* Video Controls Overlay */}
                                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                                    {/* Progress Bar */}
                                    <div
                                        className="w-full h-1 bg-gray-600 rounded-full mb-4 cursor-pointer"
                                        onClick={handleProgressClick}
                                    >
                                        <div
                                            className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all"
                                            style={{ width: `${progress}%` }}
                                        />
                                    </div>

                                    {/* Controls */}
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            {/* Play/Pause */}
                                            <button
                                                onClick={togglePlay}
                                                className="p-2 rounded-full hover:bg-white/10 transition"
                                            >
                                                {isPlaying ? (
                                                    <Pause className="w-6 h-6 text-white" />
                                                ) : (
                                                    <Play className="w-6 h-6 text-white" />
                                                )}
                                            </button>

                                            {/* Mute/Unmute */}
                                            <button
                                                onClick={toggleMute}
                                                className="p-2 rounded-full hover:bg-white/10 transition"
                                            >
                                                {isMuted ? (
                                                    <VolumeX className="w-6 h-6 text-white" />
                                                ) : (
                                                    <Volume2 className="w-6 h-6 text-white" />
                                                )}
                                            </button>

                                            {/* Time Display */}
                                            <span className="text-white text-sm">
                                                {Math.floor((videoRef.current?.currentTime || 0) / 60)}:
                                                {String(Math.floor((videoRef.current?.currentTime || 0) % 60)).padStart(2, '0')}
                                                {' / '}
                                                {Math.floor((videoRef.current?.duration || 0) / 60)}:
                                                {String(Math.floor((videoRef.current?.duration || 0) % 60)).padStart(2, '0')}
                                            </span>
                                        </div>

                                        {/* Fullscreen */}
                                        <button
                                            onClick={toggleFullscreen}
                                            className="p-2 rounded-full hover:bg-white/10 transition"
                                        >
                                            <Maximize className="w-6 h-6 text-white" />
                                        </button>
                                    </div>
                                </div>

                                {/* Video Completed Overlay */}
                                {hasCompleted && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="absolute inset-0 bg-black/70 flex items-center justify-center"
                                    >
                                        <div className="text-center">
                                            <div className="text-6xl mb-4">✅</div>
                                            <h3 className="text-2xl font-bold text-white mb-2">Video Completed!</h3>
                                            <p className="text-gray-300">You can now give your review</p>
                                        </div>
                                    </motion.div>
                                )}
                            </>
                        )}
                    </div>

                    {/* Video Info */}
                    <div className="p-6 bg-gradient-to-r from-purple-900/50 to-pink-900/50">
                        <h3 className="text-2xl font-bold text-white mb-2">
                            {videoData?.title || 'Loading...'}
                        </h3>
                        <p className="text-gray-300">
                            {videoData?.description || 'Loading video information...'}
                        </p>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    )
}
