import { 
  doc, 
  collection, 
  addDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  setDoc,
  query, 
  where, 
  orderBy, 
  limit,
  serverTimestamp,
  increment
} from 'firebase/firestore';

// Lazy load Firebase to avoid initialization during build
let db;
const getDB = async () => {
  if (!db) {
    const { db: firebaseDB } = await import('./firebase');
    db = firebaseDB;
    
    if (!db) {
      throw new Error('Firebase database not initialized. Check your environment variables.');
    }
    
    console.log('Firestore database loaded:', !!db);
  }
  return db;
};

// Get user profile
export const getUserProfile = async (userId) => {
  try {
    const database = await getDB();
    const userRef = doc(database, 'users', userId);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      return { data: userSnap.data(), error: null };
    } else {
      return { data: null, error: 'User not found' };
    }
  } catch (error) {
    return { data: null, error: error.message };
  }
};

// Check if user can start a new session (free tier: 3 per week)
export const canStartSession = async (userId) => {
  try {
    const database = await getDB();
    const userRef = doc(database, 'users', userId);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) {
      // Create a basic user profile if it doesn't exist
      await setDoc(userRef, {
        subscriptionTier: 'free',
        subscriptionStatus: 'free',
        sessionCount: 0,
        weeklySessionCount: 0,
        weekStartDate: serverTimestamp(),
        createdAt: serverTimestamp()
      });
      return { canStart: true, remainingSessions: 3 };
    }
    
    const userData = userSnap.data();
    
    // Premium users have unlimited sessions
    if (userData.subscriptionTier === 'premium') {
      return { canStart: true, remainingSessions: 'unlimited' };
    }
    
    // Check weekly session count for free users
    const now = new Date();
    const weekStartDate = userData.weekStartDate?.toDate() || new Date();
    const daysSinceWeekStart = Math.floor((now - weekStartDate) / (1000 * 60 * 60 * 24));
    
    // Reset weekly count if it's been more than 7 days
    if (daysSinceWeekStart >= 7) {
      await updateDoc(userRef, {
        weeklySessionCount: 0,
        weekStartDate: serverTimestamp()
      });
      return { canStart: true, remainingSessions: 3 };
    }
    
    const weeklyCount = userData.weeklySessionCount || 0;
    const remainingSessions = Math.max(0, 3 - weeklyCount);
    
    return { 
      canStart: remainingSessions > 0, 
      remainingSessions,
      weeklyCount 
    };
  } catch (error) {
    return { canStart: false, error: error.message };
  }
};

// Start a new session (increment counters)
export const startSession = async (userId) => {
  try {
    const database = await getDB();
    const userRef = doc(database, 'users', userId);
    
    await updateDoc(userRef, {
      sessionCount: increment(1),
      weeklySessionCount: increment(1),
      lastSessionDate: serverTimestamp()
    });
    
    return { success: true, error: null };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Save evening check-in data
export const saveCheckIn = async (userId, checkInData) => {
  try {
    const database = await getDB();
    const checkInsRef = collection(database, 'users', userId, 'checkIns');
    
    const docRef = await addDoc(checkInsRef, {
      ...checkInData,
      timestamp: serverTimestamp(),
      createdAt: new Date().toISOString() // Keep the original timestamp for local compatibility
    });
    
    return { id: docRef.id, error: null };
  } catch (error) {
    return { id: null, error: error.message };
  }
};

// Get user's check-in history
export const getCheckInHistory = async (userId, limitCount = 10) => {
  try {
    const database = await getDB();
    const checkInsRef = collection(database, 'users', userId, 'checkIns');
    const q = query(
      checkInsRef, 
      orderBy('timestamp', 'desc'), 
      limit(limitCount)
    );
    
    const querySnapshot = await getDocs(q);
    const checkIns = [];
    
    querySnapshot.forEach((doc) => {
      checkIns.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return { data: checkIns, error: null };
  } catch (error) {
    return { data: [], error: error.message };
  }
};

// Save follow-up data
export const saveFollowUp = async (userId, followUpData) => {
  try {
    const database = await getDB();
    const followUpsRef = collection(database, 'users', userId, 'followUps');
    
    const docRef = await addDoc(followUpsRef, {
      ...followUpData,
      timestamp: serverTimestamp()
    });
    
    return { id: docRef.id, error: null };
  } catch (error) {
    return { id: null, error: error.message };
  }
};

// Find user by Stripe customer ID
export const findUserByCustomerId = async (customerId) => {
  try {
    const database = await getDB();
    const usersRef = collection(database, 'users');
    const q = query(usersRef, where('stripeCustomerId', '==', customerId));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const userDoc = querySnapshot.docs[0];
      return userDoc.id; // Return the Firebase user ID
    }
    
    return null;
  } catch (error) {
    console.error('Error finding user by customer ID:', error);
    return null;
  }
};

// Update subscription status
export const updateSubscription = async (userId, subscriptionData) => {
  try {
    const database = await getDB();
    const userRef = doc(database, 'users', userId);
    
    const updateData = {
      subscriptionStatus: subscriptionData.status,
      subscriptionTier: subscriptionData.tier,
      subscriptionUpdatedAt: serverTimestamp()
    };

    // Only update these if they're provided
    if (subscriptionData.customerId) {
      updateData.stripeCustomerId = subscriptionData.customerId;
    }
    if (subscriptionData.subscriptionId !== undefined) {
      updateData.stripeSubscriptionId = subscriptionData.subscriptionId;
    }
    if (subscriptionData.lastPaymentAt) {
      updateData.lastPaymentAt = subscriptionData.lastPaymentAt;
    }
    if (subscriptionData.updatedAt) {
      updateData.lastWebhookUpdate = subscriptionData.updatedAt;
    }
    
    await updateDoc(userRef, updateData);
    
    return { success: true, error: null };
  } catch (error) {
    console.error('Error updating subscription:', error);
    return { success: false, error: error.message };
  }
};