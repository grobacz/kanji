import { useAppStore } from '../../store/appStore';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useFocusMode } from '../../hooks/useFocusMode';
import ThemeSelector from './ThemeSelector';
import { useState } from 'react';
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
              className="flex items-center justify-center rounded-xl text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 focus-ring"
              style={{ 
                width: '48px', 
                height: '48px', 
                minWidth: '48px', 
                minHeight: '48px',
                background: 'var(--gradient-primary)'
              }}
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={isMenuOpen}
            >
              {isMenuOpen ? (
                <XMarkIcon style={{ width: '24px', height: '24px' }} />
              ) : (
                <Bars3Icon style={{ width: '24px', height: '24px' }} />
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
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
              onClick={() => setIsMenuOpen(false)}
            />
            
            {/* Menu sidebar */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 20, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-72 bg-white backdrop-blur-xl border-l border-gray-200 shadow-2xl z-50"
            >
              <div className="flex flex-col h-full">
                {/* Menu header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">Navigation</h2>
                  <button
                    onClick={() => setIsMenuOpen(false)}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    aria-label="Close menu"
                  >
                    <XMarkIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                  </button>
                </div>
                
                {/* Navigation items */}
                <nav className="flex-1 p-6">
                  <ul className="space-y-3">
                    {navItems.map((item) => {
                      const isActive = location.pathname === item.path;
                      const Icon = item.icon;
                      
                      return (
                        <li key={item.path}>
                          <Link
                            to={item.path}
                            onClick={() => setIsMenuOpen(false)}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 text-base ${
                              isActive
                                ? 'bg-blue-500 text-white shadow-md'
                                : 'hover:bg-gray-100 text-gray-900 hover:text-gray-900'
                            }`}
                          >
                            <div className="flex-shrink-0 relative" style={{width: '20px', height: '20px'}}>
                              <Icon style={{width: '20px', height: '20px'}} strokeWidth={2} />
                            </div>
                            <span className="font-medium">{item.label}</span>
                            <span className="ml-1 text-sm">{item.emoji}</span>
                            {isActive && (
                              <div className="ml-auto w-2 h-2 bg-white rounded-full"></div>
                            )}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </nav>
                
                {/* Footer info */}
                <div className="p-4 border-t border-gray-200/50 dark:border-gray-700/50 bg-gray-50/50 dark:bg-slate-800/50">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-3 text-sm text-gray-600 dark:text-gray-400">
                      <span>🇯🇵</span>
                      <span className="font-medium">Kanji Learning</span>
                    </div>
                    {selectedLevel && (
                      <div className="inline-flex items-center px-3 py-1.5 bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 rounded-full text-xs font-medium shadow-sm">
                        Level {selectedLevel}
                      </div>
                    )}
                  </div>
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