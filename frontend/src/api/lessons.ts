import { LessonKanji, LessonCompletePayload, LessonCompleteResponse } from '../types';

export const USE_MOCK = false;

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
 * Safely parses any value (string with commas, array of strings, or null/undefined)
 * into a clean array of strings.
 */
export function parseStringOrArray(val: unknown): string[] {
  if (!val) return [];
  if (Array.isArray(val)) {
    return val
      .map((item) => (typeof item === 'string' ? item.trim() : String(item).trim()))
      .filter(Boolean);
  }
  if (typeof val === 'string') {
    return val
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return [];
}

/**
 * Normalizes either raw backend API objects (e.g. FastAPI returning string fields like
 * meaning: "vehicle, wheel, car", onyomi: "shu, zu", kunyomi: null)
 * or mock objects into the standard LessonKanji format.
 */
export function adaptApiKanjiToLessonKanji(item: any): LessonKanji {
  if (!item) {
    return {
      id: 0,
      character: '？',
      meanings: ['Unknown'],
      onyomi: [],
      kunyomi: [],
      stroke_count: 1,
      examples: [],
    };
  }

  const character = item.character || item.kanji || '';
  const parsedMeanings =
    parseStringOrArray(item.meanings).length > 0
      ? parseStringOrArray(item.meanings)
      : parseStringOrArray(item.meaning);

  const onyomi = parseStringOrArray(item.onyomi);
  const kunyomi = parseStringOrArray(item.kunyomi);

  const strokeCount =
    Number(item.stroke_count) ||
    Number(item.strokes) ||
    (FALLBACK_STROKE_COUNTS[character]) ||
    4;

  const meanings = parsedMeanings.length > 0 ? parsedMeanings : ['Meaning pending'];

  return {
    id: Number(item.id ?? 0),
    character,
    meanings,
    onyomi,
    kunyomi,
    stroke_count: strokeCount,
    examples: Array.isArray(item.examples) ? item.examples : [],
    mnemonic: item.mnemonic || undefined,
    // Preserve raw API properties for display
    meaning: typeof item.meaning === 'string' ? item.meaning : meanings.join(', '),
    radical: item.radical || undefined,
    jlpt_level: item.jlpt_level ?? undefined,
    curriculumn_order: item.curriculumn_order ?? undefined,
  };
}

const FALLBACK_STROKE_COUNTS: Record<string, number> = {
  '一': 1,
  '二': 2,
  '十': 2,
  '人': 2,
  '山': 3,
  '大': 3,
  '小': 3,
  '口': 3,
  '日': 4,
  '月': 4,
  '水': 4,
  '火': 4,
  '木': 4,
  '手': 4,
  '先': 6,
  '見': 7,
  '車': 7,
  '青': 8,
  '金': 8,
  '校': 10,
};

export const MOCK_KANJI_POOL: any[] = [
  {
    id: 2,
    jlpt_level: 1,
    onyomi: 'kou',
    radical: '木',
    curriculumn_order: null,
    character: '校',
    meaning: 'school',
    meanings: ['School'],
    kunyomi: null,
    stroke_count: 10,
    mnemonic: 'A tree (木) planted beside the gate where students gather to learn.',
    examples: [
      { word: '学校', reading: 'がっこう', meaning: 'School' },
      { word: '高校', reading: 'こうこう', meaning: 'High school' },
      { word: '校長', reading: 'こうちょう', meaning: 'Principal' },
    ],
  },
  {
    id: 3,
    jlpt_level: 1,
    onyomi: 'shu, zu',
    radical: '⼿',
    curriculumn_order: null,
    character: '手',
    meaning: 'hand',
    meanings: ['Hand'],
    kunyomi: 'te, ta',
    stroke_count: 4,
    mnemonic: 'Lines outlining the palm and outstretched fingers of an open hand.',
    examples: [
      { word: '手紙', reading: 'てがみ', meaning: 'Letter' },
      { word: '右手', reading: 'みぎて', meaning: 'Right hand' },
      { word: '上手', reading: 'じょうず', meaning: 'Skilled / Good at' },
    ],
  },
  {
    id: 4,
    jlpt_level: 1,
    onyomi: 'juu',
    radical: '⼗',
    curriculumn_order: null,
    character: '十',
    meaning: 'ten',
    meanings: ['Ten'],
    kunyomi: 'too, to',
    stroke_count: 2,
    mnemonic: 'The crossroads uniting all horizontal and vertical digits into TEN.',
    examples: [
      { word: '十', reading: 'じゅう', meaning: 'Ten' },
      { word: '十月', reading: 'じゅうがつ', meaning: 'October' },
      { word: '十分', reading: 'じゅっぷん', meaning: 'Ten minutes' },
    ],
  },
  {
    id: 5,
    jlpt_level: 1,
    onyomi: 'ken',
    radical: '⾒',
    curriculumn_order: null,
    character: '見',
    meaning: 'see',
    meanings: ['See', 'Look'],
    kunyomi: 'mi, miru, mieru, miseru',
    stroke_count: 7,
    mnemonic: 'A large watchful eye (目) sitting atop two walking human legs (儿).',
    examples: [
      { word: '見る', reading: 'みる', meaning: 'To see / look' },
      { word: '意見', reading: 'いけん', meaning: 'Opinion' },
      { word: '見学', reading: 'けんがく', meaning: 'Study tour / Inspection' },
    ],
  },
  {
    id: 6,
    jlpt_level: 1,
    onyomi: 'ni',
    radical: '⼆',
    curriculumn_order: null,
    character: '二',
    meaning: 'two',
    meanings: ['Two'],
    kunyomi: 'futa, futatsu, futari',
    stroke_count: 2,
    mnemonic: 'Two parallel strokes representing earth below and sky above: TWO.',
    examples: [
      { word: '二つ', reading: 'ふたつ', meaning: 'Two things' },
      { word: '二月', reading: 'にがつ', meaning: 'February' },
      { word: '二人', reading: 'ふたり', meaning: 'Two people' },
    ],
  },
  {
    id: 7,
    jlpt_level: 1,
    onyomi: 'sei, shou',
    radical: '⻘',
    curriculumn_order: null,
    character: '青',
    meaning: 'blue',
    meanings: ['Blue', 'Green'],
    kunyomi: 'ao, aoi',
    stroke_count: 8,
    mnemonic: 'The fresh, pure azure tint of a clear spring morning.',
    examples: [
      { word: '青い', reading: 'あおい', meaning: 'Blue' },
      { word: '青空', reading: 'あおぞら', meaning: 'Blue sky' },
      { word: '青年', reading: 'せいねん', meaning: 'Youth' },
    ],
  },
  {
    id: 8,
    jlpt_level: 1,
    onyomi: 'sen',
    radical: '⼉',
    curriculumn_order: null,
    character: '先',
    meaning: 'ahead',
    meanings: ['Ahead', 'Previous'],
    kunyomi: 'saki',
    stroke_count: 6,
    mnemonic: 'Legs walking forward, advancing ahead into the future.',
    examples: [
      { word: '先生', reading: 'せんせい', meaning: 'Teacher' },
      { word: '先月', reading: 'せんげつ', meaning: 'Last month' },
      { word: '先', reading: 'さき', meaning: 'Ahead / Tip' },
    ],
  },
  {
    id: 9,
    jlpt_level: 1,
    onyomi: 'shou',
    radical: '⼩',
    curriculumn_order: null,
    character: '小',
    meaning: 'small',
    meanings: ['Small', 'Little'],
    kunyomi: 'chii, chiisai, ko, o',
    stroke_count: 3,
    mnemonic: 'A tiny drop split in two by a fine dividing line, small and delicate.',
    examples: [
      { word: '小さい', reading: 'ちいさい', meaning: 'Small' },
      { word: '小学校', reading: 'しょうがっこう', meaning: 'Elementary school' },
      { word: '小川', reading: 'おがわ', meaning: 'Brook / Stream' },
    ],
  },
  {
    id: 10,
    jlpt_level: 1,
    onyomi: 'sha',
    radical: '⾞',
    curriculumn_order: null,
    character: '車',
    meaning: 'vehicle, wheel, car',
    meanings: ['Vehicle', 'Wheel', 'Car'],
    kunyomi: 'kuruma',
    stroke_count: 7,
    mnemonic: 'An overhead view of a wooden handcart with an axle and wheels.',
    examples: [
      { word: '車', reading: 'くるま', meaning: 'Car' },
      { word: '電車', reading: 'でんしゃ', meaning: 'Train' },
      { word: '自転車', reading: 'じてんしゃ', meaning: 'Bicycle' },
    ],
  },
  {
    id: 11,
    jlpt_level: 1,
    onyomi: 'kin, kon',
    radical: '⾦',
    curriculumn_order: null,
    character: '金',
    meaning: 'metal, gold, money',
    meanings: ['Metal', 'Gold', 'Money'],
    kunyomi: 'kane, kana',
    stroke_count: 8,
    mnemonic: 'Lumps of precious gold nuggets found under the roof of the earth.',
    examples: [
      { word: 'お金', reading: 'おかね', meaning: 'Money' },
      { word: '金曜日', reading: 'きんようび', meaning: 'Friday' },
      { word: '金色', reading: 'きんいろ', meaning: 'Golden color' },
    ],
  },
];

export const FALLBACK_MEANING_DISTRACTORS = [
  'Gold',
  'Soil',
  'Year',
  'Child',
  'Heaven',
  'River',
  'Rain',
  'Wind',
  'Book',
  'Eye',
];

export const FALLBACK_READING_DISTRACTORS = [
  'キン',
  'かね',
  'ド',
  'つち',
  'ネン',
  'とし',
  'シ',
  'こ',
  'テン',
  'あめ',
];

export async function getLessonBatch(limit = 5): Promise<LessonKanji[]> {
  if (USE_MOCK) {
    // Return first `limit` kanji from mock pool, mapped through adapter
    await new Promise((resolve) => setTimeout(resolve, 300));
    return MOCK_KANJI_POOL.slice(0, limit).map(adaptApiKanjiToLessonKanji);
  }

  const rawList = await apiFetch<any[]>(`/study`);
  return (Array.isArray(rawList) ? rawList : []).map(adaptApiKanjiToLessonKanji);
}

export async function submitLessonResults(
  payload: LessonCompletePayload,
  simulateFailure = false
): Promise<LessonCompleteResponse> {
  if (USE_MOCK) {
    await new Promise((resolve) => setTimeout(resolve, 600));

    if (simulateFailure) {
      throw new Error('Simulated network error while submitting lesson results.');
    }

    const now = new Date();
    const nextReview = new Date(now.getTime() + 4 * 60 * 60 * 1000).toISOString();
    return {
      created: payload.results.map((r) => ({
        kanji_id: r.kanji_id,
        next_review_at: nextReview,
      })),
    };
  }

  console.log(JSON.stringify(payload))
  return apiFetch<LessonCompleteResponse>('/lessons/complete', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
