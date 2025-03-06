// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs,addDoc } from 'firebase/firestore/lite';
const apiKey = import.meta.env.VITE_FIREBASE_apiKey
const authDomain = import.meta.env.VITE_FIREBASE_authDomain
const projectId = import.meta.env.VITE_FIREBASE_projectId
const storageBucket = import.meta.env.VITE_FIREBASE_storageBucket
const messagingSenderId = import.meta.env.VITE_FIREBASE_messagingSenderId
const appId = import.meta.env.VITE_FIREBASE_appId
// import { addDoc } from "firebase/firestore"; 

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: apiKey,
  authDomain: authDomain,
  projectId: projectId,
  storageBucket: storageBucket,
  messagingSenderId:messagingSenderId ,
  appId: appId
};
console.log(firebaseConfig)

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

export default {
    addSpace:addSpace
}
