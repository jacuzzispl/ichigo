import React, { useState, useEffect } from 'react';
import { StudiedKanjiItem, Story, StorySentence, Segment, Vocab } from '../../types';
import { getStudiedKanji, generateStory } from '../../api/story';
import { StoryGeneratorModal } from '../story/StoryGeneratorModal';
import { Sparkles, Maximize2, RotateCcw, Eye, EyeOff, BookOpen, ArrowRight } from 'lucide-react';

interface StoryGeneratorWidgetProps {
  onStoryGenerated?: (story: Story, targetKanji: string[], level: string) => void;
}

export const StoryGeneratorWidget: React.FC<StoryGeneratorWidgetProps> = ({
  onStoryGenerated,
}) => {
  const [studiedList, setStudiedList] = useState<StudiedKanjiItem[]>([]);
  const [loadingStudied, setLoadingStudied] = useState(false);
  const [selectedKanji, setSelectedKanji] = useState<string[]>([]);
  const [level, setLevel] = useState<string>('N5');
  const [numSentences, setNumSentences] = useState<number>(3);
  const [showOkurigana, setShowOkurigana] = useState<boolean>(true);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  // Generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedStory, setGeneratedStory] = useState<Story | null>(null);
  const [visibleGlosses, setVisibleGlosses] = useState<Record<number, boolean>>({});

  // Load studied kanji from GET /studied
  useEffect(() => {
    const fetchStudied = async () => {
      setLoadingStudied(true);
      try {
        const data = await getStudiedKanji();
        setStudiedList(data);
        if (data.length > 0) {
          // Default select up to 4 kanji from studied pool
          setSelectedKanji(data.slice(0, 4).map((k) => k.character));
        }
      } catch (err) {
        console.warn('Could not fetch studied kanji:', err);
      } finally {
        setLoadingStudied(false);
      }
    };

    fetchStudied();
  }, []);

  const rollRandomKanji = (count = 4) => {
    if (studiedList.length === 0) return;
    const shuffled = [...studiedList].sort(() => 0.5 - Math.random());
    setSelectedKanji(shuffled.slice(0, Math.min(count, studiedList.length)).map((k) => k.character));
  };

  const handleRemoveKanji = (char: string) => {
    setSelectedKanji((prev) => prev.filter((c) => c !== char));
  };

  const handleAddKanji = (char: string) => {
    if (selectedKanji.includes(char)) return;
    if (selectedKanji.length >= 8) return;
    setSelectedKanji((prev) => [...prev, char]);
  };

  const toggleGloss = (idx: number) => {
    setVisibleGlosses((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  // Generate story: calls POST /generate-story with payload: { kanji: list[str], num_sentences: int, level: str }
  // Then yields the dedicated full-screen story reader page!
  const handleGenerateStory = async () => {
    if (selectedKanji.length === 0) return;
    setIsGenerating(true);

    try {
      const result = await generateStory({
        kanji: selectedKanji,
        num_sentences: numSentences,
        level,
      });
      setGeneratedStory(result);

      // Once user clicks generate story, transition to the dedicated full-screen reader page
      if (onStoryGenerated) {
        onStoryGenerated(result, selectedKanji, level);
      }
    } catch (err) {
      console.error('Failed to generate story:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleOpenFullReader = () => {
    if (generatedStory && onStoryGenerated) {
      onStoryGenerated(generatedStory, selectedKanji, level);
    }
  };

  return (
    <div className="relative w-full h-full bg-black/20 backdrop-blur-[6px] border border-white/[0.06] hover:border-white/[0.1] hover:bg-black/25 rounded-2xl p-4 sm:p-5 flex flex-col justify-between shadow-xl transition-all overflow-hidden">
      {/* Background ambient accent */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-pink-500/[0.03] rounded-full blur-3xl pointer-events-none" />

      {/* Header Bar */}
      <div className="flex items-center justify-between gap-3 mb-2 relative z-10 shrink-0">
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
              Story Generator ({selectedKanji.length}/8)
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Quick Reroll */}
          <button
            type="button"
            onClick={() => rollRandomKanji(4)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-white/[0.06] hover:border-white/[0.12] bg-white/[0.03] hover:bg-white/[0.06] text-[11px] text-neutral-300 hover:text-white transition-colors"
            title="Pick random studied kanji"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reroll</span>
          </button>

          {/* Pick Kanji Modal Trigger */}
          <button
            type="button"
            onClick={() => setIsPickerOpen(true)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-white/[0.06] hover:border-white/[0.12] bg-white/[0.03] hover:bg-white/[0.06] text-[11px] text-neutral-300 hover:text-white transition-colors"
            title="Browse studied kanji pool (GET /studied)"
          >
            <span>+ Pick</span>
          </button>

          {/* Expand Full Studio Modal */}
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="p-1 rounded-lg border border-white/[0.06] hover:border-white/[0.12] bg-white/[0.03] hover:bg-white/[0.06] text-neutral-400 hover:text-white transition-colors"
            title="Configure in Story Studio"
            aria-label="Expand Story Studio"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Selected Kanji Slots (8 slots) */}
      <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 my-1 shrink-0">
        {Array.from({ length: 8 }).map((_, idx) => {
          const char = selectedKanji[idx];
          const info = studiedList.find((k) => k.character === char);

          if (char) {
            return (
              <div
                key={idx}
                className="group relative flex flex-col items-center justify-center p-1.5 rounded-xl bg-white/[0.03] border border-white/[0.08] hover:border-pink-500/30 shadow-sm transition-all h-[54px]"
              >
                <button
                  type="button"
                  onClick={() => handleRemoveKanji(char)}
                  className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-neutral-800 hover:bg-red-900 text-neutral-400 hover:text-white flex items-center justify-center text-[9px] opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Remove"
                >
                  ×
                </button>
                <span
                  className="text-xl sm:text-2xl text-neutral-100 font-light leading-none"
                  style={{ fontFamily: "'Noto Serif JP', serif" }}
                >
                  {char}
                </span>
                <span className="text-[9px] text-neutral-400 truncate max-w-[46px] mt-0.5">
                  {info?.meaning.split(',')[0] || 'Kanji'}
                </span>
              </div>
            );
          }

          return (
            <button
              key={idx}
              type="button"
              onClick={() => setIsPickerOpen(true)}
              className="flex flex-col items-center justify-center p-1.5 rounded-xl border border-dashed border-white/[0.06] hover:border-white/[0.14] bg-white/[0.015] hover:bg-white/[0.04] transition-colors text-neutral-600 hover:text-neutral-400 group h-[54px]"
              title="Add studied kanji"
            >
              <span className="text-sm font-light leading-none group-hover:scale-110 transition-transform">
                +
              </span>
              <span className="text-[8px] font-mono mt-0.5 uppercase tracking-wider text-neutral-600">
                Slot {idx + 1}
              </span>
            </button>
          );
        })}
      </div>

      {/* Controls Bar: Level (N5-N1), Sentence Count, & Okurigana Toggle */}
      <div className="flex items-center justify-between gap-2 py-1.5 px-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04] text-xs shrink-0">
        {/* JLPT Level Selector (N5 - N1) */}
        <div className="flex items-center gap-1">
          <span className="text-[10px] text-neutral-500 uppercase font-mono mr-1">Level:</span>
          {(['N5', 'N4', 'N3', 'N2', 'N1'] as const).map((lvl) => (
            <button
              key={lvl}
              type="button"
              onClick={() => setLevel(lvl)}
              className={`px-1.5 py-0.5 rounded text-[10px] font-mono transition-all ${
                level === lvl
                  ? 'bg-pink-950/60 border border-pink-700/60 text-pink-200 font-semibold'
                  : 'text-neutral-500 hover:text-neutral-300'
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>

        {/* Sentences Count (num_sentences) */}
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-neutral-500 font-mono">Sentences:</span>
          {[2, 3, 5].map((cnt) => (
            <button
              key={cnt}
              type="button"
              onClick={() => setNumSentences(cnt)}
              className={`w-5 h-5 rounded text-[10px] font-mono flex items-center justify-center transition-all ${
                numSentences === cnt
                  ? 'bg-pink-950/60 border border-pink-700/60 text-pink-200 font-semibold'
                  : 'text-neutral-500 hover:text-neutral-300'
              }`}
            >
              {cnt}
            </button>
          ))}
        </div>

        {/* Okurigana Display Option Toggle */}
        <button
          type="button"
          onClick={() => setShowOkurigana((prev) => !prev)}
          className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] transition-all border ${
            showOkurigana
              ? 'bg-pink-950/40 border-pink-800/50 text-pink-300'
              : 'border-transparent text-neutral-500 hover:text-neutral-300'
          }`}
          title="Toggle okurigana / reading above kanji"
        >
          {showOkurigana ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
          <span className="hidden sm:inline">Okurigana</span>
        </button>
      </div>

      {/* Generated Story Display / Preview Area */}
      <div className="flex-1 min-h-[90px] flex flex-col justify-center my-1 overflow-y-auto max-h-[140px] pr-1">
        {generatedStory ? (
          <div className="p-3 bg-white/[0.03] border border-white/[0.06] rounded-xl text-left animate-fadeIn space-y-2">
            <div className="flex items-center justify-between pb-1 border-b border-white/[0.05]">
              <div>
                <span
                  className="text-sm font-medium text-pink-300 block"
                  style={{ fontFamily: "'Noto Serif JP', serif" }}
                >
                  {generatedStory.title}
                </span>
                {generatedStory.title_english && (
                  <span className="text-[10px] text-neutral-400 italic">
                    {generatedStory.title_english}
                  </span>
                )}
              </div>

              {onStoryGenerated && (
                <button
                  type="button"
                  onClick={handleOpenFullReader}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-pink-950/50 hover:bg-pink-900 border border-pink-700/50 text-pink-200 text-[11px] transition-all"
                >
                  <span>Full Screen Reader</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              )}
            </div>

            <div className="space-y-2 text-xs sm:text-[13px] leading-relaxed text-[#f7f5f0]">
              {generatedStory.sentences.map((sentence, sIdx) => {
                const isGlossOpen = Boolean(visibleGlosses[sIdx]);

                return (
                  <div key={sIdx} className="space-y-1">
                    <div
                      className="flex flex-wrap items-baseline gap-y-2 leading-loose"
                      style={{ fontFamily: "'Noto Serif JP', serif" }}
                    >
                      {/* Actual Kanji is in segment.text, kana reading in segment.reading */}
                      {sentence.segments.map((token, tIdx) => {
                        const isTarget = selectedKanji.includes(token.text);
                        const hasReading = Boolean(token.reading);

                        if (hasReading) {
                          return (
                            <ruby
                              key={tIdx}
                              className={`inline-flex flex-col items-center mx-0.5 leading-none ${
                                isTarget ? 'text-pink-300 font-medium' : 'text-neutral-200'
                              }`}
                            >
                              {showOkurigana ? (
                                <rt className="text-[9px] text-pink-400 font-mono tracking-tighter select-none mb-0.5 leading-none">
                                  {token.reading}
                                </rt>
                              ) : (
                                <rt className="invisible h-0 text-[0px] leading-none">
                                  {token.reading}
                                </rt>
                              )}
                              <span>{token.text}</span>
                            </ruby>
                          );
                        }

                        return (
                          <span
                            key={tIdx}
                            className={isTarget ? 'text-pink-300 font-medium px-0.5' : 'text-neutral-200'}
                          >
                            {token.text}
                          </span>
                        );
                      })}

                      {/* Gloss Toggle Button */}
                      <button
                        type="button"
                        onClick={() => toggleGloss(sIdx)}
                        className="ml-2 text-[10px] text-purple-400/80 hover:text-purple-300 underline font-mono cursor-pointer"
                        title="Look up sentence meaning and vocabulary gloss"
                      >
                        {isGlossOpen ? 'Hide' : 'Gloss'}
                      </button>
                    </div>

                    {/* Gloss definition (shown only when clicked) */}
                    {isGlossOpen && (
                      <div className="p-2 rounded bg-black/40 border border-white/[0.06] text-[11px] text-neutral-300 animate-fadeIn space-y-1">
                        <div className="italic text-neutral-400">“{sentence.english}”</div>
                        {sentence.vocab && sentence.vocab.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-0.5">
                            {sentence.vocab.map((v: Vocab, vIdx: number) => (
                              <span
                                key={vIdx}
                                className="px-1.5 py-0.5 rounded bg-white/[0.04] text-[10px] text-neutral-300"
                              >
                                <strong className="font-serif">{v.word}</strong>: {v.meaning}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="p-3 bg-white/[0.015] border border-white/[0.04] rounded-xl text-center">
            <p className="text-[11px] text-neutral-500">
              Pick studied kanji from <span className="font-mono text-pink-400/80">GET /studied</span>, choose JLPT level & sentence count, then click generate to dispatch <span className="font-mono text-neutral-400">POST /generate-story</span>.
            </p>
          </div>
        )}
      </div>

      {/* Footer action bar */}
      <div className="flex items-center justify-between gap-3 pt-2 border-t border-white/[0.06] shrink-0">
        <div className="text-[11px] text-neutral-500 truncate max-w-[200px]">
          {selectedKanji.join(' · ') || 'No kanji selected'}
        </div>

        <button
          type="button"
          onClick={handleGenerateStory}
          disabled={selectedKanji.length === 0 || isGenerating}
          className="px-4 py-1.5 rounded-full bg-pink-900/70 hover:bg-pink-750 text-white text-xs font-medium transition-all shadow-sm disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 shrink-0"
        >
          {isGenerating ? (
            <>
              <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Generating...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5 text-pink-300" />
              <span>物語を生成 · Generate Story</span>
            </>
          )}
        </button>
      </div>

      {/* Studied Kanji Picker Modal */}
      {isPickerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="absolute inset-0" onClick={() => setIsPickerOpen(false)} />
          <div className="relative w-full max-w-xl bg-[#0e0e12] border border-neutral-800 rounded-2xl p-5 shadow-2xl z-10 text-neutral-200">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800 mb-3">
              <div>
                <span className="text-[10px] uppercase font-mono tracking-widest text-pink-400">
                  GET /studied
                </span>
                <h4
                  className="text-lg font-light text-neutral-100"
                  style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
                >
                  Select Studied Kanji ({selectedKanji.length}/8)
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setIsPickerOpen(false)}
                className="text-neutral-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {loadingStudied ? (
              <div className="py-8 text-center text-xs text-neutral-500">
                Loading studied kanji...
              </div>
            ) : studiedList.length === 0 ? (
              <div className="py-8 text-center text-xs text-neutral-500">
                No studied kanji found yet. Complete lessons or review sessions first!
              </div>
            ) : (
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 max-h-72 overflow-y-auto pr-1">
                {studiedList.map((k) => {
                  const isSelected = selectedKanji.includes(k.character);
                  return (
                    <button
                      key={k.id || k.character}
                      type="button"
                      disabled={isSelected || selectedKanji.length >= 8}
                      onClick={() => handleAddKanji(k.character)}
                      className={`p-2.5 rounded-xl border text-center transition-all ${
                        isSelected
                          ? 'border-pink-900/60 bg-pink-950/30 text-pink-300 opacity-60'
                          : 'border-white/[0.06] bg-white/[0.03] hover:bg-white/[0.06] hover:border-white/[0.12] text-neutral-200'
                      }`}
                    >
                      <div
                        className="text-2xl font-light"
                        style={{ fontFamily: "'Noto Serif JP', serif" }}
                      >
                        {k.character}
                      </div>
                      <div className="text-[10px] text-neutral-400 truncate mt-0.5">
                        {k.meaning}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            <div className="mt-4 pt-3 border-t border-neutral-800 flex justify-end">
              <button
                type="button"
                onClick={() => setIsPickerOpen(false)}
                className="px-4 py-1.5 rounded-full bg-neutral-200 hover:bg-white text-neutral-950 text-xs font-medium"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Full Story Studio Modal */}
      {isModalOpen && (
        <StoryGeneratorModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onStoryGenerated={(story, kanjiList, lvl) => {
            setIsModalOpen(false);
            if (onStoryGenerated) {
              onStoryGenerated(story, kanjiList, lvl);
            }
          }}
          initialSelectedKanji={selectedKanji}
          initialLevel={level}
          initialNumSentences={numSentences}
        />
      )}
    </div>
  );
};
