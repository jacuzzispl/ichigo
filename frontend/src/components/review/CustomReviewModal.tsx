import React, { useState, useEffect } from 'react';
import { LessonKanji } from '../../types';
import { getStudiedReviews } from '../../api/reviews';

interface CustomReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartCustomReview: (selectedKanji: LessonKanji[]) => void;
}

export const CustomReviewModal: React.FC<CustomReviewModalProps> = ({
  isOpen,
  onClose,
  onStartCustomReview,
}) => {
  const [studiedList, setStudiedList] = useState<LessonKanji[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!isOpen) return;

    const fetchStudied = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getStudiedReviews();
        setStudiedList(data);
        // By default select all if first load
        setSelectedIds(new Set(data.map((k) => k.id)));
      } catch (err: any) {
        setError(err.message || 'Failed to load studied kanji.');
      } finally {
        setLoading(false);
      }
    };

    fetchStudied();
  }, [isOpen]);

  if (!isOpen) return null;

  const filtered = studiedList.filter((k) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const charMatch = k.character.includes(q);
    const meanMatch = k.meanings.some((m) => m.toLowerCase().includes(q)) || (k.meaning || '').toLowerCase().includes(q);
    return charMatch || meanMatch;
  });

  const toggleKanji = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const selectAll = () => {
    setSelectedIds(new Set(studiedList.map((k) => k.id)));
  };

  const deselectAll = () => {
    setSelectedIds(new Set());
  };

  const handleStart = () => {
    const chosen = studiedList.filter((k) => selectedIds.has(k.id));
    if (chosen.length === 0) return;
    onStartCustomReview(chosen);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative w-full max-w-2xl bg-[#0c0c10] border border-white/[0.12] rounded-3xl p-6 shadow-2xl z-10 text-neutral-200 flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.08] shrink-0">
          <div>
            <span className="text-[10px] uppercase font-mono tracking-[0.2em] text-purple-400">
              Self-Made Review
            </span>
            <h3
              className="text-2xl font-light text-white tracking-tight mt-0.5"
              style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
            >
              Select Studied Kanji
            </h3>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/[0.04] hover:bg-white/[0.1] border border-white/[0.06] flex items-center justify-center text-neutral-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Search & Bulk Selection Toolbar */}
        <div className="py-4 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Search by character or meaning..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/[0.04] border border-white/[0.1] rounded-xl px-3 py-2 text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-purple-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-neutral-500 hover:text-white"
              >
                ✕
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end text-xs">
            <button
              type="button"
              onClick={selectAll}
              className="px-2.5 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] text-neutral-300 font-mono text-[11px] transition-colors"
            >
              Select All
            </button>
            <button
              type="button"
              onClick={deselectAll}
              className="px-2.5 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] text-neutral-400 font-mono text-[11px] transition-colors"
            >
              Deselect All
            </button>
            <span className="text-[11px] font-mono text-purple-300 px-2">
              {selectedIds.size} of {studiedList.length} selected
            </span>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto pr-1 min-h-[220px]">
          {loading && (
            <div className="py-16 text-center text-xs text-neutral-400 animate-fadeIn space-y-3">
              <div className="w-7 h-7 border-2 border-purple-400 border-t-transparent rounded-full animate-spin mx-auto" />
              <p>Fetching all studied kanji from `/reviews/studied`...</p>
            </div>
          )}

          {!loading && error && (
            <div className="py-12 px-4 text-center rounded-2xl bg-red-950/20 border border-red-900/40 text-red-200 text-xs space-y-3">
              <p>{error}</p>
              <button
                onClick={() => {
                  setError(null);
                  getStudiedReviews().then((d) => {
                    setStudiedList(d);
                    setSelectedIds(new Set(d.map((k) => k.id)));
                  });
                }}
                className="px-4 py-1.5 rounded-full bg-red-900/60 hover:bg-red-800 text-white text-xs font-medium"
              >
                Retry ↻
              </button>
            </div>
          )}

          {!loading && !error && filtered.length === 0 && (
            <div className="py-16 text-center text-xs text-neutral-500">
              No studied kanji match your search.
            </div>
          )}

          {!loading && !error && filtered.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-2.5">
              {filtered.map((kanji) => {
                const isSelected = selectedIds.has(kanji.id);
                return (
                  <button
                    key={kanji.id}
                    type="button"
                    onClick={() => toggleKanji(kanji.id)}
                    className={`relative p-3 rounded-2xl border transition-all text-left flex flex-col items-center justify-between group ${
                      isSelected
                        ? 'bg-purple-950/30 border-purple-500/70 text-white ring-1 ring-purple-500/30'
                        : 'bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.05] text-neutral-400'
                    }`}
                  >
                    {/* Checkbox badge */}
                    <div
                      className={`absolute top-2 right-2 w-4 h-4 rounded-full border flex items-center justify-center text-[9px] font-bold ${
                        isSelected
                          ? 'bg-purple-500 border-purple-400 text-white'
                          : 'border-white/[0.15] text-transparent'
                      }`}
                    >
                      ✓
                    </div>

                    {/* Character */}
                    <span
                      className="text-4xl font-light my-2 leading-none"
                      style={{ fontFamily: "'Noto Serif JP', serif" }}
                    >
                      {kanji.character}
                    </span>

                    {/* Meaning */}
                    <span className="text-[11px] font-medium text-center truncate w-full text-neutral-300">
                      {kanji.meanings[0] || kanji.meaning}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="pt-4 mt-2 border-t border-white/[0.08] flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-full border border-white/[0.1] text-xs text-neutral-400 hover:text-white transition-colors"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={selectedIds.size === 0}
            onClick={handleStart}
            className={`px-6 py-2.5 rounded-full font-medium text-xs tracking-wider transition-all shadow-lg flex items-center gap-2 ${
              selectedIds.size > 0
                ? 'bg-purple-600 hover:bg-purple-500 text-white cursor-pointer'
                : 'bg-neutral-800 text-neutral-500 border border-white/[0.05] cursor-not-allowed'
            }`}
          >
            <span>Start Custom Review ({selectedIds.size})</span>
            <span>→</span>
          </button>
        </div>
      </div>
    </div>
  );
};
