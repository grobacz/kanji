import { describe, it, expect } from 'vitest';
import { StrokeValidator, validateKanjiDrawing, StrokeData } from './strokeValidation';
import type { Kanji } from '../types';

const mockKanji: Kanji = {
  id: 'test-1',
  character: '一',
  level: 'N5',
  meanings: ['one'],
  readings: {
    onyomi: ['イチ'],
    kunyomi: ['ひと'],
  },
  strokes: 1,
  frequency: 1,
};

const complexKanji: Kanji = {
  id: 'test-2',
  character: '漢',
  level: 'N2',
  meanings: ['Chinese character'],
  readings: {
    onyomi: ['カン'],
    kunyomi: ['から'],
  },
  strokes: 13,
  frequency: 1250,
};

const createMockStroke = (points: number[][], duration = 1000): StrokeData => ({
  points,
  startTime: Date.now() - duration,
  endTime: Date.now(),
});

describe('StrokeValidator', () => {
  describe('validateStrokes', () => {
    it('should validate correct stroke count', () => {
      const validator = new StrokeValidator(mockKanji);
      const strokes = [createMockStroke([[0, 0], [100, 0]])]; // One horizontal stroke
      
      const result = validator.validateStrokes(strokes);
      
      expect(result.strokeCount.correct).toBe(true);
      expect(result.strokeCount.expected).toBe(1);
      expect(result.strokeCount.actual).toBe(1);
    });

    it('should detect incorrect stroke count', () => {
      const validator = new StrokeValidator(mockKanji);
      const strokes = [
        createMockStroke([[0, 0], [100, 0]]),
        createMockStroke([[0, 50], [100, 50]]),
      ]; // Two strokes for a one-stroke kanji
      
      const result = validator.validateStrokes(strokes);
      
      expect(result.strokeCount.correct).toBe(false);
      expect(result.strokeCount.expected).toBe(1);
      expect(result.strokeCount.actual).toBe(2);
    });

    it('should validate reasonable timing', () => {
      const validator = new StrokeValidator(mockKanji);
      const strokes = [createMockStroke([[0, 0], [100, 0]], 500)]; // 500ms stroke
      
      const result = validator.validateStrokes(strokes);
      
      expect(result.timing.reasonable).toBe(true);
      expect(result.timing.totalTime).toBe(500);
      expect(result.timing.averageStrokeTime).toBe(500);
    });

    it('should detect unreasonable timing (too fast)', () => {
      const validator = new StrokeValidator(mockKanji);
      const strokes = [createMockStroke([[0, 0], [100, 0]], 50)]; // 50ms stroke (too fast)
      
      const result = validator.validateStrokes(strokes);
      
      expect(result.timing.reasonable).toBe(false);
    });

    it('should detect unreasonable timing (too slow)', () => {
      const validator = new StrokeValidator(mockKanji);
      const strokes = [createMockStroke([[0, 0], [100, 0]], 6000)]; // 6s stroke (too slow)
      
      const result = validator.validateStrokes(strokes);
      
      expect(result.timing.reasonable).toBe(false);
    });

    it('should validate adequate coverage', () => {
      const validator = new StrokeValidator(mockKanji, 400, 400);
      const strokes = [
        createMockStroke([[50, 50], [350, 350]]) // Diagonal stroke covering good area
      ];
      
      const result = validator.validateStrokes(strokes);
      
      expect(result.coverage.adequate).toBe(true);
      expect(result.coverage.percentage).toBeGreaterThan(10);
    });

    it('should detect inadequate coverage', () => {
      const validator = new StrokeValidator(mockKanji, 400, 400);
      const strokes = [
        createMockStroke([[190, 190], [210, 210]]) // Very small stroke in center
      ];
      
      const result = validator.validateStrokes(strokes);
      
      expect(result.coverage.adequate).toBe(false);
      expect(result.coverage.percentage).toBeLessThan(5);
    });

    it('should generate appropriate feedback for perfect attempt', () => {
      const validator = new StrokeValidator(mockKanji);
      const strokes = [createMockStroke([[50, 200], [350, 200]], 800)]; // Perfect horizontal stroke
      
      const result = validator.validateStrokes(strokes);
      
      expect(result.feedback.some(f => f.includes('✓'))).toBe(true);
      expect(result.score).toBeGreaterThanOrEqual(70);
      expect(result.isValid).toBe(true);
    });

    it('should generate helpful feedback for poor attempt', () => {
      const validator = new StrokeValidator(complexKanji);
      const strokes = [createMockStroke([[200, 200], [201, 201]], 50)]; // Tiny, fast stroke
      
      const result = validator.validateStrokes(strokes);
      
      expect(result.feedback.length).toBeGreaterThan(0);
      expect(result.score).toBeLessThan(50);
      expect(result.isValid).toBe(false);
      expect(result.feedback.some(f => f.includes('strokes'))).toBe(true);
    });

    it('should handle empty strokes', () => {
      const validator = new StrokeValidator(mockKanji);
      const result = validator.validateStrokes([]);
      
      expect(result.strokeCount.actual).toBe(0);
      expect(result.timing.reasonable).toBe(false);
      expect(result.coverage.adequate).toBe(false);
      expect(result.score).toBeLessThanOrEqual(40);
      expect(result.isValid).toBe(false);
    });

    it('should calculate score correctly', () => {
      const validator = new StrokeValidator(mockKanji);
      
      // Perfect attempt
      const perfectStrokes = [createMockStroke([[50, 200], [350, 200]], 800)];
      const perfectResult = validator.validateStrokes(perfectStrokes);
      expect(perfectResult.score).toBeGreaterThanOrEqual(70);
      
      // Poor attempt
      const poorStrokes = [
        createMockStroke([[200, 200], [201, 201]], 50),
        createMockStroke([[202, 202], [203, 203]], 50),
      ];
      const poorResult = validator.validateStrokes(poorStrokes);
      expect(poorResult.score).toBeLessThan(40);
    });
  });

  describe('direction validation', () => {
    it('should prefer top-to-bottom strokes', () => {
      const validator = new StrokeValidator(mockKanji);
      
      const topToBottomStroke = [createMockStroke([[200, 50], [200, 350]])];
      const bottomToTopStroke = [createMockStroke([[200, 350], [200, 50]])];
      
      const topToBottomResult = validator.validateStrokes(topToBottomStroke);
      const bottomToTopResult = validator.validateStrokes(bottomToTopStroke);
      
      expect(topToBottomResult.score).toBeGreaterThanOrEqual(bottomToTopResult.score);
    });

    it('should be lenient for simple kanji', () => {
      const validator = new StrokeValidator(mockKanji);
      const anyDirectionStroke = [createMockStroke([[350, 200], [50, 200]])]; // Right to left
      
      const result = validator.validateStrokes(anyDirectionStroke);
      
      expect(result.score).toBeGreaterThan(0); // Should still get some credit
    });
  });
});

describe('validateKanjiDrawing utility function', () => {
  it('should work as a convenient wrapper', () => {
    const strokes = [createMockStroke([[50, 200], [350, 200]], 800)];
    
    const result = validateKanjiDrawing(mockKanji, strokes, 400, 400);
    
    expect(result).toBeDefined();
    expect(result.score).toBeGreaterThan(0);
    expect(result.strokeCount.expected).toBe(1);
    expect(result.feedback.length).toBeGreaterThan(0);
  });
});