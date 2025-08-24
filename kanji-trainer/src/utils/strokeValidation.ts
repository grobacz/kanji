import type { Kanji } from '../types';
import type { StrokeData, ValidationResult, StrokeMatch } from '../types/strokeValidation';

declare global {
  interface Window {
    HanziWriter: any;
  }
}

interface HanziWriterCharData {
  strokes: string[];
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

  async validateStrokes(strokes: StrokeData[]): Promise<ValidationResult> {
    const strokeCount = this.validateStrokeCount(strokes);
    const timing = this.validateTiming(strokes);
    const coverage = this.validateCoverage(strokes);
    
    // Try to get actual stroke data for precise validation
    let strokeMatches: StrokeMatch[] | undefined;
    let direction: { score: number; reasonable: boolean };
    
    try {
      const charData = await this.loadCharacterData();
      if (charData) {
        console.info(`✓ Using HanziWriter stroke data for ${this.kanji.character} (${charData.strokes.length} strokes)`);
        strokeMatches = this.validateAgainstActualStrokes(strokes, charData);
        direction = this.calculateDirectionFromMatches(strokeMatches);
      } else {
        console.warn(`⚠ HanziWriter data not available for ${this.kanji.character}, using fallback validation`);
        // Fallback to generic direction validation
        direction = this.validateStrokeDirection(strokes);
      }
    } catch (error) {
      console.warn('Could not load character data, using fallback validation:', error);
      direction = this.validateStrokeDirection(strokes);
    }

    const feedback = this.generateFeedback(strokeCount, timing, coverage, direction, strokeMatches);
    const score = this.calculateScore(strokeCount, timing, coverage, direction, strokeMatches);

    return {
      isValid: score >= 60,
      score,
      feedback,
      strokeCount,
      timing,
      coverage,
      strokeMatches,
    };
  }

  private async loadCharacterData(): Promise<HanziWriterCharData | null> {
    return new Promise((resolve) => {
      // Check if HanziWriter is available
      if (typeof window === 'undefined' || !window.HanziWriter) {
        resolve(null);
        return;
      }

      window.HanziWriter.loadCharacterData(this.kanji.character)
        .then((charData: HanziWriterCharData) => {
          resolve(charData);
        })
        .catch((error: any) => {
          console.warn(`Failed to load character data for ${this.kanji.character}:`, error);
          resolve(null);
        });
    });
  }

  private validateAgainstActualStrokes(userStrokes: StrokeData[], charData: HanziWriterCharData): StrokeMatch[] {
    const expectedStrokes = charData.strokes;
    const matches: StrokeMatch[] = [];

    for (let i = 0; i < Math.max(userStrokes.length, expectedStrokes.length); i++) {
      const userStroke = userStrokes[i];
      const expectedStrokePath = expectedStrokes[i];

      if (!userStroke && expectedStrokePath) {
        // Missing stroke
        matches.push({
          strokeIndex: i,
          isCorrect: false,
          similarity: 0,
          feedback: `Missing stroke ${i + 1}`
        });
      } else if (userStroke && !expectedStrokePath) {
        // Extra stroke
        matches.push({
          strokeIndex: i,
          isCorrect: false,
          similarity: 0,
          feedback: `Extra stroke ${i + 1} - this kanji only has ${expectedStrokes.length} strokes`
        });
      } else if (userStroke && expectedStrokePath) {
        // Compare actual strokes
        const similarity = this.compareStrokeToPath(userStroke, expectedStrokePath);
        const isCorrect = similarity >= 0.6; // Threshold for "correct" stroke

        matches.push({
          strokeIndex: i,
          isCorrect,
          similarity,
          feedback: this.generateStrokeFeedback(i + 1, similarity, isCorrect)
        });
      }
    }

    return matches;
  }

