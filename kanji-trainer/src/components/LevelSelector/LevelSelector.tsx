import { useAppStore } from '../../store/appStore';
import { useKanjiStats } from '../../hooks/useKanjiData';
import LoadingSpinner from '../common/LoadingSpinner';
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        {levels.map((levelInfo, index) => (
          <div 
            key={levelInfo.level}
            className={`animate-slide-up animate-delay-${index}00`}
          >
            <button
              onClick={() => handleLevelSelect(levelInfo.level)}
              className={`w-full glass-card hover:shadow-glow transition-all duration-300 transform hover:scale-105 hover:-translate-y-2 float-card group touch-manipulation no-tap-highlight ${
                selectedLevel === levelInfo.level
                  ? 'ring-4 ring-primary-400 shadow-glow-lg bg-gradient-to-br from-blue-50/80 to-purple-50/80'
                  : ''
              }`}
              style={{ 
                animationDelay: `${index * 0.5}s`,
                minHeight: '280px'
              }}
            >
              <div className="p-6 sm:p-8 text-center relative flex flex-col justify-center h-full">
                {selectedLevel === levelInfo.level && (
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-success-500 to-success-600 rounded-full flex items-center justify-center animate-bounce-in">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
                
                <div className="relative mb-6">
                  <div className={`kanji-xl font-black mb-4 transition-all duration-300 ${
                    selectedLevel === levelInfo.level 
                      ? 'gradient-text scale-110' 
                      : 'text-slate-700 dark:text-slate-300 group-hover:gradient-text group-hover:scale-105'
                  }`}>
                    {levelInfo.name}
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-r from-primary-400/0 via-primary-400/20 to-primary-400/0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl"></div>
                </div>
                
                <div className="text-xl font-bold text-slate-600 dark:text-slate-400 mb-4 group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors">
                  {levelInfo.description}
                </div>
                
                <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-600 rounded-full text-base font-semibold text-slate-700 dark:text-slate-300">
                  <span className="mr-2 text-lg">📚</span>
                  ~{levelInfo.count} kanji
                </div>
              </div>
            </button>
          </div>
        ))}
      </div>

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