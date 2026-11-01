import React from 'react';
import { UserProfile } from '../types';

interface ProfileDrawerProps {
  isOpen: boolean;
  user: UserProfile | null;
  onClose: () => void;
  onLogout: () => void;
  onOpenAuth: (mode: 'login' | 'signup') => void;
}

export const ProfileDrawer: React.FC<ProfileDrawerProps> = ({
  isOpen,
  user,
  onClose,
  onLogout,
  onOpenAuth,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-fadeIn">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Drawer */}
      <div className="absolute inset-y-0 right-0 max-w-sm w-full bg-[#0d0d10] border-l border-neutral-800 p-6 md:p-8 flex flex-col justify-between shadow-2xl text-neutral-200">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-neutral-800 mb-6">
            <h3
              className="text-xl font-light text-neutral-100"
              style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
            >
              Learner Profile
            </h3>
            <button
              onClick={onClose}
              className="p-1 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800/60"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <line x1="18" y1="6" x2="6" y2="18" strokeWidth="1.5" strokeLinecap="round" />
                <line x1="6" y1="6" x2="18" y2="18" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          {user ? (
            <>
              {/* User Avatar & Info */}
              <div className="flex items-center gap-4 mb-8">
                <div
                  className="w-14 h-14 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center text-xl text-neutral-200"
                  style={{ fontFamily: "'Noto Serif JP', serif" }}
                >
                  {user.avatarChar}
                </div>
                <div>
                  <div className="text-base font-medium text-neutral-100">{user.name}</div>
                  <div className="text-xs text-neutral-400">{user.email}</div>
                  <div className="text-[11px] text-pink-300 mt-0.5">
                    🔥 {user.streakDays}-Day Study Streak
                  </div>
                </div>
              </div>

              {/* Quick Metrics */}
              <div className="space-y-3 mb-8">
                <div className="flex justify-between items-center p-3 rounded-xl bg-neutral-900/60 border border-neutral-800/60 text-xs">
                  <span className="text-neutral-400">Mastered Kanji</span>
                  <span className="font-mono text-pink-300 font-medium">
                    {user.kanjiLearned} Kanji
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-xl bg-neutral-900/60 border border-neutral-800/60 text-xs">
                  <span className="text-neutral-400">Target Level</span>
                  <span className="font-mono text-neutral-200">{user.jlptGoal}</span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-xl bg-neutral-900/60 border border-neutral-800/60 text-xs">
                  <span className="text-neutral-400">Memory Retention</span>
                  <span className="font-mono text-emerald-400">94.2%</span>
                </div>
              </div>

              {/* Current Mastery Badge */}
              <div className="p-4 rounded-xl bg-gradient-to-br from-neutral-900 to-neutral-950 border border-neutral-800/80 mb-6">
                <div className="text-[11px] uppercase tracking-wider text-neutral-500 mb-1">
                  Active Study Plan
                </div>
                <div className="text-sm font-medium text-neutral-200">
                  {user.jlptGoal} Comprehensive Kanji
                </div>
                <p className="text-xs text-neutral-400 mt-1">
                  Radical mnemonics, stroke order, and daily spaced repetition review.
                </p>
              </div>
            </>
          ) : (
            /* Not logged in state */
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-500">
                <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25">
                  <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
              <h4
                className="text-xl font-light text-neutral-200 mb-2"
                style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
              >
                Guest Learner
              </h4>
              <p className="text-xs text-neutral-400 max-w-xs mx-auto mb-6">
                You are currently browsing as a guest. Log in or create an account to save your study streak and kanji mastery.
              </p>
              <div className="space-y-3">
                <button
                  onClick={() => {
                    onClose();
                    onOpenAuth('login');
                  }}
                  className="w-full py-2.5 rounded-full bg-neutral-100 hover:bg-white text-neutral-900 text-xs font-medium transition-colors"
                >
                  Log In
                </button>
                <button
                  onClick={() => {
                    onClose();
                    onOpenAuth('signup');
                  }}
                  className="w-full py-2.5 rounded-full border border-neutral-700 hover:border-neutral-500 text-neutral-300 hover:text-white text-xs font-medium transition-colors"
                >
                  Sign Up
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="pt-4 border-t border-neutral-800 space-y-2">
          {user && (
            <>
              <button
                onClick={() => {
                  onClose();
                  onOpenAuth('login');
                }}
                className="hidden"
              />
              <button
                onClick={() => {
                  onLogout();
                  onClose();
                }}
                className="w-full py-2 rounded-full border border-red-950/80 hover:border-red-800 bg-red-950/20 text-red-300 hover:text-red-200 text-xs transition-colors"
              >
                Log Out
              </button>
            </>
          )}
          <button
            onClick={onClose}
            className="w-full py-2 rounded-full border border-neutral-800 hover:border-neutral-700 text-xs text-neutral-400 hover:text-neutral-200 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
