import React from 'react';

interface ErrorMessageProps {
  error: string;
  onRetry?: () => void;
  className?: string;

}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ 
  error, 
  onRetry, 
  className = '' 
}) => {
  return (
    <div className={`bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded ${className}`}>
      <div className="flex items-center">
        <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
        </svg>
        <span className="font-medium">Error:</span>
      </div>
      <p className="mt-1 ml-6">{error}</p>
      {onRetry && (
        <button 
          onClick={onRetry}
          className="mt-2 ml-6 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
        >
          Try Again
        </button>
      )}
    </div>
  );
};