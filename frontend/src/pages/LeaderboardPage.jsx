import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { leaderboardApi } from "../lib/api";
import { Trophy, Flame, Clock, Star, BookOpen, Loader2 } from "lucide-react";

const MEDALS = { 1: "🥇", 2: "🥈", 3: "🥉" };

export default function LeaderboardPage() {
  const { student }       = useAuth();
  const [board, setBoard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab]     = useState("points");

  useEffect(() => {
    leaderboardApi.get().then(r => setBoard(r.data)).finally(() => setLoading(false));
  }, []);

  const sorted = [...board].sort((a, b) =>
    tab === "points" ? b.totalPoints - a.totalPoints :
    tab === "streak"  ? b.streak - a.streak :
    b.totalMinutes - a.totalMinutes
  ).map((s, i) => ({ ...s, rank: i + 1 }));

  const me = sorted.find(s => s.id === student?.id);

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="animate-spin text-brand-400" size={28} /></div>;

  return (
    <div className="flex flex-col gap-6 animate-slide-up">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Trophy size={22} className="text-yellow-400" /> Leaderboard
        </h1>
        <p className="text-gray-400 text-sm mt-1">CSE Batch 2021</p>
      </div>

      {me && (
        <div className="card border-brand-600/30 bg-brand-600/5">
          <p className="text-xs text-brand-400 font-medium mb-2 uppercase tracking-wide">Your Rank</p>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-surface-hover border border-surface-border flex items-center justify-center text-lg">
              {MEDALS[me.rank] || `#${me.rank}`}
            </div>
            <div>
              <p className="text-white font-semibold">{me.name}</p>
              <p className="text-gray-400 text-sm">{me.totalPoints} pts · {me.streak} day streak</p>
            </div>
            <div className="ml-auto text-right">
              <p className="text-2xl font-bold text-brand-400">#{me.rank}</p>
              <p className="text-gray-500 text-xs">of {board.length}</p>
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-1 bg-surface-card border border-surface-border rounded-lg p-1 w-fit">
        {[{key:"points",label:"Points",icon:Star},{key:"streak",label:"Streak",icon:Flame},{key:"hours",label:"Hours",icon:Clock}].map(({key,label,icon:Icon}) => (
          <button key={key} onClick={() => setTab(key)}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-md text-sm font-medium transition-all
              ${tab === key ? "bg-brand-600/20 text-brand-300 border border-brand-600/30" : "text-gray-500 hover:text-gray-300"}`}>
            <Icon size={14}/>{label}
          </button>
        ))}
      </div>

      <div className="card p-0 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-surface-border">
              <th className="text-left text-xs text-gray-500 font-medium px-5 py-3 uppercase tracking-wide">Rank</th>
              <th className="text-left text-xs text-gray-500 font-medium px-5 py-3 uppercase tracking-wide">Student</th>
              <th className="text-right text-xs text-gray-500 font-medium px-5 py-3 uppercase tracking-wide hidden sm:table-cell">Resources</th>
              <th className="text-right text-xs text-gray-500 font-medium px-5 py-3 uppercase tracking-wide hidden md:table-cell">Streak</th>
              <th className="text-right text-xs text-gray-500 font-medium px-5 py-3 uppercase tracking-wide">Score</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map(s => {
              const isMe = s.id === student?.id;
              return (
                <tr key={s.id} className={`border-b border-surface-border last:border-0 transition-colors ${isMe ? "bg-brand-600/5" : "hover:bg-surface-hover"}`}>
                  <td className="px-5 py-3.5">
                    <span className="text-lg">{MEDALS[s.rank] || <span className="text-xs text-gray-500 font-mono font-bold">#{s.rank}</span>}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${isMe ? "bg-brand-600 text-white" : "bg-surface-hover text-gray-300"}`}>{s.avatar}</div>
                      <div>
                        <p className={`text-sm font-medium ${isMe ? "text-brand-300" : "text-white"}`}>{s.name} {isMe && <span className="text-brand-500 text-xs">(you)</span>}</p>
                        <p className="text-xs text-gray-500 font-mono">{s.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-right text-sm text-gray-400 hidden sm:table-cell">
                    <span className="flex items-center justify-end gap-1"><BookOpen size={13} className="text-gray-600"/>{s.resourcesCompleted}</span>
                  </td>
                  <td className="px-5 py-3.5 text-right hidden md:table-cell">
                    <span className="flex items-center justify-end gap-1 text-sm text-orange-400"><Flame size={13}/>{s.streak}d</span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <span className={`text-sm font-semibold ${isMe ? "text-brand-400" : "text-white"}`}>
                      {tab === "points" ? `${s.totalPoints.toLocaleString()} pts` : tab === "streak" ? `${s.streak}d` : `${(s.totalMinutes/60).toFixed(1)}h`}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
