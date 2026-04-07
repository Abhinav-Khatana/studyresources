import React, { useState, useEffect } from "react";
import { examApi } from "../lib/api";
import { Calendar, Clock } from "lucide-react";

function CountdownBadge({ daysLeft }) {
  if (daysLeft <= 3)  return <span className="badge bg-red-500/20 text-red-400 border border-red-500/30">{daysLeft}d left — urgent!</span>;
  if (daysLeft <= 7)  return <span className="badge bg-amber-500/20 text-amber-400 border border-amber-500/30">{daysLeft}d left</span>;
  if (daysLeft <= 14) return <span className="badge bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">{daysLeft}d left</span>;
  return <span className="badge bg-surface text-gray-400 border border-surface-border">{daysLeft}d left</span>;
}

export default function ExamCountdown() {
  const [exams, setExams]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    examApi.list()
      .then(r => setExams(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading || exams.length === 0) return null;

  return (
    <div className="card">
      <h2 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
        <Calendar size={16} className="text-red-400" /> Upcoming Exams
      </h2>
      <div className="flex flex-col gap-2">
        {exams.map((exam) => (
          <div key={exam.id} className="flex items-center gap-3 py-2 border-b border-surface-border last:border-0">
            <span className="text-lg shrink-0">{exam.subject_icon}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{exam.subject_name}</p>
              <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                <Clock size={11} />
                {new Date(exam.exam_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                {exam.notes && ` · ${exam.notes}`}
              </p>
            </div>
            <CountdownBadge daysLeft={exam.days_left} />
          </div>
        ))}
      </div>
    </div>
  );
}
