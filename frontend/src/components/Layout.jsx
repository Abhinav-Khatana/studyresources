import React, { useState } from "react";
import { Outlet, NavLink, useNavigate, Link } from "react-router-dom";
import { useAuth }          from "../context/AuthContext";
import { usePomodoro }      from "../context/PomodoroContext";
import { useNotifications } from "../context/NotificationContext";
import {
  LayoutDashboard, BookOpen, LogOut,
  Menu, X, GraduationCap,
  Shield, Bell, User, Sparkles, Timer,
  Bookmark, Lock, Layers3, ListChecks,
  Zap, Map, Trophy, Search, Code2,
} from "lucide-react";
import PomodoroWidget      from "./PomodoroWidget";
import NotificationDropdown from "./NotificationDropdown";

const NAV_PRIMARY = [
  { to: "/dashboard",   icon: LayoutDashboard, label: "Dashboard"   },
  { to: "/create-plan", icon: Sparkles,        label: "Create Plan" },
  { to: "/plans",       icon: Layers3,         label: "My Plans"    },
  { to: "/study-mode",  icon: Zap,             label: "Study Mode"  },
  { to: "/exam-mode",   icon: Lock,            label: "Exam Mode"   },
  { to: "/syllabus",    icon: ListChecks,      label: "PrepSheet"   },
  { to: "/dsa",         icon: Code2,           label: "DSA Prep"    },
];

const NAV_SECONDARY = [
  { to: "/subjects",    icon: BookOpen, label: "Subjects"    },
  { to: "/roadmap",     icon: Map,      label: "Roadmap"     },
  { to: "/leaderboard", icon: Trophy,   label: "Leaderboard" },
  { to: "/search",      icon: Search,   label: "Search"      },
  { to: "/bookmarks",   icon: Bookmark, label: "Bookmarks"   },
  { to: "/profile",     icon: User,     label: "Profile"     },
];

function NavItem({ to, icon: Icon, label, onClose }) {
  return (
    <NavLink to={to} onClick={onClose}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group
        ${isActive
          ? "text-sky-400 border"
          : "text-zinc-500 hover:bg-surface-hover hover:text-zinc-200 border border-transparent"}`
      }
      style={({ isActive }) => isActive ? {
        background: "rgba(14,165,233,0.1)",
        borderColor: "rgba(14,165,233,0.25)",
      } : {}}
    >
      {({ isActive }) => (
        <>
          <Icon size={17} className={isActive ? "text-sky-400" : "text-zinc-600 group-hover:text-zinc-400"} />
          <span>{label}</span>
        </>
      )}
    </NavLink>
  );
}

function SidebarContent({ onClose }) {
  const { student, logout, isAdmin } = useAuth();
  const { visible, setVisible }      = usePomodoro();
  const navigate                     = useNavigate();
  const handleLogout = () => { logout(); navigate("/"); };

  return (
    <div className="flex flex-col h-full p-4 gap-4">
      {/* Logo */}
      <Link to="/dashboard" className="flex items-center gap-2.5 px-1 py-1 group">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center"
          style={{ background: "linear-gradient(135deg, #0f766e, #0ea5e9)" }}>
          <GraduationCap size={17} className="text-white" />
        </div>
        <div>
          <p className="font-extrabold text-white text-sm tracking-tight">StudyHub</p>
          <p className="text-zinc-600 text-[10px] font-medium">Exam Prep OS</p>
        </div>
      </Link>

      {/* Primary nav */}
      <div>
        <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest px-3 mb-2">Main</p>
        <nav className="flex flex-col gap-0.5">
          {NAV_PRIMARY.map(item => <NavItem key={item.to} {...item} onClose={onClose} />)}
        </nav>
      </div>

      {/* Divider */}
      <div className="h-px bg-surface-border" />

      {/* Secondary nav */}
      <div>
        <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest px-3 mb-2">Explore</p>
        <nav className="flex flex-col gap-0.5">
          {NAV_SECONDARY.map(item => <NavItem key={item.to} {...item} onClose={onClose} />)}
          {isAdmin && <NavItem to="/admin" icon={Shield} label="Admin Panel" onClose={onClose} />}
        </nav>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Pomodoro toggle */}
      <button
        onClick={() => setVisible(v => !v)}
        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all border
          ${visible
            ? "text-orange-400 border-orange-500/30"
            : "text-zinc-500 hover:bg-surface-hover hover:text-zinc-200 border-transparent"}`}
        style={visible ? { background: "rgba(249,115,22,0.1)" } : {}}
      >
        <Timer size={17} className={visible ? "text-orange-400" : "text-gray-600"} />
        <span>Pomodoro Timer</span>
        {visible && <span className="ml-auto w-2 h-2 rounded-full bg-orange-400 animate-pulse" />}
      </button>

      {/* Student card */}
      <div className="border-t border-surface-border pt-3">
        <Link to="/profile" onClick={onClose}
          className="flex items-center gap-3 px-2 py-2 rounded-xl mb-1 group hover:bg-surface-hover transition-all">
          <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
            style={{ background: "linear-gradient(135deg, #0f766e, #0ea5e9)" }}>
            {student?.avatar || "??"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">{student?.name}</p>
            <p className="text-[11px] text-gray-500 font-mono truncate">{student?.id}</p>
          </div>
          <User size={13} className="text-gray-600 group-hover:text-brand-400 transition-colors shrink-0" />
        </Link>
        <button onClick={handleLogout}
          className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all">
          <LogOut size={15} /> Sign out
        </button>
      </div>
    </div>
  );
}

