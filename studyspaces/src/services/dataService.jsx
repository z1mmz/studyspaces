// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs,addDoc } from 'firebase/firestore/lite';

const firebaseConfig = JSON.parse(import.meta.env.VITE_FIREBASE);

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const addSpace = async (space) => {
    console.log(space)
    try {
          const docRef = await addDoc(collection(db, "spaces"), {
            Name: space.Name,
            Lat: space.Lat,
            Lon: space.Lon
          });
          console.log("Document written with ID: ", docRef.id);
        } catch (e) {
          console.error("Error adding document: ", e);
        }
}


const getSpaces = async (Lat,Lon) => {
  console.log()
  const querySnapshot = await getDocs(collection(db, "spaces"));

  // querySnapshot.forEach((doc) => {
  //   // doc.data() is never undefined for query doc snapshots
  //   console.log(doc.id, " => ", doc.data());
  // });

  return(querySnapshot.docs)
}


export default {
    addSpace,
    getSpaces
}
