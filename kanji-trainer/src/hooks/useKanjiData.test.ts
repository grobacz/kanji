import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useKanjiByLevel, useKanjiStats } from './useKanjiData';

// Mock the kanji API service
vi.mock('../services/kanjiApi', () => ({
  kanjiApiService: {
    getKanjiByLevel: vi.fn(),
  },
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  return function TestWrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(QueryClientProvider, { client: queryClient }, children);
  };
};

describe('useKanjiData hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useKanjiByLevel', () => {
    it('should not fetch when level is null', () => {
      const { result } = renderHook(() => useKanjiByLevel(null), {
        wrapper: createWrapper(),
      });

      expect(result.current.data).toBeUndefined();
      expect(result.current.isLoading).toBe(false);
    });

    it('should fetch kanji when level is provided', async () => {
      const mockKanji = [
        {
          id: 'test-1',
          character: '漢',
          level: 'N5' as const,
          meanings: ['Chinese character'],
          readings: { onyomi: ['カン'], kunyomi: ['から'] },
          strokes: 13,
          frequency: 1250,
        },
      ];

      const { kanjiApiService } = await import('../services/kanjiApi');
      vi.mocked(kanjiApiService.getKanjiByLevel).mockResolvedValue(mockKanji);

      const { result } = renderHook(() => useKanjiByLevel('N5'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockKanji);
      expect(kanjiApiService.getKanjiByLevel).toHaveBeenCalledWith('N5');
    });
  });

  describe('useKanjiStats', () => {
    it('should fetch stats for all levels', async () => {
      const { kanjiApiService } = await import('../services/kanjiApi');
      
      // Mock different kanji counts for each level
      vi.mocked(kanjiApiService.getKanjiByLevel)
        .mockImplementation((level) => {
          const counts = { N5: 20, N4: 10, N3: 10, N2: 10, N1: 10 };
          const count = counts[level] || 0;
          return Promise.resolve(Array(count).fill({
            id: `${level}-test`,
            character: '漢',
            level,
            meanings: ['test'],
            readings: { onyomi: ['テスト'], kunyomi: ['てすと'] },
            strokes: 5,
            frequency: 100,
          }));
        });

      const { result } = renderHook(() => useKanjiStats(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data).toHaveLength(5);
      expect(result.current.data[0]).toEqual({ level: 'N1', count: 10 });
      expect(result.current.data.find(d => d?.level === 'N5')).toEqual({ level: 'N5', count: 20 });
    });
  });
});