import { useState } from 'react'
import { motion } from 'framer-motion'
import { Star } from 'lucide-react'
import toast from 'react-hot-toast'

export default function ReviewForm({ onSubmit, onClose }) {
    const [rating, setRating] = useState(0)
    const [hoveredRating, setHoveredRating] = useState(0)
    const [comment, setComment] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (rating === 0) {
            toast.error('Please select a rating')
            return
        }

        if (comment.trim().length < 10) {
            toast.error('Please write at least 10 characters')
            return
        }

        setIsSubmitting(true)

        try {
            await onSubmit({ rating, comment })
            toast.success('Review submitted successfully!')
            onClose()
        } catch (error) {
            toast.error('Failed to submit review')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                className="bg-gradient-to-br from-gray-900 to-black rounded-2xl p-8 max-w-md w-full border border-purple-500/20"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="text-center mb-6">
                    <div className="text-5xl mb-3">⭐</div>
                    <h2 className="text-3xl font-bold gradient-text mb-2">Give Your Review</h2>
                    <p className="text-gray-400">Share your thoughts about the video</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Star Rating */}
                    <div>
                        <label className="block text-sm font-semibold mb-3 text-gray-300">
                            Rate this video
                        </label>
                        <div className="flex justify-center gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setRating(star)}
                                    onMouseEnter={() => setHoveredRating(star)}
                                    onMouseLeave={() => setHoveredRating(0)}
                                    className="transition-transform hover:scale-110"
                                >
                                    <Star
                                        className={`w-10 h-10 ${star <= (hoveredRating || rating)
                                                ? 'fill-yellow-400 text-yellow-400'
                                                : 'text-gray-600'
                                            }`}
                                    />
                                </button>
                            ))}
                        </div>
                        {rating > 0 && (
                            <p className="text-center mt-2 text-sm text-gray-400">
                                {rating === 5 && '⭐ Excellent!'}
                                {rating === 4 && '😊 Great!'}
                                {rating === 3 && '👍 Good'}
                                {rating === 2 && '😐 Okay'}
                                {rating === 1 && '😞 Poor'}
                            </p>
                        )}
                    </div>

                    {/* Comment */}
                    <div>
                        <label className="block text-sm font-semibold mb-2 text-gray-300">
                            Your Review
                        </label>
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Tell us what you think about the video..."
                            rows={4}
                            className="w-full px-4 py-3 rounded-xl glass border border-white/10 focus:border-purple-500 outline-none transition resize-none text-white placeholder-gray-500"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            {comment.length} / 500 characters
                        </p>
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-3 rounded-xl glass border border-white/10 hover:bg-white/5 transition font-semibold"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:shadow-lg hover:shadow-purple-500/50 transition font-semibold disabled:opacity-50"
                        >
                            {isSubmitting ? 'Submitting...' : 'Submit Review'}
                        </button>
                    </div>
                </form>
            </motion.div>
        </motion.div>
    )
}
