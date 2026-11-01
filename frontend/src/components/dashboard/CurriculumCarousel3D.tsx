import React, { useState, useMemo, useRef, useEffect } from 'react';
import { KANJI_DATA } from '../../data/kanjiData';
import { KanjiItem } from '../../types';

interface CurriculumCarousel3DProps {
  onSelectKanji?: (kanji: KanjiItem) => void;
}

export const CurriculumCarousel3D: React.FC<CurriculumCarousel3DProps> = ({
  onSelectKanji,
}) => {
  const [selectedLevel, setSelectedLevel] = useState<'N5' | 'N4' | 'N3'>('N5');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSeeAllOpen, setIsSeeAllOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [rotationAngle, setRotationAngle] = useState(0);
  const [stageWidth, setStageWidth] = useState(480);

  const containerRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const dragStartXRef = useRef(0);
  const wheelAccumulatorRef = useRef(0);

  // ResizeObserver to dynamically adapt 3D radius and card scale to any viewport width
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect.width > 0) {
          setStageWidth(entry.contentRect.width);
        }
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const filteredKanji = useMemo(() => {
    return KANJI_DATA.filter((k) => k.jlpt === selectedLevel);
  }, [selectedLevel]);

  const total = filteredKanji.length;
  const angleStep = total > 0 ? 360 / total : 0;

  // Sync rotation angle when currentIndex changes
  useEffect(() => {
    setRotationAngle(-currentIndex * angleStep);
  }, [currentIndex, angleStep]);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % (total || 1));
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + (total || 1)) % (total || 1));
  };

  const handleLevelChange = (lvl: 'N5' | 'N4' | 'N3') => {
    setSelectedLevel(lvl);
    setCurrentIndex(0);
    setRotationAngle(0);
  };

  // Two-finger trackpad horizontal wheel scroll handler
  const handleWheel = (e: React.WheelEvent) => {
    const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
    wheelAccumulatorRef.current += delta;

    if (wheelAccumulatorRef.current > 30) {
      handleNext();
      wheelAccumulatorRef.current = 0;
    } else if (wheelAccumulatorRef.current < -30) {
      handlePrev();
      wheelAccumulatorRef.current = 0;
    }
  };

  // Pointer / Touch drag handling
  const handlePointerDown = (e: React.PointerEvent) => {
    isDraggingRef.current = true;
    dragStartXRef.current = e.clientX;
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    const diff = e.clientX - dragStartXRef.current;
    if (diff < -35) {
      handleNext();
      dragStartXRef.current = e.clientX;
    } else if (diff > 35) {
      handlePrev();
      dragStartXRef.current = e.clientX;
    }
  };

  const handlePointerUp = () => {
    isDraggingRef.current = false;
  };

  // Dynamic responsive geometry calculation: scales flawlessly with container width
  const radius = Math.max(140, Math.min(270, stageWidth * 0.35));
  const cardWidth = Math.max(105, Math.min(145, stageWidth * 0.25));
  const cardHeight = Math.round(cardWidth * 1.32);

  const activeKanji = filteredKanji[currentIndex] || filteredKanji[0];

  // Kanji filtered for "See All" modal search
  const modalKanjiList = useMemo(() => {
    return filteredKanji.filter(
      (k) =>
        k.kanji.includes(searchQuery) ||
        k.meaning.toLowerCase().includes(searchQuery.toLowerCase()) ||
        k.romaji.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [filteredKanji, searchQuery]);

  return (
    <div className="relative w-full h-full bg-black/20 backdrop-blur-[6px] border border-white/[0.06] hover:border-white/[0.1] hover:bg-black/25 rounded-2xl p-3 sm:p-4 lg:p-5 flex flex-col justify-between overflow-hidden shadow-xl transition-all">
      {/* Background ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-500/[0.02] rounded-full blur-3xl pointer-events-none" />

      {/* Widget Header & Level Selector */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2 relative z-10 shrink-0">
        <div className="flex items-center gap-2">
          <span
            className="text-[11px] uppercase tracking-[0.2em] text-[#938c82]"
            style={{ fontFamily: "'Noto Serif JP', serif" }}
          >
            3Dカリキュラム
          </span>
          <span className="text-[11px] text-neutral-600">/</span>
          <span className="text-xs font-light text-neutral-200">
            Level {selectedLevel}
          </span>
        </div>

        {/* Level Filters & "See All" Button */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="flex p-0.5 bg-white/[0.03] rounded-lg border border-white/[0.06] text-[11px]">
            {(['N5', 'N4', 'N3'] as const).map((lvl) => (
              <button
                key={lvl}
                onClick={() => handleLevelChange(lvl)}
                className={`px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md font-medium transition-all ${
                  selectedLevel === lvl
                    ? 'bg-neutral-800 text-white shadow-sm'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>

          {/* Prominent "See All" action */}
          <button
            onClick={() => setIsSeeAllOpen(true)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-white/[0.08] hover:border-white/[0.18] bg-white/[0.03] hover:bg-white/[0.07] text-[11px] sm:text-xs text-neutral-200 hover:text-white transition-colors"
          >
            <span>See All ({total})</span>
            <span className="text-[9px] text-neutral-400">↗</span>
          </button>
        </div>
      </div>

      {/* 3D Carousel Stage with 2-finger scroll and touch/mouse drag */}
      <div
        ref={containerRef}
        onWheel={handleWheel}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        className="relative w-full flex-1 min-h-[190px] sm:min-h-[220px] flex items-center justify-center overflow-hidden cursor-grab active:cursor-grabbing select-none"
        title="Scroll with two fingers left/right or drag to rotate carousel"
      >
        {/* Navigation Arrows */}
        <button
          onClick={handlePrev}
          className="absolute left-1 sm:left-2 z-30 p-1.5 sm:p-2 rounded-full bg-black/40 hover:bg-black/70 border border-white/[0.08] text-neutral-400 hover:text-white transition-all shadow-md focus:outline-none"
          aria-label="Previous Kanji"
        >
          <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>

        <button
          onClick={handleNext}
          className="absolute right-1 sm:right-2 z-30 p-1.5 sm:p-2 rounded-full bg-black/40 hover:bg-black/70 border border-white/[0.08] text-neutral-400 hover:text-white transition-all shadow-md focus:outline-none"
          aria-label="Next Kanji"
        >
          <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>

        {/* Perspective Stage */}
        <div
          className="w-full h-full flex items-center justify-center"
          style={{ perspective: `${Math.max(600, stageWidth * 1.5)}px` }}
        >
          {/* Rotating 3D Ring */}
          <div
            className="relative transition-transform duration-500 ease-out"
            style={{
              width: `${cardWidth}px`,
              height: `${cardHeight}px`,
              transformStyle: 'preserve-3d',
              transform: `rotateY(${rotationAngle}deg)`,
            }}
          >
            {filteredKanji.map((item, idx) => {
              const itemAngle = idx * angleStep;
              const isSelected = idx === currentIndex;

              return (
                <div
                  key={item.id}
                  onClick={() => {
                    setCurrentIndex(idx);
                    if (onSelectKanji) onSelectKanji(item);
                  }}
                  className={`absolute inset-0 cursor-pointer rounded-xl border transition-all duration-300 flex flex-col justify-between p-2.5 sm:p-3 select-none ${
                    isSelected
                      ? 'bg-black/60 backdrop-blur-md border-neutral-300 shadow-[0_0_18px_rgba(255,200,220,0.22)] ring-1 ring-neutral-300 scale-105'
                      : 'bg-black/35 backdrop-blur-[4px] border-white/[0.06] opacity-65 hover:opacity-95 hover:border-white/[0.16]'
                  }`}
                  style={{
                    transform: `rotateY(${itemAngle}deg) translateZ(${radius}px)`,
                    backfaceVisibility: 'hidden',
                  }}
                >
                  <div className="flex items-center justify-between text-[9px] sm:text-[10px] text-neutral-500">
                    <span className="font-mono">{item.jlpt}</span>
                    <span>{item.strokes}s</span>
                  </div>

                  <div className="flex flex-col items-center justify-center my-auto">
                    <span
                      className="text-3xl sm:text-4xl md:text-5xl font-light text-[#fbfaf7] transition-transform duration-300"
                      style={{ fontFamily: "'Noto Serif JP', serif" }}
                    >
                      {item.kanji}
                    </span>
                    <span className="text-[10px] sm:text-[11px] font-mono text-neutral-400 mt-0.5 sm:mt-1">
                      {item.romaji}
                    </span>
                  </div>

                  <div className="text-center pt-1 border-t border-white/[0.06]">
                    <div
                      className="text-[11px] sm:text-xs font-medium text-neutral-200 truncate"
                      style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
                    >
                      {item.meaning}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Scroll Gesture Helper Prompt */}
        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 z-20 text-[9px] sm:text-[10px] text-neutral-500 tracking-wider flex items-center gap-1 bg-black/50 px-2 py-0.5 rounded-full border border-white/[0.06] pointer-events-none backdrop-blur-sm">
          <span>⇄ Two-finger swipe or drag to spin</span>
        </div>
      </div>

      {/* Active Kanji Quick Readout */}
      {activeKanji && (
        <div className="shrink-0 pt-1.5 sm:pt-2 border-t border-white/[0.06] flex items-center justify-between text-[11px] sm:text-xs text-neutral-400">
          <div className="flex items-center gap-2 truncate max-w-[80%]">
            <span
              className="text-sm text-neutral-100 font-medium"
              style={{ fontFamily: "'Noto Serif JP', serif" }}
            >
              {activeKanji.kanji}
            </span>
            <span className="text-neutral-300 truncate">{activeKanji.meaning}</span>
            <span className="hidden sm:inline text-neutral-600">·</span>
            <span className="hidden sm:inline text-neutral-500 font-mono">{activeKanji.kunyomi.split(' ')[0]}</span>
          </div>

          <span className="font-mono text-neutral-500 text-[10px] sm:text-[11px] shrink-0">
            {currentIndex + 1} / {total}
          </span>
        </div>
      )}

      {/* "See All" Full Level Inspection Modal */}
      {isSeeAllOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="absolute inset-0" onClick={() => setIsSeeAllOpen(false)} />
          <div className="relative w-full max-w-3xl bg-[#0c0c10] border border-neutral-800 rounded-2xl p-5 sm:p-6 shadow-2xl z-10 text-neutral-200 max-h-[85vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-neutral-800 mb-3 sm:mb-4 shrink-0">
              <div>
                <h3
                  className="text-xl sm:text-2xl font-light text-neutral-100"
                  style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
                >
                  All Level {selectedLevel} Kanji ({filteredKanji.length})
                </h3>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Full roster of characters included in the {selectedLevel} curriculum. Click any character to inspect details.
                </p>
              </div>

              <button
                onClick={() => setIsSeeAllOpen(false)}
                className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800/60"
              >
                ✕
              </button>
            </div>

            {/* Search Input in Modal */}
            <div className="mb-3 sm:mb-4 shrink-0">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by kanji, English meaning, romaji..."
                className="w-full px-3.5 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-neutral-600"
              />
            </div>

            {/* Kanji Cards Grid in Modal */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5 sm:gap-3 overflow-y-auto pr-1 flex-1 min-h-0">
              {modalKanjiList.map((item, idx) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setCurrentIndex(filteredKanji.findIndex((k) => k.id === item.id) || 0);
                    setIsSeeAllOpen(false);
                    if (onSelectKanji) onSelectKanji(item);
                  }}
                  className="p-2.5 sm:p-3 bg-neutral-900/70 hover:bg-neutral-800 border border-neutral-800 hover:border-neutral-700 rounded-xl text-center transition-all group flex flex-col items-center justify-between"
                >
                  <div className="flex justify-between w-full text-[10px] text-neutral-500 font-mono mb-1">
                    <span>{item.jlpt}</span>
                    <span>{item.strokes}s</span>
                  </div>

                  <div
                    className="text-2xl sm:text-3xl text-neutral-100 group-hover:scale-110 transition-transform my-1"
                    style={{ fontFamily: "'Noto Serif JP', serif" }}
                  >
                    {item.kanji}
                  </div>

                  <div className="w-full">
                    <div className="text-xs text-neutral-200 font-medium truncate">
                      {item.meaning}
                    </div>
                    <div className="text-[10px] text-neutral-500 truncate font-mono mt-0.5">
                      {item.romaji}
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Modal Footer */}
            <div className="pt-3 sm:pt-4 border-t border-neutral-800 flex items-center justify-between text-xs text-neutral-500 shrink-0 mt-3">
              <span>Showing {modalKanjiList.length} of {filteredKanji.length} kanji</span>
              <button
                onClick={() => setIsSeeAllOpen(false)}
                className="px-4 py-1.5 rounded-full bg-neutral-200 hover:bg-white text-neutral-950 font-medium text-xs transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
