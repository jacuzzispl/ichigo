import React, { useState, useEffect } from 'react';
import { NavTab, KanjiItem, UserProfile } from './types';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { LearnSection } from './components/LearnSection';
import { ProgressSection } from './components/ProgressSection';
import { SettingsModal } from './components/SettingsModal';
import { ProfileDrawer } from './components/ProfileDrawer';
import { KanjiModal } from './components/KanjiModal';
import { AuthModal } from './components/AuthModal';
import { DashboardPage } from './components/dashboard/DashboardPage';
import { LessonSession } from './components/lesson/LessonSession';
import { KANJI_DATA } from './data/kanjiData';
import { authStorage, authApi } from './services/authApi';

export default function App() {
  const [currentTab, setCurrentTab] = useState<NavTab>('home');
  const [selectedKanji, setSelectedKanji] = useState<KanjiItem | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [user, setUser] = useState<UserProfile | null>(() => authStorage.getUser());
  const [petalDensity, setPetalDensity] = useState<'off' | 'subtle' | 'breeze' | 'blizzard'>('subtle');
  const [bgVariant, setBgVariant] = useState<'classic' | 'painted'>('classic');
  const [readingPreference, setReadingPreference] = useState<'kanji-only' | 'furigana' | 'romaji'>('furigana');

  const handleOpenAuth = (mode: 'login' | 'signup') => {
    setAuthMode(mode);
    setIsAuthOpen(true);
  };

  const handleLogout = () => {
    authApi.logout();
    setUser(null);
    setCurrentTab('home');
  };

  const handleLoginSuccess = (loggedInUser: UserProfile) => {
    setUser(loggedInUser);
    setIsAuthOpen(false);
    // Redirect user to the learning dashboard upon sign in!
    setCurrentTab('dashboard');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectTab = (tab: NavTab) => {
    setCurrentTab(tab);
    if (tab === 'settings') {
      setIsSettingsOpen(true);
      return;
    }
    if (tab === 'dashboard' || tab === 'learn-session') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (tab === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (tab === 'learn') {
      const el = document.getElementById('learn-section');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    } else if (tab === 'progress') {
      const el = document.getElementById('progress-section');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const handleGetStarted = () => {
    // If not logged in, prompt sign up; if logged in, go straight to Dashboard
    if (!user) {
      handleOpenAuth('signup');
    } else {
      setCurrentTab('dashboard');
    }
  };

  const handleScrollDown = () => {
    const el = document.getElementById('learn-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Sync scroll position with current tab indicator ONLY when on home page
  useEffect(() => {
    if (currentTab === 'dashboard' || currentTab === 'learn-session') return;

    const handleScroll = () => {
      const scrollPos = window.scrollY;
      const height = window.innerHeight;
      if (scrollPos < height * 0.6) {
        setCurrentTab('home');
      } else if (scrollPos < height * 1.8) {
        setCurrentTab('learn');
      } else {
        setCurrentTab('progress');
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [currentTab]);

  return (
    <div className="relative min-h-screen bg-[#070707] text-neutral-100 font-sans selection:bg-neutral-800 selection:text-neutral-100">
      {/* If currentTab is 'learn-session', render the Learn Session Page */}
      {currentTab === 'learn-session' ? (
        <LessonSession
          onFinish={() => {
            setCurrentTab('dashboard');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
      ) : currentTab === 'dashboard' ? (
        /* If currentTab is 'dashboard', render the Learning Dashboard Page */
        <DashboardPage
          user={user}
          onBackToHome={() => {
            setCurrentTab('home');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onOpenProfile={() => setIsProfileOpen(true)}
          onSelectKanji={(item) => setSelectedKanji(item)}
          onStartLessons={() => {
            setCurrentTab('learn-session');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
      ) : (
        /* Otherwise, render the exact Home landing page */
        <>
          {/* Top Bar Navigation */}
          <Navbar
            currentTab={currentTab}
            onSelectTab={handleSelectTab}
            user={user}
            onOpenProfile={() => setIsProfileOpen(true)}
            onOpenAuth={handleOpenAuth}
            onLogout={handleLogout}
          />

          {/* Main Hero Section */}
          <main>
            <HeroSection
              onGetStarted={handleGetStarted}
              onScrollDown={handleScrollDown}
              bgVariant={bgVariant}
            />

            {/* Interactive Learn & Kanji Section */}
            <div id="learn-section">
              <LearnSection onSelectKanji={(item) => setSelectedKanji(item)} />
            </div>

            {/* Progress & Milestone Section */}
            <div id="progress-section">
              <ProgressSection />
            </div>
          </main>

          {/* Footer */}
          <footer className="relative z-20 w-full bg-[#050505] border-t border-neutral-900 py-10 px-8 md:px-14 lg:px-20 text-neutral-500 text-xs flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-lg text-neutral-300" style={{ fontFamily: "'Noto Serif JP', serif" }}>
                桜
              </span>
              <span>© 2026 Sakura Kanji. Learn Japanese, your way.</span>
            </div>
            <div className="flex items-center gap-6">
              <button
                onClick={() => setIsSettingsOpen(true)}
                className="hover:text-neutral-300 transition-colors"
              >
                Preferences
              </button>
              <button
                onClick={() => {
                  const sakuraKanji = KANJI_DATA.find((k) => k.id === 'sakura');
                  if (sakuraKanji) setSelectedKanji(sakuraKanji);
                }}
                className="hover:text-neutral-300 transition-colors"
              >
                Kanji Spotlight: 桜
              </button>
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="hover:text-neutral-300 transition-colors"
              >
                Back to Top ↑
              </button>
            </div>
          </footer>
        </>
      )}

      {/* Auth Modal (Log In / Sign Up) */}
      <AuthModal
        isOpen={isAuthOpen}
        initialMode={authMode}
        onClose={() => setIsAuthOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* Interactive Kanji Detail Modal */}
      <KanjiModal
        kanji={selectedKanji}
        onClose={() => setSelectedKanji(null)}
      />

      {/* Profile Drawer */}
      <ProfileDrawer
        isOpen={isProfileOpen}
        user={user}
        onClose={() => setIsProfileOpen(false)}
        onLogout={handleLogout}
        onOpenAuth={handleOpenAuth}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => {
          setIsSettingsOpen(false);
          if (currentTab === 'settings') setCurrentTab('home');
        }}
        petalDensity={petalDensity}
        onSetPetalDensity={setPetalDensity}
        bgVariant={bgVariant}
        onSetBgVariant={setBgVariant}
        readingPreference={readingPreference}
        onSetReadingPreference={setReadingPreference}
      />
    </div>
  );
}


