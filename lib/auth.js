import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './firebase';

// Check if Firebase is initialized
const isFirebaseReady = () => auth && db;

const googleProvider = new GoogleAuthProvider();

// Create user profile in Firestore
export const createUserProfile = async (user, additionalData = {}) => {
  if (!user || !isFirebaseReady()) return;
  
  const userRef = doc(db, 'users', user.uid);
  const userSnap = await getDoc(userRef);
  
  if (!userSnap.exists()) {
    const { displayName, email } = user;
    const createdAt = serverTimestamp();
    
    try {
      await setDoc(userRef, {
        displayName,
        email,
        createdAt,
        subscriptionStatus: 'free',
        subscriptionTier: 'free',
        sessionCount: 0,
        weeklySessionCount: 0,
        weekStartDate: createdAt,
        ...additionalData
      });
    } catch (error) {
      console.error('Error creating user profile:', error);
    }
  }
  
  return userRef;
};

// Email/Password Sign Up
export const signUpWithEmail = async (email, password, displayName) => {
  if (!isFirebaseReady()) {
    return { user: null, error: 'Firebase not configured. Please set up your Firebase credentials.' };
  }
  
  try {
    const { user } = await createUserWithEmailAndPassword(auth, email, password);
    await createUserProfile(user, { displayName });
    return { user, error: null };
  } catch (error) {
    return { user: null, error: error.message };
  }
};

// Email/Password Sign In
export const signInWithEmail = async (email, password) => {
  if (!isFirebaseReady()) {
    return { user: null, error: 'Firebase not configured. Please set up your Firebase credentials.' };
  }
  
  try {
    const { user } = await signInWithEmailAndPassword(auth, email, password);
    return { user, error: null };
  } catch (error) {
    return { user: null, error: error.message };
  }
};

// Google Sign In
export const signInWithGoogle = async () => {
  if (!isFirebaseReady()) {
    return { user: null, error: 'Firebase not configured. Please set up your Firebase credentials.' };
  }
  
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    await createUserProfile(user);
    return { user, error: null };
  } catch (error) {
    return { user: null, error: error.message };
  }
};

// Sign Out
export const signOut = async () => {
  if (!isFirebaseReady()) {
    return { error: 'Firebase not configured.' };
  }
  
  try {
    await firebaseSignOut(auth);
    return { error: null };
  } catch (error) {
    return { error: error.message };
  }
};

// Auth State Observer
export const onAuthStateChange = (callback) => {
  if (!isFirebaseReady()) {
    // Call callback with null user when Firebase isn't ready
    callback(null);
    return () => {}; // Return empty unsubscribe function
  }
  
  return onAuthStateChanged(auth, callback);
};