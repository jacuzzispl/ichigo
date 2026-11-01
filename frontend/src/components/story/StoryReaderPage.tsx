import React, { useState } from 'react';
import { Story, StorySentence, Segment, Vocab } from '../../types';
import {
  ArrowLeft,
  Volume2,
  VolumeX,
  Copy,
  Check,
  Eye,
  EyeOff,
  BookOpen,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

interface StoryReaderPageProps {
  story: Story;
  targetKanji?: string[];
  level?: string;
  onBackToDashboard: () => void;
  onRegenerate?: () => void;
}

export const StoryReaderPage: React.FC<StoryReaderPageProps> = ({
  story,
  targetKanji = [],
  level = 'N5',
  onBackToDashboard,
  onRegenerate,
}) => {
  // Option to display okurigana/furigana above the kanji
  const [showFurigana, setShowFurigana] = useState(true);

  // Per-sentence gloss visibility: maps sentence index to boolean (default FALSE - not shown by default!)
  const [visibleGlosses, setVisibleGlosses] = useState<Record<number, boolean>>({});

  // Audio speaking index
  const [speakingSentenceIndex, setSpeakingSentenceIndex] = useState<number | null>(null);
  const [isPlayingAll, setIsPlayingAll] = useState(false);
  const [copied, setCopied] = useState(false);
  const [hoveredVocabWord, setHoveredVocabWord] = useState<string | null>(null);

  // Toggle gloss lookup for a single sentence
  const toggleSentenceGloss = (index: number) => {
    setVisibleGlosses((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  // Toggle all glosses at once
  const areAllGlossesOpen =
    story.sentences.length > 0 &&
    story.sentences.every((_, idx) => Boolean(visibleGlosses[idx]));

  const toggleAllGlosses = () => {
    if (areAllGlossesOpen) {
      setVisibleGlosses({});
    } else {
      const allOpen: Record<number, boolean> = {};
      story.sentences.forEach((_, idx) => {
        allOpen[idx] = true;
      });
      setVisibleGlosses(allOpen);
    }
  };

  // Convert segments to plain Japanese text
  const getSentencePlainString = (segments: Segment[]): string => {
    return segments.map((s) => s.text).join('');
  };

  const getFullStoryPlainString = (): string => {
    return story.sentences.map((s) => getSentencePlainString(s.segments)).join('\n');
  };

  // Speak single sentence via Web Speech API
  const handleSpeakSentence = (sentence: StorySentence, index: number) => {
    if (!('speechSynthesis' in window)) return;

    if (speakingSentenceIndex === index) {
      window.speechSynthesis.cancel();
      setSpeakingSentenceIndex(null);
      setIsPlayingAll(false);
      return;
    }

    window.speechSynthesis.cancel();
    const text = getSentencePlainString(sentence.segments);
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ja-JP';
    utterance.rate = 0.85;

    utterance.onend = () => {
      setSpeakingSentenceIndex(null);
    };
    utterance.onerror = () => {
      setSpeakingSentenceIndex(null);
    };

    setSpeakingSentenceIndex(index);
    window.speechSynthesis.speak(utterance);
  };

  // Play full story consecutively
  const handlePlayEntireStory = () => {
    if (!('speechSynthesis' in window)) return;

    if (isPlayingAll) {
      window.speechSynthesis.cancel();
      setIsPlayingAll(false);
      setSpeakingSentenceIndex(null);
      return;
    }

    window.speechSynthesis.cancel();
    setIsPlayingAll(true);

    let currentIndex = 0;
    const playNext = () => {
      if (currentIndex >= story.sentences.length) {
        setIsPlayingAll(false);
        setSpeakingSentenceIndex(null);
        return;
      }

      setSpeakingSentenceIndex(currentIndex);
      const sentence = story.sentences[currentIndex];
      const text = getSentencePlainString(sentence.segments);
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ja-JP';
      utterance.rate = 0.85;

      utterance.onend = () => {
        currentIndex++;
        playNext();
      };
      utterance.onerror = () => {
        setIsPlayingAll(false);
        setSpeakingSentenceIndex(null);
      };

      window.speechSynthesis.speak(utterance);
    };

    playNext();
  };

  const handleCopyStory = async () => {
    try {
      await navigator.clipboard.writeText(
        `${story.title} (${story.title_english})\n\n` +
          story.sentences
            .map((s, idx) => `${idx + 1}. ${getSentencePlainString(s.segments)}\n   ${s.english}`)
            .join('\n\n')
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-[#060608] text-neutral-100 flex flex-col select-none overflow-x-hidden">
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-pink-900/10 rounded-full blur-[140px]" />
        <div className="absolute bottom-10 left-1/4 w-[500px] h-[500px] bg-purple-900/10 rounded-full blur-[140px]" />
        <div className="absolute inset-0 bg-radial-gradient from-transparent via-[#060608]/80 to-[#060608]" />
      </div>

      {/* Top Sticky Header */}
      <header className="sticky top-0 z-40 w-full bg-[#060608]/85 backdrop-blur-md border-b border-white/[0.08] px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3 sm:gap-4">
          <button
            type="button"
            onClick={onBackToDashboard}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.04] hover:bg-white/[0.1] border border-white/[0.08] text-xs text-neutral-300 hover:text-white transition-all"
            title="Return to Study Dashboard"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Dashboard</span>
          </button>

          <div className="h-4 w-px bg-white/[0.1] hidden sm:block" />

          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-mono tracking-widest text-pink-400">
                Story Reader
              </span>
              <span className="px-1.5 py-0.2 rounded bg-pink-950/40 border border-pink-800/40 text-[9px] font-mono text-pink-300">
                {level}
              </span>
              <span className="text-[10px] text-neutral-500 font-mono">
                {story.sentences.length} Sentences
              </span>
            </div>
          </div>
        </div>

        {/* Action Toolbar */}
        <div className="flex items-center gap-2">
          {/* Furigana / Okurigana Display Toggle */}
          <button
            type="button"
            onClick={() => setShowFurigana((prev) => !prev)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs transition-all border ${
              showFurigana
                ? 'bg-pink-950/50 border-pink-700/60 text-pink-200'
                : 'bg-white/[0.03] border-white/[0.08] text-neutral-400 hover:text-neutral-200'
            }`}
            title={
              showFurigana
                ? 'Readings (furigana) displayed above kanji. Click to hide.'
                : 'Readings hidden. Click to display above kanji.'
            }
          >
            {showFurigana ? (
              <>
                <Eye className="w-3.5 h-3.5 text-pink-400" />
                <span className="font-mono text-[11px]">Furigana: ON</span>
              </>
            ) : (
              <>
                <EyeOff className="w-3.5 h-3.5 text-neutral-400" />
                <span className="font-mono text-[11px]">Furigana: OFF</span>
              </>
            )}
          </button>

          {/* Toggle All Glosses Button */}
          <button
            type="button"
            onClick={toggleAllGlosses}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs transition-all border ${
              areAllGlossesOpen
                ? 'bg-purple-950/50 border-purple-700/60 text-purple-200'
                : 'bg-white/[0.03] border-white/[0.08] text-neutral-400 hover:text-neutral-200'
            }`}
            title="Toggle vocabulary glosses and English translations for all sentences"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span className="hidden md:inline">
              {areAllGlossesOpen ? 'Hide All Glosses' : 'Expand All Glosses'}
            </span>
          </button>

          {/* Play Full Story Audio */}
          <button
            type="button"
            onClick={handlePlayEntireStory}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs transition-all border ${
              isPlayingAll
                ? 'bg-emerald-950/60 border-emerald-700/60 text-emerald-200 animate-pulse'
                : 'bg-white/[0.03] border-white/[0.08] text-neutral-300 hover:text-white'
            }`}
            title="Read whole story aloud"
          >
            {isPlayingAll ? (
              <>
                <VolumeX className="w-3.5 h-3.5 text-emerald-300" />
                <span className="hidden sm:inline">Stop Audio</span>
              </>
            ) : (
              <>
                <Volume2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Play All</span>
              </>
            )}
          </button>

          {/* Copy Story */}
          <button
            type="button"
            onClick={handleCopyStory}
            className="p-1.5 rounded-full bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.08] text-neutral-400 hover:text-white transition-colors"
            title="Copy story text to clipboard"
          >
            {copied ? (
              <Check className="w-4 h-4 text-emerald-400" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </button>

          {/* Regenerate Action */}
          {onRegenerate && (
            <button
              type="button"
              onClick={onRegenerate}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-pink-900/60 hover:bg-pink-800 text-pink-100 border border-pink-700/40 text-xs font-medium transition-all shadow-md"
              title="Regenerate with selected parameters"
            >
              <RotateCcw className="w-3 h-3" />
              <span className="hidden sm:inline">Reroll</span>
            </button>
          )}
        </div>
      </header>

      {/* Main Expansive Reading View taking up most of the screen */}
      <main className="relative z-10 flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex flex-col justify-start">
        {/* Story Title Card */}
        <div className="text-center mb-8 sm:mb-12 space-y-2 pb-6 border-b border-white/[0.08]">
          <span
            className="text-xs uppercase tracking-[0.3em] text-[#9a9288] font-mono block"
            style={{ fontFamily: "'Noto Serif JP', serif" }}
          >
            物語 · Story
          </span>

          <h1
            className="text-3xl sm:text-5xl font-normal tracking-tight text-white leading-tight"
            style={{ fontFamily: "'Noto Serif JP', serif" }}
          >
            {story.title}
          </h1>

          {story.title_english && (
            <p
              className="text-sm sm:text-lg text-neutral-400 font-light italic"
              style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
            >
              {story.title_english}
            </p>
          )}
        </div>

        {/* Sentences List */}
        <div className="space-y-6 sm:space-y-8 flex-1">
          {story.sentences.map((sentence, sIdx) => {
            const isSpeaking = speakingSentenceIndex === sIdx;
            const isGlossOpen = Boolean(visibleGlosses[sIdx]);

            return (
              <article
                key={sIdx}
                className={`group relative rounded-2xl transition-all duration-300 border ${
                  isSpeaking
                    ? 'bg-pink-950/20 border-pink-700/40 shadow-lg shadow-pink-950/30'
                    : isGlossOpen
                    ? 'bg-white/[0.025] border-white/[0.12] shadow-md'
                    : 'bg-white/[0.015] hover:bg-white/[0.025] border-white/[0.06] hover:border-white/[0.1]'
                } p-5 sm:p-7 flex flex-col gap-4`}
              >
                {/* Sentence Header: Number + Actions */}
                <div className="flex items-center justify-between text-xs text-neutral-500">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-white/[0.04] border border-white/[0.08] flex items-center justify-center font-mono text-[11px] text-neutral-400">
                      {sIdx + 1}
                    </span>
                    <span className="text-[11px] font-mono text-neutral-500">
                      Sentence {sIdx + 1} of {story.sentences.length}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Speak Sentence Button */}
                    <button
                      type="button"
                      onClick={() => handleSpeakSentence(sentence, sIdx)}
                      className={`p-2 rounded-lg transition-colors ${
                        isSpeaking
                          ? 'bg-pink-900/70 text-white animate-pulse'
                          : 'bg-white/[0.03] hover:bg-white/[0.08] text-neutral-400 hover:text-white'
                      }`}
                      title={isSpeaking ? 'Stop audio' : 'Listen to sentence'}
                      aria-label="Listen to Japanese pronunciation"
                    >
                      {isSpeaking ? (
                        <VolumeX className="w-4 h-4 text-pink-200" />
                      ) : (
                        <Volume2 className="w-4 h-4" />
                      )}
                    </button>

                    {/* Gloss Lookup Toggle Button: NOT shown by default, user chooses to see definition! */}
                    <button
                      type="button"
                      onClick={() => toggleSentenceGloss(sIdx)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all border ${
                        isGlossOpen
                          ? 'bg-purple-950/50 border-purple-700/60 text-purple-200 font-medium'
                          : 'bg-white/[0.03] hover:bg-white/[0.06] border-white/[0.08] text-neutral-400 hover:text-neutral-200'
                      }`}
                      title="Look up words and sentence translation"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>{isGlossOpen ? 'Hide Definition' : 'Look Up Definition'}</span>
                      {isGlossOpen ? (
                        <ChevronUp className="w-3.5 h-3.5 ml-0.5" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5 ml-0.5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Japanese Sentence Body */}
                {/* Critical requirement:
                    - The actual kanji is in the sentence text (segment.text).
                    - The kana reading is strictly rendered above in <rt> furigana.
                    - Okurigana is split into separate segment without reading.
                */}
                <div
                  className="text-2xl sm:text-3xl lg:text-4xl leading-loose sm:leading-loose text-neutral-100 flex flex-wrap items-baseline gap-y-4 pt-1"
                  style={{ fontFamily: "'Noto Serif JP', serif" }}
                >
                  {sentence.segments.map((segment, segIdx) => {
                    const hasReading = Boolean(segment.reading);
                    const isTarget = targetKanji.includes(segment.text);
                    const isHoveredVocab =
                      hoveredVocabWord &&
                      (segment.text.includes(hoveredVocabWord) ||
                        hoveredVocabWord.includes(segment.text));

                    // If chunk has a reading (it's a kanji)
                    if (hasReading) {
                      return (
                        <ruby
                          key={segIdx}
                          className={`inline-flex flex-col items-center mx-0.5 px-1 py-0.5 rounded transition-colors ${
                            isHoveredVocab
                              ? 'bg-purple-950/60 text-purple-200 ring-1 ring-purple-500'
                              : isTarget
                              ? 'bg-pink-950/30 text-pink-200 border-b-2 border-pink-500/40'
                              : 'hover:text-white'
                          }`}
                        >
                          {/* Furigana/okurigana reading rendered ABOVE kanji */}
                          {showFurigana ? (
                            <rt className="text-xs sm:text-sm text-pink-400/90 font-mono tracking-tight select-none mb-1 leading-none">
                              {segment.reading}
                            </rt>
                          ) : (
                            <rt className="invisible h-0 text-[0px] leading-none">
                              {segment.reading}
                            </rt>
                          )}
                          {/* Actual Kanji is in the sentence! */}
                          <span className="font-light leading-none">
                            {segment.text}
                          </span>
                        </ruby>
                      );
                    }

                    // Otherwise regular okurigana / particle / punctuation chunk
                    return (
                      <span
                        key={segIdx}
                        className={`inline-block ${
                          isHoveredVocab
                            ? 'text-purple-300 bg-purple-950/40 rounded px-0.5'
                            : 'text-neutral-200'
                        }`}
                      >
                        {segment.text}
                      </span>
                    );
                  })}
                </div>

                {/* Gloss Lookup Section (Shown ONLY when user toggles it!) */}
                {isGlossOpen && (
                  <div className="mt-3 pt-4 border-t border-white/[0.08] animate-fadeIn space-y-4">
                    {/* Sentence English Translation */}
                    <div className="p-3.5 rounded-xl bg-black/40 border border-white/[0.06] flex items-start gap-3">
                      <div className="text-[10px] uppercase font-mono tracking-wider text-neutral-500 shrink-0 mt-0.5">
                        English
                      </div>
                      <div className="text-sm sm:text-base text-neutral-200 font-light leading-relaxed">
                        “{sentence.english}”
                      </div>
                    </div>

                    {/* Vocabulary Breakdown Table / Cards */}
                    {sentence.vocab && sentence.vocab.length > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-[11px] text-neutral-400 font-mono">
                          <span className="flex items-center gap-1.5">
                            <BookOpen className="w-3.5 h-3.5 text-purple-400" />
                            <span>Sentence Vocabulary Gloss ({sentence.vocab.length} terms)</span>
                          </span>
                          <span className="text-[10px] text-neutral-500 hidden sm:inline">
                            Hover over a term to highlight in the sentence
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                          {sentence.vocab.map((v: Vocab, vIdx: number) => (
                            <div
                              key={vIdx}
                              onMouseEnter={() => setHoveredVocabWord(v.word)}
                              onMouseLeave={() => setHoveredVocabWord(null)}
                              className="p-3 rounded-xl bg-white/[0.025] hover:bg-white/[0.05] border border-white/[0.06] hover:border-purple-500/40 transition-all flex flex-col justify-between"
                            >
                              <div className="flex items-start justify-between gap-2 mb-1">
                                <span
                                  className="text-lg font-light text-neutral-100"
                                  style={{ fontFamily: "'Noto Serif JP', serif" }}
                                >
                                  {v.word}
                                </span>
                                {v.dictionary_form && v.dictionary_form !== v.word && (
                                  <span className="px-1.5 py-0.5 rounded bg-purple-950/40 border border-purple-800/40 text-[10px] font-mono text-purple-300">
                                    Base: {v.dictionary_form}
                                  </span>
                                )}
                              </div>
                              <div className="text-xs text-neutral-300 leading-snug">
                                {v.meaning}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </article>
            );
          })}
        </div>

        {/* Bottom Actions Bar */}
        <div className="mt-12 pt-6 border-t border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-neutral-500">
            <span>Completed reading</span>
            <span className="text-neutral-400">“{story.title}”</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBackToDashboard}
              className="px-5 py-2 rounded-full bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.1] text-xs text-neutral-200 transition-colors"
            >
              ← Back to Dashboard
            </button>
            {onRegenerate && (
              <button
                type="button"
                onClick={onRegenerate}
                className="px-6 py-2 rounded-full bg-pink-900/80 hover:bg-pink-700 text-white text-xs font-medium transition-all shadow-md flex items-center gap-2"
              >
                <Sparkles className="w-3.5 h-3.5 text-pink-300" />
                <span>Generate Another Story</span>
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};
