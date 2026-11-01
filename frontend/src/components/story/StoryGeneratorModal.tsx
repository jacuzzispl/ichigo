import React, { useState, useEffect } from 'react';
import { StudiedKanjiItem, StoryGenerateResponse } from '../../types';
import { getStudiedKanji, generateStory } from '../../api/story';
import { StoryReader } from "./StoryReader"
import { Sparkles, Sliders, X, Search, RotateCcw, AlertCircle } from 'lucide-react';

interface StoryGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialSelectedKanji?: string[];
  initialLevel?: string;
  initialNumSentences?: number;
}

export const StoryGeneratorModal: React.FC<StoryGeneratorModalProps> = ({
  isOpen,
  onClose,
  initialSelectedKanji = [],
  initialLevel = 'N5',
  initialNumSentences = 3,
}) => {
  const [studiedList, setStudiedList] = useState<StudiedKanjiItem[]>([]);
  const [loadingStudied, setLoadingStudied] = useState(false);
  const [studiedError, setStudiedError] = useState<string | null>(null);

  // Form parameters: kanji: list[str], num_sentences: int, level: str
  const [selectedKanji, setSelectedKanji] = useState<string[]>(initialSelectedKanji);
  const [level, setLevel] = useState<string>(initialLevel);
  const [numSentences, setNumSentences] = useState<number>(initialNumSentences);
  const [searchQuery, setSearchQuery] = useState('');

  // Generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [generatedStory, setGeneratedStory] = useState<StoryGenerateResponse | null>(null);

  // Fetch studied kanji on modal open
  useEffect(() => {
    if (!isOpen) return;

    const loadStudied = async () => {
      setLoadingStudied(true);
      setStudiedError(null);
      try {
        const data = await getStudiedKanji();
        setStudiedList(data);
        if (selectedKanji.length === 0 && data.length > 0) {
          // Default select up to first 3 kanji
          setSelectedKanji(data.slice(0, 3).map((k) => k.character));
        }
      } catch (err: any) {
        setStudiedError(err.message || 'Failed to load studied kanji from GET /studied.');
      } finally {
        setLoadingStudied(false);
      }
    };

    loadStudied();
  }, [isOpen]);

  if (!isOpen) return null;

  const jlptLevels = [
    { id: 'N5', label: 'N5 · Beginner' },
    { id: 'N4', label: 'N4 · Elementary' },
    { id: 'N3', label: 'N3 · Intermediate' },
    { id: 'N2', label: 'N2 · Pre-Advanced' },
    { id: 'N1', label: 'N1 · Advanced' },
  ];

  const handleToggleKanji = (char: string) => {
    setSelectedKanji((prev) =>
      prev.includes(char) ? prev.filter((c) => c !== char) : [...prev, char]
    );
  };

  const handleSelectAll = () => {
    setSelectedKanji(studiedList.map((k) => k.character));
  };

  const handleClearAll = () => {
    setSelectedKanji([]);
  };

  const handlePickRandom = (count: number) => {
    const shuffled = [...studiedList].sort(() => 0.5 - Math.random());
    setSelectedKanji(shuffled.slice(0, count).map((k) => k.character));
  };

  const handleGenerate = async () => {
    if (selectedKanji.length === 0) {
      setGenerateError('Please select at least 1 studied kanji.');
      return;
    }

    setIsGenerating(true);
    setGenerateError(null);

    try {
      // POST /generate-story with payload: { kanji: list[str], num_sentences: int, level: str }
      const res = await generateStory({
        kanji: selectedKanji,
        num_sentences: numSentences,
        level,
      });
      setGeneratedStory(res);
    } catch (err: any) {
      setGenerateError(err.message || 'Error generating story from POST /generate-story.');
    } finally {
      setIsGenerating(false);
    }
  };

  const filteredStudied = studiedList.filter((k) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      k.character.includes(q) ||
      k.meaning.toLowerCase().includes(q)
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative w-full max-w-4xl bg-[#09090d] border border-white/[0.12] rounded-3xl p-5 sm:p-7 shadow-2xl z-10 text-neutral-200 flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.08] shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span
                className="text-[11px] uppercase tracking-[0.2em] text-pink-400 font-mono"
                style={{ fontFamily: "'Noto Serif JP', serif" }}
              >
                物語生成スタジオ
              </span>
              <span className="text-neutral-600">/</span>
              <span className="text-xs text-neutral-400">Story Generator</span>
            </div>
            <h2
              className="text-2xl sm:text-3xl font-light text-white tracking-tight mt-0.5"
              style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
            >
              Custom Japanese Story Generator
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/[0.04] hover:bg-white/[0.1] border border-white/[0.08] text-neutral-400 hover:text-white flex items-center justify-center text-sm transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 min-h-0 overflow-y-auto py-4 space-y-6 pr-1">
          {/* If story is generated, show the reader prominently with option to tweak parameters */}
          {generatedStory ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-neutral-400 font-mono">
                  Generated with {generatedStory.kanji?.length || selectedKanji.length} studied kanji at {level} level
                </span>
                <button
                  type="button"
                  onClick={() => setGeneratedStory(null)}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.1] text-xs text-neutral-200 transition-colors"
                >
                  <Sliders className="w-3.5 h-3.5 text-pink-400" />
                  <span>Adjust Parameters</span>
                </button>
              </div>

              <StoryReader
                story={generatedStory}
                highlightKanji={selectedKanji}
                initialShowOkurigana={true}
              />

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="flex items-center gap-2 px-5 py-2 rounded-full bg-pink-900/60 hover:bg-pink-800 text-pink-100 text-xs font-medium transition-all shadow-md"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reroll Story</span>
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2 rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-neutral-200 text-xs font-medium transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Parameter 1: Select Studied Kanji (GET /studied) */}
              <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-4 sm:p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                  <div>
                    <label className="text-xs font-medium text-neutral-200 flex items-center gap-2">
                      <span>1. Select Studied Kanji</span>
                      <span className="px-2 py-0.5 rounded-full bg-pink-950/40 border border-pink-900/40 text-[10px] font-mono text-pink-300">
                        GET /studied
                      </span>
                    </label>
                    <p className="text-[11px] text-neutral-400 mt-0.5">
                      Pick kanji from your studied collection to weave into the story ({selectedKanji.length} selected).
                    </p>
                  </div>

                  {/* Quick Select Actions */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <button
                      type="button"
                      onClick={() => handlePickRandom(3)}
                      className="px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-[11px] text-neutral-300 transition-colors"
                    >
                      Pick 3
                    </button>
                    <button
                      type="button"
                      onClick={() => handlePickRandom(5)}
                      className="px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-[11px] text-neutral-300 transition-colors"
                    >
                      Pick 5
                    </button>
                    <button
                      type="button"
                      onClick={handleSelectAll}
                      className="px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-[11px] text-neutral-300 transition-colors"
                    >
                      All
                    </button>
                    <button
                      type="button"
                      onClick={handleClearAll}
                      className="px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-[11px] text-neutral-400 hover:text-neutral-200 transition-colors"
                    >
                      Clear
                    </button>
                  </div>
                </div>

                {/* Search bar */}
                <div className="relative mb-3">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-neutral-500" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search studied kanji by character or English meaning..."
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs text-neutral-200 placeholder:text-neutral-600 focus:outline-none focus:border-pink-500/50"
                  />
                </div>

                {/* Studied Kanji Grid */}
                {loadingStudied ? (
                  <div className="flex items-center justify-center py-8 text-neutral-500 text-xs">
                    <span className="w-4 h-4 border-2 border-pink-400 border-t-transparent rounded-full animate-spin mr-2" />
                    Fetching studied kanji from GET /studied...
                  </div>
                ) : studiedError ? (
                  <div className="p-3 rounded-xl bg-red-950/20 border border-red-900/40 text-red-300 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{studiedError}</span>
                  </div>
                ) : filteredStudied.length === 0 ? (
                  <div className="text-center py-6 text-neutral-500 text-xs">
                    No kanji found matching "{searchQuery}".
                  </div>
                ) : (
                  <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2 max-h-48 overflow-y-auto pr-1">
                    {filteredStudied.map((item) => {
                      const isSelected = selectedKanji.includes(item.character);
                      return (
                        <button
                          key={item.id || item.character}
                          type="button"
                          onClick={() => handleToggleKanji(item.character)}
                          className={`p-2 rounded-xl border flex flex-col items-center justify-center transition-all ${
                            isSelected
                              ? 'bg-pink-950/40 border-pink-700/60 text-pink-200 shadow-sm scale-[1.02]'
                              : 'bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.06] hover:border-white/[0.12] text-neutral-300'
                          }`}
                        >
                          <span
                            className="text-xl sm:text-2xl font-light"
                            style={{ fontFamily: "'Noto Serif JP', serif" }}
                          >
                            {item.character}
                          </span>
                          <span className="text-[9px] text-neutral-400 truncate max-w-[50px] mt-0.5">
                            {item.meaning.split(',')[0]}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Parameter 2 & 3: Level (N5 - N1) and Number of Sentences (num_sentences: int) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Level Selection (N5 - N1) */}
                <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-4 sm:p-5">
                  <label className="text-xs font-medium text-neutral-200 flex items-center justify-between mb-1">
                    <span>2. JLPT Target Level</span>
                    <span className="text-[10px] font-mono text-pink-300">level: "{level}"</span>
                  </label>
                  <p className="text-[11px] text-neutral-400 mb-3">
                    Controls vocabulary complexity, grammar constructs, and sentence length.
                  </p>

                  <div className="grid grid-cols-5 gap-1.5">
                    {jlptLevels.map((l) => (
                      <button
                        key={l.id}
                        type="button"
                        onClick={() => setLevel(l.id)}
                        className={`py-2 px-1 rounded-xl text-center border transition-all ${
                          level === l.id
                            ? 'bg-pink-950/50 border-pink-600 text-pink-100 font-medium shadow-sm'
                            : 'bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.06] text-neutral-400 hover:text-neutral-200'
                        }`}
                      >
                        <div className="text-xs font-mono font-bold">{l.id}</div>
                        <div className="text-[8px] uppercase tracking-tight text-neutral-400 truncate mt-0.5">
                          {l.label.split('·')[1]}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Number of Sentences (num_sentences) */}
                <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-4 sm:p-5">
                  <label className="text-xs font-medium text-neutral-200 flex items-center justify-between mb-1">
                    <span>3. Sentence Count</span>
                    <span className="text-[10px] font-mono text-pink-300">
                      num_sentences: {numSentences}
                    </span>
                  </label>
                  <p className="text-[11px] text-neutral-400 mb-3">
                    Choose how many sentences to weave into the story (1 to 10).
                  </p>

                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min={1}
                      max={8}
                      value={numSentences}
                      onChange={(e) => setNumSentences(Number(e.target.value))}
                      className="flex-1 accent-pink-500 bg-neutral-800 h-1.5 rounded-lg cursor-pointer"
                    />
                    <div className="flex items-center gap-1">
                      {[1, 3, 5, 8].map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => setNumSentences(preset)}
                          className={`w-7 h-7 rounded-lg text-xs font-mono border transition-all ${
                            numSentences === preset
                              ? 'bg-pink-950/50 border-pink-600 text-pink-200'
                              : 'bg-white/[0.03] border-white/[0.06] text-neutral-400 hover:text-white'
                          }`}
                        >
                          {preset}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Request Payload Preview */}
              <div className="p-3 rounded-xl bg-black/40 border border-white/[0.04] text-[11px] font-mono text-neutral-400 flex items-center justify-between">
                <div>
                  <span className="text-neutral-500">POST /generate-story: </span>
                  <span className="text-neutral-300">
                    {`{ kanji: [${selectedKanji.map((k) => `"${k}"`).join(', ')}], num_sentences: ${numSentences}, level: "${level}" }`}
                  </span>
                </div>
              </div>

              {generateError && (
                <div className="p-3 rounded-xl bg-red-950/20 border border-red-900/40 text-red-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{generateError}</span>
                </div>
              )}
            </>
          )}
        </div>

        {/* Modal Footer */}
        {!generatedStory && (
          <div className="pt-4 border-t border-white/[0.08] flex items-center justify-between gap-3 shrink-0">
            <div className="text-xs text-neutral-500">
              {selectedKanji.length === 0 ? (
                <span className="text-amber-400/80">Select at least 1 studied kanji to generate</span>
              ) : (
                <span>Ready to generate with {selectedKanji.length} kanji</span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-full bg-white/[0.05] hover:bg-white/[0.1] text-neutral-300 text-xs font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleGenerate}
                disabled={selectedKanji.length === 0 || isGenerating}
                className="px-6 py-2 rounded-full bg-pink-900/80 hover:bg-pink-700 text-pink-50 text-xs font-medium transition-all shadow-md disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Generating Story...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-pink-300" />
                    <span>Generate Story (POST /generate-story)</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
