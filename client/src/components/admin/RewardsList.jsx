import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { adminService } from '../../services/adminService'
import toast from 'react-hot-toast'

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

    const getPlatformIcon = (platform) => {
        const icons = {
            amazon: '🛒',
            flipkart: '🛍️',
            meesho: '📦',
            myntra: '👗',
            other: '🏪'
        }
        return icons[platform?.toLowerCase()] || '🏪'
    }

    const getStatusBadge = (status) => {
        const badges = {
            pending: 'bg-yellow-500/20 text-yellow-300',
            approved: 'bg-green-500/20 text-green-300',
            rejected: 'bg-red-500/20 text-red-300',
            paid: 'bg-blue-500/20 text-blue-300'
        }
        return badges[status] || badges.pending
    }

    const filters = [
        { value: 'all', label: 'All', icon: '📋' },
        { value: 'pending', label: 'Pending', icon: '⏳' },
        { value: 'approved', label: 'Approved', icon: '✅' },
        { value: 'rejected', label: 'Rejected', icon: '❌' },
        { value: 'paid', label: 'Paid', icon: '💵' }
    ]

    const approvedRewards = rewards.filter(r => r.status === 'approved')

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-4xl font-bold gradient-text mb-2">Rewards Management</h1>
                <p className="text-gray-400">Review and manage reward claims</p>
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

            {/* Bulk Payment Bar */}
            {filter === 'approved' && approvedRewards.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass rounded-2xl p-6 mb-6"
                >
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div>
                            <h3 className="text-xl font-bold text-white mb-1">Bulk Payment</h3>
                            <p className="text-gray-400 text-sm">
                                {selectedRewards.length} selected | Total: ₹{getTotalAmount()}
                            </p>
                        </div>
                        <button
                            onClick={() => setShowBulkPaymentModal(true)}
                            disabled={selectedRewards.length === 0}
                            className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl font-bold hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            💵 Process Payment ({selectedRewards.length})
                        </button>
                    </div>
                </motion.div>
            )}

            {/* Rewards List */}
            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
            ) : rewards.length === 0 ? (
                <div className="glass rounded-2xl p-12 text-center">
                    <p className="text-2xl text-gray-400">No rewards found</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {rewards.map((reward) => (
                        <motion.div
                            key={reward.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="glass rounded-2xl p-6 hover:bg-white/5 transition"
                        >
                            <div className="flex flex-col lg:flex-row gap-6">
                                {/* Checkbox for approved rewards */}
                                {reward.status === 'approved' && (
                                    <div className="flex items-start">
                                        <input
                                            type="checkbox"
                                            checked={selectedRewards.includes(reward.id)}
                                            onChange={() => toggleRewardSelection(reward.id)}
                                            className="w-5 h-5 mt-1 rounded border-2 border-blue-500 bg-transparent checked:bg-blue-600 cursor-pointer"
                                        />
                                    </div>
                                )}

                                {/* User Info */}
                                <div className="flex-1">
                                    <div className="flex items-start justify-between mb-4">
                                        <div>
                                            <h3 className="text-xl font-bold text-white mb-1">{reward.name}</h3>
                                            <p className="text-gray-400 text-sm">{reward.phone}</p>
                                            {reward.email && <p className="text-gray-400 text-sm">{reward.email}</p>}
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusBadge(reward.status)}`}>
                                            {reward.status}
                                        </span>
                                    </div>

                                    <div className="space-y-2 text-sm">
                                        <p><span className="text-gray-400">Product:</span> <span className="text-white font-semibold">{reward.product_name}</span></p>

                                        {/* Platform Badge */}
                                        {reward.platform_name && (
                                            <p>
                                                <span className="text-gray-400">Platform:</span>{' '}
                                                <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-xs font-semibold">
                                                    {getPlatformIcon(reward.platform_name)}
                                                    {reward.platform_name}
                                                </span>
                                            </p>
                                        )}

                                        <p><span className="text-gray-400">Purchase Date:</span> <span className="text-white">{new Date(reward.purchase_date).toLocaleDateString()}</span></p>
                                        {reward.upi_id && <p><span className="text-gray-400">UPI ID:</span> <span className="text-white">{reward.upi_id}</span></p>}
                                        {reward.payment_amount && <p><span className="text-gray-400">Amount:</span> <span className="text-green-400 font-bold">₹{reward.payment_amount}</span></p>}
                                        {reward.admin_notes && (
                                            <p className="mt-2 p-3 bg-blue-500/10 rounded-lg">
                                                <span className="text-gray-400">Admin Notes:</span> <span className="text-white">{reward.admin_notes}</span>
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Screenshot & AI Analysis */}
                                <div className="mt-6 space-y-4">
                                    {/* Screenshot Image */}
                                    <div className="relative group">
                                        <img
                                            src={`http://localhost:8000${reward.review_screenshot}`}
                                            alt="Review Screenshot"
                                            className="w-full h-auto rounded-xl border border-white/10 cursor-pointer hover:border-white/30 transition"
                                            onClick={() => {
                                                setSelectedImage(reward.review_screenshot)
                                                setShowImageModal(true)
                                            }}
                                            onError={(e) => {
                                                e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23333" width="400" height="300"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3EImage not found%3C/text%3E%3C/svg%3E'
                                            }}
                                        />
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center rounded-xl">
                                            <span className="text-white font-semibold">🔍 Click to Zoom</span>
                                        </div>
                                    </div>

                                    {/* AI Analysis */}
                                    {reward.ai_verified && (
                                        <div className="glass rounded-xl p-4 border border-white/10">
                                            <h4 className="text-white font-bold mb-3 flex items-center gap-2">
                                                <span>🤖</span> AI Analysis
                                                {reward.ai_analysis_status === 'success' && <span className="text-green-400 text-xs">✓ Verified</span>}
                                            </h4>

                                            {/* Rating */}
                                            {reward.detected_rating && (
                                                <div className="mb-3">
                                                    <p className="text-gray-400 text-sm mb-1">Detected Rating:</p>
                                                    <div className="flex items-center gap-2">
                                                        <div className="flex">
                                                            {[...Array(5)].map((_, i) => (
                                                                <span key={i} className={`text-2xl ${i < reward.detected_rating ? 'text-yellow-400' : 'text-gray-600'}`}>
                                                                    ⭐
                                                                </span>
                                                            ))}
                                                        </div>
                                                        <span className="text-white font-bold text-lg">{reward.detected_rating}/5</span>
                                                        {reward.ai_confidence && (
                                                            <span className="text-gray-400 text-xs">
                                                                ({Math.round(reward.ai_confidence * 100)}% confidence)
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Comment */}
                                            {reward.detected_comment && (
                                                <div>
                                                    <p className="text-gray-400 text-sm mb-1">Review Comment:</p>
                                                    <p className="text-white bg-white/5 p-3 rounded-lg text-sm italic">
                                                        "{reward.detected_comment}"
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Action Buttons */}
                                    <div className="flex flex-wrap gap-3">
                                        {reward.status === 'pending' && (
                                            <>
                                                <button
                                                    onClick={() => {
                                                        setSelectedReward(reward)
                                                        setShowModal(true)
                                                    }}
                                                    className="flex-1 px-4 py-2 bg-green-500/20 hover:bg-green-500/30 rounded-lg font-semibold transition"
                                                >
                                                    ✅ Approve
                                                </button>
                                                <button
                                                    onClick={() => handleStatusUpdate(reward.id, 'rejected')}
                                                    className="flex-1 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg font-semibold transition"
                                                >
                                                    ❌ Reject
                                                </button>
                                            </>
                                        )}

                                        {reward.status === 'approved' && !selectedRewards.includes(reward.id) && (
                                            <button
                                                onClick={() => handleStatusUpdate(reward.id, 'paid')}
                                                className="flex-1 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 rounded-lg font-semibold transition"
                                            >
                                                💵 Mark as Paid
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Approval Modal */}
            {showModal && selectedReward && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="glass rounded-2xl p-8 max-w-md w-full"
                    >
                        <h2 className="text-2xl font-bold mb-4">Approve Reward</h2>
                        <p className="text-gray-400 mb-4">Add notes for {selectedReward.name}</p>

                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Optional admin notes..."
                            className="w-full px-4 py-3 rounded-xl glass border border-white/10 focus:border-blue-500 outline-none mb-4"
                            rows={4}
                        />

                        <div className="flex gap-3">
                            <button
                                onClick={() => handleStatusUpdate(selectedReward.id, 'approved')}
                                className="flex-1 px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl font-bold hover:shadow-lg transition"
                            >
                                Approve
                            </button>
                            <button
                                onClick={() => {
                                    setShowModal(false)
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

            {/* Bulk Payment Modal */}
            {showBulkPaymentModal && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="glass rounded-2xl p-8 max-w-md w-full"
                    >
                        <h2 className="text-2xl font-bold mb-4">Confirm Bulk Payment</h2>
                        <p className="text-gray-400 mb-6">
                            You are about to pay {selectedRewards.length} rewards
                        </p>

                        <div className="mb-6 p-4 bg-blue-500/10 rounded-xl">
                            <p className="text-white font-bold text-2xl">₹{getTotalAmount()}</p>
                            <p className="text-gray-400 text-sm">Total Amount</p>
                        </div>

                        <input
                            type="text"
                            value={transactionId}
                            onChange={(e) => setTransactionId(e.target.value)}
                            placeholder="Transaction ID (optional)"
                            className="w-full px-4 py-3 rounded-xl glass border border-white/10 focus:border-blue-500 outline-none mb-4"
                        />

                        <div className="flex gap-3">
                            <button
                                onClick={handleBulkPayment}
                                className="flex-1 px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl font-bold hover:shadow-lg transition"
                            >
                                Confirm Payment
                            </button>
                            <button
                                onClick={() => {
                                    setShowBulkPaymentModal(false)
                                    setTransactionId('')
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
                            alt="Screenshot"
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
