import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { adminAuthService } from '../services/adminAuthService'

export default function AdminLoginPage() {
    const navigate = useNavigate()
    const [step, setStep] = useState(1) // 1 = email/password, 2 = OTP
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [otp, setOTP] = useState('')
    const [loading, setLoading] = useState(false)

    const handleEmailPasswordSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)

        try {
            const response = await adminAuthService.login(email, password)
            toast.success(response.data.message)
            setStep(2) // Move to OTP step
        } catch (error) {
            toast.error(error.response?.data?.detail || 'Login failed')
        } finally {
            setLoading(false)
        }
    }

    const handleOTPSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)

        try {
            const response = await adminAuthService.verifyOTP(email, otp)
            adminAuthService.setAdminToken(response.data.access_token)
            toast.success('Login successful!')
            navigate('/admin/dashboard')
        } catch (error) {
            toast.error(error.response?.data?.detail || 'Invalid OTP')
        } finally {
            setLoading(false)
        }
    }

    const handleResendOTP = async () => {
        try {
            await adminAuthService.resendOTP(email)
            toast.success('New OTP sent to your email')
        } catch (error) {
            toast.error('Failed to resend OTP')
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900"></div>

            {/* Animated background shapes */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass rounded-3xl p-10 max-w-md w-full relative z-10"
            >
                {/* Logo and Title */}
                <div className="text-center mb-8">
                    <div className="text-6xl mb-4">🔐</div>
                    <h1 className="text-4xl font-bold gradient-text mb-2">Admin Login</h1>
                    <p className="text-gray-400">Purna Gummies Admin Panel</p>
                </div>

                <AnimatePresence mode="wait">
                    {step === 1 ? (
                        <motion.form
                            key="step1"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            onSubmit={handleEmailPasswordSubmit}
                            className="space-y-6"
                        >
                            <div>
                                <label className="block text-sm font-semibold mb-2 text-gray-300">Email Address</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="admin@purnagummies.com"
                                    required
                                    className="w-full px-4 py-4 rounded-xl glass border border-white/10 focus:border-blue-500 outline-none transition text-lg"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold mb-2 text-gray-300">Password</label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter your password"
                                    required
                                    className="w-full px-4 py-4 rounded-xl glass border border-white/10 focus:border-blue-500 outline-none transition text-lg"
                                />
                            </div>

                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                type="submit"
                                disabled={loading}
                                className="w-full py-4 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl font-bold text-lg hover:shadow-2xl hover:shadow-blue-500/20 transition-all disabled:opacity-50"
                            >
                                {loading ? 'Sending OTP...' : 'Send OTP'}
                            </motion.button>
                        </motion.form>
                    ) : (
                        <motion.form
                            key="step2"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            onSubmit={handleOTPSubmit}
                            className="space-y-6"
                        >
                            <div className="text-center mb-6">
                                <p className="text-gray-300">OTP sent to</p>
                                <p className="text-white font-semibold">{email}</p>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold mb-2 text-gray-300">Enter OTP</label>
                                <input
                                    type="text"
                                    value={otp}
                                    onChange={(e) => setOTP(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                    placeholder="000000"
                                    required
                                    maxLength={6}
                                    className="w-full px-4 py-4 rounded-xl glass border border-white/10 focus:border-blue-500 outline-none transition text-2xl text-center tracking-widest font-bold"
                                />
                            </div>

                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                type="submit"
                                disabled={loading || otp.length !== 6}
                                className="w-full py-4 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl font-bold text-lg hover:shadow-2xl hover:shadow-blue-500/20 transition-all disabled:opacity-50"
                            >
                                {loading ? 'Verifying...' : 'Verify & Login'}
                            </motion.button>

                            <div className="flex items-center justify-between text-sm">
                                <button
                                    type="button"
                                    onClick={() => setStep(1)}
                                    className="text-gray-400 hover:text-white transition"
                                >
                                    ← Change Email
                                </button>
                                <button
                                    type="button"
                                    onClick={handleResendOTP}
                                    className="text-blue-400 hover:text-purple-300 transition"
                                >
                                    Resend OTP
                                </button>
                            </div>
                        </motion.form>
                    )}
                </AnimatePresence>

                <div className="mt-6 p-4 glass rounded-xl">
                    <p className="text-xs text-gray-400 text-center">
                        🔒 Secure admin authentication with OTP verification
                    </p>
                </div>
            </motion.div>
        </div>
    )
}
