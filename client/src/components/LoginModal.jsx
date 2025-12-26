import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GoogleLogin } from '@react-oauth/google'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import api from '../services/api'
import { X, Smartphone, Mail, Lock, ShieldCheck, ArrowRight, UserPlus, LogIn } from 'lucide-react'

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
            const response = await api.post('/auth/google/login', {
                token: credentialResponse.credential
            })
            localStorage.setItem('token', response.data.token)
            localStorage.setItem('user', JSON.stringify(response.data.user))
            toast.success('Google login successful!')
            onClose()
            window.location.reload()
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
                className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-6 selection:bg-blue-100"
                onClick={onClose}
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="bg-white rounded-[2rem] shadow-2xl shadow-slate-900/20 max-w-md w-full relative overflow-hidden flex flex-col"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header Banner */}
                    <div className="bg-slate-50 border-b border-slate-100 p-8 pt-10 text-center relative">
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 transition-colors"
                        >
                            <X size={20} />
                        </button>
                        <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center font-black text-2xl text-slate-900 italic mx-auto mb-6">P</div>
                        <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight leading-none italic">Partner Login</h2>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-3">Access your exclusive dashboard</p>
                    </div>

                    {/* Tabs */}
                    <div className="flex border-b border-slate-100 italic font-black uppercase tracking-widest text-[10px]">
                        <button
                            onClick={() => setLoginMethod('whatsapp')}
                            className={`flex-1 py-5 flex items-center justify-center gap-2 transition-all ${loginMethod === 'whatsapp' ? 'bg-white text-blue-600 border-b-2 border-blue-600' : 'bg-slate-50/50 text-slate-400 hover:text-slate-600'}`}
                        >
                            <Smartphone size={14} /> WhatsApp
                        </button>
                        <button
                            onClick={() => setLoginMethod('email')}
                            className={`flex-1 py-5 flex items-center justify-center gap-2 transition-all ${loginMethod === 'email' ? 'bg-white text-blue-600 border-b-2 border-blue-600' : 'bg-slate-50/50 text-slate-400 hover:text-slate-600'}`}
                        >
                            <Mail size={14} /> Email Access
                        </button>
                    </div>

                    <div className="p-10">
                        {loginMethod === 'whatsapp' ? (
                            <motion.form
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                onSubmit={handleWhatsAppLogin}
                                className="space-y-6"
                            >
                                <div className="space-y-4">
                                    <div className="relative group">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors"><Smartphone size={18} /></div>
                                        <input
                                            type="tel"
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                            placeholder="Phone Number"
                                            className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm outline-none focus:border-blue-500/30 focus:bg-white transition-all placeholder:text-slate-300"
                                        />
                                    </div>
                                    <div className="relative group">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors"><Lock size={18} /></div>
                                        <input
                                            type="text"
                                            value={couponCode}
                                            onChange={(e) => setCouponCode(e.target.value)}
                                            placeholder="Coupon Code"
                                            className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm outline-none focus:border-blue-500/30 focus:bg-white transition-all placeholder:text-slate-300"
                                        />
                                    </div>
                                </div>
                                <button
                                    disabled={loading}
                                    className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs italic shadow-xl shadow-blue-500/10 hover:bg-blue-700 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                                >
                                    {loading ? 'Processing...' : 'Secure Send OTP'}
                                </button>
                            </motion.form>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="space-y-8 text-center"
                            >
                                <div className="w-full">
                                    <GoogleLogin
                                        onSuccess={handleGoogleSuccess}
                                        onError={handleGoogleError}
                                        size="large"
                                        text="continue_with"
                                        shape="pill"
                                        width="100%"
                                    />
                                </div>

                                <div className="relative">
                                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
                                    <span className="relative px-4 bg-white text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 italic">Auth Fallback</span>
                                </div>

                                <form onSubmit={handleEmailLogin} className="space-y-4 text-left">
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="Email Address"
                                        className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm outline-none focus:border-blue-500/30 focus:bg-white transition-all placeholder:text-slate-300"
                                    />
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Secret Password"
                                        className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm outline-none focus:border-blue-500/30 focus:bg-white transition-all placeholder:text-slate-300"
                                    />
                                    <button
                                        disabled={loading}
                                        className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs italic hover:bg-slate-800 transition-all disabled:opacity-50"
                                    >
                                        Member Sign In
                                    </button>
                                </form>
                            </motion.div>
                        )}
                    </div>

                    {/* Footer Info */}
                    <div className="p-8 bg-slate-50/50 border-t border-slate-100 flex items-center justify-center gap-3 grayscale opacity-40">
                        <ShieldCheck size={14} className="text-slate-900" />
                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-900 italic">Encrypted Partner Session</span>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    )
}
