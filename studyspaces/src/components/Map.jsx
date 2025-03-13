import { MapContainer, TileLayer, useMap,Marker,Popup} from 'react-leaflet'
import { useEffect,useState} from 'react'
import 'leaflet/dist/leaflet.css'
 const FocusLocation = ({pos}) => {
    const map = useMap()

    if(pos){
        console.log(pos)
        map.flyTo([pos.lat,pos.lon],map.getZoom())
    }


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
                <FocusLocation pos={pos} />
                <Marker position={[pos.lat, pos.lon]}>
                    <Popup>
                        Current location <br/> {pos.lat},{pos.lon}.
                    </Popup>
                </Marker>
                </MapContainer>
   
    )
}
export default Map