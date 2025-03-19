import { useEffect,useState} from 'react'
import dataService from '../services/dataService'
const Submit = ({default_pos,selectedPos,setShowForm}) =>{
    const [SpaceName, SetSpaceName] = useState("")
    const [description, SetDescription] = useState("")
    const [address, SetAddress] = useState("")
    const [Lat, setLat] = useState(0)
    const [Lon, setLon] = useState(0)

    useEffect(() => {
        selectedPos?.lat?setLat(selectedPos.lat):"";
        selectedPos?.lon?setLon(selectedPos.lon):"";
           }, [selectedPos]);
 
     
    
    const handleSubmit = () =>{
        const space = {
            Name:SpaceName,
            Lat:Lat,
            Lon:Lon
        }
        console.log(SpaceName)
        console.log(space)
        dataService.addSpace(space).then((e)=>{
            if(e!= true){
                alert(e)
            }else{
                alert("Sucessfully added: "+space.Name )
            }
            setShowForm(false)
        })
    }

    
    const inputStyle ="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 " 
    return (
        <div className='grid grid-cols-2 gap-2 p-5'>
            <div className='row-span-1 col-span-2'>Name: <input className={inputStyle} value={SpaceName} onChange={(e) => SetSpaceName(e.target.value)}></input></div>
            <div className='row-span-1 col-span-2'>Description: <input className={inputStyle}></input></div>
            <div className='row-span-1 col-span-2'>Address: <input className={inputStyle}></input></div>
            <div className='row-span-1 col-span-1'>Latitude: <input className={inputStyle} value={Lat} onChange={(e) => setLat(e.target.value)}></input></div> 
            <div className='row-span-1 col-span-1'>Longitude: <input className={inputStyle} value={Lon} onChange={(e) => setLon(e.target.value)}></input></div>
            <div className="row-span-1 col-span-1"><button className="rounded-lg bg-gray-50 border border border-gray-300 p-2.5" onClick={()=>{handleSubmit()}}>Submit</button></div>
            <div className="row-span-1 col-span-1"><button className="rounded-lg bg-gray-50 border border border-gray-300 p-2.5" onClick={()=>{setShowForm(false)}}>Close</button></div>
        </div>


    )
}
export default Submit