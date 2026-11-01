import React from 'react';

interface HeroSectionProps {
  onGetStarted: () => void;
  onScrollDown: () => void;
  bgVariant?: 'classic' | 'painted';
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onGetStarted,
  onScrollDown,
  bgVariant = 'classic',
}) => {
  const bgImage =
    bgVariant === 'classic'
      ? '/src/assets/images/sakura_tree_branch_1790973318275.jpg'
      : '/src/assets/images/sakura_branch_painted_1790973331991.jpg';

  return (
    <section className="relative w-full min-h-screen flex items-center bg-[#070707] text-neutral-100 overflow-hidden select-none">
      {/* Background Cherry Blossom Tree Image */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        {/* The tree image positioned on the right half */}
        <div
          className="absolute top-0 right-0 w-full md:w-[75%] lg:w-[65%] xl:w-[60%] h-full bg-no-repeat bg-right-center bg-cover md:bg-contain transition-all duration-700 opacity-95"
          style={{
            backgroundImage: `url("${bgImage}")`,
            backgroundPosition: 'right 25%',
          }}
        />

        {/* Soft edge blend overlays to seamlessly fade pure black on left and top/bottom */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#070707] via-[#070707]/80 to-transparent w-full md:w-[60%]" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#070707] via-transparent to-[#070707]/50" />
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-[#070707] to-transparent opacity-70" />
      </div>

      {/* Main Content Container */}
      <div className="relative z-20 w-full max-w-7xl mx-auto px-8 md:px-14 lg:px-20 pt-16 md:pt-10">
        <div className="max-w-2xl flex flex-col items-start">
          {/* Japanese Kicker */}
          <div
            className="text-[13px] md:text-[14.5px] text-[#938c82] tracking-[0.28em] font-normal mb-6 md:mb-8"
            style={{ fontFamily: "'Noto Serif JP', serif" }}
          >
            日本語の漢字を学ぶ
          </div>

          {/* Main Headline */}
          <h1
            className="text-5xl sm:text-6xl md:text-7xl lg:text-[5.4rem] font-light text-[#fbfaf7] leading-[1.08] tracking-[-0.015em] mb-6 md:mb-8"
            style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
          >
            Learn Japanese<br />
            Kanji, your way.
          </h1>

          {/* Subtitle Body */}
          <p
            className="text-[15px] md:text-[16.5px] text-[#8e8d89] leading-[1.65] font-light max-w-[460px] mb-8 md:mb-10"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            Build your Japanese vocabulary, improve your reading and unlock a new world.
          </p>

          {/* Get Started Button */}
          <button
            onClick={onGetStarted}
            className="group relative inline-flex items-center gap-3.5 px-7 py-3 rounded-full border border-neutral-700/80 hover:border-neutral-300 text-[14px] md:text-[15px] text-neutral-200 hover:text-white transition-all duration-300 bg-transparent hover:bg-white/[0.04] focus:outline-none focus:ring-1 focus:ring-neutral-400"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            <span>Get Started</span>
            <svg
              className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </button>
        </div>
      </div>

      {/* Bottom Left Scroll Indicator */}
      <div className="absolute left-8 md:left-14 lg:left-20 bottom-10 z-20 flex items-center gap-3">
        <button
          onClick={onScrollDown}
          className="group flex items-center gap-3 text-neutral-500 hover:text-neutral-300 transition-colors focus:outline-none"
        >
          <span className="w-[1.2px] h-6 bg-neutral-700 group-hover:bg-neutral-400 transition-colors" />
          <span
            className="text-[11.5px] tracking-[0.16em] uppercase font-light text-neutral-400 group-hover:text-neutral-200 transition-colors"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            Scroll
          </span>
        </button>
      </div>

      {/* Subtle Zen Quote at bottom right on desktop */}
      <div className="hidden lg:block absolute right-14 lg:right-20 bottom-10 z-20 text-right">
        <p
          className="text-xs text-neutral-600 tracking-widest font-light"
          style={{ fontFamily: "'Noto Serif JP', serif" }}
        >
          一期一会 · One Time, One Meeting
        </p>
      </div>
    </section>
  );
};
