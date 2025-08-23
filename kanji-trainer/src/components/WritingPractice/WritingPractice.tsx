import { useState, useEffect, useRef } from 'react';
import { useAppStore } from '../../store/appStore';
import { useKanjiByLevel } from '../../hooks/useKanjiData';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import DrawingCanvas from './DrawingCanvas';
import KanjiReference from './KanjiReference';
import ZenMode from './ZenMode';
// import { validateKanjiDrawing, StrokeData, ValidationResult } from '../../utils/strokeValidation';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import LoadingSpinner from '../common/LoadingSpinner';
import { useFeedback } from '../../hooks/useFeedback';
import toast from 'react-hot-toast';

interface DrawingCanvasRef {
  clear: () => void;
}

interface StrokeData {
  points: number[][];
  startTime: number;
  endTime: number;
}

interface ValidationResult {
  score: number;
  isValid: boolean;
  feedback: string[];
  strokeCount: { actual: number; expected: number; correct: boolean };
  coverage: { percentage: number; adequate: boolean };
  timing: { totalTime: number; averageStrokeTime: number; reasonable: boolean };
}

const WritingPractice: React.FC = () => {
  const selectedLevel = useAppStore((state) => state.selectedLevel);
  const { data: kanjiData, isLoading, error } = useKanjiByLevel(selectedLevel);
  
  const [currentKanjiIndex, setCurrentKanjiIndex] = useState(0);
  const [strokes, setStrokes] = useState<StrokeData[]>([]);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [showReference, setShowReference] = useState(false);
  const [sessionStats, setSessionStats] = useState({ attempts: 0, goodAttempts: 0 });
  const [zenMode, setZenMode] = useState(false);
  const canvasRef = useRef<DrawingCanvasRef>(null);
  const feedback = useFeedback();

  const currentKanji = kanjiData?.[currentKanjiIndex];

  // Reset when kanji changes
  useEffect(() => {
    setStrokes([]);
    setValidationResult(null);
    setShowReference(false);
    canvasRef.current?.clear(); // Clear canvas when kanji changes
  }, [currentKanjiIndex]);

  const handleStrokeComplete = (strokePoints: number[][]) => {
    if (!strokePoints.length) return;
    
    const now = Date.now();
    const newStroke = {
      points: strokePoints,
      startTime: now - 500, // Approximate stroke duration
      endTime: now,
    };
    
    setStrokes(prev => [...prev, newStroke]);
    feedback.drawing(); // Subtle haptic feedback for drawing
  };

  const handleClear = () => {
    setStrokes([]);
    setValidationResult(null);
    canvasRef.current?.clear(); // Clear canvas via ref
    feedback.buttonClick();
    toast.success('Canvas cleared');
  };

  const handleValidate = async () => {
    if (!currentKanji || strokes.length === 0) {
      toast.error('Please draw something first');
      return;
    }

    setIsValidating(true);
    
    // Simulate processing time for better UX
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Temporary mock result for dev environment
    const result = {
      score: Math.floor(Math.random() * 40) + 60, // Random score 60-100
      isValid: true,
      feedback: ['✓ Good attempt!', 'Canvas is working in development!'],
      strokeCount: { actual: strokes.length, expected: currentKanji.strokes, correct: true },
      coverage: { percentage: 75, adequate: true },
      timing: { totalTime: 2000, averageStrokeTime: 500, reasonable: true }
    };
    
    setValidationResult(result);
    setIsValidating(false);
    
    // Update stats
    setSessionStats(prev => ({
      attempts: prev.attempts + 1,
      goodAttempts: prev.goodAttempts + (result.score >= 70 ? 1 : 0)
    }));

    // Show toast feedback with haptic/sound
    if (result.score >= 90) {
      feedback.success();
      toast.success('Excellent! 🎉');
    } else if (result.score >= 70) {
      feedback.success();
      toast.success('Good job! 👏');
    } else {
      feedback.buttonClick();
      toast('Keep practicing! 💪', { icon: '📝' });
    }
  };

  const handleNextKanji = () => {
    if (!kanjiData || currentKanjiIndex >= kanjiData.length - 1) return;
    feedback.buttonClick();
    setCurrentKanjiIndex(prev => prev + 1);
  };

  const handlePreviousKanji = () => {
    if (currentKanjiIndex <= 0) return;
    feedback.buttonClick();
    setCurrentKanjiIndex(prev => prev - 1);
  };


  if (!selectedLevel) {
    return (
      <div className="w-full max-w-2xl mx-auto text-center">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-yellow-800 mb-4">
            Please Select a Level First
          </h2>
          <p className="text-yellow-700 mb-4">
            You need to choose a JLPT level before starting writing practice.
          </p>
          <Link
            to="/level"
            className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Level Selection
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="w-full max-w-4xl mx-auto text-center">
        <LoadingSpinner />
        <p className="text-gray-600 mt-4">Loading kanji data...</p>
      </div>
    );
  }

  if (error || !kanjiData || kanjiData.length === 0) {
    return (
      <div className="w-full max-w-4xl mx-auto text-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-red-800 mb-4">
            Error Loading Kanji Data
          </h2>
          <p className="text-red-700 mb-4">
            Unable to load kanji data for level {selectedLevel}.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Writing Practice - Level {selectedLevel}
        </h2>
        <p className="text-gray-600 text-lg">
          Practice writing kanji characters with stroke validation
        </p>
        
        {/* Session stats */}
        {sessionStats.attempts > 0 && (
          <div className="mt-4 text-sm text-gray-600">
            Session: {sessionStats.goodAttempts}/{sessionStats.attempts} good attempts
            {sessionStats.attempts >= 3 && (
              <span className="ml-2">
                ({Math.round((sessionStats.goodAttempts / sessionStats.attempts) * 100)}% accuracy)
              </span>
            )}
          </div>
        )}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - Kanji info and reference */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-center mb-4">
              <div className="font-bold mb-4 kanji-text kanji-xl text-gray-900">
                {currentKanji.character}
              </div>
              <div className="space-y-2 text-sm text-gray-600">
                <div><strong>Meanings:</strong> {currentKanji.meanings.join(', ')}</div>
                <div><strong>Strokes:</strong> {currentKanji.strokes}</div>
                <div><strong>Level:</strong> {currentKanji.level}</div>
              </div>
            </div>
            
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '16px', 
              width: '100%', 
              margin: '0 auto',
              padding: '8px 0'
            }}>
              <button
                onClick={handlePreviousKanji}
                disabled={currentKanjiIndex === 0}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  width: '150px',
                  height: '50px',
                  padding: '0',
                  margin: '0',
                  backgroundColor: currentKanjiIndex === 0 ? '#f3f4f6' : '#ffffff',
                  color: currentKanjiIndex === 0 ? '#9ca3af' : '#374151',
                  border: currentKanjiIndex === 0 ? '1px solid #d1d5db' : '1px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: currentKanjiIndex === 0 ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                  flexShrink: 0,
                  flexGrow: 0,
                  boxSizing: 'border-box'
                }}
              >
                <ChevronLeftIcon style={{ width: '16px', height: '16px', flexShrink: 0 }} />
                <span style={{ flexShrink: 0 }}>Previous</span>
              </button>

              <button
                onClick={handleNextKanji}
                disabled={currentKanjiIndex >= kanjiData.length - 1}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  width: '150px',
                  height: '50px',
                  padding: '0',
                  margin: '0',
                  backgroundColor: currentKanjiIndex >= kanjiData.length - 1 ? '#f3f4f6' : '#ffffff',
                  color: currentKanjiIndex >= kanjiData.length - 1 ? '#9ca3af' : '#374151',
                  border: currentKanjiIndex >= kanjiData.length - 1 ? '1px solid #d1d5db' : '1px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: currentKanjiIndex >= kanjiData.length - 1 ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                  flexShrink: 0,
                  flexGrow: 0,
                  boxSizing: 'border-box'
                }}
              >
                <span style={{ flexShrink: 0 }}>Next</span>
                <ChevronRightIcon style={{ width: '16px', height: '16px', flexShrink: 0 }} />
              </button>
            </div>
          </div>

          {/* Toggle reference */}
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-base font-semibold text-gray-900">Stroke Reference</h3>
              <button
                onClick={() => setShowReference(!showReference)}
                className="px-3 py-1 text-sm bg-blue-100 hover:bg-blue-200 text-blue-700 rounded transition-colors"
              >
                {showReference ? 'Hide' : 'Show'}
              </button>
            </div>
            
            <AnimatePresence>
              {showReference && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <KanjiReference kanji={currentKanji} size={180} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Center column - Drawing canvas */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-lg shadow-md p-4"
        >
          <h3 className="text-base font-semibold text-gray-900 mb-3 text-center">
            Draw Here
          </h3>
          
          <div className="flex justify-center mb-4">
            <DrawingCanvas
              ref={canvasRef}
              width={400}
              height={400}
              onStrokeComplete={handleStrokeComplete}
              onClear={() => {}} // Canvas will notify when clearing happens
              disabled={isValidating}
            />
          </div>
          
          <div className="flex justify-center gap-3">
            <button
              onClick={handleClear}
              disabled={isValidating || strokes.length === 0}
              className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Clear
            </button>
            <button
              onClick={() => setZenMode(true)}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              🧘 Zen Mode
            </button>
            <button
              onClick={handleValidate}
              disabled={isValidating || strokes.length === 0}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isValidating ? 'Checking...' : 'Check Drawing'}
            </button>
          </div>
        </motion.div>

        {/* Right column - Validation feedback */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-6"
        >
          <div className="bg-white rounded-lg shadow-md p-4">
            <h3 className="text-base font-semibold text-gray-900 mb-3">Feedback</h3>
            
            <AnimatePresence>
              {validationResult ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-4"
                >
                  {/* Score */}
                  <div className="text-center">
                    <div className={`text-4xl font-bold mb-2 ${
                      validationResult.score >= 90 ? 'text-green-600' :
                      validationResult.score >= 70 ? 'text-blue-600' :
                      validationResult.score >= 50 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {validationResult.score}%
                    </div>
                    <div className="text-sm text-gray-600">
                      {validationResult.isValid ? '✓ Valid attempt' : 'Keep practicing!'}
                    </div>
                  </div>

                  {/* Feedback */}
                  <div className="space-y-2">
                    {validationResult.feedback.map((item, index) => (
                      <div
                        key={index}
                        className={`text-sm p-2 rounded ${
                          item.startsWith('✓') ? 'bg-green-50 text-green-700' : 'bg-blue-50 text-blue-700'
                        }`}
                      >
                        {item}
                      </div>
                    ))}
                  </div>

                  {/* Details */}
                  <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                    <div>Strokes: {validationResult.strokeCount.actual}/{validationResult.strokeCount.expected}</div>
                    <div>Coverage: {validationResult.coverage.percentage}%</div>
                    <div>Time: {Math.round(validationResult.timing.totalTime / 1000)}s</div>
                    <div>Score: {validationResult.score}/100</div>
                  </div>
                </motion.div>
              ) : (
                <div className="text-gray-500 text-center py-8">
                  Draw the kanji and click "Check Drawing" to get feedback
                </div>
              )}
            </AnimatePresence>
          </div>

          {/* Tips */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-2">💡 Tips</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Start from top-left, work down and right</li>
              <li>• Use the full canvas space</li>
              <li>• Take your time with each stroke</li>
              <li>• Check the reference if you're stuck</li>
            </ul>
          </div>
        </motion.div>
      </div>

      {/* Zen Mode */}
      {currentKanji && (
        <ZenMode 
          kanji={currentKanji}
          isOpen={zenMode}
          onClose={() => setZenMode(false)}
        />
      )}
    </div>
  );
};

export default WritingPractice;