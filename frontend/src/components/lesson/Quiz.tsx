import React, { useState, useEffect, useRef } from "react";
import {
  LessonKanji,
  QuizQuestion,
  KanjiSessionOutcome,
  AnswerRecord,
} from "../../types";
import { buildQuizQueue, requeueQuestion } from "../../library/quizQueue";
import { QuestionCard } from "./QuestionCard";

interface QuizProps {
  batch: LessonKanji[];
  onComplete: (outcomes: KanjiSessionOutcome[]) => void;
  onExit?: () => void;
}

export const Quiz: React.FC<QuizProps> = ({ batch, onComplete, onExit }) => {
  const [queue, setQueue] = useState<QuizQuestion[]>(() =>
    buildQuizQueue(batch),
  );
  const initialQueueLength = useRef(queue.length).current;

  // Question interaction state
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  // Timing
  const questionStartTimeRef = useRef<number>(Date.now());

  // Distinct questions solved tracker
  const [completedDistinctCount, setCompletedDistinctCount] = useState(0);

  // Outcome tracking per kanji
  const outcomesRef = useRef<Record<number, KanjiSessionOutcome>>(
    batch.reduce(
      (acc, k) => {
        acc[k.id] = {
          kanji_id: k.id,
          meaning_incorrect: 0,
          reading_incorrect: 0,
          first_try_meaning: true,
          first_try_reading: true,
          answers: [],
        };
        return acc;
      },
      {} as Record<number, KanjiSessionOutcome>,
    ),
  );

  // Consecutive wrong count per question ID (to trigger 3-strike intervention)
  const [wrongCountPerQuestion, setWrongCountPerQuestion] = useState<
    Record<string, number>
  >({});
  const [interstitialKanji, setInterstitialKanji] =
    useState<LessonKanji | null>(null);

  const currentQuestion = queue[0];

  // Reset timing when current question changes
  useEffect(() => {
    questionStartTimeRef.current = Date.now();
    setSelectedAnswer(null);
    setIsAnswered(false);
    setIsCorrect(null);
  }, [currentQuestion?.id]);

  const handleAnswerSubmit = (correct: boolean, answerSummary: string) => {
    if (isAnswered || !currentQuestion) return;

    const responseMs = Math.max(10, Date.now() - questionStartTimeRef.current);

    setSelectedAnswer(answerSummary);
    setIsAnswered(true);
    setIsCorrect(correct);

    const kanjiId = currentQuestion.kanji.id;
    const type = currentQuestion.type;
    const outcome = outcomesRef.current[kanjiId];

    // Record answer telemetry
    const answerRecord: AnswerRecord = {
      question_type: type,
      correct,
      response_ms: responseMs,
      userInput: answerSummary,
    };
    outcome.answers.push(answerRecord);

    if (correct) {
      setWrongCountPerQuestion((prev) => ({
        ...prev,
        [currentQuestion.id]: 0,
      }));
    } else {
      if (
        type === "meaning" ||
        type === "kanji_to_romaji_english" ||
        type === "sentence_translation"
      ) {
        outcome.meaning_incorrect += 1;
        outcome.first_try_meaning = false;
      } else {
        outcome.reading_incorrect += 1;
        outcome.first_try_reading = false;
      }

      const nextWrongCount =
        (wrongCountPerQuestion[currentQuestion.id] || 0) + 1;
      setWrongCountPerQuestion((prev) => ({
        ...prev,
        [currentQuestion.id]: nextWrongCount,
      }));
    }
  };

  const handleSelectOption = (option: string) => {
    if (isAnswered || !currentQuestion) return;
    const correct =
      option.toLowerCase() ===
      (currentQuestion.correctAnswer || "").toLowerCase();
    handleAnswerSubmit(correct, option);
  };

  const handleContinue = () => {
    if (!currentQuestion) return;

    const isCurrentCorrect = isCorrect === true;
    const remaining = queue.slice(1);
    const wrongTimes = wrongCountPerQuestion[currentQuestion.id] || 0;

    if (isCurrentCorrect) {
      setCompletedDistinctCount((prev) => prev + 1);

      if (remaining.length === 0) {
        // All questions finished!
        onComplete(Object.values(outcomesRef.current));
        return;
      }
      setQueue(remaining);
    } else {
      // Requeue the question 3 positions ahead (clamped to end)
      const updatedQueue = requeueQuestion(remaining, currentQuestion, 3);
      setQueue(updatedQueue);

      // If user has missed this question 3 or more times, trigger lesson refresher overlay
      if (wrongTimes >= 3) {
        setInterstitialKanji(currentQuestion.kanji);
      }
    }
  };

  const progressPercent = Math.min(
    100,
    Math.round(
      (completedDistinctCount / Math.max(1, initialQueueLength)) * 100,
    ),
  );

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col justify-between select-none">
      {/* Top Bar: Progress & Counter */}
      <div className="w-full mb-6 pb-4 border-b border-white/[0.08]">
        <div className="flex items-center justify-between text-xs mb-2">
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase tracking-[0.2em] text-[#d4af37] font-mono font-semibold">
              Practice Phase
            </span>
            <span className="text-neutral-600">·</span>
            <span className="text-neutral-300 font-mono">
              {completedDistinctCount} / {initialQueueLength} Completed
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-neutral-500 font-mono text-[11px]">
              {queue.length} in queue
            </span>
            {onExit && (
              <button
                onClick={onExit}
                className="text-neutral-400 hover:text-white transition-colors"
              >
                Exit
              </button>
            )}
          </div>
        </div>

        {/* Clean Hairline Progress Bar */}
        <div className="w-full h-1.5 bg-white/[0.06] rounded-full overflow-hidden border border-white/[0.08]">
          <div
            className="h-full bg-neutral-200 rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Main Question Card Surface */}
      {currentQuestion && (
        <QuestionCard
          question={currentQuestion}
          selectedAnswer={selectedAnswer}
          isAnswered={isAnswered}
          isCorrect={isCorrect}
          onSelectOption={handleSelectOption}
          onSubmitAnswer={handleAnswerSubmit}
          onContinue={handleContinue}
        />
      )}

      {/* 3-Strike Lesson Card Interstitial / Refresher Overlay */}
      {interstitialKanji && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-md bg-[#0e0e12] border border-amber-800/60 rounded-2xl p-6 shadow-2xl text-neutral-200">
            <div className="flex items-center gap-2 mb-3">
              <span className="px-2 py-0.5 rounded bg-amber-950/60 border border-amber-700/60 text-amber-300 text-[11px] font-mono uppercase tracking-wider font-semibold">
                Refresher Card (3+ Mistakes)
              </span>
            </div>

            <div className="text-center py-3 mb-4 border-b border-white/[0.08]">
              <div
                className="text-8xl font-light text-white mb-2 leading-none"
                style={{ fontFamily: "'Noto Serif JP', serif" }}
              >
                {interstitialKanji.character}
              </div>
              <div
                className="text-2xl font-light text-white"
                style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
              >
                {interstitialKanji.meanings.join(", ")}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.08]">
                <div className="text-[10px] uppercase font-mono tracking-wider text-amber-200/80 mb-1">
                  On'yomi (音読み)
                </div>
                <div className="text-xl font-light text-white font-mono">
                  {interstitialKanji.onyomi.join(", ") || "—"}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.08]">
                <div className="text-[10px] uppercase font-mono tracking-wider text-pink-300/90 mb-1">
                  Kun'yomi (訓読み)
                </div>
                <div className="text-xl font-light text-white font-mono">
                  {interstitialKanji.kunyomi.join(", ") || "—"}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setInterstitialKanji(null)}
              className="w-full py-3 rounded-full bg-neutral-100 hover:bg-white text-neutral-950 text-xs font-medium transition-colors shadow-md"
            >
              Got it, Continue Quiz →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
