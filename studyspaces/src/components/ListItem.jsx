

const ListItem = ({onClick,lat,lon,space}) => {
    return(
        <div onClick={onClick} className="hover:bg-gray-200 rounded-lg p-2">
                <h1>Name: {space.data().Name}</h1> 
                <h2>Location: {space.data().Lat},{space.data().Lon} </h2>
        </div>
    )
}
export default ListItem