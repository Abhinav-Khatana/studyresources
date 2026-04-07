import React, { useState, useEffect } from "react";
import { aiApi, subjectsApi } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import {
  Map, Sparkles, Loader2, Calendar, Zap, Target, AlertTriangle,
  Lightbulb, CheckCircle2, Clock, ChevronDown, ChevronUp,
  Trash2, History, Plus,
} from "lucide-react";

const EFFORT_LABELS = {
  2: "Very Low (2h/day)", 4: "Low (3-4h/day)", 6: "Moderate (5-6h/day)",
  8: "High (7-8h/day)", 10: "Max Grind (10h/day)",
};
const TYPE_COLORS = {
  study:    "border-brand-600/40 bg-brand-600/5",
  revision: "border-green-600/40 bg-green-600/5",
  practice: "border-amber-600/40 bg-amber-600/5",
  rest:     "border-gray-600/40 bg-gray-600/5",
};
const TYPE_BADGES = {
  study:    "bg-brand-600/20 text-brand-300",
  revision: "bg-green-600/20 text-green-300",
  practice: "bg-amber-600/20 text-amber-300",
  rest:     "bg-gray-600/20 text-gray-400",
};

function WeekBlock({ week }) {
  const [open, setOpen] = useState(week.week === 1);
  return (
    <div className="card p-0 overflow-hidden">
      <button onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-surface-hover transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-brand-600/20 border border-brand-600/30 flex items-center justify-center">
            <span className="text-brand-400 text-sm font-bold">{week.week}</span>
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold text-white">Week {week.week}</p>
            {week.theme && <p className="text-xs text-gray-500">{week.theme}</p>}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-500">{week.days?.length} days</span>
          {open ? <ChevronUp size={16} className="text-gray-500"/> : <ChevronDown size={16} className="text-gray-500"/>}
        </div>
      </button>
      {open && (
        <div className="px-5 pb-5 grid gap-3">
          {week.days?.map(day => (
            <div key={day.day} className={`rounded-xl border p-4 ${TYPE_COLORS[day.type] || TYPE_COLORS.study}`}>
              <div className="flex items-start justify-between gap-3 mb-2">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs text-gray-500 font-mono">{day.date}</span>
                    <span className={`badge text-[11px] ${TYPE_BADGES[day.type] || TYPE_BADGES.study}`}>{day.type}</span>
                    {day.unit && <span className="badge bg-surface text-gray-400 border border-surface-border text-[11px]">{day.unit}</span>}
                  </div>
                  <p className="text-sm font-medium text-white mt-1">{day.focus}</p>
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-400 shrink-0">
                  <Clock size={12}/>{day.hours}h
                </div>
              </div>
              {day.tasks && (
                <ul className="flex flex-col gap-1 mt-2">
                  {day.tasks.map((task, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-gray-400">
                      <CheckCircle2 size={12} className="text-gray-600 mt-0.5 shrink-0"/>{task}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function RoadmapDisplay({ roadmap, subject, daysLeft }) {
  return (
    <div className="flex flex-col gap-5 animate-slide-up">
      <div className="card border-brand-600/30 bg-brand-600/5">
        <div className="flex items-start gap-3 mb-4">
          <Sparkles size={18} className="text-brand-400 mt-0.5 shrink-0"/>
          <p className="text-gray-300 text-sm leading-relaxed">{roadmap.summary}</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { icon: Calendar, label: "Days Left",    value: daysLeft               },
            { icon: Clock,    label: "Daily Hours",  value: `${roadmap.dailyHours}h` },
            { icon: Zap,      label: "Total Hours",  value: `${roadmap.totalHours}h` },
            { icon: Target,   label: "Target Grade", value: roadmap.targetGrade    },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="bg-surface rounded-xl p-3 text-center border border-surface-border">
              <Icon size={16} className="text-brand-400 mx-auto mb-1"/>
              <p className="text-xs text-gray-500">{label}</p>
              <p className="text-white font-bold text-sm mt-0.5">{value}</p>
            </div>
          ))}
        </div>
      </div>

      {roadmap.warnings?.filter(Boolean).map((w, i) => (
        <div key={i} className="flex items-start gap-2 text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2 text-sm">
          <AlertTriangle size={15} className="shrink-0 mt-0.5"/>{w}
        </div>
      ))}

      <div>
        <h2 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
          <Calendar size={16} className="text-brand-400"/> Day-by-Day Plan
        </h2>
        <div className="flex flex-col gap-3">
          {roadmap.weeks?.map(week => <WeekBlock key={week.week} week={week}/>)}
        </div>
      </div>

      {roadmap.tips?.length > 0 && (
        <div className="card">
          <h2 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
            <Lightbulb size={16} className="text-yellow-400"/> Study Tips
          </h2>
          <ul className="flex flex-col gap-2">
            {roadmap.tips.map((tip, i) => (
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

export default function RoadmapPage() {
  const { student }                     = useAuth();
  const [subjects, setSubjects]         = useState([]);
  const [saved, setSaved]               = useState([]);
  const [activeTab, setActiveTab]       = useState("generate");
  const [viewingSaved, setViewingSaved] = useState(null);
  const [form, setForm]                 = useState({
    subjectId: "", examDate: "", effortLevel: 6,
    cgpa: student?.cgpa || 8.0, knowledgePercent: 20,
  });
  const [loading, setLoading]           = useState(false);
  const [loadingSaved, setLoadingSaved] = useState(true);
  const [result, setResult]             = useState(null);
  const [error, setError]               = useState("");

  useEffect(() => {
    subjectsApi.list().then(r => {
      setSubjects(r.data);
      if (r.data.length) setForm(f => ({ ...f, subjectId: r.data[0].id }));
    });
    aiApi.getRoadmaps()
      .then(r => setSaved(r.data))
      .catch(() => {})
      .finally(() => setLoadingSaved(false));
  }, []);

  const handleGenerate = async () => {
    if (!form.subjectId || !form.examDate) { setError("Please select a subject and exam date."); return; }
    setLoading(true); setError(""); setResult(null);
    try {
      const res = await aiApi.roadmap(form);
      setResult(res.data);
      // Refresh saved list silently
      aiApi.getRoadmaps().then(r => setSaved(r.data)).catch(() => {});
    } catch (err) {
      setError(err.response?.data?.error || "Failed to generate. Check your ANTHROPIC_API_KEY in backend/.env");
    } finally { setLoading(false); }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!confirm("Delete this saved roadmap?")) return;
    try {
      await aiApi.deleteRoadmap(id);
      setSaved(prev => prev.filter(r => r.id !== id));
      if (viewingSaved?.id === id) setViewingSaved(null);
    } catch {}
  };

  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 1);

  return (
    <div className="flex flex-col gap-6 animate-slide-up">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Map size={22} className="text-brand-400"/> AI Study Roadmap
        </h1>
        <p className="text-gray-400 text-sm mt-1">Personalized day-by-day plan based on your exam date, effort and knowledge</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-surface-card border border-surface-border rounded-lg p-1 w-fit">
        {[
          { key: "generate", label: "Generate", icon: Plus    },
          { key: "saved",    label: `Saved${saved.length > 0 ? ` (${saved.length})` : ""}`, icon: History },
        ].map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => { setActiveTab(key); setViewingSaved(null); }}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-md text-sm font-medium transition-all
              ${activeTab === key ? "bg-brand-600/20 text-brand-300 border border-brand-600/30" : "text-gray-500 hover:text-gray-300"}`}>
            <Icon size={14}/>{label}
          </button>
        ))}
      </div>

      {/* ── Generate tab ────────────────────────────── */}
      {activeTab === "generate" && (
        <>
          <div className="card">
            <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <Sparkles size={16} className="text-brand-400"/> Configure Your Plan
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1.5 uppercase tracking-wide">Subject</label>
                <select className="input-field bg-surface" value={form.subjectId} onChange={e => setForm({...form, subjectId: e.target.value})}>
                  {subjects.map(s => <option key={s.id} value={s.id}>{s.icon} {s.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1.5 uppercase tracking-wide">Exam Date</label>
                <input type="date" className="input-field bg-surface"
                  min={minDate.toISOString().split("T")[0]}
                  value={form.examDate} onChange={e => setForm({...form, examDate: e.target.value})}/>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1.5 uppercase tracking-wide">
                  Your CGPA <span className="text-brand-400 normal-case">({form.cgpa})</span>
                </label>
                <input type="range" min="4" max="10" step="0.1" className="w-full accent-brand-500"
                  value={form.cgpa} onChange={e => setForm({...form, cgpa: parseFloat(e.target.value)})}/>
                <div className="flex justify-between text-[10px] text-gray-600 mt-1"><span>4.0</span><span>10.0</span></div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1.5 uppercase tracking-wide">
                  Subject Knowledge <span className="text-brand-400 normal-case">({form.knowledgePercent}%)</span>
                </label>
                <input type="range" min="0" max="100" step="5" className="w-full accent-brand-500"
                  value={form.knowledgePercent} onChange={e => setForm({...form, knowledgePercent: parseInt(e.target.value)})}/>
                <div className="flex justify-between text-[10px] text-gray-600 mt-1"><span>0%</span><span>100%</span></div>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-gray-300 mb-2 uppercase tracking-wide">Effort Level</label>
                <div className="grid grid-cols-5 gap-2">
                  {Object.entries(EFFORT_LABELS).map(([val, label]) => (
                    <button key={val} onClick={() => setForm({...form, effortLevel: parseInt(val)})}
                      className={`p-2 rounded-lg border text-center transition-all
                        ${form.effortLevel === parseInt(val)
                          ? "bg-brand-600/20 border-brand-500 text-brand-300"
                          : "bg-surface border-surface-border text-gray-400 hover:border-gray-500"}`}>
                      <div className="text-sm font-bold">{val}</div>
                      <div className="text-[10px] mt-0.5 hidden sm:block leading-tight">{label.split("(")[0]}</div>
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2 text-center">{EFFORT_LABELS[form.effortLevel]}</p>
              </div>
            </div>

            {error && (
              <div className="mt-4 flex items-center gap-2 text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 text-sm">
                <AlertTriangle size={15} className="shrink-0"/>{error}
              </div>
            )}

            <button onClick={handleGenerate} disabled={loading}
              className="btn-primary mt-5 flex items-center gap-2 w-full justify-center">
              {loading
                ? <><Loader2 size={16} className="animate-spin"/>AI is building your roadmap...</>
                : <><Sparkles size={16}/>Generate Roadmap</>}
            </button>
            <p className="text-xs text-gray-600 text-center mt-2">Saved automatically — access anytime from the Saved tab</p>
          </div>

          {result && (
            <RoadmapDisplay
              roadmap={result.roadmap}
              subject={result.subject}
              daysLeft={result.daysLeft}
            />
          )}
        </>
      )}

      {/* ── Saved tab ───────────────────────────────── */}
      {activeTab === "saved" && (
        <div className="flex flex-col gap-4">
          {loadingSaved ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="animate-spin text-brand-400" size={28}/>
            </div>
          ) : saved.length === 0 ? (
            <div className="card text-center py-16">
              <Map size={32} className="text-gray-600 mx-auto mb-3"/>
              <p className="text-gray-400 font-medium">No saved roadmaps yet</p>
              <p className="text-gray-600 text-sm mt-1">Generate a roadmap and it will be saved here automatically</p>
            </div>
          ) : viewingSaved ? (
            <>
              <button onClick={() => setViewingSaved(null)}
                className="flex items-center gap-1.5 text-gray-400 hover:text-white text-sm w-fit transition-colors">
                ← Back to saved roadmaps
              </button>
              <RoadmapDisplay
                roadmap={viewingSaved.roadmap_data}
                subject={{ name: viewingSaved.subject_name, icon: viewingSaved.subject_icon }}
                daysLeft={Math.max(0, Math.ceil((new Date(viewingSaved.exam_date) - new Date()) / 86400000))}
              />
            </>
          ) : (
            <div className="flex flex-col gap-3">
              {saved.map(r => (
                <div key={r.id} onClick={() => setViewingSaved(r)}
                  className="card hover:border-brand-600/40 transition-all cursor-pointer group">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{r.subject_icon}</span>
                      <div>
                        <p className="text-white font-semibold text-sm">{r.subject_name}</p>
                        <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 flex-wrap">
                          <span className="flex items-center gap-1">
                            <Calendar size={11}/>
                            {new Date(r.exam_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                          </span>
                          <span>Effort {r.effort_level}/10</span>
                          <span>CGPA {r.cgpa}</span>
                          <span>{r.knowledge_pct}% known</span>
                        </div>
                        <p className="text-xs text-gray-600 mt-1">
                          Saved {new Date(r.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                        </p>
                      </div>
                    </div>
                    <button onClick={(e) => handleDelete(r.id, e)}
                      className="p-1.5 text-gray-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100 shrink-0">
                      <Trash2 size={15}/>
                    </button>
                  </div>
                  {r.roadmap_data?.summary && (
                    <div className="mt-3 pt-3 border-t border-surface-border">
                      <p className="text-xs text-gray-500 line-clamp-2">{r.roadmap_data.summary}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
