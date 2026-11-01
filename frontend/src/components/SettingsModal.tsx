import React from 'react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  petalDensity: 'off' | 'subtle' | 'breeze' | 'blizzard';
  onSetPetalDensity: (val: 'off' | 'subtle' | 'breeze' | 'blizzard') => void;
  bgVariant: 'classic' | 'painted';
  onSetBgVariant: (val: 'classic' | 'painted') => void;
  readingPreference: 'kanji-only' | 'furigana' | 'romaji';
  onSetReadingPreference: (val: 'kanji-only' | 'furigana' | 'romaji') => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  petalDensity,
  onSetPetalDensity,
  bgVariant,
  onSetBgVariant,
  readingPreference,
  onSetReadingPreference,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative w-full max-w-lg bg-[#0e0e11] border border-neutral-800 rounded-2xl p-6 md:p-8 shadow-2xl z-10 text-neutral-200">
        <div className="flex items-center justify-between pb-4 border-b border-neutral-800 mb-6">
          <h2
            className="text-2xl font-light text-neutral-100"
            style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
          >
            Study & Aesthetic Settings
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800/60"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <line x1="18" y1="6" x2="6" y2="18" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="6" y1="6" x2="18" y2="18" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="space-y-6">
          {/* Background Tree Style */}
          <div>
            <label className="text-xs uppercase tracking-wider text-neutral-400 font-medium block mb-2">
              Background Sakura Tree Artwork
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => onSetBgVariant('classic')}
                className={`p-3 rounded-xl border text-left text-xs transition-all ${
                  bgVariant === 'classic'
                    ? 'border-neutral-400 bg-neutral-800/80 text-white'
                    : 'border-neutral-800 bg-neutral-900/50 text-neutral-400 hover:border-neutral-700'
                }`}
              >
                <div className="font-medium text-neutral-200">Classic Nihonga</div>
                <div className="text-[11px] text-neutral-500 mt-0.5">Original delicate branch</div>
              </button>

              <button
                onClick={() => onSetBgVariant('painted')}
                className={`p-3 rounded-xl border text-left text-xs transition-all ${
                  bgVariant === 'painted'
                    ? 'border-neutral-400 bg-neutral-800/80 text-white'
                    : 'border-neutral-800 bg-neutral-900/50 text-neutral-400 hover:border-neutral-700'
                }`}
              >
                <div className="font-medium text-neutral-200">Painted Sumi-e</div>
                <div className="text-[11px] text-neutral-500 mt-0.5">Artistic atmospheric ink</div>
              </button>
            </div>
          </div>

          {/* Falling Petals Animation */}
          <div>
            <label className="text-xs uppercase tracking-wider text-neutral-400 font-medium block mb-2">
              Falling Sakura Blossom Breeze
            </label>
            <div className="grid grid-cols-4 gap-2 text-xs">
              {(['off', 'subtle', 'breeze', 'blizzard'] as const).map((density) => (
                <button
                  key={density}
                  onClick={() => onSetPetalDensity(density)}
                  className={`py-2 px-1 rounded-lg border text-center capitalize transition-all ${
                    petalDensity === density
                      ? 'border-neutral-400 bg-neutral-800 text-white font-medium'
                      : 'border-neutral-800 bg-neutral-900/50 text-neutral-400 hover:border-neutral-700'
                  }`}
                >
                  {density}
                </button>
              ))}
            </div>
          </div>

          {/* Reading Display Preference */}
          <div>
            <label className="text-xs uppercase tracking-wider text-neutral-400 font-medium block mb-2">
              Character Reading Assistance
            </label>
            <div className="grid grid-cols-3 gap-2 text-xs">
              {(
                [
                  { id: 'furigana', label: 'Furigana (Kana)' },
                  { id: 'romaji', label: 'Romaji (Latin)' },
                  { id: 'kanji-only', label: 'Kanji Only' },
                ] as const
              ).map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => onSetReadingPreference(opt.id)}
                  className={`py-2.5 px-2 rounded-lg border text-center transition-all ${
                    readingPreference === opt.id
                      ? 'border-neutral-400 bg-neutral-800 text-white font-medium'
                      : 'border-neutral-800 bg-neutral-900/50 text-neutral-400 hover:border-neutral-700'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 pt-4 border-t border-neutral-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs rounded-full bg-neutral-200 hover:bg-white text-neutral-900 font-medium transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
