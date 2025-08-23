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