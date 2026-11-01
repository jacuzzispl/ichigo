import {
  StoryGenerateRequest,
  StoryGenerateResponse,
  Story,
  StorySentence,
  Segment,
  Vocab,
  StudiedKanjiItem,
} from '../types';
import { MOCK_STUDIED_KANJI } from './reviews';

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
 * Common dictionary definitions and readings for kanji
 */
export const KANJI_METADATA_MAP: Record<
  string,
  { reading: string; meaning: string; dict: string }
> = {
  '山': { reading: 'やま', meaning: 'mountain', dict: '山' },
  '水': { reading: 'みず', meaning: 'water', dict: '水' },
  '火': { reading: 'ひ', meaning: 'fire', dict: '火' },
  '木': { reading: 'き', meaning: 'tree', dict: '木' },
  '日': { reading: 'ひ', meaning: 'day, sun', dict: '日' },
  '月': { reading: 'つき', meaning: 'moon, month', dict: '月' },
  '金': { reading: 'かね', meaning: 'gold, money', dict: '金' },
  '土': { reading: 'つち', meaning: 'soil, earth', dict: '土' },
  '川': { reading: 'かわ', meaning: 'river', dict: '川' },
  '花': { reading: 'はな', meaning: 'flower', dict: '花' },
  '雨': { reading: 'あめ', meaning: 'rain', dict: '雨' },
  '空': { reading: 'そら', meaning: 'sky', dict: '空' },
  '海': { reading: 'うみ', meaning: 'sea, ocean', dict: '海' },
  '風': { reading: 'かぜ', meaning: 'wind', dict: '風' },
  '人': { reading: 'ひと', meaning: 'person', dict: '人' },
  '子': { reading: 'こ', meaning: 'child', dict: '子' },
  '学': { reading: 'まな', meaning: 'study, learn', dict: '学ぶ' },
  '校': { reading: 'こう', meaning: 'school', dict: '学校' },
  '生': { reading: 'い', meaning: 'life, live', dict: '生きる' },
  '先': { reading: 'さき', meaning: 'ahead, before', dict: '先' },
  '本': { reading: 'ほん', meaning: 'book, origin', dict: '本' },
  '友': { reading: 'とも', meaning: 'friend', dict: '友達' },
  '車': { reading: 'くるま', meaning: 'car, vehicle', dict: '車' },
  '道': { reading: 'みち', meaning: 'road, way', dict: '道' },
  '飲': { reading: 'の', meaning: 'to drink', dict: '飲む' },
  '食': { reading: 'た', meaning: 'to eat', dict: '食べる' },
  '見': { reading: 'み', meaning: 'to see, watch', dict: '見る' },
  '聞': { reading: 'き', meaning: 'to hear, listen', dict: '聞く' },
  '行': { reading: 'い', meaning: 'to go', dict: '行く' },
  '来': { reading: 'く', meaning: 'to come', dict: '来る' },
  '出': { reading: 'で', meaning: 'to exit, leave', dict: '出る' },
  '入': { reading: 'はい', meaning: 'to enter', dict: '入る' },
  '大': { reading: 'おお', meaning: 'big, large', dict: '大きい' },
  '小': { reading: 'ちい', meaning: 'small, little', dict: '小さい' },
  '新': { reading: 'あたら', meaning: 'new', dict: '新しい' },
  '古': { reading: 'ふる', meaning: 'old', dict: '古い' },
  '白': { reading: 'しろ', meaning: 'white', dict: '白い' },
  '黒': { reading: 'くろ', meaning: 'black', dict: '黒い' },
  '赤': { reading: 'あか', meaning: 'red', dict: '赤い' },
  '青': { reading: 'あお', meaning: 'blue', dict: '青い' },
  '一': { reading: 'ひと', meaning: 'one', dict: '一' },
  '二': { reading: 'ふた', meaning: 'two', dict: '二' },
  '三': { reading: 'みっ', meaning: 'three', dict: '三' },
  '四': { reading: 'よん', meaning: 'four', dict: '四' },
  '五': { reading: 'いつ', meaning: 'five', dict: '五' },
};

/**
 * Fetches all kanji that have already been studied from GET /studied.
 */
export async function getStudiedKanji(): Promise<StudiedKanjiItem[]> {
  try {
    const raw = await apiFetch<any[]>('/studied');
    return normalizeStudiedList(raw);
  } catch (err: any) {
    try {
      const alt = await apiFetch<any[]>('/reviews/studied');
      return normalizeStudiedList(alt);
    } catch {
      console.warn('Backend GET /studied not reachable, using studied pool fallback:', err.message);
      await new Promise((r) => setTimeout(r, 200));
      return MOCK_STUDIED_KANJI;
    }
  }
}

