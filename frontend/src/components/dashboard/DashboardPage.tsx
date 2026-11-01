import React, { useState } from 'react';
import { UserProfile, KanjiItem } from '../../types';
import { UserProfileWidget } from './UserProfileWidget';
import { SessionActionCards } from './SessionActionCards';
import { StoryGeneratorWidget } from './StoryGeneratorWidget';
import { CurriculumCarousel3D } from './CurriculumCarousel3D';
import { CustomReviewModal } from '../review/CustomReviewModal';

interface DashboardPageProps {
  user: UserProfile | null;
  onBackToHome: () => void;
  onOpenProfile: () => void;
  onSelectKanji: (kanji: KanjiItem) => void;
  onStartLessons: () => void;
  onStartReviews: () => void;
  onStartCustomReview: (selectedKanji: any[]) => void;
  onOpenStoryReader?: (story: any, targetKanji: string[], level: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  user,
  onBackToHome,
  onOpenProfile,
  onSelectKanji,
  onStartLessons,
  onStartReviews,
  onStartCustomReview,
  onOpenStoryReader,
}) => {
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);

  const outlineBgImage = '/src/assets/images/sakura_outline_topright_1791579194144.jpg';

  return (
    <div className="relative w-full min-h-screen xl:h-screen xl:max-h-screen xl:overflow-hidden flex flex-col bg-[#050507] text-neutral-100 select-none overflow-y-auto">
      {/* Background Faint Outline Sakura Tree (High visibility, cascading from top-right) */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Outline tree image anchored to the top-right */}
        <div
          className="absolute top-0 right-0 w-full sm:w-[95%] md:w-[88%] lg:w-[80%] xl:w-[75%] h-full bg-no-repeat bg-right-top bg-contain opacity-85 pointer-events-none mix-blend-screen"
          style={{
            backgroundImage: `url("${outlineBgImage}")`,
            backgroundPosition: 'top right',
          }}
        />

        {/* Minimal atmospheric gradient to preserve contrast on far left without blocking the tree */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#050507]/90 via-[#050507]/45 to-transparent w-full md:w-[45%]" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#050507]/40 via-transparent to-[#050507]/50 pointer-events-none" />
      </div>

      {/* Top Navigation for Dashboard (Compact & Ultra-Translucent) */}
      <header className="shrink-0 z-40 w-full bg-[#050507]/60 backdrop-blur-md border-b border-white/[0.06] px-4 sm:px-6 lg:px-8 py-2.5 sm:py-3 flex items-center justify-between">
        <div className="flex items-center gap-4 sm:gap-6">
          {/* Logo & View Title */}
          <button
            onClick={onBackToHome}
            className="flex items-center gap-2 text-xl font-light text-neutral-100 hover:text-white transition-colors focus:outline-none"
            style={{ fontFamily: "'Noto Serif JP', serif" }}
            title="Return to Home"
          >
            <span>桜</span>
            <span
              className="text-sm font-normal tracking-wide text-neutral-400 hidden sm:inline"
              style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
            >
              Command Dashboard
            </span>
          </button>

          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 text-xs">
            <button
              onClick={onBackToHome}
              className="text-neutral-500 hover:text-neutral-300 transition-colors"
            >
              ← Home Page
            </button>
            <span className="text-neutral-700">/</span>
            <span className="text-neutral-300 font-medium">Study Central</span>
          </nav>
        </div>

        {/* Right side user status & quick counters */}
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 text-xs">
            <span className="px-2.5 py-0.5 rounded-full bg-pink-950/30 border border-pink-900/40 text-pink-300 font-mono text-[11px]">
              5 Lessons Ready
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-purple-950/30 border border-purple-900/40 text-purple-300 font-mono text-[11px]">
              18 Reviews Due
            </span>
          </div>

          <button
            onClick={onOpenProfile}
            className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] hover:border-white/[0.18] text-xs text-neutral-200 hover:text-white transition-colors"
          >
            <span
              className="w-5 h-5 rounded-full bg-white/[0.08] flex items-center justify-center text-[10px] text-pink-300"
              style={{ fontFamily: "'Noto Serif JP', serif" }}
            >
              {user?.avatarChar || '学'}
            </span>
            <span className="hidden sm:inline">{user?.name || 'David B.'}</span>
          </button>
        </div>
      </header>

      {/* Main Grid: Lower opacity cards allowing the sakura branch to shine through */}
      <main className="relative z-10 flex-1 min-h-0 w-full p-3 sm:p-4 lg:p-5 grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4 overflow-y-auto xl:overflow-hidden">
        {/* Left Column (5 Cols): Profile Summary + Learn & Review Action Cards */}
        <div className="lg:col-span-5 flex flex-col gap-3 min-h-0">
          {/* User Profile & Streak Widget */}
          <div className="shrink-0">
            <UserProfileWidget user={user} onOpenSettings={onOpenProfile} />
          </div>

          {/* Learn & Review Session Cards */}
          <div className="flex-1 min-h-[270px] xl:min-h-0 flex flex-col">
            <SessionActionCards
              onStartLessons={onStartLessons}
              onStartReviews={onStartReviews}
              onStartCustomReview={() => setIsCustomModalOpen(true)}
            />
          </div>
        </div>

        {/* Right Column (7 Cols): Story Generator Widget + 3D Carousel Widget */}
        <div className="lg:col-span-7 flex flex-col gap-3 min-h-0">
          {/* Story Generator Widget (Top) */}
          <div className="flex-1 min-h-[220px] xl:min-h-0">
            <StoryGeneratorWidget onStoryGenerated={onOpenStoryReader} />
          </div>

          {/* 3D Curriculum Carousel Widget with 2-finger scroll & See All (Bottom) */}
          <div className="flex-1 min-h-[270px] xl:min-h-0">
            <CurriculumCarousel3D onSelectKanji={onSelectKanji} />
          </div>
        </div>
      </main>

      {/* Custom Review Kanji Selector Modal */}
      <CustomReviewModal
        isOpen={isCustomModalOpen}
        onClose={() => setIsCustomModalOpen(false)}
        onStartCustomReview={(selected) => {
          setIsCustomModalOpen(false);
          onStartCustomReview(selected);
        }}
      />
    </div>
  );
};
