import { useAppStore } from '../../store/appStore';
import { Link } from 'react-router-dom';

const Header: React.FC = () => {
  const selectedLevel = useAppStore((state) => state.selectedLevel);

  return (
    <header className="glass-card border-0 sticky top-0 z-50 safe-area-inset-top mb-4 mx-4 mt-4 rounded-2xl">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 sm:space-x-4 min-w-0 flex-1">
            <Link 
              to="/" 
              className="flex items-center space-x-3 focus-ring rounded-xl p-2 -m-2 touch-manipulation no-tap-highlight group"
              aria-label="Go to home page"
            >
              <div className="relative">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold kanji-text truncate transition-all duration-300 group-hover:scale-110">
                  <span className="hidden xs:inline">漢字 </span>Trainer
                </h1>
                <div className="absolute -inset-2 bg-gradient-to-r from-blue-400/0 via-blue-400/20 to-purple-400/0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl"></div>
              </div>
            </Link>
            {selectedLevel && (
              <div className="shrink-0 animate-fade-in">
                <span 
                  className="px-3 py-1.5 sm:px-4 sm:py-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-lg backdrop-blur-sm border border-white/20 hover:scale-105 transition-transform duration-200"
                  role="status"
                  aria-label={`Currently studying JLPT Level ${selectedLevel}`}
                >
                  <span className="hidden xs:inline">Level </span>{selectedLevel}
                </span>
              </div>
            )}
          </div>
          
          <div className="hidden sm:flex items-center shrink-0">
            <div className="px-4 py-2 bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 rounded-lg text-sm font-semibold text-slate-700 dark:text-slate-300 backdrop-blur-sm">
              🇯🇵 Japanese Kanji Learning
            </div>
          </div>
        </div>
      </div>
      
      {/* Skip to main content link for accessibility */}
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-full focus:left-4 focus:z-10 px-4 py-2 button-base focus-ring"
        style={{ backgroundColor: 'var(--primary-color)' }}
      >
        Skip to main content
      </a>
    </header>
  );
};

export default Header;