import { motion } from 'framer-motion';
import { Kanji } from '../../types';

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
  return (
    <div className="relative w-full h-96 perspective-1000">
      <motion.div
        className="relative w-full h-full preserve-3d cursor-pointer"
        onClick={onToggleAnswer}
        animate={{ rotateY: showAnswer ? 180 : 0 }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Front of card - Kanji character */}
        <div
          className="absolute inset-0 w-full h-full backface-hidden bg-white rounded-xl shadow-lg border-2 border-gray-200 flex flex-col items-center justify-center"
          style={{ backfaceVisibility: "hidden" }}
        >
          <div className="text-center">
            <div className="text-8xl font-bold mb-4 text-gray-900 kanji-text">
              {kanji.character}
            </div>
            <div className="text-sm text-gray-500 font-medium">
              Tap to reveal meaning
            </div>
          </div>
        </div>

        {/* Back of card - Meanings and readings */}
        <div
          className="absolute inset-0 w-full h-full backface-hidden bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl shadow-lg border-2 border-blue-200 flex flex-col items-center justify-center"
          style={{ 
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)"
          }}
        >
          <div className="text-center p-6">
            <div className="text-4xl font-bold mb-4 text-gray-900 kanji-text">
              {kanji.character}
            </div>
            
            {/* Meanings */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                Meanings
              </h3>
              <div className="flex flex-wrap justify-center gap-2">
                {kanji.meanings.map((meaning, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-200 text-blue-800 rounded-full text-sm font-medium"
                  >
                    {meaning}
                  </span>
                ))}
              </div>
            </div>

            {/* Readings */}
            <div className="space-y-3">
              {kanji.readings.onyomi.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-600 mb-1">
                    On'yomi (Chinese reading)
                  </h4>
                  <div className="flex flex-wrap justify-center gap-1">
                    {kanji.readings.onyomi.map((reading, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-red-100 text-red-800 rounded text-sm"
                      >
                        {reading}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {kanji.readings.kunyomi.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-600 mb-1">
                    Kun'yomi (Japanese reading)
                  </h4>
                  <div className="flex flex-wrap justify-center gap-1">
                    {kanji.readings.kunyomi.map((reading, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm"
                      >
                        {reading}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-4 text-xs text-gray-500">
              {kanji.strokes} strokes • Level {kanji.level}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default FlashcardItem;