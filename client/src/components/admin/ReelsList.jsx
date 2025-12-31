import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { adminService } from '../../services/adminService'
import toast from 'react-hot-toast'
import {
    Film, Clock, CheckCircle, XCircle, Truck,
    Filter, ExternalLink, Play, Eye, Download,
    ChevronRight, MapPin, Instagram, Info,
    Package, Send, Activity
} from 'lucide-react'

export default function ReelsList() {
    const [reels, setReels] = useState([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState('all')
    const [selectedReel, setSelectedReel] = useState(null)
    const [showModal, setShowModal] = useState(false)
    const [showImageModal, setShowImageModal] = useState(false)
    const [selectedImage, setSelectedImage] = useState('')
    const [trackingNumber, setTrackingNumber] = useState('')
    const [notes, setNotes] = useState('')

    useEffect(() => {
        fetchReels()
    }, [filter])

    const fetchReels = async () => {
        setLoading(true)
        try {
            const status = filter === 'all' ? null : filter
            const response = await adminService.getAllReels(status)
            setReels(response.data)
        } catch (error) {
            toast.error('Failed to load reels')
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    const handleStatusUpdate = async (id, newStatus, tracking = null) => {
        try {
            await adminService.updateReelStatus(id, newStatus, tracking, notes)
            toast.success(`Reel ${newStatus}!`)
            fetchReels()
            setShowModal(false)
            setTrackingNumber('')
            setNotes('')
        } catch (error) {
            toast.error('Failed to update status')
            console.error(error)
        }
    }

    const getStatusBadge = (status) => {
        const badges = {
            pending: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
            approved: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
            rejected: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
            shipped: 'bg-blue-500/10 text-blue-500 border-blue-500/20'
        }
        return badges[status] || 'bg-slate-500/10 text-slate-500 border-slate-500/20'
    }

    const getImagePath = (path) => {
        if (!path) return 'https://via.placeholder.com/200x250?text=No+Image';
        if (path.startsWith('http')) {
            // Convert any Google Drive link to lh3 format for reliable image rendering
            if (path.includes('drive.google.com') || path.includes('docs.google.com')) {
                const match = path.match(/[?&]id=([^&]+)/);
                if (match) return `https://lh3.googleusercontent.com/d/${match[1]}`;
            }
            return path;
        }
        return `http://194.238.18.10:8001${path.startsWith('/') ? '' : '/'}${path}`;
    };

    const filters = [
        { value: 'all', label: 'All Submissions', icon: <Filter size={14} /> },
        { value: 'pending', label: 'Pending', icon: <Clock size={14} /> },
        { value: 'approved', label: 'Approved', icon: <CheckCircle size={14} /> },
        { value: 'rejected', label: 'Rejected', icon: <XCircle size={14} /> },
        { value: 'shipped', label: 'Shipped', icon: <Truck size={14} /> }
    ]

    return (
        <div className="p-6 lg:p-10 space-y-10">
            <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <Film className="text-purple-500 w-5 h-5" />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Creator Hub</span>
                    </div>
                    <h1 className="text-3xl lg:text-4xl font-black text-white tracking-tight leading-none">Influencer Reels</h1>
                    <p className="text-slate-500 mt-2 font-medium">Moderate submissions and manage gift logistics</p>
                </div>

                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                    {filters.map((f) => (
                        <button
                            key={f.value}
                            onClick={() => setFilter(f.value)}
                            className={`px-5 py-2.5 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all flex items-center gap-2 border shrink-0 ${filter === f.value
                                ? 'bg-purple-600 text-white border-purple-600 shadow-xl shadow-purple-600/20'
                                : 'bg-white/5 text-slate-500 border-white/5 hover:text-slate-200 hover:bg-white/10'
                                }`}
                        >
                            {f.icon}
                            {f.label}
                        </button>
                    ))}
                </div>
            </header>

            {/* Performance Bar */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { label: 'Total Content', value: reels.length, icon: <Film size={18} />, color: 'text-purple-400' },
                    { label: 'Awaiting Audit', value: reels.filter(r => r.status === 'pending').length, icon: <Clock size={18} />, color: 'text-amber-400' },
                    { label: 'Verified Creators', value: reels.filter(r => r.status === 'approved' || r.status === 'shipped').length, icon: <CheckCircle size={18} />, color: 'text-emerald-400' },
                    { label: 'Dispatched Gifts', value: reels.filter(r => r.status === 'shipped').length, icon: <Truck size={18} />, color: 'text-blue-400' },
                ].map((s, i) => (
                    <div key={i} className="bg-[#0b1022] p-5 rounded-[1.5rem] border border-white/5 flex items-center gap-4">
                        <div className={`p-3 rounded-xl bg-white/5 border border-white/5 ${s.color}`}>{s.icon}</div>
                        <div>
                            <div className="text-[9px] font-black text-slate-600 uppercase tracking-widest leading-none mb-1">{s.label}</div>
                            <div className="text-xl font-black text-white">{s.value}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Content List */}
            {loading ? (
                <div className="py-32 flex items-center justify-center">
                    <div className="w-10 h-10 border-2 border-white/5 border-t-purple-500 rounded-full animate-spin"></div>
                </div>
            ) : reels.length === 0 ? (
                <div className="bg-[#0b1022] rounded-[3rem] border border-white/5 p-32 text-center opacity-40">
                    <Film className="w-16 h-16 text-slate-800 mx-auto mb-6" />
                    <p className="text-slate-600 font-black uppercase tracking-widest text-sm">No Social Content Found</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {reels.map((reel, idx) => (
                        <motion.div
                            key={reel.id}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className="group bg-[#0b1022] rounded-[2.5rem] border border-white/5 hover:border-purple-500/30 transition-all overflow-hidden flex flex-col md:flex-row shadow-2xl"
                        >
                            {/* Visual Preview Section */}
                            <div className="w-full md:w-56 h-72 md:h-auto bg-slate-900 relative group/preview overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10" />
                                <div className="absolute inset-0 flex items-center justify-center z-20">
                                    <button
                                        onClick={() => window.open(reel.reel_url, '_blank')}
                                        className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center text-white scale-90 opacity-0 group-hover/preview:scale-100 group-hover/preview:opacity-100 transition-all border border-white/20"
                                    >
                                        <Play fill="white" size={20} className="ml-1" />
                                    </button>
                                </div>
                                <div className="absolute bottom-6 left-6 z-20">
                                    <div className="flex items-center gap-2 text-white font-black text-xs italic uppercase tracking-tighter">
                                        <Instagram size={14} className="text-pink-500" />
                                        @{reel.social_username}
                                    </div>
                                </div>
                                {/* Proof Image Preview instead of Icon */}
                                {reel.brand_tag_proof ? (
                                    <img
                                        src={getImagePath(reel.brand_tag_proof)}
                                        className="w-full h-full object-cover group-hover/preview:scale-110 transition-transform duration-500"
                                        onError={(e) => e.target.style.display = 'none'}
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-purple-900/40 to-slate-900 flex items-center justify-center text-slate-700">
                                        <Film size={48} />
                                    </div>
                                )}
                            </div>

                            {/* Creator Content Section */}
                            <div className="flex-1 p-8 space-y-6 flex flex-col justify-between">
                                <div className="space-y-4">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h3 className="text-xl font-bold text-white tracking-tight leading-none mb-1">{reel.name}</h3>
                                            <div className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">{reel.phone}</div>
                                        </div>
                                        <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.15em] border flex items-center gap-1.5 ${getStatusBadge(reel.status)}`}>
                                            <div className={`w-1.5 h-1.5 rounded-full ${reel.status === 'shipped' ? 'bg-blue-500' : 'bg-current'} animate-pulse`} />
                                            {reel.status}
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex gap-3 items-start p-4 bg-white/[0.02] rounded-2xl border border-white/5">
                                            <MapPin size={16} className="text-slate-700 mt-1 shrink-0" />
                                            <div className="text-xs font-medium text-slate-400 line-clamp-2 leading-relaxed">{reel.address}</div>
                                        </div>

                                        {reel.tracking_number && (
                                            <div className="flex items-center gap-2 px-4 py-2 bg-blue-500/5 border border-blue-500/10 rounded-xl text-blue-400 font-bold text-[10px] uppercase tracking-widest">
                                                <Truck size={12} /> Log: {reel.tracking_number}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-4">
                                    {reel.status === 'pending' && (
                                        <>
                                            <button
                                                onClick={() => handleStatusUpdate(reel.id, 'approved')}
                                                className="flex-1 py-4 bg-emerald-600 text-white rounded-2xl text-[10px] font-black uppercase shadow-xl hover:bg-emerald-500 transition-all"
                                            >
                                                Verify Creator
                                            </button>
                                            <button
                                                onClick={() => handleStatusUpdate(reel.id, 'rejected')}
                                                className="px-6 py-4 bg-white/5 text-slate-600 rounded-2xl transition hover:bg-rose-600 hover:text-white"
                                            >
                                                <XCircle size={16} />
                                            </button>
                                        </>
                                    )}

                                    {reel.status === 'approved' && (
                                        <button
                                            onClick={() => { setSelectedReel(reel); setShowModal(true) }}
                                            className="flex-1 py-4 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase shadow-xl flex items-center justify-center gap-3 transition-all"
                                        >
                                            <Package size={16} /> Mark Dispatch
                                        </button>
                                    )}

                                    {reel.status === 'shipped' && (
                                        <div className="w-full py-4 bg-white/[0.03] border border-white/5 text-slate-600 rounded-2xl text-[10px] font-black uppercase text-center flex items-center justify-center gap-2">
                                            <CheckCircle size={12} className="text-emerald-500" /> Fulfilled
                                        </div>
                                    )}

                                    {reel.brand_tag_proof && (
                                        <button
                                            onClick={() => { setSelectedImage(reel.brand_tag_proof); setShowImageModal(true) }}
                                            className="p-4 bg-white/5 border border-white/5 rounded-2xl text-slate-500 hover:text-white transition-all shadow-xl"
                                        >
                                            <Eye size={18} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Redesigned Shipment Modal */}
            <AnimatePresence>
                {showModal && (
                    <Modal title="Logistics Authorization" onClose={() => setShowModal(false)}>
                        <div className="space-y-8">
                            <div className="p-8 bg-blue-600/10 border border-blue-500/10 rounded-[2.5rem] flex flex-col items-center gap-4 text-center">
                                <div className="w-16 h-16 bg-blue-600 rounded-[1.5rem] flex items-center justify-center text-white shadow-2xl shadow-blue-500/20">
                                    <Send size={24} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-white italic">DISPATCH GIFT MODULE</h3>
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Order ID: {selectedReel?.id}</p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 ml-1 italic">Tracking Number</label>
                                    <input
                                        type="text"
                                        value={trackingNumber}
                                        onChange={(e) => setTrackingNumber(e.target.value)}
                                        placeholder="Enter AWB / SpeedPost ID..."
                                        className="w-full bg-slate-900 border border-white/10 rounded-2xl px-6 py-4 text-white text-sm font-bold focus:border-blue-500 transition-all outline-none uppercase shadow-inner"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 ml-1 italic">Internal Admin Trace</label>
                                    <textarea
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        placeholder="Add shipping notes or verification check..."
                                        className="w-full bg-slate-900 border border-white/10 rounded-2xl px-6 py-4 text-white text-sm font-medium focus:border-blue-500 transition-all h-24 outline-none"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <button
                                    onClick={() => handleStatusUpdate(selectedReel.id, 'shipped', trackingNumber)}
                                    className="flex-1 py-5 bg-blue-600 text-white rounded-3xl font-black text-xs uppercase shadow-xl shadow-blue-600/20 flex items-center justify-center gap-3"
                                >
                                    Confirm Shipment <ArrowRight size={14} />
                                </button>
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="px-8 py-5 bg-white/5 text-slate-600 rounded-3xl font-black text-xs uppercase border border-white/5 transition hover:bg-white/10"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </Modal>
                )}

                {showImageModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/95 backdrop-blur-xl transition-all" onClick={() => setShowImageModal(false)}>
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="relative max-w-5xl w-full h-full flex flex-col justify-center items-center gap-10" onClick={e => e.stopPropagation()}>
                            <div className="relative group">
                                <img src={getImagePath(selectedImage)} className="max-w-full max-h-[80vh] rounded-[3rem] shadow-[0_0_100px_rgba(147,51,234,0.15)] border border-white/10" />
                                <div className="absolute top-8 right-8 flex gap-4">
                                    <a href={getImagePath(selectedImage)} download className="p-4 bg-white text-black rounded-2xl shadow-xl hover:scale-105 transition"><Download size={20} /></a>
                                    <a href={getImagePath(selectedImage)} target="_blank" className="p-4 bg-white text-black rounded-2xl shadow-xl hover:scale-105 transition"><ExternalLink size={20} /></a>
                                </div>
                            </div>
                            <button onClick={() => setShowImageModal(false)} className="px-12 py-5 bg-purple-600 text-white rounded-3xl font-black text-xs uppercase shadow-2xl shadow-purple-600/30">Close Proof Viewer</button>
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
                    <h2 className="font-black text-2xl text-white tracking-tighter uppercase italic">{title}</h2>
                    <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-xl transition text-slate-700 hover:text-white font-black">CLOSE</button>
                </div>
                <div className="p-10">{children}</div>
            </motion.div>
        </div>
    )
}
