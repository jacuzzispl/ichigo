export type NavTab = 'home' | 'learn' | 'progress' | 'settings' | 'dashboard' | 'learn-session';

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
    aracter: string;
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
  | 'reading';

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
