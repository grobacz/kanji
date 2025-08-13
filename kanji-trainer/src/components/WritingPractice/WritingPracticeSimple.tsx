import { useAppStore } from '../../store/appStore';
import { useKanjiByLevel } from '../../hooks/useKanjiData';
import { Link } from 'react-router-dom';
import LoadingSpinner from '../common/LoadingSpinner';

const WritingPracticeSimple: React.FC = () => {
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
            You need to choose a JLPT level before starting writing practice.
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
      <div className="max-w-4xl mx-auto text-center">
        <LoadingSpinner />
        <p className="text-gray-600 mt-4">Loading kanji data...</p>
      </div>
    );
  }

  if (error || !kanjiData || kanjiData.length === 0) {
    return (
      <div className="max-w-4xl mx-auto text-center">
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

  const currentKanji = kanjiData[0]; // Just show first kanji for now

  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Writing Practice - Level {selectedLevel}
        </h2>
        <p className="text-gray-600 text-lg">
          Practice writing kanji characters
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left column - Kanji info */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-center mb-4">
            <div className="text-8xl font-bold mb-4 kanji-text text-gray-900">
              {currentKanji.character}
            </div>
            <div className="space-y-2 text-sm text-gray-600">
              <div><strong>Meanings:</strong> {currentKanji.meanings.join(', ')}</div>
              <div><strong>Strokes:</strong> {currentKanji.strokes}</div>
              <div><strong>Level:</strong> {currentKanji.level}</div>
            </div>
          </div>
        </div>

        {/* Right column - Coming soon */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
            Drawing Canvas
          </h3>
          
          <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg h-96 flex items-center justify-center">
            <div className="text-center">
              <div className="text-4xl mb-4">🎨</div>
              <p className="text-gray-600">Drawing canvas coming soon!</p>
              <p className="text-sm text-gray-500 mt-2">
                Loaded {kanjiData.length} kanji for level {selectedLevel}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WritingPracticeSimple;