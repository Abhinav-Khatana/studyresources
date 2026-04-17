import React, { useState, useEffect, useCallback } from "react";
import {
  ChevronDown, ChevronRight, Star, MessageSquare, Plus,
  Loader2, Trash2, ClipboardPaste, Sparkles, X,
  ListChecks, RotateCcw, Youtube, Code2, ExternalLink,
  ChevronDown as KeyChev, BookOpen, TrendingUp,
} from "lucide-react";
import { syllabusApi } from "../lib/api";

// ── Status config ──────────────────────────────────────────────────────────────
const STATUS_ORDER  = ["pending", "done", "revision"];
const STATUS_CONFIG = {
  done:     { label: "Done",     icon: "✓", bg: "bg-emerald-500",              border: "border-emerald-500",       text: "text-white"        },
  revision: { label: "Revision", icon: "↺", bg: "bg-amber-500/20",             border: "border-amber-500/50",      text: "text-amber-400"    },
  pending:  { label: "Pending",  icon: "",  bg: "bg-surface",                   border: "border-zinc-700",          text: "text-transparent"  },
};
const DIFF_STYLE = {
  Easy:   "text-emerald-400 bg-emerald-500/10 border border-emerald-500/25",
  Medium: "text-amber-400   bg-amber-500/10   border border-amber-500/25",
  Hard:   "text-red-400     bg-red-500/10     border border-red-500/25",
};

// ── URL builders — handles both new (direct URL) and old (query) format ────────
function buildYtUrl(topic) {
  if (topic.yt_url)    return topic.yt_url;
  if (topic.yt_query)  return `https://www.youtube.com/results?search_query=${encodeURIComponent(topic.yt_query)}`;
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(topic.title + " explained")}`;
}
function buildGfgUrl(topic) {
  if (topic.gfg_url)      return topic.gfg_url;
  if (topic.notes_query)  return `https://www.google.com/search?q=${encodeURIComponent(topic.notes_query)}`;
  return `https://www.geeksforgeeks.org/search/?q=${encodeURIComponent(topic.title)}`;
}
function buildLcUrl(topic) {
  if (topic.lc_url === null)  return null;   // explicitly null → no LC problem
  if (topic.lc_url)           return topic.lc_url;
  if (topic.practice_platform === "leetcode") return `https://leetcode.com/search/?q=${encodeURIComponent(topic.title)}`;
  if (topic.practice_platform === "gfg")      return null; // already shown in GFG col
  return null;
}

// ── Stats helpers ──────────────────────────────────────────────────────────────
function getSectionStats(section, topicStatuses) {
  const total    = (section.topics || []).length;
  const done     = (section.topics || []).filter(t => topicStatuses[t.id]?.status === "done").length;
  const revision = (section.topics || []).filter(t => topicStatuses[t.id]?.status === "revision").length;
  return { total, done, revision, pct: total ? Math.round((done / total) * 100) : 0 };
}
function getOverallStats(sheet, topicStatuses) {
  if (!sheet?.sheet_data?.sections) return { total: 0, done: 0, revision: 0, pct: 0, easy: 0, medium: 0, hard: 0, doneEasy: 0, doneMedium: 0, doneHard: 0 };
  const all   = sheet.sheet_data.sections.flatMap(s => s.topics || []);
  const total = all.length;
  const done  = all.filter(t => topicStatuses[t.id]?.status === "done").length;
  const revision = all.filter(t => topicStatuses[t.id]?.status === "revision").length;
  const easy  = all.filter(t => (t.difficulty || "Medium") === "Easy").length;
  const medium = all.filter(t => (t.difficulty || "Medium") === "Medium").length;
  const hard  = all.filter(t => (t.difficulty || "Medium") === "Hard").length;
  const doneEasy   = all.filter(t => topicStatuses[t.id]?.status === "done" && t.difficulty === "Easy").length;
  const doneMedium = all.filter(t => topicStatuses[t.id]?.status === "done" && t.difficulty === "Medium").length;
  const doneHard   = all.filter(t => topicStatuses[t.id]?.status === "done" && t.difficulty === "Hard").length;
  return { total, done, revision, pct: total ? Math.round((done / total) * 100) : 0, easy, medium, hard, doneEasy, doneMedium, doneHard };
}

