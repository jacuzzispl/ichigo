import React, { useEffect, useState } from 'react';
import { QuizQuestion } from '../../../types';
import { soundEffects } from '../../../library/audioEffects';

interface EnglishToKanjiCardProps {
  question: QuizQuestion;
  selectedAnswer: string | null;
  isAnswered: boolean;
  isCorrect: boolean | null;
  onSelectOption: (option: string) => void;
  onContinue: () => void;
}

export const EnglishToKanjiCard: React.FC<EnglishToKanjiCardProps> = ({
  question,
  selectedAnswer,
  isAnswered,
  isCorrect,
  onSelectOption,
  onContinue,
}) => {
  const { kanji, options = [], correctAnswer } = question;
  const [shakingOption, setShakingOption] = useState<string | null>(null);

  // Keyboard shortcut listener: 1, 2, 3, 4 for options; Enter for continue
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isAnswered) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onContinue();
        }
        return;
      }

      // Keys 1, 2, 3, 4
      const num = parseInt(e.key, 10);
      if (num >= 1 && num <= options.length) {
        e.preventDefault();
        handleOptionClick(options[num - 1]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAnswered, options, onContinue]);

  const handleOptionClick = (opt: string) => {
    if (isAnswered) return;
    const correct = opt === (correctAnswer || kanji.character);
    if (correct) {
      soundEffects.playCorrect();
    } else {
      soundEffects.playIncorrect();
      setShakingOption(opt);
      setTimeout(() => setShakingOption(null), 500);
    }
    onSelectOption(opt);
  };

  const primaryMeaning = kanji.meanings?.[0] || kanji.meaning || '';

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col justify-between select-none animate-fadeIn">
      {/* Header Badge */}
      <div className="flex items-center justify-between pb-3 mb-6 border-b border-white/[0.08]">
        <div className="flex items-center gap-2">
          <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-cyan-950/40 border border-cyan-500/40 text-cyan-300 font-mono tracking-wide">
            Meaning to Kanji
          </span>
          <span className="text-[11px] text-neutral-400 font-mono">
            Pick the matching character
          </span>
        </div>
        <span className="text-[10px] font-mono text-neutral-500 hidden sm:inline">
          Keys 1 - 4
        </span>
      </div>

      {/* Main Flashcard Container */}
      <div className="relative bg-[#0c0c10]/90 backdrop-blur-md border border-white/[0.1] rounded-3xl p-6 sm:p-8 shadow-2xl transition-all">
        {/* Question Prompt: English Meaning */}
        <div className="text-center py-4 sm:py-6">
          <span className="text-[10px] uppercase font-mono tracking-[0.25em] text-[#d4af37]/90 block mb-2">
            Target Meaning
          </span>
          <h2
            className="text-3xl sm:text-4xl font-normal text-white leading-tight"
            style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
          >
            "{primaryMeaning}"
          </h2>
          {kanji.meanings && kanji.meanings.length > 1 && (
            <p className="text-xs text-neutral-400 mt-1 font-light">
              also: {kanji.meanings.slice(1).join(', ')}
            </p>
          )}
        </div>

        {/* 4 Kanji Choice Cards (2x2 Grid) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 my-6">
          {options.map((optChar, idx) => {
            const isSelected = selectedAnswer === optChar;
            const isTarget = optChar === (correctAnswer || kanji.character);
            const isShaking = shakingOption === optChar;

            let cardStyle =
              'bg-white/[0.02] border-white/[0.1] hover:border-cyan-500/50 hover:bg-white/[0.06] text-white';

            if (isAnswered) {
              if (isTarget) {
                cardStyle =
                  'bg-emerald-950/40 border-emerald-500/80 text-emerald-100 ring-2 ring-emerald-500/30';
              } else if (isSelected && !isCorrect) {
                cardStyle =
                  'bg-red-950/40 border-red-500/80 text-red-200 ring-2 ring-red-500/30';
              } else {
                cardStyle = 'bg-white/[0.01] border-white/[0.04] text-neutral-600 opacity-40';
              }
            }

            return (
              <button
                key={idx}
                type="button"
                disabled={isAnswered}
                onClick={() => handleOptionClick(optChar)}
                className={`relative group rounded-2xl border-2 p-5 flex flex-col items-center justify-center transition-all ${cardStyle} ${
                  isShaking ? 'animate-shake' : ''
                }`}
              >
                {/* Number Key Indicator */}
                <span className="absolute top-2 left-2.5 text-[10px] font-mono text-neutral-500 group-hover:text-neutral-300 transition-colors">
                  {idx + 1}
                </span>

                {/* Character */}
                <span
                  className="text-5xl sm:text-6xl font-light leading-none my-2 transition-transform duration-200 group-hover:scale-105"
                  style={{ fontFamily: "'Noto Serif JP', serif" }}
                >
                  {optChar}
                </span>

                {/* Status Indicator */}
                {isAnswered && isTarget && (
                  <span className="text-[10px] font-mono text-emerald-400 font-medium">
                    ✓ Correct
                  </span>
                )}
                {isAnswered && isSelected && !isCorrect && (
                  <span className="text-[10px] font-mono text-red-400 font-medium">
                    ✕ Incorrect
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Continue Action Button when Answered */}
        {isAnswered && (
          <div className="pt-2 animate-fadeIn">
            <button
              type="button"
              onClick={onContinue}
              autoFocus
              className="w-full py-3.5 px-6 rounded-full bg-white hover:bg-neutral-100 text-neutral-950 font-medium text-sm transition-all shadow-xl flex items-center justify-center gap-2"
            >
              <span>Continue</span>
              <span className="text-xs font-mono text-neutral-500">(Enter ↵)</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
