import type { Kanji } from '../types';

export interface StrokeData {
  points: number[][];
  startTime: number;
  endTime: number;
}

export interface ValidationResult {
  isValid: boolean;
  score: number; // 0-100
  feedback: string[];
  strokeCount: {
    expected: number;
    actual: number;
    correct: boolean;
  };
  timing: {
    totalTime: number;
    averageStrokeTime: number;
    reasonable: boolean;
  };
  coverage: {
    percentage: number;
    adequate: boolean;
  };
}

export class StrokeValidator {
  private kanji: Kanji;
  private canvasWidth: number;
  private canvasHeight: number;

  constructor(kanji: Kanji, canvasWidth = 400, canvasHeight = 400) {
    this.kanji = kanji;
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
  }

  validateStrokes(strokes: StrokeData[]): ValidationResult {
    const strokeCount = this.validateStrokeCount(strokes);
    const timing = this.validateTiming(strokes);
    const coverage = this.validateCoverage(strokes);
    const direction = this.validateStrokeDirection(strokes);

    const feedback = this.generateFeedback(strokeCount, timing, coverage, direction);
    const score = this.calculateScore(strokeCount, timing, coverage, direction);

    return {
      isValid: score >= 60,
      score,
      feedback,
      strokeCount,
      timing,
      coverage,
    };
  }

  private validateStrokeCount(strokes: StrokeData[]) {
    const expected = this.kanji.strokes;
    const actual = strokes.length;
    const correct = actual === expected;

    return {
      expected,
      actual,
      correct,
    };
  }

  private validateTiming(strokes: StrokeData[]) {
    if (strokes.length === 0) {
      return {
        totalTime: 0,
        averageStrokeTime: 0,
        reasonable: false,
      };
    }

    const totalTime = strokes.reduce((sum, stroke) => {
      return sum + (stroke.endTime - stroke.startTime);
    }, 0);

    const averageStrokeTime = totalTime / strokes.length;

    // Reasonable timing: 200ms - 5000ms per stroke
    const minStrokeTime = 200;
    const maxStrokeTime = 5000;
    const reasonable = averageStrokeTime >= minStrokeTime && averageStrokeTime <= maxStrokeTime;

    return {
      totalTime,
      averageStrokeTime,
      reasonable,
    };
  }

  private validateCoverage(strokes: StrokeData[]) {
    if (strokes.length === 0) {
      return {
        percentage: 0,
        adequate: false,
      };
    }

    // Calculate bounding box of all strokes
    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity;

    strokes.forEach(stroke => {
      stroke.points.forEach(([x, y]) => {
        minX = Math.min(minX, x);
        maxX = Math.max(maxX, x);
        minY = Math.min(minY, y);
        maxY = Math.max(maxY, y);
      });
    });

    const drawingWidth = maxX - minX;
    const drawingHeight = maxY - minY;
    const drawingArea = drawingWidth * drawingHeight;

    // Expected area based on canvas size (should use at least 30% of canvas)
    const canvasArea = this.canvasWidth * this.canvasHeight;
    const percentage = Math.min(100, (drawingArea / canvasArea) * 100);

    // Coverage is adequate if it uses reasonable portion of canvas
    // Adjust based on kanji complexity (stroke count)
    const minCoverage = Math.min(15, Math.max(5, this.kanji.strokes * 1.5));
    const adequate = percentage >= minCoverage;

    return {
      percentage: Math.round(percentage),
      adequate,
    };
  }

  private validateStrokeDirection(strokes: StrokeData[]) {
    // Simple heuristic: check if strokes generally follow top-to-bottom, left-to-right pattern
    let topToBottomScore = 0;
    let leftToRightScore = 0;

    strokes.forEach(stroke => {
      if (stroke.points.length < 2) return;

      const start = stroke.points[0];
      const end = stroke.points[stroke.points.length - 1];

      // Check general direction
      const deltaX = end[0] - start[0];
      const deltaY = end[1] - start[1];

      // Prefer strokes that go generally downward or rightward
      if (deltaY >= 0) topToBottomScore += 1;
      if (Math.abs(deltaX) <= Math.abs(deltaY) * 2) leftToRightScore += 1; // Allow some horizontal variation
    });

    const totalStrokes = strokes.length;
    const directionScore = totalStrokes > 0 
      ? (topToBottomScore + leftToRightScore) / (totalStrokes * 2) 
      : 0;

    return {
      score: directionScore,
      reasonable: directionScore >= 0.6 || totalStrokes <= 3, // More lenient for simple kanji
    };
  }

  private generateFeedback(
    strokeCount: { correct: boolean; expected: number; actual: number },
    timing: { reasonable: boolean; averageStrokeTime: number },
    coverage: { adequate: boolean },
    direction: { reasonable: boolean }
  ): string[] {
    const feedback: string[] = [];

    // Stroke count feedback
    if (strokeCount.correct) {
      feedback.push(`✓ Correct number of strokes (${strokeCount.expected})`);
    } else if (strokeCount.actual < strokeCount.expected) {
      feedback.push(`You used ${strokeCount.actual} strokes, but ${this.kanji.character} has ${strokeCount.expected} strokes. Try adding more detail.`);
    } else {
      feedback.push(`You used ${strokeCount.actual} strokes, but ${this.kanji.character} only has ${strokeCount.expected} strokes. Try to be more efficient.`);
    }

    // Timing feedback
    if (timing.reasonable) {
      feedback.push('✓ Good pacing - not too fast or slow');
    } else if (timing.averageStrokeTime < 200) {
      feedback.push('Try slowing down a bit - take time to be deliberate with each stroke');
    } else {
      feedback.push('Good attention to detail - you can try being a bit quicker');
    }

    // Coverage feedback
    if (coverage.adequate) {
      feedback.push('✓ Good use of the writing space');
    } else {
      feedback.push('Try making your kanji larger - use more of the writing area');
    }

    // Direction feedback
    if (direction.reasonable) {
      feedback.push('✓ Good stroke direction');
    } else {
      feedback.push('Remember: Japanese strokes generally go from top to bottom, left to right');
    }

    return feedback;
  }

  private calculateScore(
    strokeCount: { correct: boolean; expected: number; actual: number },
    timing: { reasonable: boolean },
    coverage: { adequate: boolean; percentage: number },
    direction: { score: number }
  ): number {
    let score = 0;

    // Stroke count (40 points max)
    if (strokeCount.correct) {
      score += 40;
    } else {
      const diff = Math.abs(strokeCount.actual - strokeCount.expected);
      const penalty = Math.min(40, diff * 10);
      score += Math.max(0, 40 - penalty);
    }

    // Timing (20 points max)
    if (timing.reasonable) {
      score += 20;
    } else {
      score += 10; // Partial credit for effort
    }

    // Coverage (20 points max)
    if (coverage.adequate) {
      score += 20;
    } else {
      // Partial credit based on coverage percentage
      score += Math.min(20, coverage.percentage);
    }

    // Direction (20 points max)
    score += direction.score * 20;

    return Math.min(100, Math.max(0, Math.round(score)));
  }
}

// Utility function for easy validation
export function validateKanjiDrawing(
  kanji: Kanji,
  strokes: StrokeData[],
  canvasWidth = 400,
  canvasHeight = 400
): ValidationResult {
  const validator = new StrokeValidator(kanji, canvasWidth, canvasHeight);
  return validator.validateStrokes(strokes);
}