import { useState,useEffect } from 'react'

import './App.css'
import Map from './components/Map'
import Submit from './components/Submit'
import dataService from './services/dataService'

function App() {
  // const [count, setCount] = useState(0)
  const [position, setPosition] = useState({lat:-37.8136,lon: 144.9631})
  const [selectedPos, setSelectedPos] = useState(null)
  const [spaces,setSpaces] = useState(null)
   

  useEffect(() =>{
      fetchUserLocation()
      getLocations(position.lat,position.lon)
  },[])

  const getLocations = (Lat,Lon) =>{
    dataService.getSpaces(Lat,Lon).then( (data) => {
      data.forEach( (space) => {
        console.log(space.data())
      });
      setSpaces(data);
    })
  }
  const fetchUserLocation = () =>{

        console.log("getting pos")
         navigator.geolocation.getCurrentPosition((p)=>{
          
          setPosition({lat:p.coords.latitude,lon:p.coords.longitude})
          console.log(p)
         })
      
  }
  return (

    <div>
      <h1>Welcome</h1>
      <Submit default_pos={position} selectedPos={selectedPos}/>
      <Map pos={position} spaces={spaces} selectedPos={selectedPos} setSelectedPos={setSelectedPos}/>
    </div>

  )
}

export default App
