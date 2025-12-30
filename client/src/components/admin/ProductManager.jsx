import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { productService } from '../../services/productService'
import {
    Plus, Building2, Package, Save, X, Trash2,
    Edit2, ExternalLink, MoreVertical, LayoutGrid,
    Layers, Search, ShieldCheck, ShoppingCart, Globe
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function ProductManager() {
    const [companies, setCompanies] = useState([])
    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)
    const [showCompanyModal, setShowCompanyModal] = useState(false)
    const [newCompany, setNewCompany] = useState({
        name: '',
        website: '',
        description: '',
        products: [{
            name: '',
            cashback_amount: 100,
            sku_prefix: '',
            amazon_url: '',
            flipkart_url: '',
            meesho_url: '',
            myntra_url: '',
            nykaa_url: '',
            jiomart_url: ''
        }]
    })
    const [showQRModal, setShowQRModal] = useState(false)
    const [selectedProduct, setSelectedProduct] = useState(null)
    const [qrQuantity, setQrQuantity] = useState(100)
    const [qrGenerating, setQrGenerating] = useState(false)

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            const [compRes, prodRes] = await Promise.all([
                productService.admin.listCompanies(),
                productService.admin.listProducts()
            ])
            setCompanies(compRes.data)
            setProducts(prodRes.data)
        } catch (error) {
            toast.error('Failed to load catalog data')
        } finally {
            setLoading(false)
        }
    }

    const handleCreateCompany = async (e) => {
        e.preventDefault()
        try {
            await productService.admin.createCompany(newCompany)
            toast.success('System: Brand Profile & Products Registered')
            setShowCompanyModal(false)
            setNewCompany({ name: '', website: '', description: '', products: [{ name: '', cashback_amount: 100, sku_prefix: '', amazon_url: '', flipkart_url: '', meesho_url: '', myntra_url: '', nykaa_url: '', jiomart_url: '' }] })
            fetchData()
        } catch (error) {
            toast.error('Failed to add company')
        }
    }

    const addProductField = () => {
        setNewCompany({
            ...newCompany,
            products: [...newCompany.products, { name: '', cashback_amount: 100, sku_prefix: '', amazon_url: '', flipkart_url: '', meesho_url: '', myntra_url: '', nykaa_url: '', jiomart_url: '' }]
        })
    }

    const removeProductField = (index) => {
        const updatedProducts = newCompany.products.filter((_, i) => i !== index)
        setNewCompany({ ...newCompany, products: updatedProducts })
    }

    const updateProductField = (index, field, value) => {
        const updatedProducts = [...newCompany.products]
        updatedProducts[index][field] = value
        setNewCompany({ ...newCompany, products: updatedProducts })
    }

    const handleGenerateBatch = async (e) => {
        e.preventDefault()
        if (!selectedProduct || qrQuantity < 1) return

        setQrGenerating(true)
        const loadToast = toast.loading(`Generating ${qrQuantity} QR Codes...`)

        try {
            const response = await productService.admin.generateBatchPDF(selectedProduct.id, qrQuantity)

            // Handle Blob Download
            const url = window.URL.createObjectURL(new Blob([response.data]))
            const link = document.createElement('a')
            link.href = url
            link.setAttribute('download', `QR_${qrQuantity}_${selectedProduct.name.replace(/\s+/g, '_')}.pdf`)
            document.body.appendChild(link)
            link.click()

            // Cleanup
            document.body.removeChild(link)
            window.URL.revokeObjectURL(url)

            toast.success('Bundle Generated & Downloaded', { id: loadToast })
            setShowQRModal(false)
        } catch (error) {
            toast.error('Generation Failed', { id: loadToast })
        } finally {
            setQrGenerating(false)
        }
    }

    if (loading) {
        return (
            <div className="h-[60vh] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-2 border-white/5 border-t-blue-500 rounded-full animate-spin"></div>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 italic">Syncing Catalog</span>
                </div>
            </div>
        )
    }

    return (
        <div className="p-6 lg:p-10 space-y-10">
            <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <Layers className="text-blue-500 w-5 h-5" />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Inventory Engine</span>
                    </div>
                    <h1 className="text-3xl lg:text-4xl font-black text-white tracking-tight leading-none">Product Hub</h1>
                    <p className="text-slate-500 mt-2 font-medium">Manage master catalog and official brand identities</p>
                </div>

                <button
                    onClick={() => setShowCompanyModal(true)}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-xl shadow-blue-600/20"
                >
                    <Building2 className="w-4 h-4 inline mr-2" /> Register Brand
                </button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-[#0b1022] p-8 rounded-[2.5rem] border border-white/5 flex items-center justify-between group hover:border-blue-500/20 transition-all">
                    <div>
                        <div className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1 italic">Total Catalog</div>
                        <div className="text-4xl font-black text-white tracking-tighter">{products.length}</div>
                    </div>
                    <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center text-slate-700 group-hover:bg-blue-600/10 group-hover:text-blue-500 transition-all">
                        <Package size={28} />
                    </div>
                </div>
                <div className="bg-[#0b1022] p-8 rounded-[2.5rem] border border-white/5 flex items-center justify-between group hover:border-blue-500/20 transition-all">
                    <div>
                        <div className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1 italic">Brands Profiled</div>
                        <div className="text-4xl font-black text-white tracking-tighter">{companies.length}</div>
                    </div>
                    <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center text-slate-700 group-hover:bg-blue-600/10 group-hover:text-blue-500 transition-all">
                        <Building2 size={28} />
                    </div>
                </div>
                <div className="bg-[#0b1022] p-8 rounded-[2.5rem] border border-white/5 flex items-center justify-between group hover:border-blue-500/20 transition-all">
                    <div>
                        <div className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1 italic">Product Classes</div>
                        <div className="text-4xl font-black text-white tracking-tighter">{[...new Set(products.map(p => p.category))].length}</div>
                    </div>
                    <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center text-slate-700 group-hover:bg-blue-600/10 group-hover:text-blue-500 transition-all">
                        <LayoutGrid size={28} />
                    </div>
                </div>
            </div>

            <div className="bg-[#0b1022] rounded-[3rem] border border-white/5 overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-white/5 bg-white/[0.01]">
                                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-600">Inventory Identity</th>
                                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-600">Brand Source</th>
                                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-600">Cashback Reward</th>
                                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 text-right">Operations</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {products.map((product) => (
                                <tr key={product.id} className="hover:bg-blue-600/[0.02] transition-colors group">
                                    <td className="px-10 py-8">
                                        <div className="flex items-center gap-6">
                                            <div className="w-14 h-14 rounded-2xl bg-slate-900 flex items-center justify-center font-black text-blue-500 border border-white/5 text-lg group-hover:scale-105 transition-transform italic uppercase">
                                                {product.name[0]}
                                            </div>
                                            <div>
                                                <div className="font-bold text-white tracking-tight text-lg">{product.name}</div>
                                                <div className="flex items-center gap-3 mt-1">
                                                    <div className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Class: {product.category}</div>
                                                    <div className="text-[10px] font-black text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded-lg border border-blue-500/10 uppercase tracking-widest">{product.sku_prefix || 'NO-SKU'}</div>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-10 py-8">
                                        <span className="text-[10px] font-black text-slate-400 bg-white/5 px-4 py-2 rounded-xl border border-white/5 uppercase tracking-widest">
                                            {companies.find(c => c.id === product.company_id)?.name || 'GENERIC-SKU'}
                                        </span>
                                    </td>
                                    <td className="px-10 py-8">
                                        <div className="font-black text-xl text-emerald-500 tracking-tighter italic">₹{product.cashback_amount}</div>
                                        <div className="text-[10px] text-slate-600 font-bold uppercase tracking-tighter">PER UNIT</div>
                                    </td>
                                    <td className="px-10 py-8 text-right">
                                        <div className="flex justify-end gap-3 opacity-20 group-hover:opacity-100 transition-all">
                                            <button
                                                onClick={() => {
                                                    setSelectedProduct(product)
                                                    setShowQRModal(true)
                                                }}
                                                className="px-4 py-2 bg-emerald-600/10 hover:bg-emerald-600 text-emerald-500 hover:text-white rounded-xl transition text-[10px] font-black uppercase tracking-widest border border-emerald-500/20"
                                            >
                                                Batch QR
                                            </button>
                                            <button className="p-3 hover:bg-blue-600 hover:text-white rounded-xl transition text-slate-500 border border-transparent hover:border-blue-500/50">
                                                <Edit2 size={16} />
                                            </button>
                                            <button className="p-3 hover:bg-rose-600 hover:text-white rounded-xl transition text-slate-700 border border-transparent hover:border-rose-500/50">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {products.length === 0 && (
                    <div className="py-32 text-center opacity-30">
                        <Package className="w-16 h-16 text-slate-800 mx-auto mb-6" />
                        <p className="text-slate-600 font-black uppercase tracking-widest text-xs">Catalog Manifest Empty</p>
                    </div>
                )}
            </div>

            <AnimatePresence>
                {showCompanyModal && (
                    <Modal title="Register Brand" subtitle="Add New Partner Company" onClose={() => setShowCompanyModal(false)}>
                        <form onSubmit={handleCreateCompany} className="space-y-6">
                            <div className="relative overflow-hidden bg-gradient-to-br from-emerald-600/20 via-teal-600/10 to-transparent p-5 rounded-3xl border border-emerald-500/20">
                                <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-3xl"></div>
                                <div className="relative flex items-center gap-4">
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className="p-3 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-xl shadow-lg"
                                    >
                                        <Building2 size={24} className="text-white" />
                                    </motion.div>
                                    <div>
                                        <div className="text-xs font-black text-white uppercase tracking-widest leading-none">Brand Identity</div>
                                        <div className="text-[10px] text-slate-500 mt-1 uppercase font-bold tracking-tighter">Register official partner profile</div>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <FormGroup label="Company Name" icon={<Building2 size={14} />}>
                                    <input
                                        required
                                        value={newCompany.name}
                                        onChange={e => setNewCompany({ ...newCompany, name: e.target.value })}
                                        className="premium-input"
                                        placeholder="e.g., Purna Health"
                                    />
                                </FormGroup>

                                <FormGroup label="Official Website" icon={<Globe size={14} />}>
                                    <input
                                        value={newCompany.website}
                                        onChange={e => setNewCompany({ ...newCompany, website: e.target.value })}
                                        className="premium-input font-mono text-sm"
                                        placeholder="www.purnahealth.com"
                                    />
                                </FormGroup>

                                <div className="md:col-span-2">
                                    <FormGroup label="Company Description" icon={<span className="text-xs">📋</span>}>
                                        <textarea
                                            rows={2}
                                            value={newCompany.description}
                                            onChange={e => setNewCompany({ ...newCompany, description: e.target.value })}
                                            className="premium-input resize-none"
                                            placeholder="Write a brief brief about the brand..."
                                        />
                                    </FormGroup>
                                </div>
                            </div>

                            <div className="space-y-4 pt-4 border-t border-white/5">
                                <div className="flex items-center justify-between">
                                    <div className="text-[10px] font-black text-white uppercase tracking-widest flex items-center gap-2">
                                        <Package size={14} className="text-emerald-500" />
                                        Product Listing ({newCompany.products.length})
                                    </div>
                                    <button
                                        type="button"
                                        onClick={addProductField}
                                        className="p-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-500 rounded-lg transition-all border border-emerald-500/20 text-[10px] font-black uppercase tracking-widest"
                                    >
                                        Add Product
                                    </button>
                                </div>

                                <div className="space-y-3 max-h-[250px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/10">
                                    {newCompany.products.map((product, index) => (
                                        <div key={index} className="bg-white/[0.02] p-4 rounded-2xl border border-white/5 space-y-3 relative group/prod">
                                            <button
                                                type="button"
                                                onClick={() => removeProductField(index)}
                                                className="absolute top-4 right-4 p-1.5 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white rounded-lg transition-all opacity-0 group-hover/prod:opacity-100"
                                            >
                                                <Trash2 size={12} />
                                            </button>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div className="sm:col-span-1">
                                                    <FormGroup label="Product Name">
                                                        <input
                                                            required
                                                            value={product.name}
                                                            onChange={e => updateProductField(index, 'name', e.target.value)}
                                                            className="premium-input h-10 py-0"
                                                            placeholder="e.g., Apple Gummies"
                                                        />
                                                    </FormGroup>
                                                </div>
                                                <div className="sm:col-span-1">
                                                    <FormGroup label="SKU Prefix (3-4 Letters)">
                                                        <input
                                                            required
                                                            maxLength={4}
                                                            value={product.sku_prefix}
                                                            onChange={e => updateProductField(index, 'sku_prefix', e.target.value.toUpperCase())}
                                                            className="premium-input h-10 py-0 font-mono"
                                                            placeholder="e.g., APG"
                                                        />
                                                    </FormGroup>
                                                </div>
                                                <FormGroup label="Cashback (₹)">
                                                    <input
                                                        required
                                                        type="number"
                                                        value={product.cashback_amount}
                                                        onChange={e => updateProductField(index, 'cashback_amount', e.target.value)}
                                                        className="premium-input h-10 py-0 border-emerald-500/20 text-emerald-400 font-bold"
                                                        placeholder="0.00"
                                                    />
                                                </FormGroup>
                                                <FormGroup label="Amazon Product URL">
                                                    <input
                                                        value={product.amazon_url}
                                                        onChange={e => updateProductField(index, 'amazon_url', e.target.value)}
                                                        className="premium-input h-10 py-0"
                                                        placeholder="https://amazon.in/dp/..."
                                                    />
                                                </FormGroup>
                                                <FormGroup label="Flipkart Product URL">
                                                    <input
                                                        value={product.flipkart_url}
                                                        onChange={e => updateProductField(index, 'flipkart_url', e.target.value)}
                                                        className="premium-input h-10 py-0"
                                                        placeholder="https://flipkart.com/p/..."
                                                    />
                                                </FormGroup>
                                                <FormGroup label="Meesho Product URL">
                                                    <input
                                                        value={product.meesho_url}
                                                        onChange={e => updateProductField(index, 'meesho_url', e.target.value)}
                                                        className="premium-input h-10 py-0"
                                                        placeholder="https://meesho.com/..."
                                                    />
                                                </FormGroup>
                                                <FormGroup label="Myntra Product URL">
                                                    <input
                                                        value={product.myntra_url}
                                                        onChange={e => updateProductField(index, 'myntra_url', e.target.value)}
                                                        className="premium-input h-10 py-0"
                                                        placeholder="https://myntra.com/..."
                                                    />
                                                </FormGroup>
                                                <FormGroup label="Nykaa Product URL">
                                                    <input
                                                        value={product.nykaa_url}
                                                        onChange={e => updateProductField(index, 'nykaa_url', e.target.value)}
                                                        className="premium-input h-10 py-0"
                                                        placeholder="https://nykaa.com/..."
                                                    />
                                                </FormGroup>
                                                <FormGroup label="JioMart Product URL">
                                                    <input
                                                        value={product.jiomart_url}
                                                        onChange={e => updateProductField(index, 'jiomart_url', e.target.value)}
                                                        className="premium-input h-10 py-0"
                                                        placeholder="https://jiomart.com/..."
                                                    />
                                                </FormGroup>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                type="submit"
                                className="w-full py-5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-2xl shadow-emerald-500/30 flex items-center justify-center gap-3"
                            >
                                <ShieldCheck size={18} />
                                Commit Brand Entry
                            </motion.button>
                        </form>
                    </Modal>
                )}

                {showQRModal && selectedProduct && (
                    <Modal
                        title="Mass QR Generation"
                        subtitle={`Creating printed batch for: ${selectedProduct.name}`}
                        onClose={() => !qrGenerating && setShowQRModal(false)}
                    >
                        <form onSubmit={handleGenerateBatch} className="space-y-8">
                            <div className="bg-emerald-600/5 p-6 rounded-[2rem] border border-emerald-500/10">
                                <FormGroup label="Print Quantity" icon={<Layers size={14} className="text-emerald-500" />}>
                                    <div className="flex items-center gap-4">
                                        <input
                                            required
                                            type="number"
                                            min="1"
                                            max="500"
                                            value={qrQuantity}
                                            onChange={e => setQrQuantity(e.target.value)}
                                            className="premium-input bg-emerald-900/10 border-emerald-500/20 text-emerald-400 text-2xl font-black h-16 text-center"
                                            placeholder="100"
                                        />
                                        <div className="text-xs font-black text-slate-600 uppercase tracking-widest w-24">
                                            Unique Labels
                                        </div>
                                    </div>
                                    <p className="text-[10px] text-slate-400 mt-4 font-bold uppercase tracking-tighter leading-relaxed">
                                        * System will generate unique encrypted codes and compile them into a high-print-quality PDF grid (4×6 per page).
                                    </p>
                                </FormGroup>
                            </div>

                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                type="submit"
                                disabled={qrGenerating}
                                className="w-full py-6 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-2xl shadow-emerald-500/20 flex items-center justify-center gap-3"
                            >
                                {qrGenerating ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                                        Compiling PDF...
                                    </>
                                ) : (
                                    <>
                                        <Save size={18} />
                                        Initialize Instant Download
                                    </>
                                )}
                            </motion.button>
                        </form>
                    </Modal>
                )}
            </AnimatePresence>

            <style dangerouslySetInnerHTML={{
                __html: `
                .premium-input {
                    width: 100%;
                    background: rgba(15, 23, 42, 0.6);
                    border: 1.5px solid rgba(148, 163, 184, 0.1);
                    border-radius: 1rem;
                    padding: 0.875rem 1.25rem;
                    color: white;
                    font-size: 0.875rem;
                    font-weight: 500;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    outline: none;
                    backdrop-filter: blur(10px);
                }
                .premium-input:focus {
                    border-color: #3b82f6;
                    background: rgba(15, 23, 42, 0.8);
                    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15), 0 4px 12px rgba(59, 130, 246, 0.1);
                    transform: translateY(-1px);
                }
                .premium-input::placeholder {
                    color: rgba(148, 163, 184, 0.4);
                    font-size: 0.75rem;
                    font-weight: 500;
                }
                .premium-input:hover {
                    border-color: rgba(148, 163, 184, 0.2);
                }
            `}} />
        </div>
    )
}

function Modal({ title, subtitle, children, onClose }) {
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={onClose} className="absolute inset-0" />
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative w-full max-w-2xl bg-[#0a0f1d] rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl"
            >
                <div className="flex items-center justify-between px-10 py-8 border-b border-white/5 bg-gradient-to-r from-white/[0.02] to-transparent">
                    <div>
                        <h2 className="font-black text-2xl text-white tracking-tight">{title}</h2>
                        {subtitle && <p className="text-xs text-slate-500 mt-1 font-medium">{subtitle}</p>}
                    </div>
                    <button onClick={onClose} className="p-2.5 hover:bg-white/5 rounded-2xl transition text-slate-600 hover:text-white"><X size={24} /></button>
                </div>
                <div className="p-6 lg:p-8 overflow-y-auto max-h-[75vh] scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">{children}</div>
            </motion.div>
        </div>
    )
}

function FormGroup({ label, icon, children }) {
    return (
        <div className="space-y-2.5">
            <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                {icon && <span className="text-blue-400">{icon}</span>}
                {label}
            </label>
            {children}
        </div>
    )
}
