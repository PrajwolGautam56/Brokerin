import React from 'react';

function LoadingSpinner({ size = 'lg', text = 'Loading...' }) {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16'
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className={`animate-spin rounded-full border-t-4 border-b-4 border-violet-600 ${sizeClasses[size]} mx-auto mb-4`}></div>
        <p className="text-gray-600">{text}</p>
      </div>
    </div>
  );
}

export default LoadingSpinner;