  private compareStrokeToPath(userStroke: StrokeData, expectedPath: string): number {
    // This is a simplified stroke comparison
    // In a production app, you'd want more sophisticated path matching
    
    if (userStroke.points.length < 2) return 0;

    // Parse SVG path to get key points (simplified approach)
    const pathPoints = this.extractKeyPointsFromSVGPath(expectedPath);
    if (pathPoints.length < 2) return 0.5; // Give some credit for effort

    // Compare start and end points (scaled to our canvas)
    const userStart = userStroke.points[0];
    const userEnd = userStroke.points[userStroke.points.length - 1];
    
    const expectedStart = this.scalePointToCanvas(pathPoints[0]);
    const expectedEnd = this.scalePointToCanvas(pathPoints[pathPoints.length - 1]);

    // Calculate distance similarity
    const startDistance = this.calculateDistance(userStart, expectedStart);
    const endDistance = this.calculateDistance(userEnd, expectedEnd);
    
    const maxCanvasDistance = Math.sqrt(this.canvasWidth * this.canvasWidth + this.canvasHeight * this.canvasHeight);
    
    const startSimilarity = Math.max(0, 1 - (startDistance / (maxCanvasDistance * 0.3)));
    const endSimilarity = Math.max(0, 1 - (endDistance / (maxCanvasDistance * 0.3)));
    
    // Simple direction comparison
    const userDirection = [userEnd[0] - userStart[0], userEnd[1] - userStart[1]];
    const expectedDirection = [expectedEnd[0] - expectedStart[0], expectedEnd[1] - expectedStart[1]];
    
    const directionSimilarity = this.calculateDirectionSimilarity(userDirection, expectedDirection);

    // Combined score: 40% start, 40% end, 20% direction
    return (startSimilarity * 0.4) + (endSimilarity * 0.4) + (directionSimilarity * 0.2);
  }

  private extractKeyPointsFromSVGPath(pathString: string): number[][] {
    // Very simplified SVG path parsing - just extract move and line commands
    // HanziWriter paths are in 1024x1024 coordinate system
    const points: number[][] = [];
    const commands = pathString.match(/[MLZ][^MLZ]*/g) || [];
    
    for (const command of commands) {
      const type = command[0];
      const coords = command.slice(1).trim().split(/[\s,]+/).map(Number).filter(n => !isNaN(n));
      
      if ((type === 'M' || type === 'L') && coords.length >= 2) {
        points.push([coords[0], coords[1]]);
      }
    }
    
    return points;
  }

  private scalePointToCanvas(point: number[]): number[] {
    // Scale from HanziWriter's 1024x1024 coordinate system to our canvas
    const scaleFactor = Math.min(this.canvasWidth, this.canvasHeight) / 1024;
    const offsetX = (this.canvasWidth - 1024 * scaleFactor) / 2;
    const offsetY = (this.canvasHeight - 1024 * scaleFactor) / 2;
    
    return [
      point[0] * scaleFactor + offsetX,
      point[1] * scaleFactor + offsetY
    ];
  }

  private calculateDistance(point1: number[], point2: number[]): number {
    const dx = point1[0] - point2[0];
    const dy = point1[1] - point2[1];
    return Math.sqrt(dx * dx + dy * dy);
  }

  private calculateDirectionSimilarity(dir1: number[], dir2: number[]): number {
    // Normalize vectors
    const len1 = Math.sqrt(dir1[0] * dir1[0] + dir1[1] * dir1[1]);
    const len2 = Math.sqrt(dir2[0] * dir2[0] + dir2[1] * dir2[1]);
    
    if (len1 === 0 || len2 === 0) return 0.5;
    
    const norm1 = [dir1[0] / len1, dir1[1] / len1];
    const norm2 = [dir2[0] / len2, dir2[1] / len2];
    
    // Dot product gives cosine of angle between vectors
    const dotProduct = norm1[0] * norm2[0] + norm1[1] * norm2[1];
    
    // Convert to similarity score (1 = same direction, 0 = opposite)
    return (dotProduct + 1) / 2;
  }

