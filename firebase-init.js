// Starts Firebase and hands the app what it needs as window.fb.
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { getAuth, signInAnonymously } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";
import {
    getFirestore, enableMultiTabIndexedDbPersistence, collection, doc, getDoc, getDocFromServer, setDoc, getDocs, serverTimestamp, updateDoc,
    onSnapshot, query, addDoc, deleteDoc, writeBatch, where, runTransaction, deleteField, increment, arrayUnion, Timestamp
} from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyBKu623PDECcc1gYVe4xof6AVUxDlW7B_A",
    authDomain: "pika-shot.firebaseapp.com",
    projectId: "pika-shot",
    storageBucket: "pika-shot.firebasestorage.app",
    messagingSenderId: "221719282655",
    appId: "1:221719282655:web:fefc576166eeb115077a6a"
};

const app = initializeApp(firebaseConfig);

// Only real copies of the app (checked by Google's reCAPTCHA) may talk to the database, once App Check is switched on
const appCheckKey = (window.PIKA_CONFIG || {}).appCheckKey;
if (appCheckKey) {
    try {
        const { initializeAppCheck, ReCaptchaV3Provider } = await import("https://www.gstatic.com/firebasejs/9.6.10/firebase-app-check.js");
        initializeAppCheck(app, { provider: new ReCaptchaV3Provider(appCheckKey), isTokenAutoRefreshEnabled: true });
    } catch (error) {
        console.error('App Check could not start:', error);
    }
}

const db = getFirestore(app);
// Changes made without internet are kept on the phone and sent as soon as it is back online (even after the app is closed)
enableMultiTabIndexedDbPersistence(db).catch((error) => console.warn('Offline storage is not available:', error && error.code));

window.fb = {
    auth: getAuth(app),
    db,
    signInAnonymously,
    collection,
    doc,
    getDoc,
    getDocFromServer,
    setDoc,
    getDocs,
    updateDoc,
    serverTimestamp,
    onSnapshot,
    query,
    addDoc,
    deleteDoc,
    writeBatch,
    where,
    runTransaction,
    deleteField,
    increment,
    arrayUnion,
    Timestamp
};
