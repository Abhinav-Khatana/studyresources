import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from "react";
import { progressApi } from "../lib/api";

const PomodoroContext = createContext(null);

const MODES = {
  focus:      { label: "Focus",       minutes: 25, color: "text-brand-400"  },
  shortBreak: { label: "Short Break", minutes: 5,  color: "text-green-400"  },
  longBreak:  { label: "Long Break",  minutes: 15, color: "text-blue-400"   },
};

export function PomodoroProvider({ children }) {
  const [mode, setMode]           = useState("focus");
  const [secondsLeft, setSeconds] = useState(MODES.focus.minutes * 60);
  const [running, setRunning]     = useState(false);
  const [sessions, setSessions]   = useState(0);   // completed focus sessions
  const [minimized, setMinimized] = useState(false);
  const [visible, setVisible]     = useState(false);
  const intervalRef               = useRef(null);
  const sessionStartRef           = useRef(null);   // track when focus session started

  // Clear interval on unmount
  useEffect(() => () => clearInterval(intervalRef.current), []);

  // Countdown tick
  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSeconds((s) => {
          if (s <= 1) {
            clearInterval(intervalRef.current);
            handleTimerEnd();
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [running, mode]);

  const handleTimerEnd = useCallback(async () => {
    setRunning(false);
    if (mode === "focus") {
      setSessions((s) => s + 1);
      // Auto-log the focus session minutes
      try {
        await progressApi.log(MODES.focus.minutes);
      } catch {}
    }
    // Play a simple beep using Web Audio API
    try {
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 880;
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.8);
    } catch {}
  }, [mode]);

  const start  = () => { sessionStartRef.current = Date.now(); setRunning(true); };
  const pause  = () => setRunning(false);
  const reset  = () => { setRunning(false); setSeconds(MODES[mode].minutes * 60); };

  const switchMode = (newMode) => {
    setRunning(false);
    setMode(newMode);
    setSeconds(MODES[newMode].minutes * 60);
  };

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const progress = 1 - secondsLeft / (MODES[mode].minutes * 60);

  return (
    <PomodoroContext.Provider value={{
      mode, modes: MODES, switchMode,
      minutes, seconds, progress, running,
      sessions, start, pause, reset,
      minimized, setMinimized,
      visible, setVisible,
    }}>
      {children}
    </PomodoroContext.Provider>
  );
}

export const usePomodoro = () => {
  const ctx = useContext(PomodoroContext);
  if (!ctx) throw new Error("usePomodoro must be inside PomodoroProvider");
  return ctx;
};
