import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAppStore } from '../store/appStore';

export const useFocusMode = () => {
  const location = useLocation();
  const focusMode = useAppStore((state) => state.focusMode);
  const setFocusMode = useAppStore((state) => state.setFocusMode);

  // Auto-enable focus mode for practice routes
  useEffect(() => {
    const practicePaths = ['/write', '/flashcards'];
    const isPracticePage = practicePaths.includes(location.pathname);
    
    if (isPracticePage && !focusMode) {
      // Small delay to allow page transition
      setTimeout(() => setFocusMode(true), 500);
    } else if (!isPracticePage && focusMode) {
      setFocusMode(false);
    }
  }, [location.pathname, focusMode, setFocusMode]);

  // Keyboard shortcut to toggle focus mode (F key)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'f' || event.key === 'F') {
        // Only on practice pages
        const practicePaths = ['/write', '/flashcards'];
        if (practicePaths.includes(location.pathname)) {
          event.preventDefault();
          setFocusMode(!focusMode);
        }
      }
      
      // Escape key to exit focus mode
      if (event.key === 'Escape' && focusMode) {
        setFocusMode(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [focusMode, setFocusMode, location.pathname]);

  return {
    focusMode,
    setFocusMode,
    toggleFocusMode: () => setFocusMode(!focusMode),
  };
};