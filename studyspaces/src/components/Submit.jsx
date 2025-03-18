import { useEffect,useState} from 'react'
import { Form } from "radix-ui";
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
    const inputStyle ="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" 
    return (
        <div className='grid grid-cols-1 gap-2 p-5'>
            <div className='row-span-1 col-span-1'>Name: <input className={inputStyle} value={SpaceName} onChange={(e) => SetSpaceName(e.target.value)}></input></div>
            <div className='row-span-1 col-span-1'>Description: <input className={inputStyle}></input></div>
            <div className='row-span-1 col-span-1'>Address: <input className={inputStyle}></input></div>
            <div className='row-span-1 col-span-1'>Latitude: <input className={inputStyle} value={Lat} onChange={(e) => SetLat(e.target.value)}></input></div> 
            <div className='row-span-1 col-span-1'>Longitude: <input className={inputStyle} value={Lon} onChange={(e) => SetLon(e.target.value)}></input></div>
            <div className="row-span-1 col-span-1"><button className="rounded-lg bg-gray-50 border border border-gray-300 p-2.5" onClick={()=>{handleSubmit()}}>Submit</button></div>
        </div>


    )
}
export default Submit