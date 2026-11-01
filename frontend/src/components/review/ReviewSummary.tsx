import React, { useState, useEffect, useRef } from 'react';
import { ReviewSessionOutcome, ReviewCompletePayload, ReviewCompleteResponse } from '../../types';
import { submitReviewComplete } from '../../api/reviews';

interface ReviewSummaryProps {
  outcomes: ReviewSessionOutcome[];
  onFinish: () => void;
  isCustomReview?: boolean;
}

export const ReviewSummary: React.FC<ReviewSummaryProps> = ({
  outcomes,
  onFinish,
  isCustomReview = false,
}) => {
  const [submissionState, setSubmissionState] = useState<
    'idle' | 'loading' | 'success' | 'error'
  >('loading');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [response, setResponse] = useState<ReviewCompleteResponse | null>(null);

  const hasSubmittedRef = useRef(false);

  // Payload format sent to `/complete` router (matching study sessions)
  const payload: ReviewCompletePayload = {
    results: outcomes.map((o) => ({
      kanji_id: o.kanji.id,
      meaning_incorrect: o.meaning_incorrect,
      reading_incorrect: o.reading_incorrect,
      answers: o.answers.map((a) => ({
        question_type: a.question_type,
        correct: a.correct,
        response_ms: a.response_ms,
      })),
    })),
  };

  const executeSubmission = async () => {
    setSubmissionState('loading');
    setErrorMsg(null);

    try {
      const res = await submitReviewComplete(payload);
      setResponse(res);
      setSubmissionState('success');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit review results.');
      setSubmissionState('error');
    }
  };

  useEffect(() => {
    if (!hasSubmittedRef.current && outcomes.length > 0) {
      hasSubmittedRef.current = true;
      executeSubmission();
    }
  }, [outcomes]);

  // Aggregate stats
  const totalKanji = outcomes.length;
  const totalAnswers = outcomes.reduce((acc, o) => acc + o.answers.length, 0);
  const correctAnswers = outcomes.reduce(
    (acc, o) => acc + o.answers.filter((a) => a.correct).length,
    0
  );
  const accuracyPercent =
    totalAnswers > 0 ? Math.round((correctAnswers / totalAnswers) * 100) : 100;

  const allResponseTimes = outcomes
    .flatMap((o) => o.answers.map((a) => a.response_ms))
    .filter((t) => t > 0);
  const avgResponseSec =
    allResponseTimes.length > 0
      ? (allResponseTimes.reduce((a, b) => a + b, 0) / allResponseTimes.length / 1000).toFixed(1)
      : '0.0';

  const perfectKanjiCount = outcomes.filter(
    (o) => o.meaning_incorrect === 0 && o.reading_incorrect === 0
  ).length;

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col justify-between select-none animate-fadeIn space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-white/[0.08] flex items-center justify-between">
        <div>
          <span className="text-[11px] uppercase tracking-[0.2em] text-purple-400 font-mono">
            {isCustomReview ? 'Self-Made Review Complete' : 'Review Session Complete'}
          </span>
          <h2
            className="text-3xl font-light text-neutral-100 tracking-tight mt-0.5"
            style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
          >
            Session Performance Summary
          </h2>
        </div>

        <div className="text-right">
          <div className="text-[10px] uppercase font-mono text-neutral-500">Overall Accuracy</div>
          <div className="text-2xl font-mono text-emerald-400 font-medium leading-none mt-0.5">
            {accuracyPercent}%
          </div>
        </div>
      </div>

      {/* Aggregate Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
          <div className="text-[10px] uppercase font-mono text-neutral-500">Total Reviewed</div>
          <div className="text-xl font-mono text-white font-medium mt-1">
            {totalKanji} <span className="text-xs text-neutral-400 font-normal">kanji</span>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
          <div className="text-[10px] uppercase font-mono text-neutral-500">Flawless Recall</div>
          <div className="text-xl font-mono text-purple-300 font-medium mt-1">
            {perfectKanjiCount} <span className="text-xs text-neutral-400 font-normal">/ {totalKanji}</span>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
          <div className="text-[10px] uppercase font-mono text-neutral-500">Average Speed</div>
          <div className="text-xl font-mono text-neutral-200 font-medium mt-1">
            {avgResponseSec}s
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
          <div className="text-[10px] uppercase font-mono text-neutral-500">Total Answers</div>
          <div className="text-xl font-mono text-white font-medium mt-1">
            <span className="text-emerald-400">{correctAnswers}</span> /{' '}
            <span className="text-neutral-400">{totalAnswers}</span>
          </div>
        </div>
      </div>

      {/* Server Submission Status Banner */}
      <div className="rounded-2xl border p-4 transition-all">
        {submissionState === 'loading' && (
          <div className="flex items-center gap-2.5 text-xs text-neutral-300">
            <span className="w-3.5 h-3.5 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
            <span>Submitting review results to server (`/complete` route)...</span>
          </div>
        )}

        {submissionState === 'success' && (
          <div className="flex items-center justify-between text-xs text-emerald-300">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold">✓</span>
              <span>
                {response?.logged_count || outcomes.length} review records successfully synchronized with the backend!
              </span>
            </div>
            <span className="text-[10px] text-neutral-500 font-mono">Server Synced</span>
          </div>
        )}

        {submissionState === 'error' && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-red-300">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold">✕</span>
              <span>{errorMsg || 'Failed to submit review records.'}</span>
            </div>
            <button
              onClick={executeSubmission}
              className="px-3.5 py-1 rounded-full bg-red-950/60 hover:bg-red-900 border border-red-800 text-red-200 text-xs font-medium transition-colors"
            >
              Retry Sync ↻
            </button>
          </div>
        )}
      </div>

      {/* Kanji Review Breakdown List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-[11px] uppercase tracking-wider text-neutral-400 font-mono">
          <span>Kanji Retention Breakdown</span>
          <span>Mistakes & Latency</span>
        </div>

        <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
          {outcomes.map((o) => {
            const { kanji } = o;
            const hasErrors = o.meaning_incorrect > 0 || o.reading_incorrect > 0;

            return (
              <div
                key={kanji.id}
                className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.12] transition-colors flex items-center justify-between gap-3"
              >
                {/* Kanji Character & Meaning */}
                <div className="flex items-center gap-3.5">
                  <div
                    className="w-12 h-12 rounded-xl bg-black/40 border border-white/[0.08] flex items-center justify-center text-2xl font-light text-white"
                    style={{ fontFamily: "'Noto Serif JP', serif" }}
                  >
                    {kanji.character}
                  </div>

                  <div>
                    <div className="text-sm font-medium text-white flex items-center gap-2">
                      <span>{kanji.meanings[0] || kanji.meaning}</span>
                      <span
                        className={`px-2 py-0.5 rounded-full border text-[10px] font-mono ${
                          !hasErrors
                            ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                            : 'bg-amber-950/40 border-amber-500/40 text-amber-300'
                        }`}
                      >
                        {!hasErrors ? 'Flawless' : 'Reviewed with Mistakes'}
                      </span>
                    </div>

                    <div className="text-xs text-neutral-400 font-mono mt-0.5">
                      {[...kanji.onyomi, ...kanji.kunyomi].filter(Boolean).join(' · ')}
                    </div>
                  </div>
                </div>

                {/* Performance stats */}
                <div className="text-right text-xs font-mono">
                  <div className="text-neutral-200">
                    Meaning: <span className={o.meaning_incorrect === 0 ? 'text-emerald-400' : 'text-red-400'}>{o.meaning_incorrect} err</span>
                    {' · '}
                    Reading: <span className={o.reading_incorrect === 0 ? 'text-emerald-400' : 'text-red-400'}>{o.reading_incorrect} err</span>
                  </div>
                  <div className="text-[10px] text-neutral-500 mt-0.5">
                    Median Latency: {(o.response_ms / 1000).toFixed(1)}s
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Return to Dashboard Action */}
      <div className="pt-2">
        <button
          type="button"
          onClick={onFinish}
          className="w-full py-3.5 px-6 rounded-full bg-white hover:bg-neutral-100 text-neutral-950 font-medium text-sm transition-all shadow-xl flex items-center justify-center gap-2"
        >
          <span>Return to Dashboard →</span>
          <span className="text-xs font-mono text-neutral-500">(Enter ↵)</span>
        </button>
      </div>
    </div>
  );
};
