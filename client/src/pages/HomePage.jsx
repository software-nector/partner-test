import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { videoService } from '../services/videoService'
import { productService } from '../services/productService'
import {
    LayoutDashboard, Award, Film, LogOut, X,
    Star, Wallet, Activity, Camera, Instagram,
    Gift, Zap, Mail, Lock, User as UserIcon
} from 'lucide-react'
import api from '../services/api'

export default function HomePage() {
    const navigate = useNavigate()
    const { user, isAuthenticated, login, logout } = useAuth()

    // View Management
    const [showLoginModal, setShowLoginModal] = useState(false)
    const [loginMethod, setLoginMethod] = useState('whatsapp') // 'whatsapp' or 'email'
    const [activeSection, setActiveSection] = useState('overview')

    // Data States
    const [videoData, setVideoData] = useState(null)
    const [dashboardData, setDashboardData] = useState(null)
    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)
    const [formLoading, setFormLoading] = useState(false)

    // Form States
    const [loginForm, setLoginForm] = useState({ phone: '', coupon: '', otp: '', step: 1 })
    const [emailForm, setEmailForm] = useState({ email: '', password: '', name: '' })
    const [isSignup, setIsSignup] = useState(false)
    const [cashbackForm, setCashbackForm] = useState({ platform: '', upiId: '', couponCode: '', screenshot: null })
    const [videoForm, setVideoForm] = useState({ reelUrl: '', instagramUsername: '', address: '', screenshot: null })

    // URL Parameter handling
    useEffect(() => {
        const params = new URLSearchParams(window.location.search)
        const code = params.get('code')
        if (code) {
            setLoginForm(prev => ({ ...prev, coupon: code }))
            setCashbackForm(prev => ({ ...prev, couponCode: code }))
        }
    }, [])

    useEffect(() => {
        const init = async () => {
            try {
                const [videoRes, productRes] = await Promise.all([
                    videoService.getVideo('founder_story'),
                    productService.getProducts()
                ])
                setVideoData(videoRes.data)
                setProducts(productRes.data)

                if (isAuthenticated) {
                    await fetchDashboard()
                }
            } catch (error) {
                console.error('Initialization failed:', error)
            } finally {
                setLoading(false)
            }
        }
        init()
    }, [isAuthenticated])

    const fetchDashboard = async () => {
        try {
            const response = await api.get('/user/dashboard')
            setDashboardData(response.data)
        } catch (error) {
            console.error('Dashboard fetch failed:', error)
        }
    }

    const handleSendOTP = async (e) => {
        if (e) e.preventDefault()
        setFormLoading(true)
        try {
            await api.post('/auth/whatsapp/send-otp', {
                phone: loginForm.phone,
                coupon: loginForm.coupon
            })
            setLoginForm(prev => ({ ...prev, step: 2 }))
            toast.success('OTP sent on WhatsApp!')
        } catch (error) {
            toast.error(error.response?.data?.detail || 'Failed to send OTP')
        } finally {
            setFormLoading(false)
        }
    }

    const handleVerifyOTP = async (e) => {
        e.preventDefault()
        setFormLoading(true)
        try {
            const response = await api.post('/auth/whatsapp/verify-otp', {
                phone: loginForm.phone,
                otp: loginForm.otp,
                coupon: loginForm.coupon
            })

            const data = response.data
            localStorage.setItem('token', data.token)
            localStorage.setItem('user', JSON.stringify(data.user))
            toast.success('Login successful!')
            setShowLoginModal(false)
            window.location.reload()
        } catch (error) {
            toast.error(error.response?.data?.detail || 'Invalid OTP')
        } finally {
            setFormLoading(false)
        }
    }

    const handleEmailAuth = async (e) => {
        e.preventDefault()
        setFormLoading(true)
        try {
            const endpoint = isSignup ? '/auth/email/register' : '/auth/email/login'
            const payload = isSignup
                ? { email: emailForm.email, password: emailForm.password, name: emailForm.name }
                : { email: emailForm.email, password: emailForm.password }

            const response = await api.post(endpoint, payload)
            const data = response.data

            localStorage.setItem('token', data.token)
            localStorage.setItem('user', JSON.stringify(data.user))
            toast.success(isSignup ? 'Account created successfully!' : 'Login successful!')
            setShowLoginModal(false)
            window.location.reload()
        } catch (error) {
            toast.error(error.response?.data?.detail || 'Authentication failed')
        } finally {
            setFormLoading(false)
        }
    }

    // Initialize Google Sign-In button when modal opens in email mode
    useEffect(() => {
        if (showLoginModal && loginMethod === 'email' && window.google) {
            const initGoogleButton = () => {
                try {
                    window.google.accounts.id.initialize({
                        client_id: '1002481870605-ik6ef0o6flqocv3g0ksu1v8dmh70eme8.apps.googleusercontent.com',
                        callback: async (response) => {
                            try {
                                const res = await api.post('/auth/google/login', { token: response.credential })
                                const data = res.data

                                localStorage.setItem('token', data.token)
                                localStorage.setItem('user', JSON.stringify(data.user))
                                toast.success('Google login successful!')
                                setShowLoginModal(false)
                                window.location.reload()
                            } catch (error) {
                                console.error('Google login error:', error)
                                toast.error('Google login failed')
                            }
                        }
                    })

                    const buttonDiv = document.getElementById('google-signin-button')
                    if (buttonDiv && buttonDiv.children.length === 0) {
                        window.google.accounts.id.renderButton(
                            buttonDiv,
                            {
                                theme: 'outline',
                                size: 'large',
                                width: buttonDiv.offsetWidth,
                                text: 'continue_with',
                                shape: 'rectangular'
                            }
                        )
                    }
                } catch (error) {
                    console.error('Google button init error:', error)
                }
            }

            // Small delay to ensure DOM is ready
            setTimeout(initGoogleButton, 100)
        }
    }, [showLoginModal, loginMethod])

    const handleCashbackSubmit = async (e) => {
        e.preventDefault()
        setFormLoading(true)
        try {
            const formData = new FormData()
            formData.append('platform', cashbackForm.platform)
            formData.append('upi_id', cashbackForm.upiId)
            formData.append('coupon_code', cashbackForm.couponCode)
            formData.append('name', user?.name || 'User')
            formData.append('phone', user?.phone || 'N/A')
            if (cashbackForm.screenshot) formData.append('screenshot', cashbackForm.screenshot)

            await api.post('/rewards/submit', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            })

            toast.success('Cashback claim submitted successfully!')
            setCashbackForm({ platform: '', upiId: '', couponCode: '', screenshot: null })
            await fetchDashboard()
        } catch (error) {
            toast.error(error.response?.data?.detail || 'Submission failed')
        } finally {
            setFormLoading(false)
        }
    }

    const handleVideoSubmit = async (e) => {
        e.preventDefault()
        setFormLoading(true)
        try {
            const formData = new FormData()
            formData.append('reel_url', videoForm.reelUrl)
            formData.append('instagram_handle', videoForm.instagramUsername)
            formData.append('address', videoForm.address)
            formData.append('product_name', 'Purna Gummies')
            if (videoForm.screenshot) formData.append('screenshot', videoForm.screenshot)

            await api.post('/reels/submit', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            })

            toast.success('Reel submitted successfully!')
            setVideoForm({ reelUrl: '', instagramUsername: '', address: '', screenshot: null })
            await fetchDashboard()
        } catch (error) {
            toast.error(error.response?.data?.detail || 'Submission failed')
        } finally {
            setFormLoading(false)
        }
    }

    if (loading) return (
        <div className="min-h-screen bg-[#0f1729] flex items-center justify-center">
            <div className="text-cyan-400 text-xl font-semibold">Loading...</div>
        </div>
    )

    // If authenticated, show dashboard
    if (isAuthenticated) {
        return (
            <div className="min-h-screen bg-[#0f1729] text-white">
                {/* Header */}
                <header className="bg-[#1a2332] border-b border-gray-800 px-6 py-4">
                    <div className="max-w-7xl mx-auto flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="text-4xl">🍬</div>
                            <span className="text-xl font-bold text-cyan-400">Purna Gummies</span>
                        </div>
                        <button
                            onClick={logout}
                            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-semibold flex items-center gap-2"
                        >
                            <LogOut size={18} /> Logout
                        </button>
                    </div>
                </header>

                {/* Navigation Tabs */}
                <div className="bg-[#1a2332] border-b border-gray-800">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="flex gap-8">
                            {[
                                { id: 'overview', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
                                { id: 'claims', label: 'Claim Reward', icon: <Award size={18} /> },
                                { id: 'content', label: 'Submit Reel', icon: <Film size={18} /> },
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveSection(tab.id)}
                                    className={`flex items-center gap-2 px-4 py-4 border-b-2 transition-colors ${activeSection === tab.id
                                        ? 'border-cyan-400 text-cyan-400'
                                        : 'border-transparent text-gray-400 hover:text-white'
                                        }`}
                                >
                                    {tab.icon}
                                    <span className="font-semibold">{tab.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <main className="max-w-7xl mx-auto px-6 py-12">
                    <AnimatePresence mode="wait">
                        {activeSection === 'overview' && (
                            <motion.div
                                key="overview"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="space-y-8"
                            >
                                <h2 className="text-3xl font-bold text-cyan-400">Welcome, {user?.name}!</h2>

                                {/* Stats Cards */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="bg-[#1a2332] rounded-2xl p-6 border border-gray-800">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-cyan-500/20 rounded-xl flex items-center justify-center">
                                                <Wallet className="text-cyan-400" size={24} />
                                            </div>
                                            <div>
                                                <p className="text-gray-400 text-sm">Total Rewards</p>
                                                <p className="text-2xl font-bold">₹{dashboardData?.stats?.rewards?.total_cashback || 0}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-[#1a2332] rounded-2xl p-6 border border-gray-800">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center">
                                                <Activity className="text-amber-400" size={24} />
                                            </div>
                                            <div>
                                                <p className="text-gray-400 text-sm">Pending Claims</p>
                                                <p className="text-2xl font-bold">{dashboardData?.recent_rewards?.filter(r => r.status === 'pending').length || 0}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-[#1a2332] rounded-2xl p-6 border border-gray-800">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                                                <Film className="text-purple-400" size={24} />
                                            </div>
                                            <div>
                                                <p className="text-gray-400 text-sm">Reels Submitted</p>
                                                <p className="text-2xl font-bold">{dashboardData?.recent_reels?.length || 0}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* How to Earn & Terms */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    <div className="bg-gradient-to-br from-cyan-900/20 to-blue-900/20 rounded-2xl p-6 border border-cyan-500/20 shadow-lg shadow-cyan-500/5">
                                        <div className="flex items-center gap-3 mb-4">
                                            <Gift className="text-cyan-400" size={24} />
                                            <h3 className="text-xl font-bold text-white">How to Get Cashback</h3>
                                        </div>
                                        <ul className="space-y-3 text-sm text-gray-300">
                                            <li className="flex gap-2">
                                                <span className="text-cyan-400 font-bold">1.</span>
                                                Find the QR code or Coupon inside your Purna Gummies pack.
                                            </li>
                                            <li className="flex gap-2">
                                                <span className="text-cyan-400 font-bold">2.</span>
                                                Go to Amazon/Flipkart and leave a 5-star review with a photo.
                                            </li>
                                            <li className="flex gap-2">
                                                <span className="text-cyan-400 font-bold">3.</span>
                                                Take a screenshot of your review and upload it in the "Claim Reward" tab.
                                            </li>
                                            <li className="flex gap-2">
                                                <span className="text-cyan-400 font-bold">4.</span>
                                                Once verified by our AI, you will receive cashback on your UPI ID within 24 hours.
                                            </li>
                                        </ul>
                                    </div>

                                    <div className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 rounded-2xl p-6 border border-purple-500/20 shadow-lg shadow-purple-500/5">
                                        <div className="flex items-center gap-3 mb-4">
                                            <Instagram className="text-purple-400" size={24} />
                                            <h3 className="text-xl font-bold text-white">Get Free Product (Reels)</h3>
                                        </div>
                                        <ul className="space-y-3 text-sm text-gray-300">
                                            <li className="flex gap-2">
                                                <span className="text-purple-400 font-bold">1.</span>
                                                Make a creative Instagram Reel featuring Purna Gummies.
                                            </li>
                                            <li className="flex gap-2">
                                                <span className="text-purple-400 font-bold">2.</span>
                                                Tag @PurnaGummies and include #PurnaGummies in your caption.
                                            </li>
                                            <li className="flex gap-2">
                                                <span className="text-purple-400 font-bold">3.</span>
                                                Copy your Reel link and submit it in the "Submit Reel" tab along with your address.
                                            </li>
                                            <li className="flex gap-2">
                                                <span className="text-purple-400 font-bold">4.</span>
                                                If your video is approved, we will ship a complimentary product to your home!
                                            </li>
                                        </ul>
                                    </div>
                                </div>

                                {/* Recent Activity */}
                                <div className="bg-[#1a2332] rounded-2xl p-6 border border-gray-800">
                                    <h3 className="text-xl font-bold mb-6">Recent Activity</h3>
                                    <div className="space-y-4">
                                        {[...dashboardData?.recent_rewards || [], ...dashboardData?.recent_reels || []]
                                            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                                            .slice(0, 5)
                                            .map((item, i) => (
                                                <div key={i} className="flex items-center justify-between p-4 bg-[#0f1729] rounded-xl">
                                                    <div className="flex items-center gap-4">
                                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${'instagram_handle' in item ? 'bg-purple-500/20' : 'bg-cyan-500/20'
                                                            }`}>
                                                            {'instagram_handle' in item ? <Film className="text-purple-400" size={20} /> : <Award className="text-cyan-400" size={20} />}
                                                        </div>
                                                        <div>
                                                            <p className="font-semibold">{item.product_name || 'Activity'}</p>
                                                            <p className="text-sm text-gray-400">{new Date(item.created_at).toLocaleDateString()}</p>
                                                        </div>
                                                    </div>
                                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${item.status === 'approved' ? 'bg-green-500/20 text-green-400' :
                                                        item.status === 'pending' ? 'bg-amber-500/20 text-amber-400' :
                                                            'bg-gray-500/20 text-gray-400'
                                                        }`}>
                                                        {item.status}
                                                    </span>
                                                </div>
                                            ))}
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {activeSection === 'claims' && (
                            <motion.div
                                key="claims"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="max-w-2xl mx-auto"
                            >
                                <div className="bg-[#1a2332] rounded-2xl p-8 border border-gray-800">
                                    <h2 className="text-2xl font-bold mb-6 text-cyan-400">Claim Your Reward</h2>
                                    <form onSubmit={handleCashbackSubmit} className="space-y-6">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-semibold mb-2">Platform</label>
                                                <select
                                                    required
                                                    value={cashbackForm.platform}
                                                    onChange={(e) => setCashbackForm({ ...cashbackForm, platform: e.target.value })}
                                                    className="w-full bg-[#0f1729] border border-gray-700 rounded-lg px-4 py-3 focus:border-cyan-400 outline-none"
                                                >
                                                    <option value="">Select Platform</option>
                                                    <option value="Amazon">Amazon</option>
                                                    <option value="Flipkart">Flipkart</option>
                                                    <option value="Other">Other</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold mb-2">UPI ID</label>
                                                <input
                                                    required
                                                    type="text"
                                                    value={cashbackForm.upiId}
                                                    onChange={(e) => setCashbackForm({ ...cashbackForm, upiId: e.target.value })}
                                                    placeholder="your@upi"
                                                    className="w-full bg-[#0f1729] border border-gray-700 rounded-lg px-4 py-3 focus:border-cyan-400 outline-none"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold mb-2">Coupon Code</label>
                                            <input
                                                required
                                                type="text"
                                                readOnly={!!new URLSearchParams(window.location.search).get('code')}
                                                value={cashbackForm.couponCode}
                                                onChange={(e) => setCashbackForm({ ...cashbackForm, couponCode: e.target.value })}
                                                placeholder="Enter code from product"
                                                className={`w-full bg-[#0f1729] border border-gray-700 rounded-lg px-4 py-3 focus:border-cyan-400 outline-none ${new URLSearchParams(window.location.search).get('code') ? 'opacity-70 cursor-not-allowed' : ''}`}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold mb-2">Screenshot</label>
                                            <input
                                                required
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => setCashbackForm({ ...cashbackForm, screenshot: e.target.files[0] })}
                                                className="w-full bg-[#0f1729] border border-gray-700 rounded-lg px-4 py-3 focus:border-cyan-400 outline-none"
                                            />
                                        </div>
                                        <button
                                            disabled={formLoading}
                                            className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white py-4 rounded-lg font-bold text-lg disabled:opacity-50"
                                        >
                                            {formLoading ? 'Submitting...' : 'Submit Claim'}
                                        </button>
                                    </form>
                                </div>
                            </motion.div>
                        )}

                        {activeSection === 'content' && (
                            <motion.div
                                key="content"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="max-w-2xl mx-auto"
                            >
                                <div className="bg-[#1a2332] rounded-2xl p-8 border border-gray-800">
                                    <h2 className="text-2xl font-bold mb-6 text-cyan-400">Submit Your Reel</h2>
                                    <form onSubmit={handleVideoSubmit} className="space-y-6">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-semibold mb-2">Reel URL</label>
                                                <input
                                                    required
                                                    type="url"
                                                    value={videoForm.reelUrl}
                                                    onChange={(e) => setVideoForm({ ...videoForm, reelUrl: e.target.value })}
                                                    placeholder="https://instagram.com/reel/..."
                                                    className="w-full bg-[#0f1729] border border-gray-700 rounded-lg px-4 py-3 focus:border-cyan-400 outline-none"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold mb-2">Instagram Username</label>
                                                <input
                                                    required
                                                    type="text"
                                                    value={videoForm.instagramUsername}
                                                    onChange={(e) => setVideoForm({ ...videoForm, instagramUsername: e.target.value })}
                                                    placeholder="@username"
                                                    className="w-full bg-[#0f1729] border border-gray-700 rounded-lg px-4 py-3 focus:border-cyan-400 outline-none"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold mb-2">Shipping Address</label>
                                            <textarea
                                                required
                                                rows="3"
                                                value={videoForm.address}
                                                onChange={(e) => setVideoForm({ ...videoForm, address: e.target.value })}
                                                placeholder="Enter your complete address"
                                                className="w-full bg-[#0f1729] border border-gray-700 rounded-lg px-4 py-3 focus:border-cyan-400 outline-none resize-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold mb-2">Screenshot</label>
                                            <input
                                                required
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => setVideoForm({ ...videoForm, screenshot: e.target.files[0] })}
                                                className="w-full bg-[#0f1729] border border-gray-700 rounded-lg px-4 py-3 focus:border-cyan-400 outline-none"
                                            />
                                        </div>
                                        <button
                                            disabled={formLoading}
                                            className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white py-4 rounded-lg font-bold text-lg disabled:opacity-50"
                                        >
                                            {formLoading ? 'Submitting...' : 'Submit Reel'}
                                        </button>
                                    </form>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </main>
            </div >
        )
    }

    // Landing Page (Not Authenticated)
    return (
        <div className="min-h-screen bg-[#0f1729] text-white">
            {/* Header */}
            <header className="bg-[#1a2332] border-b border-gray-800 px-6 py-4">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="text-4xl">🍬</div>
                        <span className="text-xl font-bold text-cyan-400">Purna Gummies</span>
                    </div>
                    <button
                        onClick={() => setShowLoginModal(true)}
                        className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-semibold flex items-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                        </svg>
                        Login with WhatsApp
                    </button>
                </div>
            </header>

            {/* Hero Section */}
            <main className="max-w-7xl mx-auto px-6 py-16">
                <div className="text-center mb-16">
                    <h1 className="text-5xl md:text-6xl font-bold mb-4">
                        Welcome to <span className="text-cyan-400">Purna Gummies Rewards!</span> 🎁
                    </h1>
                    <p className="text-xl text-gray-400">Watch expert doctor's advice and leave your valuable review</p>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
                    {/* Video Section */}
                    <div className="bg-[#1a2332] rounded-3xl p-8 border border-gray-800">
                        <div className="aspect-video bg-gray-900 rounded-2xl mb-6 overflow-hidden">
                            {videoData?.video_url ? (
                                <video className="w-full h-full object-cover" controls>
                                    <source src={videoData.video_url} type="video/mp4" />
                                </video>
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-500">
                                    Loading...
                                </div>
                            )}
                        </div>
                        <h3 className="text-2xl font-bold mb-4">Expert Doctor's Advice on Purna Gummies</h3>
                        <p className="text-gray-400 mb-6">Watch this informative video about the benefits of Purna Gummies and how they can improve your health.</p>
                        <button
                            onClick={() => setShowLoginModal(true)}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2"
                        >
                            <Star size={20} fill="currentColor" /> Give Review
                        </button>
                    </div>

                    {/* Claim Reward Section */}
                    <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl p-8 border border-gray-700 flex flex-col items-center justify-center text-center">
                        <div className="text-7xl mb-6">💰</div>
                        <h3 className="text-3xl font-bold mb-4">Claim Reward</h3>
                        <p className="text-gray-300 mb-8 text-lg">Upload your review screenshot and get instant UPI cashback</p>
                        <button
                            onClick={() => setShowLoginModal(true)}
                            className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white px-12 py-4 rounded-xl font-bold text-lg flex items-center gap-2"
                        >
                            Claim Now →
                        </button>
                    </div>
                </div>

                {/* Why Choose Us Section */}
                <div className="text-center mb-12">
                    <h2 className="text-4xl font-bold text-cyan-400 mb-12">Why Choose Us?</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="bg-[#1a2332] rounded-2xl p-8 border border-gray-800 text-center">
                        <div className="text-5xl mb-4">⚡</div>
                        <h3 className="text-xl font-bold mb-3">Instant Rewards</h3>
                        <p className="text-gray-400">Get cashback within 24 hours</p>
                    </div>
                    <div className="bg-[#1a2332] rounded-2xl p-8 border border-gray-800 text-center">
                        <div className="text-5xl mb-4">🎯</div>
                        <h3 className="text-xl font-bold mb-3">Easy Process</h3>
                        <p className="text-gray-400">Simple 3-step claim process</p>
                    </div>
                    <div className="bg-[#1a2332] rounded-2xl p-8 border border-gray-800 text-center">
                        <div className="text-5xl mb-4">🔒</div>
                        <h3 className="text-xl font-bold mb-3">Secure & Safe</h3>
                        <p className="text-gray-400">100% secure transactions</p>
                    </div>
                </div>
            </main>

            {/* Login Modal */}
            <AnimatePresence>
                {showLoginModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                        onClick={() => setShowLoginModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-[#1a1a1a] rounded-3xl p-10 max-w-md w-full border border-gray-800 relative shadow-2xl"
                        >
                            <button
                                onClick={() => setShowLoginModal(false)}
                                className="absolute top-6 right-6 text-gray-500 hover:text-white transition-colors"
                            >
                                <X size={28} />
                            </button>

                            <div className="text-center mb-10">
                                <div className="text-6xl mb-6">🍬</div>
                                <h2 className="text-4xl font-bold text-cyan-400 mb-3">Login to Continue</h2>
                                <p className="text-gray-400 text-lg">Choose your preferred login method</p>
                            </div>

                            <div className="flex gap-4 mb-8">
                                <button
                                    onClick={() => setLoginMethod('whatsapp')}
                                    className={`flex-1 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all ${loginMethod === 'whatsapp'
                                        ? 'bg-[#2a2a2a] text-white border-2 border-gray-700'
                                        : 'bg-transparent text-gray-500 border-2 border-gray-800'
                                        }`}
                                >
                                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                                    </svg>
                                    WhatsApp
                                </button>
                                <button
                                    onClick={() => setLoginMethod('email')}
                                    className={`flex-1 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all ${loginMethod === 'email'
                                        ? 'bg-blue-600 text-white border-2 border-blue-600'
                                        : 'bg-transparent text-gray-500 border-2 border-gray-800'
                                        }`}
                                >
                                    <Mail size={22} />
                                    Email
                                </button>
                            </div>

                            {loginMethod === 'whatsapp' && (
                                <div className="space-y-6">
                                    {loginForm.step === 1 ? (
                                        <form onSubmit={handleSendOTP} className="space-y-5">
                                            <div>
                                                <label className="block text-sm font-bold mb-3 text-white">Phone Number</label>
                                                <input
                                                    required
                                                    type="tel"
                                                    value={loginForm.phone}
                                                    onChange={(e) => setLoginForm({ ...loginForm, phone: e.target.value })}
                                                    placeholder="9876543210"
                                                    className="w-full bg-[#2a2a2a] border border-gray-700 rounded-2xl px-5 py-4 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 outline-none text-white placeholder-gray-500 transition-all font-mono"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-bold mb-3 text-white">Coupon Code</label>
                                                <input
                                                    required
                                                    type="text"
                                                    readOnly={!!new URLSearchParams(window.location.search).get('code')}
                                                    value={loginForm.coupon}
                                                    onChange={(e) => setLoginForm({ ...loginForm, coupon: e.target.value })}
                                                    placeholder="Enter code from product"
                                                    className={`w-full bg-[#2a2a2a] border border-gray-700 rounded-2xl px-5 py-4 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 outline-none text-white placeholder-gray-500 transition-all ${new URLSearchParams(window.location.search).get('code') ? 'opacity-70 cursor-not-allowed' : ''}`}
                                                />
                                            </div>
                                            <button
                                                disabled={formLoading}
                                                className="w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-2xl font-bold text-lg disabled:opacity-50 transition-all shadow-lg shadow-green-600/20"
                                            >
                                                {formLoading ? 'Sending...' : 'Send OTP'}
                                            </button>
                                        </form>
                                    ) : (
                                        <form onSubmit={handleVerifyOTP} className="space-y-5">
                                            <div className="text-center mb-6">
                                                <p className="text-gray-400">OTP sent to <span className="text-white font-bold">{loginForm.phone}</span></p>
                                                <button
                                                    type="button"
                                                    onClick={() => setLoginForm(prev => ({ ...prev, step: 1 }))}
                                                    className="text-cyan-400 text-sm hover:underline mt-1"
                                                >
                                                    Change Number
                                                </button>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-bold mb-3 text-white">Enter 6-Digit OTP</label>
                                                <input
                                                    required
                                                    autoFocus
                                                    type="text"
                                                    maxLength={6}
                                                    value={loginForm.otp}
                                                    onChange={(e) => setLoginForm({ ...loginForm, otp: e.target.value })}
                                                    placeholder="000000"
                                                    className="w-full bg-[#2a2a2a] border border-gray-700 rounded-2xl px-5 py-4 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 outline-none text-white placeholder-gray-500 transition-all text-center text-2xl tracking-[1em] font-mono"
                                                />
                                            </div>
                                            <button
                                                disabled={formLoading}
                                                className="w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-2xl font-bold text-lg disabled:opacity-50 transition-all shadow-lg shadow-green-600/20"
                                            >
                                                {formLoading ? 'Verifying...' : 'Login Now'}
                                            </button>
                                        </form>
                                    )}

                                    <div className="bg-amber-900/20 border border-amber-500/20 rounded-2xl p-4 flex items-start gap-3">
                                        <Lock className="text-amber-500 mt-1" size={18} />
                                        <p className="text-sm text-amber-200/80">Your information is secure and will never be shared</p>
                                    </div>
                                </div>
                            )}

                            {loginMethod === 'email' && (
                                <>
                                    <div
                                        id="google-signin-button"
                                        className="w-full flex items-center justify-center mb-6"
                                    ></div>

                                    {!formLoading && (
                                        <script dangerouslySetInnerHTML={{
                                            __html: `
                                                if (window.google) {
                                                    window.google.accounts.id.initialize({
                                                        client_id: '1059677553476-8hhqvl1kcuqrqjdvkl9ks0gg0o9rqk8a.apps.googleusercontent.com',
                                                        callback: (response) => {
                                                            window.handleGoogleResponse(response);
                                                        }
                                                    });
                                                    const btn = document.getElementById('google-signin-button');
                                                    if (btn && btn.children.length === 0) {
                                                        window.google.accounts.id.renderButton(btn, {
                                                            theme: 'outline',
                                                            size: 'large',
                                                            width: btn.offsetWidth,
                                                            text: 'continue_with'
                                                        });
                                                    }
                                                }
                                            `
                                        }} />
                                    )}

                                    <div className="relative mb-6">
                                        <div className="absolute inset-0 flex items-center">
                                            <div className="w-full border-t border-gray-700"></div>
                                        </div>
                                        <div className="relative flex justify-center text-sm">
                                            <span className="px-4 bg-[#1a1a1a] text-blue-400 font-semibold">Or continue with email</span>
                                        </div>
                                    </div>

                                    <form onSubmit={handleEmailAuth} className="space-y-5">
                                        {isSignup && (
                                            <div>
                                                <label className="block text-sm font-bold mb-3 text-white">Name (Optional)</label>
                                                <input
                                                    type="text"
                                                    value={emailForm.name}
                                                    onChange={(e) => setEmailForm({ ...emailForm, name: e.target.value })}
                                                    placeholder="Your name"
                                                    className="w-full bg-[#2a2a2a] border border-gray-700 rounded-2xl px-5 py-4 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none text-white placeholder-gray-500 transition-all"
                                                />
                                            </div>
                                        )}
                                        <div>
                                            <label className="block text-sm font-bold mb-3 text-white">Email Address</label>
                                            <input
                                                required
                                                type="email"
                                                value={emailForm.email}
                                                onChange={(e) => setEmailForm({ ...emailForm, email: e.target.value })}
                                                placeholder="your@email.com"
                                                className="w-full bg-[#2a2a2a] border border-gray-700 rounded-2xl px-5 py-4 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none text-white placeholder-gray-500 transition-all"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold mb-3 text-white">Password</label>
                                            <input
                                                required
                                                type="password"
                                                value={emailForm.password}
                                                onChange={(e) => setEmailForm({ ...emailForm, password: e.target.value })}
                                                placeholder="Enter your password"
                                                className="w-full bg-[#2a2a2a] border border-gray-700 rounded-2xl px-5 py-4 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none text-white placeholder-gray-500 transition-all"
                                            />
                                        </div>
                                        <button
                                            disabled={formLoading}
                                            className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white py-4 rounded-2xl font-bold text-lg disabled:opacity-50 transition-all shadow-lg shadow-blue-600/20"
                                        >
                                            {formLoading ? (isSignup ? 'Creating account...' : 'Logging in...') : (isSignup ? 'Create Account' : 'Login with Email')}
                                        </button>
                                    </form>

                                    <p className="text-center mt-6 text-gray-400">
                                        {isSignup ? 'Already have an account?' : "Don't have an account?"}{' '}
                                        <button
                                            type="button"
                                            onClick={() => setIsSignup(!isSignup)}
                                            className="text-blue-400 hover:text-blue-300 font-semibold"
                                        >
                                            {isSignup ? 'Login' : 'Sign up'}
                                        </button>
                                    </p>
                                </>
                            )}

                            {loginMethod === 'whatsapp' && (
                                <form onSubmit={handleLoginSubmit} className="space-y-5">
                                    <div>
                                        <label className="block text-sm font-bold mb-3 text-white">Phone Number</label>
                                        <input
                                            required
                                            type="tel"
                                            value={loginForm.phone}
                                            onChange={(e) => setLoginForm({ ...loginForm, phone: e.target.value })}
                                            placeholder="9876543210"
                                            className="w-full bg-[#2a2a2a] border border-gray-700 rounded-2xl px-5 py-4 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 outline-none text-white placeholder-gray-500 transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold mb-3 text-white">Coupon Code</label>
                                        <input
                                            required
                                            type="text"
                                            value={loginForm.coupon}
                                            onChange={(e) => setLoginForm({ ...loginForm, coupon: e.target.value })}
                                            placeholder="Enter code from product"
                                            className="w-full bg-[#2a2a2a] border border-gray-700 rounded-2xl px-5 py-4 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 outline-none text-white placeholder-gray-500 transition-all"
                                        />
                                    </div>
                                    <button
                                        disabled={formLoading}
                                        className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white py-4 rounded-2xl font-bold text-lg disabled:opacity-50 transition-all shadow-lg shadow-green-600/20"
                                    >
                                        {formLoading ? 'Sending OTP...' : 'Send OTP'}
                                    </button>
                                </form>
                            )}

                            <div className="mt-8 p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-start gap-3">
                                <Lock className="text-amber-400 mt-1 flex-shrink-0" size={20} />
                                <p className="text-sm text-amber-200 leading-relaxed">Your information is secure and will never be shared</p>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
