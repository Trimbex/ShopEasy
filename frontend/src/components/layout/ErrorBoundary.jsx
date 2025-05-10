'use client';

import { useState, useEffect } from 'react';

export default function ErrorBoundary({ children }) {
  const [hasError, setHasError] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const errorHandler = (event) => {
      console.error('Error caught by error boundary:', event.error);
      setError(event.error?.toString() || 'An unknown error occurred');
      setHasError(true);
      
      // Prevent the default error handling which would crash the app
      event.preventDefault();
    };

    // Add event listener
    window.addEventListener('error', errorHandler);
    window.addEventListener('unhandledrejection', errorHandler);

    // Remove event listener on cleanup
    return () => {
      window.removeEventListener('error', errorHandler);
      window.removeEventListener('unhandledrejection', errorHandler);
    };
  }, []);

  if (hasError) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-50 p-4">
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
          <h2 className="text-2xl font-bold text-red-600 mb-4">
            Something went wrong
          </h2>
          <p className="text-gray-700 mb-4">
            The application encountered an unexpected error. Please try refreshing the page.
          </p>
          {error && (
            <div className="bg-gray-100 p-3 rounded text-sm text-gray-800 font-mono mb-4 overflow-auto max-h-40">
              {error}
            </div>
          )}
          <button
            className="bg-indigo-600 text-white py-2 px-4 rounded hover:bg-indigo-700 transition-colors"
            onClick={() => {
              setHasError(false);
              window.location.reload();
            }}
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  return children;
} 