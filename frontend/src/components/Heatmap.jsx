import React, { useMemo } from "react";

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const DAYS   = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

function getColor(minutes) {
  if (!minutes || minutes === 0) return "bg-surface-border";
  if (minutes < 60)  return "bg-brand-900";
  if (minutes < 120) return "bg-brand-700";
  if (minutes < 180) return "bg-brand-600";
  if (minutes < 240) return "bg-brand-500";
  return "bg-brand-400";
}

export default function Heatmap({ studyLog = {} }) {
  const { weeks, monthLabels } = useMemo(() => {
    const today = new Date();
    const start = new Date(today);
    start.setDate(start.getDate() - 7 * 26 + 1);
    start.setDate(start.getDate() - start.getDay());

    const weeks = [];
    const monthLabels = [];
    let current = new Date(start);
    let lastMonth = -1;

    while (current <= today) {
      const week = [];
      for (let d = 0; d < 7; d++) {
        const dateStr = current.toISOString().split("T")[0];
        if (current.getDay() === 0) {
          const month = current.getMonth();
          if (month !== lastMonth) {
            monthLabels.push({ index: weeks.length, label: MONTHS[month] });
            lastMonth = month;
          }
        }
        week.push({ date: dateStr, minutes: studyLog[dateStr] || 0, isFuture: current > today });
        current.setDate(current.getDate() + 1);
      }
      weeks.push(week);
    }
    return { weeks, monthLabels };
  }, [studyLog]);

  const totalMinutes = useMemo(() => Object.values(studyLog).reduce((s, m) => s + m, 0), [studyLog]);
  const activeDays   = useMemo(() => Object.values(studyLog).filter(m => m > 0).length, [studyLog]);

  return (
    <div className="w-full">
      <div className="flex items-center gap-6 mb-4 text-sm">
        <div>
          <span className="text-gray-400">Total Study Time </span>
          <span className="text-white font-semibold">{Math.floor(totalMinutes/60)}h {totalMinutes%60}m</span>
        </div>
        <div>
          <span className="text-gray-400">Active Days </span>
          <span className="text-white font-semibold">{activeDays}</span>
        </div>
      </div>

      <div className="overflow-x-auto pb-2">
        <div className="inline-flex flex-col gap-1.5 min-w-max">
          <div className="flex gap-1.5 pl-8">
            {weeks.map((_, wi) => {
              const label = monthLabels.find(m => m.index === wi);
              return (
                <div key={wi} className="w-3 text-center">
                  {label && <span className="text-gray-500 text-[10px] whitespace-nowrap">{label.label}</span>}
                </div>
              );
            })}
          </div>

          {[0,1,2,3,4,5,6].map(dayIdx => (
            <div key={dayIdx} className="flex items-center gap-1.5">
              <span className="w-7 text-right text-[10px] text-gray-600 shrink-0">
                {dayIdx % 2 === 1 ? DAYS[dayIdx] : ""}
              </span>
              {weeks.map((week, wi) => {
                const cell = week[dayIdx];
                if (!cell) return <div key={wi} className="w-3 h-3" />;
                return (
                  <div
                    key={wi}
                    title={`${cell.date} – ${cell.minutes ? Math.floor(cell.minutes/60)+"h "+cell.minutes%60+"m" : "No study"}`}
                    className={`w-3 h-3 rounded-sm transition-all cursor-default hover:ring-1 hover:ring-brand-400 hover:scale-125
                      ${cell.isFuture ? "opacity-0" : getColor(cell.minutes)}`}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2 mt-3 text-xs text-gray-500">
        <span>Less</span>
        {["bg-surface-border","bg-brand-900","bg-brand-700","bg-brand-600","bg-brand-500","bg-brand-400"].map(c => (
          <div key={c} className={`w-3 h-3 rounded-sm ${c}`} />
        ))}
        <span>More</span>
      </div>
    </div>
  );
}
