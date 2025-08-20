import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useFocusMode } from '../../hooks/useFocusMode';

const FocusExitButton: React.FC = () => {
  const { focusMode, setFocusMode } = useFocusMode();

  return (
    <AnimatePresence>
      {focusMode && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.3 }}
          onClick={() => setFocusMode(false)}
          className="fixed top-4 right-4 z-50 p-3 bg-black/20 hover:bg-black/30 backdrop-blur-md rounded-full text-white/90 hover:text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/50 group"
          style={{
            backdropFilter: 'blur(10px)',
          }}
          aria-label="Exit focus mode"
          title="Exit focus mode (ESC)"
        >
          <XMarkIcon className="w-6 h-6 transition-transform duration-200 group-hover:rotate-90" />
          
          {/* Floating tooltip */}
          <div className="absolute -bottom-10 right-0 px-3 py-1 bg-black/80 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
            Exit Focus (ESC)
          </div>
        </motion.button>
      )}
    </AnimatePresence>
  );
};

export default FocusExitButton;