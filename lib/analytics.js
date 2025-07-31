import { collection, addDoc, serverTimestamp, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from './firebase';

/**
 * Analytics tracking system for GLP-1 Mindful Evenings
 * 
 * Tracks user engagement, feature usage, and key metrics while
 * respecting privacy and focusing on improving user experience.
 */

// Track user events
export const trackEvent = async (userId, eventName, properties = {}) => {
  try {
    // Don't track events in development unless explicitly enabled
    if (process.env.NODE_ENV === 'development' && !process.env.NEXT_PUBLIC_ENABLE_DEV_ANALYTICS) {
      console.log('📊 Analytics (dev mode):', eventName, properties);
      return { success: true };
    }

    const eventsRef = collection(db, 'analytics_events');
    
    await addDoc(eventsRef, {
      userId,
      eventName,
      properties: {
        ...properties,
        userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'server',
        timestamp: new Date().toISOString(),
        sessionId: generateSessionId(),
      },
      timestamp: serverTimestamp(),
    });

    return { success: true };
  } catch (error) {
    console.error('Analytics tracking error:', error);
    return { success: false, error: error.message };
  }
};

// Generate a session ID for grouping related events
const generateSessionId = () => {
  if (typeof window === 'undefined') return 'server-session';
  
  // Check for existing session ID in sessionStorage
  let sessionId = sessionStorage.getItem('analytics_session_id');
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('analytics_session_id', sessionId);
  }
  return sessionId;
};

// Pre-defined event tracking functions for key user actions
export const analytics = {
  // User lifecycle events
  userSignUp: (userId, method = 'email') => 
    trackEvent(userId, 'user_sign_up', { method }),
  
  userSignIn: (userId, method = 'email') => 
    trackEvent(userId, 'user_sign_in', { method }),
  
  userSignOut: (userId) => 
    trackEvent(userId, 'user_sign_out'),

  // Check-in flow events
  checkInStarted: (userId) => 
    trackEvent(userId, 'check_in_started'),
  
  checkInCompleted: (userId, checkInData) => 
    trackEvent(userId, 'check_in_completed', {
      feelings: checkInData.feelings?.join(', '),
      emotionalIntensity: checkInData.emotionalIntensity,
      hungerLevel: checkInData.hungerFullnessLevel,
      routeChosen: checkInData.routeChosen,
      hasReflection: !!checkInData.reflectionNotes,
    }),
  
  checkInAbandoned: (userId, step) => 
    trackEvent(userId, 'check_in_abandoned', { step }),

  // Premium features
  upgradeClicked: (userId, context = 'session_limit') => 
    trackEvent(userId, 'upgrade_clicked', { context }),
  
  upgradeCompleted: (userId) => 
    trackEvent(userId, 'upgrade_completed'),
  
  subscriptionCancelled: (userId) => 
    trackEvent(userId, 'subscription_cancelled'),

  // AI features
  aiSuggestionsViewed: (userId, suggestionsCount) => 
    trackEvent(userId, 'ai_suggestions_viewed', { suggestionsCount }),
  
  aiSuggestionSelected: (userId, suggestion) => 
    trackEvent(userId, 'ai_suggestion_selected', { 
      title: suggestion.title,
      duration: suggestion.duration 
    }),
  
  aiInsightsViewed: (userId) => 
    trackEvent(userId, 'ai_insights_viewed'),

  // User engagement
  followUpCompleted: (userId, scheduledMinutes) => 
    trackEvent(userId, 'follow_up_completed', { scheduledMinutes }),
  
  backButtonUsed: (userId, fromStep, toStep) => 
    trackEvent(userId, 'back_button_used', { fromStep, toStep }),
  
  sessionLimitReached: (userId, remainingSessions) => 
    trackEvent(userId, 'session_limit_reached', { remainingSessions }),

  // Content engagement
  medicalDisclaimerViewed: (userId) => 
    trackEvent(userId, 'medical_disclaimer_viewed'),
  
  historyViewed: (userId, checkInCount) => 
    trackEvent(userId, 'history_viewed', { checkInCount }),
  
  dataCleared: (userId) => 
    trackEvent(userId, 'data_cleared'),

  // Error tracking
  error: (userId, errorType, errorMessage, context = {}) => 
    trackEvent(userId, 'error_occurred', { 
      errorType, 
      errorMessage: errorMessage.substring(0, 200), // Limit error message length
      ...context 
    }),
};

