import React, { useState, useEffect, useRef } from "react";
import { QuizQuestion } from "../../../types";
import {
  romajiToHiragana,
  finalizeHiragana,
  matchesReading,
} from "../../../library/romajiConverter";
import { soundEffects } from "../../../library/audioEffects";

interface EnglishToHiraganaCardProps {
  question: QuizQuestion;
  isAnswered: boolean;
  isCorrect: boolean | null;
  onSubmitAnswer: (correct: boolean, inputSummary: string) => void;
  onContinue: () => void;
}

export const EnglishToHiraganaCard: React.FC<EnglishToHiraganaCardProps> = ({
  question,
  isAnswered,
  isCorrect,
  onSubmitAnswer,
  onContinue,
}) => {
  const { kanji } = question;
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus on question load
  useEffect(() => {
    setInputValue("");
    setTimeout(() => {
      inputRef.current?.focus();
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isAnswered) return;
    const raw = e.target.value;
    // Live Romaji to Hiragana conversion
    const converted = romajiToHiragana(raw);
    setInputValue(converted);
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isAnswered || !inputValue.trim()) return;

    const finalAnswer = finalizeHiragana(inputValue);
    setInputValue(finalAnswer);

    const correct = matchesReading(finalAnswer, kanji.onyomi, kanji.kunyomi);

    if (correct) {
      soundEffects.playCorrect();
    } else {
      soundEffects.playIncorrect();
    }

    onSubmitAnswer(correct, finalAnswer);
  };

  const primaryMeaning = kanji.meanings[0];
  const allMeanings = kanji.meanings.join(", ");

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col items-center select-none animate-fadeIn">
      {/* English Meaning Prompt Area */}
      <div className="flex flex-col items-center justify-center mb-6 text-center">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[11px] uppercase tracking-[0.2em] px-3 py-0.5 rounded-full bg-white/[0.05] border border-white/[0.1] text-pink-300 font-mono">
            Romaji → Live Hiragana
          </span>
        </div>

        <span className="text-[10px] uppercase font-mono tracking-[0.2em] text-[#d4af37]/90 mb-1">
          English Meaning
        </span>

        <h2
          className="text-4xl sm:text-5xl font-normal text-white leading-tight mb-2"
          style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
        >
          {primaryMeaning}
        </h2>

        {kanji.meanings.length > 1 && (
          <p className="text-xs text-neutral-400 font-light">
            also: <span className="text-neutral-300">{allMeanings}</span>
          </p>
        )}

        <p className="text-sm text-neutral-300 mt-3 font-light max-w-md">
          Type the Japanese reading in Romaji. The letters will convert to{" "}
          <strong className="text-pink-300 font-normal">Hiragana</strong> as you
          type!
        </p>
      </div>

      {/* Input Box with Live Hiragana Display */}
      <form onSubmit={handleSubmit} className="w-full space-y-4 mb-6">
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            disabled={isAnswered}
            value={inputValue}
            onChange={handleChange}
            placeholder="Type in romaji (e.g. mizu, nichi)..."
            autoComplete="off"
            spellCheck="false"
            className={`w-full px-5 py-4 rounded-2xl text-2xl sm:text-3xl font-light tracking-wider transition-all outline-none border text-center ${
              isAnswered
                ? isCorrect
                  ? "bg-emerald-950/20 border-emerald-500/80 text-emerald-200"
                  : "bg-red-950/20 border-red-500/80 text-red-200"
                : "bg-white/[0.04] border-white/[0.1] focus:border-pink-500/50 text-white placeholder-neutral-600"
            }`}
            style={{ fontFamily: "'Noto Sans JP', sans-serif" }}
          />

          {/* IME Indicator Tag */}
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.08] text-neutral-400 border border-white/[0.05]">
              かな IME
            </span>
          </div>
        </div>

        {/* Live typing preview hint */}
        {!isAnswered && (
          <div className="flex items-center justify-between text-xs text-neutral-400 px-1 font-mono">
            <span>Examples: mizu → みず · nichi → にち · ki → き</span>
            <span className="text-neutral-500">Press Enter ↵</span>
          </div>
        )}

        {!isAnswered && (
          <button
            type="submit"
            disabled={!inputValue.trim()}
            className="w-full py-3.5 rounded-xl bg-neutral-100 hover:bg-white text-neutral-950 text-sm font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg flex items-center justify-center gap-2"
          >
            <span>Submit Reading</span>
            <span className="text-xs font-mono text-neutral-500">
              (Enter ↵)
            </span>
          </button>
        )}
      </form>

      {/* Answer Feedback & Info Panel */}
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
                {isCorrect ? "Correct Reading!" : "Incorrect Reading — Review:"}
              </span>
              <span
                className="text-2xl font-light text-white"
                style={{ fontFamily: "'Noto Serif JP', serif" }}
              >
                {kanji.character}
              </span>
            </div>

            <div className="space-y-1.5 text-xs">
              <div className="flex gap-2">
                <span className="text-neutral-400 shrink-0 font-mono">
                  Kun'yomi (Native):
                </span>
                <span className="text-white font-mono font-medium">
                  {kanji.kunyomi.join(", ") || "—"}
                </span>
              </div>
              <div className="flex gap-2">
                <span className="text-neutral-400 shrink-0 font-mono">
                  On'yomi (Chinese):
                </span>
                <span className="text-white font-mono font-medium">
                  {kanji.onyomi.join(", ") || "—"}
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
