import type { Kanji, JLPTLevel } from '../types';

// Kanji Alive API configuration
const KANJI_ALIVE_BASE_URL = 'https://kanjialive-api.p.rapidapi.com/api/public';
const API_HEADERS = {
  'X-RapidAPI-Key': import.meta.env.VITE_RAPIDAPI_KEY || '',
  'X-RapidAPI-Host': 'kanjialive-api.p.rapidapi.com'
};

// Jisho API configuration (free alternative)
const JISHO_BASE_URL = 'https://jisho.org/api/v1';

export interface KanjiApiResponse {
  kanji: {
    character: string;
    meaning: {
      english: string;
    };
    onyomi: {
      romaji: string;
      katakana: string;
    };
    kunyomi: {
      romaji: string;
      hiragana: string;
    };
    video: {
      poster: string;
      mp4: string;
      webm: string;
    };
    stroke: {
      timings: number[];
      images: string[];
    };
  };
}

export interface JishoSearchResponse {
  data: Array<{
    slug: string;
    is_common: boolean;
    tags: string[];
    jlpt: string[];
    japanese: Array<{
      word: string;
      reading: string;
    }>;
    senses: Array<{
      english_definitions: string[];
      parts_of_speech: string[];
      tags: string[];
      restrictions: string[];
      see_also: string[];
      antonyms: string[];
      source: string[];
      info: string[];
    }>;
  }>;
}

class KanjiApiService {
  private cache = new Map<string, Kanji[]>();

  // Fetch kanji from Kanji Alive API
  async fetchFromKanjiAlive(character: string): Promise<Kanji | null> {
    if (!API_HEADERS['X-RapidAPI-Key']) {
      throw new Error('RapidAPI key not configured');
    }

    try {
      const response = await fetch(
        `${KANJI_ALIVE_BASE_URL}/kanji/${encodeURIComponent(character)}`,
        {
          method: 'GET',
          headers: API_HEADERS,
        }
      );

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data: KanjiApiResponse = await response.json();
      return this.transformKanjiAliveData(data);
    } catch (error) {
      console.error('Kanji Alive API error:', error);
      return null;
    }
  }

  // Fetch kanji from Jisho API (free alternative)
  async fetchFromJisho(character: string): Promise<Kanji | null> {
    try {
      const response = await fetch(
        `${JISHO_BASE_URL}/search/words?keyword=${encodeURIComponent(character)}`
      );

      if (!response.ok) {
        throw new Error(`Jisho API request failed: ${response.status}`);
      }

      const data: JishoSearchResponse = await response.json();
      return this.transformJishoData(character, data);
    } catch (error) {
      console.error('Jisho API error:', error);
      return null;
    }
  }

  // Get kanji by JLPT level with fallback strategy
  async getKanjiByLevel(level: JLPTLevel): Promise<Kanji[]> {
    const cacheKey = `level-${level}`;
    
    // Check cache first
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    try {
      // Try to fetch from API first
      const apiKanji = await this.fetchKanjiByLevelFromAPI(level);
      if (apiKanji.length > 0) {
        this.cache.set(cacheKey, apiKanji);
        return apiKanji;
      }
    } catch (error) {
      console.warn('API fetch failed, using fallback data:', error);
    }

    // Fallback to local data
    const fallbackKanji = await this.getFallbackKanjiByLevel(level);
    this.cache.set(cacheKey, fallbackKanji);
    return fallbackKanji;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private async fetchKanjiByLevelFromAPI(_level: JLPTLevel): Promise<Kanji[]> {
    // This would be implemented based on the chosen API
    // For now, we'll use the fallback data
    return [];
  }

  private async getFallbackKanjiByLevel(level: JLPTLevel): Promise<Kanji[]> {
    try {
      const module = await import(`../data/kanji-${level.toLowerCase()}.json`);
      return module.default || [];
    } catch (error) {
      console.error(`Failed to load fallback data for ${level}:`, error);
      return this.getMinimalKanjiSet(level);
    }
  }

  private transformKanjiAliveData(data: KanjiApiResponse): Kanji {
    return {
      id: `ka-${data.kanji.character}`,
      character: data.kanji.character,
      level: this.guessJLPTLevel(data.kanji.character),
      meanings: [data.kanji.meaning.english],
      readings: {
        onyomi: [data.kanji.onyomi.katakana],
        kunyomi: [data.kanji.kunyomi.hiragana],
      },
      strokes: data.kanji.stroke.timings.length,
      frequency: 1000, // Default frequency
    };
  }

  private transformJishoData(character: string, data: JishoSearchResponse): Kanji | null {
    const entry = data.data.find(item => 
      item.japanese.some(jp => jp.word === character)
    );

    if (!entry) return null;

    const jlptLevel = entry.jlpt.length > 0 ? 
      entry.jlpt[0].replace('jlpt-', '').toUpperCase() as JLPTLevel : 
      'N5';

    return {
      id: `jisho-${character}`,
      character,
      level: jlptLevel,
      meanings: entry.senses[0]?.english_definitions || ['Unknown'],
      readings: {
        onyomi: [], // Jisho doesn't separate these clearly
        kunyomi: entry.japanese.map(jp => jp.reading),
      },
      strokes: this.estimateStrokes(character),
      frequency: entry.is_common ? 500 : 1500,
    };
  }

  private guessJLPTLevel(character: string): JLPTLevel {
    // Simple heuristic - in reality, this would use a lookup table
    const charCode = character.charCodeAt(0);
    if (charCode < 0x4e50) return 'N5';
    if (charCode < 0x5200) return 'N4';
    if (charCode < 0x5500) return 'N3';
    if (charCode < 0x7000) return 'N2';
    return 'N1';
  }

  private estimateStrokes(character: string): number {
    // Rough estimation based on character complexity
    const charCode = character.charCodeAt(0);
    return Math.floor((charCode - 0x4e00) / 100) + 3;
  }

  private getMinimalKanjiSet(level: JLPTLevel): Kanji[] {
    // Minimal fallback data for testing
    const basicKanji: Record<JLPTLevel, string[]> = {
      N5: ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十'],
      N4: ['人', '日', '本', '国', '山', '川', '田', '中', '大', '小'],
      N3: ['今', '時', '間', '年', '月', '週', '毎', '前', '後', '新'],
      N2: ['経', '験', '技', '術', '研', '究', '開', '発', '管', '理'],
      N1: ['複', '雑', '専', '門', '綜', '合', '抽', '象', '概', '念'],
    };

    return basicKanji[level].map((char, index) => ({
      id: `minimal-${level}-${index}`,
      character: char,
      level,
      meanings: ['Sample meaning'],
      readings: {
        onyomi: ['オン'],
        kunyomi: ['くん']
      },
      strokes: 5 + index,
      frequency: 1000 + index * 100,
    }));
  }

  // Clear cache
  clearCache(): void {
    this.cache.clear();
  }
}

export const kanjiApiService = new KanjiApiService();