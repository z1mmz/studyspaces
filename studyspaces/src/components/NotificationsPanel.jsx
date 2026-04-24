import { useEffect, useState } from 'react'
import { getNotifications, markRead } from '../services/moderationService'

const TYPE_ICON = {
  review_request: '📋',
  space_approved: '✅',
  space_rejected: '❌',
  badge_earned:   '🏅',
}

const relativeTime = (iso) => {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1)   return 'just now'
  if (mins < 60)  return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs  < 24)  return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

const NotificationsPanel = ({ onSelectSpace, onClose }) => {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getNotifications().then((data) => {
      setNotifications(data)
      setLoading(false)
    })
  }, [])

  const handleClick = async (notif) => {
    if (!notif.read) {
      await markRead(notif.id)
      setNotifications((ns) => ns.map((n) => n.id === notif.id ? { ...n, read: true } : n))
    }
    if (notif.space_id && onSelectSpace) {
      onSelectSpace({ id: notif.space_id })
      onClose()
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <h2 className="font-semibold text-gray-900">Notifications</h2>
        <button onClick={onClose} className="text-sm text-gray-500 hover:text-gray-700">✕</button>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">Loading…</div>
      ) : notifications.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-gray-400 gap-2">
          <span className="text-4xl">🔔</span>
          <p className="text-sm">No notifications yet</p>
        </div>
      ) : (
        <ul className="flex-1 overflow-y-auto divide-y">
          {notifications.map((n) => (
            <li
              key={n.id}
              onClick={() => handleClick(n)}
              className={`flex gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors ${!n.read ? 'bg-blue-50' : ''}`}
            >
              <span className="text-xl shrink-0 mt-0.5">{TYPE_ICON[n.type] ?? '🔔'}</span>
              <div className="flex-1 min-w-0">
                <p className={`text-sm leading-snug ${!n.read ? 'font-medium text-gray-900' : 'text-gray-700'}`}>
                  {n.message}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">{relativeTime(n.created_at)}</p>
              </div>
              {!n.read && <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0 mt-1.5" />}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default NotificationsPanel
