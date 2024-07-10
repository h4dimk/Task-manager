// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "task-manager-7aac8.firebaseapp.com",
  projectId: "task-manager-7aac8",
  storageBucket: "task-manager-7aac8.appspot.com",
  messagingSenderId: "287538489950",
  appId: "1:287538489950:web:a5a1097e4d4172e08e22cf",
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
