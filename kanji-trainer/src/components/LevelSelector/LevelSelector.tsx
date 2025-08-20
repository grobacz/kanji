import { useAppStore } from '../../store/appStore';
import { useKanjiStats } from '../../hooks/useKanjiData';
import LoadingSpinner from '../common/LoadingSpinner';
import ConstellationMap from './ConstellationMap';
import type { JLPTLevel } from '../../types';

const levelInfo: Record<JLPTLevel, { name: string; description: string; defaultCount: number }> = {
  N5: { name: 'N5', description: 'Basic', defaultCount: 80 },
  N4: { name: 'N4', description: 'Elementary', defaultCount: 170 },
  N3: { name: 'N3', description: 'Intermediate', defaultCount: 370 },
  N2: { name: 'N2', description: 'Upper-Intermediate', defaultCount: 380 },
  N1: { name: 'N1', description: 'Advanced', defaultCount: 1136 },
};

const LevelSelector: React.FC = () => {
  const { selectedLevel, setSelectedLevel } = useAppStore();
  const { data: kanjiStats, isLoading, isError, refetch } = useKanjiStats();

  const handleLevelSelect = (level: JLPTLevel) => {
    setSelectedLevel(level);
  };

  if (isLoading) {
    return (
      <div className="w-full max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Loading Kanji Data...
          </h2>
          <LoadingSpinner size="lg" className="mb-4" />
          <p className="text-gray-600">
            Preparing your kanji learning experience
          </p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="w-full max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-red-800 mb-4">
              Unable to Load Kanji Data
            </h2>
            <p className="text-red-700 mb-4">
              There was an error loading the kanji database. Please try again.
            </p>
            <button
              onClick={() => refetch()}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Retry Loading
            </button>
          </div>
        </div>
      </div>
    );
  }

  const levels = Object.entries(levelInfo).map(([level, info]) => {
    const stats = kanjiStats?.find(s => s?.level === level);
    return {
      level: level as JLPTLevel,
      ...info,
      count: stats?.count || info.defaultCount,
    };
  });

  return (
    <div className="w-full max-w-6xl mx-auto animate-fade-in">
      <div className="text-center mb-12">
        <h2 className="text-4xl sm:text-5xl font-bold gradient-text mb-6">
          Choose Your JLPT Level
        </h2>
        <p className="text-slate-600 dark:text-slate-400 text-xl max-w-2xl mx-auto leading-relaxed">
          Select your Japanese Language Proficiency Test level and begin your kanji mastery journey
        </p>
      </div>

      {/* Interactive Constellation Map */}
      <ConstellationMap
        levels={levels}
        selectedLevel={selectedLevel}
        onLevelSelect={handleLevelSelect}
      />

      {selectedLevel && (
        <div className="mt-12 animate-scale-in">
          <div className="glass-card p-8 text-center">
            <div className="flex flex-col items-center space-y-4">
              <div className="checkmark-container bg-gradient-to-r from-success-500 to-success-600 rounded-full flex items-center justify-center">
                <svg className="checkmark-icon text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              
              <div>
                <h3 className="text-2xl font-bold gradient-text mb-2">
                  Level {selectedLevel} Selected! 🎌
                </h3>
                <p className="text-lg text-slate-600 dark:text-slate-400 mb-1">
                  {levels.find(l => l.level === selectedLevel)?.count || 0} kanji ready for practice
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-500">
                  You can now proceed to writing practice or flashcards
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 mt-6 justify-center w-full">
                <a
                  href="/write"
                  className="button-base btn-large text-lg font-bold flex-1 sm:flex-none touch-manipulation"
                >
                  ✍️ Start Writing Practice
                </a>
                <a
                  href="/flashcards"
                  className="button-base button-secondary btn-large text-lg font-bold flex-1 sm:flex-none touch-manipulation"
                >
                  🃏 Try Flashcards
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {kanjiStats && kanjiStats.length > 0 && (
        <div className="mt-8 animate-fade-in">
          <div className="glass-card p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Database Status
                </h3>
              </div>
              <div className="text-xs font-medium text-slate-600 dark:text-slate-400">
                {kanjiStats.length}/5 levels loaded • 
                {kanjiStats.reduce((total, stat) => total + (stat?.count || 0), 0)} total kanji
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LevelSelector;