import React, { useState } from 'react';
import { KANJI_DATA } from '../data/kanjiData';
import { KanjiItem } from '../types';

interface LearnSectionProps {
  onSelectKanji: (kanji: KanjiItem) => void;
}

export const LearnSection: React.FC<LearnSectionProps> = ({ onSelectKanji }) => {
  const [selectedJlpt, setSelectedJlpt] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredKanji = KANJI_DATA.filter((k) => {
    const matchesJlpt = selectedJlpt === 'all' || k.jlpt === selectedJlpt;
    const matchesSearch =
      k.kanji.includes(searchQuery) ||
      k.meaning.toLowerCase().includes(searchQuery.toLowerCase()) ||
      k.romaji.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesJlpt && matchesSearch;
  });

  return (
    <section id="learn-section" className="relative z-20 w-full min-h-screen bg-[#070707] py-24 px-8 md:px-14 lg:px-20 text-neutral-100 border-t border-neutral-900/60">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div
              className="text-xs uppercase tracking-[0.25em] text-[#938c82] mb-3"
              style={{ fontFamily: "'Noto Serif JP', serif" }}
            >
              漢字学習 · Core Study Deck
            </div>
            <h2
              className="text-3xl md:text-5xl font-light text-[#fbfaf7] tracking-tight"
              style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
            >
              Essential Kanji Collection
            </h2>
            <p className="text-neutral-400 text-sm mt-2 max-w-lg">
              Explore kanji with natural brush calligraphy, stroke breakdown, Kun'yomi & On'yomi readings, and native audio.
            </p>
          </div>

          {/* Filter tabs & Search */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Filter buttons */}
            <div className="flex items-center p-1 bg-neutral-900/90 rounded-lg border border-neutral-800 text-xs">
              {['all', 'N5', 'N4', 'N3'].map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setSelectedJlpt(lvl)}
                  className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                    selectedJlpt === lvl
                      ? 'bg-neutral-800 text-white shadow-sm'
                      : 'text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  {lvl === 'all' ? 'All JLPT' : lvl}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search kanji, english..."
                className="w-full sm:w-48 bg-neutral-900/90 border border-neutral-800 rounded-lg px-3 py-1.5 text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-neutral-600"
              />
            </div>
          </div>
        </div>

        {/* Kanji Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {filteredKanji.map((item) => (
            <div
              key={item.id}
              onClick={() => onSelectKanji(item)}
              className="group relative bg-[#0d0d10]/70 hover:bg-[#121216] border border-neutral-800/80 hover:border-neutral-700 rounded-2xl p-6 transition-all duration-300 cursor-pointer flex flex-col justify-between overflow-hidden shadow-lg hover:shadow-2xl hover:-translate-y-1"
            >
              {/* Subtle top right JLPT indicator */}
              <div className="flex items-center justify-between text-[11px] text-neutral-500 mb-4">
                <span className="font-mono">{item.jlpt}</span>
                <span>{item.strokes} strokes</span>
              </div>

              {/* Large Center Character */}
              <div className="flex flex-col items-center justify-center my-2">
                <span
                  className="text-6xl md:text-7xl font-light text-[#f7f5f0] group-hover:scale-105 transition-transform duration-300"
                  style={{ fontFamily: "'Noto Serif JP', serif" }}
                >
                  {item.kanji}
                </span>
                <span className="text-xs text-neutral-400 mt-2 font-mono">
                  {item.romaji}
                </span>
              </div>

              {/* Card Footer: English Meaning & Reading */}
              <div className="mt-4 pt-4 border-t border-neutral-800/60 flex items-center justify-between">
                <div>
                  <div
                    className="text-base text-neutral-200 font-normal leading-snug"
                    style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
                  >
                    {item.meaning}
                  </div>
                  <div className="text-[11px] text-neutral-500 truncate max-w-[140px]">
                    {item.kunyomi.split(' ')[0]}
                  </div>
                </div>

                <div className="w-7 h-7 rounded-full border border-neutral-700/60 flex items-center justify-center text-neutral-400 group-hover:text-white group-hover:border-neutral-400 transition-colors">
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
