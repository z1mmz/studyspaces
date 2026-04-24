import { AMENITIES, NOISE_LEVELS, isOpenNow, avgRating } from '../constants'

const CARD_GRADIENTS = [
  'from-blue-400 to-indigo-500',
  'from-teal-400 to-cyan-500',
  'from-violet-400 to-purple-500',
  'from-rose-400 to-pink-500',
  'from-amber-400 to-orange-500',
]

const SpaceCard = ({ space, onClick, isSelected }) => {
  const rating = avgRating(space.reviews)
  const openNow = isOpenNow(space.hours)
  const noise = NOISE_LEVELS.find((n) => n.id === space.noise_level)
  const gradient = CARD_GRADIENTS[space.name?.charCodeAt(0) % CARD_GRADIENTS.length]
  const topAmenities = AMENITIES.filter((a) => space.amenities?.includes(a.id)).slice(0, 3)

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl overflow-hidden cursor-pointer transition-all border-2 ${
        isSelected ? 'border-blue-500 shadow-lg' : 'border-transparent shadow-sm hover:shadow-md'
      }`}
    >
      {/* Photo / gradient placeholder */}
      <div className={`h-44 bg-gradient-to-br ${gradient} relative overflow-hidden`}>
        {space.photos?.[0] && (
          <img
            src={space.photos[0]}
            alt={space.name}
            className="w-full h-full object-cover"
          />
        )}
        <div className="absolute top-2 left-2 flex gap-1">
          {noise && (
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${noise.color}`}>
              {noise.label}
            </span>
          )}
          {openNow !== null && (
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${openNow ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {openNow ? 'Open' : 'Closed'}
            </span>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="p-3">
        <div className="flex justify-between items-start gap-2">
          <h3 className="font-semibold text-gray-900 leading-tight">{space.name}</h3>
          {rating && (
            <span className="flex items-center gap-0.5 text-sm font-medium shrink-0">
              <span className="text-amber-400">★</span> {rating}
            </span>
          )}
        </div>
        {space.address && (
          <p className="text-xs text-gray-500 mt-0.5 truncate">{space.address}</p>
        )}
        {topAmenities.length > 0 && (
          <div className="flex gap-1 mt-2 flex-wrap">
            {topAmenities.map((a) => (
              <span key={a.id} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                {a.icon} {a.label}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default SpaceCard
