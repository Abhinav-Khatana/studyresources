import React, { useState, useEffect, useCallback } from "react";
import {
  ChevronDown, ChevronRight, Youtube, ExternalLink, Star,
  Loader2, Code2, BookOpen, CheckSquare, Square,
  RotateCcw, Target, TrendingUp,
} from "lucide-react";
import { dsaApi } from "../lib/api";
import { DSA_SECTIONS, ALL_PROBLEMS, TOTAL_EASY, TOTAL_MEDIUM, TOTAL_HARD } from "../data/dsaProblems";

// ── Config ─────────────────────────────────────────────────────────────────────
const STATUS_ORDER = ["pending", "done", "revision"];
const DIFF_STYLE = {
  Easy:   "text-emerald-400 bg-emerald-500/10 border border-emerald-500/25",
  Medium: "text-amber-400   bg-amber-500/10   border border-amber-500/25",
  Hard:   "text-red-400     bg-red-500/10     border border-red-500/25",
};

function getSectionStats(section, progress) {
  const total    = section.problems.length;
  const done     = section.problems.filter(p => progress[p.id]?.status === "done").length;
  const revision = section.problems.filter(p => progress[p.id]?.status === "revision").length;
  return { total, done, revision, pct: total ? Math.round((done / total) * 100) : 0 };
}

// ── Stat chip ──────────────────────────────────────────────────────────────────
function StatChip({ label, done, total, color }) {
  return (
    <div className="flex flex-col items-center px-4 py-3 rounded-xl border border-surface-border bg-surface-card">
      <span className={`text-2xl font-black ${color}`}>{done}<span className="text-sm font-normal text-gray-600">/{total}</span></span>
      <span className="text-[10px] font-semibold uppercase tracking-widest text-gray-500 mt-0.5">{label}</span>
    </div>
  );
}

