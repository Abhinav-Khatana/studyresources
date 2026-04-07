import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { progressApi, subjectsApi } from "../lib/api";
import Heatmap from "../components/Heatmap";
import StatCard from "../components/StatCard";
import AnnouncementBanner from "../components/AnnouncementBanner";
import ExamCountdown from "../components/ExamCountdown";
import { Flame, Clock, Star, BookOpen, Zap, ChevronRight, Loader2, Plus } from "lucide-react";

export default function DashboardPage() {
  const { student } = useAuth();
  const [progress, setProgress] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [logMin, setLogMin]     = useState(30);
  const [logging, setLogging]   = useState(false);
  const [logMsg, setLogMsg]     = useState("");

  useEffect(() => {
    Promise.all([progressApi.me(), subjectsApi.list()])
      .then(([pRes, sRes]) => { setProgress(pRes.data); setSubjects(sRes.data); })
      .finally(() => setLoading(false));
  }, []);

  const handleLog = async () => {
    setLogging(true); setLogMsg("");
    try {
      await progressApi.log(logMin);
      const updated = await progressApi.me();
      setProgress(updated.data);
      setLogMsg(`✓ Logged ${logMin} minutes!`);
      setTimeout(() => setLogMsg(""), 3000);
    } catch { setLogMsg("Failed. Try again."); }
    finally { setLogging(false); }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="animate-spin text-brand-400" size={28} /></div>;

  const totalMinutes = progress?.totalMinutes || 0;

  return (
    <div className="flex flex-col gap-5 animate-slide-up">
      {/* Announcements */}
      <AnnouncementBanner />

      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-bold text-white">Hey, {student?.name?.split(" ")[0]} 👋</h1>
        <p className="text-gray-400 text-sm mt-1">Semester {student?.semester} · CGPA {student?.cgpa} · {student?.id}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={Clock}    label="Total Study"    value={`${(totalMinutes/60).toFixed(1)}h`}          sub="all time"         color="text-blue-400"   />
        <StatCard icon={Star}     label="Points"         value={progress?.totalPoints || 0}                   sub="+10 per resource"  color="text-amber-400"  />
        <StatCard icon={Flame}    label="Day Streak"     value={progress?.streak || 0}                        sub="days in a row"    color="text-orange-400" />
        <StatCard icon={BookOpen} label="Resources Done" value={(progress?.completedResources || []).length}  sub="all subjects"     color="text-green-400"  />
      </div>

      {/* Exam countdown */}
      <ExamCountdown />

      {/* Log study time */}
      <div className="card">
        <h2 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
          <Zap size={16} className="text-brand-400" /> Log Study Time
          <span className="text-xs text-gray-500 font-normal ml-1">— or use the Pomodoro timer in the sidebar</span>
        </h2>
        <div className="flex items-center gap-3 flex-wrap">
          {[15, 30, 45, 60, 90, 120].map(m => (
            <button key={m} onClick={() => setLogMin(m)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all
                ${logMin === m ? "bg-brand-600/20 border-brand-500 text-brand-300" : "bg-surface border-surface-border text-gray-400 hover:border-gray-500"}`}>
              {m}m
            </button>
          ))}
          <button onClick={handleLog} disabled={logging}
            className="btn-primary flex items-center gap-1.5 text-sm px-4 py-1.5 ml-auto">
            {logging ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />} Log
          </button>
          {logMsg && <span className="text-green-400 text-sm">{logMsg}</span>}
        </div>
      </div>

      {/* Heatmap */}
      <div className="card">
        <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
          <Flame size={16} className="text-orange-400" /> Study Activity
        </h2>
        <Heatmap studyLog={progress?.studyLog || {}} />
      </div>

      {/* Subject progress */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-white">Subject Progress</h2>
          <Link to="/subjects" className="text-brand-400 text-xs hover:text-brand-300 flex items-center gap-1">
            All subjects <ChevronRight size={13} />
          </Link>
        </div>
        <div className="flex flex-col gap-3">
          {subjects.map(sub => {
            const pct = progress?.subjectProgress?.[sub.id] || 0;
            return (
              <Link key={sub.id} to={`/subjects/${sub.id}`} className="group">
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-base">{sub.icon}</span>
                  <span className="text-sm text-gray-300 group-hover:text-white transition-colors flex-1 truncate">{sub.name}</span>
                  <span className="text-xs text-gray-500 font-mono shrink-0">{pct}%</span>
                </div>
                <div className="h-1.5 bg-surface rounded-full overflow-hidden ml-7">
                  <div className={`h-full bg-gradient-to-r ${sub.color} rounded-full transition-all duration-500`} style={{ width: `${pct}%` }} />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
