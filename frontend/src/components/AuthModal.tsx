import React, { useState } from 'react';
import { UserProfile } from '../types';
import { authApi } from '../services/authApi';

interface AuthModalProps {
  isOpen: boolean;
  initialMode?: 'login' | 'signup';
  onClose: () => void;
  onLoginSuccess: (user: UserProfile) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  initialMode = 'login',
  onClose,
  onLoginSuccess,
}) => {
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Sync mode when initialMode changes or modal opens
  React.useEffect(() => {
    setMode(initialMode);
    setError(null);
  }, [initialMode, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all required fields.');
      return;
    }
    if (mode === 'signup' && !name) {
      setError('Please enter your name.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (mode === 'login') {
        const { user } = await authApi.login(email, password);
        onLoginSuccess(user);
      } else {
        const { user } = await authApi.register(email, password, name);
        onLoginSuccess(user);
      }
      onClose();
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = () => {
    const demoUser: UserProfile = {
      id: 'demo_user',
      name: 'David B.',
      email: 'david@sakurakanji.jp',
      avatarChar: '学',
      jlptGoal: 'JLPT N5',
      streakDays: 14,
      kanjiLearned: 184,
    };
    onLoginSuccess(demoUser);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      {/* Backdrop */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-md bg-[#0c0c0f] border border-neutral-800 rounded-2xl p-6 md:p-8 shadow-2xl z-10 text-neutral-200">
        {/* Subtle decorative glow */}
        <div className="absolute -top-16 -right-16 w-48 h-48 bg-pink-500/5 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800/60 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <line x1="18" y1="6" x2="6" y2="18" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="6" y1="6" x2="18" y2="18" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div
            className="text-2xl text-neutral-100 font-light mb-1"
            style={{ fontFamily: "'Noto Serif JP', serif" }}
          >
            桜
          </div>
          <h2
            className="text-2xl md:text-3xl font-light text-neutral-100"
            style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
          >
            {mode === 'login' ? 'Welcome Back' : 'Begin Your Journey'}
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            {mode === 'login'
              ? 'Log in to sync your kanji reviews & daily streak.'
              : 'Create an account to track your spaced repetition progress.'}
          </p>
        </div>

        {/* Mode Tabs */}
        <div className="flex p-1 bg-neutral-900/90 rounded-lg border border-neutral-800 mb-6 text-xs font-medium">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setError(null);
            }}
            className={`flex-1 py-2 rounded-md transition-all ${
              mode === 'login'
                ? 'bg-neutral-800 text-white shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Log In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('signup');
              setError(null);
            }}
            className={`flex-1 py-2 rounded-md transition-all ${
              mode === 'signup'
                ? 'bg-neutral-800 text-white shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="mb-4 p-2.5 rounded-lg bg-red-950/40 border border-red-900/60 text-red-300 text-xs text-center">
            {error}
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <div>
              <label className="block text-xs uppercase tracking-wider text-neutral-400 mb-1.5 font-medium">
                Your Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. David"
                className="w-full px-3.5 py-2.5 bg-neutral-900/80 border border-neutral-800 rounded-xl text-sm text-neutral-200 placeholder-neutral-600 focus:outline-none focus:border-neutral-500 transition-colors"
              />
            </div>
          )}

          <div>
            <label className="block text-xs uppercase tracking-wider text-neutral-400 mb-1.5 font-medium">
              Email Address / Username
            </label>
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="w-full px-3.5 py-2.5 bg-neutral-900/80 border border-neutral-800 rounded-xl text-sm text-neutral-200 placeholder-neutral-600 focus:outline-none focus:border-neutral-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-neutral-400 mb-1.5 font-medium">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full px-3.5 py-2.5 bg-neutral-900/80 border border-neutral-800 rounded-xl text-sm text-neutral-200 placeholder-neutral-600 focus:outline-none focus:border-neutral-500 transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 rounded-full bg-neutral-100 hover:bg-white text-neutral-900 text-sm font-medium transition-all shadow-md active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-neutral-900 border-t-transparent rounded-full animate-spin" />
                <span>Connecting...</span>
              </>
            ) : (
              <span>{mode === 'login' ? 'Log In to Account' : 'Create Account'}</span>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-5">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-neutral-800/80" />
          </div>
          <div className="relative flex justify-center text-[11px] uppercase tracking-wider">
            <span className="bg-[#0c0c0f] px-3 text-neutral-500">or</span>
          </div>
        </div>

        {/* Quick Demo Access Button */}
        <button
          type="button"
          onClick={handleDemoLogin}
          className="w-full py-2.5 px-4 rounded-xl border border-neutral-800 hover:border-neutral-700 bg-neutral-900/40 hover:bg-neutral-800/40 text-xs text-neutral-300 hover:text-white flex items-center justify-center gap-2 transition-colors"
        >
          <span>⚡</span>
          <span>Quick 1-Click Demo Preview</span>
        </button>
      </div>
    </div>
  );
};
