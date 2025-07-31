'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChange } from '../lib/auth';
import { getUserProfile } from '../lib/userService';

const AuthContext = createContext({
  user: null,
  userProfile: null,
  loading: true,
  isAuthenticated: false,
  isPremium: false,
  refreshUserProfile: async () => {}
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChange(async (authUser) => {
      if (authUser) {
        setUser(authUser);
        
        // Fetch user profile from Firestore
        const { data, error } = await getUserProfile(authUser.uid);
        if (data && !error) {
          setUserProfile(data);
        }
      } else {
        setUser(null);
        setUserProfile(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    user,
    userProfile,
    loading,
    isAuthenticated: !!user,
    isPremium: userProfile?.subscriptionTier === 'premium',
    refreshUserProfile: async () => {
      if (user) {
        const { data } = await getUserProfile(user.uid);
        if (data) setUserProfile(data);
      }
    }
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};