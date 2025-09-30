import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'

// TEMPORARY HARDCODED VALUES
const firebaseConfig = {
  apiKey: "AIzaSyC9TQr-gzAR0NXYIfI6b6FY4EbNNVFUjWU",
  authDomain: "comic-b7e04.firebaseapp.com",
  projectId: "comic-b7e04",
  storageBucket: "comic-b7e04.firebasestorage.app",
  messagingSenderId: "846245086867",
  appId: "1:846245086867:web:2bc5ac59100fafe239af66"
}

console.log('🔥 Using hardcoded Firebase config')

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)
export default app