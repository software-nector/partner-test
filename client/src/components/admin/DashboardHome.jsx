import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { adminService } from '../../services/adminService'
import toast from 'react-hot-toast'
import {
    Wallet, Timer, CheckCircle, Video, Clock, Shovel,
    ArrowUpRight, TrendingUp, Users, Activity
} from 'lucide-react'

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
            <div className="p-12 flex items-center justify-center min-h-[400px]">
                <div className="w-10 h-10 border-2 border-white/5 border-t-blue-500 rounded-full animate-spin"></div>
            </div>
        )
    }

    const statCards = [
        {
            icon: <Wallet className="w-6 h-6" />,
            label: 'Total Rewards',
            value: stats?.total_rewards || 0,
            color: 'text-blue-400',
            bg: 'bg-blue-500/10',
            trend: '+12%',
            desc: 'Total cashback generated'
        },
        {
            icon: <Timer className="w-6 h-6" />,
            label: 'Pending Rewards',
            value: stats?.pending_rewards || 0,
            color: 'text-amber-400',
            bg: 'bg-amber-500/10',
            trend: 'Action required',
            desc: 'Awaiting your approval'
        },
        {
            icon: <CheckCircle className="w-6 h-6" />,
            label: 'Approved Rewards',
            value: stats?.approved_rewards || 0,
            color: 'text-emerald-400',
            bg: 'bg-emerald-500/10',
            trend: '94% Success',
            desc: 'Processed successfully'
        },
        {
            icon: <Video className="w-6 h-6" />,
            label: 'Total Reels',
            value: stats?.total_reels || 0,
            color: 'text-purple-400',
            bg: 'bg-purple-500/10',
            trend: '+5 today',
            desc: 'Social media submissions'
        },
        {
            icon: <Clock className="w-6 h-6" />,
            label: 'Pending Reels',
            value: stats?.pending_reels || 0,
            color: 'text-rose-400',
            bg: 'bg-rose-500/10',
            trend: 'Critical priority',
            desc: 'Review submissions'
        },
        {
            icon: <Activity className="w-6 h-6" />,
            label: 'Shipped Gifts',
            value: stats?.shipped_reels || 0,
            color: 'text-cyan-400',
            bg: 'bg-cyan-500/10',
            trend: 'On track',
            desc: 'Logistics dispatched'
        },
    ]

    return (
        <div className="p-6 lg:p-10 space-y-10">
            <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 overflow-hidden">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                >
                    <h1 className="text-3xl lg:text-4xl font-bold text-white tracking-tight">Overview</h1>
                    <p className="text-slate-500 mt-1 font-medium">Real-time performance and audit summary</p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-3 bg-white/5 border border-white/5 px-4 py-2 rounded-2xl"
                >
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">System Online</span>
                </motion.div>
            </header>

            {/* Stats Grid - High Fidelity */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {statCards.map((stat, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="group bg-[#0b1022] p-6 rounded-[2rem] border border-white/5 hover:border-blue-500/30 transition-all duration-300 relative overflow-hidden flex flex-col justify-between h-48"
                    >
                        <div className="flex items-start justify-between relative z-10">
                            <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color} border border-white/5 shadow-inner`}>
                                {stat.icon}
                            </div>
                            <div className="flex flex-col items-end">
                                <span className="text-[10px] font-black tracking-widest uppercase text-slate-500 mb-1">{stat.trend}</span>
                                <ArrowUpRight className="w-4 h-4 text-slate-700 group-hover:text-blue-400 transition-colors" />
                            </div>
                        </div>

                        <div className="relative z-10">
                            <div className="text-4xl font-black text-white mb-1">{stat.value}</div>
                            <div className="text-sm font-bold text-slate-300">{stat.label}</div>
                            <div className="text-[10px] text-slate-600 font-medium uppercase tracking-tighter mt-1">{stat.desc}</div>
                        </div>

                        {/* Subtle background glow on hover */}
                        <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-blue-500/5 blur-[50px] group-hover:bg-blue-500/10 transition-colors" />
                    </motion.div>
                ))}
            </div>

            {/* Recent Activity / Quick Links Section */}
            <div className="grid lg:grid-cols-12 gap-6">
                <div className="lg:col-span-8 bg-[#0b1022] rounded-[2.5rem] border border-white/5 p-8 relative overflow-hidden group">
                    {/* Decorative pattern */}
                    <div className="absolute top-0 right-0 p-8 opacity-5">
                        <TrendingUp className="w-32 h-32" />
                    </div>

                    <h2 className="text-2xl font-bold text-white mb-2">Growth Performance</h2>
                    <p className="text-slate-500 text-sm mb-8 font-medium">Your platform engagement metrics for this month</p>

                    <div className="flex items-end gap-1 h-32">
                        {[40, 70, 45, 90, 65, 80, 55, 95, 75, 85, 60, 100].map((h, i) => (
                            <motion.div
                                key={i}
                                initial={{ height: 0 }}
                                animate={{ height: `${h}%` }}
                                transition={{ delay: i * 0.05, duration: 1 }}
                                className="flex-1 bg-gradient-to-t from-blue-600/20 to-blue-500/60 rounded-t-lg"
                            ></motion.div>
                        ))}
                    </div>
                </div>

                <div className="lg:col-span-4 flex flex-col gap-6">
                    <motion.a
                        href="/admin/dashboard/rewards"
                        whileHover={{ y: -5 }}
                        className="flex-1 bg-gradient-to-br from-blue-600 to-blue-700 p-8 rounded-[2rem] flex flex-col justify-between text-white shadow-xl shadow-blue-500/10 relative overflow-hidden group"
                    >
                        <div className="relative z-10 flex justify-between items-start">
                            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-md">
                                <Wallet className="w-6 h-6" />
                            </div>
                            <ArrowUpRight className="w-6 h-6" />
                        </div>
                        <div className="relative z-10">
                            <h3 className="text-xl font-bold mb-1">Audit Rewards</h3>
                            <p className="text-blue-100/70 text-sm font-medium">Verify pending claims</p>
                        </div>
                        {/* Circle pattern */}
                        <div className="absolute -right-10 -bottom-10 w-40 h-40 border-[20px] border-white/5 rounded-full" />
                    </motion.a>

                    <motion.a
                        href="/admin/dashboard/reels"
                        whileHover={{ y: -5 }}
                        className="flex-1 bg-[#0b1022] p-8 rounded-[2rem] border border-white/5 flex flex-col justify-between group hover:border-purple-500/30 transition-all"
                    >
                        <div className="flex justify-between items-start">
                            <div className="p-3 bg-purple-500/10 text-purple-400 rounded-xl border border-purple-500/10">
                                <Video className="w-6 h-6" />
                            </div>
                            <ArrowUpRight className="w-6 h-6 text-slate-700 group-hover:text-purple-400" />
                        </div>
                        <div>
                            <h3 className="text-white text-xl font-bold mb-1">Review Reels</h3>
                            <p className="text-slate-500 text-sm font-medium">Validate video proof</p>
                        </div>
                    </motion.a>
                </div>
            </div>
        </div>
    )
}
