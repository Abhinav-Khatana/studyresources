import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { subjectsApi, progressApi, voteApi, bookmarkApi } from "../lib/api";
import ResourceCard from "../components/ResourceCard";
import { ArrowLeft, ChevronDown, ChevronUp, FileText, Youtube, Globe, ClipboardList, Loader2 } from "lucide-react";

const TABS = [
  { key: "notes",    label: "Notes",    icon: FileText      },
  { key: "videos",   label: "Videos",   icon: Youtube       },
  { key: "articles", label: "Articles", icon: Globe         },
  { key: "pyqs",     label: "PYQs",     icon: ClipboardList },
];

function UnitSection({ unit, completedResources, myVotes, myBookmarks, onComplete }) {
  const [open, setOpen]     = useState(unit.unitNumber === 1 || unit.unit_number === 1);
  const [activeTab, setTab] = useState("notes");

  const resources  = unit.resources?.[activeTab] || [];
  const totalRes   = Object.values(unit.resources || {}).flat().length;
  const doneCount  = Object.values(unit.resources || {}).flat().filter(r => completedResources.includes(r.id)).length;
  const unitNum    = unit.unitNumber || unit.unit_number;

  return (
    <div className="card">
      <button onClick={() => setOpen(o => !o)} className="flex items-center gap-3 w-full text-left group">
        <div className="w-8 h-8 rounded-lg bg-brand-600/20 border border-brand-600/30 flex items-center justify-center shrink-0">
          <span className="text-brand-400 text-sm font-bold">{unitNum}</span>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-white group-hover:text-brand-300 transition-colors">{unit.title}</h3>
          <p className="text-xs text-gray-500 mt-0.5 truncate">
            {(unit.topics||[]).slice(0,3).join(" · ")}{(unit.topics||[]).length > 3 ? ` +${unit.topics.length-3} more` : ""}
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-xs text-gray-500">{doneCount}/{totalRes} done</span>
          {open ? <ChevronUp size={16} className="text-gray-500"/> : <ChevronDown size={16} className="text-gray-500"/>}
        </div>
      </button>

      {open && (
        <div className="mt-4">
          <div className="flex flex-wrap gap-1.5 mb-4">
            {(unit.topics||[]).map(t => <span key={t} className="badge bg-surface text-gray-400 border border-surface-border text-[11px]">{t}</span>)}
          </div>

          <div className="flex gap-1 bg-surface rounded-lg p-1 mb-4">
            {TABS.map(({ key, label, icon: Icon }) => {
              const count = unit.resources?.[key]?.length || 0;
              return (
                <button key={key} onClick={() => setTab(key)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium flex-1 justify-center transition-all
                    ${activeTab === key ? "bg-brand-600/20 text-brand-300 border border-brand-600/30" : "text-gray-500 hover:text-gray-300"}`}>
                  <Icon size={13}/>{label}
                  {count > 0 && (
                    <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${activeTab === key ? "bg-brand-600 text-white" : "bg-surface-border text-gray-400"}`}>{count}</span>
                  )}
                </button>
              );
            })}
          </div>

          {resources.length === 0
            ? <div className="text-center py-8 text-gray-600 text-sm">No {activeTab} added yet.</div>
            : (
              <div className="flex flex-col gap-2">
                {resources.map(r => (
                  <ResourceCard
                    key={r.id}
                    resource={r}
                    type={activeTab}
                    completed={completedResources.includes(r.id)}
                    myVote={myVotes[r.id] || null}
                    bookmarked={myBookmarks.includes(r.id)}
                    onComplete={onComplete}
                  />
                ))}
              </div>
            )
          }
        </div>
      )}
    </div>
  );
}

export default function SubjectDetailPage() {
  const { id } = useParams();
  const [subject,    setSubject]    = useState(null);
  const [completed,  setCompleted]  = useState([]);
  const [myVotes,    setMyVotes]    = useState({});
  const [myBookmarks,setMyBookmarks]= useState([]);
  const [loading,    setLoading]    = useState(true);

  useEffect(() => {
    Promise.all([
      subjectsApi.get(id),
      progressApi.me(),
      voteApi.myVotes(),
      bookmarkApi.list(),
    ]).then(([sRes, pRes, vRes, bRes]) => {
      setSubject(sRes.data);
      setCompleted(pRes.data.completedResources || []);
      setMyVotes(vRes.data);
      setMyBookmarks(bRes.data.map(b => b.id));
    }).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="animate-spin text-brand-400" size={28}/></div>;
  if (!subject) return <div className="text-center py-16 text-gray-500">Subject not found. <Link to="/subjects" className="text-brand-400">← Back</Link></div>;

  const allRes = subject.units.flatMap(u => Object.values(u.resources || {}).flat());
  const done   = allRes.filter(r => completed.includes(r.id)).length;
  const pct    = allRes.length > 0 ? Math.round((done / allRes.length) * 100) : 0;

  const handleComplete = (resourceId) => {
    setCompleted(prev => prev.includes(resourceId)
      ? prev.filter(id => id !== resourceId)
      : [...prev, resourceId]
    );
  };

  return (
    <div className="flex flex-col gap-5 animate-slide-up">
      <div>
        <Link to="/subjects" className="flex items-center gap-1.5 text-gray-400 hover:text-white text-sm mb-4 w-fit transition-colors">
          ← Back to Subjects
        </Link>
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-xl bg-gradient-to-br ${subject.color} opacity-80`}>
            <span className="text-2xl">{subject.icon}</span>
          </div>
          <div className="flex-1">
            <p className="text-gray-400 text-xs font-mono">{subject.code}</p>
            <h1 className="text-xl font-bold text-white">{subject.name}</h1>
            <p className="text-gray-500 text-sm mt-0.5">{subject.credits} Credits · {subject.units.length} Units</p>
          </div>
        </div>
        <div className="mt-4 card">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-400">Overall Progress</span>
            <span className="text-white font-semibold">{pct}% · {done}/{allRes.length} resources</span>
          </div>
          <div className="h-2 bg-surface rounded-full overflow-hidden">
            <div className={`h-full bg-gradient-to-r ${subject.color} rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {subject.units.map(unit => (
          <UnitSection key={unit.id} unit={unit}
            completedResources={completed}
            myVotes={myVotes}
            myBookmarks={myBookmarks}
            onComplete={handleComplete}
          />
        ))}
      </div>
    </div>
  );
}
