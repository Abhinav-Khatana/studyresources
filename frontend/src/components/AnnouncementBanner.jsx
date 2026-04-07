import React, { useState, useEffect } from "react";
import { announcementApi } from "../lib/api";
import { Megaphone, X, ChevronLeft, ChevronRight } from "lucide-react";

export default function AnnouncementBanner() {
  const [announcements, setAnnouncements] = useState([]);
  const [index, setIndex]   = useState(0);
  const [dismissed, setDismissed] = useState(
    () => JSON.parse(localStorage.getItem("dismissed_announcements") || "[]")
  );

  useEffect(() => {
    announcementApi.list()
      .then(r => setAnnouncements(r.data.filter(a => !dismissed.includes(a.id))))
      .catch(() => {});
  }, []);

  const visible = announcements.filter(a => !dismissed.includes(a.id));
  if (visible.length === 0) return null;

  const current = visible[index] || visible[0];

  const dismiss = (id) => {
    const next = [...dismissed, id];
    setDismissed(next);
    localStorage.setItem("dismissed_announcements", JSON.stringify(next));
    setIndex(0);
  };

  return (
    <div className="bg-brand-600/10 border border-brand-600/30 rounded-xl px-4 py-3 flex items-start gap-3 animate-fade-in">
      <Megaphone size={16} className="text-brand-400 shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-brand-300">{current.title}</p>
        {current.content && <p className="text-xs text-gray-400 mt-0.5">{current.content}</p>}
      </div>
      <div className="flex items-center gap-1 shrink-0">
        {visible.length > 1 && (
          <>
            <button onClick={() => setIndex(i => (i - 1 + visible.length) % visible.length)}
              className="p-1 text-gray-500 hover:text-white transition-colors">
              <ChevronLeft size={14} />
            </button>
            <span className="text-xs text-gray-500">{index + 1}/{visible.length}</span>
            <button onClick={() => setIndex(i => (i + 1) % visible.length)}
              className="p-1 text-gray-500 hover:text-white transition-colors">
              <ChevronRight size={14} />
            </button>
          </>
        )}
        <button onClick={() => dismiss(current.id)}
          className="p-1 text-gray-500 hover:text-white transition-colors ml-1">
          <X size={14} />
        </button>
      </div>
    </div>
  );
}
