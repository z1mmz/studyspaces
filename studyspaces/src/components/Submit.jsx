import { useEffect,useState} from 'react'
import dataService from '../services/dataService'
const Submit = ({default_pos,selectedPos}) =>{
    const [SpaceName, SetSpaceName] = useState("")
    const [description, SetDescription] = useState("")
    const [address, SetAddress] = useState("")
    const [Lat, SetLat] = useState(default_pos.lat)
    const [Lon, SetLon] = useState(default_pos.lon)
    const handleSubmit = () =>{
        const space = {
            Name:SpaceName,
            Lat:Lat,
            Lon:Lon
        }
        console.log(SpaceName)
        console.log(space)
        dataService.addSpace(space)

    }
    return (
        <div>
            Name: <input value={SpaceName} onChange={(e) => SetSpaceName(e.target.value)}></input>
            Description: <input></input>
            Address: <input></input>
            Latitude: <input value={Lat} onChange={(e) => SetLat(e.target.value)}></input>, Longitude: <input value={Lon} onChange={(e) => SetLon(e.target.value)}></input>
            <button onClick={()=>{handleSubmit()}}>Submit</button>
        </div>
    )
}
export default Submit