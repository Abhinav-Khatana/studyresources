import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { subjectsApi, progressApi } from "../lib/api";
import { ChevronRight, Loader2 } from "lucide-react";

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState([]);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    Promise.all([subjectsApi.list(), progressApi.me()])
      .then(([sRes, pRes]) => { setSubjects(sRes.data); setProgress(pRes.data); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="animate-spin text-brand-400" size={28}/>
    </div>
  );

  return (
    <div className="flex flex-col gap-6 animate-slide-up">
      <div>
        <h1 className="text-2xl font-bold text-white">Subjects</h1>
        <p className="text-gray-400 text-sm mt-1">Semester 5 · {subjects.length} subjects</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {subjects.map(sub => {
          const pct      = progress?.subjectProgress?.[sub.id] || 0;
          // DB returns unit_count (snake_case) — support both
          const unitCount = sub.unit_count || sub.unitCount || 0;
          const units     = sub.units || [];

          return (
            <Link key={sub.id} to={`/subjects/${sub.id}`}
              className="card group hover:border-brand-600/40 transition-all duration-200 flex flex-col gap-4">
              <div className="flex items-start justify-between">
                <div className={`text-3xl p-2 rounded-xl bg-gradient-to-br ${sub.color} bg-opacity-10`}>
                  {sub.icon}
                </div>
                <ChevronRight size={18} className="text-gray-600 group-hover:text-brand-400 transition-colors mt-1"/>
              </div>

              <div>
                <p className="text-xs text-gray-500 font-mono">{sub.code}</p>
                <h3 className="text-base font-semibold text-white mt-0.5 leading-tight">{sub.name}</h3>
                <p className="text-gray-500 text-xs mt-1">{sub.credits} Credits · {unitCount} Units</p>
              </div>

              <div>
                <div className="flex justify-between text-xs text-gray-500 mb-1.5">
                  <span>Progress</span>
                  <span className="text-white font-medium">{pct}%</span>
                </div>
                <div className="h-1.5 bg-surface rounded-full overflow-hidden">
                  <div className={`h-full bg-gradient-to-r ${sub.color} rounded-full transition-all duration-700`}
                    style={{ width: `${pct}%` }}/>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {units.slice(0, 3).map(u => (
                  <span key={u.id} className="badge bg-surface text-gray-400 border border-surface-border text-[10px]">
                    U{u.unitNumber || u.unit_number}: {u.title?.split(" ")[0]}
                  </span>
                ))}
                {units.length > 3 && (
                  <span className="badge bg-surface text-gray-500 border border-surface-border text-[10px]">
                    +{units.length - 3} more
                  </span>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
