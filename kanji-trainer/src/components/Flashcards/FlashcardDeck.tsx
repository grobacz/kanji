import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeftIcon, ChevronRightIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import FlashcardItem from './FlashcardItem';
import FlashcardResults from './FlashcardResults';
import { FlashcardSession } from '../../types';

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

  const handleCorrect = () => {
    onMarkCorrect();
    setTimeout(onNext, 300);
  };

  const handleIncorrect = () => {
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
    <div className="max-w-2xl mx-auto">
      {/* Header with progress */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-900">
            Flashcards - Level {currentKanji?.level}
          </h2>
          <div className="text-sm text-gray-600">
            {session.currentIndex + 1} of {session.totalCount}
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="w-full bg-gray-200 rounded-full h-2">
          <motion.div
            className="bg-blue-600 h-2 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Flashcard container */}
      <div className="mb-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={session.currentIndex}
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ duration: 0.3 }}
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
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="mb-6"
          >
            <div className="text-center mb-4">
              <p className="text-lg font-medium text-gray-700">
                Did you know this kanji?
              </p>
            </div>
            <div className="flex justify-center gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleCorrect}
                className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                <CheckIcon className="w-5 h-5" />
                Yes, I knew it
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleIncorrect}
                className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                <XMarkIcon className="w-5 h-5" />
                No, I didn't know
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation controls */}
      <div className="flex justify-between items-center">
        <button
          onClick={onPrevious}
          disabled={session.currentIndex === 0}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
            session.currentIndex === 0
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          <ChevronLeftIcon className="w-4 h-4" />
          Previous
        </button>

        {!session.showAnswer && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onToggleAnswer}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Show Answer
          </motion.button>
        )}

        <button
          onClick={onNext}
          disabled={session.currentIndex >= session.totalCount - 1}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
            session.currentIndex >= session.totalCount - 1
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Next
          <ChevronRightIcon className="w-4 h-4" />
        </button>
      </div>

      {/* Score display */}
      <div className="mt-6 text-center text-sm text-gray-600">
        <div className="flex justify-center gap-6">
          <span className="text-green-600">
            ✓ Correct: {session.correctCount}
          </span>
          <span className="text-red-600">
            ✗ Incorrect: {session.incorrectCount}
          </span>
        </div>
      </div>
    </div>
  );
};

export default FlashcardDeck;