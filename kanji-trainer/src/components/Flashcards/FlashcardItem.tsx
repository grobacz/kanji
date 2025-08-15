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
    <div className="relative w-full perspective-1000" style={{ height: 'clamp(300px, 50vh, 400px)' }}>
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
          <div className="flex flex-col h-full p-4 sm:p-6">
            {/* Header with kanji */}
            <div className="text-center mb-4">
              <div className="text-3xl sm:text-4xl font-bold text-gray-900 kanji-text">
                {kanji.character}
              </div>
            </div>
            
            {/* Primary focus - Meanings */}
            <div className="flex-1 flex flex-col justify-center mb-4">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 text-center">
                Meanings
              </h3>
              <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
                {kanji.meanings.map((meaning, index) => (
                  <span
                    key={index}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-base sm:text-lg font-semibold shadow-sm"
                  >
                    {meaning}
                  </span>
                ))}
              </div>
            </div>

            {/* Secondary - Readings (expandable design) */}
            <details className="mb-4 group">
              <summary className="cursor-pointer text-center text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors list-none">
                <span className="inline-flex items-center gap-2 bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-lg transition-colors">
                  <span>📖</span>
                  Show readings
                  <span className="group-open:rotate-180 transition-transform">▼</span>
                </span>
              </summary>
              <div className="mt-3 space-y-3 animate-fade-in">
                {kanji.readings.onyomi.length > 0 && (
                  <div>
                    <h4 className="text-xs font-medium text-gray-600 mb-2 flex items-center justify-center gap-2">
                      <span className="text-red-600">🇨🇳</span>
                      On'yomi (Chinese reading)
                    </h4>
                    <div className="flex flex-wrap justify-center gap-1">
                      {kanji.readings.onyomi.map((reading, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-red-100 text-red-800 rounded text-sm border border-red-200"
                        >
                          {reading}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {kanji.readings.kunyomi.length > 0 && (
                  <div>
                    <h4 className="text-xs font-medium text-gray-600 mb-2 flex items-center justify-center gap-2">
                      <span className="text-green-600">🇯🇵</span>
                      Kun'yomi (Japanese reading)
                    </h4>
                    <div className="flex flex-wrap justify-center gap-1">
                      {kanji.readings.kunyomi.map((reading, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm border border-green-200"
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
            <div className="text-center text-xs text-gray-500 bg-white/50 px-3 py-2 rounded-lg">
              <span className="inline-flex items-center gap-3">
                <span>✏️ {kanji.strokes} strokes</span>
                <span>📚 Level {kanji.level}</span>
                {kanji.frequency && <span>📊 #{kanji.frequency}</span>}
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default FlashcardItem;