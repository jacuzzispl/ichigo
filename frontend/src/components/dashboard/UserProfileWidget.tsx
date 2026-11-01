import React from 'react';
import { UserProfile } from '../../types';

interface UserProfileWidgetProps {
  user: UserProfile | null;
  onOpenSettings?: () => void;
}

export const UserProfileWidget: React.FC<UserProfileWidgetProps> = ({
  user,
}) => {
  const name = user?.name || 'David B.';
  const avatar = user?.avatarChar || '学';
  const streak = user?.streakDays || 14;
  const level = 4;
  const levelProgress = 62;

  return (
    <div className="w-full bg-black/20 backdrop-blur-[6px] border border-white/[0.06] hover:border-white/[0.1] hover:bg-black/25 rounded-2xl px-4 py-3 sm:py-3.5 shadow-xl transition-all shrink-0">
      <div className="flex flex-wrap items-center justify-between gap-3 sm:gap-4">
        {/* Left: Minimal Avatar + Identity */}
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-base sm:text-lg text-pink-200 shadow-inner shrink-0"
            style={{ fontFamily: "'Noto Serif JP', serif" }}
          >
            {avatar}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span
                className="text-base sm:text-lg font-light text-neutral-100 leading-none"
                style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
              >
                {name}
              </span>
              <span className="text-[11px] text-neutral-400 font-mono">
                Level {level}
              </span>
            </div>

            <div className="flex items-center gap-2 text-[11px] text-neutral-400 mt-1">
              <span className="text-pink-300 font-medium">🔥 {streak} Days</span>
              <span className="text-neutral-600">·</span>
              <span>18/20 Daily Goal</span>
              <span className="text-neutral-600">·</span>
              <span className="text-emerald-400">94.2% Accuracy</span>
            </div>
          </div>
        </div>

        {/* Right: Clean Sleek Progression Bar */}
        <div className="flex items-center gap-3 w-full sm:w-auto sm:min-w-[200px] md:min-w-[240px]">
          <div className="flex-1 space-y-1">
            <div className="flex justify-between text-[10px] text-neutral-400">
              <span>Next Rank (Level {level + 1})</span>
              <span className="font-mono text-neutral-300">{levelProgress}%</span>
            </div>
            <div className="w-full h-1.5 bg-white/[0.05] rounded-full overflow-hidden border border-white/[0.06]">
              <div
                className="h-full bg-gradient-to-r from-neutral-300 to-pink-300 rounded-full"
                style={{ width: `${levelProgress}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
