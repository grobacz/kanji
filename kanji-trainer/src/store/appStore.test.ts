import { describe, it, expect, beforeEach } from 'vitest';
import { useAppStore } from './appStore';
import type { Kanji } from '../types';

const mockKanji: Kanji[] = [
  {
    id: 'test-1',
    character: '漢',
    level: 'N2',
    meanings: ['Chinese character'],
    readings: { onyomi: ['カン'], kunyomi: ['から'] },
    strokes: 13,
    frequency: 1250
  },
  {
    id: 'test-2',
    character: '字',
    level: 'N2',
    meanings: ['character', 'letter'],
    readings: { onyomi: ['ジ'], kunyomi: ['あざ'] },
    strokes: 6,
    frequency: 980
  }
];

describe('AppStore', () => {
  beforeEach(() => {
    localStorage.clear();
    useAppStore.getState().setSelectedLevel(null);
    useAppStore.getState().setCurrentKanji(null);
    useAppStore.getState().resetFlashcardSession();
  });

  describe('basic state', () => {
    it('should have initial state', () => {
      const state = useAppStore.getState();
      expect(state.selectedLevel).toBe(null);
      expect(state.currentKanji).toBe(null);
      expect(state.flashcardSession).toBe(null);
    });

    it('should set selected level', () => {
      const { setSelectedLevel } = useAppStore.getState();
      setSelectedLevel('N3');
      
      const state = useAppStore.getState();
      expect(state.selectedLevel).toBe('N3');
    });

    it('should set current kanji', () => {
      const { setCurrentKanji } = useAppStore.getState();
      setCurrentKanji(mockKanji[0]);
      
      const state = useAppStore.getState();
      expect(state.currentKanji).toEqual(mockKanji[0]);
    });

    it('should clear current kanji', () => {
      const { setCurrentKanji } = useAppStore.getState();
      setCurrentKanji(mockKanji[0]);
      setCurrentKanji(null);
      
      const state = useAppStore.getState();
      expect(state.currentKanji).toBe(null);
    });

    it('should persist selected level to localStorage', () => {
      const { setSelectedLevel } = useAppStore.getState();
      setSelectedLevel('N1');
      
      const stored = localStorage.getItem('kanji-trainer-store');
      expect(stored).toBeTruthy();
      if (stored) {
        const parsed = JSON.parse(stored);
        expect(parsed.state.selectedLevel).toBe('N1');
      }
    });
  });

  describe('flashcard session', () => {
    it('should initialize flashcard session', () => {
      const { initializeFlashcardSession } = useAppStore.getState();
      initializeFlashcardSession(mockKanji);
      
      const session = useAppStore.getState().flashcardSession;
      expect(session).toBeDefined();
      expect(session?.kanji).toHaveLength(2);
      expect(session?.currentIndex).toBe(0);
      expect(session?.showAnswer).toBe(false);
      expect(session?.correctCount).toBe(0);
      expect(session?.incorrectCount).toBe(0);
      expect(session?.totalCount).toBe(2);
      expect(session?.isComplete).toBe(false);
    });

    it('should limit session to 20 kanji', () => {
      const manyKanji = Array(30).fill(null).map((_, i) => ({
        ...mockKanji[0],
        id: `test-${i}`,
      }));
      
      const { initializeFlashcardSession } = useAppStore.getState();
      initializeFlashcardSession(manyKanji);
      
      const session = useAppStore.getState().flashcardSession;
      expect(session?.totalCount).toBe(20);
    });

    it('should navigate cards correctly', () => {
      const { initializeFlashcardSession, nextCard, previousCard } = useAppStore.getState();
      initializeFlashcardSession(mockKanji);
      
      nextCard();
      expect(useAppStore.getState().flashcardSession?.currentIndex).toBe(1);
      
      previousCard();
      expect(useAppStore.getState().flashcardSession?.currentIndex).toBe(0);
    });

    it('should complete session at end', () => {
      const { initializeFlashcardSession, nextCard } = useAppStore.getState();
      initializeFlashcardSession(mockKanji);
      
      nextCard();
      nextCard();
      
      const session = useAppStore.getState().flashcardSession;
      expect(session?.isComplete).toBe(true);
    });

    it('should toggle answer visibility', () => {
      const { initializeFlashcardSession, toggleAnswer } = useAppStore.getState();
      initializeFlashcardSession(mockKanji);
      
      toggleAnswer();
      expect(useAppStore.getState().flashcardSession?.showAnswer).toBe(true);
      
      toggleAnswer();
      expect(useAppStore.getState().flashcardSession?.showAnswer).toBe(false);
    });

    it('should track correct/incorrect answers', () => {
      const { initializeFlashcardSession, markCorrect, markIncorrect } = useAppStore.getState();
      initializeFlashcardSession(mockKanji);
      
      markCorrect();
      expect(useAppStore.getState().flashcardSession?.correctCount).toBe(1);
      
      markIncorrect();
      expect(useAppStore.getState().flashcardSession?.incorrectCount).toBe(1);
    });

    it('should reset session', () => {
      const { initializeFlashcardSession, resetFlashcardSession } = useAppStore.getState();
      initializeFlashcardSession(mockKanji);
      
      resetFlashcardSession();
      expect(useAppStore.getState().flashcardSession).toBe(null);
    });
  });
});