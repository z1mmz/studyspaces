import SpaceCard from './ListItem'

const List = ({ spaces, onSelect, selectedSpace, loading }) => {
  if (loading) {
    return (
      <div className="flex flex-col gap-4 p-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-xl overflow-hidden animate-pulse">
            <div className="h-44 bg-gray-200" />
            <div className="p-3 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4" />
              <div className="h-3 bg-gray-200 rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (!spaces.length) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-400 gap-2">
        <span className="text-4xl">📚</span>
        <p className="text-sm">No study spaces found</p>
      </div>
    )
  }

  return (
    <div className="p-4 flex flex-col gap-4">
      <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">
        {spaces.length} space{spaces.length !== 1 ? 's' : ''} found
      </p>
      {spaces.map((space) => (
        <SpaceCard
          key={space.id}
          space={space}
          onClick={() => onSelect(space)}
          isSelected={selectedSpace?.id === space.id}
        />
      ))}
    </div>
  )
}

export default List
