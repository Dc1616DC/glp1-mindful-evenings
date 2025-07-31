'use client';

import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { createPortalSession } from '../../lib/stripe';

export default function SubscriptionManager() {
  const { user, userProfile, isPremium } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleManageSubscription = async () => {
    const customerId = (userProfile as any)?.stripeCustomerId;
    if (!customerId) {
      alert('No subscription found. Please upgrade to premium first.');
      return;
    }

    setLoading(true);
    try {
      const session = await createPortalSession(customerId);
      if (session.url) {
        window.location.href = session.url;
      }
    } catch (error) {
      console.error('Error opening customer portal:', error);
      alert('Error managing subscription. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isPremium) {
    return null;
  }

  return (
    <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-gray-900">Premium Subscription</h3>
          <p className="text-sm text-gray-600">
            You have unlimited access to all features
          </p>
        </div>
        <button
          onClick={handleManageSubscription}
          disabled={loading}
          className="px-4 py-2 bg-white border border-purple-300 text-purple-700 rounded-lg hover:bg-purple-50 transition-colors disabled:opacity-50"
        >
          {loading ? 'Loading...' : 'Manage Subscription'}
        </button>
      </div>
    </div>
  );
}