import { useState, useEffect } from 'react'
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { adminAuthService } from '../services/adminAuthService'
import DashboardHome from '../components/admin/DashboardHome'
import RewardsList from '../components/admin/RewardsList'
import ReelsList from '../components/admin/ReelsList'
import ProductManager from '../components/admin/ProductManager'
import QRGenerator from '../components/admin/QRGenerator'
import { LayoutDashboard, Award, Film, Package, QrCode, LogOut, Menu, X, ChevronRight, Bell } from 'lucide-react'

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
        { path: '/admin/dashboard', icon: <LayoutDashboard className="w-[18px] h-[18px]" />, label: 'Analytics', exact: true },
        { path: '/admin/dashboard/rewards', icon: <Award className="w-[18px] h-[18px]" />, label: 'Rewards Audit' },
        { path: '/admin/dashboard/reels', icon: <Film className="w-[18px] h-[18px]" />, label: 'Influencer Reels' },
        { path: '/admin/dashboard/catalog', icon: <Package className="w-[18px] h-[18px]" />, label: 'Master Catalog' },
        { path: '/admin/dashboard/qr', icon: <QrCode className="w-[18px] h-[18px]" />, label: 'Tracking Engine' },
    ]

    return (
        <div className="min-h-screen bg-[#040714] text-slate-200">
            {/* Nav Header - Mobile */}
            <div className="lg:hidden flex items-center justify-between p-4 border-b border-white/5 bg-[#040714] sticky top-0 z-[60]">
                <div onClick={() => navigate('/')} className="flex items-center gap-3 cursor-pointer">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-black italic text-sm">P</div>
                    <span className="font-black text-sm tracking-tight uppercase">Control Console</span>
                </div>
                <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition border border-white/10">
                    {sidebarOpen ? <X size={20} className="text-blue-400" /> : <Menu size={20} />}
                </button>
            </div>

            <div className="flex h-screen overflow-hidden">
                {/* Sidebar Backdrop Overlay */}
                <AnimatePresence>
                    {sidebarOpen && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSidebarOpen(false)}
                            className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
                        />
                    )}
                </AnimatePresence>

                {/* Sidebar - Sleek Professional Sidebar */}
                <aside
                    className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-50 w-72 lg:w-64 bg-[#040714] border-r border-white/5 transition-transform duration-300 flex flex-col`}
                >
                    <div className="px-6 py-8 flex-1 overflow-y-auto custom-scrollbar">
                        <div className="flex items-center gap-3 mb-12 px-2">
                            <div className="w-9 h-9 bg-blue-600 rounded-[10px] flex items-center justify-center font-black text-lg shadow-lg shadow-blue-500/20 italic">P</div>
                            <div className="flex flex-col">
                                <span className="text-sm font-black tracking-tight text-white leading-none uppercase italic">Partner</span>
                                <span className="text-[10px] font-bold tracking-[0.2em] text-blue-500 mt-1 uppercase">Program Hub</span>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 mb-4 px-3">Management</p>
                            {navItems.map((item) => {
                                const isActive = item.exact
                                    ? location.pathname === item.path
                                    : location.pathname.startsWith(item.path)

                                return (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        onClick={() => window.innerWidth < 1024 && setSidebarOpen(false)}
                                        className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 group relative ${isActive
                                            ? 'bg-blue-600/10 text-blue-400 font-bold border border-blue-500/10'
                                            : 'text-slate-500 hover:text-slate-200 hover:bg-white/[0.03]'
                                            }`}
                                    >
                                        <span className={`${isActive ? 'scale-110' : 'opacity-60 group-hover:opacity-100'} transition-all`}>
                                            {item.icon}
                                        </span>
                                        <span className="text-sm tracking-tight">{item.label}</span>
                                        {isActive && (
                                            <motion.div
                                                layoutId="sidebar-active"
                                                className="absolute left-0 w-1 h-4 bg-blue-500 rounded-r-full"
                                            />
                                        )}
                                    </Link>
                                )
                            })}
                        </div>
                    </div>

                    <div className="p-6 border-t border-white/5 bg-white/[0.01]">
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-400/5 transition-all group"
                        >
                            <LogOut size={16} className="group-hover:-translate-x-1 transition-transform" />
                            <span className="text-sm font-bold">Sign Out</span>
                        </button>
                    </div>
                </aside>

                {/* Main Content Area */}
                <main className="flex-1 overflow-auto bg-[#070b1d] relative">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.03),transparent_50%)] pointer-events-none" />

                    {/* Header bar / Search area placeholder */}
                    <div className="sticky top-0 z-40 bg-[#070b1d]/80 backdrop-blur-md border-b border-white/5 px-8 py-4 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                            <span>Home</span>
                            <ChevronRight size={12} className="opacity-30" />
                            <span className="text-slate-300">Dashboard</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <button className="p-2 text-slate-500 hover:text-white transition relative">
                                <Bell size={18} />
                                <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-rose-500 rounded-full border border-[#070b1d]"></span>
                            </button>
                            <div className="w-8 h-8 rounded-full bg-slate-800 border border-white/10 overflow-hidden flex items-center justify-center font-bold text-xs text-blue-400">
                                AD
                            </div>
                        </div>
                    </div>

                    <div className="min-h-full">
                        <Routes>
                            <Route path="/" element={<DashboardHome />} />
                            <Route path="/rewards" element={<RewardsList />} />
                            <Route path="/reels" element={<ReelsList />} />
                            <Route path="/catalog" element={<ProductManager />} />
                            <Route path="/qr" element={<QRGenerator />} />
                        </Routes>
                    </div>
                </main>
            </div>
        </div>
    )
}
