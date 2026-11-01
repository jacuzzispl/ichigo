import React, { useState, useEffect, useRef } from 'react';
import {
  LessonKanji,
  ReviewSessionOutcome,
  UserProfile,
  AnswerRecord,
  QuizQuestion,
} from '../../types';
import { getDueReviews } from '../../api/reviews';
import { ReviewCard } from './ReviewCard';
import { EnglishToKanjiCard } from '../lesson/questions/EnglishToKanjiCard';
import { ReviewStrokeCard } from "../review/ReviewStrokeCard"
import { ReviewSummary } from './ReviewSummary';
import { CustomReviewModal } from './CustomReviewModal';
import { shuffleArray } from '../../library/quizQueue';

interface ReviewSessionProps {
  user: UserProfile | null;
  onFinish: () => void;
  initialKanjiList?: LessonKanji[];
}

type SessionPhase = 'review' | 'summary';

type ReviewStep =
  | 'kanji_to_english'
  | 'kanji_to_kana'
  | 'english_to_kanji'
  | 'stroke_drawing';

interface ActiveKanjiStats {
  meaningErrors: number;
  readingErrors: number;
  answers: AnswerRecord[];
  allResponseTimes: number[];
}

const FALLBACK_DISTRACTOR_CHARS = [
  '日', '月', '木', '水', '火', '金', '土', '山', '川', '大', '小', '人', '校', '年', '手', '先', '生', '学',
];

