import ListItem from "./ListItem";

const List = ({spaces, setSelectedPos}) => {
    const handleClick = (space) =>{
        setSelectedPos({"lat":space.Lat,"lon":space.Lon})
    }

    const items = spaces?.map((space,idx) => 
    <ListItem 
        onClick={() => handleClick(space.data())}
        key={idx}
        lat={space.data().Lat}
        lon={space.data().Lon}
        space={space}></ListItem>);
  
    return(
        spaces ? 
       
            <div className="flex flex-col space-y-4 overflow-y-scroll p-5 inset-shadow-sm ">
                    {items}
            </div>
    
        :
        null
    );
}
export default List