  private generateStrokeFeedback(strokeNum: number, similarity: number, isCorrect: boolean): string {
    if (isCorrect) {
      if (similarity >= 0.8) return `✓ Stroke ${strokeNum}: Excellent!`;
      else return `✓ Stroke ${strokeNum}: Good direction`;
    } else {
      if (similarity >= 0.4) return `Stroke ${strokeNum}: Close, but check the direction`;
      else if (similarity >= 0.2) return `Stroke ${strokeNum}: Wrong direction or position`;
      else return `Stroke ${strokeNum}: Doesn't match expected stroke`;
    }
  }

  private calculateDirectionFromMatches(strokeMatches: StrokeMatch[]): { score: number; reasonable: boolean } {
    if (strokeMatches.length === 0) return { score: 0, reasonable: false };
    
    const correctStrokes = strokeMatches.filter(match => match.isCorrect).length;
    const score = correctStrokes / strokeMatches.length;
    
    return {
      score,
      reasonable: score >= 0.6
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
    
    // More precise coverage calculation
    const usableCanvasArea = (this.canvasWidth * 0.8) * (this.canvasHeight * 0.8); // 80% of canvas is reasonable
    const drawingArea = drawingWidth * drawingHeight;
    
    // Calculate actual coverage percentage based on usable area
    const percentage = Math.min(100, (drawingArea / usableCanvasArea) * 100);

    // More stringent coverage requirements:
    // Simple kanji (1-5 strokes): need 8-15% coverage
    // Medium kanji (6-10 strokes): need 12-25% coverage  
    // Complex kanji (11+ strokes): need 18-35% coverage
    let minCoverage: number;
    let maxCoverage: number;
    
    if (this.kanji.strokes <= 5) {
      minCoverage = 8;
      maxCoverage = 35;
    } else if (this.kanji.strokes <= 10) {
      minCoverage = 12;
      maxCoverage = 45;
    } else {
      minCoverage = 18;
      maxCoverage = 60;
    }

    // Check if drawing is too small OR too large
    const adequate = percentage >= minCoverage && percentage <= maxCoverage;

    // Additional check: ensure minimum dimensions
    const minDimension = Math.min(this.canvasWidth, this.canvasHeight) * 0.15; // 15% of smaller dimension
    const dimensionsAdequate = drawingWidth >= minDimension && drawingHeight >= minDimension;

    return {
      percentage: Math.round(percentage),
      adequate: adequate && dimensionsAdequate,
    };
  }

  private validateStrokeDirection(strokes: StrokeData[]) {
    if (strokes.length === 0) {
      return {
        score: 0,
        reasonable: false,
      };
    }

    let goodDirectionCount = 0;
    let totalStrokesAnalyzed = 0;

    strokes.forEach(stroke => {
      if (stroke.points.length < 2) return;

      const start = stroke.points[0];
      const end = stroke.points[stroke.points.length - 1];

      // Check general direction
      const deltaX = end[0] - start[0];
      const deltaY = end[1] - start[1];
      
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      
      // Skip very short strokes (likely dots or tiny marks)
      if (distance < 10) return;
      
      totalStrokesAnalyzed += 1;

      // Analyze stroke direction more strictly
      // Good strokes should generally:
      // 1. Go downward (deltaY > 0) OR
      // 2. Go rightward (deltaX > 0) OR  
      // 3. Be predominantly vertical/horizontal (not diagonal)
      
      const isDownward = deltaY > Math.abs(deltaX) * 0.3; // More downward than diagonal
      const isRightward = deltaX > Math.abs(deltaY) * 0.3; // More rightward than diagonal
      const isHorizontal = Math.abs(deltaX) > Math.abs(deltaY) * 2 && deltaX > 0; // Clearly horizontal and rightward
      const isVertical = Math.abs(deltaY) > Math.abs(deltaX) * 2 && deltaY > 0; // Clearly vertical and downward
      
      // A stroke is "good" if it follows basic kanji stroke principles
      if (isDownward || isRightward || isHorizontal || isVertical) {
        goodDirectionCount += 1;
      }
    });

    const directionScore = totalStrokesAnalyzed > 0 
      ? goodDirectionCount / totalStrokesAnalyzed 
      : 0;

    // Be more strict about direction - at least 70% of strokes should have reasonable direction
    const reasonable = directionScore >= 0.7;

    return {
      score: directionScore,
      reasonable,
    };
  }

  private generateFeedback(
    strokeCount: { correct: boolean; expected: number; actual: number },
    timing: { reasonable: boolean; averageStrokeTime: number },
    coverage: { adequate: boolean; percentage: number },
    direction: { reasonable: boolean },
    strokeMatches?: StrokeMatch[]
  ): string[] {
    const feedback: string[] = [];

    // If we have detailed stroke matches, prioritize that feedback
    if (strokeMatches && strokeMatches.length > 0) {
      const correctMatches = strokeMatches.filter(match => match.isCorrect);
      const totalMatches = strokeMatches.length;
      
      if (correctMatches.length === totalMatches) {
        feedback.push(`✓ All ${totalMatches} strokes match the correct pattern!`);
      } else if (correctMatches.length === 0) {
        feedback.push(`None of your strokes match the expected pattern. Try following the stroke order.`);
      } else {
        feedback.push(`${correctMatches.length}/${totalMatches} strokes are correct. Check the individual stroke feedback below.`);
      }

      // Add individual stroke feedback for incorrect strokes
      strokeMatches.forEach(match => {
        if (!match.isCorrect) {
          feedback.push(match.feedback);
        }
      });
    } else {
      // Fallback to generic feedback when no stroke data available
      
      // Stroke count feedback
      if (strokeCount.correct) {
        feedback.push(`✓ Correct number of strokes (${strokeCount.expected})`);
      } else if (strokeCount.actual < strokeCount.expected) {
        feedback.push(`You used ${strokeCount.actual} strokes, but ${this.kanji.character} has ${strokeCount.expected} strokes. Try adding more detail.`);
      } else {
        feedback.push(`You used ${strokeCount.actual} strokes, but ${this.kanji.character} only has ${strokeCount.expected} strokes. Try to be more efficient.`);
      }

      // Direction feedback (fallback)
      if (direction.reasonable) {
        feedback.push('✓ Good stroke direction');
      } else {
        feedback.push('Remember: Japanese strokes generally go from top to bottom, left to right');
      }
    }

    // Timing feedback (always show)
    if (timing.reasonable) {
      feedback.push('✓ Good pacing - not too fast or slow');
    } else if (timing.averageStrokeTime < 200) {
      feedback.push('Try slowing down a bit - take time to be deliberate with each stroke');
    } else {
      feedback.push('Good attention to detail - you can try being a bit quicker');
    }

    // Enhanced coverage feedback (always show)
    if (coverage.adequate) {
      feedback.push('✓ Good size and proportion');
    } else {
      // More specific coverage feedback based on kanji complexity and actual percentage
      let minCoverage: number, maxCoverage: number;
      
      if (this.kanji.strokes <= 5) {
        minCoverage = 8; maxCoverage = 35;
      } else if (this.kanji.strokes <= 10) {
        minCoverage = 12; maxCoverage = 45;
      } else {
        minCoverage = 18; maxCoverage = 60;
      }

      if (coverage.percentage < minCoverage) {
        feedback.push(`Your drawing is too small (${coverage.percentage}% coverage). Make it larger to fill more space.`);
      } else if (coverage.percentage > maxCoverage) {
        feedback.push(`Your drawing is too large (${coverage.percentage}% coverage). Try to keep it more compact.`);
      } else {
        feedback.push('Check that your drawing has proper proportions and isn\'t too narrow or wide.');
      }
    }

    return feedback;
  }

  private calculateScore(
    strokeCount: { correct: boolean; expected: number; actual: number },
    timing: { reasonable: boolean },
    coverage: { adequate: boolean; percentage: number },
    direction: { score: number },
    strokeMatches?: StrokeMatch[]
  ): number {
    let score = 0;

    // If we have stroke matches, use more sophisticated scoring
    if (strokeMatches && strokeMatches.length > 0) {
      // Stroke accuracy (60 points max) - most important with real stroke data
      const correctStrokes = strokeMatches.filter(match => match.isCorrect).length;
      const avgSimilarity = strokeMatches.reduce((sum, match) => sum + match.similarity, 0) / strokeMatches.length;
      
      // Base stroke accuracy score
      const strokeAccuracy = correctStrokes / strokeMatches.length;
      score += strokeAccuracy * 50; // 50 points for correct strokes
      
      // Additional points for overall similarity even on incorrect strokes
      score += avgSimilarity * 10; // Up to 10 additional points for partial similarity
      
      // Timing (15 points max - reduced since stroke accuracy is more important)
      if (timing.reasonable) {
        score += 15;
      } else {
        score += 7; // Partial credit for effort
      }

      // Coverage (25 points max - still important for overall appearance)
      if (coverage.adequate) {
        score += 25;
      } else {
        // More generous partial credit when we have good stroke matches
        let minCoverage: number;
        if (this.kanji.strokes <= 5) {
          minCoverage = 8;
        } else if (this.kanji.strokes <= 10) {
          minCoverage = 12;
        } else {
          minCoverage = 18;
        }
        
        if (coverage.percentage < minCoverage / 2) {
          score += Math.max(5, coverage.percentage * 0.8);
        } else {
          const coverageRatio = coverage.percentage / minCoverage;
          score += Math.min(20, coverageRatio * 20);
        }
      }
    } else {
      // Fallback scoring when no stroke data available
      
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
        let minCoverage: number;
        if (this.kanji.strokes <= 5) {
          minCoverage = 8;
        } else if (this.kanji.strokes <= 10) {
          minCoverage = 12;
        } else {
          minCoverage = 18;
        }
        
        if (coverage.percentage < minCoverage / 2) {
          score += Math.max(0, coverage.percentage * 0.5);
        } else {
          const coverageRatio = coverage.percentage / minCoverage;
          score += Math.min(15, coverageRatio * 15);
        }
      }

      // Direction (20 points max)
      score += direction.score * 20;
    }

    return Math.min(100, Math.max(0, Math.round(score)));
  }