// ── Problem Row ────────────────────────────────────────────────────────────────
function ProblemRow({ problem, status = "pending", starred = false, onStatusChange, onStarToggle }) {
  const isDone     = status === "done";
  const isRevision = status === "revision";

  const handleCheck = (e) => {
    e.stopPropagation();
    const next = isDone ? "pending" : "done";
    onStatusChange(problem.id, next);
  };
  const handleRevision = (e) => {
    e.stopPropagation();
    const next = isRevision ? "pending" : "revision";
    onStatusChange(problem.id, next);
  };

  return (
    <div className={`grid items-center px-4 py-2.5 gap-2 group transition-colors
      ${isDone ? "bg-emerald-500/3 hover:bg-emerald-500/5" : isRevision ? "bg-amber-500/3 hover:bg-amber-500/5" : "hover:bg-surface-hover/40"}
    `} style={{ gridTemplateColumns: "2rem 1fr auto auto auto auto auto 5.5rem" }}>

      {/* Checkbox */}
      <button onClick={handleCheck} title={isDone ? "Mark pending" : "Mark done"}
        className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all hover:scale-110 shrink-0
          ${isDone ? "bg-emerald-500 border-emerald-500 text-white" : "border-zinc-600 hover:border-emerald-500"}`}>
        {isDone && <span className="text-[10px] font-black">✓</span>}
      </button>

      {/* Problem title */}
      <span className={`text-sm font-medium truncate pr-2 transition-colors
        ${isDone ? "text-gray-500 line-through decoration-gray-600" : "text-gray-200 group-hover:text-white"}`}>
        {problem.title}
      </span>

      {/* YouTube */}
      <a href={problem.yt} target="_blank" rel="noreferrer" title="Watch on YouTube"
        className="flex items-center justify-center w-7 h-7 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/25 hover:scale-110 transition-all shrink-0">
        <Youtube size={13} />
      </a>

      {/* LeetCode */}
      {problem.lc ? (
        <a href={problem.lc} target="_blank" rel="noreferrer" title="Solve on LeetCode"
          className="flex items-center justify-center w-7 h-7 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-400 hover:bg-orange-500/25 hover:scale-110 transition-all shrink-0">
          <span className="text-[9px] font-extrabold">LC</span>
        </a>
      ) : (
        <div className="w-7 h-7 shrink-0" />
      )}

      {/* GFG */}
      <a href={problem.gfg} target="_blank" rel="noreferrer" title="Read on GeeksForGeeks"
        className="flex items-center justify-center w-7 h-7 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 hover:bg-green-500/25 hover:scale-110 transition-all shrink-0">
        <span className="text-[9px] font-extrabold">GFG</span>
      </a>

      {/* Revision flag */}
      <button onClick={handleRevision} title={isRevision ? "Remove revision flag" : "Flag for revision"}
        className={`flex items-center justify-center w-7 h-7 rounded-lg border transition-all hover:scale-110 shrink-0
          ${isRevision ? "bg-amber-500/20 border-amber-500/30 text-amber-400" : "border-surface-border text-gray-600 hover:text-amber-400 hover:border-amber-500/30"}`}>
        <RotateCcw size={11} />
      </button>

      {/* Star */}
      <button onClick={() => onStarToggle(problem.id, !starred)} title={starred ? "Unstar" : "Star this problem"}
        className={`flex items-center justify-center w-7 h-7 rounded-lg border transition-all hover:scale-110 shrink-0
          ${starred ? "bg-yellow-500/20 border-yellow-500/30 text-yellow-400" : "border-surface-border text-gray-600 hover:text-yellow-400 hover:border-yellow-500/30"}`}>
        <Star size={11} className={starred ? "fill-yellow-400" : ""} />
      </button>

      {/* Difficulty */}
      <span className={`text-[11px] px-2 py-0.5 rounded-full font-semibold text-center shrink-0 ${DIFF_STYLE[problem.difficulty] || DIFF_STYLE.Medium}`}>
        {problem.difficulty}
      </span>
    </div>
  );
}

// ── Section Card ───────────────────────────────────────────────────────────────
function SectionCard({ section, progress, onStatusChange, onStarToggle }) {
  const [expanded, setExpanded] = useState(false);
  const stats = getSectionStats(section, progress);

  return (
    <div className="border border-surface-border rounded-xl overflow-hidden">
      {/* Section header */}
      <button onClick={() => setExpanded(v => !v)}
        className="w-full flex items-center gap-3 px-4 py-3 bg-surface-card hover:bg-surface-hover transition-colors text-left">
        {expanded ? <ChevronDown size={16} className="text-gray-500 shrink-0" /> : <ChevronRight size={16} className="text-gray-500 shrink-0" />}
        <span className="font-semibold text-white text-sm flex-1 truncate pr-2">{section.title}</span>

        {/* Progress bar */}
        <div className="hidden sm:flex items-center gap-3 shrink-0">
          <div className="w-32 h-1.5 bg-surface rounded-full overflow-hidden">
            <div className={`h-full rounded-full transition-all duration-500 ${stats.pct === 100 ? "bg-emerald-500" : "bg-gradient-to-r from-amber-600 to-amber-400"}`}
              style={{ width: `${stats.pct}%` }} />
          </div>
          <span className="text-xs text-gray-400 font-mono w-12 text-right">{stats.done} / {stats.total}</span>
        </div>
      </button>

      {/* Problems table */}
      {expanded && (
        <>
          {/* Column headers */}
          <div className="hidden md:grid gap-2 px-4 py-2 text-[10px] font-semibold text-gray-600 uppercase tracking-widest border-t border-b border-surface-border bg-surface/50"
            style={{ gridTemplateColumns: "2rem 1fr auto auto auto auto auto 5.5rem" }}>
            <span>Done</span>
            <span>Problem</span>
            <span className="text-red-500">▶ YT</span>
            <span className="text-orange-500 w-7 text-center">LC</span>
            <span className="text-green-500 w-7 text-center">GFG</span>
            <span className="w-7 text-center">↺</span>
            <span className="w-7 text-center">★</span>
            <span className="text-center">Difficulty</span>
          </div>
          <div className="divide-y divide-surface-border/60">
            {section.problems.map(problem => (
              <ProblemRow
                key={problem.id}
                problem={problem}
                status={progress[problem.id]?.status || "pending"}
                starred={progress[problem.id]?.starred || false}
                onStatusChange={onStatusChange}
                onStarToggle={onStarToggle}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function DSAPrepPage() {
  const [progress,  setProgress]  = useState({});
  const [loading,   setLoading]   = useState(true);

  // Load progress from backend
  useEffect(() => {
    dsaApi.getProgress()
      .then(res => setProgress(res.data || {}))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const onStatusChange = useCallback(async (problemId, status) => {
    setProgress(prev => ({ ...prev, [problemId]: { ...(prev[problemId] || {}), status } }));
    try { await dsaApi.updateProgress(problemId, { status }); } catch {}
  }, []);

  const onStarToggle = useCallback(async (problemId, starred) => {
    setProgress(prev => ({ ...prev, [problemId]: { ...(prev[problemId] || {}), starred } }));
    try { await dsaApi.updateProgress(problemId, { starred }); } catch {}
  }, []);

  // Overall stats
  const doneProbIds   = Object.entries(progress).filter(([, v]) => v.status === "done").map(([k]) => k);
  const doneEasy      = doneProbIds.filter(id => ALL_PROBLEMS.find(p => p.id === id)?.difficulty === "Easy").length;
  const doneMedium    = doneProbIds.filter(id => ALL_PROBLEMS.find(p => p.id === id)?.difficulty === "Medium").length;
  const doneHard      = doneProbIds.filter(id => ALL_PROBLEMS.find(p => p.id === id)?.difficulty === "Hard").length;
  const totalDone     = doneProbIds.length;
  const totalProbs    = ALL_PROBLEMS.length;
  const pct           = totalProbs ? Math.round((totalDone / totalProbs) * 100) : 0;

  return (
    <div className="flex flex-col gap-5 animate-slide-up max-w-5xl mx-auto">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="section-label">DSA Prep</p>
          <h1 className="text-3xl font-black text-white mt-1 flex items-center gap-3">
            <Code2 size={28} className="text-amber-400" />
            DSA Sheet
          </h1>
          <p className="text-gray-400 text-sm mt-1.5">
            {totalProbs} curated problems · Direct YouTube, LeetCode & GFG links · Progress saved automatically
          </p>
        </div>

        {/* Overall progress bar */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="text-right">
            <p className="text-2xl font-black text-white">{totalDone}<span className="text-gray-600 text-sm font-normal">/{totalProbs}</span></p>
            <p className="text-xs text-gray-500">{pct}% complete</p>
          </div>
          <div className="w-2 h-16 bg-surface rounded-full overflow-hidden flex flex-col-reverse">
            <div className="w-full rounded-full bg-gradient-to-t from-amber-600 to-amber-400 transition-all duration-700"
              style={{ height: `${pct}%` }} />
          </div>
        </div>
      </div>

      {/* ── Stats row ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-3">
        <StatChip label="Easy"   done={doneEasy}   total={TOTAL_EASY}   color="text-emerald-400" />
        <StatChip label="Medium" done={doneMedium}  total={TOTAL_MEDIUM} color="text-amber-400"   />
        <StatChip label="Hard"   done={doneHard}    total={TOTAL_HARD}   color="text-red-400"     />
      </div>

      {/* ── Overall progress bar full width ─────────────────────────────────── */}
      <div>
        <div className="flex justify-between text-xs text-gray-500 mb-1.5">
          <span>Overall Progress</span>
          <span className="font-mono">{totalDone} / {totalProbs} problems solved</span>
        </div>
        <div className="h-2.5 bg-surface rounded-full overflow-hidden border border-surface-border">
          <div className={`h-full rounded-full transition-all duration-700 ${pct===100 ? "bg-emerald-500" : "bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-400"}`}
            style={{ width: `${pct}%` }} />
        </div>
      </div>

      {/* ── Legend ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-4 text-xs text-gray-500">
        {[
          { color: "bg-red-500/80",    label: "▶ YT — Direct YouTube video" },
          { color: "bg-orange-500/80", label: "LC — LeetCode problem" },
          { color: "bg-green-500/80",  label: "GFG — GeeksForGeeks article" },
          { color: "bg-amber-500/80",  label: "↺ — Flag for revision" },
          { color: "bg-yellow-500/80", label: "★ — Starred" },
        ].map(({ color, label }) => (
          <span key={label} className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${color}`} />
            {label}
          </span>
        ))}
      </div>

      {/* ── Loading state ───────────────────────────────────────────────────── */}
      {loading && (
        <div className="flex items-center justify-center h-40">
          <Loader2 size={28} className="animate-spin text-amber-400" />
        </div>
      )}

      {/* ── Section cards ───────────────────────────────────────────────────── */}
      {!loading && (
        <div className="flex flex-col gap-3">
          {DSA_SECTIONS.map(section => (
            <SectionCard
              key={section.id}
              section={section}
              progress={progress}
              onStatusChange={onStatusChange}
              onStarToggle={onStarToggle}
            />
          ))}
        </div>
      )}

      {/* ── Footer tip ─────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-brand-500/20 bg-brand-500/5 text-sm text-brand-300">
        <TrendingUp size={16} className="shrink-0 text-brand-400" />
        <p>Tip: Aim for 1-2 Medium problems per day. Consistency beats cramming. Your progress auto-saves to the cloud.</p>
      </div>
    </div>
  );
}
