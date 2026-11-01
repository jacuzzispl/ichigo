import React from 'react';

export const ProgressSection: React.FC = () => {
  const stats = [
    { label: 'Current Streak', value: '14', unit: 'Days', sub: 'Personal best: 28 days' },
    { label: 'Kanji Mastered', value: '184', unit: '/ 2,136', sub: '8.6% of Joyo Kanji' },
    { label: 'Review Retention', value: '94.2%', unit: 'Accuracy', sub: 'Over last 300 reviews' },
    { label: 'Daily Goal', value: '10', unit: 'Kanji / day', sub: 'Target: JLPT N3 by Dec' },
  ];

  const levels = [
    { level: 'N5 Beginner', learned: 103, total: 103, percent: 100, status: 'Mastered' },
    { level: 'N4 Elementary', learned: 81, total: 181, percent: 45, status: 'In Progress' },
    { level: 'N3 Intermediate', learned: 0, total: 370, percent: 0, status: 'Upcoming' },
    { level: 'N2 Advanced', learned: 0, total: 368, percent: 0, status: 'Locked' },
    { level: 'N1 Master', learned: 0, total: 1114, percent: 0, status: 'Locked' },
  ];

  return (
    <section className="relative z-20 w-full min-h-screen bg-[#070707] py-24 px-8 md:px-14 lg:px-20 text-neutral-100 border-t border-neutral-900/60">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <div
            className="text-xs uppercase tracking-[0.25em] text-[#938c82] mb-3"
            style={{ fontFamily: "'Noto Serif JP', serif" }}
          >
            進捗状況 · Learning Analytics
          </div>
          <h2
            className="text-3xl md:text-5xl font-light text-[#fbfaf7] tracking-tight"
            style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
          >
            Your Journey to Fluency
          </h2>
          <p className="text-neutral-400 text-sm mt-2 max-w-lg">
            Consistent daily practice with spaced repetition anchors characters into long-term memory.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {stats.map((s, idx) => (
            <div
              key={idx}
              className="bg-[#0e0e11] border border-neutral-800/80 rounded-xl p-5"
            >
              <div className="text-xs text-neutral-500 uppercase tracking-wider mb-2 font-medium">
                {s.label}
              </div>
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-3xl font-light text-[#fbfaf7] font-mono">
                  {s.value}
                </span>
                <span className="text-xs text-neutral-400">{s.unit}</span>
              </div>
              <div className="text-xs text-neutral-500">{s.sub}</div>
            </div>
          ))}
        </div>

        {/* JLPT Progression Bars */}
        <div className="bg-[#0e0e11] border border-neutral-800/80 rounded-2xl p-6 md:p-8">
          <h3
            className="text-xl font-light text-neutral-200 mb-6"
            style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
          >
            JLPT Milestone Roadmap
          </h3>

          <div className="space-y-6">
            {levels.map((lvl, idx) => (
              <div key={idx} className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <span className="text-neutral-200 font-medium">{lvl.level}</span>
                    <span className="text-[11px] px-2 py-0.5 rounded bg-neutral-800 text-neutral-400 font-mono">
                      {lvl.status}
                    </span>
                  </div>
                  <span className="text-neutral-400 font-mono">
                    {lvl.learned} / {lvl.total} kanji ({lvl.percent}%)
                  </span>
                </div>

                <div className="w-full h-2 bg-neutral-900 rounded-full overflow-hidden border border-neutral-800/60">
                  <div
                    className="h-full bg-gradient-to-r from-neutral-400 to-pink-300 transition-all duration-500 rounded-full"
                    style={{ width: `${lvl.percent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
