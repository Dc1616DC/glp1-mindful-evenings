'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getAIInsights, analyzePatterns } from '../../lib/grokApi';
import { getCheckInHistory } from '../../lib/userService';

interface PremiumInsightsProps {
  checkInData: any;
  onClose?: () => void;
}

export default function PremiumInsights({ checkInData, onClose }: PremiumInsightsProps) {
  const { user, isPremium } = useAuth();
  const [insights, setInsights] = useState<string | null>(null);
  const [patterns, setPatterns] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showUpgrade, setShowUpgrade] = useState(false);

  useEffect(() => {
    const fetchInsights = async () => {
      if (!isPremium) {
        setShowUpgrade(true);
        setLoading(false);
        return;
      }

      if (!user) return;

      try {
        // Get user's check-in history
        const { data: history } = await getCheckInHistory((user as any).uid, 10);
        
        // Get AI insights for current check-in
        const aiInsights = await getAIInsights(checkInData, history);
        if (aiInsights) {
          setInsights(aiInsights);
        }

        // Analyze patterns if enough history
        if (history && history.length >= 3) {
          const patternAnalysis = await analyzePatterns(history);
          if (patternAnalysis) {
            setPatterns(patternAnalysis);
          }
        }
      } catch (error) {
        console.error('Error fetching insights:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchInsights();
  }, [isPremium, user, checkInData]);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-8 max-w-lg mx-4">
          <div className="text-center">
            <div className="animate-pulse text-4xl mb-4">✨</div>
            <p className="text-gray-600">Generating your personalized insights...</p>
          </div>
        </div>
      </div>
    );
  }

  if (showUpgrade) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-8 max-w-lg mx-4">
          <div className="text-center space-y-4">
            <div className="text-5xl">🔒</div>
            <h2 className="text-2xl font-bold text-gray-900">Premium Feature</h2>
            <p className="text-gray-600">
              Unlock AI-powered insights that help you understand your evening patterns and build lasting mindful habits.
            </p>
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-4 rounded-lg">
              <h3 className="font-semibold text-purple-900 mb-2">Premium Benefits:</h3>
              <ul className="text-sm text-purple-800 space-y-1">
                <li>✨ Personalized AI insights after each check-in</li>
                <li>📊 Pattern analysis across your journey</li>
                <li>🎯 Custom activity recommendations</li>
                <li>🔄 Unlimited evening check-ins</li>
              </ul>
            </div>
            <button
              onClick={() => window.location.href = '/?upgrade=true'}
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 rounded-lg hover:from-purple-700 hover:to-indigo-700 font-medium"
            >
              Upgrade to Premium - $2.99/month
            </button>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-sm underline"
            >
              Maybe later
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Your Evening Insights</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Current Check-in Insights */}
          {insights && (
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-6 rounded-xl">
              <h3 className="font-semibold text-purple-900 mb-3 flex items-center">
                <span className="text-2xl mr-2">💫</span>
                Tonight's Personalized Insight
              </h3>
              <div className="text-purple-800 whitespace-pre-line">
                {insights}
              </div>
            </div>
          )}

          {/* Pattern Analysis */}
          {patterns && (
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-6 rounded-xl">
              <h3 className="font-semibold text-blue-900 mb-3 flex items-center">
                <span className="text-2xl mr-2">📊</span>
                Your Evening Patterns
              </h3>
              <div className="text-blue-800 whitespace-pre-line">
                {patterns}
              </div>
            </div>
          )}

          {/* Encouragement */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl">
            <h3 className="font-semibold text-green-900 mb-3 flex items-center">
              <span className="text-2xl mr-2">🌱</span>
              Remember
            </h3>
            <p className="text-green-800">
              Every check-in is a step toward understanding yourself better. 
              You're building awareness and that's what matters most. Trust your body's wisdom.
            </p>
          </div>

          {/* Action Button */}
          <div className="flex justify-center pt-4">
            <button
              onClick={onClose}
              className="px-8 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 font-medium"
            >
              Continue Your Evening
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}