import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'

export default function RewardsPage() {
    const navigate = useNavigate()
    const { user, isAuthenticated, logout } = useAuth()
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        platform: '',
        upiId: '',
        couponCode: '',
        screenshot: null
    })
    const [loading, setLoading] = useState(false)

    if (!isAuthenticated) {
        navigate('/')
        return null
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)

        try {
            const data = new FormData()
            data.append('name', formData.name)
            data.append('phone', formData.phone)
            data.append('platform', formData.platform)
            data.append('upi_id', formData.upiId)
            data.append('coupon_code', formData.couponCode)
            data.append('screenshot', formData.screenshot)

            const response = await fetch('http://localhost:8000/api/rewards/submit', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: data
            })

            if (response.ok) {
                toast.success('Reward claim submitted successfully!')
                setFormData({
                    name: '',
                    phone: '',
                    platform: '',
                    upiId: '',
                    couponCode: '',
                    screenshot: null
                })
                setTimeout(() => navigate('/dashboard'), 2000)
            } else {
                toast.error('Failed to submit claim')
            }
        } catch (error) {
            console.error('Error:', error)
            toast.error('Something went wrong')
        } finally {
            setLoading(false)
        }
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
                            <span className="text-xs sm:text-sm text-gray-400 hidden sm:block">Hi, {user?.name || 'User'}</span>
                            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => navigate('/')} className="px-3 sm:px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white font-semibold transition text-xs sm:text-sm">
                                Home
                            </motion.button>
                            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => navigate('/dashboard')} className="px-3 sm:px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white font-semibold transition text-xs sm:text-sm">
                                Dashboard
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
                <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="max-w-3xl mx-auto">
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold mb-3 sm:mb-4 gradient-text leading-tight">
                        Claim Your Reward 💰
                    </h1>
                    <p className="text-base sm:text-lg text-gray-300 mb-8">
                        Upload your review screenshot and get instant UPI cashback
                    </p>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="glass rounded-2xl p-6 sm:p-8 border border-white/10 text-left">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-white font-semibold mb-2">Name</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:border-white/30 transition"
                                    placeholder="Your full name"
                                />
                            </div>

                            <div>
                                <label className="block text-white font-semibold mb-2">Phone Number</label>
                                <input
                                    type="tel"
                                    required
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:border-white/30 transition"
                                    placeholder="Your phone number"
                                />
                            </div>

                            <div>
                                <label className="block text-white font-semibold mb-2">Platform</label>
                                <select
                                    required
                                    value={formData.platform}
                                    onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-white/30 transition appearance-none cursor-pointer"
                                    style={{
                                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='white'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                                        backgroundRepeat: 'no-repeat',
                                        backgroundPosition: 'right 0.75rem center',
                                        backgroundSize: '1.5em 1.5em'
                                    }}
                                >
                                    <option value="" className="bg-gray-900 text-white">Select platform</option>
                                    <option value="Amazon" className="bg-gray-900 text-white">Amazon</option>
                                    <option value="Flipkart" className="bg-gray-900 text-white">Flipkart</option>
                                    <option value="Other" className="bg-gray-900 text-white">Other</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-white font-semibold mb-2">UPI ID</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.upiId}
                                    onChange={(e) => setFormData({ ...formData, upiId: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:border-white/30 transition"
                                    placeholder="yourname@upi"
                                />
                            </div>

                            <div>
                                <label className="block text-white font-semibold mb-2">Coupon Code</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.couponCode}
                                    onChange={(e) => setFormData({ ...formData, couponCode: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:border-white/30 transition"
                                    placeholder="Enter coupon code"
                                />
                            </div>

                            <div>
                                <label className="block text-white font-semibold mb-2">Review Screenshot</label>
                                <input
                                    type="file"
                                    required
                                    accept="image/*"
                                    onChange={(e) => setFormData({ ...formData, screenshot: e.target.files[0] })}
                                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-white/10 file:text-white hover:file:bg-white/20 transition"
                                />
                                <p className="text-gray-400 text-sm mt-2">Upload screenshot of your review (Max 5MB)</p>
                            </div>

                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                type="submit"
                                disabled={loading}
                                className="w-full py-4 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Submitting...' : 'Submit Claim →'}
                            </motion.button>
                        </div>
                    </form>
                </motion.div>
            </section>
        </div>
    )
}
