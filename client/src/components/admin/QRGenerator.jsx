import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { productService } from '../../services/productService'
import { API_URL } from '../../services/api'
import {
    QrCode, Plus, Copy, ExternalLink, BarChart3,
    Clock, Link2, Target, Zap, Activity,
    ChevronRight, Scan, MousePointer2
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function QRGenerator() {
    const [companies, setCompanies] = useState([])
    const [selectedCompany, setSelectedCompany] = useState('')
    const [products, setProducts] = useState([])
    const [selectedProduct, setSelectedProduct] = useState('')
    const [qrCodes, setQrCodes] = useState([])
    const [batches, setBatches] = useState([])
    const [loading, setLoading] = useState(true)
    const [quantity, setQuantity] = useState(100)
    const [generating, setGenerating] = useState(false)
    const [filter, setFilter] = useState('all') // 'all', 'used', 'unused'
    const [view, setView] = useState('log') // 'log' or 'batches'

    useEffect(() => {
        fetchInitialData()
    }, [])

    const fetchInitialData = async () => {
        try {
            const response = await productService.admin.listCompanies()
            setCompanies(response.data)
        } catch (error) {
            toast.error('Failed to load companies')
        } finally {
            setLoading(false)
        }
    }

    const handleCompanyChange = async (companyId) => {
        setSelectedCompany(companyId)
        setSelectedProduct('')
        setQrCodes([])
        if (!companyId) {
            setProducts([])
            return
        }

        try {
            const response = await productService.admin.listProducts()
            const filteredProducts = response.data.filter(p => p.company_id === parseInt(companyId))
            setProducts(filteredProducts)

            // NEW: Fetch all batches for this company/brand initially
            fetchBatches(null, companyId)
        } catch (error) {
            toast.error('Failed to load products')
        }
    }

    const handleInstantDownload = async () => {
        if (!selectedProduct) return toast.error('Select a product first')
        if (quantity < 1 || quantity > 500) return toast.error('Quantity must be between 1 and 500')

        setGenerating(true)
        const loadToast = toast.loading(`Generating ${quantity} QR Codes...`)

        try {
            const response = await productService.admin.generateBatchPDF(selectedProduct, quantity)

            // Handle Blob Download locally (Fixes Mixed Content & Storage issues)
            const url = window.URL.createObjectURL(new Blob([response.data]))
            const link = document.createElement('a')
            link.href = url
            const pName = products.find(p => p.id === parseInt(selectedProduct))?.name || 'Product'
            link.setAttribute('download', `QR_${quantity}_${pName.replace(/\s+/g, '_')}.pdf`)
            document.body.appendChild(link)
            link.click()

            // Cleanup
            document.body.removeChild(link)
            window.URL.revokeObjectURL(url)

            toast.success('Batch Generated & Downloaded', { id: loadToast })
            fetchQRs(selectedProduct) // Refresh log
            fetchBatches(selectedProduct) // Refresh batches
        } catch (error) {
            toast.error('Generation Failed', { id: loadToast })
        } finally {
            setGenerating(false)
        }
    }

    const fetchQRs = async (productId) => {
        try {
            const response = await productService.admin.getProductQRs(productId)
            setQrCodes(response.data)
        } catch (error) {
            toast.error('Failed to resolve QR codes')
        }
    }

    const fetchBatches = async (productId, companyId = null) => {
        try {
            let response;
            if (productId) {
                response = await productService.admin.getBatchHistory(productId)
            } else if (companyId || selectedCompany) {
                response = await productService.admin.getCompanyBatchHistory(companyId || selectedCompany)
            } else {
                return;
            }
            setBatches(response.data)
        } catch (error) {
            console.error('Failed to load batches')
        }
    }

    const copyToClipboard = (code) => {
        const url = `${window.location.origin}/p/${code}`
        navigator.clipboard.writeText(url)
        toast.success('Pointer Link Copied')
    }

    if (loading) {
        return (
            <div className="h-[60vh] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-2 border-white/5 border-t-blue-500 rounded-full animate-spin"></div>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 italic">Syncing Engine</span>
                </div>
            </div>
        )
    }

    return (
        <div className="p-6 lg:p-10 space-y-10">
            <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <Scan className="text-blue-500 w-5 h-5" />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Logistics Engine</span>
                    </div>
                    <h1 className="text-3xl lg:text-4xl font-black text-white tracking-tight leading-none">QR Tracking</h1>
                    <p className="text-slate-500 mt-2 font-medium">Generate entry points and monitor real-time engagement</p>
                </div>

                <div className="hidden lg:flex items-center gap-6 p-4 bg-white/5 border border-white/5 rounded-2xl">
                    <div className="flex -space-x-3">
                        {[1, 2, 3].map(i => <div key={i} className="w-8 h-8 rounded-full border-2 border-[#040714] bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-500">M{i}</div>)}
                    </div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-600">Active Monitoring</div>
                </div>
            </header>

            <div className="grid lg:grid-cols-12 gap-10">
                {/* Side: Control Terminal */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-[#0b1022] p-8 rounded-[2.5rem] border border-white/5 shadow-2xl space-y-6">
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <Target size={16} className="text-blue-500" />
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic">Target Parameters</label>
                            </div>

                            {/* Company Selection */}
                            <select
                                value={selectedCompany}
                                onChange={(e) => handleCompanyChange(e.target.value)}
                                className="w-full bg-slate-900 border border-white/10 rounded-2xl px-6 py-5 text-white text-xs font-bold focus:border-blue-500 transition-all appearance-none outline-none shadow-inner mb-3"
                            >
                                <option value="">Select Brand...</option>
                                {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>

                            {/* Product Selection */}
                            <select
                                disabled={!selectedCompany}
                                value={selectedProduct}
                                onChange={(e) => {
                                    setSelectedProduct(e.target.value)
                                    if (e.target.value) {
                                        fetchQRs(e.target.value)
                                        fetchBatches(e.target.value)
                                    }
                                }}
                                className="w-full bg-slate-900 border border-white/10 rounded-2xl px-6 py-5 text-white text-xs font-bold focus:border-blue-500 transition-all appearance-none outline-none shadow-inner disabled:opacity-30"
                            >
                                <option value="">Identify Target Product...</option>
                                {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic">Quantity</span>
                            </div>
                            <input
                                type="number"
                                min="1"
                                max="100"
                                value={quantity}
                                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                                className="w-full bg-slate-900 border border-white/10 rounded-2xl px-6 py-5 text-white text-xs font-bold focus:border-blue-500 transition-all outline-none shadow-inner"
                                placeholder="24"
                            />
                            <p className="text-[9px] text-slate-600 italic">Generate 1-100 codes at once (4×6 grid = 24)</p>
                        </div>

                        <button
                            onClick={handleInstantDownload}
                            disabled={!selectedProduct || generating}
                            className="w-full py-6 bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-500 hover:to-emerald-500 text-white rounded-[1.5rem] font-black text-xs uppercase tracking-widest transition-all shadow-2xl shadow-blue-600/20 flex items-center justify-center gap-3 group"
                        >
                            {generating ? (
                                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <Zap size={18} className="group-hover:scale-110 transition-transform" />
                            )}
                            {generating ? 'Compiling PDF...' : 'One-Click Batch Download'}
                        </button>
                    </div>

                    {selectedProduct && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-blue-600/5 p-8 rounded-[2.5rem] border border-blue-500/10 flex flex-col items-center text-center gap-4"
                        >
                            <div className="p-4 rounded-3xl bg-blue-600/10 text-blue-500 border border-blue-500/10">
                                <BarChart3 size={32} />
                            </div>
                            <div>
                                <div className="text-5xl font-black text-white leading-none tracking-tighter italic">
                                    {qrCodes.reduce((acc, curr) => acc + curr.scan_count, 0)}
                                </div>
                                <p className="text-[10px] uppercase font-black text-slate-600 mt-4 tracking-widest">Aggregate Hits</p>
                            </div>
                        </motion.div>
                    )}
                </div>

                {/* Main: Interactive Log */}
                <div className="lg:col-span-8">
                    {/* Usage Filters */}
                    {selectedProduct && qrCodes.length > 0 && (
                        <div className="flex items-center justify-between mb-8 p-1 bg-white/5 border border-white/5 rounded-2xl">
                            <div className="flex gap-1">
                                <button
                                    onClick={() => setView('log')}
                                    className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${view === 'log' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
                                >
                                    Real-Time Log
                                </button>
                                <button
                                    onClick={() => setView('batches')}
                                    className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${view === 'batches' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
                                >
                                    Batch Manifest
                                </button>
                            </div>

                            {view === 'log' && (
                                <div className="flex gap-2 mr-2">
                                    {['all', 'unused', 'used'].map(f => (
                                        <button
                                            key={f}
                                            onClick={() => setFilter(f)}
                                            className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${filter === f ? 'bg-white/10 text-white' : 'text-slate-600 hover:text-white'}`}
                                        >
                                            {f}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    <div className="space-y-4">
                        <AnimatePresence mode="popLayout">
                            {view === 'log' ? (
                                qrCodes.filter(qr => {
                                    if (filter === 'used') return qr.is_used
                                    if (filter === 'unused') return !qr.is_used
                                    return true
                                }).map((qr, idx) => (
                                    <motion.div
                                        layout
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        key={qr.code}
                                        className="bg-[#0b1022] p-6 rounded-[2rem] border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-blue-500/20 transition-all group shadow-xl"
                                    >
                                        <div className="flex items-center gap-6">
                                            <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center border border-white/5 text-slate-400 group-hover:bg-blue-600/10 group-hover:text-blue-500 transition-all">
                                                <QrCode size={24} />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-3">
                                                    <div className="font-mono text-white font-black text-lg tracking-[0.2em] italic uppercase">
                                                        {qr.code.includes('-') ? qr.code.split('-').slice(0, 2).join('-') : qr.code}
                                                    </div>
                                                    <div className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-wider ${qr.is_used ? 'bg-rose-500/10 text-rose-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                                                        {qr.is_used ? 'Used' : 'Unused'}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4 text-[9px] font-black uppercase tracking-[0.2em] mt-2">
                                                    <span className="text-slate-600 flex items-center gap-1.5"><Clock size={12} /> {new Date(qr.created_at).toLocaleDateString()}</span>
                                                    <span className="text-emerald-500 flex items-center gap-1.5"><Activity size={12} /> {qr.scan_count} Scans</span>
                                                </div>
                                            </div>
                                            <img
                                                src={`${API_URL}/api/admin/catalog/products/${selectedProduct}/qr-image/${qr.code}`}
                                                alt={`QR ${qr.code}`}
                                                className="w-16 h-16 rounded-xl border border-white/10 bg-white p-1"
                                            />
                                        </div>
                                        <div className="flex gap-3">
                                            <button
                                                onClick={() => copyToClipboard(qr.code)}
                                                className="px-6 py-3.5 bg-white/5 hover:bg-white/10 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border border-white/5 flex items-center justify-center gap-2 group/btn"
                                            >
                                                <Copy size={14} className="group-hover/btn:scale-110 transition-transform" /> Copy Pointer
                                            </button>
                                        </div>
                                    </motion.div>
                                ))
                            ) : (
                                batches.map((batch, idx) => (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.1 }}
                                        key={batch.id}
                                        className="bg-[#0b1022] p-8 rounded-[2rem] border border-white/5 flex items-center justify-between group hover:border-emerald-500/20 transition-all shadow-xl"
                                    >
                                        <div className="flex items-center gap-8">
                                            <div className="w-16 h-16 rounded-2xl bg-emerald-500/5 flex flex-col items-center justify-center border border-emerald-500/10 text-emerald-500">
                                                <div className="text-[10px] font-black uppercase leading-tight">Batch</div>
                                                <div className="text-2xl font-black italic">#{batch.batch_number}</div>
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-[9px] font-black uppercase tracking-widest text-emerald-500/60 bg-emerald-500/5 px-2 py-0.5 rounded border border-emerald-500/10">
                                                        {batch.product_name}
                                                    </span>
                                                </div>
                                                <div className="text-white font-black text-xl tracking-tighter">
                                                    {batch.quantity} Printed Labels
                                                </div>
                                                <div className="flex items-center gap-4 mt-2">
                                                    <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                                        <Target size={12} /> Range: {batch.serial_start} - {batch.serial_end}
                                                    </div>
                                                    <div className="text-[10px] font-black text-slate-600 uppercase tracking-widest flex items-center gap-2">
                                                        <Clock size={12} /> {new Date(batch.created_at).toLocaleString()}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="px-6 py-3 bg-emerald-600/10 text-emerald-500 rounded-xl text-[10px] font-black uppercase tracking-widest border border-emerald-500/10">
                                            Verified Pack
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </AnimatePresence>

                        {selectedProduct && qrCodes.length === 0 && (
                            <div className="p-32 bg-[#0b1022] rounded-[3rem] border border-dashed border-white/5 text-center opacity-30">
                                <QrCode className="w-16 h-16 text-slate-800 mx-auto mb-6" />
                                <p className="text-slate-600 font-black uppercase tracking-widest text-xs">No Active Vectors Found</p>
                            </div>
                        )}

                        {!selectedProduct && (
                            <div className="h-[40vh] flex flex-col items-center justify-center text-center p-20 opacity-20 border-2 border-dashed border-white/5 rounded-[3rem]">
                                <Activity className="w-20 h-20 mb-6" />
                                <p className="text-xs font-black uppercase tracking-[0.3em]">Initialize Target to View Log</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
