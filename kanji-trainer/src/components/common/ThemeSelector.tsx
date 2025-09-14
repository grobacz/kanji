import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SwatchIcon, CheckIcon } from '@heroicons/react/24/outline';
import { useTheme } from '../../hooks/useTheme';
import { useFeedback } from '../../hooks/useFeedback';

const ThemeSelector: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { currentTheme, setTheme, availableThemes } = useTheme();
  const feedback = useFeedback();

  const handleThemeSelect = (themeId: string) => {
    feedback.buttonClick();
    setTheme(themeId);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center w-12 h-12 rounded-xl text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 focus-ring"
        style={{ 
          minWidth: '48px', 
          minHeight: '48px',
          background: 'var(--gradient-primary)' 
        }}
        aria-label="Change theme"
        title="Change theme"
      >
        <SwatchIcon className="w-6 h-6" />
      </button>

      {/* Theme Options */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            
            {/* Theme Panel */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -20 }}
              transition={{ duration: 0.2 }}
              className="absolute top-full mt-2 right-0 z-50 w-80 glass-card rounded-2xl shadow-2xl border border-white/20 overflow-hidden"
            >
              <div className="p-4 border-b border-white/10">
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
                  Choose Theme
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  Select a visual style for your learning experience
                </p>
              </div>
              
              <div className="max-h-96 overflow-y-auto">
                {availableThemes.map((theme) => {
                  const isSelected = currentTheme.id === theme.id;
                  
                  return (
                    <motion.button
                      key={theme.id}
                      whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
                      onClick={() => handleThemeSelect(theme.id)}
                      className={`w-full p-4 text-left transition-all duration-200 border-b border-white/5 last:border-b-0 ${
                        isSelected ? 'bg-white/10' : 'hover:bg-white/5'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            {/* Theme Color Preview */}
                            <div className="flex space-x-1">
                              <div
                                className="w-4 h-4 rounded-full"
                                style={{ backgroundColor: theme.colors.primary }}
                              />
                              <div
                                className="w-4 h-4 rounded-full"
                                style={{ backgroundColor: theme.colors.secondary }}
                              />
                              <div
                                className="w-4 h-4 rounded-full"
                                style={{ backgroundColor: theme.colors.accent }}
                              />
                            </div>
                            
                            <h4 className="font-semibold text-slate-800 dark:text-slate-200">
                              {theme.name}
                            </h4>
                          </div>
                          
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            {theme.description}
                          </p>
                        </div>
                        
                        {isSelected && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.1, type: 'spring' }}
                            className="ml-3"
                          >
                            <div className="w-6 h-6 bg-success-500 rounded-full flex items-center justify-center">
                              <CheckIcon className="w-4 h-4 text-white" />
                            </div>
                          </motion.div>
                        )}
                      </div>
                      
                      {/* Theme Preview */}
                      <div className="mt-3 p-3 rounded-lg border border-white/10 overflow-hidden">
                        <div
                          className="h-12 rounded-md mb-2 opacity-80"
                          style={{ background: theme.gradients.primary }}
                        />
                        <div className="flex space-x-2">
                          <div
                            className="flex-1 h-2 rounded"
                            style={{ backgroundColor: theme.colors.surface }}
                          />
                          <div
                            className="w-8 h-2 rounded"
                            style={{ backgroundColor: theme.colors.accent }}
                          />
                        </div>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
              
              <div className="p-4 border-t border-white/10 text-center">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Your theme preference is saved automatically
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ThemeSelector;