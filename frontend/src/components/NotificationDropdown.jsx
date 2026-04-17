import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useNotifications } from "../context/NotificationContext";
import { Bell, BellOff, Check, CheckCheck, ExternalLink, X } from "lucide-react";

const TYPE_ICONS = {
  badge:   "🏆",
  plan:    "📅",
  crash:   "🌙",
  streak:  "🔥",
  welcome: "🎉",
  exam:    "⚡",
  rank:    "🚀",
  default: "📬",
};

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr);
  const m    = Math.floor(diff / 60000);
  if (m < 1)  return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function NotificationDropdown() {
  const {
    notifications, unreadCount, open,
    markRead, markAllRead, closePanel,
    requestPushPermission,
  } = useNotifications();
  const navigate = useNavigate();
  const ref      = useRef(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) closePanel();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open, closePanel]);

  if (!open) return null;

  const handleClick = (n) => {
    if (!n.is_read) markRead(n.id);
    if (n.action_url) { navigate(n.action_url); closePanel(); }
  };

  return (
    <div
      ref={ref}
      className="absolute right-0 top-full mt-2 w-80 z-50 bg-surface-card border border-surface-border rounded-2xl shadow-2xl shadow-black/50 overflow-hidden animate-slide-up"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-surface-border">
        <div className="flex items-center gap-2">
          <Bell size={16} className="text-brand-400" />
          <span className="text-sm font-semibold text-white">Notifications</span>
          {unreadCount > 0 && (
            <span className="bg-brand-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="flex items-center gap-1 text-xs text-gray-500 hover:text-brand-400 transition-colors px-2 py-1 rounded"
            >
              <CheckCheck size={12} /> All read
            </button>
          )}
          <button onClick={closePanel} className="text-gray-500 hover:text-white p-1 rounded transition-colors">
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Notification list */}
      <div className="max-h-96 overflow-y-auto divide-y divide-surface-border">
        {notifications.length === 0 ? (
          <div className="py-12 text-center">
            <BellOff size={28} className="text-gray-700 mx-auto mb-2" />
            <p className="text-gray-500 text-sm">All caught up! 🎉</p>
            <p className="text-gray-600 text-xs mt-1">No notifications yet</p>
          </div>
        ) : (
          notifications.map((n) => (
            <button
              key={n.id}
              onClick={() => handleClick(n)}
              className={`w-full text-left px-4 py-3 flex items-start gap-3 hover:bg-surface-hover transition-colors group
                ${!n.is_read ? "bg-brand-600/5" : ""}`}
            >
              {/* Icon */}
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-base
                ${!n.is_read ? "bg-brand-600/20 border border-brand-600/30" : "bg-surface border border-surface-border"}`}>
                {TYPE_ICONS[n.type] || TYPE_ICONS.default}
              </div>
              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium leading-tight ${!n.is_read ? "text-white" : "text-gray-300"}`}>
                  {n.title}
                </p>
                {n.body && (
                  <p className="text-xs text-gray-500 mt-0.5 leading-relaxed line-clamp-2">{n.body}</p>
                )}
                <p className="text-[10px] text-gray-600 mt-1">{timeAgo(n.created_at)}</p>
              </div>
              {/* Unread dot */}
              {!n.is_read && (
                <div className="w-2 h-2 bg-brand-500 rounded-full shrink-0 mt-1.5" />
              )}
            </button>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-surface-border px-4 py-2.5 flex items-center justify-between">
        <button
          onClick={requestPushPermission}
          className="text-xs text-gray-500 hover:text-brand-400 transition-colors flex items-center gap-1"
        >
          <Bell size={11} /> Enable push alerts
        </button>
        <span className="text-[10px] text-gray-700">StudyHub Alerts</span>
      </div>
    </div>
  );
}
