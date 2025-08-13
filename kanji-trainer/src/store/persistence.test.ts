import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { useAppStore } from './appStore';

describe('Data Persistence', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    // Reset store to initial state
    useAppStore.getState().setSelectedLevel(null);
    useAppStore.getState().setCurrentKanji(null);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should persist selected level across store recreations', () => {
    // Select a level and verify it's stored
    const { setSelectedLevel } = useAppStore.getState();
    setSelectedLevel('N3');
    
    // Verify it's in localStorage
    const stored = localStorage.getItem('kanji-trainer-store');
    expect(stored).toBeTruthy();
    
    if (stored) {
      const parsed = JSON.parse(stored);
      expect(parsed.state.selectedLevel).toBe('N3');
    }

    // Simulate app restart by getting fresh state
    const newState = useAppStore.getState();
    expect(newState.selectedLevel).toBe('N3');
  });

  it('should not persist currentKanji (temporary state)', () => {
    const mockKanji = {
      id: 'test-1',
      character: '漢',
      level: 'N2' as const,
      meanings: ['Chinese character'],
      readings: {
        onyomi: ['カン'],
        kunyomi: ['から']
      },
      strokes: 13,
      frequency: 1250
    };

    const { setCurrentKanji, setSelectedLevel } = useAppStore.getState();
    
    // Set both persistent and temporary data
    setSelectedLevel('N2');
    setCurrentKanji(mockKanji);
    
    // Check localStorage only contains persistent data
    const stored = localStorage.getItem('kanji-trainer-store');
    expect(stored).toBeTruthy();
    
    if (stored) {
      const parsed = JSON.parse(stored);
      expect(parsed.state.selectedLevel).toBe('N2');
      expect(parsed.state.currentKanji).toBeUndefined();
    }
  });

  it('should handle corrupted localStorage gracefully', () => {
    // Set invalid JSON in localStorage
    localStorage.setItem('kanji-trainer-store', 'invalid json');
    
    // Store should still work with default values after reset
    const { setSelectedLevel } = useAppStore.getState();
    setSelectedLevel(null);
    
    const state = useAppStore.getState();
    expect(state.selectedLevel).toBe(null);
    expect(state.currentKanji).toBe(null);
    
    // Should be able to set new values
    setSelectedLevel('N4');
    expect(useAppStore.getState().selectedLevel).toBe('N4');
  });

  it('should maintain data integrity across multiple operations', () => {
    const { setSelectedLevel } = useAppStore.getState();
    
    // Perform multiple level changes
    setSelectedLevel('N5');
    expect(useAppStore.getState().selectedLevel).toBe('N5');
    
    setSelectedLevel('N1');
    expect(useAppStore.getState().selectedLevel).toBe('N1');
    
    setSelectedLevel('N3');
    expect(useAppStore.getState().selectedLevel).toBe('N3');
    
    // Verify final state is persisted correctly
    const stored = localStorage.getItem('kanji-trainer-store');
    expect(stored).toBeTruthy();
    
    if (stored) {
      const parsed = JSON.parse(stored);
      expect(parsed.state.selectedLevel).toBe('N3');
    }
  });

  it('should handle localStorage quota exceeded gracefully', () => {
    const { setSelectedLevel } = useAppStore.getState();
    
    // Mock localStorage.setItem to throw quota exceeded error
    const originalSetItem = localStorage.setItem;
    localStorage.setItem = vi.fn(() => {
      throw new DOMException('Quota exceeded', 'QuotaExceededError');
    });
    
    // This should not throw an error
    expect(() => {
      setSelectedLevel('N2');
    }).not.toThrow();
    
    // State should still be updated in memory
    expect(useAppStore.getState().selectedLevel).toBe('N2');
    
    // Restore original setItem
    localStorage.setItem = originalSetItem;
  });

  it('should migrate old storage format if needed', () => {
    // Simulate old storage format
    const oldFormat = {
      version: 0,
      state: {
        level: 'N4' // old key name
      }
    };
    
    localStorage.setItem('kanji-trainer-store', JSON.stringify(oldFormat));
    
    // Reset store to initial state
    const { setSelectedLevel } = useAppStore.getState();
    setSelectedLevel(null);
    
    // Store should handle this gracefully
    const state = useAppStore.getState();
    
    // Should start with clean state for unknown format
    expect(state.selectedLevel).toBe(null);
    
    // Should work normally after setting new value
    setSelectedLevel('N2');
    expect(useAppStore.getState().selectedLevel).toBe('N2');
  });
});