// Get analytics insights for a user (premium feature)
export const getUserAnalytics = async (userId, days = 30) => {
  try {
    const eventsRef = collection(db, 'analytics_events');
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const q = query(
      eventsRef,
      where('userId', '==', userId),
      where('timestamp', '>=', startDate),
      orderBy('timestamp', 'desc'),
      limit(1000)
    );
    
    const querySnapshot = await getDocs(q);
    const events = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      events.push({
        id: doc.id,
        ...data,
        timestamp: data.timestamp?.toDate() || new Date(data.properties?.timestamp),
      });
    });

    // Calculate insights
    const insights = calculateUserInsights(events);
    
    return { events, insights, error: null };
  } catch (error) {
    console.error('Error fetching user analytics:', error);
    return { events: [], insights: null, error: error.message };
  }
};

// Calculate useful insights from user events
const calculateUserInsights = (events) => {
  const checkIns = events.filter(e => e.eventName === 'check_in_completed');
  const aiSuggestions = events.filter(e => e.eventName === 'ai_suggestion_selected');
  const followUps = events.filter(e => e.eventName === 'follow_up_completed');
  
  return {
    totalCheckIns: checkIns.length,
    averageEmotionalIntensity: checkIns.length > 0 
      ? checkIns.reduce((sum, e) => sum + (e.properties?.emotionalIntensity || 0), 0) / checkIns.length 
      : 0,
    mostCommonFeelings: calculateMostCommonFeelings(checkIns),
    favoriteAISuggestions: calculateFavoriteAISuggestions(aiSuggestions),
    followUpCompletionRate: followUps.length / Math.max(checkIns.length, 1) * 100,
    streakDays: calculateStreakDays(checkIns),
    engagementScore: calculateEngagementScore(events),
  };
};

const calculateMostCommonFeelings = (checkIns) => {
  const feelingsCount = {};
  checkIns.forEach(checkIn => {
    const feelings = checkIn.properties?.feelings?.split(', ') || [];
    feelings.forEach(feeling => {
      feelingsCount[feeling] = (feelingsCount[feeling] || 0) + 1;
    });
  });
  
  return Object.entries(feelingsCount)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3)
    .map(([feeling, count]) => ({ feeling, count }));
};

const calculateFavoriteAISuggestions = (suggestions) => {
  const suggestionCount = {};
  suggestions.forEach(suggestion => {
    const title = suggestion.properties?.title;
    if (title) {
      suggestionCount[title] = (suggestionCount[title] || 0) + 1;
    }
  });
  
  return Object.entries(suggestionCount)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3)
    .map(([title, count]) => ({ title, count }));
};

const calculateStreakDays = (checkIns) => {
  if (checkIns.length === 0) return 0;
  
  const dates = checkIns
    .map(checkIn => checkIn.timestamp.toDateString())
    .filter((date, index, arr) => arr.indexOf(date) === index) // Remove duplicates
    .sort((a, b) => new Date(b) - new Date(a)); // Sort descending
  
  let streak = 0;
  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString();
  
  // Check if streak includes today or yesterday
  if (dates[0] === today || dates[0] === yesterday) {
    streak = 1;
    
    for (let i = 1; i < dates.length; i++) {
      const currentDate = new Date(dates[i-1]);
      const nextDate = new Date(dates[i]);
      const daysDiff = Math.floor((currentDate - nextDate) / (24 * 60 * 60 * 1000));
      
      if (daysDiff === 1) {
        streak++;
      } else {
        break;
      }
    }
  }
  
  return streak;
};

const calculateEngagementScore = (events) => {
  const weights = {
    'check_in_completed': 10,
    'ai_suggestion_selected': 5,
    'follow_up_completed': 8,
    'ai_insights_viewed': 3,
    'history_viewed': 2,
    'upgrade_completed': 15,
  };
  
  return events.reduce((score, event) => {
    return score + (weights[event.eventName] || 1);
  }, 0);
};

// Privacy-conscious: Allow users to delete their analytics data
export const deleteUserAnalytics = async (userId) => {
  try {
    const eventsRef = collection(db, 'analytics_events');
    const q = query(eventsRef, where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    
    const deletePromises = [];
    querySnapshot.forEach((doc) => {
      deletePromises.push(doc.ref.delete());
    });
    
    await Promise.all(deletePromises);
    
    return { success: true, deletedCount: deletePromises.length };
  } catch (error) {
    console.error('Error deleting user analytics:', error);
    return { success: false, error: error.message };
  }
};