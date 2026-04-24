import { useState, useEffect, useCallback } from 'react'
import './App.css'
import Map from './components/Map'
import Submit from './components/Submit'
import List from './components/List'
import SpaceDetail from './components/SpaceDetail'
import Search from './components/Search'
import dataService from './services/dataService'

function App() {
  const [position, setPosition] = useState({ lat: -37.8136, lon: 144.9631 })
  const [spaces, setSpaces] = useState([])
  const [selectedSpace, setSelectedSpace] = useState(null)
  const [mapFocusPos, setMapFocusPos] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [view, setView] = useState('list') // 'list' | 'submit'
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    navigator.geolocation.getCurrentPosition((p) =>
      setPosition({ lat: p.coords.latitude, lon: p.coords.longitude })
    )
    loadSpaces()
  }, [])

  const loadSpaces = async () => {
    setLoading(true)
    try {
      const data = await dataService.getSpaces()
      setSpaces(data)
    } finally {
      setLoading(false)
    }
  }

  const handleSelectSpace = useCallback(async (space) => {
    const full = await dataService.getSpace(space.id)
    setSelectedSpace(full)
    setMapFocusPos({ lat: full.lat, lon: full.lon })
    setView('list')
  }, [])

  const handleAddReview = useCallback(async (review) => {
    await dataService.addReview(review)
    const full = await dataService.getSpace(selectedSpace.id)
    setSelectedSpace(full)
  }, [selectedSpace])

  const handleSpaceSubmitted = useCallback(async (newSpace) => {
    await loadSpaces()
    setView('list')
    handleSelectSpace(newSpace)
  }, [handleSelectSpace])

  const filteredSpaces = searchQuery
    ? spaces.filter((s) =>
        s.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.address?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : spaces

  const showDetail = view === 'list' && selectedSpace

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Header */}
      <header className="shrink-0 flex items-center justify-between px-5 py-3 bg-white border-b shadow-sm">
        <div className="flex items-center gap-2">
          <span className="text-xl">📚</span>
          <span className="text-lg font-bold text-blue-600">StudySpaces</span>
        </div>
        <Search query={searchQuery} setQuery={setSearchQuery} />
        <button
          onClick={() => {
            setView(view === 'submit' ? 'list' : 'submit')
            setSelectedSpace(null)
          }}
          className="bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-full hover:bg-blue-700 transition-colors"
        >
          {view === 'submit' ? '✕ Cancel' : '+ Add Space'}
        </button>
      </header>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left panel */}
        <div className="w-2/5 overflow-y-auto border-r bg-white">
          {view === 'submit' ? (
            <Submit
              position={position}
              onSubmit={handleSpaceSubmitted}
              onCancel={() => setView('list')}
            />
          ) : showDetail ? (
            <SpaceDetail
              space={selectedSpace}
              onBack={() => setSelectedSpace(null)}
              onAddReview={handleAddReview}
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
