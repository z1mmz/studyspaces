import { MapContainer, TileLayer, useMap,Marker,Popup} from 'react-leaflet'
import { useEffect,useState} from 'react'
import 'leaflet/dist/leaflet.css'
function UserLocation() {
    const [position, setPosition] = useState(null)
    const map = useMap()
    useEffect(() =>{
        fetchUserLocation()
    },[])

    const fetchUserLocation = () =>{
        if(!position){
            map.locate().on('locationfound', 
            (e) =>{
                console.log(e)
                setPosition(e.latlng)
                map.flyTo(e.latlng, map.getZoom())
            })
        }
    }

  return null

  }
const Map = () =>{

    // map.locate()
   
    return(

                <MapContainer style={{ width: '100%', height: '600px' }} center={[51.505, -0.09]} zoom={13} scrollWheelZoom={false}>
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <UserLocation />
                <Marker position={[51.505, -0.09]}>
                    <Popup>
                    A pretty CSS3 popup. <br /> Easily customizable.
                    </Popup>
                </Marker>
                </MapContainer>
   
    )
}
export default Map