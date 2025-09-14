import { useEffect, useRef, useState, useCallback } from 'react';
import type { Kanji } from '../../types';
import { useHanziWriter } from '../../hooks/useHanziWriter';

interface HanziWriterCharData {
  character: string;
  strokes: string[];
}

interface HanziWriterInstance {
  animateCharacter: (options: { onComplete: () => void }) => void;
}

interface KanjiReferenceProps {
  kanji: Kanji;
  size?: number;
  showAnimation?: boolean;
  animationSpeed?: number;
  onStrokeDataLoaded?: (strokeData: string[]) => void;
}

const KanjiReference: React.FC<KanjiReferenceProps> = ({
  kanji,
  size = 200,
  showAnimation = false,
  animationSpeed = 1,
  onStrokeDataLoaded,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const writerRef = useRef<HanziWriterInstance | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const { isLoaded, HanziWriter } = useHanziWriter();

  // Initialize HanziWriter when loaded
  useEffect(() => {
    if (!isLoaded || !containerRef.current || !HanziWriter) {
      return;
    }

    // Clear previous writer
    if (writerRef.current) {
      containerRef.current.innerHTML = '';
    }

    try {
      writerRef.current = HanziWriter.create(containerRef.current, kanji.character, {
        width: size,
        height: size,
        padding: 20,
        strokeAnimationSpeed: animationSpeed,
        delayBetweenStrokes: 300 / animationSpeed,
        showOutline: true,
        showCharacter: false,
        strokeColor: '#000000',
        radicalColor: '#dc2626',
        outlineColor: '#9ca3af',
        drawingColor: '#059669',
        onLoadCharDataSuccess: (charData: HanziWriterCharData) => {
          // Extract stroke data and pass it to the parent component for validation
          if (onStrokeDataLoaded && charData && charData.strokes) {
            console.info(`✓ KanjiReference loaded stroke data for ${kanji.character} (${charData.strokes.length} strokes)`);
            onStrokeDataLoaded(charData.strokes);
          }
        },
        onLoadCharDataError: (error: Error) => {
          console.warn(`⚠ KanjiReference failed to load stroke data for ${kanji.character}:`, error);
        }
      });
    } catch (error) {
      console.error('Error creating HanziWriter:', error);
      // Fallback: show the character statically
      if (containerRef.current) {
        containerRef.current.innerHTML = `
          <div class="flex items-center justify-center w-full h-full bg-gray-50 border border-gray-200 rounded-lg">
            <span class="text-6xl kanji-text text-gray-700">${kanji.character}</span>
          </div>
        `;
      }
    }
  }, [isLoaded, HanziWriter, kanji.character, size, animationSpeed, onStrokeDataLoaded]);

  const animateStrokes = useCallback(() => {
    if (writerRef.current && !isAnimating) {
      setIsAnimating(true);
      writerRef.current.animateCharacter({
        onComplete: () => {
          setIsAnimating(false);
        }
      });
    }
  }, [isAnimating]);


  // Auto-animate if requested
  useEffect(() => {
    if (showAnimation && isLoaded && HanziWriter && writerRef.current && !isAnimating) {
      const timer = setTimeout(() => {
        animateStrokes();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [showAnimation, isLoaded, HanziWriter, isAnimating, animateStrokes]);

  return (
    <div className="flex flex-col items-center space-y-4">
      <div 
        ref={containerRef} 
        className="border border-gray-200 rounded-lg bg-white"
        style={{ width: size, height: size }}
      />
      
      {isLoaded && HanziWriter && writerRef.current && (
        <div className="flex gap-2">
          <button
            onClick={animateStrokes}
            disabled={isAnimating}
            className={`px-3 py-1 text-sm rounded ${
              isAnimating
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
            } transition-colors`}
          >
            {isAnimating ? 'Animating...' : 'Show Animation'}
          </button>
        </div>
      )}

      {!isLoaded && (
        <div className="text-sm text-gray-500">Loading stroke data...</div>
      )}
    </div>
  );
};

export default KanjiReference;