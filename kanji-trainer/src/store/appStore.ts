import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AppState, JLPTLevel, Kanji, FlashcardSession } from '../types';

interface AppStore extends AppState {
  flashcardSession: FlashcardSession | null;
  setSelectedLevel: (level: JLPTLevel) => void;
  setCurrentKanji: (kanji: Kanji | null) => void;
  initializeFlashcardSession: (kanji: Kanji[]) => void;
  nextCard: () => void;
  previousCard: () => void;
  toggleAnswer: () => void;
  markCorrect: () => void;
  markIncorrect: () => void;
  resetFlashcardSession: () => void;
}

const shuffleArray = <T>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      selectedLevel: null,
      currentKanji: null,
      flashcardSession: null,
      setSelectedLevel: (level) => set({ selectedLevel: level }),
      setCurrentKanji: (kanji) => set({ currentKanji: kanji }),
      initializeFlashcardSession: (kanji: Kanji[]) => {
        const shuffledKanji = shuffleArray(kanji).slice(0, 20);
        set({
          flashcardSession: {
            kanji: shuffledKanji,
            currentIndex: 0,
            showAnswer: false,
            correctCount: 0,
            incorrectCount: 0,
            totalCount: shuffledKanji.length,
            isComplete: false,
            startTime: Date.now(),
          },
        });
      },
      nextCard: () => {
        const session = get().flashcardSession;
        if (!session) return;
        
        const nextIndex = session.currentIndex + 1;
        const isComplete = nextIndex >= session.totalCount;
        
        set({
          flashcardSession: {
            ...session,
            currentIndex: isComplete ? session.currentIndex : nextIndex,
            showAnswer: false,
            isComplete,
          },
        });
      },
      previousCard: () => {
        const session = get().flashcardSession;
        if (!session || session.currentIndex === 0) return;
        
        set({
          flashcardSession: {
            ...session,
            currentIndex: session.currentIndex - 1,
            showAnswer: false,
          },
        });
      },
      toggleAnswer: () => {
        const session = get().flashcardSession;
        if (!session) return;
        
        set({
          flashcardSession: {
            ...session,
            showAnswer: !session.showAnswer,
          },
        });
      },
      markCorrect: () => {
        const session = get().flashcardSession;
        if (!session) return;
        
        set({
          flashcardSession: {
            ...session,
            correctCount: session.correctCount + 1,
          },
        });
      },
      markIncorrect: () => {
        const session = get().flashcardSession;
        if (!session) return;
        
        set({
          flashcardSession: {
            ...session,
            incorrectCount: session.incorrectCount + 1,
          },
        });
      },
      resetFlashcardSession: () => {
        set({ flashcardSession: null });
      },
    }),
    {
      name: 'kanji-trainer-store',
      partialize: (state) => ({ selectedLevel: state.selectedLevel }),
    }
  )
);