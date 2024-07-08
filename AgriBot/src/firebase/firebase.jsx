import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCz8IMdTCLd7X5ksid3efWpv24yKlpEbaM",
  authDomain: "agribot-96287.firebaseapp.com",
  projectId: "agribot-96287",
  storageBucket: "agribot-96287.appspot.com",
  messagingSenderId: "285744619208",
  appId: "1:285744619208:web:46d121ea83b2ec686b4ffd",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
