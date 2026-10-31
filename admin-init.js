// Starts Firebase for the dashboard and hands it what it needs as window.fb.
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";
import { getFirestore, collection, doc, getDoc, setDoc, getDocs, query, where, Timestamp, serverTimestamp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyBKu623PDECcc1gYVe4xof6AVUxDlW7B_A",
    authDomain: "pika-shot.firebaseapp.com",
    projectId: "pika-shot",
    storageBucket: "pika-shot.firebasestorage.app",
    messagingSenderId: "221719282655",
    appId: "1:221719282655:web:fefc576166eeb115077a6a"
};

// A named app keeps the admin sign-in separate from the anonymous session the main app
// creates for every visitor on this same site; otherwise that session skips the login.
const app = initializeApp(firebaseConfig, 'admin');
window.fb = {
    auth: getAuth(app),
    db: getFirestore(app),
    onAuthStateChanged,
    signInWithEmailAndPassword,
    signOut,
    collection,
    doc,
    getDoc,
    setDoc,
    getDocs,
    query,
    where,
    Timestamp,
    serverTimestamp
};
