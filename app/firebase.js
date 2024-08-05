import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCDvN1Punt6tVEyjOKA-vMxIuZqd_wjMIc",
  authDomain: "panetryfood.firebaseapp.com",
  projectId: "panetryfood",
  storageBucket: "panetryfood.appspot.com",
  messagingSenderId: "327977060824",
  appId: "1:327977060824:web:1d5856bc5d6042d2408aad",
  measurementId: "G-RK4XJ9212E",
};

const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);
export { firestore };
