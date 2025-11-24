import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getMessaging, isSupported } from 'firebase/messaging'

// Check if Firebase is configured
const isConfigured = import.meta.env.VITE_FIREBASE_API_KEY && 
                     import.meta.env.VITE_FIREBASE_PROJECT_ID

let app = null
let auth = null
let db = null
let messaging = null

if (isConfigured) {
  const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID
  }

  try {
    // Initialize Firebase
    app = initializeApp(firebaseConfig)
    auth = getAuth(app)
    db = getFirestore(app)

    // Initialize Messaging (only supported in browser environments)
    isSupported().then(supported => {
      if (supported) {
        messaging = getMessaging(app)
      }
    })
  } catch (error) {
    console.error('Firebase initialization error:', error)
  }
} else {
  console.warn('⚠️ Firebase not configured. Add credentials to .env file to enable real-time features.')
}

export { app, auth, db, messaging, isConfigured }