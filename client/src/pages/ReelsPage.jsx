import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'

export default function ReelsPage() {
    const navigate = useNavigate()
    const { user, isAuthenticated, logout } = useAuth()
    const [formData, setFormData] = useState({
        reelUrl: '',
        instagramUsername: '',
        productName: 'Purna Gummies',
        name: user?.name || '',
        phone: user?.phone || '',
        address: '',
        screenshot: null
    })
    const [loading, setLoading] = useState(false)

    if (!isAuthenticated) {
        navigate('/')
        return null
    }

    const handleFileChange = (e) => {
        const file = e.target.files[0]
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast.error('File size should be less than 5MB')
                return
            }
            setFormData({ ...formData, screenshot: file })
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)

        try {
            const submitData = new FormData()
            submitData.append('reel_url', formData.reelUrl)
            submitData.append('instagram_username', formData.instagramUsername)
            submitData.append('product_name', formData.productName)
            submitData.append('name', formData.name)
            submitData.append('phone', formData.phone)
            submitData.append('address', formData.address)
            submitData.append('screenshot', formData.screenshot)

            const response = await fetch('http://localhost:8000/api/reels/submit', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: submitData
            })

            if (response.ok) {
                toast.success('Reel submitted successfully! 🎉')
                toast('We will review and ship your free product within 7 days', { icon: '📦', duration: 4000 })
                setTimeout(() => navigate('/dashboard'), 2000)
            } else {
                const error = await response.json()
                toast.error(error.detail || 'Failed to submit reel')
            }
        } catch (error) {
            console.error('Error:', error)
            toast.error('Failed to submit reel')
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
                        Submit Your Reel 🎬
                    </h1>
                    <p className="text-base sm:text-lg text-gray-300 mb-8">
                        Create an Instagram reel and get FREE product delivered!
                    </p>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="glass rounded-2xl p-6 sm:p-8 border border-white/10 text-left">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-white font-semibold mb-2">Instagram Reel URL *</label>
                                <input
                                    type="url"
                                    required
                                    value={formData.reelUrl}
                                    onChange={(e) => setFormData({ ...formData, reelUrl: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:border-white/30 transition"
                                    placeholder="https://www.instagram.com/reel/..."
                                />
                            </div>

                            <div>
                                <label className="block text-white font-semibold mb-2">Instagram Username *</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.instagramUsername}
                                    onChange={(e) => setFormData({ ...formData, instagramUsername: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:border-white/30 transition"
                                    placeholder="@yourusername"
                                />
                            </div>

                            <div>
                                <label className="block text-white font-semibold mb-2">Product Name *</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.productName}
                                    onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:border-white/30 transition"
                                    placeholder="Purna Gummies"
                                />
                            </div>

                            <div>
                                <label className="block text-white font-semibold mb-2">Your Name *</label>
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
                                <label className="block text-white font-semibold mb-2">Phone Number *</label>
                                <input
                                    type="tel"
                                    required
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:border-white/30 transition"
                                    placeholder="10-digit mobile number"
                                    maxLength="10"
                                />
                            </div>

                            <div>
                                <label className="block text-white font-semibold mb-2">Delivery Address *</label>
                                <textarea
                                    required
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:border-white/30 transition resize-none"
                                    placeholder="Full address with pincode"
                                    rows="3"
                                />
                            </div>

                            <div>
                                <label className="block text-white font-semibold mb-2">Brand Tag Screenshot *</label>
                                <input
                                    type="file"
                                    required
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-white/10 file:text-white hover:file:bg-white/20 transition"
                                />
                                <p className="text-gray-400 text-sm mt-2">Upload screenshot showing brand tag (Max 5MB)</p>
                            </div>

                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                type="submit"
                                disabled={loading}
                                className="w-full py-4 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? '⏳ Submitting...' : '🎁 Submit Reel for Free Product'}
                            </motion.button>
                        </div>

                        {/* Info Box */}
                        <div className="mt-6 p-4 bg-white/5 border border-white/10 rounded-xl">
                            <h3 className="text-white font-semibold mb-2">ℹ️ Requirements:</h3>
                            <ul className="text-gray-300 text-sm space-y-1">
                                <li>• Create an Instagram reel featuring our product</li>
                                <li>• Tag our brand in the reel</li>
                                <li>• Upload screenshot showing the brand tag</li>
                                <li>• We'll ship FREE product to your address!</li>
                            </ul>
                        </div>
                    </form>
                </motion.div>
            </section>
        </div>
    )
}
