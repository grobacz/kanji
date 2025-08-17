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
    <div className="relative w-full perspective-1000" style={{ height: 'clamp(350px, 60vh, 500px)' }}>
      <motion.div
        className="relative w-full h-full preserve-3d cursor-pointer"
        onClick={handleCardClick}
        animate={{ rotateY: showAnswer ? 180 : 0 }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Front of card - Kanji character */}
        <div
          className="absolute inset-0 w-full h-full backface-hidden bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30 rounded-xl shadow-lg border-2 border-gray-200/60 flex flex-col items-center justify-center hover:shadow-xl hover:border-blue-300 hover:from-blue-50/50 hover:to-purple-50/50 transition-all duration-500 group cursor-pointer"
          style={{ backfaceVisibility: "hidden" }}
        >
          <div className="text-center relative flex flex-col items-center justify-center h-full px-4">
            {/* Large, prominent kanji */}
            <div 
              className="font-black mb-6 text-gray-800 kanji-text leading-none transition-transform duration-300 group-hover:scale-105"
              style={{ fontSize: 'clamp(8rem, 20vw, 12rem)' }}
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
        </div>

        {/* Back of card - Meanings and readings */}
        <div
          className="absolute inset-0 w-full h-full backface-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-xl shadow-lg border-2 border-blue-200/60 flex flex-col hover:shadow-xl transition-all duration-500"
          style={{ 
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)"
          }}
        >
          <div className="flex flex-col h-full p-6 overflow-hidden">
            {/* Header with kanji */}
            <div className="text-center mb-6">
              <div className="text-4xl sm:text-5xl font-bold text-gray-900 kanji-text mb-2">
                {kanji.character}
              </div>
              <div className="h-px bg-gradient-to-r from-transparent via-blue-300 to-transparent"></div>
            </div>
            
            {/* Primary focus - Meanings */}
            <div className="flex-1 flex flex-col justify-center mb-6 min-h-0">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 text-center flex-shrink-0 flex items-center justify-center gap-2">
                <span className="text-blue-600">💭</span>
                Meanings
              </h3>
              <div className="flex flex-wrap justify-center gap-3 overflow-y-auto max-h-32">
                {kanji.meanings.map((meaning, index) => (
                  <span
                    key={index}
                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-full text-base font-semibold shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex-shrink-0"
                  >
                    {meaning}
                  </span>
                ))}
              </div>
            </div>

            {/* Secondary - Readings */}
            <details className="mb-4 group flex-shrink-0" open>
              <summary className="cursor-pointer text-center text-sm font-semibold text-gray-700 hover:text-gray-900 transition-colors list-none mb-3">
                <span className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm hover:bg-white px-4 py-2 rounded-full shadow-sm border border-gray-200 transition-all duration-200">
                  <span>📖</span>
                  Readings
                  <span className="group-open:rotate-180 transition-transform duration-200">▼</span>
                </span>
              </summary>
              <div className="space-y-3 animate-fade-in max-h-28 overflow-y-auto">
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
            </details>

            {/* Footer - metadata */}
            <div className="mt-auto text-center text-sm text-gray-600 bg-white/70 backdrop-blur-sm px-4 py-3 rounded-xl flex-shrink-0 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-center gap-4 flex-wrap">
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
        </div>
      </motion.div>
    </div>
  );
};

export default FlashcardItem;