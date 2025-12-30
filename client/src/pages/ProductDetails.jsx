import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { productService } from '../services/productService'
import {
    ShoppingCart, ExternalLink, ArrowRight, ShieldCheck,
    CheckCircle2, Info, ChevronLeft, Star, Zap, Package
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function ProductDetails() {
    const { qrCode } = useParams()
    const navigate = useNavigate()
    const [product, setProduct] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                // If the parameter is a number, it's a product ID, else it's a QR code
                const isId = !isNaN(qrCode)
                const response = isId
                    ? await productService.getProduct(qrCode)
                    : await productService.resolveQR(qrCode)
                setProduct(response.data)
            } catch (error) {
                console.error('Failed to resolve product:', error)
                toast.error('Product not found')
                navigate('/')
            } finally {
                setLoading(false)
            }
        }
        fetchProduct()
    }, [qrCode, navigate])

    if (loading) {
        return (
            <div className="min-h-screen bg-[#040714] flex items-center justify-center">
                <div className="flex flex-col items-center gap-6">
                    <div className="w-12 h-12 border-2 border-white/5 border-t-blue-500 rounded-full animate-spin"></div>
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Syncing Profile</span>
                </div>
            </div>
        )
    }

    if (!product) return null

    return (
        <div className="min-h-screen bg-[#040714] text-slate-200 overflow-x-hidden">
            {/* Background Gradient */}
            <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-blue-600/5 blur-[150px] rounded-full pointer-events-none" />

            <nav className="fixed top-8 left-8 z-50">
                <motion.button
                    whileHover={{ x: -5 }}
                    onClick={() => navigate('/')}
                    className="p-4 bg-white/5 border border-white/5 backdrop-blur-xl rounded-full text-slate-400 hover:text-white transition-all shadow-2xl"
                >
                    <ChevronLeft size={20} />
                </motion.button>
            </nav>

            <main className="max-w-7xl mx-auto px-6 py-32 lg:py-48 grid lg:grid-cols-2 gap-20 items-start">
                {/* Left - Visual Presentation */}
                <div className="space-y-12">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="relative group bg-[#0b1022] border border-white/5 rounded-[4rem] p-12 lg:p-24 overflow-hidden shadow-2xl"
                    >
                        <img
                            src={product.image_url || 'https://via.placeholder.com/800x800?text=Purna+Gummies'}
                            alt={product.name}
                            className="w-full h-full object-contain relative z-10 group-hover:scale-105 transition-transform duration-700"
                        />
                        {/* Interactive glow */}
                        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-blue-600/10 to-transparent pointer-events-none" />
                    </motion.div>

                    <div className="grid grid-cols-2 gap-6">
                        <div className="bg-white/5 border border-white/5 p-8 rounded-[2rem] space-y-2">
                            <div className="text-blue-500 bg-blue-500/10 w-10 h-10 rounded-xl flex items-center justify-center mb-4"><ShieldCheck size={18} /></div>
                            <div className="text-[10px] font-black text-slate-500 tracking-widest uppercase">CLINICALLY TESTED</div>
                            <div className="text-xl font-bold text-white tracking-tight">PRO GRADE</div>
                        </div>
                        <div className="bg-white/5 border border-white/5 p-8 rounded-[2rem] space-y-2">
                            <div className="text-blue-500 bg-blue-500/10 w-10 h-10 rounded-xl flex items-center justify-center mb-4"><Zap size={18} /></div>
                            <div className="text-[10px] font-black text-slate-500 tracking-widest uppercase">EXCLUSIVE OFFER</div>
                            <div className="text-xl font-bold text-white tracking-tight">GUARANTEED</div>
                        </div>
                    </div>
                </div>

                {/* Right - Product Data & CTA */}
                <div className="space-y-16 lg:pt-10">
                    <header className="space-y-6">
                        <div className="flex items-center gap-2">
                            <span className="px-3 py-1 bg-blue-600 text-[10px] font-black tracking-widest uppercase rounded-lg">Official Partner</span>
                            <div className="flex gap-1 ml-4">
                                {[1, 2, 3, 4, 5].map(s => <Star key={s} size={10} className="fill-blue-500 text-blue-500" />)}
                            </div>
                        </div>
                        <h1 className="text-5xl lg:text-7xl font-black text-white tracking-tighter leading-[0.9] uppercase italic">
                            {product.name}
                        </h1>
                        <p className="text-xl text-slate-400 font-medium leading-relaxed max-w-xl">
                            {product.description || 'Experience the future of wellness with our scientifically balanced gummies. Designed for performance, tasted for pleasure.'}
                        </p>
                    </header>

                    {/* Reward Block */}
                    <div className="flex items-end gap-6">
                        <div>
                            <div className="text-[10px] font-black text-slate-600 tracking-widest uppercase mb-2">Exclusive Offer</div>
                            <div className="text-4xl font-black text-emerald-400 tracking-tighter italic uppercase">Guaranteed Reward</div>
                        </div>
                        <div className="pb-2">
                            <div className="text-xs font-black text-slate-500 uppercase tracking-widest mt-1 italic flex items-center gap-2">
                                <CheckCircle2 size={12} className="text-emerald-500" />
                                Instant Claim
                            </div>
                        </div>
                    </div>

                    {/* Action Hub */}
                    <div className="space-y-8">
                        <div className="grid grid-cols-2 gap-4">
                            {product.amazon_url && (
                                <motion.a
                                    whileHover={{ y: -5 }}
                                    href={product.amazon_url}
                                    target="_blank"
                                    className="p-6 bg-white/5 border border-white/5 rounded-[2rem] flex flex-col items-center justify-center gap-3 group hover:border-blue-500/30 transition-all shadow-xl"
                                >
                                    <Globe size={24} className="text-slate-600 group-hover:text-white transition-colors" />
                                    <span className="text-xs font-black uppercase tracking-widest text-slate-500 group-hover:text-white">Shop Amazon</span>
                                </motion.a>
                            )}
                            {product.flipkart_url && (
                                <motion.a
                                    whileHover={{ y: -5 }}
                                    href={product.flipkart_url}
                                    target="_blank"
                                    className="p-6 bg-white/5 border border-white/5 rounded-[2rem] flex flex-col items-center justify-center gap-3 group hover:border-blue-500/30 transition-all shadow-xl"
                                >
                                    <ShoppingCart size={24} className="text-slate-600 group-hover:text-white transition-colors" />
                                    <span className="text-xs font-black uppercase tracking-widest text-slate-500 group-hover:text-white">Shop Flipkart</span>
                                </motion.a>
                            )}
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.02, y: -2 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => navigate('/', { state: { productName: product.name, qrCode: qrCode, autoOpenReward: true } })}
                            className="w-full py-7 bg-blue-600 text-white rounded-[2.5rem] font-black text-2xl shadow-2xl shadow-blue-500/30 transition-all flex items-center justify-center gap-4 group"
                        >
                            Claim Your Reward
                            <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform" />
                        </motion.button>

                        <div className="flex items-center justify-center gap-3 bg-white/5 border border-white/5 p-4 rounded-2xl">
                            <Package size={16} className="text-blue-500" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Verified Partner Program • ID: {qrCode || 'MSTR-CAT'}</span>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
