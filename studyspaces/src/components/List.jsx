const List = ({spaces, setSelectedPos}) => {
    const handleClick = (space) =>{
        setSelectedPos({"lat":space.Lat,"lon":space.Lon})
    }

    const items = spaces?.map((space,idx) => 
    <li onClick={() => handleClick(space.data())}
        key={idx}
        lat={space.data().Lat}
        lon={space.data().Lon}
        value={space.data()}
        >
        Name: {space.data().Name} Location: {space.data().Lat},{space.data().Lon} 
        </li>)
    return(
        spaces ? 
        <div>
            <ul>
         
                {items}
            </ul>
        </div>
        :
        null
    );
}
export default List