import { useState, useEffect, useCallback } from 'react'
import './App.css'
import Map from './components/Map'
import Submit from './components/Submit'
import List from './components/List'
import SpaceDetail from './components/SpaceDetail'
import Search from './components/Search'
import AuthModal from './components/AuthModal'
import NotificationsPanel from './components/NotificationsPanel'
import AdminPanel from './components/AdminPanel'
import dataService from './services/dataService'
import { getSession, onAuthChange, getProfile, signOut } from './services/authService'
import { assignReviewers, getUnreadCount } from './services/moderationService'

function App() {
  const [position, setPosition]         = useState({ lat: -37.8136, lon: 144.9631 })
  const [spaces, setSpaces]             = useState([])
  const [selectedSpace, setSelectedSpace] = useState(null)
  const [mapFocusPos, setMapFocusPos]   = useState(null)
  const [searchQuery, setSearchQuery]   = useState('')
  const [view, setView]                 = useState('list') // 'list' | 'submit' | 'notifications' | 'admin'
  const [loading, setLoading]           = useState(true)
  // Auth
  const [session, setSession]           = useState(null)
  const [profile, setProfile]           = useState(null)
  const [showAuth, setShowAuth]         = useState(false)
  const [unreadCount, setUnreadCount]   = useState(0)

  // ── Bootstrap ────────────────────────────────────────────────

  useEffect(() => {
    navigator.geolocation.getCurrentPosition((p) =>
      setPosition({ lat: p.coords.latitude, lon: p.coords.longitude })
    )
    loadSpaces()

    // Auth session
    getSession().then(({ data }) => {
      if (data.session) handleSessionChange(data.session)
    })
    const { data: { subscription } } = onAuthChange((s) => handleSessionChange(s))
    return () => subscription.unsubscribe()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSessionChange = async (s) => {
    setSession(s)
    if (s) {
      const p = await getProfile(s.user.id).catch(() => null)
      setProfile(p)
      const count = await getUnreadCount().catch(() => 0)
      setUnreadCount(count)
    } else {
      setProfile(null)
      setUnreadCount(0)
    }
  }

  // ── Data loading ─────────────────────────────────────────────

  const loadSpaces = async () => {
    setLoading(true)
    try {
      const data = await dataService.getSpaces()
      setSpaces(data)
    } finally {
      setLoading(false)
    }
  }

  // ── Space selection ───────────────────────────────────────────

  const handleSelectSpace = useCallback(async (space) => {
    const full = await dataService.getSpace(space.id)
    setSelectedSpace(full)
    setMapFocusPos({ lat: full.lat, lon: full.lon })
    setView('list')
  }, [])

  // ── Reviews ───────────────────────────────────────────────────

  const handleAddReview = useCallback(async (review) => {
    await dataService.addReview(review)
    const full = await dataService.getSpace(selectedSpace.id)
    setSelectedSpace(full)
  }, [selectedSpace])

  // Called when a reviewer submits a decision — reload the space detail
  const handleDecisionMade = useCallback(async () => {
    if (!selectedSpace) return
    const full = await dataService.getSpace(selectedSpace.id)
    setSelectedSpace(full)
    const count = await getUnreadCount().catch(() => 0)
    setUnreadCount(count)
  }, [selectedSpace])

  // ── Space submission ──────────────────────────────────────────

  const handleSpaceSubmitted = useCallback(async (newSpace) => {
    // Assign community reviewers in the background
    if (session && newSpace) {
      assignReviewers(newSpace.id, newSpace.lat, newSpace.lon, session.user.id).catch(console.error)
    }
    setView('list')
  }, [session])

  // ── Sign out ──────────────────────────────────────────────────

  const handleSignOut = async () => {
    await signOut()
    setView('list')
    setSelectedSpace(null)
  }

  // ── Derived state ─────────────────────────────────────────────

  const filteredSpaces = searchQuery
    ? spaces.filter((s) =>
        s.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.address?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : spaces

  const showDetail = view === 'list' && selectedSpace

  // ── Render ────────────────────────────────────────────────────

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Auth modal (floating overlay) */}
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}

      {/* Header */}
      <header className="shrink-0 flex items-center justify-between px-5 py-3 bg-white border-b shadow-sm gap-4">
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => { setView('list'); setSelectedSpace(null) }}
        >
          <span className="text-xl">📚</span>
          <span className="text-lg font-bold text-blue-600 whitespace-nowrap">StudySpaces</span>
        </div>

        <Search query={searchQuery} setQuery={setSearchQuery} />

        <div className="flex items-center gap-3 shrink-0">
          {/* Notification bell */}
          {session && (
            <button
              onClick={() => setView(view === 'notifications' ? 'list' : 'notifications')}
              className="relative text-gray-500 hover:text-gray-800 text-xl"
              title="Notifications"
            >
              🔔
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center leading-none">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
          )}

          {/* Admin link (admin users only) */}
          {profile?.is_admin && (
            <button
              onClick={() => setView(view === 'admin' ? 'list' : 'admin')}
              className="text-xs text-gray-400 hover:text-gray-700 font-medium"
            >
              Admin
            </button>
          )}

          {/* Auth */}
          {session ? (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-700 font-medium truncate max-w-24">
                {profile?.display_name ?? session.user.email?.split('@')[0]}
              </span>
              <button
                onClick={handleSignOut}
                className="text-xs text-gray-400 hover:text-gray-700"
              >
                Sign out
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowAuth(true)}
              className="text-sm font-medium text-blue-600 hover:underline"
            >
              Sign in
            </button>
          )}

          {/* Add Space */}
          <button
            onClick={() => {
              setView(view === 'submit' ? 'list' : 'submit')
              setSelectedSpace(null)
            }}
            className="bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-full hover:bg-blue-700 transition-colors whitespace-nowrap"
          >
            {view === 'submit' ? '✕ Cancel' : '+ Add Space'}
          </button>
        </div>
      </header>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left panel */}
        <div className="w-2/5 overflow-y-auto border-r bg-white">
          {view === 'admin' ? (
            <AdminPanel profile={profile} onClose={() => setView('list')} />
          ) : view === 'notifications' ? (
            <NotificationsPanel
              onSelectSpace={handleSelectSpace}
              onClose={() => {
                setView('list')
                setUnreadCount(0)
              }}
            />
          ) : view === 'submit' ? (
            <Submit
              position={position}
              session={session}
              onSubmit={handleSpaceSubmitted}
              onCancel={() => setView('list')}
              onSignInClick={() => setShowAuth(true)}
            />
          ) : showDetail ? (
            <SpaceDetail
              space={selectedSpace}
              session={session}
              onBack={() => setSelectedSpace(null)}
              onAddReview={handleAddReview}
              onDecisionMade={handleDecisionMade}
            />
          ) : (
            <List
              spaces={filteredSpaces}
              selectedSpace={selectedSpace}
              onSelect={handleSelectSpace}
              loading={loading}
            />
          )}
        </div>

        {/* Map */}
        <div className="flex-1">
          <Map
            pos={position}
            spaces={spaces}
            selectedSpace={selectedSpace}
            mapFocusPos={mapFocusPos}
            onSelectSpace={handleSelectSpace}
          />
        </div>
      </div>
    </div>
  )
}

export default App
