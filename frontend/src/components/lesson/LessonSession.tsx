import React, { useState, useEffect } from 'react';
import { LessonKanji, KanjiSessionOutcome } from '../../types';
import { getLessonBatch } from '../../api/lessons';
import { LessonCards } from './LessonCards';
import { Quiz } from './Quiz';
import { Summary } from './Summary';

interface LessonSessionProps {
  onFinish: () => void;
  batchSize?: number;
}

type SessionPhase = 'lesson' | 'quiz' | 'summary';

const DEFAULT_BATCH_SIZE = 5;

export const LessonSession: React.FC<LessonSessionProps> = ({
  onFinish,
  batchSize = DEFAULT_BATCH_SIZE,
}) => {
  const [phase, setPhase] = useState<SessionPhase>('lesson');
  const [batch, setBatch] = useState<LessonKanji[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [outcomes, setOutcomes] = useState<KanjiSessionOutcome[]>([]);

  const fetchBatch = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getLessonBatch(batchSize);
      setBatch(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load lesson batch.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBatch();
  }, [batchSize]);

  const outlineBgImage = '/src/assets/images/sakura_outline_topright_1791579194144.jpg';

  return (
    <div className="relative min-h-screen w-full bg-[#050507] text-neutral-100 flex flex-col justify-between p-4 sm:p-6 lg:p-8 overflow-y-auto">
      {/* Background Faint Outline Sakura Tree */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div
          className="absolute top-0 right-0 w-full sm:w-[85%] md:w-[70%] lg:w-[60%] h-full bg-no-repeat bg-right-top bg-contain opacity-50 mix-blend-screen"
          style={{
            backgroundImage: `url("${outlineBgImage}")`,
            backgroundPosition: 'top right',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#050507] via-[#050507]/60 to-transparent w-full md:w-[50%]" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#050507]/40 via-transparent to-[#050507]/60" />
      </div>

      {/* Top Session Progress Bar Indicator */}
      <header className="relative z-10 w-full max-w-2xl mx-auto flex items-center justify-between py-2 text-xs mb-4">
        <div className="flex items-center gap-3">
          <span
            className="text-xl font-light text-neutral-200"
            style={{ fontFamily: "'Noto Serif JP', serif" }}
          >
            桜
          </span>
          <div className="flex items-center gap-2">
            <span
              className={`px-2.5 py-0.5 rounded-full border text-[11px] font-mono transition-all ${
                phase === 'lesson'
                  ? 'bg-neutral-800 border-neutral-700 text-white font-medium'
                  : 'border-white/[0.05] text-neutral-500'
              }`}
            >
              1. Lesson
            </span>
            <span className="text-neutral-700">→</span>
            <span
              className={`px-2.5 py-0.5 rounded-full border text-[11px] font-mono transition-all ${
                phase === 'quiz'
                  ? 'bg-neutral-800 border-neutral-700 text-white font-medium'
                  : 'border-white/[0.05] text-neutral-500'
              }`}
            >
              2. Quiz
            </span>
            <span className="text-neutral-700">→</span>
            <span
              className={`px-2.5 py-0.5 rounded-full border text-[11px] font-mono transition-all ${
                phase === 'summary'
                  ? 'bg-neutral-800 border-neutral-700 text-white font-medium'
                  : 'border-white/[0.05] text-neutral-500'
              }`}
            >
              3. Summary
            </span>
          </div>
        </div>

        <button
          onClick={onFinish}
          className="text-xs text-neutral-400 hover:text-white transition-colors"
          title="Exit to Dashboard"
        >
          Exit ✕
        </button>
      </header>

      {/* Content Area */}
      <main className="relative z-10 w-full flex-1 flex flex-col justify-center my-auto py-4">
        {/* Loading State */}
        {loading && (
          <div className="max-w-md mx-auto text-center py-16 space-y-3 animate-fadeIn">
            <div className="w-8 h-8 border-2 border-neutral-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-sm text-neutral-300 font-light">
              Preparing your new kanji lesson batch...
            </p>
          </div>
        )}

        {/* Fetch Error State with Retry */}
        {!loading && error && (
          <div className="max-w-md mx-auto text-center py-12 px-6 rounded-2xl bg-red-950/20 border border-red-900/40 text-neutral-200 animate-fadeIn space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-950/60 border border-red-800 flex items-center justify-center text-red-300 text-xl mx-auto">
              ✕
            </div>
            <h3 className="text-lg font-medium text-red-200">
              Could not load lessons
            </h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              {error}
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={fetchBatch}
                className="px-5 py-2 rounded-full bg-neutral-200 hover:bg-white text-neutral-950 text-xs font-medium transition-colors"
              >
                Retry ↻
              </button>
              <button
                onClick={onFinish}
                className="px-4 py-2 rounded-full border border-neutral-700 text-xs text-neutral-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Empty Batch State: All caught up! */}
        {!loading && !error && batch.length === 0 && (
          <div className="max-w-md mx-auto text-center py-16 px-6 rounded-2xl bg-white/[0.02] border border-white/[0.08] text-neutral-200 animate-fadeIn space-y-4">
            <div className="text-5xl font-light text-neutral-400" style={{ fontFamily: "'Noto Serif JP', serif" }}>
              完
            </div>
            <h3
              className="text-2xl font-light text-neutral-100"
              style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
            >
              All Caught Up!
            </h3>
            <p className="text-xs text-neutral-400 leading-relaxed max-w-xs mx-auto">
              No new kanji lessons pending right now. Practice your SRS reviews or explore the 3D curriculum.
            </p>
            <div className="pt-2">
              <button
                onClick={onFinish}
                className="px-6 py-2.5 rounded-full bg-neutral-100 hover:bg-white text-neutral-950 text-xs font-medium transition-colors"
              >
                Back to Dashboard →
              </button>
            </div>
          </div>
        )}

        {/* Phase 1: Lesson Cards */}
        {!loading && !error && batch.length > 0 && phase === 'lesson' && (
          <LessonCards
            kanjiList={batch}
            onStartQuiz={() => setPhase('quiz')}
            onExit={onFinish}
          />
        )}

        {/* Phase 2: Quiz Phase */}
        {!loading && !error && batch.length > 0 && phase === 'quiz' && (
          <Quiz
            batch={batch}
            onComplete={(res) => {
              setOutcomes(res);
              setPhase('summary');
            }}
            onExit={onFinish}
          />
        )}

        {/* Phase 3: Summary Phase */}
        {!loading && !error && batch.length > 0 && phase === 'summary' && (
          <Summary
            batch={batch}
            outcomes={outcomes}
            onFinish={onFinish}
          />
        )}
      </main>

      {/* Footer Branding */}
      <footer className="relative z-10 w-full max-w-2xl mx-auto py-2 text-center text-[11px] text-neutral-600 font-mono">
        Sakura Kanji · Interactive Lesson Phase
      </footer>
    </div>
  );
};
