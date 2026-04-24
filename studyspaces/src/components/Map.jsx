import { MapContainer, TileLayer, useMap, Marker, Popup } from 'react-leaflet'
import { useEffect } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const makeIcon = (color, size = 14) =>
  L.divIcon({
    html: `<div style="background:${color};width:${size}px;height:${size}px;border-radius:50%;border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.35)"></div>`,
    className: '',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  })

const userIcon = makeIcon('#22c55e', 16)
const spaceIcon = makeIcon('#3b82f6', 14)
const selectedIcon = makeIcon('#1d4ed8', 20)

const FlyTo = ({ pos }) => {
  const map = useMap()
  useEffect(() => {
    if (pos) map.flyTo([pos.lat, pos.lon], map.getZoom(), { duration: 0.8 })
  }, [pos, map])
  return null
}

const Map = ({ pos, spaces, selectedSpace, mapFocusPos, onSelectSpace }) => (
  <MapContainer
    style={{ width: '100%', height: '100%' }}
    center={[pos.lat, pos.lon]}
    zoom={13}
    scrollWheelZoom
  >
    <TileLayer
      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
    />

    <FlyTo pos={mapFocusPos ?? pos} />

    <Marker position={[pos.lat, pos.lon]} icon={userIcon}>
      <Popup>You are here</Popup>
    </Marker>

    {spaces?.map((space) => (
      <Marker
        key={space.id}
        position={[space.lat, space.lon]}
        icon={selectedSpace?.id === space.id ? selectedIcon : spaceIcon}
        eventHandlers={{ click: () => onSelectSpace(space) }}
      >
        <Popup>{space.name}</Popup>
      </Marker>
    ))}
  </MapContainer>
)

export default Map
