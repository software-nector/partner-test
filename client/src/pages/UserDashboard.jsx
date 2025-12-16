import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'

export default function UserDashboard() {
    const navigate = useNavigate()
    const { user, isAuthenticated, logout } = useAuth()
    const [dashboardData, setDashboardData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState('overview')

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/')
            return
        }
        fetchDashboard()
    }, [isAuthenticated])

    const fetchDashboard = async () => {
        try {
            const response = await fetch('http://localhost:8000/api/user/dashboard', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            })
            if (response.ok) {
                const data = await response.json()
                setDashboardData(data)
            }
        } catch (error) {
            console.error('Error fetching dashboard:', error)
            toast.error('Failed to load dashboard')
        } finally {
            setLoading(false)
        }
    }

    const getStatusBadge = (status) => {
        const badges = {
            pending: { bg: 'bg-white/10', text: 'text-white/80', border: 'border-white/20', icon: '⏳', label: 'Pending' },
            approved: { bg: 'bg-white/10', text: 'text-white/80', border: 'border-white/20', icon: '✓', label: 'Approved' },
            rejected: { bg: 'bg-white/10', text: 'text-white/80', border: 'border-white/20', icon: '✕', label: 'Rejected' },
            paid: { bg: 'bg-white/10', text: 'text-white/80', border: 'border-white/20', icon: '₹', label: 'Paid' },
            shipped: { bg: 'bg-white/10', text: 'text-white/80', border: 'border-white/20', icon: '📦', label: 'Shipped' }
        }
        return badges[status] || badges.pending
    }

    if (!isAuthenticated) return null
    if (loading) {
        return (
            <div className="min-h-screen relative overflow-hidden">
                <div className="flex items-center justify-center min-h-screen">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
                        <p className="text-white/60 font-medium">Loading...</p>
                    </div>
                </div>
            </div>
        )
    }

    const stats = dashboardData?.stats || { rewards: {}, reels: {} }
    const rewards = dashboardData?.recent_rewards || []
    const reels = dashboardData?.recent_reels || []

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
                            <span className="text-xs sm:text-sm text-gray-400 hidden sm:block">Hi, {user?.name || 'User'}</span>
                            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => navigate('/')} className="px-3 sm:px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white font-semibold transition text-xs sm:text-sm">
                                Home
                            </motion.button>
                            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={logout} className="px-3 sm:px-4 py-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 font-semibold transition text-xs sm:text-sm">
                                Logout
                            </motion.button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="py-6 sm:py-10 px-4 text-center relative">
                <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="max-w-7xl mx-auto">
                    <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-display font-bold mb-3 sm:mb-4 gradient-text leading-tight">
                        Your Dashboard 📊
                    </h1>
                    <p className="text-base sm:text-lg md:text-xl text-gray-300 mb-6 sm:mb-8 px-4">
                        Track your submissions and rewards
                    </p>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6 text-left">
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-xl p-4 border border-white/10">
                            <div className="text-2xl mb-2">💰</div>
                            <div className="text-2xl font-bold text-white">{stats.rewards.total || 0}</div>
                            <div className="text-gray-400 text-xs">Rewards</div>
                        </motion.div>
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-xl p-4 border border-white/10">
                            <div className="text-2xl mb-2">🎬</div>
                            <div className="text-2xl font-bold text-white">{stats.reels.total || 0}</div>
                            <div className="text-gray-400 text-xs">Reels</div>
                        </motion.div>
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-xl p-4 border border-white/10">
                            <div className="text-2xl mb-2">⏳</div>
                            <div className="text-2xl font-bold text-white">{(stats.rewards.pending || 0) + (stats.reels.pending || 0)}</div>
                            <div className="text-gray-400 text-xs">Pending</div>
                        </motion.div>
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-xl p-4 border border-white/10">
                            <div className="text-2xl mb-2">✅</div>
                            <div className="text-2xl font-bold text-white">{(stats.rewards.approved || 0) + (stats.reels.approved || 0)}</div>
                            <div className="text-gray-400 text-xs">Approved</div>
                        </motion.div>
                    </div>

                    {/* Quick Actions */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
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
                        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setActiveTab('overview')} className="glass rounded-xl p-4 text-left border border-white/10 hover:border-white/20 transition group">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center text-xl">📊</div>
                                <div className="flex-1">
                                    <h3 className="font-semibold text-white text-sm">View Details</h3>
                                    <p className="text-gray-400 text-xs">See all submissions</p>
                                </div>
                                <svg className="w-4 h-4 text-gray-400 group-hover:text-white transition" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                            </div>
                        </motion.button>
                    </div>

                    {/* Tabs */}
                    <div className="mb-6">
                        <div className="flex gap-2 p-1.5 rounded-xl glass border border-white/10">
                            {['overview', 'rewards', 'reels'].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${activeTab === tab ? 'bg-white/10 text-white' : 'text-white/60 hover:text-white'
                                        }`}
                                >
                                    {tab === 'overview' && '📊 Overview'}
                                    {tab === 'rewards' && `💰 Rewards (${rewards.length})`}
                                    {tab === 'reels' && `🎬 Reels (${reels.length})`}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Content */}
                    <AnimatePresence mode="wait">
                        {activeTab === 'overview' && (
                            <motion.div key="overview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                <div className="glass rounded-xl border border-white/10 p-6 text-left">
                                    <h3 className="text-xl font-bold text-white mb-4">💰 Recent Rewards</h3>
                                    <div className="space-y-3">
                                        {rewards.slice(0, 3).map((reward) => {
                                            const badge = getStatusBadge(reward.status)
                                            return (
                                                <div key={reward.id} className="p-4 rounded-lg bg-white/5 border border-white/10">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <span className="font-semibold text-white">{reward.product_name}</span>
                                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${badge.bg} ${badge.text} border ${badge.border}`}>
                                                            {badge.icon} {badge.label}
                                                        </span>
                                                    </div>
                                                    <p className="text-white/60 text-sm">{reward.platform_name} • {new Date(reward.created_at).toLocaleDateString()}</p>
                                                </div>
                                            )
                                        })}
                                        {rewards.length === 0 && (
                                            <div className="text-center py-8 text-white/40">
                                                <p className="text-4xl mb-2">💰</p>
                                                <p>No rewards yet</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="glass rounded-xl border border-white/10 p-6 text-left">
                                    <h3 className="text-xl font-bold text-white mb-4">🎬 Recent Reels</h3>
                                    <div className="space-y-3">
                                        {reels.slice(0, 3).map((reel) => {
                                            const badge = getStatusBadge(reel.status)
                                            return (
                                                <div key={reel.id} className="p-4 rounded-lg bg-white/5 border border-white/10">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <span className="font-semibold text-white">{reel.product_name}</span>
                                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${badge.bg} ${badge.text} border ${badge.border}`}>
                                                            {badge.icon} {badge.label}
                                                        </span>
                                                    </div>
                                                    <p className="text-white/60 text-sm">@{reel.instagram_handle} • {new Date(reel.created_at).toLocaleDateString()}</p>
                                                </div>
                                            )
                                        })}
                                        {reels.length === 0 && (
                                            <div className="text-center py-8 text-white/40">
                                                <p className="text-4xl mb-2">🎬</p>
                                                <p>No reels yet</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'rewards' && (
                            <motion.div key="rewards" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                                {rewards.length === 0 ? (
                                    <div className="glass rounded-xl border border-white/10 p-12 text-center">
                                        <div className="text-6xl mb-4">💰</div>
                                        <h3 className="text-xl font-bold text-white mb-2">No rewards yet</h3>
                                        <p className="text-white/60 mb-6">Start claiming rewards</p>
                                        <button onClick={() => navigate('/rewards')} className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold transition-all">
                                            Claim Reward →
                                        </button>
                                    </div>
                                ) : (
                                    rewards.map((reward) => {
                                        const badge = getStatusBadge(reward.status)
                                        return (
                                            <div key={reward.id} className="glass rounded-xl border border-white/10 p-6 text-left">
                                                <div className="flex items-center gap-4 mb-3">
                                                    <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center text-2xl">💰</div>
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-3 mb-1">
                                                            <h3 className="text-lg font-bold text-white">{reward.product_name}</h3>
                                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${badge.bg} ${badge.text} border ${badge.border}`}>
                                                                {badge.icon} {badge.label}
                                                            </span>
                                                        </div>
                                                        <p className="text-white/60 text-sm">{reward.platform_name} • {new Date(reward.created_at).toLocaleDateString()}</p>
                                                    </div>
                                                </div>
                                                {reward.rejection_reason && (
                                                    <div className="mt-3 p-4 rounded-lg bg-rose-500/10 border border-rose-500/30">
                                                        <p className="text-rose-300 font-semibold text-sm mb-1">❌ Rejection Reason:</p>
                                                        <p className="text-rose-200 text-sm">{reward.rejection_reason}</p>
                                                    </div>
                                                )}
                                            </div>
                                        )
                                    })
                                )}
                            </motion.div>
                        )}

                        {activeTab === 'reels' && (
                            <motion.div key="reels" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                                {reels.length === 0 ? (
                                    <div className="glass rounded-xl border border-white/10 p-12 text-center">
                                        <div className="text-6xl mb-4">🎬</div>
                                        <h3 className="text-xl font-bold text-white mb-2">No reels yet</h3>
                                        <p className="text-white/60 mb-6">Get FREE products</p>
                                        <button onClick={() => navigate('/reels')} className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold transition-all">
                                            Submit Reel →
                                        </button>
                                    </div>
                                ) : (
                                    reels.map((reel) => {
                                        const badge = getStatusBadge(reel.status)
                                        return (
                                            <div key={reel.id} className="glass rounded-xl border border-white/10 p-6 text-left">
                                                <div className="flex items-center gap-4 mb-3">
                                                    <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center text-2xl">🎬</div>
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-3 mb-1">
                                                            <h3 className="text-lg font-bold text-white">{reel.product_name}</h3>
                                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${badge.bg} ${badge.text} border ${badge.border}`}>
                                                                {badge.icon} {badge.label}
                                                            </span>
                                                        </div>
                                                        <p className="text-white/60 text-sm">@{reel.instagram_handle} • {new Date(reel.created_at).toLocaleDateString()}</p>
                                                    </div>
                                                </div>
                                                {reel.rejection_reason && (
                                                    <div className="mt-3 p-4 rounded-lg bg-rose-500/10 border border-rose-500/30">
                                                        <p className="text-rose-300 font-semibold text-sm mb-1">❌ Rejection Reason:</p>
                                                        <p className="text-rose-200 text-sm">{reel.rejection_reason}</p>
                                                    </div>
                                                )}
                                            </div>
                                        )
                                    })
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </section>
        </div>
    )
}
