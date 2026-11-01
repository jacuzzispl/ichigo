import React, { useState, useEffect, useRef, useCallback } from "react";
import { QuizQuestion, DrawingStage } from "../../../types";
import {
  getKanjiStrokes,
  validateDrawnStroke,
  StrokePoint,
  StrokeDefinition,
} from "../../../data/strokeData";
import { soundEffects } from "../../../library/audioEffects";

interface StrokeDrawingCardProps {
  question: QuizQuestion;
  isAnswered: boolean;
  onSubmitAnswer: (correct: boolean, inputSummary: string) => void;
  onContinue: () => void;
}

export const StrokeDrawingCard: React.FC<StrokeDrawingCardProps> = ({
  question,
  isAnswered,
  onSubmitAnswer,
  onContinue,
}) => {
  const { kanji } = question;
  const stage: DrawingStage = question.drawingStage || "guided";

  const strokes: StrokeDefinition[] = getKanjiStrokes(
    kanji.character,
    kanji.stroke_count,
  );
  const totalStrokes = strokes.length;

  const [currentStrokeIndex, setCurrentStrokeIndex] = useState(0);
  const [completedStrokes, setCompletedStrokes] = useState<number[]>([]);
  const [currentPoints, setCurrentPoints] = useState<StrokePoint[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isKeyDrawActive, setIsKeyDrawActive] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);
  const [isShaking, setIsShaking] = useState(false);
  const [errorStrokePoints, setErrorStrokePoints] = useState<
    StrokePoint[] | null
  >(null);
  const [revealedHint, setRevealedHint] = useState(false);
  const [wrongAttemptCount, setWrongAttemptCount] = useState(0);

  const svgRef = useRef<SVGSVGElement>(null);
  const cursorInsideRef = useRef(false);
  const pointsRef = useRef<StrokePoint[]>([]);

  const activeStroke = strokes[currentStrokeIndex];
  const allStrokesFinished = completedStrokes.length >= totalStrokes;

  // Reset state on question change
  useEffect(() => {
    setCurrentStrokeIndex(0);
    setCompletedStrokes([]);
    setCurrentPoints([]);
    pointsRef.current = [];
    setIsDrawing(false);
    setIsKeyDrawActive(false);
    setFeedbackMsg(null);
    setErrorStrokePoints(null);
    setRevealedHint(false);
    setWrongAttemptCount(0);
  }, [question.id]);

  // Convert client coordinates to 0..109 SVG coordinates (matching KanjiVG viewBox)
  const getCoordinates = (
    clientX: number,
    clientY: number,
  ): StrokePoint | null => {
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
        // Success!
        soundEffects.playStrokeSuccess();
        const nextCompleted = [...completedStrokes, currentStrokeIndex];
        setCompletedStrokes(nextCompleted);
        setCurrentPoints([]);
        pointsRef.current = [];
        setFeedbackMsg(null);
        setErrorStrokePoints(null);

        if (nextCompleted.length >= totalStrokes) {
          // Finished all strokes for this kanji
          soundEffects.playKanjiComplete();
          const isFirstTry = wrongAttemptCount === 0;
          onSubmitAnswer(
            isFirstTry,
            `Completed all ${totalStrokes} strokes in ${stage} mode`,
          );
        } else {
          setCurrentStrokeIndex((prev) => prev + 1);
        }
      } else {
        // Validation failed
        soundEffects.playStrokeError();
        setWrongAttemptCount((prev) => prev + 1);
        setErrorStrokePoints(points);
        setFeedbackMsg(validation.message || "Incorrect stroke. Try again.");
        setIsShaking(true);
        setTimeout(() => setIsShaking(false), 500);

        // Flash error stroke for 600ms then clear
        setTimeout(() => {
          setErrorStrokePoints(null);
        }, 700);

        setCurrentPoints([]);
        pointsRef.current = [];
      }
    },
    [
      allStrokesFinished,
      activeStroke,
      stage,
      completedStrokes,
      currentStrokeIndex,
      totalStrokes,
      wrongAttemptCount,
      onSubmitAnswer,
    ],
  );

  // Laptop Trackpad: Listen for Spacebar or 'd' / 'D' keys to draw!
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (allStrokesFinished || isAnswered) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onContinue();
        }
        return;
      }

      // If user holds Space or 'd'/'D' while cursor is inside canvas
      if (e.code === "Space" || e.key.toLowerCase() === "d") {
        if (!isKeyDrawActive && cursorInsideRef.current) {
          e.preventDefault();
          setIsKeyDrawActive(true);
          setIsDrawing(true);
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.key.toLowerCase() === "d") {
        if (isKeyDrawActive) {
          setIsKeyDrawActive(false);
          setIsDrawing(false);
          const pts = [...pointsRef.current];
          if (pts.length > 1) {
            processStroke(pts);
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [
    allStrokesFinished,
    isAnswered,
    isKeyDrawActive,
    onContinue,
    processStroke,
  ]);

  // Mouse / Touch Event Handlers
  const handlePointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    if (allStrokesFinished || isAnswered) return;
    const pt = getCoordinates(e.clientX, e.clientY);
    if (!pt) return;

    setIsDrawing(true);
    pointsRef.current = [pt];
    setCurrentPoints([pt]);
    setFeedbackMsg(null);
  };

  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    cursorInsideRef.current = true;
    if (!isDrawing && !isKeyDrawActive) return;

    const pt = getCoordinates(e.clientX, e.clientY);
    if (!pt) return;

    const pts = pointsRef.current;
    if (pts.length > 0) {
      const last = pts[pts.length - 1];
      const dist = Math.hypot(pt.x - last.x, pt.y - last.y);
      if (dist < 1.5) return; // avoid duplicate points
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

  const handlePointerLeave = () => {
    cursorInsideRef.current = false;
    if (isDrawing && !isKeyDrawActive) {
      setIsDrawing(false);
      const pts = [...pointsRef.current];
      if (pts.length > 1) {
        processStroke(pts);
      }
    }
  };

  // Convert points array to SVG path safely
  const pointsToSvgPath = (points: StrokePoint[]) => {
    if (!points || points.length === 0) return "";
    const valid = points.filter(
      (p) => p && Number.isFinite(p.x) && Number.isFinite(p.y),
    );
    if (valid.length === 0) return "";
    return `M ${valid.map((p) => `${p.x} ${p.y}`).join(" L ")}`;
  };

  // Determine stage title & description
  const stageLabels: Record<DrawingStage, { title: string; desc: string }> = {
    guided: {
      title: "Stage 1: Guided Tracing",
      desc: "Follow the starting green dot to the ending red dot for each stroke.",
    },
    outline: {
      title: "Stage 2: Outline Practice",
      desc: "Trace the character outline from memory — no guide dots.",
    },
    blank: {
      title: "Stage 3: Memory Canvas",
      desc: "Draw the character completely from memory onto a blank grid.",
    },
  };

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col items-center select-none animate-fadeIn">
      {/* Header with Stage Badge */}
      <div className="w-full flex items-center justify-between pb-3 mb-4 border-b border-white/[0.08]">
        <div className="flex items-center gap-2">
          <span
            className={`text-[11px] font-mono uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
              stage === "guided"
                ? "bg-emerald-950/40 border-emerald-600/50 text-emerald-300"
                : stage === "outline"
                  ? "bg-amber-950/40 border-amber-600/50 text-amber-300"
                  : "bg-purple-950/40 border-purple-600/50 text-purple-300"
            }`}
          >
            {stageLabels[stage].title}
          </span>
          <span className="text-xs text-neutral-400 font-mono">
            {kanji.meanings[0]} ({kanji.stroke_count} strokes)
          </span>
        </div>

        {/* Progress indicator of strokes */}
        <div className="text-xs font-mono text-neutral-300">
          Stroke{" "}
          <span className="text-white font-bold">
            {allStrokesFinished ? totalStrokes : currentStrokeIndex + 1}
          </span>{" "}
          / {totalStrokes}
        </div>
      </div>

      {/* Instruction & Input Mode Helper */}
      <div className="w-full text-center mb-3">
        <p className="text-xs sm:text-sm text-neutral-300 font-light">
          {allStrokesFinished
            ? "All strokes drawn successfully!"
            : activeStroke
              ? activeStroke.hint
              : stageLabels[stage].desc}
        </p>

        {/* Laptop trackpad helper banner */}
        <div className="mt-1.5 flex items-center justify-center gap-2 text-[11px] font-mono text-neutral-400">
          <span
            className={`px-2 py-0.5 rounded transition-colors ${
              isKeyDrawActive
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 animate-pulse"
                : "bg-white/[0.03] text-neutral-400 border border-white/[0.06]"
            }`}
          >
            {isKeyDrawActive
              ? "✍️ Inking with Key..."
              : "Mouse drag or hold [Space] / [D] to draw"}
          </span>
        </div>
      </div>

      {/* Calligraphy Canvas */}
      <div
        className={`relative w-72 h-72 sm:w-80 sm:h-80 mx-auto bg-[#0a0a0f] border-2 rounded-2xl shadow-2xl p-2 select-none touch-none cursor-crosshair transition-all ${
          isShaking
            ? "border-red-500/80 animate-shake"
            : "border-white/[0.12] hover:border-white/20"
        }`}
      >
        <svg
          ref={svgRef}
          viewBox="0 0 109 109"
          className="w-full h-full"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerLeave}
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

          {/* BACKGROUND GUIDE (Only in 'guided' or 'outline' mode, or when hint is revealed) */}
          {(stage === "guided" || stage === "outline" || revealedHint) && (
            <g className="transition-opacity duration-300">
              {strokes.map((stroke, i) => (
                <path
                  key={`bg-${i}`}
                  d={stroke.path}
                  fill="none"
                  stroke={
                    completedStrokes.includes(i)
                      ? "transparent"
                      : "rgba(255,255,255,0.14)"
                  }
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

          {/* ACTIVE GUIDANCE DOTS (Only in 'guided' mode or if hint revealed) */}
          {(stage === "guided" || revealedHint) &&
            activeStroke &&
            !allStrokesFinished &&
            (() => {
              const hasStart =
                activeStroke.start &&
                Number.isFinite(activeStroke.start.x) &&
                Number.isFinite(activeStroke.start.y);
              const hasEnd =
                activeStroke.end &&
                Number.isFinite(activeStroke.end.x) &&
                Number.isFinite(activeStroke.end.y);

              return (
                <g className="animate-fadeIn pointer-events-none">
                  {/* Subtle directional connector line */}
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

                  {/* Start Dot: Green with pulsing halo */}
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

                  {/* End Dot: Crimson/Pink with ring */}
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
            <div className="text-white font-medium text-sm">
              Kanji Complete!
            </div>
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

      {/* Control Buttons */}
      <div className="w-full flex items-center justify-between gap-3 mt-4">
        {/* Reset / Undo Attempt */}
        {!allStrokesFinished && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setCurrentPoints([]);
                pointsRef.current = [];
                setFeedbackMsg(null);
              }}
              className="px-3 py-1.5 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.08] text-xs font-mono text-neutral-400 hover:text-white transition-all"
            >
              Clear Current
            </button>

            {stage !== "guided" && (
              <button
                type="button"
                onClick={() => setRevealedHint((prev) => !prev)}
                className="px-3 py-1.5 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.08] text-xs font-mono text-amber-300 hover:text-amber-200 transition-all"
              >
                {revealedHint ? "Hide Hint" : "Show Hint"}
              </button>
            )}
          </div>
        )}

        {/* Finished / Continue Button */}
        {allStrokesFinished && (
          <button
            type="button"
            onClick={onContinue}
            autoFocus
            className="w-full py-3 rounded-full bg-neutral-100 hover:bg-white text-neutral-950 text-sm font-semibold transition-all shadow-lg flex items-center justify-center gap-2"
          >
            <span>Continue</span>
            <span className="text-xs font-mono text-neutral-500">
              (Enter ↵)
            </span>
          </button>
        )}
      </div>
    </div>
  );
};
