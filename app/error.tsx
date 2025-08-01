'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
      <h2 className="text-2xl font-bold mb-4">Something went wrong!</h2>
      <p className="mb-6 max-w-md">
        We apologize for the inconvenience. The application encountered an unexpected error.
      </p>
      <button
        onClick={() => reset()}
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
      >
        Try again
      </button>
      <button
        onClick={() => window.location.href = '/'}
        className="px-4 py-2 mt-2 text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50 transition-colors"
      >
        Go to homepage
      </button>
    </div>
  );
} 