export default function Layout() {
  const { unreadCount, open, openPanel, closePanel } = useNotifications();
  const { student }    = useAuth();
  const { visible }    = usePomodoro();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="relative flex h-screen overflow-hidden bg-surface">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 h-[32rem] w-[32rem] -translate-x-1/2 rounded-full bg-brand-500/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-72 w-72 rounded-full bg-accent-500/10 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.05),transparent_45%),linear-gradient(180deg,rgba(9,9,11,0.2),rgba(9,9,11,0.92))]" />
      </div>

      {/* Desktop sidebar */}
      <aside className="relative hidden w-60 shrink-0 border-r border-white/5 bg-surface-card/90 backdrop-blur lg:flex lg:flex-col overflow-y-auto">
        <SidebarContent onClose={() => {}} />
      </aside>

      {/* Mobile sidebar */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-64 border-r border-white/10 bg-surface-card/95 backdrop-blur-xl overflow-y-auto">
            <button onClick={() => setMobileOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white p-1 z-10">
              <X size={20} />
            </button>
            <SidebarContent onClose={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="relative flex flex-1 flex-col overflow-hidden">

        {/* Top bar */}
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-white/5 bg-surface/70 px-4 py-3 backdrop-blur-xl">
          {/* Mobile hamburger */}
          <button onClick={() => setMobileOpen(true)} className="text-gray-400 hover:text-white lg:hidden">
            <Menu size={22} />
          </button>

          {/* Mobile logo */}
          <div className="flex items-center gap-2 lg:hidden">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #0f766e, #0ea5e9)" }}>
              <GraduationCap size={14} className="text-white" />
            </div>
            <span className="font-bold text-white text-sm">StudyHub</span>
          </div>

          <div className="flex-1" />

          {/* Notification bell */}
          <div className="relative">
            <button
              onClick={open ? closePanel : openPanel}
              className={`relative p-2 rounded-xl transition-all ${
                open ? "bg-brand-600/20 text-brand-400" : "text-gray-400 hover:text-white hover:bg-surface-hover"
              }`}
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-brand-500 rounded-full flex items-center justify-center text-[9px] font-bold text-white animate-pulse">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>
            <NotificationDropdown />
          </div>

          {/* Avatar */}
          <Link to="/profile"
            className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-surface-hover transition-colors group">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
              style={{ background: "linear-gradient(135deg, #0f766e, #0ea5e9)" }}>
              {student?.avatar || "??"}
            </div>
            <span className="text-sm text-gray-400 group-hover:text-white transition-colors hidden sm:block">
              {student?.name?.split(" ")[0]}
            </span>
          </Link>
        </header>

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-6xl mx-auto px-4 py-6">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Floating Pomodoro widget */}
      {visible && <PomodoroWidget />}
    </div>
  );
}
