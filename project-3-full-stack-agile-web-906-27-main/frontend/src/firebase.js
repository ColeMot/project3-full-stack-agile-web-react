import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore"

const firebaseConfig = {
  apiKey: "AIzaSyBuF0fHh26VrbwVmV1o8z-APQtI3UIo92Q",
  authDomain: "project3-103ef.firebaseapp.com",
  projectId: "project3-103ef",
  storageBucket: "project3-103ef.appspot.com",
  messagingSenderId: "298424982714",
  appId: "1:298424982714:web:7f6f4a2941886822e0f683",
  measurementId: "G-2T2X871B24"
};



// Initialize Firebase
firebase.initializeApp(firebaseConfig);

export default firebase;