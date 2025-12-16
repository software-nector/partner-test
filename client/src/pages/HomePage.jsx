import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import ReviewForm from '../components/ReviewForm'
import LoginModal from '../components/LoginModal'
import { videoService } from '../services/videoService'

export default function HomePage() {
    const navigate = useNavigate()
    const { user, isAuthenticated, logout } = useAuth()
    const [showLoginModal, setShowLoginModal] = useState(false)
    const [showReviewForm, setShowReviewForm] = useState(false)
    const [videoData, setVideoData] = useState(null)
    const [dashboardData, setDashboardData] = useState(null)

    useEffect(() => {
        const fetchVideo = async () => {
            try {
                const response = await videoService.getVideo('video_1')
                setVideoData(response.data)
            } catch (error) {
                console.error('Failed to fetch video:', error)
            }
        }
        fetchVideo()

        // Fetch dashboard data if logged in
        if (isAuthenticated) {
            fetchDashboard()
        }
    }, [isAuthenticated])

    const fetchDashboard = async () => {
        try {
            console.log('[DEBUG] Fetching dashboard data...')
            console.log('[DEBUG] isAuthenticated:', isAuthenticated)
            console.log('[DEBUG] Token:', localStorage.getItem('token'))

            const response = await fetch('http://localhost:8000/api/user/dashboard', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            })

            console.log('[DEBUG] Dashboard response status:', response.status)

            if (response.ok) {
                const data = await response.json()
                console.log('[DEBUG] Dashboard data received:', data)
                setDashboardData(data)
            } else {
                console.error('[DEBUG] Dashboard fetch failed:', response.status)
            }
        } catch (error) {
            console.error('[DEBUG] Error fetching dashboard:', error)
        }
    }

    const handleGiveReviewClick = () => {
        if (!isAuthenticated) {
            setShowLoginModal(true)
            toast('Please login to give review', { icon: '⭐', duration: 2000 })
        } else {
            setShowReviewForm(true)
        }
    }

    const handleReviewSubmit = async (reviewData) => {
        console.log('Review submitted:', reviewData)
        toast.success('Review submitted successfully!')

        // Show reel CTA after 1 second
        setTimeout(() => {
            toast((t) => (
                <div className="flex flex-col gap-2">
                    <p className="font-semibold">🎁 Want FREE Product?</p>
                    <p className="text-sm">Create an Instagram reel and get free products!</p>
                    <button
                        onClick={() => {
                            toast.dismiss(t.id)
                            navigate('/reels')
                        }}
                        className="mt-2 px-4 py-2 bg-purple-600 rounded-lg font-semibold hover:bg-purple-700 transition"
                    >
                        Submit Reel →
                    </button>
                </div>
            ), { duration: 6000, icon: '🎬' })
        }, 1000)

        setShowReviewForm(false)
    }

    return (
        <div className="min-h-screen relative overflow-hidden">
            {/* Navbar */}
            <nav className="sticky top-2 sm:top-4 mx-2 sm:mx-4 z-50">
                <div className="glass rounded-xl sm:rounded-2xl p-3 sm:p-4 animate-slideUp">
                    <div className="flex items-center justify-between max-w-7xl mx-auto">
                        <motion.div className="flex items-center gap-2 sm:gap-3" whileHover={{ scale: 1.05 }}>
                            <span className="text-3xl sm:text-4xl md:text-5xl float">🍬</span>
                            <span className="text-lg sm:text-xl md:text-2xl font-display font-bold gradient-text">Purna Gummies</span>
                        </motion.div>

                        <div className="flex items-center gap-2 sm:gap-4">
                            {isAuthenticated ? (
                                <>
                                    <span className="text-xs sm:text-sm text-gray-400 hidden sm:block">Hi, {user?.name || 'User'}</span>
                                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={logout} className="px-3 sm:px-4 py-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 font-semibold transition text-xs sm:text-sm">
                                        Logout
                                    </motion.button>
                                </>
                            ) : (
                                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setShowLoginModal(true)} className="px-3 sm:px-6 py-2 sm:py-3 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold transition flex items-center gap-2 text-xs sm:text-base">
                                    <svg className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
                                    <span className="hidden sm:inline">Login with WhatsApp</span>
                                    <span className="sm:hidden">Login</span>
                                </motion.button>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="py-6 sm:py-10 px-4 text-center relative">
                <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="max-w-7xl mx-auto">
                    <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-display font-bold mb-3 sm:mb-4 gradient-text leading-tight">
                        Welcome to Purna Gummies Rewards! 🎁
                    </h1>
                    <p className="text-base sm:text-lg md:text-xl text-gray-300 mb-6 sm:mb-8 px-4">
                        Watch expert doctor's advice and leave your valuable review
                    </p>

                    {/* Two Cards Side by Side */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-8 sm:mb-16">
                        {/* Video Card - Left */}
                        <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="glass rounded-2xl sm:rounded-3xl overflow-hidden">
                            <div className="relative aspect-video bg-black">
                                {videoData ? (
                                    <video className="w-full h-full object-cover" autoPlay loop muted playsInline>
                                        <source src={videoData.video_url} type="video/mp4" />
                                    </video>
                                ) : (
                                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-800/50 to-slate-800/50">
                                        <div className="text-white text-base sm:text-xl">Loading...</div>
                                    </div>
                                )}
                            </div>
                            <div className="p-4 sm:p-6 bg-gradient-to-br from-gray-900/80 to-black/80">
                                <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-2">{videoData?.title || 'Expert Doctor\'s Advice on Purna Gummies'}</h3>
                                <p className="text-gray-300 mb-4 sm:mb-6 text-xs sm:text-sm">{videoData?.description || 'Watch this informative video about the benefits of Purna Gummies and how they can improve your health.'}</p>
                                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleGiveReviewClick} className="w-full py-3 sm:py-4 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl sm:rounded-2xl font-bold text-sm sm:text-base md:text-lg hover:shadow-2xl hover:shadow-blue-500/20 transition-all flex items-center justify-center gap-2">
                                    <span className="text-xl sm:text-2xl">⭐</span> Give Review
                                </motion.button>
                            </div>
                        </motion.div>

                        {/* Claim Reward Card - Right */}
                        <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 }}
                            whileHover={{ scale: 1.02 }}
                            className="glass rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-10 card-hover cursor-pointer relative overflow-hidden group flex flex-col items-center justify-center"
                            onClick={() => {
                                if (!isAuthenticated) {
                                    setShowLoginModal(true);
                                    toast('Please login to claim rewards', { icon: '💰' })
                                } else {
                                    // Navigate to rewards page
                                    navigate('/rewards')
                                }
                            }}
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <div className="relative z-10 text-center">
                                <div className="text-5xl sm:text-6xl md:text-7xl mb-3 sm:mb-4 animate-bounce">💰</div>
                                <h3 className="text-2xl sm:text-3xl font-bold mb-2 sm:mb-3 text-white">Claim Reward</h3>
                                <p className="text-gray-300 text-sm sm:text-base md:text-lg mb-3 sm:mb-4 px-2">
                                    Upload your review screenshot and get instant UPI cashback
                                </p>
                                <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    className="px-6 sm:px-8 md:px-10 py-2 sm:py-3 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full font-bold text-sm sm:text-base md:text-lg hover:shadow-2xl hover:shadow-yellow-500/50 transition-all"
                                >
                                    Claim Now →
                                </motion.button>
                            </div>
                        </motion.div>
                    </div>

                    {/* User Dashboard Section - Shows when logged in */}
                    {(() => {
                        console.log('[DEBUG] Render check - isAuthenticated:', isAuthenticated)
                        console.log('[DEBUG] Render check - dashboardData:', dashboardData)
                        return isAuthenticated && dashboardData && (
                            <div className="mb-12">
                                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6 text-left">
                                    <h2 className="text-2xl font-bold text-white mb-1">Your Activity</h2>
                                    <p className="text-gray-400 text-sm">Track your submissions</p>
                                </motion.div>
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
                                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-xl p-4 border border-white/10">
                                        <div className="text-2xl mb-2">💰</div>
                                        <div className="text-2xl font-bold text-white">{dashboardData.stats.rewards.total || 0}</div>
                                        <div className="text-gray-400 text-xs">Rewards</div>
                                    </motion.div>
                                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-xl p-4 border border-white/10">
                                        <div className="text-2xl mb-2">🎬</div>
                                        <div className="text-2xl font-bold text-white">{dashboardData.stats.reels.total || 0}</div>
                                        <div className="text-gray-400 text-xs">Reels</div>
                                    </motion.div>
                                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-xl p-4 border border-white/10">
                                        <div className="text-2xl mb-2">⏳</div>
                                        <div className="text-2xl font-bold text-white">{(dashboardData.stats.rewards.pending || 0) + (dashboardData.stats.reels.pending || 0)}</div>
                                        <div className="text-gray-400 text-xs">Pending</div>
                                    </motion.div>
                                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-xl p-4 border border-white/10">
                                        <div className="text-2xl mb-2">✅</div>
                                        <div className="text-2xl font-bold text-white">{(dashboardData.stats.rewards.approved || 0) + (dashboardData.stats.reels.approved || 0)}</div>
                                        <div className="text-gray-400 text-xs">Approved</div>
                                    </motion.div>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => navigate('/rewards')} className="glass rounded-xl p-4 text-left border border-white/10 hover:border-white/20 transition group">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center text-xl">💰</div>
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-white text-sm">Claim Reward</h3>
                                                <p className="text-gray-400 text-xs">Upload screenshot</p>
                                            </div>
                                            <svg className="w-4 h-4 text-gray-400 group-hover:text-white transition" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                        </div>
                                    </motion.button>
                                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => navigate('/reels')} className="glass rounded-xl p-4 text-left border border-white/10 hover:border-white/20 transition group">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center text-xl">🎬</div>
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-white text-sm">Submit Reel</h3>
                                                <p className="text-gray-400 text-xs">Get FREE product</p>
                                            </div>
                                            <svg className="w-4 h-4 text-gray-400 group-hover:text-white transition" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                        </div>
                                    </motion.button>
                                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => navigate('/dashboard')} className="glass rounded-xl p-4 text-left border border-white/10 hover:border-white/20 transition group">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center text-xl">📊</div>
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-white text-sm">View All</h3>
                                                <p className="text-gray-400 text-xs">Full dashboard</p>
                                            </div>
                                            <svg className="w-4 h-4 text-gray-400 group-hover:text-white transition" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                        </div>
                                    </motion.button>
                                </div>
                            </div>
                        )
                    })()}

                    {/* Features */}
                    <div className="mt-16">
                        <h2 className="text-4xl font-bold mb-10 gradient-text">Why Choose Us?</h2>
                        <div className="grid md:grid-cols-3 gap-6">
                            {[
                                { icon: '⚡', title: 'Instant Rewards', desc: 'Get cashback within 24 hours' },
                                { icon: '🎯', title: 'Easy Process', desc: 'Simple 3-step claim process' },
                                { icon: '🔒', title: 'Secure & Safe', desc: '100% secure transactions' }
                            ].map((f, i) => (
                                <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 + i * 0.1 }} className="glass rounded-2xl p-6 hover:bg-white/10 transition">
                                    <div className="text-5xl mb-4">{f.icon}</div>
                                    <h4 className="text-xl font-bold mb-2">{f.title}</h4>
                                    <p className="text-gray-400">{f.desc}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </motion.div>
            </section>

            {/* Review Form Modal */}
            {showReviewForm && <ReviewForm onSubmit={handleReviewSubmit} onClose={() => setShowReviewForm(false)} />}

            {/* Login Modal */}
            <LoginModal isOpen={showLoginModal && !isAuthenticated} onClose={() => setShowLoginModal(false)} />
        </div>
    )
}
