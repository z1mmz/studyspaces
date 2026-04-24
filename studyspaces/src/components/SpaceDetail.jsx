import { useState } from 'react'
import { AMENITIES, DAYS, NOISE_LEVELS, isOpenNow, avgRating } from '../constants'
import { submitDecision } from '../services/moderationService'

const Stars = ({ rating, interactive, onRate }) => (
  <div className="flex gap-0.5">
    {[1, 2, 3, 4, 5].map((n) => (
      <button
        key={n}
        type="button"
        onClick={() => onRate?.(n)}
        className={`text-xl ${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'} ${n <= rating ? 'text-amber-400' : 'text-gray-300'}`}
      >
        ★
      </button>
    ))}
  </div>
)

const CommunityReviewPanel = ({ space, session, onDecisionMade }) => {
  const [acting, setActing] = useState(null)
  const [done, setDone] = useState(false)

  if (!session || done) return null

  const myModeration = space.space_moderations?.find(
    (m) => m.moderator_id === session.user.id
  )
  if (!myModeration || myModeration.decision !== null) return null

  const act = async (decision) => {
    setActing(decision)
    try {
      await submitDecision(space.id, decision)
      setDone(true)
      onDecisionMade?.()
    } finally {
      setActing(null)
    }
  }

  return (
    <div className="border-2 border-blue-200 rounded-xl p-4 bg-blue-50 flex flex-col gap-3">
      <div>
        <h3 className="font-semibold text-blue-900">You've been asked to review this space</h3>
        <p className="text-xs text-blue-700 mt-0.5">
          Your vote helps decide if it appears on the map for everyone.
        </p>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => act('approved')}
          disabled={!!acting}
          className="flex-1 py-2 text-sm font-medium rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 transition-colors"
        >
          {acting === 'approved' ? '…' : '✓ Approve'}
        </button>
        <button
          onClick={() => act('rejected')}
          disabled={!!acting}
          className="flex-1 py-2 text-sm font-medium rounded-lg border border-red-300 text-red-600 hover:bg-red-50 disabled:opacity-50 transition-colors"
        >
          {acting === 'rejected' ? '…' : '✗ Reject'}
        </button>
      </div>
    </div>
  )
}

