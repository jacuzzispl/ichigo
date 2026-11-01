import React, { useState, useRef, useEffect } from 'react';
import { NavTab, UserProfile } from '../types';

interface NavbarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  user: UserProfile | null;
  onOpenProfile: () => void;
  onOpenAuth: (mode: 'login' | 'signup') => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  user,
  onOpenProfile,
  onOpenAuth,
  onLogout,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const navItems: { id: NavTab; label: string }[] = user
    ? [
        { id: 'dashboard', label: 'Dashboard' },
        { id: 'home', label: 'Home' },
        { id: 'learn', label: 'Learn' },
        { id: 'progress', label: 'Progress' },
        { id: 'settings', label: 'Settings' },
      ]
    : [
        { id: 'home', label: 'Home' },
        { id: 'learn', label: 'Learn' },
        { id: 'progress', label: 'Progress' },
        { id: 'settings', label: 'Settings' },
      ];

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-40 w-full px-6 sm:px-8 md:px-14 py-5 md:py-7 flex items-center justify-between pointer-events-auto">
      {/* Left Zone: Kanji Logo, Left Profile/Auth Option, and Nav Links */}
      <div className="flex items-center gap-6 sm:gap-10 lg:gap-14">
        <div className="flex items-center gap-3">
          {/* Kanji Brand Mark */}
          <button
            onClick={() => onSelectTab('home')}
            className="group flex items-center justify-center text-2xl md:text-3xl font-light text-neutral-100 hover:text-white transition-colors tracking-widest focus:outline-none"
            style={{ fontFamily: "'Noto Serif JP', 'Cormorant Garamond', serif" }}
            title="桜 - Sakura"
          >
            <span className="inline-block transition-transform duration-300 group-hover:scale-105">
              桜
            </span>
          </button>

          {/* Left User Profile Badge / Quick Auth Trigger */}
          <div className="relative">
            {!user ? (
              <div className="flex items-center">
                <button
                  onClick={() => setIsDropdownOpen((prev) => !prev)}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs bg-neutral-900/80 hover:bg-neutral-800 border border-neutral-800 hover:border-neutral-700 text-neutral-400 hover:text-neutral-200 transition-colors focus:outline-none"
                  title="Account Status"
                >
                  <svg
                    className="w-3.5 h-3.5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  <span className="hidden sm:inline text-[11.5px]">Guest</span>
                  <span className="text-[10px] text-neutral-500">▾</span>
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenProfile}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs bg-neutral-900/80 hover:bg-neutral-800 border border-neutral-700 text-neutral-200 transition-colors focus:outline-none"
                title="View Profile"
              >
                <span
                  className="w-4 h-4 rounded-full bg-neutral-800 flex items-center justify-center text-[10px] text-pink-300 font-medium"
                  style={{ fontFamily: "'Noto Serif JP', serif" }}
                >
                  {user.avatarChar}
                </span>
                <span className="hidden sm:inline text-[11.5px] font-medium">{user.name}</span>
              </button>
            )}
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex items-center gap-5 sm:gap-8 md:gap-10 text-sm tracking-wide">
          {navItems.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`relative py-1 text-[13px] md:text-[14.5px] font-normal transition-colors duration-200 focus:outline-none ${
                  isActive
                    ? 'text-neutral-100'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                {item.label}
                {isActive && (
                  <span
                    className="absolute left-0 bottom-[-2px] w-full h-[1.5px] bg-neutral-200 rounded-full"
                    style={{ transformOrigin: 'left' }}
                  />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Right Zone: User Profile Logo & Direct Log In / Sign Up Controls */}
      <div className="relative flex items-center gap-3" ref={dropdownRef}>
        {!user ? (
          /* NOT LOGGED IN: Options to Sign Up or Log In */
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Direct Quick Action Buttons */}
            <button
              onClick={() => onOpenAuth('login')}
              className="text-[13px] md:text-sm text-neutral-400 hover:text-neutral-100 transition-colors py-1 px-2 focus:outline-none"
            >
              Log In
            </button>

            <button
              onClick={() => onOpenAuth('signup')}
              className="px-3.5 sm:px-4 py-1.5 rounded-full border border-neutral-700 hover:border-neutral-400 text-xs sm:text-[13px] text-neutral-200 hover:text-white transition-all bg-neutral-900/60 hover:bg-neutral-800/80 focus:outline-none"
            >
              Sign Up
            </button>

            {/* Profile Logo Icon Trigger (also opens dropdown with Log In / Sign Up) */}
            <button
              onClick={() => setIsDropdownOpen((prev) => !prev)}
              className="p-1.5 text-neutral-300 hover:text-white transition-colors duration-200 focus:outline-none rounded-full hover:bg-white/5"
              title="Account Menu (Sign Up or Log In)"
              aria-label="Account Options"
            >
              <svg
                className="w-5 h-5 md:w-[22px] md:h-[22px]"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.25"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </button>
          </div>
        ) : (
          /* LOGGED IN: Profile button opening the profile drawer */
          <div className="flex items-center gap-3">
            <button
              onClick={onOpenProfile}
              className="flex items-center gap-2 p-1.5 text-neutral-300 hover:text-white transition-colors duration-200 focus:outline-none rounded-full hover:bg-white/5"
              title={`${user.name} - View Profile & Stats`}
              aria-label="User Profile"
            >
              <span
                className="w-6 h-6 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center text-xs text-pink-200 font-medium"
                style={{ fontFamily: "'Noto Serif JP', serif" }}
              >
                {user.avatarChar}
              </span>
              <span className="hidden md:inline text-xs text-neutral-300 font-medium">
                {user.name}
              </span>
            </button>
          </div>
        )}

        {/* Dropdown Menu when clicking profile logo while not logged in */}
        {isDropdownOpen && !user && (
          <div className="absolute right-0 top-12 w-64 bg-[#0e0e12] border border-neutral-800 rounded-xl p-4 shadow-2xl z-50 text-neutral-200 animate-fadeIn">
            <div className="text-xs font-medium text-neutral-200 mb-1">
              Account Access
            </div>
            <p className="text-[11px] text-neutral-500 mb-3.5 leading-relaxed">
              Sign up or log in to sync your reviews, kanji flashcards, and daily streak.
            </p>

            <div className="space-y-2">
              <button
                onClick={() => {
                  setIsDropdownOpen(false);
                  onOpenAuth('login');
                }}
                className="w-full py-2 px-3 text-xs rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white font-medium text-center transition-colors flex items-center justify-center gap-2"
              >
                <span>Log In</span>
              </button>

              <button
                onClick={() => {
                  setIsDropdownOpen(false);
                  onOpenAuth('signup');
                }}
                className="w-full py-2 px-3 text-xs rounded-lg border border-neutral-700 hover:border-neutral-500 text-neutral-200 hover:text-white text-center transition-colors flex items-center justify-center gap-2"
              >
                <span>Sign Up</span>
              </button>

              <div className="pt-2 border-t border-neutral-800/80">
                <button
                  onClick={() => {
                    setIsDropdownOpen(false);
                    onOpenAuth('login');
                  }}
                  className="w-full text-left text-[11px] text-neutral-400 hover:text-neutral-200 py-1 transition-colors flex items-center gap-1.5"
                >
                  <span>⚡</span>
                  <span>Try Quick Demo Account</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
