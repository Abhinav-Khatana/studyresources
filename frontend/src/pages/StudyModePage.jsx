import React, { useState, useEffect } from "react";
import { aiApi, subjectsApi } from "../lib/api";
import {
  Zap, Loader2, Calendar, CheckCircle2, AlertTriangle, Lightbulb,
  Clock, SkipForward, ChevronDown, ChevronUp, Flame, BookOpen,
  Moon, Target, Plus, List, Sparkles, AlertCircle, History, Trash2,
} from "lucide-react";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const DAY_FULL = { Mon: "Monday", Tue: "Tuesday", Wed: "Wednesday", Thu: "Thursday", Fri: "Friday", Sat: "Saturday", Sun: "Sunday" };
const TYPE_STYLES = {
  study:    { card: "border-brand-600/30 bg-brand-600/5",   badge: "bg-brand-600/20 text-brand-300" },
  revision: { card: "border-green-600/30 bg-green-600/5",   badge: "bg-green-600/20 text-green-300" },
  practice: { card: "border-amber-600/30 bg-amber-600/5",   badge: "bg-amber-600/20 text-amber-300" },
  rest:     { card: "border-gray-600/30 bg-gray-700/10",    badge: "bg-gray-600/20 text-gray-400"   },
};

// ─── Weekly Plan Display ────────────────────────────────────────────────────
function WeeklyPlanDisplay({ plan }) {
  const [openDay, setOpenDay] = useState(0);
  return (
    <div className="flex flex-col gap-4 animate-slide-up">
      {/* Summary */}
      <div className="card border-brand-600/30 bg-brand-600/5">
        <div className="flex items-start gap-3 mb-4">
          <Sparkles size={16} className="text-brand-400 mt-0.5 shrink-0" />
          <p className="text-gray-300 text-sm leading-relaxed">{plan.summary}</p>
        </div>
        <div className="flex gap-4 text-sm">
          <div className="flex items-center gap-1.5 text-gray-400">
            <Clock size={13} className="text-brand-400" /> {plan.totalHours}h total
          </div>
          <div className="flex items-center gap-1.5 text-gray-400">
            <Calendar size={13} className="text-brand-400" /> 7 days
          </div>
        </div>
      </div>

      {/* Day-by-day */}
      <div className="flex flex-col gap-2">
        {(plan.days || []).map((day, i) => {
          const styles = TYPE_STYLES[day.type] || TYPE_STYLES.study;
          const isOpen = openDay === i;
          return (
            <div key={i} className={`card p-0 overflow-hidden border ${styles.card}`}>
              <button
                onClick={() => setOpenDay(isOpen ? -1 : i)}
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="text-base">{day.icon || "📚"}</div>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-white">{day.day} — {day.subject}</p>
                    <p className="text-xs text-gray-500">{day.topics?.slice(0, 2).join(", ")}{day.topics?.length > 2 ? "..." : ""}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className={`badge text-[10px] ${styles.badge}`}>{day.type}</span>
                  <span className="text-xs text-gray-500 flex items-center gap-1"><Clock size={10} /> {day.hours}h</span>
                  {isOpen ? <ChevronUp size={14} className="text-gray-500" /> : <ChevronDown size={14} className="text-gray-500" />}
                </div>
              </button>
              {isOpen && (
                <div className="px-4 pb-4 pt-1 grid gap-2">
                  {day.motivation && (
                    <p className="text-xs text-brand-400 italic">"{day.motivation}"</p>
                  )}
                  <div className="flex flex-col gap-1">
                    {(day.tasks || []).map((task, j) => (
                      <div key={j} className="flex items-start gap-2 text-xs text-gray-400">
                        <CheckCircle2 size={11} className="text-gray-600 mt-0.5 shrink-0" />{task}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Tips */}
      {plan.tips?.length > 0 && (
        <div className="card">
          <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
            <Lightbulb size={14} className="text-yellow-400" /> Study Tips
          </h3>
          <ul className="flex flex-col gap-2">
            {plan.tips.map((tip, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-gray-300">
                <span className="text-brand-400 font-bold shrink-0">{i + 1}.</span>{tip}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// ─── Crash Plan Display ──────────────────────────────────────────────────────
function CrashPlanDisplay({ plan, subject }) {
  return (
    <div className="flex flex-col gap-4 animate-slide-up">
      {/* Emergency Banner */}
      <div className="card border-red-600/40 bg-red-600/5">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 rounded-lg bg-red-500/20 border border-red-500/30 flex items-center justify-center">
            <Moon size={16} className="text-red-400" />
          </div>
          <div>
            <p className="text-sm font-bold text-red-400">1 Night Before — {subject?.name}</p>
            <p className="text-xs text-gray-500">{subject?.icon} Emergency crash strategy</p>
          </div>
        </div>
        <p className="text-gray-300 text-sm leading-relaxed">{plan.summary}</p>
      </div>

      {/* MUST DO */}
      <div className="card">
        <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
          <Target size={14} className="text-green-400" /> MUST DO Topics
          <span className="text-xs text-gray-600 font-normal">({plan.mustDo?.length} topics)</span>
        </h3>
        <div className="flex flex-col gap-3">
          {(plan.mustDo || []).map((item, i) => (
            <div key={i} className="flex items-start gap-3 p-3 bg-surface rounded-xl border border-surface-border">
              <div className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 mt-0.5 ${
                item.priority === "CRITICAL" ? "bg-red-500/20 text-red-400" : "bg-amber-500/20 text-amber-400"
              }`}>
                {item.priority}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white">{item.topic}</p>
                <p className="text-xs text-gray-500">{item.unit}</p>
                <p className="text-xs text-gray-400 mt-1">{item.reason}</p>
                {item.quickTip && (
                  <p className="text-xs text-brand-400 mt-1 italic">💡 {item.quickTip}</p>
                )}
              </div>
              <div className="shrink-0 text-right">
                <p className="text-xs text-gray-400 flex items-center gap-1"><Clock size={10} />{item.timeNeeded}m</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SKIP */}
      {plan.skip?.length > 0 && (
        <div className="card">
          <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
            <SkipForward size={14} className="text-gray-500" /> Skip These
            <span className="text-xs text-gray-600 font-normal">(Not worth your time rn)</span>
          </h3>
          <div className="flex flex-col gap-2">
            {plan.skip.map((item, i) => (
              <div key={i} className="flex items-start gap-2.5 p-2.5 bg-surface rounded-lg border border-surface-border opacity-70">
                <SkipForward size={12} className="text-gray-600 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm text-gray-400 line-through">{item.topic}</p>
                  <p className="text-xs text-gray-600">{item.reason}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Hour-by-hour schedule */}
      {plan.schedule?.length > 0 && (
        <div className="card">
          <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
            <Clock size={14} className="text-brand-400" /> Tonight's Schedule
          </h3>
          <div className="flex flex-col gap-2">
            {plan.schedule.map((slot, i) => (
              <div key={i} className={`flex items-start gap-3 p-3 rounded-xl border ${
                slot.type === "break"
                  ? "border-gray-600/30 bg-gray-600/5"
                  : slot.type === "revision"
                  ? "border-green-600/30 bg-green-600/5"
                  : "border-brand-600/30 bg-brand-600/5"
              }`}>
                <div className="shrink-0 text-xs font-mono text-gray-500 w-16 pt-0.5">{slot.slot}</div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">{slot.activity}</p>
                  {slot.tip && <p className="text-xs text-gray-500 mt-0.5">{slot.tip}</p>}
                </div>
                <span className="text-xs text-gray-600 shrink-0">{slot.duration}m</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Emergency Tips */}
      {plan.emergencyTips?.length > 0 && (
        <div className="card border-amber-600/30 bg-amber-600/5">
          <h3 className="text-sm font-bold text-amber-400 mb-3 flex items-center gap-2">
            <AlertTriangle size={14} /> Emergency Tips 🚨
          </h3>
          <ul className="flex flex-col gap-2">
            {plan.emergencyTips.map((tip, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                <span className="text-amber-400 font-bold shrink-0">{i + 1}.</span>{tip}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────
export default function StudyModePage() {
  const [tab, setTab] = useState("weekly");

  // Weekly state
  const [subjects,         setSubjects]         = useState([]);
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [hoursPerDay,      setHoursPerDay]      = useState(3);
  const [availableDays,    setAvailableDays]    = useState(["Mon", "Tue", "Wed", "Thu", "Fri"]);
  const [weeklyResult,     setWeeklyResult]     = useState(null);
  const [weeklyLoading,    setWeeklyLoading]    = useState(false);
  const [weeklyError,      setWeeklyError]      = useState("");

  // Crash state
  const [crashSubject,    setCrashSubject]    = useState("");
  const [hoursAvailable,  setHoursAvailable]  = useState(6);
  const [knownPct,        setKnownPct]        = useState(20);
  const [crashResult,     setCrashResult]     = useState(null);
  const [crashLoading,    setCrashLoading]    = useState(false);
  const [crashError,      setCrashError]      = useState("");
  const [crashSubjectObj, setCrashSubjectObj] = useState(null);

  // Plans history state
  const [savedPlans,      setSavedPlans]      = useState([]);
  const [plansLoading,    setPlansLoading]    = useState(false);
  const [expandedPlan,    setExpandedPlan]    = useState(null);

  useEffect(() => {
    subjectsApi.list().then((r) => {
      setSubjects(r.data || []);
      if (r.data?.length) {
        // Coerce to Number so .includes() works consistently
        setSelectedSubjects([Number(r.data[0].id)]);
        setCrashSubject(Number(r.data[0].id));
      }
    }).catch(() => {});
  }, []);


  // Load saved plans when history tab is opened
  useEffect(() => {
    if (tab === "history") {
      setPlansLoading(true);
      aiApi.getPlans()
        .then((r) => setSavedPlans(r.data))
        .catch(() => {})
        .finally(() => setPlansLoading(false));
    }
  }, [tab]);

  const toggleDay = (d) =>
    setAvailableDays((prev) => prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]);

  const toggleSubject = (id) =>
    setSelectedSubjects((prev) => prev.includes(Number(id)) ? prev.filter((x) => x !== Number(id)) : [...prev, Number(id)]);

  const handleWeekly = async () => {
    if (!selectedSubjects.length) return setWeeklyError("Select at least one subject");
    if (!availableDays.length)   return setWeeklyError("Select at least one available day");
    setWeeklyLoading(true); setWeeklyError(""); setWeeklyResult(null);
    try {
      const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1);
      const startDate = tomorrow.toISOString().split("T")[0];
      const res = await aiApi.weeklyPlan({ subjectIds: selectedSubjects, hoursPerDay, availableDays, startDate });
      setWeeklyResult(res.data);
    } catch (err) {
      const msg = err.response?.data?.error || err.message || "";
      if (err.response?.status === 429 || msg.toLowerCase().includes("rate") || msg.toLowerCase().includes("quota")) {
        setWeeklyError("⏳ AI rate limit hit — wait 60 seconds and try again.");
      } else if (msg.toLowerCase().includes("key") || msg.toLowerCase().includes("configured")) {
        setWeeklyError("⚠️ Gemini API key not configured. Add GEMINI_API_KEY to backend/.env.");
      } else {
        setWeeklyError(msg || "Generation failed. Check your internet connection.");
      }
    } finally { setWeeklyLoading(false); }
  };

  const handleCrash = async () => {
    if (!crashSubject) return setCrashError("Select a subject");
    setCrashLoading(true); setCrashError(""); setCrashResult(null);
    const subObj = subjects.find((s) => String(s.id) === String(crashSubject));
    setCrashSubjectObj(subObj);
    try {
      const res = await aiApi.crashPlan({ subjectId: Number(crashSubject), hoursAvailable, knowledgePercent: knownPct });
      setCrashResult(res.data);
    } catch (err) {
      const msg = err.response?.data?.error || err.message || "";
      if (err.response?.status === 429 || msg.toLowerCase().includes("rate") || msg.toLowerCase().includes("quota")) {
        setCrashError("⏳ AI rate limit hit — wait 60 seconds and try again.");
      } else if (msg.toLowerCase().includes("key") || msg.toLowerCase().includes("configured")) {
        setCrashError("⚠️ Gemini API key not configured. Add GEMINI_API_KEY to backend/.env.");
      } else {
        setCrashError(msg || "Generation failed. Check your internet connection.");
      }
    } finally { setCrashLoading(false); }
  };

  return (
    <div className="flex flex-col gap-6 animate-slide-up">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Zap size={22} className="text-brand-400" /> Study Mode
        </h1>
        <p className="text-gray-400 text-sm mt-1">AI-powered study plans — from chill weekly to full panic mode 🚨</p>
      </div>

      {/* Mode Tabs */}
      <div className="flex gap-1 bg-surface-card border border-surface-border rounded-xl p-1 w-fit flex-wrap">
        <button onClick={() => setTab("weekly")}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all
            ${tab === "weekly" ? "bg-brand-600/20 text-brand-300 border border-brand-600/30" : "text-gray-500 hover:text-gray-300"}`}>
          <Calendar size={14} /> Weekly Plan
        </button>
        <button onClick={() => setTab("crash")}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all
            ${tab === "crash" ? "bg-red-600/20 text-red-300 border border-red-600/30" : "text-gray-500 hover:text-gray-300"}`}>
          <Moon size={14} /> 1 Night Before 🚨
        </button>
        <button onClick={() => setTab("history")}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all
            ${tab === "history" ? "bg-surface-hover text-white border border-surface-border" : "text-gray-500 hover:text-gray-300"}`}>
          <History size={14} /> My Plans
        </button>
      </div>

      {/* ── Weekly Mode ─────────────────────────────────────── */}
      {tab === "weekly" && (
        <>
          <div className="card">
            <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <Calendar size={15} className="text-brand-400" /> Configure Weekly Plan
            </h2>

            {/* Subject selection */}
            <div className="mb-5">
              <label className="block text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">
                Select Subjects
              </label>
              <div className="flex flex-wrap gap-2">
                {subjects.map((s) => (
                  <button key={s.id} onClick={() => toggleSubject(s.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm border transition-all
                      ${selectedSubjects.includes(s.id)
                        ? "bg-brand-600/20 border-brand-500/60 text-brand-300"
                        : "bg-surface border-surface-border text-gray-400 hover:border-gray-500"}`}>
                    <span>{s.icon}</span>{s.name}
                    {selectedSubjects.includes(s.id) && <CheckCircle2 size={12} className="text-brand-400" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Available days */}
            <div className="mb-5">
              <label className="block text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">
                Available Days
              </label>
              <div className="flex gap-2 flex-wrap">
                {DAYS.map((d) => (
                  <button key={d} onClick={() => toggleDay(d)}
                    className={`w-12 h-10 rounded-lg text-sm font-medium border transition-all
                      ${availableDays.includes(d)
                        ? "bg-brand-600/20 border-brand-500/60 text-brand-300"
                        : "bg-surface border-surface-border text-gray-500 hover:border-gray-500"}`}>
                    {d}
                  </button>
                ))}
              </div>
            </div>

            {/* Hours per day slider */}
            <div className="mb-5">
              <label className="block text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">
                Hours per Day — <span className="text-brand-400 normal-case">{hoursPerDay}h</span>
              </label>
              <input type="range" min="1" max="8" step="0.5" className="w-full accent-brand-500"
                value={hoursPerDay} onChange={(e) => setHoursPerDay(parseFloat(e.target.value))} />
              <div className="flex justify-between text-[10px] text-gray-600 mt-1"><span>1h</span><span>8h</span></div>
            </div>

            {weeklyError && (
              <div className="mb-4 flex items-center gap-2 text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 text-sm">
                <AlertCircle size={14} className="shrink-0" />{weeklyError}
              </div>
            )}

            <button onClick={handleWeekly} disabled={weeklyLoading}
              className="btn-primary flex items-center gap-2 w-full justify-center">
              {weeklyLoading
                ? <><Loader2 size={16} className="animate-spin" />AI is building your plan...</>
                : <><Sparkles size={16} />Generate Weekly Plan</>}
            </button>
          </div>

          {weeklyResult && <WeeklyPlanDisplay plan={weeklyResult.plan} />}
        </>
      )}

      {/* ── 1 Night Before Mode ─────────────────────────────── */}
      {tab === "crash" && (
        <>
          <div className="card border-red-600/20 bg-red-600/5">
            {/* Warning Banner */}
            <div className="flex items-center gap-3 mb-5 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
              <div className="text-2xl">🚨</div>
              <div>
                <p className="text-red-400 font-bold text-sm">1 Night Before Mode</p>
                <p className="text-gray-400 text-xs">AI will give you the most brutal, high-efficiency crash plan possible. No fluff.</p>
              </div>
            </div>

            <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <Moon size={15} className="text-red-400" /> Configure Crash Plan
            </h2>

            {/* Subject */}
            <div className="mb-4">
              <label className="block text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">Subject</label>
              <select className="input-field" value={crashSubject} onChange={(e) => setCrashSubject(Number(e.target.value))}>
                {subjects.map((s) => <option key={s.id} value={s.id}>{s.icon} {s.name}</option>)}
              </select>
            </div>

            {/* Hours available */}
            <div className="mb-4">
              <label className="block text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">
                Hours Available — <span className="text-red-400 normal-case">{hoursAvailable}h</span>
              </label>
              <input type="range" min="1" max="12" step="0.5" className="w-full accent-red-500"
                value={hoursAvailable} onChange={(e) => setHoursAvailable(parseFloat(e.target.value))} />
              <div className="flex justify-between text-[10px] text-gray-600 mt-1"><span>1h</span><span>12h</span></div>
            </div>

            {/* Knowledge level */}
            <div className="mb-5">
              <label className="block text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">
                Your Current Knowledge — <span className="text-red-400 normal-case">{knownPct}%</span>
              </label>
              <input type="range" min="0" max="100" step="5" className="w-full accent-red-500"
                value={knownPct} onChange={(e) => setKnownPct(parseInt(e.target.value))} />
              <div className="flex justify-between text-[10px] text-gray-600 mt-1"><span>0% (Nothing)</span><span>100% (All done)</span></div>
            </div>

            {crashError && (
              <div className="mb-4 flex items-center gap-2 text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 text-sm">
                <AlertCircle size={14} className="shrink-0" />{crashError}
              </div>
            )}

            <button onClick={handleCrash} disabled={crashLoading}
              className="w-full py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl transition-all flex items-center gap-2 justify-center disabled:opacity-50">
              {crashLoading
                ? <><Loader2 size={16} className="animate-spin" />Analyzing your situation...</>
                : <><Flame size={16} />Generate Crash Plan ⚡</>}
            </button>
            <p className="text-xs text-gray-600 text-center mt-2">
              AI will prioritize the highest-value topics and tell you what to skip
            </p>
          </div>

          {crashResult && (
            <CrashPlanDisplay
              plan={crashResult.plan}
              subject={crashResult.subject || crashSubjectObj}
            />
          )}
        </>
      )}

      {/* ── My Plans History ─────────────────────────────── */}
      {tab === "history" && (
        <div className="flex flex-col gap-4 animate-slide-up">
          {plansLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="animate-spin text-brand-400" size={28} />
            </div>
          ) : savedPlans.length === 0 ? (
            <div className="card text-center py-16">
              <History size={32} className="text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400 font-medium">No saved plans yet</p>
              <p className="text-gray-600 text-sm mt-1">Generate a weekly or crash plan and it will appear here</p>
            </div>
          ) : (
            savedPlans.map((plan) => {
              const isExpanded = expandedPlan === plan.id;
              const isWeekly   = plan.plan_type === "weekly";
              const subjectNames = Array.isArray(plan.subject_ids)
                ? plan.subject_ids.join(", ").toUpperCase()
                : plan.subject_ids || "—";
              return (
                <div key={plan.id} className={`card p-0 overflow-hidden border ${
                  isWeekly ? "border-brand-600/20" : "border-red-600/20"
                }`}>
                  <button
                    onClick={() => setExpandedPlan(isExpanded ? null : plan.id)}
                    className="w-full flex items-center justify-between px-5 py-4 hover:bg-surface-hover transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                        isWeekly ? "bg-brand-600/20" : "bg-red-600/20"
                      }`}>
                        {isWeekly ? <Calendar size={16} className="text-brand-400" /> : <Moon size={16} className="text-red-400" />}
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-semibold text-white">
                          {isWeekly ? "📅 Weekly Plan" : "🌙 Crash Plan"}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {subjectNames} · {new Date(plan.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`badge text-[10px] ${
                        isWeekly ? "bg-brand-600/20 text-brand-300" : "bg-red-600/20 text-red-300"
                      }`}>{plan.plan_type}</span>
                      {isExpanded ? <ChevronUp size={14} className="text-gray-500" /> : <ChevronDown size={14} className="text-gray-500" />}
                    </div>
                  </button>

                  {isExpanded && plan.plan_data && (
                    <div className="px-5 pb-5 pt-1 border-t border-surface-border">
                      {/* Summary */}
                      {plan.plan_data.summary && (
                        <p className="text-sm text-gray-300 leading-relaxed mb-4 pt-3">{plan.plan_data.summary}</p>
                      )}

                      {/* Weekly plan days */}
                      {isWeekly && plan.plan_data.days && (
                        <div className="flex flex-col gap-2">
                          {plan.plan_data.days.map((day, i) => (
                            <div key={i} className="flex items-start gap-3 p-3 rounded-xl border border-surface-border bg-surface">
                              <span className="text-base shrink-0">{day.icon || "📚"}</span>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-white">{day.day} — {day.subject}</p>
                                <p className="text-xs text-gray-500 mt-0.5 truncate">{day.topics?.slice(0,2).join(", ")}</p>
                              </div>
                              <div className="text-right shrink-0">
                                <span className="text-xs text-gray-400 flex items-center gap-1"><Clock size={10}/>{day.hours}h</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Crash plan must-do */}
                      {!isWeekly && plan.plan_data.mustDo && (
                        <div className="flex flex-col gap-2">
                          <p className="text-xs font-semibold text-white mb-1 flex items-center gap-1.5"><Target size={12} className="text-green-400"/> MUST DO Topics</p>
                          {plan.plan_data.mustDo.slice(0, 5).map((item, i) => (
                            <div key={i} className="flex items-start gap-2 p-2.5 rounded-lg bg-surface border border-surface-border">
                              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0 mt-0.5 ${
                                item.priority === "CRITICAL" ? "bg-red-500/20 text-red-400" : "bg-amber-500/20 text-amber-400"
                              }`}>{item.priority}</span>
                              <div>
                                <p className="text-sm text-white">{item.topic}</p>
                                <p className="text-xs text-gray-500">{item.unit} · {item.timeNeeded}m</p>
                              </div>
                            </div>
                          ))}
                          {plan.plan_data.mustDo.length > 5 && (
                            <p className="text-xs text-gray-600 text-center">+{plan.plan_data.mustDo.length - 5} more topics</p>
                          )}
                        </div>
                      )}

                      {/* Tips */}
                      {(plan.plan_data.tips || plan.plan_data.emergencyTips)?.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-surface-border">
                          <p className="text-xs font-semibold text-white mb-2 flex items-center gap-1.5"><Lightbulb size={12} className="text-yellow-400"/> Tips</p>
                          {(plan.plan_data.tips || plan.plan_data.emergencyTips).slice(0,3).map((tip, i) => (
                            <p key={i} className="text-xs text-gray-400 mb-1"><span className="text-brand-400 font-bold">{i+1}.</span> {tip}</p>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
