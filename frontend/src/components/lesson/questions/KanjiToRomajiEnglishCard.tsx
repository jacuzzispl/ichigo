import React, { useState, useEffect, useRef } from "react";
import { QuizQuestion } from "../../../types";
import {
  matchesReading,
  matchesMeaning,
} from "../../../library/romajiConverter";
import { soundEffects } from "../../../library/audioEffects";

interface KanjiToRomajiEnglishCardProps {
  question: QuizQuestion;
  isAnswered: boolean;
  isCorrect: boolean | null;
  onSubmitAnswer: (correct: boolean, inputSummary: string) => void;
  onContinue: () => void;
}

export const KanjiToRomajiEnglishCard: React.FC<
  KanjiToRomajiEnglishCardProps
> = ({ question, isAnswered, isCorrect, onSubmitAnswer, onContinue }) => {
  const { kanji } = question;
  const [romajiInput, setRomajiInput] = useState("");
  const [englishInput, setEnglishInput] = useState("");
  const [readingValid, setReadingValid] = useState<boolean | null>(null);
  const [meaningValid, setMeaningValid] = useState<boolean | null>(null);

  const romajiRef = useRef<HTMLInputElement>(null);
  const englishRef = useRef<HTMLInputElement>(null);

  // Auto-focus on question load
  useEffect(() => {
    setRomajiInput("");
    setEnglishInput("");
    setReadingValid(null);
    setMeaningValid(null);
    setTimeout(() => {
      romajiRef.current?.focus();
    }, 50);
  }, [question.id]);

  // Keyboard shortcut: Enter to continue if answered
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isAnswered && (e.key === "Enter" || e.key === " ")) {
        e.preventDefault();
        onContinue();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isAnswered, onContinue]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isAnswered) return;

    const isRValid = matchesReading(romajiInput, kanji.onyomi, kanji.kunyomi);
    const isMValid = matchesMeaning(englishInput, kanji.meanings);

    setReadingValid(isRValid);
    setMeaningValid(isMValid);

    const overallCorrect = isRValid && isMValid;

    if (overallCorrect) {
      soundEffects.playCorrect();
    } else {
      soundEffects.playIncorrect();
    }

    const summary = `Romaji: "${romajiInput}" | Meaning: "${englishInput}"`;
    onSubmitAnswer(overallCorrect, summary);
  };

  const handleRomajiKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (!englishInput.trim()) {
        englishRef.current?.focus();
      } else {
        handleSubmit();
      }
    }
  };

  const handleEnglishKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col items-center select-none animate-fadeIn">
      {/* Kanji Character Header */}
      <div className="flex flex-col items-center justify-center mb-6 text-center">
        <div
          className="text-8xl sm:text-9xl font-light text-neutral-100 tracking-tight leading-none mb-3 py-1 select-none"
          style={{ fontFamily: "'Noto Serif JP', serif" }}
        >
          {kanji.character}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] uppercase tracking-[0.2em] px-3 py-0.5 rounded-full bg-white/[0.05] border border-white/[0.1] text-amber-200/90 font-mono">
            Two-Part Translation
          </span>
        </div>

        <p className="text-sm text-neutral-300 mt-2 font-light max-w-md">
          Type both the <strong>Romaji reading</strong> and{" "}
          <strong>English meaning</strong> for this kanji.
        </p>
      </div>

      {/* Dual Input Form */}
      <form onSubmit={handleSubmit} className="w-full space-y-4 mb-6">
        {/* Step 1: Romaji Reading */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <label className="text-neutral-300 font-mono text-[11px] uppercase tracking-wider flex items-center gap-2">
              <span className="w-4 h-4 rounded-full bg-white/[0.08] text-[10px] flex items-center justify-center text-neutral-300">
                1
              </span>
              Romaji Reading
            </label>
            {isAnswered && readingValid !== null && (
              <span
                className={`text-[11px] font-mono font-medium ${
                  readingValid ? "text-emerald-400" : "text-red-400"
                }`}
              >
                {readingValid ? "✓ Correct reading" : "✕ Incorrect reading"}
              </span>
            )}
          </div>

          <div className="relative">
            <input
              ref={romajiRef}
              type="text"
              disabled={isAnswered}
              value={romajiInput}
              onChange={(e) => setRomajiInput(e.target.value)}
              onKeyDown={handleRomajiKeyDown}
              placeholder="e.g. nichi, hi, mizu..."
              autoComplete="off"
              spellCheck="false"
              className={`w-full px-4 py-3 rounded-xl font-mono text-base transition-all outline-none border ${
                isAnswered
                  ? readingValid
                    ? "bg-emerald-950/20 border-emerald-500/70 text-emerald-200"
                    : "bg-red-950/20 border-red-500/70 text-red-200"
                  : "bg-white/[0.04] border-white/[0.1] focus:border-white/30 text-white placeholder-neutral-500"
              }`}
            />
          </div>
        </div>

        {/* Step 2: English Meaning */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <label className="text-neutral-300 font-mono text-[11px] uppercase tracking-wider flex items-center gap-2">
              <span className="w-4 h-4 rounded-full bg-white/[0.08] text-[10px] flex items-center justify-center text-neutral-300">
                2
              </span>
              English Meaning
            </label>
            {isAnswered && meaningValid !== null && (
              <span
                className={`text-[11px] font-mono font-medium ${
                  meaningValid ? "text-emerald-400" : "text-red-400"
                }`}
              >
                {meaningValid ? "✓ Correct meaning" : "✕ Incorrect meaning"}
              </span>
            )}
          </div>

          <div className="relative">
            <input
              ref={englishRef}
              type="text"
              disabled={isAnswered}
              value={englishInput}
              onChange={(e) => setEnglishInput(e.target.value)}
              onKeyDown={handleEnglishKeyDown}
              placeholder="e.g. Day, Sun, Water..."
              autoComplete="off"
              spellCheck="false"
              className={`w-full px-4 py-3 rounded-xl font-sans text-base transition-all outline-none border ${
                isAnswered
                  ? meaningValid
                    ? "bg-emerald-950/20 border-emerald-500/70 text-emerald-200"
                    : "bg-red-950/20 border-red-500/70 text-red-200"
                  : "bg-white/[0.04] border-white/[0.1] focus:border-white/30 text-white placeholder-neutral-500"
              }`}
            />
          </div>
        </div>

        {/* Submit Button (only when unanswered) */}
        {!isAnswered && (
          <button
            type="submit"
            disabled={!romajiInput.trim() || !englishInput.trim()}
            className="w-full py-3.5 rounded-xl bg-neutral-100 hover:bg-white text-neutral-950 text-sm font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg flex items-center justify-center gap-2"
          >
            <span>Check Answer</span>
            <span className="text-xs font-mono text-neutral-500">
              (Enter ↵)
            </span>
          </button>
        )}
      </form>

      {/* Answer Feedback & Canonical Reference Panel */}
      {isAnswered && (
        <div className="w-full animate-fadeIn space-y-4">
          <div
            className={`p-4 rounded-xl border ${
              isCorrect
                ? "bg-emerald-950/25 border-emerald-800/50 text-emerald-200"
                : "bg-red-950/25 border-red-800/50 text-red-200"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold tracking-wider uppercase font-mono">
                {isCorrect
                  ? "Both Correct! Excellent"
                  : "Review Correct Answers:"}
              </span>
            </div>

            <div className="space-y-1.5 text-xs">
              <div className="flex gap-2">
                <span className="text-neutral-400 shrink-0 font-mono">
                  Accepted Meanings:
                </span>
                <span className="text-white font-medium">
                  {kanji.meanings.join(", ")}
                </span>
              </div>
              <div className="flex gap-2">
                <span className="text-neutral-400 shrink-0 font-mono">
                  On'yomi (Chinese):
                </span>
                <span className="text-white font-mono">
                  {kanji.onyomi.join(", ") || "—"}
                </span>
              </div>
              <div className="flex gap-2">
                <span className="text-neutral-400 shrink-0 font-mono">
                  Kun'yomi (Native):
                </span>
                <span className="text-white font-mono">
                  {kanji.kunyomi.join(", ") || "—"}
                </span>
              </div>
            </div>
          </div>

          {/* Continue button */}
          <button
            type="button"
            onClick={onContinue}
            autoFocus
            className="w-full py-3.5 rounded-full bg-neutral-100 hover:bg-white text-neutral-950 text-sm font-medium transition-all shadow-lg flex items-center justify-center gap-2"
          >
            <span>Continue</span>
            <span className="text-xs font-mono text-neutral-500">
              (Enter ↵)
            </span>
          </button>
        </div>
      )}
    </div>
  );
};
