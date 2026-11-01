import React, { useState, useEffect, useRef } from 'react';
import {
  LessonKanji,
  KanjiSessionOutcome,
  LessonCompletePayload,
  LessonCompleteResponse,
} from '../../types';
import { submitLessonResults } from '../../api/lessons';

interface SummaryProps {
  batch: LessonKanji[];
  outcomes: KanjiSessionOutcome[];
  onFinish: () => void;
}

export const Summary: React.FC<SummaryProps> = ({
  batch,
  outcomes,
  onFinish,
}) => {
  const [submissionState, setSubmissionState] = useState<
    'idle' | 'loading' | 'success' | 'error'
  >('loading');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [response, setResponse] = useState<LessonCompleteResponse | null>(null);
  const [simulateFailure, setSimulateFailure] = useState(false);

  // Guard to ensure submission is only called once on initial mount
  const hasSubmittedRef = useRef(false);

  const payload: LessonCompletePayload = {
    results: outcomes.map((o) => ({
      kanji_id: o.kanji_id,
      meaning_incorrect: o.meaning_incorrect,
      reading_incorrect: o.reading_incorrect,
      answers: o.answers,
    })),
  };

  const executeSubmission = async (simulateFail = false) => {
    setSubmissionState('loading');
    setErrorMsg(null);

    try {
      const res = await submitLessonResults(payload, simulateFail);
      setResponse(res);
      setSubmissionState('success');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit lesson results.');
      setSubmissionState('error');
    }
  };

  useEffect(() => {
    if (!hasSubmittedRef.current) {
      hasSubmittedRef.current = true;
      executeSubmission(false);
    }
  }, []);

  const kanjiMap = new Map<number, LessonKanji>(batch.map((k) => [k.id, k]));

  // Stats calculation
  const totalAnswers = outcomes.reduce((acc, o) => acc + o.answers.length, 0);
  const correctAnswers = outcomes.reduce(
    (acc, o) => acc + o.answers.filter((a) => a.correct).length,
    0
  );
  const accuracyPercent =
    totalAnswers > 0 ? Math.round((correctAnswers / totalAnswers) * 100) : 100;

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col justify-between select-none animate-fadeIn space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-white/[0.08] flex items-center justify-between">
        <div>
          <span className="text-[11px] uppercase tracking-[0.2em] text-[#938c82] font-mono">
            Summary Phase
          </span>
          <h2
            className="text-3xl font-light text-neutral-100 tracking-tight mt-0.5"
            style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
          >
            Lesson Complete
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-[10px] uppercase font-mono text-neutral-500">First-Try Accuracy</div>
            <div className="text-xl font-mono text-emerald-400 font-medium leading-none mt-0.5">
              {accuracyPercent}%
            </div>
          </div>
        </div>
      </div>

      {/* Submission Status Banner */}
      <div className="rounded-xl border p-3.5 transition-all">
        {submissionState === 'loading' && (
          <div className="flex items-center gap-2.5 text-xs text-neutral-300">
            <span className="w-3.5 h-3.5 border-2 border-neutral-400 border-t-transparent rounded-full animate-spin" />
            <span>Syncing lesson completion with server...</span>
          </div>
        )}

        {submissionState === 'success' && (
          <div className="flex items-center justify-between text-xs text-emerald-300">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold">✓</span>
              <span>
                Results saved. {response?.created.length || batch.length} kanji added to your SRS review queue!
              </span>
            </div>
            <span className="text-[10px] text-neutral-500 font-mono">Server Synced</span>
          </div>
        )}

        {submissionState === 'error' && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-red-300">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold">✕</span>
              <span>{errorMsg || 'Submission error occurred.'}</span>
            </div>
            <button
              onClick={() => executeSubmission(simulateFailure)}
              className="px-3 py-1 rounded-full bg-red-950/60 hover:bg-red-900 border border-red-800 text-red-200 text-xs font-medium transition-colors"
            >
              Retry Submission ↻
            </button>
          </div>
        )}
      </div>

      {/* Kanji Results Breakdown List */}
      <div className="space-y-3">
        <div className="text-[11px] uppercase tracking-wider text-neutral-400 font-mono">
          Kanji Retention Breakdown
        </div>

        <div className="space-y-2.5">
          {outcomes.map((outcome) => {
            const kanji = kanjiMap.get(outcome.kanji_id);
            if (!kanji) return null;

            const totalErrors =
              outcome.meaning_incorrect + outcome.reading_incorrect;
            const struggled = totalErrors >= 2;

            return (
              <div
                key={outcome.kanji_id}
                className={`p-3.5 sm:p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  struggled
                    ? 'bg-amber-950/20 border-amber-800/40 shadow-sm'
                    : 'bg-white/[0.02] border-white/[0.06]'
                }`}
              >
                {/* Kanji Character & Meaning */}
                <div className="flex items-center gap-3.5">
                  <div
                    className="text-4xl text-neutral-100 font-light leading-none shrink-0"
                    style={{ fontFamily: "'Noto Serif JP', serif" }}
                  >
                    {kanji.character}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-neutral-200">
                        {Array.isArray(kanji.meanings)
                          ? kanji.meanings.join(', ')
                          : kanji.meaning || ''}
                      </span>
                      {struggled && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-950/60 border border-amber-700/60 text-amber-300 font-mono">
                          Needs Review ({totalErrors} mistakes)
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-neutral-400 font-mono mt-0.5">
                      {(Array.isArray(kanji.onyomi) ? kanji.onyomi.join(', ') : '') ||
                        (Array.isArray(kanji.kunyomi) ? kanji.kunyomi.join(', ') : '')}
                    </div>
                  </div>
                </div>

                {/* First-Try Correct Badges for Meaning & Reading */}
                <div className="flex items-center gap-2 self-start sm:self-auto text-xs">
                  {/* Meaning badge */}
                  <div
                    className={`px-2.5 py-1 rounded-lg border text-[11px] font-mono flex items-center gap-1.5 ${
                      outcome.first_try_meaning
                        ? 'bg-emerald-950/30 border-emerald-800/40 text-emerald-300'
                        : 'bg-red-950/30 border-red-800/40 text-red-300'
                    }`}
                  >
                    <span>Meaning:</span>
                    <span>{outcome.first_try_meaning ? '1st Try ✓' : `${outcome.meaning_incorrect} ✕`}</span>
                  </div>

                  {/* Reading badge */}
                  <div
                    className={`px-2.5 py-1 rounded-lg border text-[11px] font-mono flex items-center gap-1.5 ${
                      outcome.first_try_reading
                        ? 'bg-emerald-950/30 border-emerald-800/40 text-emerald-300'
                        : 'bg-red-950/30 border-red-800/40 text-red-300'
                    }`}
                  >
                    <span>Reading:</span>
                    <span>{outcome.first_try_reading ? '1st Try ✓' : `${outcome.reading_incorrect} ✕`}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Dev Testing Toggle (Simulate Failure to test Retry Path) */}
      <div className="p-3 rounded-xl border border-white/[0.05] bg-white/[0.01] flex items-center justify-between text-xs text-neutral-500">
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={simulateFailure}
            onChange={(e) => setSimulateFailure(e.target.checked)}
            className="rounded border-neutral-700 bg-neutral-900 text-pink-500 focus:ring-0"
          />
          <span>Simulate API failure on next retry (to test error & retry path)</span>
        </label>
        {submissionState === 'error' && (
          <span className="text-red-400 font-mono">Error active</span>
        )}
      </div>

      {/* Bottom Actions: Done Button */}
      <div className="pt-2">
        <button
          type="button"
          onClick={onFinish}
          className="w-full py-3.5 rounded-full bg-neutral-100 hover:bg-white text-neutral-950 text-sm font-medium transition-all shadow-lg flex items-center justify-center gap-2 hover:scale-[1.01]"
        >
          <span>Done (Return to Dashboard)</span>
          <span>→</span>
        </button>
      </div>
    </div>
  );
};