function normalizeStudiedList(rawList: any): StudiedKanjiItem[] {
  if (!Array.isArray(rawList)) return [];

  return rawList.map((item, idx) => {
    if (typeof item === 'string') {
      const info = KANJI_METADATA_MAP[item];
      return {
        id: idx + 1,
        character: item,
        meaning: info ? info.meaning : 'Studied Kanji',
        jlpt_level: 5,
      };
    }

    const char = item.character || item.kanji || item.char || '？';
    const meaning =
      item.meaning ||
      (Array.isArray(item.meanings) ? item.meanings.join(', ') : '') ||
      KANJI_METADATA_MAP[char]?.meaning ||
      'Studied Kanji';

    return {
      id: Number(item.id ?? idx + 1),
      character: char,
      meaning: typeof meaning === 'string' ? meaning : 'Meaning',
      jlpt_level: item.jlpt_level ?? 5,
      curriculumn_order: item.curriculumn_order ?? null,
      onyomi: item.onyomi ?? null,
      kunyomi: item.kunyomi ?? null,
      radical: item.radical ?? null,
    };
  });
}

/**
 * Normalizes any backend response into the exact target schema:
 * {
 *   title: string,
 *   title_english: string,
 *   sentences: [
 *     {
 *       segments: [ { text: "山", reading: "やま" }, { text: "に" } ],
 *       english: "There is water on the mountain.",
 *       vocab: [ { word: "山", dictionary_form: "山", meaning: "mountain" } ]
 *     }
 *   ]
 * }
 */
export function normalizeStoryResponse(data: any): Story {
  if (!data) throw new Error('Empty response from story generator');

  const title = data.title || '日本語の物語';
  const title_english = data.title_english || data.english_title || 'Japanese Story';

  let rawSentences = data.sentences;
  if (!Array.isArray(rawSentences)) {
    rawSentences = [];
  }

  const sentences: StorySentence[] = rawSentences.map((s: any, idx: number) => {
    // If sentence already matches new schema: { segments, english, vocab }
    if (s && Array.isArray(s.segments)) {
      return {
        segments: s.segments.map((seg: any) => ({
          text: String(seg.text || ''),
          ...(seg.reading ? { reading: String(seg.reading) } : {}),
        })),
        english: String(s.english || `Sentence ${idx + 1}`),
        vocab: Array.isArray(s.vocab)
          ? s.vocab.map((v: any) => ({
              word: String(v.word || ''),
              dictionary_form: String(v.dictionary_form || v.word || ''),
              meaning: String(v.meaning || ''),
            }))
          : [],
      };
    }

    // If sentence was sent in older array format: [ { text, reading } ]
    if (Array.isArray(s)) {
      const segments: Segment[] = s.map((seg: any) => ({
        text: String(seg.text || ''),
        ...(seg.reading ? { reading: String(seg.reading) } : {}),
      }));

      // Infer vocab from segments that have kanji/reading
      const vocab: Vocab[] = segments
        .filter((seg) => seg.reading)
        .map((seg) => {
          const info = KANJI_METADATA_MAP[seg.text];
          return {
            word: seg.text,
            dictionary_form: info?.dict || seg.text,
            meaning: info?.meaning || 'vocab word',
          };
        });

      return {
        segments,
        english: segments.map((seg) => seg.text).join(''),
        vocab,
      };
    }

    return {
      segments: [{ text: String(s) }],
      english: '',
      vocab: [],
    };
  });

  return {
    title,
    title_english,
    sentences,
  };
}

/**
 * Sends request to POST /generate-story
 * Payload schema:
 * { kanji: list[str], num_sentences: int, level: str }
 */
export async function generateStory(
  payload: StoryGenerateRequest
): Promise<StoryGenerateResponse> {
  try {
    const rawResponse = await apiFetch<any>('/generate-story', {
      method: 'POST',
      body: JSON.stringify({
        kanji: payload.kanji,
        num_sentences: payload.num_sentences,
        level: payload.level,
      }),
    });

    const story = normalizeStoryResponse(rawResponse);
    return {
      ...story,
      level: payload.level,
      kanji: payload.kanji,
    };
  } catch (err: any) {
    console.warn('Backend POST /generate-story not reachable, generating authentic structured story fallback:', err.message);
    await new Promise((r) => setTimeout(r, 500));
    const fallbackStory = buildFallbackStory(payload);
    return {
      ...fallbackStory,
      level: payload.level,
      kanji: payload.kanji,
    };
  }
}

/**
 * Fallback story generator strictly matching the new schema:
 * - Actual kanji is in segment.text, with kana reading in segment.reading!
 * - Okurigana is split into separate segment without reading.
 * - Each sentence includes english translation and vocab glosses.
 */
