import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY?.trim() || 'demo-key',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN?.trim() || 'demo-project.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID?.trim() || 'demo-project',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET?.trim() || 'demo-project.appspot.com',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID?.trim() || '123456789',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID?.trim() || '1:123456789:web:abcdef',
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID?.trim() || 'G-ABCDEFGH'
};

// Only initialize Firebase if we have real config (not demo values)
let app = null;
let auth = null;
let db = null;
let analytics = null;

if (process.env.NEXT_PUBLIC_FIREBASE_API_KEY && process.env.NEXT_PUBLIC_FIREBASE_API_KEY !== 'demo-key') {
  try {
    console.log('Initializing Firebase with config:', {
      projectId: firebaseConfig.projectId,
      authDomain: firebaseConfig.authDomain
    });
    
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    
    // Initialize Firestore with explicit settings
    db = getFirestore(app);
    
    // Ensure we're connected and ready
    if (typeof window !== 'undefined') {
      console.log('Firebase initialized successfully in browser');
      analytics = getAnalytics(app);
    }
  } catch (error) {
    console.error('Firebase initialization failed:', error);
  }
}

export { auth, db, analytics };
export default app;