export const ReviewSession: React.FC<ReviewSessionProps> = ({
  user,
  onFinish,
  initialKanjiList,
}) => {
  const [phase, setPhase] = useState<SessionPhase>('review');
  const [kanjiList, setKanjiList] = useState<LessonKanji[]>(initialKanjiList || []);
  const [loading, setLoading] = useState(!initialKanjiList);
  const [error, setError] = useState<string | null>(null);
  const [isCustomReview, setIsCustomReview] = useState(Boolean(initialKanjiList));
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);

  // Active review question state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentStep, setCurrentStep] = useState<ReviewStep>('kanji_to_english');

  // Answer states for the active step
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  // Stats tracking for current kanji
  const [activeStats, setActiveStats] = useState<ActiveKanjiStats>({
    meaningErrors: 0,
    readingErrors: 0,
    answers: [],
    allResponseTimes: [],
  });

  // Collected outcomes across all reviewed kanji
  const [outcomes, setOutcomes] = useState<ReviewSessionOutcome[]>([]);

  const fetchDueKanji = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getDueReviews();
      setKanjiList(data);
      setCurrentIndex(0);
      setCurrentStep('kanji_to_english');
      setIsAnswered(false);
      setIsCorrect(null);
      setSelectedAnswer(null);
      setOutcomes([]);
    } catch (err: any) {
      setError(err.message || 'Failed to load reviews from `/review`.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!initialKanjiList) {
      fetchDueKanji();
    }
  }, [initialKanjiList]);

  const currentKanji = kanjiList[currentIndex];
  const outlineBgImage = '/src/assets/images/sakura_outline_topright_1791579194144.jpg';

  // Build English-to-Kanji multiple choice options using other kanji from the batch as distractors
  const getEnglishToKanjiOptions = (): string[] => {
    if (!currentKanji) return [];
    const otherChars = kanjiList
      .filter((k) => k.character !== currentKanji.character)
      .map((k) => k.character);

    const pool = [
      ...otherChars,
      ...FALLBACK_DISTRACTOR_CHARS.filter((c) => c !== currentKanji.character),
    ];
    const distractors = shuffleArray(Array.from(new Set(pool))).slice(0, 3);
    return shuffleArray([currentKanji.character, ...distractors]);
  };

  // Start custom review from modal
  const handleStartCustomReview = (selected: LessonKanji[]) => {
    if (selected.length === 0) return;
    setKanjiList(selected);
    setIsCustomReview(true);
    setCurrentIndex(0);
    setCurrentStep('kanji_to_english');
    setIsAnswered(false);
    setIsCorrect(null);
    setSelectedAnswer(null);
    setActiveStats({
      meaningErrors: 0,
      readingErrors: 0,
      answers: [],
      allResponseTimes: [],
    });
    setOutcomes([]);
    setPhase('review');
  };

  // Submit answer for standard recall cards
  const handleAnswerSubmit = (correct: boolean, userInput: string, responseMs: number) => {
    setIsAnswered(true);
    setIsCorrect(correct);
    setSelectedAnswer(userInput);

    const isMeaningQuestion =
      currentStep === 'kanji_to_english' || currentStep === 'english_to_kanji';

    setActiveStats((prev) => ({
      meaningErrors: isMeaningQuestion && !correct ? prev.meaningErrors + 1 : prev.meaningErrors,
      readingErrors: !isMeaningQuestion && !correct ? prev.readingErrors + 1 : prev.readingErrors,
      allResponseTimes: [...prev.allResponseTimes, responseMs],
      answers: [
        ...prev.answers,
        {
          question_type:
            currentStep === 'kanji_to_english'
              ? 'meaning'
              : currentStep === 'english_to_kanji'
              ? 'english_to_kanji'
              : 'reading',
          correct,
          response_ms: responseMs,
          userInput,
        },
      ],
    }));
  };

  // Advance to next step for the current kanji, or to next kanji
  const handleContinue = () => {
    if (!currentKanji) return;

    if (currentStep === 'kanji_to_english') {
      setCurrentStep('kanji_to_kana');
      setIsAnswered(false);
      setIsCorrect(null);
      setSelectedAnswer(null);
    } else if (currentStep === 'kanji_to_kana') {
      setCurrentStep('english_to_kanji');
      setIsAnswered(false);
      setIsCorrect(null);
      setSelectedAnswer(null);
    } else if (currentStep === 'english_to_kanji') {
      // Advance to progressive stroke drawing!
      setCurrentStep('stroke_drawing');
      setIsAnswered(false);
      setIsCorrect(null);
      setSelectedAnswer(null);
    }
  };

  // Stroke drawing completion handler
  const handleStrokeComplete = (firstTry: boolean, errorCount: number, responseMs: number) => {
    if (!currentKanji) return;

    const updatedAnswers: AnswerRecord[] = [
      ...activeStats.answers,
      {
        question_type: 'stroke_draw',
        correct: firstTry,
        response_ms: responseMs,
        userInput: `strokes-${errorCount}-errors`,
      },
    ];

    const allTimes = [...activeStats.allResponseTimes, responseMs].sort((a, b) => a - b);
    const medianMs =
      allTimes.length > 0 ? Math.round(allTimes[Math.floor(allTimes.length / 2)]) : responseMs;

    const outcome: ReviewSessionOutcome = {
      kanji: currentKanji,
      meaning_incorrect: activeStats.meaningErrors,
      reading_incorrect: activeStats.readingErrors + (firstTry ? 0 : 1),
      response_ms: medianMs,
      answers: updatedAnswers,
    };

    const nextOutcomes = [...outcomes, outcome];
    setOutcomes(nextOutcomes);

    // Reset stats for next kanji
    setActiveStats({
      meaningErrors: 0,
      readingErrors: 0,
      answers: [],
      allResponseTimes: [],
    });

    if (currentIndex + 1 < kanjiList.length) {
      setCurrentIndex((prev) => prev + 1);
      setCurrentStep('kanji_to_english');
      setIsAnswered(false);
      setIsCorrect(null);
      setSelectedAnswer(null);
    } else {
      // Completed all kanji in the review session!
      setPhase('summary');
    }
  };

  const stepLabels: Record<ReviewStep, string> = {
    kanji_to_english: '1. Meaning Recall',
    kanji_to_kana: '2. Reading Recall',
    english_to_kanji: '3. Meaning to Kanji',
    stroke_drawing: '4. Memory Drawing',
  };

  return (
    <div className="relative min-h-screen w-full bg-[#050507] text-neutral-100 flex flex-col justify-between p-4 sm:p-6 lg:p-8 overflow-y-auto">
      {/* Background Faint Outline Sakura Tree */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div
          className="absolute top-0 right-0 w-full sm:w-[85%] md:w-[70%] lg:w-[60%] h-full bg-no-repeat bg-right-top bg-contain opacity-50 mix-blend-screen"
          style={{
            backgroundImage: `url("${outlineBgImage}")`,
            backgroundPosition: 'top right',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#050507] via-[#050507]/60 to-transparent w-full md:w-[50%]" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#050507]/40 via-transparent to-[#050507]/60" />
      </div>

      {/* Top Header */}
      <header className="relative z-10 w-full max-w-3xl mx-auto flex items-center justify-between py-2 text-xs mb-4">
        <div className="flex items-center gap-3">
          <span
            className="text-xl font-light text-neutral-200"
            style={{ fontFamily: "'Noto Serif JP', serif" }}
          >
            桜
          </span>
          <div className="flex items-center gap-2">
            <span
              className={`px-2.5 py-0.5 rounded-full border text-[11px] font-mono transition-all ${
                phase === 'review'
                  ? 'bg-purple-950/60 border-purple-600/50 text-purple-300 font-medium'
                  : 'border-white/[0.05] text-neutral-500'
              }`}
            >
              {phase === 'review' ? stepLabels[currentStep] : 'Summary Phase'}
            </span>
            {isCustomReview && (
              <span className="px-2 py-0.5 rounded-full bg-amber-950/30 border border-amber-600/40 text-amber-300 font-mono text-[10px]">
                Custom Mode
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Custom Review Launcher Button */}
          <button
            type="button"
            onClick={() => setIsCustomModalOpen(true)}
            className="text-[11px] font-mono px-3 py-1 rounded-full bg-white/[0.04] hover:bg-white/[0.1] border border-white/[0.1] text-purple-300 hover:text-white transition-colors"
          >
            Custom Review ⚡
          </button>

          <button
            onClick={onFinish}
            className="text-xs text-neutral-400 hover:text-white px-2 py-1 rounded hover:bg-white/[0.04] transition-colors"
            title="Exit to Dashboard"
          >
            Exit ✕
          </button>
        </div>
      </header>

      {/* Content Area */}
      <main className="relative z-10 w-full flex-1 flex flex-col justify-center my-auto py-4">
        {/* Loading State */}
        {loading && (
          <div className="max-w-md mx-auto text-center py-16 space-y-3 animate-fadeIn">
            <div className="w-8 h-8 border-2 border-purple-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-sm text-neutral-300 font-light">
              Checking route `/review` for due kanji...
            </p>
          </div>
        )}

        {/* Fetch Error State with Retry & Custom Review Option */}
        {!loading && error && (
          <div className="max-w-md mx-auto text-center py-12 px-6 rounded-2xl bg-red-950/20 border border-red-900/40 text-neutral-200 animate-fadeIn space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-950/60 border border-red-800 flex items-center justify-center text-red-300 text-xl mx-auto">
              ✕
            </div>
            <h3 className="text-lg font-medium text-red-200">
              Could not load reviews
            </h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              {error}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                onClick={fetchDueKanji}
                className="px-5 py-2 rounded-full bg-neutral-200 hover:bg-white text-neutral-950 text-xs font-medium transition-colors"
              >
                Retry ↻
              </button>
              <button
                onClick={() => setIsCustomModalOpen(true)}
                className="px-4 py-2 rounded-full bg-purple-900/60 hover:bg-purple-800 border border-purple-700 text-purple-200 text-xs font-medium transition-colors"
              >
                Open Custom Review ⚡
              </button>
              <button
                onClick={onFinish}
                className="px-4 py-2 rounded-full border border-neutral-700 text-xs text-neutral-400 hover:text-white transition-colors"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        )}

        {/* Empty Due Reviews State: Exact message requested by the user */}
        {!loading && !error && kanjiList.length === 0 && (
          <div className="max-w-md mx-auto text-center py-16 px-6 rounded-3xl bg-[#0c0c10]/85 border border-white/[0.1] text-neutral-200 animate-fadeIn space-y-4 shadow-2xl">
            <div
              className="text-6xl font-light text-neutral-400"
              style={{ fontFamily: "'Noto Serif JP', serif" }}
            >
              完
            </div>
            <h3
              className="text-2xl font-light text-white"
              style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
            >
              All Caught Up!
            </h3>
            <p className="text-sm text-neutral-300 leading-relaxed max-w-xs mx-auto">
              There are no kanji for reviewal right now.
            </p>
            <p className="text-xs text-neutral-500 leading-relaxed max-w-xs mx-auto">
              You can start a custom review anytime to practice any kanji you have previously studied.
            </p>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setIsCustomModalOpen(true)}
                className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-purple-600 hover:bg-purple-500 text-white text-xs font-medium transition-all shadow-lg flex items-center justify-center gap-1.5"
              >
                <span>Start Custom Review</span>
                <span>⚡</span>
              </button>

              <button
                type="button"
                onClick={onFinish}
                className="w-full sm:w-auto px-5 py-2.5 rounded-full border border-white/[0.1] hover:bg-white/[0.05] text-neutral-400 hover:text-white text-xs font-medium transition-colors"
              >
                Back to Dashboard →
              </button>
            </div>
          </div>
        )}

        {/* Question Type 1: Kanji to English Recall */}
        {!loading && !error && currentKanji && phase === 'review' && currentStep === 'kanji_to_english' && (
          <ReviewCard
            item={{ kanji: currentKanji, ease_factor_before: 2.5, interval_before: 1.0 }}
            promptType="meaning"
            kanjiIndex={currentIndex}
            totalKanji={kanjiList.length}
            meaningErrors={activeStats.meaningErrors}
            readingErrors={activeStats.readingErrors}
            isAnswered={isAnswered}
            isCorrect={isCorrect}
            onAnswerSubmit={handleAnswerSubmit}
            onContinue={handleContinue}
            onExit={onFinish}
          />
        )}

        {/* Question Type 2: Kanji to Kana Recall */}
        {!loading && !error && currentKanji && phase === 'review' && currentStep === 'kanji_to_kana' && (
          <ReviewCard
            item={{ kanji: currentKanji, ease_factor_before: 2.5, interval_before: 1.0 }}
            promptType="reading"
            kanjiIndex={currentIndex}
            totalKanji={kanjiList.length}
            meaningErrors={activeStats.meaningErrors}
            readingErrors={activeStats.readingErrors}
            isAnswered={isAnswered}
            isCorrect={isCorrect}
            onAnswerSubmit={handleAnswerSubmit}
            onContinue={handleContinue}
            onExit={onFinish}
          />
        )}

        {/* Question Type 3: English to 4-Choice Kanji */}
        {!loading && !error && currentKanji && phase === 'review' && currentStep === 'english_to_kanji' && (
          <EnglishToKanjiCard
            question={{
              id: `${currentKanji.id}-review-english_to_kanji`,
              kanji: currentKanji,
              type: 'english_to_kanji',
              prompt: `Pick the kanji for "${currentKanji.meanings[0] || currentKanji.meaning}"`,
              options: getEnglishToKanjiOptions(),
              correctAnswer: currentKanji.character,
            }}
            selectedAnswer={selectedAnswer}
            isAnswered={isAnswered}
            isCorrect={isCorrect}
            onSelectOption={(opt) => {
              const correct = opt === currentKanji.character;
              handleAnswerSubmit(correct, opt, 1000);
            }}
            onContinue={handleContinue}
          />
        )}

        {/* Question Type 4: Memory Stroke Drawing with Progressive Assistance */}
        {!loading && !error && currentKanji && phase === 'review' && currentStep === 'stroke_drawing' && (
          <ReviewStrokeCard
            kanji={currentKanji}
            onComplete={handleStrokeComplete}
            onExit={onFinish}
          />
        )}

        {/* Summary Phase */}
        {!loading && !error && phase === 'summary' && (
          <ReviewSummary
            outcomes={outcomes}
            onFinish={onFinish}
            isCustomReview={isCustomReview}
          />
        )}
      </main>

      {/* Footer Branding */}
      <footer className="relative z-10 w-full max-w-3xl mx-auto py-2 text-center text-[11px] text-neutral-600 font-mono">
        Sakura Kanji · Spaced Repetition Review Engine
      </footer>

      {/* Custom Review Modal */}
      <CustomReviewModal
        isOpen={isCustomModalOpen}
        onClose={() => setIsCustomModalOpen(false)}
        onStartCustomReview={handleStartCustomReview}
      />
    </div>
  );
};
