import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GoogleLogin } from '@react-oauth/google'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import api from '../services/api'

export default function LoginModal({ isOpen, onClose }) {
    const [loginMethod, setLoginMethod] = useState('whatsapp') // 'whatsapp' or 'email'
    const [phone, setPhone] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [couponCode, setCouponCode] = useState('')
    const [loading, setLoading] = useState(false)
    const { login } = useAuth()

    const handleWhatsAppLogin = async (e) => {
        e.preventDefault()
        if (!phone || !couponCode) {
            toast.error('Please fill all fields')
            return
        }

        setLoading(true)
        try {
            // TODO: Implement WhatsApp OTP login
            toast.success('Login successful!')
            onClose()
        } catch (error) {
            toast.error('Login failed')
        } finally {
            setLoading(false)
        }
    }

    const handleGoogleSuccess = async (credentialResponse) => {
        setLoading(true)
        try {
            // Send Google token to backend
            const response = await api.post('/auth/google/login', {
                token: credentialResponse.credential
            })

            // Save token and user data
            localStorage.setItem('token', response.data.token)
            localStorage.setItem('user', JSON.stringify(response.data.user))

            toast.success('Google login successful!')
            onClose()
            window.location.reload() // Refresh to update auth state
        } catch (error) {
            console.error('Google login error:', error)
            toast.error(error.response?.data?.detail || 'Google login failed')
        } finally {
            setLoading(false)
        }
    }

    const handleGoogleError = () => {
        toast.error('Google login failed. Please try again.')
    }

    const handleEmailLogin = async (e) => {
        e.preventDefault()
        if (!email || !password) {
            toast.error('Please fill all fields')
            return
        }

        setLoading(true)
        try {
            // TODO: Implement email/password login
            toast.success('Login successful!')
            onClose()
        } catch (error) {
            toast.error('Login failed')
        } finally {
            setLoading(false)
        }
    }

    if (!isOpen) return null

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 50 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 50 }}
                    transition={{ type: "spring", duration: 0.5 }}
                    className="glass rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-10 max-w-md w-full relative"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="absolute top-3 right-3 sm:top-4 sm:right-4 text-gray-400 hover:text-white transition"
                    >
                        <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>

                    {/* Header */}
                    <div className="text-center mb-6 sm:mb-8">
                        <div className="text-4xl sm:text-5xl md:text-6xl mb-3 sm:mb-4">🍬</div>
                        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold gradient-text mb-2">Login to Continue</h2>
                        <p className="text-gray-400 text-sm sm:text-base">Choose your preferred login method</p>
                    </div>

                    {/* Login Method Tabs */}
                    <div className="flex gap-2 sm:gap-3 mb-6">
                        <button
                            onClick={() => setLoginMethod('whatsapp')}
                            className={`flex-1 py-2 sm:py-3 rounded-xl font-semibold transition text-sm sm:text-base ${loginMethod === 'whatsapp'
                                ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white'
                                : 'glass hover:bg-white/10 text-gray-400'
                                }`}
                        >
                            <div className="flex items-center justify-center gap-2">
                                <svg className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                </svg>
                                <span className="hidden sm:inline">WhatsApp</span>
                            </div>
                        </button>
                        <button
                            onClick={() => setLoginMethod('email')}
                            className={`flex-1 py-2 sm:py-3 rounded-xl font-semibold transition text-sm sm:text-base ${loginMethod === 'email'
                                ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white'
                                : 'glass hover:bg-white/10 text-gray-400'
                                }`}
                        >
                            <div className="flex items-center justify-center gap-2">
                                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                <span className="hidden sm:inline">Email</span>
                            </div>
                        </button>
                    </div>

                    {/* WhatsApp Login Form */}
                    {loginMethod === 'whatsapp' && (
                        <motion.form
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            onSubmit={handleWhatsAppLogin}
                            className="space-y-4"
                        >
                            <div>
                                <label className="block text-xs sm:text-sm font-semibold mb-2 text-gray-300">Phone Number</label>
                                <input
                                    type="tel"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    placeholder="9876543210"
                                    className="w-full px-3 sm:px-4 py-3 sm:py-4 rounded-xl glass border border-white/10 focus:border-blue-500 outline-none transition text-sm sm:text-base"
                                />
                            </div>
                            <div>
                                <label className="block text-xs sm:text-sm font-semibold mb-2 text-gray-300">Coupon Code</label>
                                <input
                                    type="text"
                                    value={couponCode}
                                    onChange={(e) => setCouponCode(e.target.value)}
                                    placeholder="Enter code from product"
                                    className="w-full px-3 sm:px-4 py-3 sm:py-4 rounded-xl glass border border-white/10 focus:border-blue-500 outline-none transition text-sm sm:text-base"
                                />
                            </div>
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                type="submit"
                                disabled={loading}
                                className="w-full py-3 sm:py-4 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl font-bold text-sm sm:text-base hover:shadow-2xl hover:shadow-green-500/20 transition-all mt-4 sm:mt-6 disabled:opacity-50"
                            >
                                {loading ? 'Verifying...' : 'Send OTP'}
                            </motion.button>
                        </motion.form>
                    )}

                    {/* Email Login Form */}
                    {loginMethod === 'email' && (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="space-y-4"
                        >
                            {/* Google Login Button */}
                            <div className="w-full">
                                <GoogleLogin
                                    onSuccess={handleGoogleSuccess}
                                    onError={handleGoogleError}
                                    size="large"
                                    text="continue_with"
                                    shape="rectangular"
                                    width="100%"
                                />
                            </div>

                            {/* Divider */}
                            <div className="relative my-6">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-600"></div>
                                </div>
                                <div className="relative flex justify-center text-xs sm:text-sm">
                                    <span className="px-2 bg-gray-900 text-gray-400">Or continue with email</span>
                                </div>
                            </div>

                            {/* Email/Password Form */}
                            <form onSubmit={handleEmailLogin} className="space-y-4">
                                <div>
                                    <label className="block text-xs sm:text-sm font-semibold mb-2 text-gray-300">Email Address</label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="your@email.com"
                                        className="w-full px-3 sm:px-4 py-3 sm:py-4 rounded-xl glass border border-white/10 focus:border-blue-500 outline-none transition text-sm sm:text-base"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs sm:text-sm font-semibold mb-2 text-gray-300">Password</label>
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Enter your password"
                                        className="w-full px-3 sm:px-4 py-3 sm:py-4 rounded-xl glass border border-white/10 focus:border-blue-500 outline-none transition text-sm sm:text-base"
                                    />
                                </div>
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-3 sm:py-4 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl font-bold text-sm sm:text-base hover:shadow-2xl hover:shadow-blue-500/20 transition-all disabled:opacity-50"
                                >
                                    {loading ? 'Logging in...' : 'Login with Email'}
                                </motion.button>
                                <p className="text-center text-xs sm:text-sm text-gray-400 mt-3">
                                    Don't have an account?{' '}
                                    <button type="button" className="text-blue-400 hover:text-blue-300 font-semibold">
                                        Sign up
                                    </button>
                                </p>
                            </form>
                        </motion.div>
                    )}

                    {/* Info Box */}
                    <div className="mt-4 sm:mt-6 p-3 sm:p-4 glass rounded-xl">
                        <p className="text-xs sm:text-sm text-gray-400 text-center">
                            🔒 Your information is secure and will never be shared
                        </p>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    )
}
