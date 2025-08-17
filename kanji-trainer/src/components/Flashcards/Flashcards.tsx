import { useEffect, useState } from 'react';
import { useAppStore } from '../../store/appStore';
import { useKanjiByLevel } from '../../hooks/useKanjiData';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import FlashcardDeck from './FlashcardDeck';
import LoadingSpinner from '../common/LoadingSpinner';
import SkeletonLoader from '../common/SkeletonLoader';

const Flashcards: React.FC = () => {
  const selectedLevel = useAppStore((state) => state.selectedLevel);
  const flashcardSession = useAppStore((state) => state.flashcardSession);
  const initializeFlashcardSession = useAppStore((state) => state.initializeFlashcardSession);
  const resetFlashcardSession = useAppStore((state) => state.resetFlashcardSession);
  const nextCard = useAppStore((state) => state.nextCard);
  const previousCard = useAppStore((state) => state.previousCard);
  const toggleAnswer = useAppStore((state) => state.toggleAnswer);
  const markCorrect = useAppStore((state) => state.markCorrect);
  const markIncorrect = useAppStore((state) => state.markIncorrect);

  const { data: kanjiData, isLoading, error } = useKanjiByLevel(selectedLevel);
  const [isInitializing, setIsInitializing] = useState(false);

  useEffect(() => {
    return () => {
      resetFlashcardSession();
    };
  }, [resetFlashcardSession]);

  const handleStartSession = async () => {
    if (kanjiData && kanjiData.length > 0) {
      setIsInitializing(true);
      
      // Add a small delay for better UX (shows loading state)
      await new Promise(resolve => setTimeout(resolve, 800));
      
      initializeFlashcardSession(kanjiData);
      setIsInitializing(false);
    }
  };

  const handleRestart = () => {
    if (kanjiData && kanjiData.length > 0) {
      initializeFlashcardSession(kanjiData);
    }
  };

  const handleExit = () => {
    resetFlashcardSession();
  };

  if (!selectedLevel) {
    return (
      <div className="w-full max-w-2xl mx-auto text-center">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-yellow-800 mb-4">
            Please Select a Level First
          </h2>
          <p className="text-yellow-700 mb-4">
            You need to choose a JLPT level before starting flashcard practice.
          </p>
          <Link
            to="/level"
            className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Level Selection
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="w-full max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-8"
        >
          {/* Header skeleton */}
          <div className="text-center">
            <SkeletonLoader variant="text" height="36px" width="300px" className="mx-auto mb-4" />
            <SkeletonLoader variant="text" height="20px" width="400px" className="mx-auto" />
          </div>
          
          {/* Content skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <SkeletonLoader variant="card" height="400px" />
              <div className="space-y-3">
                <SkeletonLoader variant="text" height="16px" count={3} />
              </div>
            </div>
            <div className="space-y-6">
              <SkeletonLoader variant="card" height="400px" />
              <div className="space-y-2">
                <SkeletonLoader variant="text" height="14px" count={4} />
              </div>
            </div>
          </div>
          
          {/* Loading message */}
          <div className="text-center">
            <LoadingSpinner size="sm" className="mb-3" />
            <p className="text-gray-600 animate-pulse">Loading kanji data...</p>
          </div>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-2xl mx-auto text-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-red-800 mb-4">
            Error Loading Kanji Data
          </h2>
          <p className="text-red-700 mb-4">
            Unable to load kanji data for level {selectedLevel}.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (flashcardSession) {
    return (
      <FlashcardDeck
        session={flashcardSession}
        onNext={nextCard}
        onPrevious={previousCard}
        onToggleAnswer={toggleAnswer}
        onMarkCorrect={markCorrect}
        onMarkIncorrect={markIncorrect}
        onRestart={handleRestart}
        onExit={handleExit}
      />
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-8"
      >
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Flashcards - Level {selectedLevel}
        </h2>
        <p className="text-gray-600 text-lg">
          Study kanji meanings and readings with interactive flashcards
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white rounded-xl shadow-lg p-8"
        >
          <div className="text-center">
            <div className="text-6xl mb-6">🎴</div>
            
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Ready to Practice?
            </h3>
            
            <p className="text-gray-600 mb-6">
              You'll practice with 20 random kanji from level {selectedLevel}.
              {kanjiData && (
                <span className="block mt-2 text-sm">
                  ({kanjiData.length} kanji available)
                </span>
              )}
            </p>
            
            <motion.button
              whileHover={{ scale: isInitializing ? 1 : 1.05 }}
              whileTap={{ scale: isInitializing ? 1 : 0.95 }}
              onClick={handleStartSession}
              disabled={isInitializing}
              className={`w-full px-6 py-3 rounded-lg transition-all duration-200 font-medium text-lg flex items-center justify-center gap-3 ${
                isInitializing 
                  ? 'bg-blue-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700'
              } text-white`}
            >
              {isInitializing ? (
                <>
                  <LoadingSpinner size="sm" />
                  <span>Preparing Session...</span>
                </>
              ) : (
                'Start Flashcard Session'
              )}
            </motion.button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-gray-50 rounded-xl shadow-lg p-8"
        >
          <h4 className="text-lg font-semibold text-gray-900 mb-4">How it works:</h4>
          <ul className="text-gray-700 space-y-3">
            <li className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold">1</div>
              <span>Click cards to reveal meanings and readings</span>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold">2</div>
              <span>Mark whether you knew each kanji correctly</span>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold">3</div>
              <span>Get a detailed summary of your performance</span>
            </li>
          </ul>

          <div className="mt-6 bg-white rounded-lg p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Session Length</span>
              <span className="font-semibold text-blue-600">20 cards</span>
            </div>
            <div className="flex items-center justify-between text-sm mt-2">
              <span className="text-gray-600">Estimated Time</span>
              <span className="font-semibold text-blue-600">5-10 min</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Flashcards;