import { useState, useEffect } from 'react'
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { adminAuthService } from '../services/adminAuthService'
import DashboardHome from '../components/admin/DashboardHome'
import RewardsList from '../components/admin/RewardsList'
import ReelsList from '../components/admin/ReelsList'

export default function AdminDashboard() {
    const navigate = useNavigate()
    const location = useLocation()
    const [sidebarOpen, setSidebarOpen] = useState(true)

    const handleLogout = () => {
        adminAuthService.removeAdminToken()
        toast.success('Logged out successfully')
        navigate('/admin/login')
    }

    const navItems = [
        { path: '/admin/dashboard', icon: '📊', label: 'Dashboard', exact: true },
        { path: '/admin/dashboard/rewards', icon: '💰', label: 'Rewards' },
        { path: '/admin/dashboard/reels', icon: '🎬', label: 'Reels' },
    ]

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900">
            {/* Header */}
            <header className="sticky top-0 z-50 glass border-b border-white/10">
                <div className="flex items-center justify-between px-6 py-4">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="lg:hidden p-2 rounded-lg hover:bg-white/10 transition"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                        <div className="flex items-center gap-3">
                            <span className="text-4xl">🍬</span>
                            <div>
                                <h1 className="text-xl font-bold gradient-text">Purna Gummies</h1>
                                <p className="text-xs text-gray-400">Admin Panel</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="hidden md:block text-right">
                            <p className="text-sm font-semibold text-white">Admin</p>
                            <p className="text-xs text-gray-400">software1.nector@gmail.com</p>
                        </div>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleLogout}
                            className="px-4 py-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 font-semibold transition flex items-center gap-2"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            Logout
                        </motion.button>
                    </div>
                </div>
            </header>

            <div className="flex">
                {/* Sidebar */}
                <aside className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:sticky top-[73px] left-0 h-[calc(100vh-73px)] w-64 glass border-r border-white/10 transition-transform duration-300 z-40`}>
                    <nav className="p-4 space-y-2">
                        {navItems.map((item) => {
                            const isActive = item.exact
                                ? location.pathname === item.path
                                : location.pathname.startsWith(item.path)

                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition ${isActive
                                            ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg'
                                            : 'hover:bg-white/10 text-gray-300'
                                        }`}
                                >
                                    <span className="text-2xl">{item.icon}</span>
                                    <span className="font-semibold">{item.label}</span>
                                </Link>
                            )
                        })}
                    </nav>
                </aside>

                {/* Main Content */}
                <main className="flex-1 p-6 lg:p-8">
                    <Routes>
                        <Route path="/" element={<DashboardHome />} />
                        <Route path="/rewards" element={<RewardsList />} />
                        <Route path="/reels" element={<ReelsList />} />
                    </Routes>
                </main>
            </div>

            {/* Mobile sidebar overlay */}
            {sidebarOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black/50 z-30"
                    onClick={() => setSidebarOpen(false)}
                />
            )}
        </div>
    )
}
