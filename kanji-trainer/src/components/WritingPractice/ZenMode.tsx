import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, ArrowsPointingOutIcon } from '@heroicons/react/24/outline';
import DrawingCanvas from './DrawingCanvas';
import { useFeedback } from '../../hooks/useFeedback';
import type { Kanji } from '../../types';

interface ZenModeProps {
  kanji: Kanji;
  isOpen: boolean;
  onClose: () => void;
}

interface DrawingCanvasRef {
  clear: () => void;
}

const ZenMode: React.FC<ZenModeProps> = ({ kanji, isOpen, onClose }) => {
  const [showHint, setShowHint] = useState(false);
  const [strokeCount, setStrokeCount] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const canvasRef = useRef<DrawingCanvasRef>(null);
  const feedback = useFeedback();
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle fullscreen
  const toggleFullscreen = useCallback(async () => {
    if (!containerRef.current) return;

    try {
      if (!isFullscreen) {
        await containerRef.current.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch {
      console.log('Fullscreen not supported');
    }
  }, [isFullscreen]);

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (isFullscreen) {
          toggleFullscreen();
        } else {
          onClose();
        }
      } else if (event.key === 'h' || event.key === 'H') {
        setShowHint(!showHint);
      } else if (event.key === 'c' || event.key === 'C') {
        handleClear();
      } else if (event.key === 'f' || event.key === 'F') {
        event.preventDefault();
        toggleFullscreen();
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, isFullscreen, showHint, onClose, toggleFullscreen, handleClear]);

  const handleStrokeComplete = () => {
    setStrokeCount(prev => prev + 1);
    feedback.drawing();
  };

  const handleClear = useCallback(() => {
    canvasRef.current?.clear();
    setStrokeCount(0);
    feedback.buttonClick();
  }, [feedback]);

  const handleClose = () => {
    feedback.buttonClick();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={containerRef}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center overflow-hidden"
          style={{
            background: isFullscreen 
              ? 'radial-gradient(circle at center, #1e293b 0%, #0f172a 100%)'
              : 'radial-gradient(circle at center, #334155 0%, #1e293b 100%)'
          }}
        >
          {/* Ambient background elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-teal-500/3 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
          </div>

          {/* Controls - only show if not fullscreen */}
          {!isFullscreen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="absolute top-6 right-6 flex items-center space-x-4 z-10"
            >
              <button
                onClick={toggleFullscreen}
                className="p-3 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full text-white/80 hover:text-white transition-all duration-200"
                aria-label="Enter fullscreen"
              >
                <ArrowsPointingOutIcon className="w-5 h-5" />
              </button>
              <button
                onClick={handleClose}
                className="p-3 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full text-white/80 hover:text-white transition-all duration-200"
                aria-label="Close Zen Mode"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </motion.div>
          )}

          {/* Main content */}
          <div className="flex flex-col items-center justify-center w-full h-full p-8 relative">
            {/* Kanji display */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="mb-8 text-center"
            >
              <div className="text-6xl sm:text-7xl md:text-8xl font-bold text-white/90 mb-4 tracking-wider">
                {kanji.character}
              </div>
              
              <AnimatePresence>
                {showHint && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="text-white/70 text-lg max-w-md mx-auto"
                  >
                    <div className="mb-2">{kanji.meanings.join(' • ')}</div>
                    <div className="text-sm text-white/50">{kanji.strokes} strokes</div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Canvas */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="relative"
            >
              <div className="bg-white/95 rounded-2xl shadow-2xl p-2 backdrop-blur-sm">
                <DrawingCanvas
                  ref={canvasRef}
                  width={isFullscreen ? 500 : 400}
                  height={isFullscreen ? 500 : 400}
                  onStrokeComplete={handleStrokeComplete}
                  onClear={() => {}}
                  disabled={false}
                />
              </div>
              
              {/* Stroke counter */}
              <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 px-3 py-1 bg-black/50 backdrop-blur-md rounded-full">
                <span className="text-white/80 text-sm">
                  {strokeCount} / {kanji.strokes}
                </span>
              </div>
            </motion.div>

            {/* Subtle instructions */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 1 }}
              className="mt-12 text-center text-white/40 text-sm space-y-2"
            >
              <div>Press H for hint • C to clear • F for fullscreen • ESC to exit</div>
              <div className="text-xs">Focus on the flow and rhythm of each stroke</div>
            </motion.div>
          </div>

          {/* Fullscreen controls overlay */}
          {isFullscreen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex items-center space-x-6 bg-black/30 backdrop-blur-md rounded-full px-6 py-3"
            >
              <button
                onClick={() => setShowHint(!showHint)}
                className={`px-4 py-2 rounded-full text-sm transition-all duration-200 ${
                  showHint 
                    ? 'bg-white/20 text-white' 
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                Hint
              </button>
              <button
                onClick={handleClear}
                className="px-4 py-2 rounded-full text-sm text-white/70 hover:text-white hover:bg-white/10 transition-all duration-200"
              >
                Clear
              </button>
              <button
                onClick={toggleFullscreen}
                className="px-4 py-2 rounded-full text-sm text-white/70 hover:text-white hover:bg-white/10 transition-all duration-200"
              >
                Exit Fullscreen
              </button>
              <button
                onClick={handleClose}
                className="px-4 py-2 rounded-full text-sm text-white/70 hover:text-white hover:bg-white/10 transition-all duration-200"
              >
                Exit Zen
              </button>
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ZenMode;