const SpaceDetail = ({ space, session, onBack, onAddReview, onDecisionMade }) => {
  const [photoIdx, setPhotoIdx] = useState(0)
  const [reviewForm, setReviewForm] = useState({ rating: 0, comment: '', author_name: '' })
  const [submitting, setSubmitting] = useState(false)

  const rating = avgRating(space.reviews)
  const openNow = isOpenNow(space.hours)
  const noise = NOISE_LEVELS.find((n) => n.id === space.noise_level)
  const spaceAmenities = AMENITIES.filter((a) => space.amenities?.includes(a.id))

  const handleSubmitReview = async (e) => {
    e.preventDefault()
    if (!reviewForm.rating || !reviewForm.author_name.trim()) return
    setSubmitting(true)
    await onAddReview({ ...reviewForm, space_id: space.id })
    setReviewForm({ rating: 0, comment: '', author_name: '' })
    setSubmitting(false)
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* Back button */}
      <button
        onClick={onBack}
        className="sticky top-0 z-10 flex items-center gap-2 px-4 py-3 bg-white border-b text-sm font-medium text-gray-700 hover:text-blue-600"
      >
        ← Back to list
      </button>

      {/* Photo gallery */}
      <div className="relative bg-gray-100">
        {space.photos?.length ? (
          <>
            <img
              src={space.photos[photoIdx]}
              alt={space.name}
              className="w-full h-64 object-cover"
            />
            {space.photos.length > 1 && (
              <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1">
                {space.photos.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setPhotoIdx(i)}
                    className={`w-2 h-2 rounded-full transition-colors ${i === photoIdx ? 'bg-white' : 'bg-white/50'}`}
                  />
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="w-full h-48 bg-gradient-to-br from-blue-400 to-indigo-500" />
        )}
      </div>

      <div className="p-5 flex flex-col gap-5">
        {/* Title row */}
        <div>
          <div className="flex justify-between items-start gap-2">
            <h2 className="text-xl font-bold text-gray-900">{space.name}</h2>
            <div className="flex flex-col items-end gap-1 shrink-0">
              {rating && (
                <span className="flex items-center gap-1 font-semibold">
                  <span className="text-amber-400 text-lg">★</span>
                  <span>{rating}</span>
                  <span className="text-sm text-gray-400">({space.reviews?.length})</span>
                </span>
              )}
              {noise && (
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${noise.color}`}>
                  {noise.label}
                </span>
              )}
            </div>
          </div>
          {space.address && (
            <p className="text-sm text-gray-500 mt-1">📍 {space.address}</p>
          )}
          {openNow !== null && (
            <span className={`inline-block mt-2 text-sm font-medium ${openNow ? 'text-green-600' : 'text-red-500'}`}>
              {openNow ? '● Open now' : '● Closed now'}
            </span>
          )}
        </div>

        {/* Description */}
        {space.description && (
          <p className="text-sm text-gray-700 leading-relaxed">{space.description}</p>
        )}

        {/* Community review panel — visible only to assigned reviewers */}
        <CommunityReviewPanel space={space} session={session} onDecisionMade={onDecisionMade} />

        {/* Amenities */}
        {spaceAmenities.length > 0 && (
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Amenities</h3>
            <div className="grid grid-cols-2 gap-2">
              {spaceAmenities.map((a) => (
                <div key={a.id} className="flex items-center gap-2 text-sm text-gray-700">
                  <span className="text-base">{a.icon}</span>
                  <span>{a.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Hours */}
        {space.hours && (
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Hours</h3>
            <div className="flex flex-col gap-1">
              {DAYS.map((day) => {
                const h = space.hours[day]
                if (!h) return null
                return (
                  <div key={day} className="flex justify-between text-sm">
                    <span className="capitalize text-gray-600 w-28">{day}</span>
                    <span className={h.closed ? 'text-gray-400' : 'text-gray-900'}>
                      {h.closed ? 'Closed' : `${h.open} – ${h.close}`}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Reviews */}
        <div>
          <h3 className="font-semibold text-gray-900 mb-3">
            Reviews {space.reviews?.length ? `(${space.reviews.length})` : ''}
          </h3>
          {space.reviews?.length ? (
            <div className="flex flex-col gap-4 mb-5">
              {space.reviews.map((r) => (
                <div key={r.id} className="border-b pb-4">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-sm">{r.author_name}</span>
                    <Stars rating={r.rating} />
                  </div>
                  {r.comment && <p className="text-sm text-gray-600 mt-1">{r.comment}</p>}
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(r.created_at).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400 mb-4">No reviews yet — be the first!</p>
          )}

          {/* Add review form */}
          <form onSubmit={handleSubmitReview} className="bg-gray-50 rounded-xl p-4 flex flex-col gap-3">
            <h4 className="font-medium text-sm text-gray-800">Leave a review</h4>
            <Stars
              rating={reviewForm.rating}
              interactive
              onRate={(n) => setReviewForm((f) => ({ ...f, rating: n }))}
            />
            <input
              type="text"
              placeholder="Your name"
              value={reviewForm.author_name}
              onChange={(e) => setReviewForm((f) => ({ ...f, author_name: e.target.value }))}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
              required
            />
            <textarea
              placeholder="Share your experience..."
              value={reviewForm.comment}
              onChange={(e) => setReviewForm((f) => ({ ...f, comment: e.target.value }))}
              rows={3}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400 resize-none"
            />
            <button
              type="submit"
              disabled={submitting || !reviewForm.rating || !reviewForm.author_name.trim()}
              className="bg-blue-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {submitting ? 'Submitting...' : 'Submit Review'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default SpaceDetail
