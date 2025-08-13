export interface Kanji {
  id: string;
  character: string;
  level: 'N1' | 'N2' | 'N3' | 'N4' | 'N5';
  meanings: string[];
  readings: {
    onyomi: string[];
    kunyomi: string[];
  };
  strokes: number;
  frequency: number;
}

export type JLPTLevel = 'N1' | 'N2' | 'N3' | 'N4' | 'N5';

export interface AppState {
  selectedLevel: JLPTLevel | null;
  currentKanji: Kanji | null;
}

export interface FlashcardSession {
  kanji: Kanji[];
  currentIndex: number;
  showAnswer: boolean;
  correctCount: number;
  incorrectCount: number;
  totalCount: number;
  isComplete: boolean;
  startTime: number;
}

export interface FlashcardResult {
  kanji: Kanji;
  correct: boolean;
  timeSpent: number;
}