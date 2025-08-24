export interface StrokeData {
  points: number[][];
  startTime: number;
  endTime: number;
}

export interface StrokeMatch {
  strokeIndex: number;
  isCorrect: boolean;
  similarity: number; // 0-1 score
  feedback: string;
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
  strokeMatches?: StrokeMatch[]; // Individual stroke analysis
}