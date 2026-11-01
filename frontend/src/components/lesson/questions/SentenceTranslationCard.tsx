import React, { useEffect, useState } from "react";
import { QuizQuestion } from "../../../types";
import { getSentenceQuestion } from "../../../data/sentenceData";
import { soundEffects } from "../../../library/audioEffects";

interface SentenceTranslationCardProps {
  question: QuizQuestion;
  selectedAnswer: string | null;
  isAnswered: boolean;
  isCorrect: boolean | null;
  onSelectOption: (option: string) => void;
  onContinue: () => void;
}

export const SentenceTranslationCard: React.FC<
  SentenceTranslationCardProps
> = ({
  question,
  selectedAnswer,
  isAnswered,
  isCorrect,
  onSelectOption,
  onContinue,
}) => {
  const { kanji } = question;
  const sentenceData =
    question.sentenceData ||
    getSentenceQuestion(kanji.character, kanji.meanings);
  const [shuffledOptions, setShuffledOptions] = useState<string[]>([]);

  // Shuffle options on question mount
  useEffect(() => {
    const opts = [...sentenceData.options];
    for (let i = opts.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [opts[i], opts[j]] = [opts[j], opts[i]];
    }
    setShuffledOptions(opts);
  }, [question.id, sentenceData]);

  // Keyboard shortcuts: 1-4 to select option, Enter to continue
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isAnswered) {
        if (["1", "2", "3", "4"].includes(e.key)) {
          const index = parseInt(e.key, 10) - 1;
          if (shuffledOptions[index]) {
            handleOptionClick(shuffledOptions[index]);
          }
        }
      } else {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onContinue();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isAnswered, shuffledOptions, onContinue]);

  const handleOptionClick = (option: string) => {
    if (isAnswered) return;
    const correct = option.trim() === sentenceData.correctAnswer.trim();
    if (correct) {
      soundEffects.playCorrect();
    } else {
      soundEffects.playIncorrect();
    }
    onSelectOption(option);
  };

  // Highlight the target kanji character in the sentence
  const parts = sentenceData.japaneseSentence.split(kanji.character);

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col items-center select-none animate-fadeIn">
      {/* Question Header & Context Sentence */}
      <div className="w-full flex flex-col items-center justify-center mb-6 text-center">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-[11px] uppercase tracking-[0.2em] px-3 py-0.5 rounded-full bg-white/[0.05] border border-white/[0.1] text-indigo-300 font-mono">
            Sentence Context
          </span>
          <span className="text-xs text-neutral-400 font-mono">
            Target Kanji:{" "}
            <strong className="text-white text-base">{kanji.character}</strong>
          </span>
        </div>

        {/* Japanese Sentence Display with Target Kanji Glow */}
        <div className="w-full bg-[#0c0c12]/90 border border-white/[0.1] rounded-2xl p-5 sm:p-6 mb-3 shadow-xl">
          <div
            className="text-2xl sm:text-3xl font-light text-neutral-100 leading-relaxed mb-2"
            style={{ fontFamily: "'Noto Serif JP', serif" }}
          >
            {parts.map((part, idx) => (
              <React.Fragment key={idx}>
                <span>{part}</span>
                {idx < parts.length - 1 && (
                  <span className="text-amber-300 font-medium px-1 underline decoration-amber-400/50 decoration-2 underline-offset-4">
                    {kanji.character}
                  </span>
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Reading guide / furigana transcription */}
          <div className="text-xs sm:text-sm text-neutral-400 font-mono tracking-wide">
            {sentenceData.furigana}
          </div>
        </div>

        <p className="text-xs text-neutral-300 font-light">
          Choose the correct English translation of the sentence above:
        </p>
      </div>

      {/* Multiple Choice Options (4 Choices) */}
      <div className="w-full space-y-2.5 mb-6">
        {shuffledOptions.map((option, idx) => {
          const isThisSelected = selectedAnswer === option;
          const isThisCorrect =
            option.trim() === sentenceData.correctAnswer.trim();

          let btnClasses =
            "w-full p-4 rounded-xl border text-left transition-all flex items-center justify-between ";

          if (!isAnswered) {
            btnClasses +=
              "bg-white/[0.03] hover:bg-white/[0.08] border-white/[0.08] hover:border-white/[0.2] text-neutral-200 cursor-pointer active:scale-[0.99]";
          } else {
            if (isThisCorrect) {
              btnClasses +=
                "bg-emerald-950/40 border-emerald-500/80 text-emerald-200 font-medium shadow-[0_0_15px_rgba(16,185,129,0.15)]";
            } else if (isThisSelected && !isCorrect) {
              btnClasses +=
                "bg-red-950/40 border-red-500/80 text-red-200 font-medium";
            } else {
              btnClasses +=
                "bg-white/[0.01] border-white/[0.04] text-neutral-500 opacity-45 cursor-not-allowed";
            }
          }

          return (
            <button
              key={idx}
              type="button"
              disabled={isAnswered}
              onClick={() => handleOptionClick(option)}
              className={btnClasses}
            >
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-md bg-white/[0.06] text-xs font-mono flex items-center justify-center text-neutral-400 shrink-0">
                  {idx + 1}
                </span>
                <span className="text-sm sm:text-base leading-snug">
                  {option}
                </span>
              </div>

              {isAnswered && isThisCorrect && (
                <span className="text-emerald-400 text-sm font-bold pl-2 shrink-0">
                  ✓
                </span>
              )}
              {isAnswered && isThisSelected && !isCorrect && (
                <span className="text-red-400 text-sm font-bold pl-2 shrink-0">
                  ✕
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Feedback Panel */}
      {isAnswered && (
        <div className="w-full animate-fadeIn space-y-4">
          <div
            className={`p-4 rounded-xl border ${
              isCorrect
                ? "bg-emerald-950/25 border-emerald-800/50 text-emerald-200"
                : "bg-red-950/25 border-red-800/50 text-red-200"
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold tracking-wider uppercase font-mono">
                {isCorrect ? "Correct Translation!" : "Incorrect Translation:"}
              </span>
            </div>

            <p className="text-xs text-neutral-300 font-light leading-relaxed">
              {sentenceData.englishExplanation ||
                `The kanji ${kanji.character} conveys the meaning "${kanji.meanings[0]}".`}
            </p>
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
