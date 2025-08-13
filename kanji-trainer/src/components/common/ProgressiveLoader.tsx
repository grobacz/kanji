import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface ProgressiveLoaderProps {
  isLoading: boolean;
  error?: Error | null;
  title?: string;
  description?: string;
  onRetry?: () => void;
  showProgress?: boolean;
  progress?: number;
  children: React.ReactNode;
}

const ProgressiveLoader: React.FC<ProgressiveLoaderProps> = ({
  isLoading,
  error,
  title = "Loading",
  description = "Please wait while we load the content...",
  onRetry,
  showProgress = false,
  progress = 0,
  children,
}) => {
  const [dots, setDots] = useState('');

  // Animate loading dots
  useEffect(() => {
    if (!isLoading) return;

    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 500);

    return () => clearInterval(interval);
  }, [isLoading]);

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center min-h-64 p-8"
      >
        <div className="text-red-500 text-4xl mb-4" role="img" aria-label="Error">
          😞
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Failed to load content
        </h3>
        <p className="text-gray-600 text-center mb-4 max-w-md">
          {error.message || "Something went wrong while loading. Please try again."}
        </p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium focus-ring"
            aria-describedby="retry-description"
          >
            Try Again
          </button>
        )}
        <p id="retry-description" className="sr-only">
          Click to retry loading the content
        </p>
      </motion.div>
    );
  }

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center min-h-64 p-8"
        role="status"
        aria-live="polite"
      >
        {/* Loading Spinner */}
        <div className="relative mb-6">
          <div className="w-12 h-12 border-4 border-gray-200 rounded-full animate-spin">
            <div className="absolute top-0 left-0 w-12 h-12 border-4 border-transparent border-t-blue-600 rounded-full animate-spin"></div>
          </div>
        </div>

        {/* Loading Text */}
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {title}
          <span className="inline-block w-6 text-left" aria-hidden="true">{dots}</span>
        </h3>
        <p className="text-gray-600 text-center max-w-md mb-4">
          {description}
        </p>

        {/* Progress Bar */}
        {showProgress && (
          <div className="w-full max-w-xs">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <motion.div
                className="bg-blue-600 h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>
        )}

        {/* Accessibility */}
        <span className="sr-only">
          Loading {title.toLowerCase()}. {description} 
          {showProgress && `${Math.round(progress)} percent complete.`}
        </span>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  );
};

export default ProgressiveLoader;