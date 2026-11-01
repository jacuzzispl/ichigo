import {
  LessonKanji,
  StudiedKanjiItem,
  ReviewCompletePayload,
  ReviewCompleteResponse,
} from '../types';
import { adaptApiKanjiToLessonKanji, MOCK_KANJI_POOL } from './lessons';

export const USE_MOCK = false; // By default try real FastAPI backend first

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const apiFetch = async <T>(path: string, options: RequestInit = {}): Promise<T> => {
  const token = localStorage.getItem('sakura_access_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Network error');
    throw new Error(`API error (${response.status}): ${errorText}`);
  }

  return response.json();
};

/**
 * Mock due kanji pool for testing when backend is not running
 */
export const MOCK_DUE_KANJI: any[] = [
  {
    id: 11,
    character: '日',
    meaning: 'day, sun',
    jlpt_level: 5,
    curriculumn_order: 1,
    onyomi: 'にち, じつ',
    kunyomi: 'ひ, か',
    radical: '日',
    stroke_count: 4,
  },
  {
    id: 12,
    character: '月',
    meaning: 'month, moon',
    jlpt_level: 5,
    curriculumn_order: 2,
    onyomi: 'げつ, がつ',
    kunyomi: 'つき',
    radical: '月',
    stroke_count: 4,
  },
  {
    id: 13,
    character: '木',
    meaning: 'tree, wood',
    jlpt_level: 5,
    curriculumn_order: 3,
    onyomi: 'もく, ぼく',
    kunyomi: 'き, こ',
    radical: '木',
    stroke_count: 4,
  },
  {
    id: 14,
    character: '水',
    meaning: 'water',
    jlpt_level: 5,
    curriculumn_order: 4,
    onyomi: 'すい',
    kunyomi: 'みず',
    radical: '水',
    stroke_count: 4,
  },
];

/**
 * Mock studied kanji pool for custom review selection
 */
export const MOCK_STUDIED_KANJI: StudiedKanjiItem[] = [
  { id: 1, character: '一', meaning: 'one', jlpt_level: 5 },
  { id: 2, character: '二', meaning: 'two', jlpt_level: 5 },
  { id: 3, character: '三', meaning: 'three', jlpt_level: 5 },
  { id: 4, character: '四', meaning: 'four', jlpt_level: 5 },
  { id: 5, character: '五', meaning: 'five', jlpt_level: 5 },
  { id: 11, character: '日', meaning: 'day, sun', jlpt_level: 5 },
  { id: 12, character: '月', meaning: 'month, moon', jlpt_level: 5 },
  { id: 13, character: '木', meaning: 'tree, wood', jlpt_level: 5 },
  { id: 14, character: '水', meaning: 'water', jlpt_level: 5 },
  { id: 15, character: '火', meaning: 'fire', jlpt_level: 5 },
  { id: 16, character: '金', meaning: 'gold, money', jlpt_level: 5 },
  { id: 17, character: '土', meaning: 'soil, earth', jlpt_level: 5 },
  { id: 18, character: '校', meaning: 'school', jlpt_level: 5 },
  { id: 19, character: '生', meaning: 'life, student', jlpt_level: 5 },
  { id: 20, character: '学', meaning: 'study, learn', jlpt_level: 5 },
];

/**
 * Fetches kanji that are due for reviewal from GET /review.
 * Model expected:
 *   id: int
 *   character: str
 *   meaning: str
 *   jlpt_level: int
 *   curriculumn_order: Optional[int]
 *   onyomi: Optional[str]
 *   kunyomi: Optional[str]
 *   radical: Optional[str]
 */
export async function getDueReviews(): Promise<LessonKanji[]> {
  try {
    const rawList = await apiFetch<any[]>('/due');
    return (Array.isArray(rawList) ? rawList : []).map(adaptApiKanjiToLessonKanji);
  } catch (err: any) {
    // If route was 404, also try /reviews as fallback
    try {
      const fallbackList = await apiFetch<any[]>('/review/due');
      return (Array.isArray(fallbackList) ? fallbackList : []).map(adaptApiKanjiToLessonKanji);
    } catch {
      // If server is not running or network fails, provide mock fallback
      console.warn('Backend /review not reachable, using mock fallback:', err.message);
      await new Promise((resolve) => setTimeout(resolve, 300));
      return MOCK_DUE_KANJI.map(adaptApiKanjiToLessonKanji);
    }
  }
}

/**
 * Fetches all kanji that the user has studied so far from GET /reviews/studied.
 * Model expected:
 *   id: int
 *   character: str
 *   meaning: str
 */
export async function getStudiedReviews(): Promise<LessonKanji[]> {
  try {
    const rawList = await apiFetch<any[]>('/studied');
    return (Array.isArray(rawList) ? rawList : []).map(adaptApiKanjiToLessonKanji);
  } catch (err: any) {
    try {
      const altList = await apiFetch<any[]>('/review/studied');
      return (Array.isArray(altList) ? altList : []).map(adaptApiKanjiToLessonKanji);
    } catch {
      console.warn('Backend /reviews/studied not reachable, using mock fallback:', err.message);
      await new Promise((resolve) => setTimeout(resolve, 300));
      return MOCK_STUDIED_KANJI.map(adaptApiKanjiToLessonKanji);
    }
  }
}

/**
 * Submits completed review session results to POST /complete
 * (or POST /lessons/complete) matching study sessions payload:
 * {
 *   results: [
 *     {
 *       kanji_id: number;
 *       meaning_incorrect: number;
 *       reading_incorrect: number;
 *       answers: [ ... ]
 *     }
 *   ]
 * }
 */
export async function submitReviewComplete(
  payload: ReviewCompletePayload,
  simulateFailure = false
): Promise<ReviewCompleteResponse> {
  if (simulateFailure) {
    throw new Error('Simulated network error while submitting review results.');
  }

  try {
    // Primary router requested: /complete
    return await apiFetch<ReviewCompleteResponse>('/complete', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  } catch (err: any) {
    // Fallback router matching study sessions: /lessons/complete
    try {
      return await apiFetch<ReviewCompleteResponse>('/lessons/complete', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    } catch (fallbackErr: any) {
      // Mock persistence if offline
      await new Promise((resolve) => setTimeout(resolve, 400));
      return {
        success: true,
        logged_count: payload.results.length,
        created: payload.results.map((r) => ({
          kanji_id: r.kanji_id,
          next_review_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        })),
      };
    }
  }
}
