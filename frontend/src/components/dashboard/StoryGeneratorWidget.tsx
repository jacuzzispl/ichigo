import React, { useState, useEffect } from 'react';
import { KANJI_DATA } from '../../data/kanjiData';
import { KanjiItem } from '../../types';

export const StoryGeneratorWidget: React.FC = () => {
  const learnedPool = KANJI_DATA;

  const [selectedSlots, setSelectedSlots] = useState<KanjiItem[]>([]);
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [generatedStory, setGeneratedStory] = useState<{
    japanese: string;
    reading: string;
    english: string;
  } | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Pick 5-6 random kanji initially
  const rollRandomKanji = (count = 5) => {
    const shuffled = [...learnedPool].sort(() => 0.5 - Math.random());
    setSelectedSlots(shuffled.slice(0, count));
    setGeneratedStory(null);
  };

  useEffect(() => {
    rollRandomKanji(5);
  }, []);

  const handleRemoveSlot = (id: string) => {
    setSelectedSlots((prev) => prev.filter((k) => k.id !== id));
  };

  const handleAddKanji = (kanji: KanjiItem) => {
    if (selectedSlots.some((k) => k.id === kanji.id)) return;
    if (selectedSlots.length >= 8) return;
    setSelectedSlots((prev) => [...prev, kanji]);
  };

  const handleGenerateStory = () => {
    if (selectedSlots.length === 0) return;
    setIsGenerating(true);

    setTimeout(() => {
      const stories = [
        {
          japanese: `春の夜、満開の桜の下で清らかな水が流れ、月明かりが静かな心を照らす。旅人は大いなる道を歩み、未来への光を見出した。`,
          reading: `Haru no yoru, mankai no sakura no shita de kiyorakana mizu ga nagare, tsukiakari ga shizukana kokoro o terasu.`,
          english: `On a spring evening beneath blooming sakura, pure water flowed as moonlight illuminated a peaceful spirit on the ancient path.`,
        },
        {
          japanese: `山のいただきに登ると、澄み渡る青空から優しい風が吹き抜け、川のせせらぎが遠くに響く。自然の和に包まれ、深い夢を描いた。`,
          reading: `Yama no itadaki ni noboru to, sumiwataru aozora kara yasashii kaze ga fukinuke, kawa no seseragi ga tooku ni hibiku.`,
          english: `At the mountain summit, a gentle breeze swept through the blue sky with distant river ripples, inspiring peaceful dreams.`,
        },
        {
          japanese: `雨上がりの朝、学び舎に向かう道には新しい希望が満ちている。友と語り合い、日々の小さな光を大切に心へと刻み込んだ。`,
          reading: `Ameagari no asa, manabiya ni mukau michi ni wa atarashii kibou ga michite iru. Hibi no chiisana hikari o kokoro e kizamikonda.`,
          english: `On a morning after rain, the path toward the school was filled with renewed hope, engraving rays of light into the heart.`,
        },
      ];

      const chosen = stories[Math.floor(Math.random() * stories.length)];
      setGeneratedStory(chosen);
      setIsGenerating(false);
    }, 500);
  };

  return (
    <div className="relative w-full h-full bg-black/20 backdrop-blur-[6px] border border-white/[0.06] hover:border-white/[0.1] hover:bg-black/25 rounded-2xl p-4 sm:p-5 flex flex-col justify-between shadow-xl transition-all overflow-hidden">
      {/* Background accent */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-pink-500/[0.02] rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-2.5 relative z-10 shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <span
              className="text-[11px] uppercase tracking-[0.2em] text-[#938c82]"
              style={{ fontFamily: "'Noto Serif JP', serif" }}
            >
              物語生成
            </span>
            <span className="text-[11px] text-neutral-600">/</span>
            <span className="text-xs font-light text-neutral-200">
              Story Generator ({selectedSlots.length}/8)
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => rollRandomKanji(5)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-white/[0.06] hover:border-white/[0.12] bg-white/[0.03] hover:bg-white/[0.06] text-[11.5px] text-neutral-300 hover:text-white transition-colors"
            title="Randomize slots"
          >
            <span>↻ Reroll</span>
          </button>

          <button
            onClick={() => setIsManualModalOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-white/[0.06] hover:border-white/[0.12] bg-white/[0.03] hover:bg-white/[0.06] text-[11.5px] text-neutral-300 hover:text-white transition-colors"
          >
            <span>+ Pick</span>
          </button>
        </div>
      </div>

      {/* Slots Strip (8 slots in 1 clean row or 2x4 on mobile) */}
      <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 my-1 shrink-0">
        {Array.from({ length: 8 }).map((_, idx) => {
          const item = selectedSlots[idx];
          if (item) {
            return (
              <div
                key={item.id}
                className="group relative flex flex-col items-center justify-center p-2 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-white/[0.14] shadow-sm transition-all h-[56px]"
              >
                <button
                  onClick={() => handleRemoveSlot(item.id)}
                  className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-neutral-800 hover:bg-red-900 text-neutral-400 hover:text-white flex items-center justify-center text-[9px] opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Remove"
                >
                  ×
                </button>
                <span
                  className="text-xl sm:text-2xl text-neutral-100 font-light leading-none"
                  style={{ fontFamily: "'Noto Serif JP', serif" }}
                >
                  {item.kanji}
                </span>
                <span className="text-[9px] text-neutral-400 truncate max-w-[46px] mt-0.5">
                  {item.meaning.split(' ')[0]}
                </span>
              </div>
            );
          }

          return (
            <button
              key={idx}
              onClick={() => setIsManualModalOpen(true)}
              className="flex flex-col items-center justify-center p-2 rounded-xl border border-dashed border-white/[0.06] hover:border-white/[0.12] bg-white/[0.015] hover:bg-white/[0.04] transition-colors text-neutral-600 hover:text-neutral-400 group h-[56px]"
            >
              <span className="text-sm font-light leading-none group-hover:scale-110 transition-transform">
                +
              </span>
              <span className="text-[8px] font-mono mt-0.5 uppercase tracking-wider">
                Slot {idx + 1}
              </span>
            </button>
          );
        })}
      </div>

      {/* Generated Story Display / Action Area */}
      <div className="flex-1 min-h-0 flex flex-col justify-end mt-2">
        {generatedStory ? (
          <div className="p-3 bg-white/[0.03] border border-white/[0.06] rounded-xl text-left animate-fadeIn">
            <div
              className="text-sm sm:text-[15px] text-[#f7f5f0] leading-snug font-light mb-1 line-clamp-2"
              style={{ fontFamily: "'Noto Serif JP', serif" }}
            >
              {generatedStory.japanese}
            </div>
            <div className="text-[11px] text-neutral-400 italic line-clamp-1">
              "{generatedStory.english}"
            </div>
          </div>
        ) : (
          <div className="p-2.5 bg-white/[0.015] border border-white/[0.04] rounded-xl text-center">
            <p className="text-[11px] text-neutral-500">
              Select or reroll kanji above, then click generate to craft a memorable Japanese mnemonic story.
            </p>
          </div>
        )}
      </div>

      {/* Footer action bar */}
      <div className="flex items-center justify-between gap-3 pt-2.5 border-t border-white/[0.06] mt-2 shrink-0">
        <div className="text-[11px] text-neutral-500 truncate max-w-[200px]">
          {selectedSlots.map((k) => k.kanji).join(' · ') || 'No kanji selected'}
        </div>

        <button
          onClick={handleGenerateStory}
          disabled={selectedSlots.length === 0 || isGenerating}
          className="px-4 py-1.5 rounded-full bg-neutral-100 hover:bg-white text-neutral-950 text-xs font-medium transition-all shadow-sm disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 shrink-0"
        >
          {isGenerating ? (
            <>
              <span className="w-3 h-3 border-2 border-neutral-950 border-t-transparent rounded-full animate-spin" />
              <span>Weaving...</span>
            </>
          ) : (
            <>
              <span>物語を生成 · Generate</span>
              <span>→</span>
            </>
          )}
        </button>
      </div>

      {/* Manual Picker Modal */}
      {isManualModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="absolute inset-0" onClick={() => setIsManualModalOpen(false)} />
          <div className="relative w-full max-w-xl bg-[#0e0e12] border border-neutral-800 rounded-2xl p-5 shadow-2xl z-10 text-neutral-200">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800 mb-3">
              <h4
                className="text-lg font-light text-neutral-100"
                style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
              >
                Select Learned Kanji for Story Slots ({selectedSlots.length}/8)
              </h4>
              <button
                onClick={() => setIsManualModalOpen(false)}
                className="text-neutral-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-72 overflow-y-auto pr-1">
              {learnedPool.map((k) => {
                const isAlreadySelected = selectedSlots.some((s) => s.id === k.id);
                return (
                  <button
                    key={k.id}
                    disabled={isAlreadySelected || selectedSlots.length >= 8}
                    onClick={() => handleAddKanji(k)}
                    className={`p-2.5 rounded-xl border text-center transition-all ${
                      isAlreadySelected
                        ? 'border-pink-900/60 bg-pink-950/20 text-pink-300 opacity-60'
                        : 'border-white/[0.06] bg-white/[0.03] hover:bg-white/[0.06] hover:border-white/[0.12] text-neutral-200'
                    }`}
                  >
                    <div
                      className="text-2xl font-light"
                      style={{ fontFamily: "'Noto Serif JP', serif" }}
                    >
                      {k.kanji}
                    </div>
                    <div className="text-[10px] text-neutral-400 truncate mt-0.5">
                      {k.meaning}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="mt-4 pt-3 border-t border-neutral-800 flex justify-end">
              <button
                onClick={() => setIsManualModalOpen(false)}
                className="px-4 py-1.5 rounded-full bg-neutral-200 hover:bg-white text-neutral-950 text-xs font-medium"
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
