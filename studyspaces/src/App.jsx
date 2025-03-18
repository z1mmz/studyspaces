import { useState,useEffect } from 'react'

import './App.css'
import Map from './components/Map'
import Submit from './components/Submit'
import dataService from './services/dataService'
import List from './components/List'

function App() {
  // const [count, setCount] = useState(0)
  const [position, setPosition] = useState({lat:-37.8136,lon: 144.9631})
  const [selectedPos, setSelectedPos] = useState(null)
  const [spaces,setSpaces] = useState(null)
  const [showForm,setShowForm] = useState(false)
   

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

    <div class="flex flex-row">

      <div class="flex flex-col basis-1/4 max-h-screen">
 
        {showForm? <Submit default_pos={position} selectedPos={selectedPos} setShowForm={setShowForm}/>: <button onClick={()=>(setShowForm(true))}>Add new space</button>}
     
        <List spaces={spaces} setSelectedPos={setSelectedPos}/>
      </div>

      <div class="basis-3/4">
        <Map pos={position} spaces={spaces} selectedPos={selectedPos} setSelectedPos={setSelectedPos}/>
      </div>
    </div>

  )
}

export default App
