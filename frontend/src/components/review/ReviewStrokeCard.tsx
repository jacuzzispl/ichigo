import React, { useState, useEffect, useRef, useCallback } from 'react';
import { LessonKanji, DrawingStage } from '../../types';
import {
  getKanjiStrokes,
  validateDrawnStroke,
  StrokePoint,
  StrokeDefinition,
} from '../../data/strokeData';
import { soundEffects } from '../../library/audioEffects';

interface ReviewStrokeCardProps {
  kanji: LessonKanji;
  onComplete: (firstTry: boolean, errorCount: number, responseMs: number) => void;
  onExit?: () => void;
}

export const ReviewStrokeCard: React.FC<ReviewStrokeCardProps> = ({
  kanji,
  onComplete,
  onExit,
}) => {
  const strokes: StrokeDefinition[] = getKanjiStrokes(
    kanji.character,
    kanji.stroke_count || 4
  );
  const totalStrokes = strokes.length;

  // Progressive assistance stages:
  // 1st attempt: 'blank' (no guidelines, no dots)
  // 1st error: 'outline' (guidelines, but NO order/dots)
  // 2nd+ error: 'guided' (guidelines AND order/dots)
  const [stage, setStage] = useState<DrawingStage>('blank');
  const [wrongAttemptCount, setWrongAttemptCount] = useState(0);

  const [currentStrokeIndex, setCurrentStrokeIndex] = useState(0);
  const [completedStrokes, setCompletedStrokes] = useState<number[]>([]);
  const [currentPoints, setCurrentPoints] = useState<StrokePoint[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);
  const [isShaking, setIsShaking] = useState(false);
  const [errorStrokePoints, setErrorStrokePoints] = useState<StrokePoint[] | null>(null);

  const svgRef = useRef<SVGSVGElement>(null);
  const pointsRef = useRef<StrokePoint[]>([]);
  const startTimeRef = useRef<number>(Date.now());

  const activeStroke = strokes[currentStrokeIndex];
  const allStrokesFinished = completedStrokes.length >= totalStrokes;

  // Reset when kanji changes
  useEffect(() => {
    setStage('blank');
    setWrongAttemptCount(0);
    setCurrentStrokeIndex(0);
    setCompletedStrokes([]);
    setCurrentPoints([]);
    pointsRef.current = [];
    setIsDrawing(false);
    setFeedbackMsg(null);
    setErrorStrokePoints(null);
    startTimeRef.current = Date.now();
  }, [kanji.id]);

  // Convert client coordinates to 0..109 SVG coordinates (matching KanjiVG viewBox)
  const getCoordinates = (clientX: number, clientY: number): StrokePoint | null => {
    if (!svgRef.current) return null;
    const rect = svgRef.current.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return null;
    const rawX = ((clientX - rect.left) / rect.width) * 109;
    const rawY = ((clientY - rect.top) / rect.height) * 109;
    if (!Number.isFinite(rawX) || !Number.isFinite(rawY)) return null;
    return {
      x: Math.max(0, Math.min(109, Math.round(rawX * 10) / 10)),
      y: Math.max(0, Math.min(109, Math.round(rawY * 10) / 10)),
    };
  };

  // Convert points array to SVG path
  const pointsToSvgPath = (points: StrokePoint[]) => {
    if (!points || points.length === 0) return '';
    const valid = points.filter((p) => p && Number.isFinite(p.x) && Number.isFinite(p.y));
    if (valid.length === 0) return '';
    return `M ${valid.map((p) => `${p.x} ${p.y}`).join(' L ')}`;
  };

  // Process and validate drawn stroke
  const processStroke = useCallback(
    (points: StrokePoint[]) => {
      if (allStrokesFinished || !activeStroke || points.length < 2) {
        setCurrentPoints([]);
        pointsRef.current = [];
        return;
      }

      const validation = validateDrawnStroke(points, activeStroke, stage);

      if (validation.valid) {
        // Stroke success!
        soundEffects.playStrokeSuccess();
        const nextCompleted = [...completedStrokes, currentStrokeIndex];
        setCompletedStrokes(nextCompleted);
        setCurrentPoints([]);
        pointsRef.current = [];
        setFeedbackMsg(null);
        setErrorStrokePoints(null);

        if (nextCompleted.length >= totalStrokes) {
          // Finished all strokes for this kanji!
          soundEffects.playKanjiComplete();
        } else {
          setCurrentStrokeIndex((prev) => prev + 1);
        }
      } else {
        // Validation failed
        soundEffects.playStrokeError();
        const nextErrors = wrongAttemptCount + 1;
        setWrongAttemptCount(nextErrors);
        setErrorStrokePoints(points);
        setIsShaking(true);
        setTimeout(() => setIsShaking(false), 500);

        // Flash error stroke for 600ms then clear
        setTimeout(() => {
          setErrorStrokePoints(null);
        }, 700);

        setCurrentPoints([]);
        pointsRef.current = [];

        // Progressive assistance upgrade:
        if (nextErrors === 1) {
          // Upgrade to 'outline': character outline visible, but no order/dots
          setStage('outline');
          setFeedbackMsg(
            validation.message ||
              'Incorrect stroke. Character outline enabled — draw from memory!'
          );
        } else {
          // Upgrade to 'guided': full stroke order and guide dots enabled
          setStage('guided');
          setFeedbackMsg(
            validation.message ||
              'Incorrect stroke. Stroke order guide dots enabled. Follow the green dot!'
          );
        }
      }
    },
    [allStrokesFinished, activeStroke, stage, completedStrokes, currentStrokeIndex, totalStrokes, wrongAttemptCount]
  );

  // Mouse / Touch Event Handlers
  const handlePointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    if (allStrokesFinished) return;
    const pt = getCoordinates(e.clientX, e.clientY);
    if (!pt) return;

    setIsDrawing(true);
    pointsRef.current = [pt];
    setCurrentPoints([pt]);
    setFeedbackMsg(null);
  };

  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!isDrawing) return;

    const pt = getCoordinates(e.clientX, e.clientY);
    if (!pt) return;

    const pts = pointsRef.current;
    if (pts.length > 0) {
      const last = pts[pts.length - 1];
      const dist = Math.hypot(pt.x - last.x, pt.y - last.y);
      if (dist < 1.5) return;
    }

    const nextPoints = [...pts, pt];
    pointsRef.current = nextPoints;
    setCurrentPoints(nextPoints);
  };

  const handlePointerUp = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const pts = [...pointsRef.current];
    if (pts.length > 1) {
      processStroke(pts);
    }
  };

  const handleFinishContinue = () => {
    const elapsed = Math.max(100, Date.now() - startTimeRef.current);
    const firstTry = wrongAttemptCount === 0;
    onComplete(firstTry, wrongAttemptCount, elapsed);
  };

  // Keyboard Enter to continue when completed
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (allStrokesFinished && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault();
        handleFinishContinue();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [allStrokesFinished]);

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col items-center select-none animate-fadeIn">
      {/* Header with Stage Badge */}
      <div className="w-full flex items-center justify-between pb-3 mb-4 border-b border-white/[0.08]">
        <div className="flex items-center gap-2">
          <span
            className={`text-[11px] font-mono uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
              stage === 'blank'
                ? 'bg-purple-950/40 border-purple-500/50 text-purple-300'
                : stage === 'outline'
                ? 'bg-amber-950/40 border-amber-500/50 text-amber-300'
                : 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300'
            }`}
          >
            {stage === 'blank'
              ? 'Stage 1: Memory Canvas (No Guides)'
              : stage === 'outline'
              ? 'Stage 2: Outline Added (No Order)'
              : 'Stage 3: Full Stroke Order Guided'}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-neutral-300 font-mono font-medium">
            Stroke {Math.min(currentStrokeIndex + 1, totalStrokes)} / {totalStrokes}
          </span>
          {onExit && (
            <button
              onClick={onExit}
              className="text-xs text-neutral-400 hover:text-white px-2 py-0.5 rounded hover:bg-white/[0.04] transition-colors"
            >
              Exit ✕
            </button>
          )}
        </div>
      </div>

      {/* Target Character Info */}
      <div className="text-center mb-4">
        <span className="text-[10px] uppercase font-mono tracking-[0.2em] text-[#d4af37]/90 block">
          Draw Character from Memory
        </span>
        <h3 className="text-xl sm:text-2xl font-light text-white mt-0.5">
          {kanji.meanings[0] || kanji.meaning}
        </h3>
        <p className="text-[11px] text-neutral-400 font-light mt-0.5">
          {stage === 'blank'
            ? 'Recall the kanji strokes on the canvas below.'
            : stage === 'outline'
            ? 'Trace over the character shape.'
            : 'Follow the green start dot for each stroke.'}
        </p>
      </div>

      {/* Calligraphy Canvas */}
      <div
        className={`relative w-72 h-72 sm:w-80 sm:h-80 mx-auto bg-[#0a0a0f] border-2 rounded-2xl shadow-2xl p-2 select-none touch-none cursor-crosshair transition-all ${
          isShaking ? 'border-red-500/80 animate-shake' : 'border-white/[0.12] hover:border-white/20'
        }`}
      >
        <svg
          ref={svgRef}
          viewBox="0 0 109 109"
          className="w-full h-full"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
        >
          {/* Traditional Calligraphy Crosshair Guidelines */}
          <line
            x1="54.5"
            y1="4"
            x2="54.5"
            y2="105"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="0.75"
            strokeDasharray="2,2"
          />
          <line
            x1="4"
            y1="54.5"
            x2="105"
            y2="54.5"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="0.75"
            strokeDasharray="2,2"
          />
          <line
            x1="10"
            y1="10"
            x2="99"
            y2="99"
            stroke="rgba(255,255,255,0.03)"
            strokeWidth="0.5"
            strokeDasharray="3,3"
          />
          <line
            x1="99"
            y1="10"
            x2="10"
            y2="99"
            stroke="rgba(255,255,255,0.03)"
            strokeWidth="0.5"
            strokeDasharray="3,3"
          />

          {/* OUTLINE GUIDE (Only in 'outline' or 'guided' mode) */}
          {(stage === 'outline' || stage === 'guided') && (
            <g className="transition-opacity duration-300">
              {strokes.map((stroke, i) => (
                <path
                  key={`bg-${i}`}
                  d={stroke.path}
                  fill="none"
                  stroke={completedStrokes.includes(i) ? 'transparent' : 'rgba(255,255,255,0.14)'}
                  strokeWidth="7.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              ))}
            </g>
          )}

          {/* COMPLETED STROKES IN RICH CALLIGRAPHY INK */}
          {completedStrokes.map((idx) => {
            const st = strokes[idx];
            if (!st) return null;
            return (
              <path
                key={`completed-${idx}`}
                d={st.path}
                fill="none"
                stroke="#f4f4f5"
                strokeWidth="8"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="animate-fadeIn"
              />
            );
          })}

          {/* ACTIVE GUIDANCE DOTS (Only in 'guided' mode) */}
          {stage === 'guided' && activeStroke && !allStrokesFinished && (() => {
            const hasStart = activeStroke.start && Number.isFinite(activeStroke.start.x) && Number.isFinite(activeStroke.start.y);
            const hasEnd = activeStroke.end && Number.isFinite(activeStroke.end.x) && Number.isFinite(activeStroke.end.y);

            return (
              <g className="animate-fadeIn pointer-events-none">
                {hasStart && hasEnd && (
                  <line
                    x1={activeStroke.start.x}
                    y1={activeStroke.start.y}
                    x2={activeStroke.end.x}
                    y2={activeStroke.end.y}
                    stroke="rgba(16,185,129,0.3)"
                    strokeWidth="1.5"
                    strokeDasharray="2,2"
                  />
                )}
                {hasStart && (
                  <>
                    <circle
                      cx={activeStroke.start.x}
                      cy={activeStroke.start.y}
                      r="4.5"
                      fill="#10b981"
                      className="animate-pulse"
                    />
                    <circle
                      cx={activeStroke.start.x}
                      cy={activeStroke.start.y}
                      r="7"
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="1"
                      opacity="0.6"
                    />
                  </>
                )}
                {hasEnd && (
                  <>
                    <circle
                      cx={activeStroke.end.x}
                      cy={activeStroke.end.y}
                      r="3.8"
                      fill="#f43f5e"
                    />
                    <circle
                      cx={activeStroke.end.x}
                      cy={activeStroke.end.y}
                      r="6"
                      fill="none"
                      stroke="#f43f5e"
                      strokeWidth="1"
                      opacity="0.6"
                    />
                  </>
                )}
              </g>
            );
          })()}

          {/* CURRENT LIVE DRAWN STROKE */}
          {currentPoints.length > 0 && (
            <path
              d={pointsToSvgPath(currentPoints)}
              fill="none"
              stroke="#38bdf8"
              strokeWidth="7"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.9"
            />
          )}

          {/* REJECTED / INVALID ATTEMPT FLASH (Red) */}
          {errorStrokePoints && (
            <path
              d={pointsToSvgPath(errorStrokePoints)}
              fill="none"
              stroke="#ef4444"
              strokeWidth="7.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="animate-pulse"
            />
          )}
        </svg>

        {/* Success Overlay when Kanji is Completed */}
        {allStrokesFinished && (
          <div className="absolute inset-0 bg-black/70 backdrop-blur-xs rounded-2xl flex flex-col items-center justify-center p-4 animate-fadeIn">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center text-emerald-400 text-2xl font-bold mb-2">
              ✓
            </div>
            <div className="text-white font-medium text-sm">Kanji Complete!</div>
            <div className="text-xs text-neutral-400 font-mono mt-0.5">
              All {totalStrokes} strokes verified
            </div>
          </div>
        )}
      </div>

      {/* Feedback Message Bar */}
      {feedbackMsg && (
        <div className="w-full mt-3 p-3 rounded-xl bg-red-950/30 border border-red-500/50 text-red-200 text-xs text-center font-mono animate-fadeIn">
          {feedbackMsg}
        </div>
      )}

      {/* Actions */}
      <div className="w-full mt-4 flex items-center justify-between gap-3">
        {!allStrokesFinished ? (
          <div className="text-[11px] font-mono text-neutral-500 text-center w-full">
            Complete all strokes to proceed
          </div>
        ) : (
          <button
            type="button"
            onClick={handleFinishContinue}
            autoFocus
            className="w-full py-3.5 px-6 rounded-full bg-white hover:bg-neutral-100 text-neutral-950 font-medium text-sm transition-all shadow-xl flex items-center justify-center gap-2"
          >
            <span>Continue</span>
            <span className="text-xs font-mono text-neutral-500">(Enter ↵)</span>
          </button>
        )}
      </div>
    </div>
  );
};
