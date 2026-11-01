import React, { useState } from 'react';
import { KanjiItem } from '../types';

interface KanjiModalProps {
  kanji: KanjiItem | null;
  onClose: () => void;
}

export const KanjiModal: React.FC<KanjiModalProps> = ({ kanji, onClose }) => {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  if (!kanji) return null;

  const playPronunciation = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    setIsPlayingAudio(true);
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ja-JP';
    utterance.rate = 0.85;
    utterance.onend = () => setIsPlayingAudio(false);
    utterance.onerror = () => setIsPlayingAudio(false);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      {/* Click outside to close */}
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative w-full max-w-2xl bg-[#0e0e11] border border-neutral-800 rounded-2xl p-6 md:p-8 shadow-2xl z-10 text-neutral-200 overflow-hidden">
        {/* Subtle decorative blossom glow */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-pink-500/5 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-neutral-400 hover:text-white transition-colors rounded-full hover:bg-neutral-800/60"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <line x1="18" y1="6" x2="6" y2="18" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="6" y1="6" x2="18" y2="18" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>

        {/* Header: Kanji Character + Core Details */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 border-b border-neutral-800/80 pb-6 mb-6">
          <div className="relative flex flex-col items-center justify-center w-28 h-28 md:w-32 md:h-32 bg-neutral-900/90 rounded-2xl border border-neutral-800 shadow-inner group">
            <span
              className="text-6xl md:text-7xl font-light text-[#fbfaf7] select-none"
              style={{ fontFamily: "'Noto Serif JP', serif" }}
            >
              {kanji.kanji}
            </span>
            <span className="absolute bottom-1 text-[10px] text-neutral-500 font-mono tracking-wider">
              {kanji.strokes} STROKES
            </span>
          </div>

          <div className="flex-1 text-center sm:text-left">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 mb-2">
              <span className="text-xs px-2 py-0.5 rounded bg-neutral-800 text-neutral-300 font-mono">
                JLPT {kanji.jlpt}
              </span>
              <span className="text-xs text-neutral-500">·</span>
              <span className="text-xs text-neutral-400">Grade Essential</span>
            </div>

            <h2
              className="text-2xl md:text-3xl font-light text-neutral-100 mb-1"
              style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
            >
              {kanji.meaning}
            </h2>

            <div className="flex items-center justify-center sm:justify-start gap-4 mt-3">
              <button
                onClick={() => playPronunciation(kanji.kanji)}
                className={`inline-flex items-center gap-2 px-3 py-1.5 text-xs rounded-full border border-neutral-700/80 hover:border-neutral-500 transition-colors ${
                  isPlayingAudio ? 'bg-pink-900/30 text-pink-200 border-pink-700' : 'text-neutral-300'
                }`}
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                  <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                </svg>
                <span>{isPlayingAudio ? 'Playing...' : 'Pronounce'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Readings and Radicals Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="p-4 bg-neutral-900/50 rounded-xl border border-neutral-800/60">
            <div className="text-[11px] uppercase tracking-wider text-neutral-500 mb-1.5 font-medium">
              Kun'yomi (Japanese Reading)
            </div>
            <div className="text-base text-neutral-200" style={{ fontFamily: "'Noto Serif JP', serif" }}>
              {kanji.kunyomi}
            </div>
          </div>

          <div className="p-4 bg-neutral-900/50 rounded-xl border border-neutral-800/60">
            <div className="text-[11px] uppercase tracking-wider text-neutral-500 mb-1.5 font-medium">
              On'yomi (Chinese Reading)
            </div>
            <div className="text-base text-neutral-200" style={{ fontFamily: "'Noto Serif JP', serif" }}>
              {kanji.onyomi}
            </div>
          </div>
        </div>

        {/* Radicals and Mnemonic */}
        <div className="mb-6 p-4 bg-neutral-900/30 rounded-xl border border-neutral-800/40">
          <div className="text-[11px] uppercase tracking-wider text-neutral-500 mb-2 font-medium">
            Radical Components & Mnemonic
          </div>
          <div className="flex flex-wrap gap-2 mb-2">
            {kanji.radicals.map((rad, idx) => (
              <span key={idx} className="text-xs px-2.5 py-1 bg-neutral-800/80 rounded-md text-neutral-300">
                {rad}
              </span>
            ))}
          </div>
          <p className="text-xs text-neutral-400 italic leading-relaxed">
            "{kanji.mnemonic}"
          </p>
        </div>

        {/* Vocabulary Examples */}
        <div>
          <div className="text-[11px] uppercase tracking-wider text-neutral-500 mb-3 font-medium">
            Example Vocabulary & Context
          </div>
          <div className="space-y-2.5 max-h-44 overflow-y-auto pr-1">
            {kanji.examples.map((ex, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 bg-neutral-900/60 hover:bg-neutral-800/50 rounded-xl border border-neutral-800/50 transition-colors"
              >
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm font-medium text-neutral-100" style={{ fontFamily: "'Noto Serif JP', serif" }}>
                      {ex.japanese}
                    </span>
                    <span className="text-xs text-neutral-400">
                      ({ex.reading})
                    </span>
                  </div>
                  <div className="text-xs text-neutral-400 mt-0.5">{ex.meaning}</div>
                </div>
                <button
                  onClick={() => playPronunciation(ex.japanese)}
                  className="p-1.5 text-neutral-500 hover:text-neutral-200 transition-colors"
                  title="Listen"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                    <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
