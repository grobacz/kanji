import { useEffect, useRef, useState, useCallback } from 'react';
import type { Kanji } from '../../types';

declare global {
  interface Window {
    HanziWriter: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  }
}

interface KanjiReferenceProps {
  kanji: Kanji;
  size?: number;
  showAnimation?: boolean;
  animationSpeed?: number;
}

const KanjiReference: React.FC<KanjiReferenceProps> = ({
  kanji,
  size = 200,
  showAnimation = false,
  animationSpeed = 1,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const writerRef = useRef<any>(null); // eslint-disable-line @typescript-eslint/no-explicit-any
  const [isLoaded, setIsLoaded] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // Load HanziWriter script dynamically
  useEffect(() => {
    if (typeof window.HanziWriter !== 'undefined') {
      setIsLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/hanzi-writer@3.7.2/dist/hanzi-writer.min.js';
    script.onload = () => {
      setIsLoaded(true);
    };
    script.onerror = () => {
      console.error('Failed to load HanziWriter');
    };
    document.head.appendChild(script);

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

  // Initialize HanziWriter when loaded
  useEffect(() => {
    if (!isLoaded || !containerRef.current || !window.HanziWriter) {
      return;
    }

    // Clear previous writer
    if (writerRef.current) {
      containerRef.current.innerHTML = '';
    }

    try {
      writerRef.current = window.HanziWriter.create(containerRef.current, kanji.character, {
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
  }, [isLoaded, kanji.character, size, animationSpeed]);

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
    if (showAnimation && isLoaded && writerRef.current && !isAnimating) {
      const timer = setTimeout(() => {
        animateStrokes();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [showAnimation, isLoaded, isAnimating, animateStrokes]);

  return (
    <div className="flex flex-col items-center space-y-4">
      <div 
        ref={containerRef} 
        className="border border-gray-200 rounded-lg bg-white"
        style={{ width: size, height: size }}
      />
      
      {isLoaded && writerRef.current && (
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