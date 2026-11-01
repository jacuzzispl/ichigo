import React, { useState } from 'react';
import { StoryGenerateResponse, StorySentence, StorySegmentToken } from '../../types';
import { Volume2, VolumeX, Copy, Check, Eye, EyeOff } from 'lucide-react';

interface StoryReaderProps {
  story: StoryGenerateResponse;
  highlightKanji?: string[];
  initialShowOkurigana?: boolean;
}

export const StoryReader: React.FC<StoryReaderProps> = ({
  story,
  highlightKanji = [],
  initialShowOkurigana = true,
}) => {
  const [showOkurigana, setShowOkurigana] = useState(initialShowOkurigana);
  const [speakingIndex, setSpeakingIndex] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);

  // Convert full sentence tokens to plain string for TTS & clipboard
  const getSentencePlainString = (tokens: StorySegmentToken[]): string => {
    return tokens.map((t) => t.text).join('');
  };

  const getFullStoryPlainString = (): string => {
    return story.sentences.map((s) => getSentencePlainString(s)).join('\n');
  };

  const handleSpeakSentence = (sentence: StorySentence, index: number) => {
    if (!('speechSynthesis' in window)) return;

    if (speakingIndex === index) {
      window.speechSynthesis.cancel();
      setSpeakingIndex(null);
      return;
    }

    window.speechSynthesis.cancel();
    const text = getSentencePlainString(sentence);
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ja-JP';
    utterance.rate = 0.85; // slightly slower for optimal learner comprehension

    utterance.onend = () => setSpeakingIndex(null);
    utterance.onerror = () => setSpeakingIndex(null);

    setSpeakingIndex(index);
    window.speechSynthesis.speak(utterance);
  };

  const handleCopyStory = async () => {
    try {
      await navigator.clipboard.writeText(getFullStoryPlainString());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  return (
    <div className="w-full bg-[#0a0a0e]/80 border border-white/[0.08] rounded-2xl p-4 sm:p-6 shadow-xl flex flex-col gap-4">
      {/* Header Bar: Title + Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-white/[0.06] gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-mono tracking-widest text-pink-400">
              {story.level ? `${story.level} Story` : 'Japanese Story'}
            </span>
            <span className="text-neutral-600">·</span>
            <span className="text-[11px] text-neutral-400">
              {story.sentences.length} sentences
            </span>
          </div>
          <h3
            className="text-2xl sm:text-3xl text-neutral-100 font-light mt-0.5"
            style={{ fontFamily: "'Noto Serif JP', serif" }}
          >
            {story.title}
          </h3>
        </div>

        {/* Action Controls: Okurigana toggle, copy, audio */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Okurigana Display Toggle Switch */}
          <button
            type="button"
            onClick={() => setShowOkurigana((prev) => !prev)}
            aria-label="Toggle Okurigana / Furigana readings display"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs transition-all border ${
              showOkurigana
                ? 'bg-pink-950/40 border-pink-700/50 text-pink-200'
                : 'bg-white/[0.03] border-white/[0.08] text-neutral-400 hover:text-neutral-200'
            }`}
            title={
              showOkurigana
                ? 'Okurigana is currently displayed above kanji. Click to hide.'
                : 'Okurigana is currently hidden. Click to display above kanji.'
            }
          >
            {showOkurigana ? (
              <>
                <Eye className="w-3.5 h-3.5 text-pink-400" />
                <span className="font-medium">Okurigana / 振り仮名: ON</span>
              </>
            ) : (
              <>
                <EyeOff className="w-3.5 h-3.5 text-neutral-400" />
                <span>Okurigana: OFF</span>
              </>
            )}
          </button>

          {/* Copy Plain Story */}
          <button
            type="button"
            onClick={handleCopyStory}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.08] text-neutral-400 hover:text-white text-xs transition-colors"
            title="Copy Japanese story text"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-300">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Story Sentences Body */}
      <div className="space-y-4 sm:space-y-5 my-1">
        {story.sentences.map((sentence, sIdx) => {
          const isSpeaking = speakingIndex === sIdx;

          return (
            <div
              key={sIdx}
              className="group relative flex items-start justify-between gap-3 p-3.5 sm:p-4 rounded-xl bg-white/[0.015] hover:bg-white/[0.03] border border-white/[0.03] hover:border-white/[0.08] transition-all"
            >
              {/* Sentence Number Badge */}
              <span className="text-[10px] font-mono text-neutral-600 mt-1.5 shrink-0 w-5">
                {sIdx + 1}.
              </span>

              {/* Japanese Sentence Tokens with Ruby / Okurigana support */}
              <div
                className="flex-1 text-lg sm:text-2xl leading-relaxed text-neutral-100 flex flex-wrap items-baseline gap-y-3"
                style={{ fontFamily: "'Noto Serif JP', serif" }}
              >
                {sentence.map((token, tIdx) => {
                  const isTarget = highlightKanji.includes(token.text);
                  const hasReading = Boolean(token.reading);

                  // If token has reading and okurigana display is toggled ON
                  if (hasReading && showOkurigana) {
                    return (
                      <ruby
                        key={tIdx}
                        className={`inline-flex flex-col items-center mx-0.5 px-0.5 rounded transition-colors ${
                          isTarget
                            ? 'bg-pink-950/40 text-pink-200 border-b border-pink-500/40'
                            : 'hover:text-white'
                        }`}
                      >
                        <rt className="text-[11px] sm:text-xs text-pink-400/90 font-mono tracking-tight select-none mb-0.5 leading-none">
                          {token.reading}
                        </rt>
                        <span className="text-lg sm:text-2xl font-light leading-none">
                          {token.text}
                        </span>
                      </ruby>
                    );
                  }

                  // If okurigana is OFF or token has no reading
                  return (
                    <span
                      key={tIdx}
                      className={`inline-block ${
                        isTarget
                          ? 'text-pink-300 font-normal px-0.5 bg-pink-950/30 rounded'
                          : 'text-neutral-200'
                      }`}
                    >
                      {token.text}
                    </span>
                  );
                })}
              </div>

              {/* Sentence Audio Playback Button */}
              <button
                type="button"
                onClick={() => handleSpeakSentence(sentence, sIdx)}
                className={`p-2 rounded-lg transition-colors shrink-0 ${
                  isSpeaking
                    ? 'bg-pink-900/60 text-white animate-pulse'
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
            </div>
          );
        })}
      </div>

      {/* Target Kanji Legend */}
      {highlightKanji.length > 0 && (
        <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs text-neutral-400">
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-neutral-500">Studied kanji featured:</span>
            <div className="flex items-center gap-1.5 flex-wrap">
              {highlightKanji.map((k, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 rounded bg-pink-950/30 border border-pink-900/30 text-pink-300 font-serif text-sm"
                >
                  {k}
                </span>
              ))}
            </div>
          </div>

          <span className="text-[11px] text-neutral-500 hidden sm:inline">
            Click audio 🔊 to hear natural speech
          </span>
        </div>
      )}
    </div>
  );
};
