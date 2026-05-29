import { initializeApp } from "firebase/app"
import { getAuth, GoogleAuthProvider } from "firebase/auth"

const firebaseConfig = {
    apiKey: "AIzaSyBsjVC9TjTyFJZfrKFfNzCSLxG_Fn7aTrA",
    authDomain: "gymplan-123.firebaseapp.com",
    projectId: "gymplan-123",
    storageBucket: "gymplan-123.firebasestorage.app",
    messagingSenderId: "1045107779996",
    appId: "1:1045107779996:web:571b43174fbe32f9598059",
    measurementId: "G-DH67HHMDXP"
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const googleProvider = new GoogleAuthProvider()