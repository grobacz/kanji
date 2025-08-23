import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeftIcon, ChevronRightIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import FlashcardItem from './FlashcardItem';
import FlashcardResults from './FlashcardResults';
import { useSwipeGestures } from '../../hooks/useSwipeGestures';
import { haptics } from '../../utils/haptics';
import type { FlashcardSession } from '../../types';

interface FlashcardDeckProps {
  session: FlashcardSession;
  onNext: () => void;
  onPrevious: () => void;
  onToggleAnswer: () => void;
  onMarkCorrect: () => void;
  onMarkIncorrect: () => void;
  onRestart: () => void;
  onExit: () => void;
}

const FlashcardDeck: React.FC<FlashcardDeckProps> = ({
  session,
  onNext,
  onPrevious,
  onToggleAnswer,
  onMarkCorrect,
  onMarkIncorrect,
  onRestart,
  onExit,
}) => {
  const currentKanji = session.kanji[session.currentIndex];
  const progress = ((session.currentIndex + 1) / session.totalCount) * 100;
  const accuracy = session.correctCount + session.incorrectCount > 0 
    ? Math.round((session.correctCount / (session.correctCount + session.incorrectCount)) * 100) 
    : 0;

  // Swipe gestures for navigation with haptic feedback
  const swipeGestures = useSwipeGestures({
    onSwipeLeft: () => {
      if (session.currentIndex < session.totalCount - 1) {
        haptics.navigation();
        onNext();
      }
    },
    onSwipeRight: () => {
      if (session.currentIndex > 0) {
        haptics.navigation();
        onPrevious();
      }
    },
    onSwipeUp: () => {
      if (!session.showAnswer) {
        haptics.cardFlip();
        onToggleAnswer();
      }
    },
    minSwipeDistance: 50,
    preventDefaultTouchMove: false
  });

  const handleCorrect = () => {
    haptics.correctAnswer();
    onMarkCorrect();
    setTimeout(onNext, 300);
  };

  const handleIncorrect = () => {
    haptics.incorrectAnswer();
    onMarkIncorrect();
    setTimeout(onNext, 300);
  };

  if (session.isComplete) {
    return (
      <FlashcardResults
        session={session}
        onRestart={onRestart}
        onExit={onExit}
      />
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-4 min-h-screen flex flex-col py-6">
      {/* Compact Header with progress */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-3">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Flashcards - Level {currentKanji?.level}
            </h2>
            {accuracy > 0 && (
              <div className="text-sm text-gray-600 mt-1">
                Accuracy: <span className={`font-semibold ${
                  accuracy >= 80 ? 'text-green-600' : 
                  accuracy >= 60 ? 'text-yellow-600' : 'text-red-600'
                }`}>{accuracy}%</span>
              </div>
            )}
          </div>
          <div className="text-right">
            <div className="text-lg font-semibold text-gray-800">
              {session.currentIndex + 1} / {session.totalCount}
            </div>
            <div className="text-sm text-gray-500">
              {Math.round(progress)}% complete
            </div>
          </div>
        </div>
        
        {/* Compact Progress bar */}
        <div className="relative">
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <motion.div
              className={`h-2 rounded-full transition-colors duration-500 ${
                progress >= 100 ? 'bg-gradient-to-r from-green-500 to-green-600' :
                progress >= 80 ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
                'bg-gradient-to-r from-blue-500 to-blue-600'
              }`}
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
        </div>
        
        {/* Compact score display inline */}
        <div className="flex justify-center gap-6 mt-3 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-green-600 font-bold text-lg">{session.correctCount}</span>
            <span className="text-gray-600"> correct</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-red-600 font-bold text-lg">{session.incorrectCount}</span>
            <span className="text-gray-600"> review</span>
          </div>
        </div>
      </div>

      {/* Flashcard container - maximized space */}
      <div className="flex-1 flex flex-col justify-center relative z-10 mb-6" {...swipeGestures}>
        <AnimatePresence mode="wait">
          <motion.div
            key={session.currentIndex}
            initial={{ x: 300, opacity: 0, scale: 0.95 }}
            animate={{ x: 0, opacity: 1, scale: 1 }}
            exit={{ x: -300, opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
          >
            <FlashcardItem
              kanji={currentKanji}
              showAnswer={session.showAnswer}
              onToggleAnswer={onToggleAnswer}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Answer feedback buttons */}
      <AnimatePresence>
        {session.showAnswer && (
          <motion.div
            initial={{ y: 30, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -30, opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="mb-6 bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-gray-200/60 shadow-lg relative z-20 flex-shrink-0"
          >
            <div className="text-center mb-4">
              <p className="text-lg font-bold text-gray-800 mb-2">
                Did you know this kanji?
              </p>
              <p className="text-sm text-gray-600">
                Be honest – it helps with learning!
              </p>
            </div>
            <div className="flex flex-col sm:flex-row justify-center gap-3 max-w-md mx-auto">
              <motion.button
                whileHover={{ scale: 1.02, boxShadow: "0 6px 20px rgba(34, 197, 94, 0.25)" }}
                whileTap={{ scale: 0.98 }}
                onClick={handleCorrect}
                className="flex items-center justify-center bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 font-semibold shadow-md"
                style={{ width: '64px', height: '64px', minWidth: '64px', minHeight: '64px' }}
              >
                <CheckIcon className="w-8 h-8" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02, boxShadow: "0 6px 20px rgba(239, 68, 68, 0.25)" }}
                whileTap={{ scale: 0.98 }}
                onClick={handleIncorrect}
                className="flex items-center justify-center bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 font-semibold shadow-md"
                style={{ width: '64px', height: '64px', minWidth: '64px', minHeight: '64px' }}
              >
                <XMarkIcon className="w-8 h-8" />
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation controls - horizontal layout */}
      <div className="w-full relative z-20 flex-shrink-0">
        {/* Center action button */}
        {!session.showAnswer && (
          <div className="flex justify-center mb-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onToggleAnswer}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-semibold shadow-md hover:shadow-lg"
            >
              <span className="flex items-center gap-2">
                <span>👆</span>
                <span>Tap to reveal meaning</span>
              </span>
            </motion.button>
          </div>
        )}
        
        {/* Previous/Next buttons side by side */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '16px', 
          width: '100%', 
          margin: '0 auto',
          padding: '8px'
        }}>
          <button
            onClick={onPrevious}
            disabled={session.currentIndex === 0}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              width: '150px',
              height: '50px',
              padding: '0',
              margin: '0',
              backgroundColor: session.currentIndex === 0 ? '#f3f4f6' : '#ffffff',
              color: session.currentIndex === 0 ? '#9ca3af' : '#374151',
              border: session.currentIndex === 0 ? '1px solid #d1d5db' : '1px solid #e5e7eb',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: session.currentIndex === 0 ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
              flexShrink: 0,
              flexGrow: 0,
              boxSizing: 'border-box'
            }}
          >
            <ChevronLeftIcon style={{ width: '16px', height: '16px', flexShrink: 0 }} />
            <span style={{ flexShrink: 0 }}>Previous</span>
          </button>

          <button
            onClick={onNext}
            disabled={session.currentIndex >= session.totalCount - 1}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              width: '150px',
              height: '50px',
              padding: '0',
              margin: '0',
              backgroundColor: session.currentIndex >= session.totalCount - 1 ? '#f3f4f6' : '#ffffff',
              color: session.currentIndex >= session.totalCount - 1 ? '#9ca3af' : '#374151',
              border: session.currentIndex >= session.totalCount - 1 ? '1px solid #d1d5db' : '1px solid #e5e7eb',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: session.currentIndex >= session.totalCount - 1 ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
              flexShrink: 0,
              flexGrow: 0,
              boxSizing: 'border-box'
            }}
          >
            <span style={{ flexShrink: 0 }}>Next</span>
            <ChevronRightIcon style={{ width: '16px', height: '16px', flexShrink: 0 }} />
          </button>
        </div>
      </div>

      {/* Mobile swipe hint */}
      <div className="mt-3 text-center text-xs text-gray-500 md:hidden">
        <span>👈 Swipe left/right to navigate • 👆 Swipe up to flip</span>
      </div>
    </div>
  );
};

export default FlashcardDeck;