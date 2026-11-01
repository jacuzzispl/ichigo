import React, { useState, useEffect, useRef } from 'react';
import { ReviewItem, AnswerRecord } from '../../types';
import { romajiToHiragana, matchesReading, matchesMeaning } from '../../library/romajiConverter';
import { soundEffects } from '../../library/audioEffects';

export type ReviewPromptType = 'meaning' | 'reading';

interface ReviewCardProps {
  item: ReviewItem;
  promptType: ReviewPromptType;
  kanjiIndex: number;
  totalKanji: number;
  meaningErrors: number;
  readingErrors: number;
  onAnswerSubmit: (correct: boolean, userInput: string, responseMs: number) => void;
  onContinue: () => void;
  isAnswered: boolean;
  isCorrect: boolean | null;
  onExit?: () => void;
}

export const ReviewCard: React.FC<ReviewCardProps> = ({
  item,
  promptType,
  kanjiIndex,
  totalKanji,
  meaningErrors,
  readingErrors,
  onAnswerSubmit,
  onContinue,
  isAnswered,
  isCorrect,
  onExit,
}) => {
  const { kanji } = item;
  const [inputVal, setInputVal] = useState('');
  const [showMnemonic, setShowMnemonic] = useState(false);
  const [playingAudio, setPlayingAudio] = useState(false);
  const [isShaking, setIsShaking] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const startTimeRef = useRef<number>(Date.now());

  // Reset input and focus whenever kanji or promptType changes
  useEffect(() => {
    setInputVal('');
    setShowMnemonic(false);
    setIsShaking(false);
    startTimeRef.current = Date.now();

    const t = setTimeout(() => {
      inputRef.current?.focus();
    }, 60);
    return () => clearTimeout(t);
  }, [kanji.id, promptType]);

  // Handle live typing (for reading, convert romaji to hiragana in real time)
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isAnswered) return;
    const raw = e.target.value;
    if (promptType === 'reading') {
      setInputVal(romajiToHiragana(raw));
    } else {
      setInputVal(raw);
    }
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isAnswered || !inputVal.trim()) return;

    const responseMs = Math.max(50, Date.now() - startTimeRef.current);
    let correct = false;

    if (promptType === 'meaning') {
      correct = matchesMeaning(inputVal, kanji.meanings);
    } else {
      correct = matchesReading(inputVal, kanji.onyomi, kanji.kunyomi);
    }

    if (correct) {
      soundEffects.playCorrect();
    } else {
      soundEffects.playIncorrect();
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
    }

    onAnswerSubmit(correct, inputVal.trim(), responseMs);
  };

  // Keyboard Enter shortcut: submit if unanswered, continue if answered
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        if (isAnswered) {
          onContinue();
        } else if (inputVal.trim()) {
          handleSubmit();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAnswered, inputVal, onContinue]);

  // Audio pronunciation
  const handlePlayAudio = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const textToSpeak = kanji.kunyomi[0] || kanji.onyomi[0] || kanji.character;
      const utterance = new SpeechSynthesisUtterance(textToSpeak.replace(/[\(\)\-\.]/g, ''));
      utterance.lang = 'ja-JP';
      utterance.rate = 0.85;

      utterance.onstart = () => setPlayingAudio(true);
      utterance.onend = () => setPlayingAudio(false);
      utterance.onerror = () => setPlayingAudio(false);

      window.speechSynthesis.speak(utterance);
    }
  };

  const isMeaning = promptType === 'meaning';
  const acceptedAnswers = isMeaning
    ? kanji.meanings.join(', ')
    : [...kanji.onyomi, ...kanji.kunyomi].filter(Boolean).join(', ');

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col justify-between select-none animate-fadeIn">
      {/* Top Session Progress Bar */}
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/[0.08]">
        <div className="flex items-center gap-2.5">
          <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.2em] text-purple-400 font-mono font-semibold">
            SRS Review Session
          </span>
          <span className="text-neutral-600">·</span>
          <span className="text-xs text-neutral-300 font-mono font-medium">
            Kanji {kanjiIndex + 1} of {totalKanji}
          </span>
        </div>

        {onExit && (
          <button
            onClick={onExit}
            className="text-xs text-neutral-400 hover:text-white px-2.5 py-1 rounded-md hover:bg-white/[0.04] transition-colors"
          >
            Exit ✕
          </button>
        )}
      </div>

      {/* Main Flashcard Container */}
      <div className="relative bg-[#0c0c10]/90 backdrop-blur-md border border-white/[0.1] rounded-3xl p-6 sm:p-8 shadow-2xl transition-all">
        {/* Card Header Strip: Badge, SRS Stats & Audio */}
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
          <div className="flex items-center gap-2">
            <span
              className={`text-[11px] px-2.5 py-0.5 rounded-full border font-mono tracking-wide ${
                isMeaning
                  ? 'bg-blue-950/40 border-blue-600/40 text-blue-300'
                  : 'bg-purple-950/40 border-purple-600/40 text-purple-300'
              }`}
            >
              {isMeaning ? 'Meaning Recall' : 'Reading Recall'}
            </span>

            <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-white/[0.03] border border-white/[0.06] text-neutral-400 font-mono">
              {kanji.stroke_count || 4} Strokes {kanji.radical ? `· ${kanji.radical}` : ''}
            </span>
          </div>

          <button
            type="button"
            onClick={handlePlayAudio}
            title="Listen to Japanese pronunciation"
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-mono transition-all ${
              playingAudio
                ? 'bg-white/[0.12] border-white/30 text-white ring-1 ring-white/20'
                : 'bg-white/[0.04] border-white/[0.08] text-neutral-300 hover:bg-white/[0.08] hover:text-white'
            }`}
          >
            <svg
              className={`w-3.5 h-3.5 ${playingAudio ? 'animate-pulse text-neutral-200' : 'text-neutral-400'}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
              />
            </svg>
            <span className="text-[11px]">{playingAudio ? 'Playing...' : 'Audio'}</span>
          </button>
        </div>

        {/* Kanji Character Stage */}
        <div className="py-8 sm:py-10 flex flex-col items-center justify-center text-center">
          <div
            className="text-8xl sm:text-9xl font-light text-neutral-50 leading-none select-none drop-shadow-lg transition-transform duration-300 hover:scale-[1.02]"
            style={{ fontFamily: "'Noto Serif JP', serif" }}
          >
            {kanji.character}
          </div>

          <div className="mt-4 flex items-center gap-2">
            <span className="text-[10px] uppercase font-mono tracking-[0.2em] text-[#d4af37]/90">
              {isMeaning ? 'Type English Meaning' : 'Type Japanese Reading (Kana)'}
            </span>
          </div>
        </div>

        {/* Input Form & Instant Feedback */}
        <form onSubmit={handleSubmit} className="w-full max-w-md mx-auto space-y-3">
          <div
            className={`relative rounded-2xl border-2 transition-all ${
              isShaking ? 'animate-shake border-red-500/80 ring-2 ring-red-500/30' : ''
            } ${
              isAnswered
                ? isCorrect
                  ? 'border-emerald-500/80 bg-emerald-950/20'
                  : 'border-red-500/80 bg-red-950/20'
                : 'border-white/[0.15] bg-black/40 focus-within:border-purple-400 focus-within:ring-2 focus-within:ring-purple-400/20'
            }`}
          >
            <input
              ref={inputRef}
              type="text"
              value={inputVal}
              onChange={handleInputChange}
              disabled={isAnswered}
              placeholder={isMeaning ? 'e.g. Day, Sun...' : 'e.g. nichi, hi...'}
              className="w-full bg-transparent px-5 py-4 text-center text-xl sm:text-2xl text-white font-mono placeholder:text-neutral-600 focus:outline-none"
              autoComplete="off"
              autoCapitalize="off"
              spellCheck="false"
            />

            {/* Input Prompt Helper Badge */}
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono text-neutral-500 uppercase pointer-events-none">
              {isMeaning ? 'ENG' : 'かな'}
            </div>
          </div>

          {/* Feedback & Correct Answer Reveal on Answered */}
          {isAnswered && (
            <div
              className={`p-4 rounded-2xl border text-sm animate-fadeIn space-y-1.5 ${
                isCorrect
                  ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
                  : 'bg-red-950/30 border-red-500/40 text-red-200'
              }`}
            >
              <div className="flex items-center justify-between font-mono text-xs">
                <span className="font-semibold">
                  {isCorrect ? '✓ Correct Recall!' : '✕ Not Quite'}
                </span>
                <span className="text-neutral-400">
                  {isMeaning ? 'Accepted Meanings' : 'Accepted Readings'}
                </span>
              </div>

              <div className="text-base font-medium text-white tracking-wide">
                {acceptedAnswers}
              </div>

              {/* Show Secondary Information */}
              <div className="pt-2 text-xs text-neutral-300 border-t border-white/[0.08] flex items-center justify-between">
                <span>
                  {isMeaning
                    ? `Readings: ${[...kanji.onyomi, ...kanji.kunyomi].filter(Boolean).join(' · ')}`
                    : `Meaning: ${kanji.meanings.join(', ')}`}
                </span>
                <span className="font-mono text-[10px] text-neutral-400">
                  Errors so far: M:{meaningErrors} R:{readingErrors}
                </span>
              </div>
            </div>
          )}

          {/* Action Buttons: Submit / Continue / Hint */}
          <div className="flex items-center justify-between gap-3 pt-2">
            {!isAnswered ? (
              <>
                <button
                  type="button"
                  onClick={() => setShowMnemonic((prev) => !prev)}
                  className="px-3 py-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.08] text-xs font-mono text-amber-300 hover:text-amber-200 transition-colors"
                >
                  {showMnemonic ? 'Hide Mnemonic' : 'Hint 💡'}
                </button>

                <button
                  type="submit"
                  disabled={!inputVal.trim()}
                  className={`flex-1 py-3 px-6 rounded-full font-medium text-xs tracking-wider transition-all shadow-md flex items-center justify-center gap-2 ${
                    inputVal.trim()
                      ? 'bg-neutral-100 hover:bg-white text-neutral-950 cursor-pointer'
                      : 'bg-neutral-800 text-neutral-500 cursor-not-allowed border border-white/[0.05]'
                  }`}
                >
                  <span>Check Answer</span>
                  <span className="text-[10px] font-mono opacity-60">(Enter ↵)</span>
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={onContinue}
                autoFocus
                className="w-full py-3.5 px-6 rounded-full bg-white hover:bg-neutral-100 text-neutral-950 font-medium text-sm transition-all shadow-xl flex items-center justify-center gap-2"
              >
                <span>Continue</span>
                <span className="text-xs font-mono text-neutral-500">(Enter ↵)</span>
              </button>
            )}
          </div>

          {/* Mnemonic Hint Drawer */}
          {showMnemonic && (
            <div className="mt-3 p-3.5 rounded-xl bg-amber-950/20 border border-amber-500/30 text-amber-200/90 text-xs leading-relaxed animate-fadeIn">
              <span className="font-semibold block mb-1">Mnemonic Memory Aid:</span>
              {kanji.mnemonic ||
                `Think of the visual strokes of "${kanji.character}" representing its meaning "${kanji.meanings[0]}".`}
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
