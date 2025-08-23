import { motion } from 'framer-motion';
import { haptics } from '../../utils/haptics';
import type { Kanji } from '../../types';

interface FlashcardItemProps {
  kanji: Kanji;
  showAnswer: boolean;
  onToggleAnswer: () => void;
}

const FlashcardItem: React.FC<FlashcardItemProps> = ({
  kanji,
  showAnswer,
  onToggleAnswer,
}) => {
  const handleCardClick = () => {
    haptics.cardFlip();
    onToggleAnswer();
  };

  return (
    <div className="relative w-full card-height-clamp">
      <div
        className="relative w-full h-full cursor-pointer bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30 rounded-xl shadow-lg border-2 border-gray-200/60 hover:shadow-xl hover:border-blue-300 hover:from-blue-50/50 hover:to-purple-50/50 transition-all duration-500 group"
        onClick={handleCardClick}
      >
        {!showAnswer ? (
          /* Front of card - Kanji character */
          <motion.div
            key="front"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="absolute inset-0 w-full h-full flex flex-col items-center justify-center"
          >
            <div className="text-center relative flex flex-col items-center justify-center h-full px-4">
              {/* Large, prominent kanji */}
              <div 
                className="font-black mb-6 text-gray-800 kanji-text kanji-xl leading-none transition-transform duration-300 group-hover:scale-105"
              >
                {kanji.character}
              </div>
              
              {/* Subtle interaction hint - only shows on hover initially */}
              <div className="opacity-60 group-hover:opacity-100 transition-opacity duration-300">
                <div className="text-sm text-gray-600 font-medium bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-gray-200/60 shadow-sm">
                  <span className="inline-block mr-2 text-blue-500">👆</span>
                  Tap to reveal meaning
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          /* Back of card - Meanings and readings */
          <motion.div
            key="back"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="absolute inset-0 w-full h-full bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-xl border-2 border-blue-200/60 flex flex-col"
          >
            <div className="flex flex-col h-full p-4 sm:p-6 min-h-0">
              {/* Header with kanji - Fixed size */}
              <div className="text-center mb-4 flex-shrink-0">
                <div className="text-3xl sm:text-4xl font-bold text-gray-900 kanji-text mb-2">
                  {kanji.character}
                </div>
                <div className="h-px bg-gradient-to-r from-transparent via-blue-300 to-transparent"></div>
              </div>
              
              {/* Scrollable content area - Takes remaining space */}
              <div className="flex-1 overflow-y-auto min-h-0 space-y-4 p-2">
                {/* Meanings Section */}
                <div className="space-y-2">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-800 text-center flex items-center justify-center gap-2">
                    <span className="text-blue-600">💭</span>
                    Meanings
                  </h3>
                  <div className="flex flex-wrap justify-center gap-4">
                    {/* Handle both array and potentially joined meanings */}
                    {(Array.isArray(kanji.meanings) ? kanji.meanings : kanji.meanings.toString().split(/(?=[A-Z])/)).map((meaning, index) => (
                      <span
                        key={index}
                        className="px-3 py-1.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-full text-sm font-semibold shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex-shrink-0 mr-2"
                        style={{ marginRight: '0.5rem' }}
                      >
                        {meaning}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Readings Section */}
                {(kanji.readings.onyomi.length > 0 || kanji.readings.kunyomi.length > 0) && (
                  <div className="space-y-3">
                    <h3 className="text-lg font-bold text-gray-800 text-center flex items-center justify-center gap-2">
                      <span className="text-gray-600">📖</span>
                      Readings
                    </h3>
                    
                    {kanji.readings.onyomi.length > 0 && (
                      <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 border border-red-200">
                        <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center justify-center gap-2">
                          <span className="text-red-600">🇨🇳</span>
                          On'yomi
                        </h4>
                        <div className="flex flex-wrap justify-center gap-2">
                          {kanji.readings.onyomi.map((reading, index) => (
                            <span
                              key={index}
                              className="px-3 py-1 bg-red-100 text-red-800 rounded-lg text-sm font-medium border border-red-200 shadow-sm"
                            >
                              {reading}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {kanji.readings.kunyomi.length > 0 && (
                      <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 border border-green-200">
                        <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center justify-center gap-2">
                          <span className="text-green-600">🇯🇵</span>
                          Kun'yomi
                        </h4>
                        <div className="flex flex-wrap justify-center gap-2">
                          {kanji.readings.kunyomi.map((reading, index) => (
                            <span
                              key={index}
                              className="px-3 py-1 bg-green-100 text-green-800 rounded-lg text-sm font-medium border border-green-200 shadow-sm"
                            >
                              {reading}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Footer - metadata - Fixed size */}
              <div className="mt-4 text-center text-xs sm:text-sm text-gray-600 bg-white/70 backdrop-blur-sm px-3 py-2 rounded-xl flex-shrink-0 border border-gray-200 shadow-sm">
                <div className="flex items-center justify-center gap-3 sm:gap-4 flex-wrap">
                  <span className="inline-flex items-center gap-1 font-medium">
                    <span className="text-orange-500">✏️</span>
                    {kanji.strokes} strokes
                  </span>
                  <span className="inline-flex items-center gap-1 font-medium">
                    <span className="text-blue-500">📚</span>
                    Level {kanji.level}
                  </span>
                  {kanji.frequency && (
                    <span className="inline-flex items-center gap-1 font-medium">
                      <span className="text-purple-500">📊</span>
                      #{kanji.frequency}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default FlashcardItem;