import React from 'react';

interface SessionActionCardsProps {
  onStartLessons: () => void;
  onStartReviews: () => void;
}

export const SessionActionCards: React.FC<SessionActionCardsProps> = ({
  onStartLessons,
  onStartReviews,
}) => {
  const upcomingLessons = [
    { char: '日', meaning: 'Day / Sun', type: 'Kanji' },
    { char: '月', meaning: 'Moon / Month', type: 'Kanji' },
    { char: '木', meaning: 'Tree / Wood', type: 'Kanji' },
    { char: '水', meaning: 'Water', type: 'Kanji' },
    { char: '火', meaning: 'Fire', type: 'Radical' },
  ];

  const srsStages = [
    { name: 'Apprentice', count: 48, color: 'text-pink-300 bg-pink-950/20 border-pink-900/40' },
    { name: 'Guru', count: 76, color: 'text-purple-300 bg-purple-950/20 border-purple-900/40' },
    { name: 'Master', count: 42, color: 'text-blue-300 bg-blue-950/20 border-blue-900/40' },
    { name: 'Enlightened', count: 18, color: 'text-cyan-300 bg-cyan-950/20 border-cyan-900/40' },
    { name: 'Burned', count: 86, color: 'text-amber-300 bg-amber-950/20 border-amber-900/40' },
  ];

  return (
    <div className="w-full h-full flex flex-col justify-between gap-3">
      {/* 2 Session Action Cards with Lower Opacity Translucent Glass */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1 min-h-0">
        {/* Learn Session Card */}
        <div className="relative group bg-black/20 backdrop-blur-[6px] border border-white/[0.06] hover:border-pink-900/40 hover:bg-black/25 rounded-2xl p-4 flex flex-col justify-between shadow-xl transition-all">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] uppercase tracking-[0.2em] text-[#938c82]">
                新着学習 · Lessons
              </span>
              <span className="px-2 py-0.5 rounded-full bg-pink-950/30 border border-pink-900/40 text-pink-300 text-[10px] font-mono">
                5 Ready
              </span>
            </div>

            <h3
              className="text-xl font-light text-neutral-100 tracking-tight mb-1"
              style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
            >
              Learn Session
            </h3>

            <p className="text-[11px] text-neutral-400 line-clamp-2 mb-3">
              Learn upcoming radicals and kanji with stroke order and mnemonics.
            </p>

            {/* Upcoming Queue Preview */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 mb-2">
              {upcomingLessons.map((item, idx) => (
                <div
                  key={idx}
                  className="flex-shrink-0 px-2 py-1 rounded-lg bg-white/[0.03] border border-white/[0.05] text-center"
                >
                  <span
                    className="text-sm text-neutral-100 block"
                    style={{ fontFamily: "'Noto Serif JP', serif" }}
                  >
                    {item.char}
                  </span>
                  <span className="text-[8px] text-neutral-500 uppercase block font-mono">
                    {item.meaning.split(' ')[0]}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={onStartLessons}
            className="w-full py-2 rounded-full bg-pink-900/60 hover:bg-pink-800 text-pink-50 font-medium text-xs tracking-wide transition-all shadow-md flex items-center justify-center gap-1.5 mt-2"
          >
            <span>Start Lessons</span>
            <span>→</span>
          </button>
        </div>

        {/* Review Session Card */}
        <div className="relative group bg-black/20 backdrop-blur-[6px] border border-white/[0.06] hover:border-purple-900/40 hover:bg-black/25 rounded-2xl p-4 flex flex-col justify-between shadow-xl transition-all">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] uppercase tracking-[0.2em] text-[#938c82]">
                復習 · SRS Reviews
              </span>
              <span className="px-2 py-0.5 rounded-full bg-purple-950/30 border border-purple-900/40 text-purple-300 text-[10px] font-mono">
                18 Due
              </span>
            </div>

            <h3
              className="text-xl font-light text-neutral-100 tracking-tight mb-1"
              style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
            >
              Review Session
            </h3>

            <p className="text-[11px] text-neutral-400 line-clamp-2 mb-3">
              Reinforce memory via spaced intervals to advance items to Guru and Burned.
            </p>

            {/* Schedule Intervals */}
            <div className="grid grid-cols-3 gap-1.5 text-center text-[10px] mb-2">
              <div className="p-1.5 rounded-lg bg-white/[0.03] border border-white/[0.05]">
                <div className="font-mono text-neutral-200">+6 items</div>
                <div className="text-[9px] text-neutral-500">In 1h</div>
              </div>
              <div className="p-1.5 rounded-lg bg-white/[0.03] border border-white/[0.05]">
                <div className="font-mono text-neutral-200">+12 items</div>
                <div className="text-[9px] text-neutral-500">In 4h</div>
              </div>
              <div className="p-1.5 rounded-lg bg-white/[0.03] border border-white/[0.05]">
                <div className="font-mono text-neutral-200">+24 items</div>
                <div className="text-[9px] text-neutral-500">Tmrw</div>
              </div>
            </div>
          </div>

          <button
            onClick={onStartReviews}
            className="w-full py-2 rounded-full bg-purple-900/60 hover:bg-purple-800 text-purple-50 font-medium text-xs tracking-wide transition-all shadow-md flex items-center justify-center gap-1.5 mt-2"
          >
            <span>Start Reviews</span>
            <span>→</span>
          </button>
        </div>
      </div>

      {/* SRS Stages Breakdown Strip */}
      <div className="bg-black/20 backdrop-blur-[6px] border border-white/[0.06] rounded-2xl p-3 shadow-md shrink-0">
        <div className="flex items-center justify-between text-[10px] text-neutral-400 mb-2">
          <span>SRS Stages Breakdown</span>
          <span className="font-mono text-neutral-500">270 Total Tracked</span>
        </div>

        <div className="grid grid-cols-5 gap-1.5 text-center">
          {srsStages.map((stage, idx) => (
            <div
              key={idx}
              className={`p-1.5 rounded-lg border ${stage.color} flex flex-col justify-center`}
            >
              <div className="text-[9px] opacity-80 leading-none truncate">{stage.name}</div>
              <div className="text-sm font-mono font-medium mt-0.5">{stage.count}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