// ── Topic Row ──────────────────────────────────────────────────────────────────
function TopicRow({ topic, status, starred, note, onCycleStatus, onToggleStar, onOpenNote }) {
  const [showPoints, setShowPoints] = useState(false);
  const conf    = STATUS_CONFIG[status || "pending"];
  const ytUrl   = buildYtUrl(topic);
  const gfgUrl  = buildGfgUrl(topic);
  const lcUrl   = buildLcUrl(topic);
  const keyPts  = Array.isArray(topic.key_points) ? topic.key_points : [];
  const hasPoints = keyPts.length > 0;
  const isDone  = status === "done";

  return (
    <>
      <div className={`grid items-center gap-2 px-4 py-2.5 group transition-colors
        ${isDone ? "bg-emerald-500/3 hover:bg-emerald-500/5" : "hover:bg-surface-hover/40"}`}
        style={{ gridTemplateColumns: "1.8rem 1fr 1.8rem 1.8rem 1.8rem 1.8rem 1.8rem 5.5rem" }}>

        {/* 1. Status checkbox */}
        <button onClick={() => onCycleStatus(topic.id)} title={`${conf.label} — click to cycle`}
          className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all hover:scale-110 shrink-0
            ${conf.bg} ${conf.border} ${conf.text}`}>
          <span className="text-[10px] font-black">{conf.icon}</span>
        </button>

        {/* 2. Topic name + key point toggle */}
        <div className="min-w-0">
          <button onClick={() => hasPoints && setShowPoints(v => !v)}
            className={`flex items-center gap-1 text-left w-full group/title ${hasPoints ? "cursor-pointer" : "cursor-default"}`}>
            <span className={`text-sm font-medium leading-snug transition-colors
              ${isDone ? "text-gray-500 line-through decoration-gray-600" : "text-gray-200 group-hover/title:text-white"}`}>
              {topic.title}
            </span>
            {note && <span className="ml-1 text-[10px] text-brand-400/70 shrink-0">📝</span>}
            {hasPoints && (
              <KeyChev size={12} className={`text-gray-600 shrink-0 transition-transform ${showPoints ? "rotate-180" : ""}`} />
            )}
          </button>
        </div>

        {/* 3. YouTube */}
        <a href={ytUrl} target="_blank" rel="noreferrer" title="Watch video"
          className="flex items-center justify-center w-6 h-6 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/25 hover:scale-110 transition-all shrink-0">
          <Youtube size={11} />
        </a>

        {/* 4. LeetCode */}
        {lcUrl ? (
          <a href={lcUrl} target="_blank" rel="noreferrer" title="Solve on LeetCode"
            className="flex items-center justify-center w-6 h-6 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-400 hover:bg-orange-500/25 hover:scale-110 transition-all shrink-0">
            <span className="text-[8px] font-black">LC</span>
          </a>
        ) : <div className="w-6 h-6 shrink-0" />}

        {/* 5. GFG */}
        <a href={gfgUrl} target="_blank" rel="noreferrer" title="Read on GeeksForGeeks"
          className="flex items-center justify-center w-6 h-6 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 hover:bg-green-500/25 hover:scale-110 transition-all shrink-0">
          <span className="text-[8px] font-black">GFG</span>
        </a>

        {/* 6. Note */}
        <button onClick={() => onOpenNote(topic.id, note)} title={note ? "Edit note" : "Add note"}
          className={`flex items-center justify-center w-6 h-6 rounded-lg border transition-all hover:scale-110 shrink-0
            ${note ? "bg-brand-500/20 border-brand-500/30 text-brand-400" : "border-zinc-700 text-gray-600 hover:text-gray-300 hover:border-gray-500"}`}>
          <MessageSquare size={11} />
        </button>

        {/* 7. Star */}
        <button onClick={() => onToggleStar(topic.id)} title={starred ? "Unstar" : "Star"}
          className={`flex items-center justify-center w-6 h-6 rounded-lg border transition-all hover:scale-110 shrink-0
            ${starred ? "bg-yellow-500/20 border-yellow-500/30 text-yellow-400" : "border-zinc-700 text-gray-600 hover:text-yellow-400 hover:border-yellow-500/30"}`}>
          <Star size={11} className={starred ? "fill-yellow-400" : ""} />
        </button>

        {/* 8. Difficulty */}
        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold text-center ${DIFF_STYLE[topic.difficulty] || DIFF_STYLE.Medium}`}>
          {topic.difficulty || "Medium"}
        </span>
      </div>

      {/* Key points expansion */}
      {showPoints && keyPts.length > 0 && (
        <div className="px-12 py-2 bg-brand-500/5 border-t border-brand-500/10 animate-slide-up">
          <ul className="flex flex-col gap-1">
            {keyPts.map((pt, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-gray-400">
                <span className="text-brand-500 mt-0.5 shrink-0">▸</span>
                {pt}
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function SyllabusSheetPage() {
  const [sheets,           setSheets]           = useState([]);
  const [activeSheet,      setActiveSheet]       = useState(null);
  const [topicStatuses,    setTopicStatuses]     = useState({});
  const [expandedSections, setExpandedSections]  = useState(new Set());
  const [loading,          setLoading]           = useState(true);
  const [sheetLoading,     setSheetLoading]      = useState(false);
  const [showPaste,        setShowPaste]         = useState(false);
  const [rawSyllabus,      setRawSyllabus]       = useState("");
  const [sheetTitle,       setSheetTitle]        = useState("");
  const [parsing,          setParsing]           = useState(false);
  const [saving,           setSaving]            = useState(false);
  const [parseResult,      setParseResult]       = useState(null);
  const [error,            setError]             = useState("");
  const [noteModal,        setNoteModal]         = useState(null);

  const loadSheet = useCallback(async (id) => {
    setSheetLoading(true);
    try {
      const { data } = await syllabusApi.get(id);
      setActiveSheet(data);
      setTopicStatuses(data.topicStatuses || {});
      setExpandedSections(new Set((data.sheet_data?.sections || []).map(s => s.id)));
    } catch (err) {
      console.error("Failed to load sheet:", err);
    } finally { setSheetLoading(false); setLoading(false); }
  }, []);

  const fetchSheets = useCallback(async () => {
    try {
      const { data } = await syllabusApi.list();
      setSheets(data);
      if (data.length > 0) await loadSheet(data[0].id);
      else setLoading(false);
    } catch (err) {
      console.error("Failed to fetch sheets:", err);
      setLoading(false);
    }
  }, [loadSheet]);

  useEffect(() => { fetchSheets(); }, [fetchSheets]);

  const cycleStatus = useCallback(async (topicId) => {
    if (!activeSheet) return;
    setTopicStatuses(prev => {
      const cur  = prev[topicId]?.status || "pending";
      const next = STATUS_ORDER[(STATUS_ORDER.indexOf(cur) + 1) % STATUS_ORDER.length];
      syllabusApi.updateTopic(activeSheet.id, topicId, { status: next }).catch(() => {});
      return { ...prev, [topicId]: { ...(prev[topicId] || {}), status: next } };
    });
  }, [activeSheet]);

  const toggleStar = useCallback(async (topicId) => {
    if (!activeSheet) return;
    setTopicStatuses(prev => {
      const cur = prev[topicId]?.starred || false;
      syllabusApi.updateTopic(activeSheet.id, topicId, { starred: !cur }).catch(() => {});
      return { ...prev, [topicId]: { ...(prev[topicId] || {}), starred: !cur } };
    });
  }, [activeSheet]);

  const openNote = (topicId, existing) => setNoteModal({ topicId, value: existing || "" });
  const saveNote = async () => {
    if (!noteModal || !activeSheet) return;
    const { topicId, value } = noteModal;
    setTopicStatuses(prev => ({ ...prev, [topicId]: { ...(prev[topicId] || {}), note: value } }));
    syllabusApi.updateTopic(activeSheet.id, topicId, { note: value }).catch(() => {});
    setNoteModal(null);
  };

  const handleParse = async () => {
    if (!rawSyllabus.trim()) return setError("Please paste your syllabus first.");
    if (rawSyllabus.trim().length < 10) return setError("Syllabus is too short.");
    setParsing(true); setError("");
    try {
      const { data } = await syllabusApi.parse(rawSyllabus, sheetTitle);
      if (!data || !Array.isArray(data.sections)) throw new Error("AI returned an unexpected format. Please try again.");
      setParseResult(data);
      if (!sheetTitle && data.title) setSheetTitle(data.title);
    } catch (err) {
      const status = err.response?.status;
      const msg    = err.response?.data?.error || err.message || "";
      if (status === 503 || msg.toLowerCase().includes("not configured"))
        setError("⚠️ Gemini API key not configured. Add GEMINI_API_KEY to backend/.env — get a free key at aistudio.google.com/apikey");
      else if (status === 429 || msg.toLowerCase().includes("rate") || msg.toLowerCase().includes("quota"))
        setError("⏳ Rate limit hit. Wait 60 seconds and try again.");
      else
        setError(msg || "AI parse failed. Check your internet connection and GEMINI_API_KEY.");
    } finally { setParsing(false); }
  };

  const handleSaveSheet = async () => {
    if (!parseResult) return;
    setSaving(true);
    try {
      const { data } = await syllabusApi.create({ title: sheetTitle || parseResult.title || "My Sheet", rawSyllabus, sheetData: parseResult });
      setSheets(prev => [data, ...prev]);
      setShowPaste(false); setRawSyllabus(""); setSheetTitle(""); setParseResult(null); setError("");
      loadSheet(data.id);
    } catch (err) { setError(err.response?.data?.error || "Failed to save."); } finally { setSaving(false); }
  };

  const handleDeleteSheet = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm("Delete this sheet? All progress will be lost.")) return;
    await syllabusApi.delete(id);
    const updated = sheets.filter(s => s.id !== id);
    setSheets(updated);
    if (activeSheet?.id === id) {
      if (updated.length > 0) loadSheet(updated[0].id);
      else { setActiveSheet(null); setTopicStatuses({}); }
    }
  };

  const stats = getOverallStats(activeSheet, topicStatuses);

  // ══════════════════════════════════════════════════════════════════════════════
  // PASTE PANEL
  // ══════════════════════════════════════════════════════════════════════════════
  if (showPaste) return (
    <div className="flex flex-col gap-5 animate-slide-up max-w-3xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <p className="section-label">PrepSheet</p>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2 mt-1">
            <ClipboardPaste size={22} className="text-brand-400" /> Create New Sheet
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Paste any syllabus — AI breaks it into topics with direct YouTube, GFG & LeetCode links
          </p>
        </div>
        <button onClick={() => { setShowPaste(false); setParseResult(null); setRawSyllabus(""); setError(""); }}
          className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-surface-hover transition-colors">
          <X size={20} />
        </button>
      </div>

      <div className="card flex flex-col gap-4">
        <div className="flex items-center gap-3 bg-brand-500/10 border border-brand-500/20 rounded-lg px-4 py-3">
          <Sparkles size={18} className="text-brand-400 shrink-0" />
          <div className="text-sm">
            <p className="text-brand-300 font-semibold">Powered by Google Gemini AI</p>
            <p className="text-brand-400/70 mt-0.5 text-xs">
              AI auto-groups topics, assigns difficulty, generates direct YouTube video links (Striver / Neso Academy / NeetCode), GFG articles, and LeetCode links per topic. Also adds 2-3 key exam points per topic.
            </p>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">
            Sheet Title <span className="font-normal text-gray-600 normal-case">(optional — AI auto-generates)</span>
          </label>
          <input value={sheetTitle} onChange={e => setSheetTitle(e.target.value)}
            placeholder="e.g. DBMS Exam Prep, OS Unit 2, CN Full Syllabus..." className="input-field" />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">
            Paste Syllabus / Topic List *
          </label>
          <textarea value={rawSyllabus} onChange={e => setRawSyllabus(e.target.value)}
            placeholder={`Paste your syllabus, topic list, or unit structure here.\n\nExample:\n\nUnit 1 – Process Management\n- Process states, PCB\n- CPU Scheduling: FCFS, SJF, Round Robin\n- Deadlock: Prevention, Detection, Avoidance\n\nUnit 2 – Memory Management\n- Paging, Segmentation\n- Virtual Memory, Page Replacement Algorithms\n\nOr just dump any topic list — AI will auto-group and structure it.`}
            rows={13}
            className="w-full bg-surface border border-surface-border rounded-lg px-3.5 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-brand-500 font-mono resize-none transition-all" />
        </div>

        {error && (
          <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-red-400 text-sm">
            <span className="shrink-0">⚠️</span> <span>{error}</span>
          </div>
        )}

        <div className="flex items-center gap-3 flex-wrap">
          <button onClick={handleParse} disabled={parsing || !rawSyllabus.trim()} className="btn-primary flex items-center gap-2">
            {parsing ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
            {parsing ? "Gemini is thinking..." : "Parse with AI ✨"}
          </button>
          <p className="text-gray-500 text-xs">AI generates direct YouTube, GFG & LeetCode links + key points per topic</p>
        </div>
      </div>

      {parseResult && (
        <div className="card animate-slide-up">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                <Sparkles size={14} className="text-brand-400" /> Preview — <span className="text-brand-300">{parseResult.title}</span>
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                {parseResult.sections.reduce((a, s) => a + (s.topics?.length || 0), 0)} topics · {parseResult.sections.length} sections · with direct video, GFG & LeetCode links
              </p>
            </div>
            <button onClick={() => setParseResult(null)}
              className="text-xs text-gray-500 hover:text-white border border-surface-border hover:border-gray-500 px-3 py-1.5 rounded-lg transition-all flex items-center gap-1">
              <RotateCcw size={12} /> Re-parse
            </button>
          </div>

          <div className="flex flex-col gap-2 max-h-64 overflow-y-auto pr-1">
            {parseResult.sections.map(sec => (
              <div key={sec.id} className="rounded-lg border border-surface-border overflow-hidden">
                <div className="flex items-center justify-between px-4 py-2.5 bg-surface-card">
                  <span className="text-sm font-medium text-white">{sec.title}</span>
                  <span className="text-xs text-gray-500 font-mono">{(sec.topics || []).length} topics</span>
                </div>
                <div className="divide-y divide-surface-border bg-surface">
                  {(sec.topics || []).map(t => (
                    <div key={t.id} className="flex items-center gap-2 px-4 py-2 hover:bg-surface-hover transition-colors">
                      <span className="text-sm text-gray-300 flex-1">{t.title}</span>
                      {(t.yt_url || t.yt_query) && <Youtube size={12} className="text-red-400 shrink-0" />}
                      {t.gfg_url && <span className="text-[9px] font-black text-green-400 shrink-0">GFG</span>}
                      {t.lc_url  && <span className="text-[9px] font-black text-orange-400 shrink-0">LC</span>}
                      {Array.isArray(t.key_points) && t.key_points.length > 0 && <BookOpen size={11} className="text-brand-400 shrink-0" />}
                      <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold shrink-0 ${DIFF_STYLE[t.difficulty] || DIFF_STYLE.Medium}`}>
                        {t.difficulty || "Medium"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-3 mt-4 pt-4 border-t border-surface-border">
            <button onClick={handleSaveSheet} disabled={saving} className="btn-primary flex items-center gap-2">
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
              {saving ? "Saving..." : "Save Sheet"}
            </button>
            <p className="text-gray-500 text-sm self-center">Progress saves automatically as you study</p>
          </div>
        </div>
      )}
    </div>
  );

  // ══════════════════════════════════════════════════════════════════════════════
  // EMPTY STATE
  // ══════════════════════════════════════════════════════════════════════════════
  if (!loading && sheets.length === 0) return (
    <div className="flex flex-col gap-5 animate-slide-up max-w-3xl mx-auto">
      <div>
        <p className="section-label">PrepSheet</p>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2 mt-1">
          <ListChecks size={22} className="text-brand-400" /> Your Study Sheets
        </h1>
        <p className="text-gray-400 text-sm mt-1">
          Convert any syllabus into a trackable sheet with direct YouTube, GFG & LeetCode links per topic
        </p>
      </div>
      <div className="card flex flex-col items-center gap-6 py-16 text-center">
        <div className="w-20 h-20 rounded-2xl bg-brand-600/15 flex items-center justify-center ring-1 ring-brand-500/20">
          <ListChecks size={32} className="text-brand-400" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-white">No sheets yet</h2>
          <p className="text-gray-400 text-sm mt-1 max-w-sm">
            Paste your syllabus — AI structures it into a trackable sheet with<br />
            <span className="text-red-400">▶ YouTube videos</span> · <span className="text-green-400">GFG articles</span> · <span className="text-orange-400">LeetCode problems</span> · key exam points
          </p>
        </div>
        <button onClick={() => setShowPaste(true)} className="btn-primary flex items-center gap-2">
          <ClipboardPaste size={16} /> Create your first sheet
        </button>
        <div className="flex flex-wrap gap-2 justify-center">
          {["Operating Systems", "DBMS", "Computer Networks", "DSA Sheet", "Algorithms", "TOC"].map(ex => (
            <button key={ex} onClick={() => { setSheetTitle(ex); setShowPaste(true); }}
              className="text-xs px-3 py-1.5 rounded-full border border-surface-border text-gray-500 hover:text-white hover:border-brand-500 transition-all">{ex}</button>
          ))}
        </div>
      </div>
    </div>
  );

  // ══════════════════════════════════════════════════════════════════════════════
  // MAIN SHEET VIEW
  // ══════════════════════════════════════════════════════════════════════════════
  return (
    <div className="flex flex-col gap-4 animate-slide-up max-w-5xl mx-auto">

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <p className="section-label">PrepSheet</p>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2 mt-1">
            <ListChecks size={22} className="text-brand-400" /> {activeSheet?.title || "Study Sheet"}
          </h1>
          <p className="text-gray-400 text-xs mt-0.5">Click ✓ to mark done · click topic to expand key points · all progress auto-saves</p>
        </div>
        <button onClick={() => setShowPaste(true)} className="btn-primary flex items-center gap-2 text-sm">
          <Plus size={15} /> New Sheet
        </button>
      </div>

      {/* ── Sheet tabs ──────────────────────────────────────────────────────── */}
      {sheets.length > 0 && (
        <div className="flex gap-2 flex-wrap items-center">
          {sheets.map(s => (
            <div key={s.id} className="flex items-center gap-0.5">
              <button onClick={() => { if (activeSheet?.id !== s.id) loadSheet(s.id); }}
                className={`px-3 py-1.5 rounded-l-lg text-sm font-medium border-y border-l transition-all ${
                  activeSheet?.id === s.id
                    ? "bg-brand-600/20 border-brand-500/50 text-brand-300"
                    : "border-surface-border text-gray-400 hover:text-white hover:bg-surface-hover"}`}>
                {s.title}
                {s.topic_count != null && <span className="ml-1.5 text-xs opacity-50 font-mono">{s.topic_count}</span>}
              </button>
              <button onClick={(e) => handleDeleteSheet(s.id, e)}
                className={`px-2 py-1.5 rounded-r-lg border transition-all ${
                  activeSheet?.id === s.id
                    ? "border-brand-500/50 bg-brand-600/20 text-brand-400/60 hover:text-red-400 hover:bg-red-500/10"
                    : "border-surface-border text-gray-600 hover:text-red-400 hover:bg-red-500/10"}`}>
                <Trash2 size={12} />
              </button>
            </div>
          ))}
        </div>
      )}

      {(loading || sheetLoading) && (
        <div className="flex items-center justify-center h-52">
          <Loader2 className="animate-spin text-brand-400" size={28} />
        </div>
      )}

      {!loading && !sheetLoading && activeSheet && (
        <div className="flex flex-col xl:flex-row gap-5 items-start">

          {/* ── Main sheet ──────────────────────────────────────────────────── */}
          <div className="flex-1 min-w-0 flex flex-col gap-3">

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: "Easy",   done: stats.doneEasy,   total: stats.easy,   color: "text-emerald-400" },
                { label: "Medium", done: stats.doneMedium,  total: stats.medium, color: "text-amber-400"   },
                { label: "Hard",   done: stats.doneHard,    total: stats.hard,   color: "text-red-400"     },
              ].map(({ label, done, total, color }) => (
                <div key={label} className="flex items-center justify-between px-3 py-2 rounded-lg border border-surface-border bg-surface-card">
                  <span className="text-xs text-gray-500">{label}</span>
                  <span className={`text-sm font-bold font-mono ${color}`}>{done}/{total}</span>
                </div>
              ))}
            </div>

            {/* Progress bar */}
            <div>
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Progress</span>
                <span className="font-mono">{stats.done} / {stats.total} done · {stats.revision} for revision</span>
              </div>
              <div className="h-2 bg-surface rounded-full overflow-hidden border border-surface-border">
                <div className={`h-full rounded-full transition-all duration-700 ${stats.pct === 100 ? "bg-emerald-500" : "bg-gradient-to-r from-brand-600 to-brand-400"}`}
                  style={{ width: `${stats.pct}%` }} />
              </div>
            </div>

            {/* Expand / Collapse all */}
            <div className="flex gap-3 text-xs text-gray-500">
              <button onClick={() => setExpandedSections(new Set(activeSheet.sheet_data.sections.map(s => s.id)))}
                className="hover:text-white transition-colors">Expand all</button>
              <span className="text-gray-700">·</span>
              <button onClick={() => setExpandedSections(new Set())}
                className="hover:text-white transition-colors">Collapse all</button>
            </div>

            {/* Column headers */}
            <div className="hidden md:grid gap-2 px-4 py-2 text-[10px] font-semibold text-gray-600 uppercase tracking-widest border-b border-surface-border"
              style={{ gridTemplateColumns: "1.8rem 1fr 1.8rem 1.8rem 1.8rem 1.8rem 1.8rem 5.5rem" }}>
              <span>✓</span>
              <span>Topic (click to expand key points)</span>
              <span className="text-red-500">▶</span>
              <span className="text-orange-500">LC</span>
              <span className="text-green-500">GFG</span>
              <span>📝</span>
              <span>★</span>
              <span className="text-center">Difficulty</span>
            </div>

            {/* Sections */}
            {activeSheet.sheet_data.sections.map(section => {
              const ss       = getSectionStats(section, topicStatuses);
              const expanded = expandedSections.has(section.id);
              return (
                <div key={section.id} className="border border-surface-border rounded-xl overflow-hidden">
                  {/* Section header */}
                  <button
                    onClick={() => setExpandedSections(prev => { const n = new Set(prev); n.has(section.id) ? n.delete(section.id) : n.add(section.id); return n; })}
                    className="w-full flex items-center gap-3 px-4 py-3 bg-surface-card hover:bg-surface-hover transition-colors">
                    {expanded ? <ChevronDown size={16} className="text-gray-500 shrink-0" /> : <ChevronRight size={16} className="text-gray-500 shrink-0" />}
                    <span className="text-sm font-semibold text-white flex-1 text-left truncate pr-2">{section.title}</span>
                    <div className="hidden sm:flex items-center gap-3 shrink-0">
                      <div className="w-28 h-1.5 bg-surface rounded-full overflow-hidden">
                        <div className={`h-full rounded-full transition-all duration-500 ${ss.pct === 100 ? "bg-emerald-500" : "bg-gradient-to-r from-amber-600 to-amber-400"}`}
                          style={{ width: `${ss.pct}%` }} />
                      </div>
                      <span className="text-xs text-gray-400 font-mono w-12 text-right">{ss.done} / {ss.total}</span>
                    </div>
                  </button>

                  {/* Topics */}
                  {expanded && (
                    <div className="divide-y divide-surface-border/50">
                      {(section.topics || []).map(topic => {
                        const ts = topicStatuses[topic.id] || {};
                        return (
                          <TopicRow
                            key={topic.id}
                            topic={topic}
                            status={ts.status}
                            starred={ts.starred || false}
                            note={ts.note || ""}
                            onCycleStatus={cycleStatus}
                            onToggleStar={toggleStar}
                            onOpenNote={openNote}
                          />
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* ── Right sidebar ──────────────────────────────────────────────── */}
          <div className="xl:w-52 w-full shrink-0">
            <div className="card sticky top-4 flex flex-col gap-4">
              <h3 className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest">Overall Progress</h3>

              {/* Ring */}
              <div className="relative w-28 h-28 mx-auto">
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                  <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" />
                  <circle cx="50" cy="50" r="42" fill="none" stroke="url(#ringGrad)" strokeWidth="10"
                    strokeLinecap="round" strokeDasharray={2 * Math.PI * 42}
                    strokeDashoffset={2 * Math.PI * 42 - (2 * Math.PI * 42 * stats.pct) / 100}
                    style={{ transition: "stroke-dashoffset 0.7s ease" }} />
                  <defs><linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#0369a1" />
                    <stop offset="100%" stopColor="#0ea5e9" />
                  </linearGradient></defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold text-white leading-none">{stats.done}</span>
                  <span className="text-xs text-gray-500">/ {stats.total}</span>
                </div>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Completion</span>
                <span className="font-bold text-brand-400">{stats.pct}%</span>
              </div>
              <div className="h-1.5 bg-surface rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all duration-700 ${stats.pct === 100 ? "bg-emerald-500" : "bg-gradient-to-r from-brand-600 to-brand-400"}`}
                  style={{ width: `${stats.pct}%` }} />
              </div>
              {stats.pct === 100 && <p className="text-center text-xs text-emerald-400 font-medium">🎉 Sheet complete!</p>}

              {/* Legend */}
              <div className="border-t border-surface-border pt-3">
                <p className="text-[10px] text-gray-600 font-semibold uppercase tracking-wide mb-2">Legend</p>
                <div className="flex flex-col gap-2">
                  {[
                    { icon: "✓", color: "text-white bg-emerald-500 border-emerald-500", label: "Done" },
                    { icon: "↺", color: "text-amber-400 bg-amber-500/20 border-amber-500/50", label: "Revision" },
                    { icon: "",  color: "text-transparent bg-surface border-zinc-700",     label: "Pending" },
                  ].map(({ icon, color, label }) => (
                    <div key={label} className="flex items-center gap-2 text-xs text-gray-500">
                      <span className={`w-4 h-4 rounded border-2 flex items-center justify-center text-[9px] font-black shrink-0 ${color}`}>{icon}</span>
                      {label}
                    </div>
                  ))}
                </div>
              </div>

              {/* Resource legend */}
              <div className="border-t border-surface-border pt-3">
                <p className="text-[10px] text-gray-600 font-semibold uppercase tracking-wide mb-2">Resources</p>
                {[
                  { icon: "▶", color: "bg-red-500/20 border-red-500/30 text-red-400",    label: "YouTube video" },
                  { icon: "LC", color: "bg-orange-500/20 border-orange-500/30 text-orange-400", label: "LeetCode" },
                  { icon: "GFG", color: "bg-green-500/20 border-green-500/30 text-green-400",  label: "GeeksForGeeks" },
                ].map(({ icon, color, label }) => (
                  <div key={label} className="flex items-center gap-2 text-xs text-gray-500 mb-1.5">
                    <span className={`w-5 h-5 rounded border flex items-center justify-center text-[8px] font-black shrink-0 ${color}`}>{icon}</span>
                    {label}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Note modal */}
      {noteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={e => { if (e.target === e.currentTarget) setNoteModal(null); }}>
          <div className="bg-surface-card border border-surface-border rounded-2xl w-full max-w-md shadow-2xl animate-slide-up">
            <div className="flex items-center justify-between p-5 border-b border-surface-border">
              <h3 className="font-semibold text-white flex items-center gap-2"><MessageSquare size={16} className="text-brand-400" /> Topic Note</h3>
              <button onClick={() => setNoteModal(null)} className="text-gray-400 hover:text-white p-1"><X size={18} /></button>
            </div>
            <div className="p-5 flex flex-col gap-4">
              <textarea value={noteModal.value} onChange={e => setNoteModal(prev => ({ ...prev, value: e.target.value }))}
                placeholder="Add formula, resource link, or reminder for this topic..." rows={5} autoFocus
                className="w-full bg-surface border border-surface-border rounded-lg px-3.5 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-brand-500 resize-none" />
              <div className="flex gap-3">
                <button onClick={saveNote} className="btn-primary">Save Note</button>
                {noteModal.value && (
                  <button onClick={() => setNoteModal(p => ({ ...p, value: "" }))}
                    className="px-4 py-2 text-sm text-red-400 border border-red-500/30 hover:bg-red-500/10 rounded-lg transition-all">Clear</button>
                )}
                <button onClick={() => setNoteModal(null)}
                  className="px-4 py-2 text-sm text-gray-400 border border-surface-border hover:bg-surface-hover rounded-lg transition-all">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
