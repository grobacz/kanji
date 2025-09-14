import { useAppStore } from '../../store/appStore';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useFocusMode } from '../../hooks/useFocusMode';
import ThemeSelector from './ThemeSelector';
import { useState, useEffect } from 'react';
import { 
  Bars3Icon,
  XMarkIcon,
  AdjustmentsHorizontalIcon,
  PencilIcon,
  BookOpenIcon 
} from '@heroicons/react/24/outline';

const Header: React.FC = () => {
  const selectedLevel = useAppStore((state) => state.selectedLevel);
  const { focusMode } = useFocusMode();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  
  const navItems = [
    {
      path: '/level',
      label: 'Level',
      icon: AdjustmentsHorizontalIcon,
      emoji: '⚙️'
    },
    {
      path: '/write',
      label: 'Write',
      icon: PencilIcon,
      emoji: '✍️'
    },
    {
      path: '/flashcards',
      label: 'Cards',
      icon: BookOpenIcon,
      emoji: '🃏'
    }
  ];

  // Body scroll lock effect for drawer
  useEffect(() => {
    if (isMenuOpen) {
      // Prevent body scroll when drawer is open
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = `${window.innerWidth - document.documentElement.clientWidth}px`;
    } else {
      // Restore body scroll when drawer is closed
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    };
  }, [isMenuOpen]);

  // Keyboard accessibility - close drawer with ESC key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isMenuOpen) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMenuOpen]);

  return (
    <AnimatePresence>
      {!focusMode && (
        <motion.header
          initial={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -100 }}
          transition={{ duration: 0.3 }}
          className="glass-card border-0 sticky top-0 z-50 safe-area-inset-top mb-4 mx-4 mt-4 rounded-2xl"
        >
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
          
          <div className="flex items-center space-x-3 shrink-0">
            <ThemeSelector />
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="flex items-center justify-center w-12 h-12 rounded-xl text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 focus-ring"
              style={{ 
                minWidth: '48px', 
                minHeight: '48px',
                background: 'var(--gradient-primary)' 
              }}
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={isMenuOpen}
            >
              {isMenuOpen ? (
                <XMarkIcon className="w-6 h-6" />
              ) : (
                <Bars3Icon className="w-6 h-6" />
              )}
            </button>
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
        </motion.header>
      )}
      
      {/* Right-side menu toolbar */}
      <AnimatePresence>
        {isMenuOpen && !focusMode && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
              onClick={() => setIsMenuOpen(false)}
              style={{ touchAction: 'none' }}
            />
            
            {/* Navigation Drawer */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed top-0 left-0 h-full w-80 max-w-[85vw] bg-white shadow-2xl z-50 overflow-hidden"
              style={{
                boxShadow: '4px 0 20px rgba(0, 0, 0, 0.15)',
                maxHeight: '100vh',
                maxHeight: '100dvh' // Use dynamic viewport height for mobile
              }}
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-8 text-white">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    <span className="text-2xl">🇯🇵</span>
                  </div>
                  <button
                    onClick={() => setIsMenuOpen(false)}
                    className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                    aria-label="Close menu"
                  >
                    <XMarkIcon className="w-6 h-6" />
                  </button>
                </div>
                <h2 className="text-xl font-semibold mb-1">Kanji Trainer</h2>
                <p className="text-white/80 text-sm">Learn Japanese Characters</p>
                {selectedLevel && (
                  <div className="mt-3 inline-flex items-center px-3 py-1 bg-white/20 rounded-full text-sm font-medium">
                    Current Level: {selectedLevel}
                  </div>
                )}
              </div>

              {/* Navigation List */}
              <div className="flex-1 py-4">
                <nav>
                  <ul className="space-y-1 px-4">
                    {navItems.map((item) => {
                      const isActive = location.pathname === item.path;
                      const Icon = item.icon;
                      
                      return (
                        <li key={item.path}>
                          <Link
                            to={item.path}
                            onClick={() => setIsMenuOpen(false)}
                            className={`flex items-center gap-4 px-4 py-4 rounded-xl transition-all duration-200 group ${
                              isActive
                                ? 'bg-blue-50 text-blue-600 border-r-4 border-blue-600'
                                : 'hover:bg-gray-50 text-gray-700 hover:text-gray-900'
                            }`}
                          >
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                              isActive 
                                ? 'bg-blue-100 text-blue-600' 
                                : 'bg-gray-100 text-gray-600 group-hover:bg-blue-50 group-hover:text-blue-600'
                            }`}>
                              <Icon className="w-5 h-5" strokeWidth={2} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-base truncate">{item.label}</span>
                                <span className="text-lg flex-shrink-0">{item.emoji}</span>
                              </div>
                            </div>
                            {isActive && (
                              <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                            )}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </nav>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-gray-100">
                <div className="text-center text-sm text-gray-500">
                  <div className="font-medium">Japanese Kanji Learning</div>
                  <div className="text-xs mt-1">Master JLPT Characters</div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </AnimatePresence>
  );
};

export default Header;