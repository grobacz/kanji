import { useAppStore } from '../../store/appStore';
import { useKanjiByLevel } from '../../hooks/useKanjiData';
import { Link } from 'react-router-dom';
import LoadingSpinner from '../common/LoadingSpinner';

const FlashcardsSimple: React.FC = () => {
  const selectedLevel = useAppStore((state) => state.selectedLevel);
  const { data: kanjiData, isLoading, error } = useKanjiByLevel(selectedLevel);

  if (!selectedLevel) {
    return (
      <div className="max-w-2xl mx-auto text-center">
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
      <div className="max-w-2xl mx-auto text-center">
        <LoadingSpinner />
        <p className="text-gray-600 mt-4">Loading kanji data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto text-center">
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

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Flashcards - Level {selectedLevel}
        </h2>
        <p className="text-gray-600 text-lg">
          Study kanji meanings and readings with interactive flashcards
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-xl shadow-lg p-8">
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
            
            <button
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-lg"
            >
              Start Flashcard Session (Coming Soon)
            </button>
          </div>
        </div>

        <div className="bg-gray-50 rounded-xl shadow-lg p-8">
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
            <div className="flex items-center justify-between text-sm mt-2">
              <span className="text-gray-600">Available Kanji</span>
              <span className="font-semibold text-green-600">{kanjiData?.length || 0}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlashcardsSimple;