import React, { useState, useEffect } from "react";
import { subjectsApi, aiApi } from "../lib/api";
import {
  Lock, Sparkles, Target, TrendingUp, Loader2,
  Calendar, Clock, BookOpen, AlertTriangle, Star,
  ChevronDown, ChevronUp, Lightbulb, Flame, CheckCircle2,
  AlertCircle, RotateCcw, Map,
} from "lucide-react";

const EFFORT_LEVELS = [
  { value: 3,  label: "Light",   desc: "1–2h/day" },
  { value: 6,  label: "Focused", desc: "3–5h/day" },
  { value: 9,  label: "Intense", desc: "6h+/day"  },
];

const CGPA_OPTIONS = [
  { value: "9.0", label: "9/10 (Distinction)" },
  { value: "8.0", label: "8/10 (First Class)" },
  { value: "7.0", label: "7/10 (Average)" },
  { value: "6.0", label: "6/10 (Below Average)" },
];

const TYPE_STYLES = {
  study:    "border-brand-600/30 bg-brand-600/5",
  revision: "border-green-600/30 bg-green-600/5",
  practice: "border-amber-600/30 bg-amber-600/5",
  rest:     "border-gray-600/30 bg-gray-700/10",
};

const TYPE_BADGE = {
  study:    "bg-brand-600/20 text-brand-300",
  revision: "bg-green-600/20 text-green-300",
  practice: "bg-amber-600/20 text-amber-300",
  rest:     "bg-gray-600/20 text-gray-400",
};

function RoadmapDisplay({ roadmap, subject }) {
  const [openWeek, setOpenWeek] = useState(0);
  const [openDay, setOpenDay]   = useState(null);

  return (
    <div className="flex flex-col gap-5 animate-slide-up">
      {/* Summary hero */}
      <div className="card border-brand-600/30 bg-gradient-to-br from-brand-600/10 to-transparent">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
          <div>
            <p className="text-xs font-bold text-brand-400 uppercase tracking-widest mb-1">
              {subject?.icon} {subject?.name} Exam Roadmap
            </p>
            <h2 className="text-xl font-bold text-white">{roadmap.summary}</h2>
          </div>
          <div className="flex gap-3">
            <div className="text-center px-4 py-2 bg-surface rounded-xl border border-surface-border">
              <p className="text-2xl font-black text-brand-400">{roadmap.daysLeft ?? "?"}</p>
              <p className="text-xs text-gray-500">Days Left</p>
            </div>
            <div className="text-center px-4 py-2 bg-surface rounded-xl border border-surface-border">
              <p className="text-2xl font-black text-green-400">{roadmap.roadmap?.totalHours ?? "?"}</p>
              <p className="text-xs text-gray-500">Total Hours</p>
            </div>
            <div className="text-center px-4 py-2 bg-surface rounded-xl border border-surface-border">
              <p className="text-2xl font-black text-amber-400">{roadmap.roadmap?.targetGrade ?? "A+"}</p>
              <p className="text-xs text-gray-500">Target Grade</p>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {(roadmap.roadmap?.tips || []).map((tip, i) => (
            <div key={i} className="flex items-start gap-2 bg-brand-500/10 border border-brand-500/20 rounded-xl px-3 py-2 text-xs text-brand-300 max-w-xs">
              <Lightbulb size={12} className="text-brand-400 shrink-0 mt-0.5" />
              {tip}
            </div>
          ))}
        </div>
      </div>

      {/* Week-by-week */}
      <div className="flex flex-col gap-3">
        {(roadmap.roadmap?.weeks || []).map((week, wi) => {
          const isOpen = openWeek === wi;
          return (
            <div key={wi} className="border border-surface-border rounded-2xl overflow-hidden">
              <button
                onClick={() => setOpenWeek(isOpen ? -1 : wi)}
                className="w-full flex items-center justify-between px-5 py-4 hover:bg-surface-hover transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-brand-600/20 flex items-center justify-center text-sm font-bold text-brand-400">
                    W{week.week}
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-white">{week.theme}</p>
                    <p className="text-xs text-gray-500">{week.days?.length || 0} days planned</p>
                  </div>
                </div>
                {isOpen ? <ChevronUp size={16} className="text-gray-500" /> : <ChevronDown size={16} className="text-gray-500" />}
              </button>

              {isOpen && (
                <div className="px-5 pb-5 pt-2 grid gap-2">
                  {(week.days || []).map((day, di) => {
                    const key = `${wi}-${di}`;
                    const typeStyle = TYPE_STYLES[day.type] || TYPE_STYLES.study;
                    const typeBadge = TYPE_BADGE[day.type] || TYPE_BADGE.study;
                    const isOpen2 = openDay === key;
                    return (
                      <div key={di} className={`rounded-xl border overflow-hidden ${typeStyle}`}>
                        <button
                          onClick={() => setOpenDay(isOpen2 ? null : key)}
                          className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-white/5 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-mono text-gray-500 w-12 text-left shrink-0">{day.date || `Day ${day.day}`}</span>
                            <div className="text-left">
                              <p className="text-sm font-medium text-white">{day.focus}</p>
                              <p className="text-xs text-gray-500">{day.unit}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${typeBadge}`}>{day.type}</span>
                            <span className="text-xs text-gray-500 flex items-center gap-1"><Clock size={10} />{day.hours}h</span>
                            {isOpen2 ? <ChevronUp size={12} className="text-gray-500" /> : <ChevronDown size={12} className="text-gray-500" />}
                          </div>
                        </button>
                        {isOpen2 && (
                          <div className="px-4 pb-3 pt-1 flex flex-col gap-1">
                            {(day.tasks || []).map((task, ti) => (
                              <div key={ti} className="flex items-start gap-2 text-xs text-gray-400">
                                <CheckCircle2 size={11} className="text-gray-600 mt-0.5 shrink-0" />
                                {task}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Warnings */}
      {(roadmap.roadmap?.warnings || []).length > 0 && (
        <div className="card border-amber-600/30 bg-amber-600/5">
          <h3 className="text-sm font-bold text-amber-400 mb-3 flex items-center gap-2">
            <AlertTriangle size={14} /> Important Warnings
          </h3>
          <ul className="flex flex-col gap-2">
            {roadmap.roadmap.warnings.map((w, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                <span className="text-amber-400 font-bold shrink-0">{i + 1}.</span>{w}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default function ExamModePage() {
  const [subjects,        setSubjects]        = useState([]);
  const [subjectsLoading, setSubjectsLoading] = useState(true);

  // Form state
  const [subjectId,      setSubjectId]      = useState("");
  const [examDate,       setExamDate]       = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split("T")[0];
  });
  const [effortLevel,    setEffortLevel]    = useState(6);
  const [cgpa,           setCgpa]           = useState("8.0");
  const [knowledgePct,   setKnowledgePct]   = useState(40);

  // Result state
  const [result,         setResult]         = useState(null);
  const [loading,        setLoading]        = useState(false);
  const [error,          setError]          = useState("");
  const [savedRoadmaps,  setSavedRoadmaps]  = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [showHistory,    setShowHistory]    = useState(false);

  useEffect(() => {
    subjectsApi.list()
      .then(r => {
        setSubjects(r.data || []);
        if (r.data?.length) setSubjectId(String(r.data[0].id));
      })
      .catch(() => {})
      .finally(() => setSubjectsLoading(false));
  }, []);

  const loadHistory = async () => {
    setHistoryLoading(true);
    try {
      const r = await aiApi.getRoadmaps();
      setSavedRoadmaps(r.data || []);
    } catch {}
    setHistoryLoading(false);
  };

  const handleToggleHistory = () => {
    if (!showHistory) loadHistory();
    setShowHistory(h => !h);
  };

  const handleGenerate = async () => {
    if (!subjectId)  return setError("Please select a subject.");
    if (!examDate)   return setError("Please pick your exam date.");
    setLoading(true); setError(""); setResult(null);
    try {
      const { data } = await aiApi.roadmap({
        subjectId: Number(subjectId),
        examDate,
        effortLevel,
        cgpa: parseFloat(cgpa),
        knowledgePercent: knowledgePct,
      });
      setResult(data);
    } catch (err) {
      const msg = err.response?.data?.error || err.message || "Generation failed.";
      if (msg.includes("429") || msg.toLowerCase().includes("rate limit") || msg.toLowerCase().includes("quota")) {
        setError("⏳ AI rate limit hit. Wait ~60 seconds and try again, or the system will auto-retry.");
      } else if (msg.includes("not configured") || msg.includes("API_KEY")) {
        setError("⚠️ Gemini API key not configured. Add GEMINI_API_KEY to backend/.env - get a free key at aistudio.google.com");
      } else {
        setError(msg);
      }
    } finally { setLoading(false); }
  };

  const handleDeleteRoadmap = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm("Delete this roadmap?")) return;
    try {
      await aiApi.deleteRoadmap(id);
      setSavedRoadmaps(prev => prev.filter(r => r.id !== id));
    } catch {}
  };

  const daysLeft = Math.max(0, Math.ceil((new Date(examDate) - new Date()) / 86400000));

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      {/* Header */}
      <div>
        <p className="section-label flex items-center gap-1.5"><Map size={12} className="text-brand-400" /> AI Exam Prep</p>
        <h1 className="mt-2 text-3xl font-black text-white">Exam Mode</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-400">
          Generate a personalized, day-by-day exam roadmap based on your subject, time left, and effort level. Pick the most likely scoring topics and build a focused plan.
        </p>
      </div>

      {/* Generator Form */}
      <div className="card flex flex-col gap-5">
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <Sparkles size={15} className="text-brand-400" /> Configure Your Exam Plan
        </h2>

        {/* Subject */}
        <div>
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Subject</label>
          {subjectsLoading ? (
            <div className="flex items-center gap-2 text-gray-500 text-sm"><Loader2 size={14} className="animate-spin" /> Loading subjects...</div>
          ) : subjects.length === 0 ? (
            <p className="text-sm text-red-400">No subjects found. Ask your admin to add subjects first.</p>
          ) : (
            <select
              value={subjectId}
              onChange={e => setSubjectId(e.target.value)}
              className="input-field"
            >
              {subjects.map(s => (
                <option key={s.id} value={s.id}>{s.icon} {s.name} ({s.code})</option>
              ))}
            </select>
          )}
        </div>

        {/* Exam Date */}
        <div>
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">
            Exam Date <span className="text-brand-400 font-normal normal-case ml-1">— {daysLeft} day{daysLeft !== 1 ? "s" : ""} left</span>
          </label>
          <input
            type="date"
            value={examDate}
            min={new Date().toISOString().split("T")[0]}
            onChange={e => setExamDate(e.target.value)}
            className="input-field"
          />
        </div>

        {/* Effort Level */}
        <div>
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Effort Level</label>
          <div className="flex flex-wrap gap-2">
            {EFFORT_LEVELS.map(e => (
              <button
                key={e.value}
                type="button"
                onClick={() => setEffortLevel(e.value)}
                className={`flex flex-col items-center px-5 py-3 rounded-xl border text-sm transition-all ${
                  effortLevel === e.value
                    ? "border-brand-500/50 bg-brand-600/15 text-brand-300"
                    : "border-surface-border text-gray-400 hover:text-white hover:border-gray-600"
                }`}
              >
                <span className="font-bold">{e.label}</span>
                <span className="text-xs opacity-60">{e.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* CGPA */}
        <div>
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Your CGPA (approx)</label>
          <div className="flex flex-wrap gap-2">
            {CGPA_OPTIONS.map(c => (
              <button
                key={c.value}
                type="button"
                onClick={() => setCgpa(c.value)}
                className={`px-4 py-2 rounded-xl border text-sm transition-all ${
                  cgpa === c.value
                    ? "border-brand-500/50 bg-brand-600/15 text-brand-300"
                    : "border-surface-border text-gray-400 hover:text-white"
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* Knowledge % */}
        <div>
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">
            Current Subject Knowledge — <span className="text-brand-400 font-normal normal-case">{knowledgePct}%</span>
          </label>
          <input
            type="range" min="0" max="100" step="5"
            value={knowledgePct}
            onChange={e => setKnowledgePct(Number(e.target.value))}
            className="w-full accent-brand-500"
          />
          <div className="flex justify-between text-[10px] text-gray-600 mt-1">
            <span>0% (Starting fresh)</span>
            <span>100% (Fully prepared)</span>
          </div>
        </div>

        {error && (
          <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-400 text-sm">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex flex-wrap gap-3 items-center">
          <button
            type="button"
            onClick={handleGenerate}
            disabled={loading || subjectsLoading || subjects.length === 0}
            className="btn-primary flex items-center gap-2"
          >
            {loading ? <><Loader2 size={16} className="animate-spin" /> Generating roadmap...</> : <><Sparkles size={16} /> Generate Exam Roadmap</>}
          </button>
          {result && (
            <button
              type="button"
              onClick={() => { setResult(null); setError(""); }}
              className="flex items-center gap-2 text-sm text-gray-400 hover:text-white border border-surface-border px-4 py-2 rounded-xl hover:border-gray-600 transition-all"
            >
              <RotateCcw size={14} /> Reset
            </button>
          )}
          <button
            type="button"
            onClick={handleToggleHistory}
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-white border border-surface-border px-4 py-2 rounded-xl hover:border-gray-600 transition-all"
          >
            <BookOpen size={14} /> {showHistory ? "Hide" : "View"} Saved Roadmaps
          </button>
        </div>
      </div>

      {/* Saved Roadmaps History */}
      {showHistory && (
        <div className="card animate-slide-up">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <BookOpen size={14} className="text-brand-400" /> Saved Roadmaps
          </h3>
          {historyLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 size={24} className="animate-spin text-brand-400" />
            </div>
          ) : savedRoadmaps.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-8">No saved roadmaps yet. Generate one above!</p>
          ) : (
            <div className="flex flex-col gap-2">
              {savedRoadmaps.map(rm => (
                <div
                  key={rm.id}
                  className="flex items-center justify-between gap-4 p-4 border border-surface-border rounded-xl hover:border-brand-500/30 hover:bg-surface-hover transition-all cursor-pointer"
                  onClick={() => setResult({ roadmap: rm.roadmap_data, subject: { name: rm.subject_name, icon: rm.subject_icon }, daysLeft: 0 })}
                >
                  <div>
                    <p className="text-sm font-semibold text-white">{rm.subject_name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Exam: {new Date(rm.exam_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })} ·
                      Effort {rm.effort_level}/10 · CGPA {rm.cgpa}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">{new Date(rm.created_at).toLocaleDateString("en-IN")}</span>
                    <button
                      onClick={e => handleDeleteRoadmap(rm.id, e)}
                      className="p-1.5 rounded-lg text-gray-600 hover:text-red-400 hover:bg-red-500/10 transition-all"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Result */}
      {result && (
        <RoadmapDisplay
          roadmap={result}
          subject={result.subject || subjects.find(s => String(s.id) === String(subjectId))}
        />
      )}

      {/* Premium upsell (subtle footer) */}
      {!loading && !result && (
        <section className="rounded-[28px] border border-brand-500/15 bg-gradient-to-br from-brand-700/10 via-brand-500/5 to-accent-500/5 p-6 mt-2">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-brand-500/20 bg-brand-500/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-widest text-brand-300 mb-3">
                <Sparkles size={12} /> Coming Soon — Exam Mode Premium
              </div>
              <p className="text-sm text-gray-300 max-w-lg leading-6">
                Score-maximizing topic order, most-asked concepts analysis, last-minute survival plan, and section-wise focus map — unlock the full exam intelligence layer.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {["Most asked concepts", "Score-maximizing order", "Last-minute survival", "Section-wise focus"].map(f => (
                <div key={f} className="flex items-center gap-2 text-xs text-gray-400 bg-surface border border-surface-border rounded-xl px-3 py-2">
                  <Lock size={11} className="text-brand-500/60" />
                  {f}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
