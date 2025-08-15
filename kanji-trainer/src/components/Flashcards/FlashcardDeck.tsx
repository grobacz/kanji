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
  const isHalfway = session.currentIndex >= Math.floor(session.totalCount / 2);
  const isNearEnd = session.currentIndex >= Math.floor(session.totalCount * 0.8);

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
    <div className="max-w-3xl mx-auto px-4">
      {/* Enhanced Header with progress */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Flashcards - Level {currentKanji?.level}
            </h2>
            {accuracy > 0 && (
              <div className="text-sm text-gray-600 mt-1">
                Current accuracy: <span className={`font-semibold ${
                  accuracy >= 80 ? 'text-green-600' : 
                  accuracy >= 60 ? 'text-yellow-600' : 'text-red-600'
                }`}>{accuracy}%</span>
              </div>
            )}
          </div>
          <div className="text-right">
            <div className="text-lg font-semibold text-gray-800">
              {session.currentIndex + 1} of {session.totalCount}
            </div>
            <div className="text-sm text-gray-500">
              {Math.round(progress)}% complete
            </div>
          </div>
        </div>
        
        {/* Enhanced Progress bar with milestone celebrations */}
        <div className="relative">
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <motion.div
              className={`h-3 rounded-full transition-colors duration-500 ${
                progress >= 100 ? 'bg-gradient-to-r from-green-500 to-green-600' :
                progress >= 80 ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
                'bg-gradient-to-r from-blue-500 to-blue-600'
              }`}
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
          
          {/* Milestone markers */}
          <div className="absolute top-0 left-1/2 w-1 h-3 bg-white border border-gray-300 rounded-full transform -translate-x-1/2" />
          <div className="absolute top-0 left-4/5 w-1 h-3 bg-white border border-gray-300 rounded-full transform -translate-x-1/2" />
          
          {/* Celebration animations for milestones */}
          {isHalfway && progress >= 50 && progress < 52 && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-2xl"
            >
              🎉
            </motion.div>
          )}
          
          {isNearEnd && progress >= 80 && progress < 82 && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="absolute -top-8 left-4/5 transform -translate-x-1/2 text-2xl"
            >
              🏁
            </motion.div>
          )}
        </div>
      </div>

      {/* Flashcard container - improved spacing with swipe gestures */}
      <div className="mb-8" {...swipeGestures}>
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
        
        {/* Swipe hint for mobile */}
        <div className="mt-4 text-center text-xs text-gray-500 md:hidden">
          <span className="inline-flex items-center gap-2">
            <span>👈 Swipe left/right to navigate</span>
            <span>👆 Swipe up to flip</span>
          </span>
        </div>
      </div>

      {/* Answer feedback buttons */}
      <AnimatePresence>
        {session.showAnswer && (
          <motion.div
            initial={{ y: 30, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -30, opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="mb-8 bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/60 shadow-lg"
          >
            <div className="text-center mb-8">
              <p className="text-2xl font-bold text-gray-800 mb-3">
                Did you know this kanji?
              </p>
              <p className="text-base text-gray-600">
                Be honest with yourself – it helps with learning!
              </p>
            </div>
            <div className="flex flex-col sm:flex-row justify-center gap-4 max-w-md mx-auto">
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: "0 8px 25px rgba(34, 197, 94, 0.3)" }}
                whileTap={{ scale: 0.95 }}
                onClick={handleCorrect}
                className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 font-bold shadow-lg flex-1 sm:flex-none sm:min-w-[160px] justify-center"
                style={{ minHeight: '56px' }}
              >
                <CheckIcon className="w-6 h-6" />
                <span className="text-lg">I knew it!</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: "0 8px 25px rgba(239, 68, 68, 0.3)" }}
                whileTap={{ scale: 0.95 }}
                onClick={handleIncorrect}
                className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 font-bold shadow-lg flex-1 sm:flex-none sm:min-w-[160px] justify-center"
                style={{ minHeight: '56px' }}
              >
                <XMarkIcon className="w-6 h-6" />
                <span className="text-lg">Need practice</span>
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation controls - properly aligned and sized */}
      <div className="flex items-center justify-center gap-4 w-full">
        {/* Previous button */}
        <button
          onClick={onPrevious}
          disabled={session.currentIndex === 0}
          className={`flex items-center gap-2 px-6 py-4 rounded-xl font-bold transition-all duration-200 shadow-lg ${
            session.currentIndex === 0
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-white text-gray-700 hover:bg-gray-50 border-2 border-gray-200 hover:border-gray-300 hover:shadow-xl'
          }`}
          style={{ minHeight: '56px', minWidth: '120px' }}
        >
          <ChevronLeftIcon className="w-5 h-5" />
          <span>Previous</span>
        </button>

        {/* Center action button */}
        {!session.showAnswer && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onToggleAnswer}
            className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-bold shadow-lg hover:shadow-xl"
            style={{ minHeight: '56px', minWidth: '180px' }}
          >
            <span className="flex items-center gap-3">
              <span className="text-lg">🔍</span>
              <span>Show Answer</span>
            </span>
          </motion.button>
        )}

        {/* Next button */}
        <button
          onClick={onNext}
          disabled={session.currentIndex >= session.totalCount - 1}
          className={`flex items-center gap-2 px-6 py-4 rounded-xl font-bold transition-all duration-200 shadow-lg ${
            session.currentIndex >= session.totalCount - 1
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-white text-gray-700 hover:bg-gray-50 border-2 border-gray-200 hover:border-gray-300 hover:shadow-xl'
          }`}
          style={{ minHeight: '56px', minWidth: '120px' }}
        >
          <span>Next</span>
          <ChevronRightIcon className="w-5 h-5" />
        </button>
      </div>

      {/* Enhanced Score display */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100"
      >
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Session Progress</h3>
          <div className="grid grid-cols-2 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 mb-1">
                {session.correctCount}
              </div>
              <div className="text-sm text-gray-600 flex items-center justify-center gap-1">
                <span className="text-green-500">✓</span>
                Correct
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600 mb-1">
                {session.incorrectCount}
              </div>
              <div className="text-sm text-gray-600 flex items-center justify-center gap-1">
                <span className="text-red-500">✗</span>
                Need Review
              </div>
            </div>
          </div>
          
          {accuracy > 0 && (
            <div className="mt-4 pt-4 border-t border-blue-200">
              <div className="flex items-center justify-center gap-2">
                <span className="text-sm text-gray-600">Accuracy:</span>
                <span className={`text-lg font-bold ${
                  accuracy >= 80 ? 'text-green-600' : 
                  accuracy >= 60 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {accuracy}%
                </span>
                {accuracy >= 80 && <span className="text-lg">🌟</span>}
                {accuracy >= 90 && <span className="text-lg">🎯</span>}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default FlashcardDeck;