function buildFallbackStory(req: StoryGenerateRequest): Story {
  const chosen = req.kanji.length > 0 ? req.kanji : ['山', '水'];
  const count = Math.min(Math.max(req.num_sentences, 1), 8);
  const primary = chosen[0];
  const secondary = chosen[1] || (chosen[0] === '水' ? '火' : '水');

  const pMeta = KANJI_METADATA_MAP[primary] || { reading: 'かんじ', meaning: primary, dict: primary };
  const sMeta = KANJI_METADATA_MAP[secondary] || { reading: 'ことば', meaning: secondary, dict: secondary };

  const title = `${primary}の${secondary}`;
  const title_english = `${capitalize(pMeta.meaning.split(',')[0])} and ${capitalize(sMeta.meaning.split(',')[0])}`;

  // Rich sentence templates strictly following the user's schema:
  // e.g. { text: "飲", reading: "の" }, { text: "みます" }
  const templateBank: StorySentence[] = [
    {
      segments: [
        { text: primary, reading: pMeta.reading },
        { text: "に" },
        { text: secondary, reading: sMeta.reading },
        { text: "が" },
        { text: "あります" },
        { text: "。" }
      ],
      english: `There is ${sMeta.meaning.split(',')[0]} on the ${pMeta.meaning.split(',')[0]}.`,
      vocab: [
        { word: primary, dictionary_form: pMeta.dict, meaning: pMeta.meaning },
        { word: secondary, dictionary_form: sMeta.dict, meaning: sMeta.meaning },
        { word: "あります", dictionary_form: "ある", meaning: "to exist, to be (inanimate)" }
      ]
    },
    {
      segments: [
        { text: "火", reading: "ひ" },
        { text: "で" },
        { text: secondary, reading: sMeta.reading },
        { text: "を" },
        { text: "あたためます" },
        { text: "。" }
      ],
      english: `I warm the ${sMeta.meaning.split(',')[0]} with fire.`,
      vocab: [
        { word: "火", dictionary_form: "火", meaning: "fire" },
        { word: secondary, dictionary_form: sMeta.dict, meaning: sMeta.meaning },
        { word: "あたためます", dictionary_form: "あたためる", meaning: "to warm up, to heat" }
      ]
    },
    {
      segments: [
        { text: secondary, reading: sMeta.reading },
        { text: "を" },
        { text: "飲", reading: "の" },
        { text: "みます" },
        { text: "。" }
      ],
      english: `I drink the ${sMeta.meaning.split(',')[0]}.`,
      vocab: [
        { word: secondary, dictionary_form: sMeta.dict, meaning: sMeta.meaning },
        { word: "飲みます", dictionary_form: "飲む", meaning: "to drink" }
      ]
    },
    {
      segments: [
        { text: "今日", reading: "きょう" },
        { text: "は" },
        { text: primary, reading: pMeta.reading },
        { text: "が" },
        { text: "とても" },
        { text: "静", reading: "しず" },
        { text: "かです" },
        { text: "。" }
      ],
      english: `Today the ${pMeta.meaning.split(',')[0]} is very quiet.`,
      vocab: [
        { word: "今日", dictionary_form: "今日", meaning: "today" },
        { word: primary, dictionary_form: pMeta.dict, meaning: pMeta.meaning },
        { word: "静か", dictionary_form: "静か", meaning: "quiet, peaceful" }
      ]
    },
    {
      segments: [
        { text: "友", reading: "とも" },
        { text: "だち" },
        { text: "と" },
        { text: "一緒", reading: "いっしょ" },
        { text: "に" },
        { text: "歩", reading: "ある" },
        { text: "きます" },
        { text: "。" }
      ],
      english: "I walk together with my friend.",
      vocab: [
        { word: "友達", dictionary_form: "友達", meaning: "friend" },
        { word: "一緒に", dictionary_form: "一緒", meaning: "together" },
        { word: "歩きます", dictionary_form: "歩く", meaning: "to walk" }
      ]
    },
    {
      segments: [
        { text: "青", reading: "あお" },
        { text: "い" },
        { text: "空", reading: "そら" },
        { text: "を" },
        { text: "見", reading: "み" },
        { text: "ました" },
        { text: "。" }
      ],
      english: "I looked up at the blue sky.",
      vocab: [
        { word: "青い", dictionary_form: "青い", meaning: "blue" },
        { word: "空", dictionary_form: "空", meaning: "sky" },
        { word: "見ました", dictionary_form: "見る", meaning: "to look, to see" }
      ]
    },
    {
      segments: [
        { text: "新", reading: "あたら" },
        { text: "しい" },
        { text: "一日", reading: "いちにち" },
        { text: "が" },
        { text: "始", reading: "はじ" },
        { text: "まります" },
        { text: "。" }
      ],
      english: "A brand new day begins.",
      vocab: [
        { word: "新しい", dictionary_form: "新しい", meaning: "new, fresh" },
        { word: "一日", dictionary_form: "一日", meaning: "one day, whole day" },
        { word: "始まります", dictionary_form: "始まる", meaning: "to begin, to start" }
      ]
    },
    {
      segments: [
        { text: "心", reading: "こころ" },
        { text: "が" },
        { text: "明", reading: "あか" },
        { text: "るく" },
        { text: "なりました" },
        { text: "。" }
      ],
      english: "My heart felt brighter.",
      vocab: [
        { word: "心", dictionary_form: "心", meaning: "heart, mind, spirit" },
        { word: "明るい", dictionary_form: "明るい", meaning: "bright, cheerful" },
        { word: "なりました", dictionary_form: "なる", meaning: "to become" }
      ]
    }
  ];

  const sentences: StorySentence[] = [];
  for (let i = 0; i < count; i++) {
    const idx = i % templateBank.length;
    sentences.push(templateBank[idx]);
  }

  return {
    title,
    title_english,
    sentences,
  };
}

function capitalize(s: string): string {
  if (!s) return '';
  return s.charAt(0).toUpperCase() + s.slice(1);
}
