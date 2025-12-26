import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { adminService } from '../../services/adminService'
import toast from 'react-hot-toast'
import {
    Award, Clock, CheckCircle, XCircle, Banknote,
    Filter, Search, ArrowRight, CornerDownRight,
    DollarSign, Eye, Download, ExternalLink, ShieldCheck,
    ChevronRight, CreditCard, Activity, Calendar
} from 'lucide-react'

export default function RewardsList() {
    const [rewards, setRewards] = useState([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState('all')
    const [selectedReward, setSelectedReward] = useState(null)
    const [showModal, setShowModal] = useState(false)
    const [showBulkPaymentModal, setShowBulkPaymentModal] = useState(false)
    const [showImageModal, setShowImageModal] = useState(false)
    const [selectedImage, setSelectedImage] = useState('')
    const [notes, setNotes] = useState('')
    const [selectedRewards, setSelectedRewards] = useState([])
    const [transactionId, setTransactionId] = useState('')

    useEffect(() => {
        fetchRewards()
    }, [filter])

    const fetchRewards = async () => {
        setLoading(true)
        try {
            const status = filter === 'all' ? null : filter
            const response = await adminService.getAllRewards(status)
            setRewards(response.data)
        } catch (error) {
            toast.error('Failed to load rewards')
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    const handleStatusUpdate = async (id, newStatus) => {
        try {
            await adminService.updateRewardStatus(id, newStatus, notes)
            toast.success(`Reward ${newStatus}!`)
            fetchRewards()
            setShowModal(false)
            setNotes('')
        } catch (error) {
            toast.error('Failed to update status')
            console.error(error)
        }
    }

    const toggleRewardSelection = (id) => {
        setSelectedRewards(prev =>
            prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]
        )
    }

    const handleBulkPayment = async () => {
        try {
            const response = await adminService.bulkPayment(selectedRewards, transactionId)
            toast.success(`✅ ${response.data.success} rewards marked as paid!`)
            if (response.data.failed > 0) {
                toast.error(`❌ ${response.data.failed} rewards failed`)
            }
            setSelectedRewards([])
            setTransactionId('')
            setShowBulkPaymentModal(false)
            fetchRewards()
        } catch (error) {
            toast.error('Bulk payment failed')
            console.error(error)
        }
    }

    const getTotalAmount = () => {
        return rewards
            .filter(r => selectedRewards.includes(r.id))
            .reduce((sum, r) => sum + (r.payment_amount || 0), 0)
    }

    const getStatusBadge = (status) => {
        const badges = {
            pending: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
            approved: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
            rejected: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
            paid: 'bg-blue-500/10 text-blue-500 border-blue-500/20'
        }
        return badges[status] || 'bg-slate-500/10 text-slate-500 border-slate-500/20'
    }

    const getStatusIcon = (status) => {
        switch (status) {
            case 'pending': return <Clock size={12} />
            case 'approved': return <CheckCircle size={12} />
            case 'rejected': return <XCircle size={12} />
            case 'paid': return <Banknote size={12} />
            default: return <Activity size={12} />
        }
    }

    const filters = [
        { value: 'all', label: 'All Audits', icon: <Filter size={14} /> },
        { value: 'pending', label: 'Pending', icon: <Clock size={14} /> },
        { value: 'approved', label: 'Approved', icon: <CheckCircle size={14} /> },
        { value: 'rejected', label: 'Rejected', icon: <XCircle size={14} /> },
        { value: 'paid', label: 'Paid', icon: <Banknote size={14} /> }
    ]

    const approvedRewards = rewards.filter(r => r.status === 'approved')

    return (
        <div className="p-6 lg:p-10 space-y-10">
            <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <Award className="text-blue-500 w-5 h-5" />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Financial Suite</span>
                    </div>
                    <h1 className="text-3xl lg:text-4xl font-black text-white tracking-tight">Rewards Audit</h1>
                    <p className="text-slate-500 mt-1 font-medium">Verify claims and authorize cashback disbursements</p>
                </div>

                <div className="flex gap-3">
                    {filters.map((f) => (
                        <button
                            key={f.value}
                            onClick={() => setFilter(f.value)}
                            className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 border ${filter === f.value
                                ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-600/20'
                                : 'bg-white/5 text-slate-500 border-white/5 hover:text-slate-200 hover:bg-white/10'
                                }`}
                        >
                            {f.icon}
                            {f.label}
                        </button>
                    ))}
                </div>
            </header>

            {/* High Fidelity Summary Bar */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-[#0b1022] p-6 rounded-[2rem] border border-white/5 flex items-center justify-between">
                    <div>
                        <div className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1">Queue Size</div>
                        <div className="text-3xl font-black text-white">{rewards.length}</div>
                    </div>
                    <div className="p-3 bg-blue-500/10 text-blue-500 rounded-2xl border border-blue-500/10">
                        <Activity size={24} />
                    </div>
                </div>
                <div className="bg-[#0b1022] p-6 rounded-[2rem] border border-white/5 flex items-center justify-between">
                    <div>
                        <div className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1">Approved for Pay</div>
                        <div className="text-3xl font-black text-white">{approvedRewards.length}</div>
                    </div>
                    <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-2xl border border-emerald-500/10">
                        <CheckCircle size={24} />
                    </div>
                </div>
                {filter === 'approved' && approvedRewards.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-blue-600 p-6 rounded-[2rem] flex items-center justify-between text-white shadow-xl shadow-blue-600/20"
                    >
                        <div>
                            <div className="text-[10px] font-black text-blue-100/60 uppercase tracking-widest mb-1 uppercase italic">Bulk Summary</div>
                            <div className="text-2xl font-black">₹{getTotalAmount()}</div>
                        </div>
                        <button
                            onClick={() => setShowBulkPaymentModal(true)}
                            disabled={selectedRewards.length === 0}
                            className="bg-white text-blue-600 px-6 py-3 rounded-2xl font-black text-xs hover:scale-105 transition disabled:opacity-50"
                        >
                            PAY ({selectedRewards.length})
                        </button>
                    </motion.div>
                )}
            </div>

            {/* Audit Log List */}
            {loading ? (
                <div className="py-24 flex items-center justify-center">
                    <div className="w-8 h-8 border-2 border-white/5 border-t-blue-500 rounded-full animate-spin"></div>
                </div>
            ) : rewards.length === 0 ? (
                <div className="bg-[#0b1022] rounded-[3rem] border border-white/5 p-24 text-center">
                    <Award className="w-16 h-16 text-slate-800 mx-auto mb-6 opacity-20" />
                    <p className="text-slate-600 font-black uppercase tracking-widest text-sm">No Audit Records Found</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {rewards.map((reward, idx) => (
                        <motion.div
                            key={reward.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className={`group bg-[#0b1022] p-6 rounded-[2rem] border border-white/5 hover:border-blue-500/30 transition-all ${selectedRewards.includes(reward.id) ? 'border-blue-500/50 bg-blue-500/5' : ''}`}
                        >
                            <div className="flex flex-col lg:flex-row gap-8 items-start">
                                {/* Checklist Circle */}
                                {reward.status === 'approved' && (
                                    <button
                                        onClick={() => toggleRewardSelection(reward.id)}
                                        className={`w-10 h-10 rounded-2xl flex items-center justify-center border transition-all ${selectedRewards.includes(reward.id) ? 'bg-blue-600 border-blue-600' : 'bg-white/5 border-white/5 hover:border-blue-500/30'}`}
                                    >
                                        <CheckCircle size={18} className={selectedRewards.includes(reward.id) ? 'text-white' : 'text-slate-700'} />
                                    </button>
                                )}

                                {/* Main Audit Content */}
                                <div className="flex-1 space-y-6">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center font-black text-slate-300 border border-white/5 uppercase">
                                                {reward.name[0]}
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-bold text-white tracking-tight leading-tight">{reward.name}</h3>
                                                <div className="flex items-center gap-4 text-[10px] font-bold text-slate-600 mt-1">
                                                    <span className="flex items-center gap-1"><CreditCard size={10} /> {reward.phone}</span>
                                                    <span className="flex items-center gap-1 uppercase tracking-widest"><Calendar size={10} /> {new Date(reward.purchase_date).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border flex items-center gap-1.5 ${getStatusBadge(reward.status)}`}>
                                            {getStatusIcon(reward.status)}
                                            {reward.status}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6 p-6 bg-white/[0.02] rounded-2xl border border-white/5">
                                        <div>
                                            <div className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1">Product Audit</div>
                                            <div className="text-xs font-bold text-slate-200 line-clamp-1">{reward.product_name}</div>
                                        </div>
                                        <div>
                                            <div className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1">Platform</div>
                                            <div className="text-xs font-bold text-blue-400 capitalize flex items-center gap-1">
                                                <ExternalLink size={10} /> {reward.platform_name || 'Generic Purchase'}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1">Payout Detail</div>
                                            <div className="text-sm font-black text-emerald-500">₹{reward.payment_amount || 100}</div>
                                        </div>
                                    </div>

                                    {reward.admin_notes && (
                                        <div className="flex gap-2 items-start text-xs font-medium text-amber-500/80 bg-amber-500/5 p-4 rounded-xl border border-amber-500/10">
                                            <Info size={14} className="mt-0.5 shrink-0" />
                                            <span>{reward.admin_notes}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Review Verification Visuals */}
                                <div className="w-full lg:w-48 space-y-4">
                                    <div
                                        onClick={() => {
                                            setSelectedImage(reward.review_screenshot)
                                            setShowImageModal(true)
                                        }}
                                        className="aspect-[4/5] bg-slate-900 rounded-2xl border border-white/5 overflow-hidden relative group cursor-pointer"
                                    >
                                        <img
                                            src={`http://194.238.18.10${reward.review_screenshot}`}
                                            className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity"
                                            onError={(e) => {
                                                e.target.src = 'https://via.placeholder.com/200x250?text=Proof+Not+Found'
                                            }}
                                        />
                                        <div className="absolute inset-0 bg-blue-600/0 group-hover:bg-blue-600/20 flex items-center justify-center transition-all">
                                            <Eye size={20} className="text-white opacity-0 group-hover:opacity-100" />
                                        </div>
                                    </div>

                                    {/* Action Hub */}
                                    <div className="flex gap-2">
                                        {reward.status === 'pending' && (
                                            <>
                                                <button
                                                    onClick={() => { setSelectedReward(reward); setShowModal(true) }}
                                                    className="flex-1 py-3 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase hover:bg-emerald-500 transition-all"
                                                >
                                                    Audit OK
                                                </button>
                                                <button
                                                    onClick={() => handleStatusUpdate(reward.id, 'rejected')}
                                                    className="p-3 bg-rose-600/10 text-rose-500 hover:bg-rose-600 hover:text-white rounded-xl transition-all"
                                                >
                                                    <XCircle size={14} />
                                                </button>
                                            </>
                                        )}
                                        {reward.status === 'approved' && !selectedRewards.includes(reward.id) && (
                                            <button
                                                onClick={() => handleStatusUpdate(reward.id, 'paid')}
                                                className="w-full py-3 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase flex items-center justify-center gap-2"
                                            >
                                                <CreditCard size={12} /> Pay Now
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Redesigned Modals */}
            <AnimatePresence>
                {showModal && (
                    <Modal title="Auth Confirmation" onClose={() => setShowModal(false)}>
                        <div className="space-y-6">
                            <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/5">
                                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                                    <ShieldCheck size={20} />
                                </div>
                                <div className="text-sm font-bold text-slate-300">Authorize reward for {selectedReward?.name}</div>
                            </div>
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Internal audit notes (optional)..."
                                className="w-full bg-slate-900 border border-white/10 rounded-2xl px-6 py-4 text-white text-sm font-medium focus:border-blue-500 transition-all h-32 outline-none"
                            />
                            <div className="flex gap-4">
                                <button
                                    onClick={() => handleStatusUpdate(selectedReward.id, 'approved')}
                                    className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase shadow-xl shadow-blue-600/10"
                                >
                                    Confirm Audit
                                </button>
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="px-8 py-4 bg-white/5 text-slate-500 rounded-2xl font-black text-xs uppercase border border-white/5"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </Modal>
                )}

                {showBulkPaymentModal && (
                    <Modal title="Treasury Pay-Out" onClose={() => setShowBulkPaymentModal(false)}>
                        <div className="space-y-8">
                            <div className="bg-emerald-600/10 border border-emerald-500/10 p-8 rounded-[2rem] text-center">
                                <div className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-2 italic">Authorize Total Disbursement</div>
                                <div className="text-5xl font-black text-white tracking-tighter">₹{getTotalAmount()}</div>
                                <p className="text-[10px] text-slate-600 mt-4 font-bold uppercase tracking-[0.2em]">{selectedRewards.length} Verified Claims</p>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 ml-1">Transaction Identity</label>
                                <input
                                    type="text"
                                    value={transactionId}
                                    onChange={(e) => setTransactionId(e.target.value)}
                                    placeholder="Enter UTR / Tx ID..."
                                    className="w-full bg-slate-900 border border-white/10 rounded-2xl px-6 py-4 text-white text-sm font-bold focus:border-blue-500 transition-all outline-none"
                                />
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button
                                    onClick={handleBulkPayment}
                                    className="flex-1 py-5 bg-blue-600 text-white rounded-[1.5rem] font-black text-xs uppercase shadow-xl shadow-blue-600/20 flex items-center justify-center gap-2"
                                >
                                    <CreditCard size={14} /> Execute Payment
                                </button>
                                <button
                                    onClick={() => setShowBulkPaymentModal(false)}
                                    className="px-8 py-5 bg-white/5 text-slate-600 rounded-[1.5rem] font-black text-xs uppercase border border-white/5"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </Modal>
                )}

                {showImageModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/95 backdrop-blur-xl transition-all" onClick={() => setShowImageModal(false)}>
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="relative max-w-5xl w-full h-full flex flex-col justify-center items-center gap-8" onClick={e => e.stopPropagation()}>
                            <img src={`http://194.238.18.10${selectedImage}`} className="max-w-full max-h-[80vh] rounded-[2rem] shadow-[0_0_100px_rgba(59,130,246,0.1)] border border-white/10" />
                            <div className="flex gap-4">
                                <a href={`http://194.238.18.10${selectedImage}`} download className="p-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl border border-white/5 transition-all"><Download size={20} /></a>
                                <a href={`http://194.238.18.10${selectedImage}`} target="_blank" className="p-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl border border-white/5 transition-all"><ExternalLink size={20} /></a>
                                <button onClick={() => setShowImageModal(false)} className="px-8 py-4 bg-white text-black rounded-2xl font-black text-xs uppercase shadow-xl">Close Preview</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    )
}

function Modal({ title, children, onClose }) {
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={onClose} className="absolute inset-0" />
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative w-full max-w-xl bg-[#0a0f1d] rounded-[3rem] overflow-hidden border border-white/10 shadow-2xl"
            >
                <div className="flex items-center justify-between px-10 py-8 border-b border-white/5">
                    <h2 className="font-extrabold text-2xl text-white tracking-tight uppercase italic">{title}</h2>
                    <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-xl transition text-slate-500 hover:text-white"><XCircle size={24} /></button>
                </div>
                <div className="p-10">{children}</div>
            </motion.div>
        </div>
    )
}
