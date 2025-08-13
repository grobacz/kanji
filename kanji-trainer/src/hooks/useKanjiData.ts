import { useQuery, useQueries } from '@tanstack/react-query';
import { kanjiApiService } from '../services/kanjiApi';
import type { Kanji, JLPTLevel } from '../types';

// Query keys for React Query
export const kanjiQueryKeys = {
  all: ['kanji'] as const,
  byLevel: (level: JLPTLevel) => ['kanji', 'level', level] as const,
  byCharacter: (character: string) => ['kanji', 'character', character] as const,
  stats: () => ['kanji', 'stats'] as const,
};

// Hook to fetch kanji by JLPT level
export function useKanjiByLevel(level: JLPTLevel | null) {
  return useQuery({
    queryKey: level ? kanjiQueryKeys.byLevel(level) : [],
    queryFn: () => level ? kanjiApiService.getKanjiByLevel(level) : Promise.resolve([]),
    enabled: level !== null,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

// Hook to fetch kanji counts for all levels
export function useKanjiStats() {
  const levels: JLPTLevel[] = ['N1', 'N2', 'N3', 'N4', 'N5'];
  
  const results = useQueries({
    queries: levels.map((level) => ({
      queryKey: kanjiQueryKeys.byLevel(level),
      queryFn: () => kanjiApiService.getKanjiByLevel(level),
      staleTime: 15 * 60 * 1000, // 15 minutes
      select: (data: Kanji[]) => ({ level, count: data.length }),
    })),
  });

  const isLoading = results.some(result => result.isLoading);
  const isError = results.some(result => result.isError);
  const data = results.map(result => result.data).filter(Boolean);

  return {
    data,
    isLoading,
    isError,
    refetch: () => results.forEach(result => result.refetch()),
  };
}

// Hook to get a random kanji from a specific level
export function useRandomKanji(level: JLPTLevel | null, count = 1) {
  const { data: kanjiList, ...rest } = useKanjiByLevel(level);

  const getRandomKanji = () => {
    if (!kanjiList || kanjiList.length === 0) return [];
    
    const shuffled = [...kanjiList].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, Math.min(count, shuffled.length));
  };

  return {
    ...rest,
    data: kanjiList ? getRandomKanji() : [],
    refetch: () => {
      rest.refetch();
    },
  };
}

// Hook to prefetch all levels for better UX
export function usePrefetchKanjiData() {
  const levels: JLPTLevel[] = ['N1', 'N2', 'N3', 'N4', 'N5'];
  
  const results = useQueries({
    queries: levels.map((level) => ({
      queryKey: kanjiQueryKeys.byLevel(level),
      queryFn: () => kanjiApiService.getKanjiByLevel(level),
      staleTime: 15 * 60 * 1000,
      gcTime: 60 * 60 * 1000, // 1 hour
    })),
  });

  const totalLoaded = results.filter(r => r.data).length;
  const isAllLoaded = totalLoaded === levels.length;
  const isAnyLoading = results.some(r => r.isLoading);

  return {
    totalLoaded,
    totalLevels: levels.length,
    isAllLoaded,
    isAnyLoading,
    progress: Math.round((totalLoaded / levels.length) * 100),
  };
}

// Utility hook for kanji search/filtering
export function useKanjiFilter(
  kanjiList: Kanji[] | undefined, 
  filters: {
    search?: string;
    minStrokes?: number;
    maxStrokes?: number;
    meanings?: string[];
  }
) {
  if (!kanjiList) return [];

  return kanjiList.filter((kanji) => {
    // Search filter
    if (filters.search && !kanji.character.includes(filters.search) && 
        !kanji.meanings.some(m => m.toLowerCase().includes(filters.search!.toLowerCase()))) {
      return false;
    }

    // Stroke count filters
    if (filters.minStrokes && kanji.strokes < filters.minStrokes) return false;
    if (filters.maxStrokes && kanji.strokes > filters.maxStrokes) return false;

    // Meaning filters
    if (filters.meanings && filters.meanings.length > 0) {
      const hasMatchingMeaning = filters.meanings.some(filterMeaning =>
        kanji.meanings.some(kanjiMeaning =>
          kanjiMeaning.toLowerCase().includes(filterMeaning.toLowerCase())
        )
      );
      if (!hasMatchingMeaning) return false;
    }

    return true;
  });
}

// Hook for getting kanji statistics
export function useKanjiStatistics(kanjiList: Kanji[] | undefined) {
  if (!kanjiList || kanjiList.length === 0) {
    return null;
  }

  const avgStrokes = Math.round(
    kanjiList.reduce((sum, k) => sum + k.strokes, 0) / kanjiList.length
  );

  const strokeDistribution = kanjiList.reduce((acc, kanji) => {
    const range = Math.floor(kanji.strokes / 5) * 5;
    const key = `${range}-${range + 4}`;
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const mostCommon = kanjiList
    .sort((a, b) => a.frequency - b.frequency)
    .slice(0, 10);

  return {
    total: kanjiList.length,
    avgStrokes,
    strokeDistribution,
    mostCommon,
  };
}