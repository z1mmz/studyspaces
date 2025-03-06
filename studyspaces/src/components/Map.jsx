import { MapContainer, TileLayer, useMap,Marker,Popup} from 'react-leaflet'
import { useEffect,useState} from 'react'
import 'leaflet/dist/leaflet.css'
 const FocusLocation = ({pos,setSelectedPos}) => {
    const map = useMap()

    if(pos){
        console.log(pos)
        map.flyTo([pos.lat,pos.lon],map.getZoom())
    }
    map.on("click", function (e) {
        alert("Lat, Lon : " + e.latlng.lat + ", " + e.latlng.lng);
        setSelectedPos({Lat:e.latlng.lat,Lon:e.latlng.lon})
      });

  return null

  }
const Map = ({pos,spaces,selectedPos,setSelectedPos}) =>{
    // if (selectedPos){
    //     pos = selectedPos
    // }
    return(

                <MapContainer style={{ width: '100%', height: '600px' }} center={[pos.lat,pos.lon]} zoom={13} scrollWheelZoom={false} onclick={(e) => console.log(e)}>
                
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <FocusLocation pos={pos} setSelectedPos={setSelectedPos}/>
                <Marker position={[51.505, -0.09]}>
                    <Popup>
                    A pretty CSS3 popup. <br /> Easily customizable.
                    </Popup>
                </Marker>
                </MapContainer>
   
    )
}
export default Map