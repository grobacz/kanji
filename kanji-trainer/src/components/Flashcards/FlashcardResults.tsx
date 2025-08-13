import { motion } from 'framer-motion';
import { FlashcardSession } from '../../types';

interface FlashcardResultsProps {
  session: FlashcardSession;
  onRestart: () => void;
  onExit: () => void;
}

const FlashcardResults: React.FC<FlashcardResultsProps> = ({
  session,
  onRestart,
  onExit,
}) => {
  const totalTime = Math.round((Date.now() - session.startTime) / 1000);
  const averageTime = Math.round(totalTime / session.totalCount);
  const accuracy = Math.round((session.correctCount / session.totalCount) * 100);

  const getScoreMessage = (accuracy: number) => {
    if (accuracy >= 90) return "Excellent work! 🎉";
    if (accuracy >= 80) return "Great job! 👏";
    if (accuracy >= 70) return "Good effort! 👍";
    if (accuracy >= 60) return "Keep practicing! 📚";
    return "More practice needed! 💪";
  };

  const getScoreColor = (accuracy: number) => {
    if (accuracy >= 90) return "text-green-600";
    if (accuracy >= 80) return "text-blue-600";
    if (accuracy >= 70) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="max-w-2xl mx-auto"
    >
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="text-6xl mb-4"
          >
            🎓
          </motion.div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Session Complete!
          </h2>
          <p className={`text-xl font-semibold ${getScoreColor(accuracy)}`}>
            {getScoreMessage(accuracy)}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-green-50 rounded-lg p-4 text-center"
          >
            <div className="text-2xl font-bold text-green-600">
              {session.correctCount}
            </div>
            <div className="text-sm text-green-700">Correct</div>
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-red-50 rounded-lg p-4 text-center"
          >
            <div className="text-2xl font-bold text-red-600">
              {session.incorrectCount}
            </div>
            <div className="text-sm text-red-700">Incorrect</div>
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="bg-blue-50 rounded-lg p-4 text-center"
          >
            <div className="text-2xl font-bold text-blue-600">
              {accuracy}%
            </div>
            <div className="text-sm text-blue-700">Accuracy</div>
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="bg-purple-50 rounded-lg p-4 text-center"
          >
            <div className="text-2xl font-bold text-purple-600">
              {averageTime}s
            </div>
            <div className="text-sm text-purple-700">Avg. Time</div>
          </motion.div>
        </div>

        {/* Progress Summary */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="bg-gray-50 rounded-lg p-6 mb-8"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Session Summary
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
            <div>
              <span className="font-medium">Total Cards:</span> {session.totalCount}
            </div>
            <div>
              <span className="font-medium">Total Time:</span> {Math.floor(totalTime / 60)}m {totalTime % 60}s
            </div>
            <div>
              <span className="font-medium">Level:</span> {session.kanji[0]?.level}
            </div>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <button
            onClick={onRestart}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Practice Again
          </button>
          <button
            onClick={onExit}
            className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
          >
            Back to Menu
          </button>
        </motion.div>

        {/* Encouragement Message */}
        {accuracy < 80 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg"
          >
            <p className="text-sm text-yellow-800 text-center">
              💡 <strong>Tip:</strong> Regular practice helps with retention. 
              Try reviewing these kanji again tomorrow!
            </p>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default FlashcardResults;