  // New synchronous method that uses pre-loaded stroke data
  validateStrokesWithData(strokes: StrokeData[], strokeData: string[] | null): ValidationResult {
    const strokeCount = this.validateStrokeCount(strokes);
    const timing = this.validateTiming(strokes);
    const coverage = this.validateCoverage(strokes);
    
    let strokeMatches: StrokeMatch[] | undefined;
    let direction: { score: number; reasonable: boolean };
    
    if (strokeData && strokeData.length > 0) {
      console.info(`✓ Validating with ${strokeData.length} expected strokes for ${this.kanji.character}`);
      strokeMatches = this.validateAgainstActualStrokes(strokes, { strokes: strokeData });
      direction = this.calculateDirectionFromMatches(strokeMatches);
    } else {
      console.warn(`⚠ No stroke data available for ${this.kanji.character}, using fallback validation`);
      direction = this.validateStrokeDirection(strokes);
    }

    const feedback = this.generateFeedback(strokeCount, timing, coverage, direction, strokeMatches);
    const score = this.calculateScore(strokeCount, timing, coverage, direction, strokeMatches);

    return {
      isValid: score >= 60,
      score,
      feedback,
      strokeCount,
      timing,
      coverage,
      strokeMatches,
    };
  }
}

// Utility function for easy validation
export async function validateKanjiDrawing(
  kanji: Kanji,
  strokes: StrokeData[],
  canvasWidth = 400,
  canvasHeight = 400
): Promise<ValidationResult> {
  const validator = new StrokeValidator(kanji, canvasWidth, canvasHeight);
  return await validator.validateStrokes(strokes);
}

// New utility function that uses pre-loaded stroke data (more efficient)
export function validateKanjiDrawingWithStrokeData(
  kanji: Kanji,
  strokes: StrokeData[],
  strokeData: string[] | null,
  canvasWidth = 400,
  canvasHeight = 400
): ValidationResult {
  const validator = new StrokeValidator(kanji, canvasWidth, canvasHeight);
  return validator.validateStrokesWithData(strokes, strokeData);
}