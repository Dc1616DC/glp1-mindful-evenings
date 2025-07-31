'use client';

interface SessionLimitModalProps {
  isOpen: boolean;
  onClose: () => void;
  remainingSessions: number;
  onUpgrade: () => void;
}

export default function SessionLimitModal({ 
  isOpen, 
  onClose, 
  remainingSessions, 
  onUpgrade 
}: SessionLimitModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
        <div className="text-center">
          <div className="text-4xl mb-4">🌙</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {remainingSessions === 0 ? 'Weekly Limit Reached' : 'Almost at Your Limit'}
          </h2>
          
          {remainingSessions === 0 ? (
            <div className="space-y-4">
              <p className="text-gray-600">
                You've used all 3 of your free weekly check-ins. Upgrade to Premium for unlimited access plus AI-powered insights!
              </p>
              
              <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg">
                <h3 className="font-semibold text-purple-900 mb-2">✨ Premium Benefits:</h3>
                <ul className="text-sm text-purple-800 space-y-1 text-left">
                  <li>• Unlimited evening check-ins</li>
                  <li>• AI-powered personalized insights</li>
                  <li>• Advanced pattern analysis</li>
                  <li>• Custom activity suggestions</li>
                  <li>• Priority support</li>
                </ul>
              </div>
              
              <div className="flex flex-col space-y-3">
                <button
                  onClick={onUpgrade}
                  className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 rounded-lg hover:from-purple-700 hover:to-indigo-700 font-medium"
                >
                  Upgrade to Premium - $2.99/month
                </button>
                <button
                  onClick={onClose}
                  className="w-full bg-gray-500 text-white py-3 rounded-lg hover:bg-gray-600"
                >
                  Maybe Later
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-gray-600">
                You have <strong>{remainingSessions}</strong> free check-in{remainingSessions !== 1 ? 's' : ''} remaining this week.
              </p>
              
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-sm text-amber-800">
                  💡 <strong>Consider upgrading to Premium</strong> for unlimited check-ins and AI-powered insights!
                </p>
              </div>
              
              <div className="flex flex-col space-y-3">
                <button
                  onClick={onClose}
                  className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 font-medium"
                >
                  Continue with Free Check-in
                </button>
                <button
                  onClick={onUpgrade}
                  className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 rounded-lg hover:from-purple-700 hover:to-indigo-700 font-medium"
                >
                  Upgrade to Premium - $2.99/month
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}