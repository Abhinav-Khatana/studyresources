import React from "react";

export default function StatCard({ icon: Icon, label, value, sub, color = "text-brand-400" }) {
  return (
    <div className="card flex items-start gap-4 animate-fade-in">
      <div className={`p-2.5 rounded-lg bg-surface-hover ${color}`}>
        <Icon size={20} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-gray-400 text-xs font-medium uppercase tracking-wide">{label}</p>
        <p className="text-2xl font-bold text-white mt-0.5">{value}</p>
        {sub && <p className="text-gray-500 text-xs mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}
