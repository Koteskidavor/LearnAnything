import { initializeApp } from "firebase/app";
import { getDatabase, ref, push, set, get, child  } from "firebase/database";


const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    databaseURL: process.env.FIREBASE_DB_URL,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.STORAGE_BUCKET,
    messagingSenderId: process.env.MESSAGINGSENDER_ID,
    appId: process.env.FIREBASE_APP_ID,
}

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

export { db, ref, push, set, get, child };