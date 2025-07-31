'use client';

import { useAuth } from '../../contexts/AuthContext';

interface PremiumBadgeProps {
  feature: string;
  className?: string;
}

export default function PremiumBadge({ feature, className = '' }: PremiumBadgeProps) {
  const { isPremium } = useAuth();

  if (isPremium) {
    return null;
  }

  return (
    <span className={`inline-flex items-center px-2 py-1 text-xs font-medium bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-800 rounded-full ${className}`}>
      <span className="text-yellow-500 mr-1">👑</span>
      Premium
    </span>
  );
}