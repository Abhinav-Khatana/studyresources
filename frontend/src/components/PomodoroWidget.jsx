import React from "react";
import { usePomodoro } from "../context/PomodoroContext";
import { Play, Pause, RotateCcw, X, Minus } from "lucide-react";

export default function PomodoroWidget() {
  const {
    mode, modes, switchMode,
    minutes, seconds, progress, running,
    sessions, start, pause, reset,
    minimized, setMinimized, setVisible,
  } = usePomodoro();

  const pad    = (n) => String(n).padStart(2, "0");
  const modeColor = modes[mode].color;

  // SVG circle progress
  const r          = 36;
  const circ       = 2 * Math.PI * r;
  const dashOffset = circ * (1 - progress);

  if (minimized) {
    return (
      <div
        onClick={() => setMinimized(false)}
        className="fixed bottom-6 right-6 z-50 bg-surface-card border border-surface-border rounded-full px-4 py-2 flex items-center gap-2 cursor-pointer hover:border-brand-500 transition-all shadow-xl"
      >
        <div className={`w-2 h-2 rounded-full ${running ? "bg-green-400 animate-pulse" : "bg-gray-500"}`} />
        <span className={`font-mono text-sm font-bold ${modeColor}`}>{pad(minutes)}:{pad(seconds)}</span>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 bg-surface-card border border-surface-border rounded-2xl p-5 w-64 shadow-2xl animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Pomodoro</span>
        <div className="flex items-center gap-1">
          <button onClick={() => setMinimized(true)} className="p-1 text-gray-500 hover:text-white transition-colors">
            <Minus size={14} />
          </button>
          <button onClick={() => setVisible(false)} className="p-1 text-gray-500 hover:text-white transition-colors">
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Mode tabs */}
      <div className="flex gap-1 bg-surface rounded-lg p-1 mb-5">
        {Object.entries(modes).map(([key, val]) => (
          <button key={key} onClick={() => switchMode(key)}
            className={`flex-1 py-1 rounded-md text-[11px] font-medium transition-all
              ${mode === key ? "bg-brand-600/30 text-brand-300" : "text-gray-500 hover:text-gray-300"}`}>
            {key === "shortBreak" ? "Short" : key === "longBreak" ? "Long" : "Focus"}
          </button>
        ))}
      </div>

      {/* Timer circle */}
      <div className="flex items-center justify-center mb-5">
        <div className="relative">
          <svg width="100" height="100" className="-rotate-90">
            <circle cx="50" cy="50" r={r} fill="none" stroke="#2a2a38" strokeWidth="5" />
            <circle cx="50" cy="50" r={r} fill="none"
              stroke={mode === "focus" ? "#7c3aed" : mode === "shortBreak" ? "#22c55e" : "#3b82f6"}
              strokeWidth="5" strokeLinecap="round"
              strokeDasharray={circ} strokeDashoffset={dashOffset}
              style={{ transition: "stroke-dashoffset 1s linear" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`font-mono text-xl font-bold ${modeColor}`}>{pad(minutes)}:{pad(seconds)}</span>
            <span className="text-[10px] text-gray-500 mt-0.5">{modes[mode].label}</span>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-3 mb-4">
        <button onClick={reset} className="p-2 text-gray-500 hover:text-white hover:bg-surface-hover rounded-lg transition-all">
          <RotateCcw size={16} />
        </button>
        <button
          onClick={running ? pause : start}
          className={`px-6 py-2 rounded-xl font-semibold text-sm flex items-center gap-2 transition-all
            ${running
              ? "bg-surface-hover border border-surface-border text-white hover:border-gray-500"
              : "bg-brand-600 hover:bg-brand-500 text-white"}`}
        >
          {running ? <><Pause size={14} /> Pause</> : <><Play size={14} /> Start</>}
        </button>
      </div>

      {/* Sessions counter */}
      <div className="flex items-center justify-center gap-1.5">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className={`w-2.5 h-2.5 rounded-full transition-all ${i < (sessions % 4) ? "bg-brand-500" : "bg-surface-border"}`} />
        ))}
        <span className="text-xs text-gray-500 ml-2">{sessions} sessions</span>
      </div>
      <p className="text-center text-[10px] text-gray-600 mt-2">Auto-logs time on completion ✓</p>
    </div>
  );
}
