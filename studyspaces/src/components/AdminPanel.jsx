import { useEffect, useState } from 'react'
import { BADGE_META, getPendingSpaces, forceDecision } from '../services/moderationService'
import { NOISE_LEVELS } from '../constants'

const Avatar = ({ name }) => {
  const initials = (name ?? '?').split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
  return (
    <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-blue-100 text-blue-700 text-xs font-bold shrink-0">
      {initials}
    </span>
  )
}

const BadgePills = ({ badges }) =>
  badges?.length ? (
    <span className="flex gap-1 flex-wrap">
      {badges.map((b) => (
        <span key={b.type} title={BADGE_META[b.type]?.label} className="text-sm">
          {BADGE_META[b.type]?.icon}
        </span>
      ))}
    </span>
  ) : null

const DecisionChip = ({ decision }) => {
  if (decision === 'approved') return <span className="text-xs font-medium text-green-700 bg-green-100 px-2 py-0.5 rounded-full">Approved ✓</span>
  if (decision === 'rejected') return <span className="text-xs font-medium text-red-700 bg-red-100 px-2 py-0.5 rounded-full">Rejected ✗</span>
  return <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">Pending —</span>
}

const PendingSpaceCard = ({ space, onDecision }) => {
  const [acting, setActing] = useState(null)
  const mods = space.space_moderations ?? []
  const approvedCount = mods.filter((m) => m.decision === 'approved').length
  const decidedCount  = mods.filter((m) => m.decision !== null).length
  const noise = NOISE_LEVELS.find((n) => n.id === space.noise_level)

  const act = async (decision) => {
    setActing(decision)
    try {
      await forceDecision(space.id, decision)
      onDecision(space.id)
    } finally {
      setActing(null)
    }
  }

  return (
    <div className="border rounded-xl p-4 flex flex-col gap-3 bg-white">
      {/* Title row */}
      <div className="flex justify-between items-start gap-2">
        <div>
          <h3 className="font-semibold text-gray-900">{space.name}</h3>
          {space.address && <p className="text-xs text-gray-500 mt-0.5">📍 {space.address}</p>}
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          {noise && <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${noise.color}`}>{noise.label}</span>}
          <span className="text-xs text-gray-400">{new Date(space.created_at).toLocaleDateString()}</span>
        </div>
      </div>

      {/* Description */}
      {space.description && (
        <p className="text-xs text-gray-600 line-clamp-2">{space.description}</p>
      )}

      {/* Community review progress */}
      <div>
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>Community review</span>
          <span>{decidedCount} / {mods.length} reviewed · {approvedCount} approved</span>
        </div>
        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 rounded-full transition-all"
            style={{ width: mods.length ? `${(decidedCount / mods.length) * 100}%` : '0%' }}
          />
        </div>
      </div>

      {/* Reviewer rows */}
      {mods.length > 0 && (
        <div className="flex flex-col gap-1.5">
          {mods.map((m) => (
            <div key={m.id} className="flex items-center gap-2">
              <Avatar name={m.profiles?.display_name} />
              <span className="text-sm text-gray-700 flex-1 truncate">
                {m.profiles?.display_name ?? 'Unknown'}
              </span>
              <BadgePills badges={m.profiles?.badges} />
              <DecisionChip decision={m.decision} />
            </div>
          ))}
        </div>
      )}

      {/* Admin action buttons */}
      <div className="flex gap-2 pt-1">
        <button
          onClick={() => act('approved')}
          disabled={!!acting}
          className="flex-1 text-sm font-medium py-1.5 rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 transition-colors"
        >
          {acting === 'approved' ? '…' : 'Force Approve'}
        </button>
        <button
          onClick={() => act('rejected')}
          disabled={!!acting}
          className="flex-1 text-sm font-medium py-1.5 rounded-lg border border-red-300 text-red-600 hover:bg-red-50 disabled:opacity-50 transition-colors"
        >
          {acting === 'rejected' ? '…' : 'Force Reject'}
        </button>
      </div>
    </div>
  )
}

const AdminPanel = ({ profile, onClose }) => {
  const [spaces, setSpaces] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!profile?.is_admin) return
    getPendingSpaces()
      .then(setSpaces)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [profile])

  const removeSpace = (id) => setSpaces((ss) => ss.filter((s) => s.id !== id))

  if (!profile?.is_admin) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-400 gap-2 p-4">
        <span className="text-4xl">🔒</span>
        <p className="text-sm">Admin access only</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <h2 className="font-semibold text-gray-900">Moderation Queue</h2>
        <button onClick={onClose} className="text-sm text-gray-500 hover:text-gray-700">✕</button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <div className="flex flex-col gap-4">
            {[1, 2].map((i) => (
              <div key={i} className="border rounded-xl p-4 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : error ? (
          <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
        ) : spaces.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-gray-400 gap-2">
            <span className="text-4xl">✅</span>
            <p className="text-sm">No pending submissions</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">
              {spaces.length} pending submission{spaces.length !== 1 ? 's' : ''}
            </p>
            {spaces.map((space) => (
              <PendingSpaceCard key={space.id} space={space} onDecision={removeSpace} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminPanel
