export type NavTab =
  | 'home'
  | 'learn'
  | 'progress'
  | 'settings'
  | 'dashboard'
  | 'learn-session'
  | 'review-session'
  | 'story-reader';


export type RawBackendKanji = {
  id: number;
  character?: string;
  kanji?: string;
  meaning?: string | null;
  meanings?: string[] | null;
  onyomi?: string | string[] | null;
  kunyomi?: string | string[] | null;
  radical?: string | null;
  jlpt_level?: number | string | null;
  curriculumn_order?: number | null;
  stroke_count?: number | null;
  strokes?: number | null;
  mnemonic?: string | null;
  examples?: { word: string; reading: string; meaning: string }[] | null;
};

export type LessonKanji = {
  id: number;
  character: string;
  meanings: string[];
  onyomi: string[];
  kunyomi: string[];
  stroke_count?: number;
  strokes?: number;
  examples?: { word: string; reading: string; meaning: string }[];
  mnemonic?: string;

  // Additional backend metadata from FastAPI
  meaning?: string;
  radical?: string;
  jlpt_level?: number | string | null;
  curriculumn_order?: number | null;
};

export type QuestionType =
  | 'kanji_to_romaji_english'
  | 'english_to_hiragana'
  | 'sentence_translation'
  | 'stroke_draw'
  | 'meaning'
  | 'reading'
  | 'english_to_kanji';

export type DrawingStage = 'guided' | 'outline' | 'blank';

export interface SentenceQuestionData {
  japaneseSentence: string;
  furigana: string;
  targetKanji: string;
  options: string[];
  correctAnswer: string;
  englishExplanation?: string;
}

export type QuizQuestion = {
  id: string;
  kanji: LessonKanji;
  type: QuestionType;
  prompt: string;
  drawingStage?: DrawingStage;
  sentenceData?: SentenceQuestionData;
  options?: string[];
  correctAnswer?: string;
};

export type AnswerRecord = {
  question_type: QuestionType;
  correct: boolean;
  response_ms: number;
  userInput?: string;
};

export type KanjiSessionOutcome = {
  kanji_id: number;
  meaning_incorrect: number;
  reading_incorrect: number;
  first_try_meaning: boolean;
  first_try_reading: boolean;
  answers: AnswerRecord[];
};

export type LessonCompletePayload = {
  results: {
    kanji_id: number;
    meaning_incorrect: number;
    reading_incorrect: number;
    answers: {
      question_type: QuestionType;
      correct: boolean;
      response_ms: number;
    }[];
  }[];
};

export type LessonCompleteResponse = {
  created: { kanji_id: number; next_review_at: string }[];
};

/**
 * Pydantic/SQLAlchemy model mapping for review_log table:
 * class Review(Base):
 *   id: int
 *   user_id: int
 *   kanji_id: int
 *   reviewed_at: datetime
 *   quality: int (0-5 SM-2 grade)
 *   meaning_incorrect: int
 *   reading_incorrect: int
 *   response_ms: int (median)
 *   ease_factor_before: float
 *   ease_factor_after: float
 *   interval_before: float (days)
 *   interval_after: float (days)
 */
export interface ReviewLogEntry {
  id?: number;
  user_id: number;
  kanji_id: number;
  reviewed_at: string; // ISO 8601 string
  quality: number; // SM-2 grade 0-5
  meaning_incorrect: number;
  reading_incorrect: number;
  response_ms: number; // median across answers in ms
  ease_factor_before: number;
  ease_factor_after: number;
  interval_before: number; // in days
  interval_after: number;  // in days
}

export interface ReviewItem {
  id?: number;
  kanji: LessonKanji;
  user_id?: number;
  ease_factor_before: number;
  interval_before: number; // in days
  repetitions?: number;
  last_reviewed_at?: string;
  next_review_at?: string;
}

export interface StudiedKanjiItem {
  id: number;
  character: string;
  meaning: string;
  jlpt_level?: number | string | null;
  curriculumn_order?: number | null;
  onyomi?: string | string[] | null;
  kunyomi?: string | string[] | null;
  radical?: string | null;
  stroke_count?: number | null;
}

export interface ReviewSessionOutcome {
  kanji: LessonKanji;
  meaning_incorrect: number;
  reading_incorrect: number;
  response_ms: number;
  answers: AnswerRecord[];
  reviewLog?: ReviewLogEntry;
}

export type ReviewCompletePayload = {
  results: {
    kanji_id: number;
    meaning_incorrect: number;
    reading_incorrect: number;
    answers: {
      question_type: QuestionType;
      correct: boolean;
      response_ms: number;
    }[];
  }[];
};

export interface ReviewCompleteResponse {
  success?: boolean;
  logged_count?: number;
  created?: { kanji_id: number; next_review_at?: string }[];
  reviews?: ReviewLogEntry[];
}

export interface KanjiItem {
  id: string;
  kanji: string;
  meaning: string;
  kunyomi: string;
  onyomi: string;
  romaji: string;
  jlpt: 'N5' | 'N4' | 'N3' | 'N2' | 'N1';
  strokes: number;
  radicals: string[];
  mnemonic: string;
  examples: {
    japanese: string;
    reading: string;
    meaning: string;
  }[];
}

export interface UserStats {
  streakDays: number;
  kanjiLearned: number;
  reviewsDue: number;
  jlptGoal: string;
  accuracy: number;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarChar: string;
  jlptGoal: string;
  streakDays: number;
  kanjiLearned: number;
}

/**
 * Story Generator Schema requested by user:
 *
 * type Segment = { text: string; reading?: string };
 * type Vocab = { word: string; dictionary_form: string; meaning: string };
 * type StorySentence = { segments: Segment[]; english: string; vocab: Vocab[] };
 * type Story = { title: string; title_english: string; sentences: StorySentence[] };
 *
 * Payload sent to POST /generate-story:
 * { kanji: list[str], num_sentences: int, level: str }
 */
export type Segment = { text: string; reading?: string };
export type Vocab = { word: string; dictionary_form: string; meaning: string };
export type StorySentence = { segments: Segment[]; english: string; vocab: Vocab[] };
export type Story = { title: string; title_english: string; sentences: StorySentence[] };

export interface StoryGenerateRequest {
  kanji: string[];
  num_sentences: number;
  level: string; // 'N5' | 'N4' | 'N3' | 'N2' | 'N1'
}

export type StorySegmentToken = Segment;
export type StoryGenerateResponse = Story & {
  level?: string;
  kanji?: string[];
};


