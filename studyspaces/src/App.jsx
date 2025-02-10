import { useState,useEffect } from 'react'

import './App.css'
import Map from './components/Map'

function App() {
  // const [count, setCount] = useState(0)
  const [position, setPosition] = useState({lat:-37.8136,lon: 144.9631})
  const [spaces,setSpaces] = useState([])
   


  useEffect(() =>{
      fetchUserLocation()
  },[])

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
      <Map pos={position} spaces={spaces}/>
    </div>

  )
}

export default App
