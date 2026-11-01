import React, { useState } from 'react';
import { LessonKanji, RawBackendKanji } from '../../types';

interface LessonCardsProps {
  kanjiList: (LessonKanji | RawBackendKanji)[];
  onStartQuiz: () => void;
  onExit?: () => void;
}

/**
 * Safely parses string, string[], comma-separated strings, or null/undefined into a clean string array.
 */
function parseStringOrArray(val: unknown): string[] {
  if (!val) return [];
  if (Array.isArray(val)) {
    return val
      .map((item) => (typeof item === 'string' ? item.trim() : String(item).trim()))
      .filter(Boolean);
  }
  if (typeof val === 'string') {
    return val
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return [];
}

export const LessonCards: React.FC<LessonCardsProps> = ({
  kanjiList,
  onStartQuiz,
  onExit,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showDetails, setShowDetails] = useState(false);
  const [playingAudio, setPlayingAudio] = useState(false);

  const total = kanjiList.length;
  const currentKanji = kanjiList[currentIndex];
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === total - 1;

  const handleNext = () => {
    if (!isLast) {
      setCurrentIndex((prev) => prev + 1);
      setShowDetails(false); // Reset expansion for next card
    }
  };

  const handleBack = () => {
    if (!isFirst) {
      setCurrentIndex((prev) => prev - 1);
      setShowDetails(false); // Reset expansion for previous card
    }
  };

  // Extract character safely
  const character = currentKanji?.character || (currentKanji as any)?.kanji || '';

  // Extract meanings: handles either `meanings: string[]` or `meaning: "vehicle, wheel, car"`
  const rawMeanings =
    parseStringOrArray(currentKanji?.meanings).length > 0
      ? parseStringOrArray(currentKanji?.meanings)
      : parseStringOrArray(currentKanji?.meaning);

  const rawPrimary = rawMeanings[0] || (typeof currentKanji?.meaning === 'string' ? currentKanji.meaning : '') || '—';
  const primaryMeaning = rawPrimary ? rawPrimary.charAt(0).toUpperCase() + rawPrimary.slice(1) : '—';
  const secondaryMeanings = rawMeanings.slice(1);

  // Extract readings safely: handles either arrays or comma-delimited strings (e.g. "shu, zu") or null
  const kunyomiList = parseStringOrArray(currentKanji?.kunyomi);
  const onyomiList = parseStringOrArray(currentKanji?.onyomi);

  // Optional metadata from backend
  const strokeCount =
    currentKanji?.stroke_count ??
    (currentKanji as any)?.strokes ??
    null;

  const radical = currentKanji?.radical ? currentKanji.radical.trim() : null;
  const jlptLevel = currentKanji?.jlpt_level ?? null;

  // Text-to-speech for reading pronunciation (Japanese audio)
  const handlePlayAudio = () => {
    if (!currentKanji) return;
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      // Primary utterance: kunyomi reading, or onyomi reading, or kanji character
      const textToSpeak = kunyomiList[0] || onyomiList[0] || character;
      const utterance = new SpeechSynthesisUtterance(textToSpeak.replace(/[\(\)\-\.]/g, ''));
      utterance.lang = 'ja-JP';
      utterance.rate = 0.85;

      utterance.onstart = () => setPlayingAudio(true);
      utterance.onend = () => setPlayingAudio(false);
      utterance.onerror = () => setPlayingAudio(false);

      window.speechSynthesis.speak(utterance);
    } else {
      setPlayingAudio(true);
      setTimeout(() => setPlayingAudio(false), 800);
    }
  };

  if (!currentKanji) return null;

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col justify-between select-none animate-fadeIn">
      {/* Top Header: Session Progress & Exit */}
      <div className="flex items-center justify-between pb-3 mb-5 border-b border-white/[0.08]">
        <div className="flex items-center gap-2.5">
          <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.22em] text-[#d4af37] font-mono font-semibold">
            Study Phase
          </span>
          <span className="text-neutral-600">·</span>
          <span className="text-xs text-neutral-300 font-mono font-medium">
            Kanji {currentIndex + 1} of {total}
          </span>
        </div>

        {onExit && (
          <button
            type="button"
            onClick={onExit}
            className="text-xs text-neutral-400 hover:text-white px-2.5 py-1 rounded-md hover:bg-white/[0.04] transition-colors"
          >
            Exit Session
          </button>
        )}
      </div>

      {/* Main Flashcard Body (Simple clean dark container without color gradients) */}
      <div className="relative bg-[#0c0c10]/85 backdrop-blur-md border border-white/[0.1] rounded-3xl p-6 sm:p-8 shadow-2xl transition-all duration-300">
        {/* Card Header Strip: Badge, Stroke Count & Audio Trigger */}
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.08] gap-2 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-white/[0.05] border border-white/[0.1] text-neutral-300 font-mono tracking-wide">
              New Kanji
            </span>
            {strokeCount != null && (
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-white/[0.03] border border-white/[0.06] text-neutral-400 font-mono">
                {strokeCount} Strokes
              </span>
            )}
            {radical && (
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-white/[0.03] border border-white/[0.06] text-neutral-300 font-mono">
                Radical: <span className="font-sans text-neutral-100">{radical}</span>
              </span>
            )}
            {jlptLevel != null && (
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-[#d4af37]/10 border border-[#d4af37]/25 text-[#d4af37] font-mono">
                JLPT N{jlptLevel}
              </span>
            )}
          </div>

          {/* Audio Speaker Button */}
          <button
            type="button"
            onClick={handlePlayAudio}
            title="Pronounce Japanese reading"
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
                d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
              />
            </svg>
            <span className="text-[11px]">{playingAudio ? 'Playing...' : 'Audio'}</span>
          </button>
        </div>

        {/* Vertically split in the middle: Left side (Character + English) / Right side (Kunyomi top, Onyomi bottom) */}
        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-white/[0.08] py-4">
          {/* LEFT HALF: Character in centre with English translation beneath it */}
          <div className="flex flex-col items-center justify-center text-center p-6 sm:p-8">
            <div
              className="text-8xl sm:text-9xl font-light text-neutral-50 leading-none select-none drop-shadow-md transition-transform duration-300 hover:scale-[1.02]"
              style={{ fontFamily: "'Noto Serif JP', serif" }}
            >
              {character}
            </div>

            <div className="mt-5 flex flex-col items-center">
              <span className="text-[10px] uppercase font-mono tracking-[0.2em] text-[#d4af37]/90 mb-1">
                English Meaning
              </span>
              <h2
                className="text-3xl sm:text-4xl font-normal text-white leading-tight capitalize"
                style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
              >
                {primaryMeaning}
              </h2>
              {secondaryMeanings.length > 0 && (
                <p className="text-xs text-neutral-400 mt-1.5 font-light">
                  also:{' '}
                  <span className="text-neutral-300 italic">
                    {secondaryMeanings.join(', ')}
                  </span>
                </p>
              )}
            </div>
          </div>

          {/* RIGHT HALF: Kun'yomi on top, On'yomi below */}
          <div className="flex flex-col justify-center p-6 sm:p-8 space-y-6">
            {/* Kun'yomi on top */}
            <div className="flex flex-col">
              <div className="flex items-center justify-between pb-1.5 border-b border-white/[0.06]">
                <span className="text-[11px] uppercase tracking-wider font-mono font-medium text-neutral-300">
                  Kun'yomi (訓読み)
                </span>
                <span className="text-[10px] font-mono text-neutral-500">Native</span>
              </div>
              <div className="text-2xl sm:text-3xl font-light text-white tracking-wide font-mono mt-2.5">
                {kunyomiList.length > 0 ? (
                  <div className="flex flex-wrap items-baseline gap-2">
                    {kunyomiList.map((kun, i) => (
                      <span key={i} className="text-white">
                        {kun}
                        {i < kunyomiList.length - 1 && (
                          <span className="text-neutral-600 ml-2 font-sans font-light">·</span>
                        )}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="text-neutral-500 text-lg font-sans font-light">—</span>
                )}
              </div>
              <p className="text-[11px] text-neutral-400 mt-1.5 font-light">
                Typically used for standalone words & verbs
              </p>
            </div>

            {/* On'yomi below */}
            <div className="flex flex-col">
              <div className="flex items-center justify-between pb-1.5 border-b border-white/[0.06]">
                <span className="text-[11px] uppercase tracking-wider font-mono font-medium text-neutral-300">
                  On'yomi (音読み)
                </span>
                <span className="text-[10px] font-mono text-neutral-500">Chinese</span>
              </div>
              <div className="text-2xl sm:text-3xl font-light text-white tracking-wide font-mono mt-2.5">
                {onyomiList.length > 0 ? (
                  <div className="flex flex-wrap items-baseline gap-2">
                    {onyomiList.map((on, i) => (
                      <span key={i} className="text-white">
                        {on}
                        {i < onyomiList.length - 1 && (
                          <span className="text-neutral-600 ml-2 font-sans font-light">·</span>
                        )}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="text-neutral-500 text-lg font-sans font-light">—</span>
                )}
              </div>
              <p className="text-[11px] text-neutral-400 mt-1.5 font-light">
                Typically used in compound words (Jukugo)
              </p>
            </div>
          </div>
        </div>

        {/* ADDITIONAL DETAILS DRAWER BENEATH ALL OF THAT */}
        <div className="pt-4 border-t border-white/[0.08]">
          <button
            type="button"
            onClick={() => setShowDetails((prev) => !prev)}
            className="w-full flex items-center justify-between py-2.5 px-4 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.06] text-xs font-mono text-neutral-300 hover:text-white transition-all group"
          >
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-neutral-400 group-hover:bg-white transition-colors" />
              <span>
                {showDetails ? 'Hide additional details' : 'More details (Mnemonic, Radical, Vocabulary)'}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-neutral-400 group-hover:text-neutral-200">
              <span className="text-[11px]">{showDetails ? 'Collapse' : 'Expand'}</span>
              <span className="transform transition-transform duration-200 text-xs">
                {showDetails ? '▲' : '▼'}
              </span>
            </div>
          </button>

          {/* Expanded Drawer Content */}
          {showDetails && (
            <div className="mt-4 space-y-4 pt-2 animate-fadeIn border-t border-white/[0.06]">
              {/* Memory Mnemonic */}
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] uppercase font-mono tracking-wider text-[#d4af37]">
                    Memory Mnemonic
                  </span>
                  <span className="text-[10px] font-mono text-neutral-500">Visual Hook</span>
                </div>
                <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed italic font-light">
                  {currentKanji.mnemonic ||
                    `Picture the shape of 「${character}」 representing ${primaryMeaning.toLowerCase()} to anchor it permanently in your memory.`}
                </p>
              </div>

              {/* Radical information if provided */}
              {radical && (
                <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-mono tracking-wider text-neutral-400">
                      Kanji Radical (部首)
                    </span>
                    <p className="text-xs text-neutral-300 mt-0.5">
                      Constituent semantic root
                    </p>
                  </div>
                  <div className="text-2xl font-normal text-white px-3 py-1 bg-white/[0.04] rounded-lg border border-white/[0.08]">
                    {radical}
                  </div>
                </div>
              )}

              {/* Example Vocabulary (when present) */}
              {currentKanji.examples && currentKanji.examples.length > 0 && (
                <div>
                  <div className="text-[10px] uppercase font-mono tracking-wider text-neutral-400 mb-2">
                    Example Vocabulary
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {currentKanji.examples.map((ex, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] flex flex-col justify-between"
                      >
                        <div>
                          <div
                            className="text-base font-normal text-white"
                            style={{ fontFamily: "'Noto Serif JP', serif" }}
                          >
                            {ex.word}
                          </div>
                          <div className="text-[11px] text-neutral-300 font-mono mt-0.5">
                            {ex.reading}
                          </div>
                        </div>
                        <div className="text-xs text-neutral-400 mt-2 truncate">
                          {ex.meaning}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Navigation Footer Controls */}
      <div className="flex items-center justify-between mt-6 pt-2">
        <button
          type="button"
          onClick={handleBack}
          disabled={isFirst}
          className="px-5 py-2.5 rounded-full border border-white/[0.08] hover:border-white/[0.2] bg-white/[0.02] hover:bg-white/[0.06] text-xs text-neutral-300 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          ← Back
        </button>

        {/* Dots indicator */}
        <div className="flex items-center gap-1.5">
          {kanjiList.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setCurrentIndex(idx);
                setShowDetails(false);
              }}
              title={`Jump to kanji ${idx + 1}`}
              className={`h-2 rounded-full transition-all ${
                idx === currentIndex
                  ? 'bg-neutral-100 w-6'
                  : 'bg-white/[0.15] w-2 hover:bg-white/[0.3]'
              }`}
            />
          ))}
        </div>

        {isLast ? (
          <button
            type="button"
            onClick={onStartQuiz}
            className="px-6 py-2.5 rounded-full bg-neutral-100 hover:bg-white text-neutral-950 text-xs font-semibold tracking-wide shadow-lg transition-all flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
          >
            <span>Start quiz</span>
            <span>→</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={handleNext}
            className="px-6 py-2.5 rounded-full bg-neutral-100 hover:bg-white text-neutral-950 text-xs font-medium transition-all shadow-md flex items-center gap-1.5 hover:scale-[1.02] active:scale-[0.98]"
          >
            <span>Next</span>
            <span>→</span>
          </button>
        )}
      </div>
    </div>
  );
};
