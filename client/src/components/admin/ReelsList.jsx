import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { adminService } from '../../services/adminService'
import toast from 'react-hot-toast'

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
            pending: 'bg-yellow-500/20 text-yellow-300',
            approved: 'bg-green-500/20 text-green-300',
            rejected: 'bg-red-500/20 text-red-300',
            shipped: 'bg-blue-500/20 text-blue-300'
        }
        return badges[status] || badges.pending
    }

    const filters = [
        { value: 'all', label: 'All', icon: '📋' },
        { value: 'pending', label: 'Pending', icon: '⏳' },
        { value: 'approved', label: 'Approved', icon: '✅' },
        { value: 'rejected', label: 'Rejected', icon: '❌' },
        { value: 'shipped', label: 'Shipped', icon: '🚚' }
    ]

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-4xl font-bold gradient-text mb-2">Reels Management</h1>
                <p className="text-gray-400">Review and manage reel submissions</p>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3 mb-6">
                {filters.map((f) => (
                    <button
                        key={f.value}
                        onClick={() => setFilter(f.value)}
                        className={`px-4 py-2 rounded-xl font-semibold transition flex items-center gap-2 ${filter === f.value
                            ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white'
                            : 'glass hover:bg-white/10'
                            }`}
                    >
                        <span>{f.icon}</span>
                        {f.label}
                    </button>
                ))}
            </div>

            {/* Reels List */}
            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
                </div>
            ) : reels.length === 0 ? (
                <div className="glass rounded-2xl p-12 text-center">
                    <p className="text-2xl text-gray-400">No reels found</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {reels.map((reel) => (
                        <motion.div
                            key={reel.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="glass rounded-2xl p-6 hover:bg-white/5 transition"
                        >
                            <div className="flex flex-col lg:flex-row gap-6">
                                {/* User Info */}
                                <div className="flex-1">
                                    <div className="flex items-start justify-between mb-4">
                                        <div>
                                            <h3 className="text-xl font-bold text-white mb-1">{reel.name}</h3>
                                            <p className="text-gray-400 text-sm">{reel.phone}</p>
                                            {reel.email && <p className="text-gray-400 text-sm">{reel.email}</p>}
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusBadge(reel.status)}`}>
                                            {reel.status}
                                        </span>
                                    </div>

                                    <div className="space-y-2 text-sm">
                                        <p><span className="text-gray-400">Address:</span> <span className="text-white">{reel.address}</span></p>
                                        <p><span className="text-gray-400">Social Username:</span> <span className="text-white">@{reel.social_username}</span></p>
                                        {reel.tracking_number && (
                                            <p className="mt-2 p-3 bg-blue-500/10 rounded-lg">
                                                <span className="text-gray-400">Tracking:</span> <span className="text-white font-mono">{reel.tracking_number}</span>
                                            </p>
                                        )}
                                        {reel.admin_notes && (
                                            <p className="mt-2 p-3 bg-blue-500/10 rounded-lg">
                                                <span className="text-gray-400">Admin Notes:</span> <span className="text-white">{reel.admin_notes}</span>
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex flex-col gap-3 lg:w-48">
                                    <button
                                        onClick={() => window.open(reel.reel_url, '_blank')}
                                        className="px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 rounded-lg font-semibold transition"
                                    >
                                        🎬 View Reel
                                    </button>

                                    {reel.brand_tag_proof_url && (
                                        <button
                                            onClick={() => {
                                                setSelectedImage(reel.brand_tag_proof_url)
                                                setShowImageModal(true)
                                            }}
                                            className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 rounded-lg font-semibold transition"
                                        >
                                            📷 View Proof
                                        </button>
                                    )}

                                    {reel.status === 'pending' && (
                                        <>
                                            <button
                                                onClick={() => handleStatusUpdate(reel.id, 'approved')}
                                                className="px-4 py-2 bg-green-500/20 hover:bg-green-500/30 rounded-lg font-semibold transition"
                                            >
                                                ✅ Approve
                                            </button>
                                            <button
                                                onClick={() => handleStatusUpdate(reel.id, 'rejected')}
                                                className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg font-semibold transition"
                                            >
                                                ❌ Reject
                                            </button>
                                        </>
                                    )}

                                    {reel.status === 'approved' && (
                                        <button
                                            onClick={() => {
                                                setSelectedReel(reel)
                                                setShowModal(true)
                                            }}
                                            className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 rounded-lg font-semibold transition"
                                        >
                                            🚚 Mark as Shipped
                                        </button>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Shipping Modal */}
            {showModal && selectedReel && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="glass rounded-2xl p-8 max-w-md w-full"
                    >
                        <h2 className="text-2xl font-bold mb-4">Mark as Shipped</h2>
                        <p className="text-gray-400 mb-4">Add tracking number for {selectedReel.name}</p>

                        <input
                            type="text"
                            value={trackingNumber}
                            onChange={(e) => setTrackingNumber(e.target.value)}
                            placeholder="Tracking number..."
                            className="w-full px-4 py-3 rounded-xl glass border border-white/10 focus:border-blue-500 outline-none mb-4"
                        />

                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Optional admin notes..."
                            className="w-full px-4 py-3 rounded-xl glass border border-white/10 focus:border-blue-500 outline-none mb-4"
                            rows={3}
                        />

                        <div className="flex gap-3">
                            <button
                                onClick={() => handleStatusUpdate(selectedReel.id, 'shipped', trackingNumber)}
                                className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl font-bold hover:shadow-lg transition"
                            >
                                Ship
                            </button>
                            <button
                                onClick={() => {
                                    setShowModal(false)
                                    setTrackingNumber('')
                                    setNotes('')
                                }}
                                className="flex-1 px-4 py-3 glass rounded-xl font-bold hover:bg-white/10 transition"
                            >
                                Cancel
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Image Viewer Modal */}
            {showImageModal && (
                <div
                    className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4"
                    onClick={() => setShowImageModal(false)}
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="relative max-w-4xl w-full"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Close Button */}
                        <button
                            onClick={() => setShowImageModal(false)}
                            className="absolute -top-12 right-0 text-white hover:text-red-400 transition"
                        >
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>

                        {/* Image */}
                        <img
                            src={`http://localhost:8000${selectedImage}`}
                            alt="Brand Tag Proof"
                            className="w-full h-auto rounded-xl shadow-2xl"
                            onError={(e) => {
                                e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23333" width="400" height="300"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3EImage not found%3C/text%3E%3C/svg%3E'
                            }}
                        />

                        {/* Download Button */}
                        <div className="mt-4 flex justify-center gap-4">
                            <a
                                href={`http://localhost:8000${selectedImage}`}
                                download
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl font-bold transition flex items-center gap-2"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                                Download
                            </a>
                            <a
                                href={`http://localhost:8000${selectedImage}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-6 py-3 glass hover:bg-white/10 rounded-xl font-bold transition flex items-center gap-2"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                                Open in New Tab
                            </a>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    )
}
