'use client';

import { useState, useEffect } from 'react';
import EveningToolkit from '../components/EveningToolkit';
import EveningToolkitFollowUp from '../components/EveningToolkitFollowUp';
import AuthModal from '../components/AuthModal';
import SessionLimitModal from '../components/SessionLimitModal';
import SubscriptionManager from '../components/SubscriptionManager';
import MedicalDisclaimer from '../components/MedicalDisclaimer';
import { useAuth } from '../../contexts/AuthContext';
import { canStartSession, startSession } from '../../lib/userService';

export default function Home() {
  const { user, userProfile, loading, isAuthenticated, isPremium } = useAuth();
  const [showEveningToolkit, setShowEveningToolkit] = useState(false);
  const [showFollowUp, setShowFollowUp] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showSessionLimitModal, setShowSessionLimitModal] = useState(false);
  const [showMedicalDisclaimer, setShowMedicalDisclaimer] = useState(false);
  const [remainingSessions, setRemainingSessions] = useState(0);

  // Handle Stripe redirect
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const success = urlParams.get('success');
    const canceled = urlParams.get('canceled');

    if (success === 'true') {
      // Show success message
      alert('🎉 Welcome to Premium! You now have unlimited access to all features.');
      // Clean up URL
      window.history.replaceState({}, '', window.location.pathname);
    } else if (canceled === 'true') {
      // Show cancellation message
      alert('Upgrade canceled. You can upgrade anytime to unlock premium features.');
      // Clean up URL
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  useEffect(() => {
    // Check for pending follow-up (highest priority)
    const followUpData = localStorage.getItem('eveningToolkitFollowUpData');
    if (followUpData) {
      try {
        const data = JSON.parse(followUpData);
        const followUpTime = data.scheduledFor;
        const now = Date.now();
        
        // If follow-up time has passed and not completed, show follow-up
        if (now >= followUpTime && !data.completed) {
          setShowFollowUp(true);
          return;
        }
      } catch (error) {
        console.error('Error parsing follow-up data:', error);
        localStorage.removeItem('eveningToolkitFollowUpData');
      }
    }

    // Otherwise, check if toolkit should be shown
    // For standalone app, we can show it immediately or add time-based logic
    const currentHour = new Date().getHours();
    const isEveningTime = currentHour >= 18 && currentHour <= 23;
    
    // Check if user has already used toolkit today
    const lastShown = localStorage.getItem('eveningToolkitLastShown');
    const today = new Date().toDateString();
    
    if (isEveningTime && lastShown !== today) {
      setTimeout(() => setShowEveningToolkit(true), 1000);
    }
  }, []);

  const clearAllData = () => {
    localStorage.removeItem('eveningToolkitHistory');
    localStorage.removeItem('eveningToolkitLastShown');
    localStorage.removeItem('eveningToolkitFollowUps');
    localStorage.removeItem('eveningToolkitFollowUpData');
    localStorage.removeItem('eveningToolkitFollowUpScheduled');
    alert('All Evening Toolkit data cleared!');
  };

  const handleStartCheckIn = async () => {
    // Check if user has seen medical disclaimer
    const hasSeenDisclaimer = localStorage.getItem('medicalDisclaimerAccepted') === 'true';
    if (!hasSeenDisclaimer) {
      setShowMedicalDisclaimer(true);
      return;
    }

    // If not authenticated, show auth modal
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }

    // If premium user, allow unlimited access
    if (isPremium) {
      setShowEveningToolkit(true);
      return;
    }

    // For free users, check session limits
    if (!user || !(user as any).uid) return;
    const { canStart, remainingSessions: remaining, error } = await canStartSession((user as any).uid);
    
    if (!canStart) {
      // Show session limit modal
      setRemainingSessions(typeof remaining === 'number' ? remaining : 0);
      setShowSessionLimitModal(true);
      return;
    }

    // User can proceed with check-in
    setShowEveningToolkit(true);
  };

  const handleDisclaimerAccept = () => {
    localStorage.setItem('medicalDisclaimerAccepted', 'true');
    setShowMedicalDisclaimer(false);
    // Continue with the check-in flow
    handleStartCheckIn();
  };

  const handleUpgrade = async () => {
    try {
      setShowSessionLimitModal(false);
      
      if (!user || !(user as any).email) {
        alert('Please sign in to upgrade to premium.');
        return;
      }

      // Import stripe functions
      const { createCheckoutSession, getStripe } = await import('../../lib/stripe');
      
      // Create checkout session
      const session = await createCheckoutSession((user as any).uid, (user as any).email);
      
      if (session.url) {
        // Redirect to Stripe Checkout
        window.location.href = session.url;
      } else if (session.sessionId) {
        // Use Stripe.js to redirect
        const stripe = await getStripe();
        if (stripe) {
          const { error } = await stripe.redirectToCheckout({
            sessionId: session.sessionId,
          });
          if (error) {
            console.error('Stripe redirect error:', error);
            alert('Error redirecting to checkout. Please try again.');
          }
        }
      }
    } catch (error) {
      console.error('Upgrade error:', error);
      alert('Error starting upgrade process. Please try again.');
    }
  };

  // Update remaining sessions when user profile changes
  useEffect(() => {
    if (user && userProfile && !isPremium && (user as any).uid) {
      canStartSession((user as any).uid).then(({ remainingSessions }) => {
        if (typeof remainingSessions === 'number') {
          setRemainingSessions(remainingSessions);
        }
      });
    }
  }, [user, userProfile, isPremium]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-100">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center space-y-8">
          {/* Header */}
          <div className="space-y-4">
            <div className="text-8xl">🌙</div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              GLP-1 Mindful Evenings
            </h1>
            <p className="text-xl text-gray-700 max-w-2xl mx-auto leading-relaxed">
              A gentle companion for navigating evening emotions and eating with curiosity and self-compassion.
            </p>
          </div>

          {/* Main Actions */}
          <div className="space-y-6 max-w-md mx-auto">
            <button
              onClick={handleStartCheckIn}
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-4 px-6 rounded-xl hover:from-purple-700 hover:to-indigo-700 font-medium text-lg transition-all transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              🌟 Start Evening Check-in
              {!isAuthenticated && <span className="block text-sm mt-1">Sign in to track your progress</span>}
              {isAuthenticated && !isPremium && remainingSessions > 0 && (
                <span className="block text-sm mt-1">{remainingSessions} free sessions remaining</span>
              )}
              {isAuthenticated && isPremium && (
                <span className="block text-sm mt-1">Premium: Unlimited access</span>
              )}
            </button>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                onClick={() => {
                  const history = JSON.parse(localStorage.getItem('eveningToolkitHistory') || '[]');
                  if (history.length > 0) {
                    alert(`You have ${history.length} check-ins in your history.`);
                  } else {
                    alert('No check-ins yet. Start your first one!');
                  }
                }}
                className="bg-blue-500 text-white py-3 px-4 rounded-lg hover:bg-blue-600 font-medium transition-all"
              >
                📊 View History
              </button>

              <button
                onClick={clearAllData}
                className="bg-gray-500 text-white py-3 px-4 rounded-lg hover:bg-gray-600 font-medium transition-all"
              >
                🗑️ Clear Data
              </button>
            </div>
          </div>

          {/* About Section */}
          <div className="max-w-3xl mx-auto mt-12">
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-lg">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">How it works</h2>
              <div className="grid md:grid-cols-3 gap-6 text-left">
                <div className="space-y-3">
                  <div className="text-3xl">🤔</div>
                  <h3 className="font-semibold text-gray-900">Check In</h3>
                  <p className="text-gray-700 text-sm">
                    Explore your current feelings, hunger levels, and what might be driving your evening urges.
                  </p>
                </div>
                <div className="space-y-3">
                  <div className="text-3xl">🌸</div>
                  <h3 className="font-semibold text-gray-900">Explore Options</h3>
                  <p className="text-gray-700 text-sm">
                    Choose from mindful eating, nurturing activities, or gentle reflection based on what you need.
                  </p>
                </div>
                <div className="space-y-3">
                  <div className="text-3xl">📈</div>
                  <h3 className="font-semibold text-gray-900">Build Awareness</h3>
                  <p className="text-gray-700 text-sm">
                    Track patterns over time to understand your evening habits with compassion and insight.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* User Status */}
          {isAuthenticated && (
            <div className="space-y-4 max-w-md mx-auto">
              <div className="mt-8 p-4 bg-white/50 backdrop-blur-sm rounded-xl">
                <div className="flex items-center justify-between">
                  <div className="text-left">
                    <p className="text-sm text-gray-600">
                      Welcome back, {(user as any)?.displayName || 'there'}!
                    </p>
                    <p className="text-xs text-gray-500">
                      {isPremium ? '✨ Premium Member' : `${remainingSessions} free sessions remaining`}
                    </p>
                  </div>
                  <button
                    onClick={async () => {
                      const { signOut } = await import('../../lib/auth');
                      await signOut();
                    }}
                    className="text-sm text-gray-500 hover:text-gray-700 underline"
                  >
                    Sign out
                  </button>
                </div>
              </div>
              
              {/* Subscription Manager for Premium Users */}
              <SubscriptionManager />
            </div>
          )}

          {/* Footer */}
          <div className="mt-16 text-center text-gray-600 space-y-2">
            <p className="text-sm">
              Rooted in intuitive eating principles • Built with self-compassion in mind
            </p>
            <div className="text-xs">
              <button
                onClick={() => setShowMedicalDisclaimer(true)}
                className="underline hover:text-gray-800"
              >
                Medical Disclaimer
              </button>
              <span className="mx-2">•</span>
              <span>Not medical advice - consult your healthcare provider</span>
            </div>
          </div>
        </div>
      </div>

      {/* Evening Toolkit Modal */}
      {showEveningToolkit && (
        <EveningToolkit
          onComplete={() => {
            setShowEveningToolkit(false);
            localStorage.setItem('eveningToolkitLastShown', new Date().toDateString());
          }}
          onSkip={() => {
            setShowEveningToolkit(false);
            localStorage.setItem('eveningToolkitLastShown', new Date().toDateString());
          }}
        />
      )}

      {/* Evening Toolkit Follow-up Modal */}
      {showFollowUp && (
        <EveningToolkitFollowUp
          onComplete={() => {
            setShowFollowUp(false);
            localStorage.removeItem('eveningToolkitFollowUpScheduled');
          }}
          onSkip={() => {
            setShowFollowUp(false);
            const followUpData = localStorage.getItem('eveningToolkitFollowUpData');
            if (followUpData) {
              try {
                const data = JSON.parse(followUpData);
                localStorage.setItem('eveningToolkitFollowUpData', JSON.stringify({
                  ...data,
                  completed: true
                }));
              } catch (error) {
                console.error('Error updating follow-up data:', error);
              }
            }
          }}
        />
      )}

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />

      {/* Session Limit Modal */}
      <SessionLimitModal
        isOpen={showSessionLimitModal}
        onClose={() => setShowSessionLimitModal(false)}
        remainingSessions={remainingSessions}
        onUpgrade={handleUpgrade}
      />

      {/* Medical Disclaimer Modal */}
      <MedicalDisclaimer
        isOpen={showMedicalDisclaimer}
        onClose={() => setShowMedicalDisclaimer(false)}  
        onAccept={handleDisclaimerAccept}
      />
    </main>
  );
}