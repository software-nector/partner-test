import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { adminService } from '../../services/adminService'
import toast from 'react-hot-toast'

export default function DashboardHome() {
    const [stats, setStats] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchAnalytics()
    }, [])

    const fetchAnalytics = async () => {
        try {
            const response = await adminService.getAnalytics()
            setStats(response.data)
        } catch (error) {
            toast.error('Failed to load analytics')
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        )
    }

    const statCards = [
        { icon: '💰', label: 'Total Rewards', value: stats?.total_rewards || 0, color: 'from-yellow-500 to-orange-500' },
        { icon: '⏳', label: 'Pending Rewards', value: stats?.pending_rewards || 0, color: 'from-blue-500 to-cyan-500' },
        { icon: '✅', label: 'Approved Rewards', value: stats?.approved_rewards || 0, color: 'from-green-500 to-emerald-500' },
        { icon: '🎬', label: 'Total Reels', value: stats?.total_reels || 0, color: 'from-blue-500 to-cyan-500' },
        { icon: '⏰', label: 'Pending Reels', value: stats?.pending_reels || 0, color: 'from-indigo-500 to-purple-500' },
        { icon: '🚚', label: 'Shipped Reels', value: stats?.shipped_reels || 0, color: 'from-teal-500 to-green-500' },
    ]

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-4xl font-bold gradient-text mb-2">Dashboard</h1>
                <p className="text-gray-400">Welcome to Purna Gummies Admin Panel</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {statCards.map((stat, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="glass rounded-2xl p-6 hover:scale-105 transition-transform"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-5xl">{stat.icon}</span>
                            <div className={`px-4 py-2 rounded-full bg-gradient-to-r ${stat.color} text-white font-bold text-2xl`}>
                                {stat.value}
                            </div>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-300">{stat.label}</h3>
                    </motion.div>
                ))}
            </div>

            {/* Quick Actions */}
            <div className="glass rounded-2xl p-6">
                <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <motion.a
                        href="/admin/dashboard/rewards"
                        whileHover={{ scale: 1.02 }}
                        className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-yellow-500/20 to-orange-500/20 hover:from-yellow-500/30 hover:to-orange-500/30 transition"
                    >
                        <span className="text-4xl">💰</span>
                        <div>
                            <h3 className="font-bold text-lg">Manage Rewards</h3>
                            <p className="text-sm text-gray-400">Review and approve reward claims</p>
                        </div>
                    </motion.a>

                    <motion.a
                        href="/admin/dashboard/reels"
                        whileHover={{ scale: 1.02 }}
                        className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30 transition"
                    >
                        <span className="text-4xl">🎬</span>
                        <div>
                            <h3 className="font-bold text-lg">Manage Reels</h3>
                            <p className="text-sm text-gray-400">Review and ship reel submissions</p>
                        </div>
                    </motion.a>
                </div>
            </div>
        </div>
    )
}
