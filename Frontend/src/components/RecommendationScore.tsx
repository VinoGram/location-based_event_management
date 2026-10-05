import React from 'react';

interface RecommendationScoreProps {
  score: number;
  className?: string;
}

export default function RecommendationScore({ score, className = '' }: RecommendationScoreProps) {
  if (score <= 0) return null;

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-400';
    if (score >= 5) return 'text-yellow-400';
    return 'text-blue-400';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 8) return 'Perfect Match';
    if (score >= 5) return 'Great Match';
    return 'Good Match';
  };

  return (
    <div className={`flex items-center space-x-1 ${className}`}>
      <svg className={`w-4 h-4 ${getScoreColor(score)}`} fill="currentColor" viewBox="0 0 20 20">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
      <span className={`text-xs font-medium ${getScoreColor(score)}`}>
        {getScoreLabel(score)} ({Math.round(score * 10)}%)
      </span>
    </div>
  );
}