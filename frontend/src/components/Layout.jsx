import React, { useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { usePomodoro } from "../context/PomodoroContext";
import {
  LayoutDashboard, BookOpen, Trophy, Map, LogOut,
  Menu, X, GraduationCap, ChevronRight, Bookmark,
  Search, Shield, Timer,
} from "lucide-react";
import PomodoroWidget from "./PomodoroWidget";

export default function Layout() {
  const { student, logout, isAdmin } = useAuth();
  const { visible, setVisible }      = usePomodoro();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen]  = useState(false);

  const handleLogout = () => { logout(); navigate("/login"); };

  const NAV = [
    { to: "/dashboard",   icon: LayoutDashboard, label: "Dashboard"   },
    { to: "/subjects",    icon: BookOpen,         label: "Subjects"    },
    { to: "/leaderboard", icon: Trophy,           label: "Leaderboard" },
    { to: "/roadmap",     icon: Map,              label: "AI Roadmap"  },
    { to: "/bookmarks",   icon: Bookmark,         label: "Bookmarks"   },
    { to: "/search",      icon: Search,           label: "Search"      },
    ...(isAdmin ? [{ to: "/admin", icon: Shield, label: "Admin Panel" }] : []),
  ];

  const SidebarContent = ({ onClose }) => (
    <div className="flex flex-col h-full p-4 gap-6">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-1">
        <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
          <GraduationCap size={18} className="text-white" />
        </div>
        <div>
          <p className="font-bold text-white text-sm">StudyHub</p>
          <p className="text-gray-500 text-xs">CSE Department</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-1 flex-1">
        {NAV.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group
              ${isActive
                ? "bg-brand-600/20 text-brand-400 border border-brand-600/30"
                : "text-gray-400 hover:bg-surface-hover hover:text-white border border-transparent"}`
            }>
            {({ isActive }) => (
              <>
                <Icon size={18} className={isActive ? "text-brand-400" : "text-gray-500 group-hover:text-gray-300"} />
                <span>{label}</span>
                {isActive && <ChevronRight size={14} className="ml-auto text-brand-500" />}
              </>
            )}
          </NavLink>
        ))}

        {/* Pomodoro toggle button */}
        <button
          onClick={() => setVisible(v => !v)}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 border
            ${visible
              ? "bg-orange-500/20 text-orange-400 border-orange-500/30"
              : "text-gray-400 hover:bg-surface-hover hover:text-white border-transparent"}`}
        >
          <Timer size={18} className={visible ? "text-orange-400" : "text-gray-500"} />
          <span>Pomodoro</span>
          {visible && <ChevronRight size={14} className="ml-auto text-orange-500" />}
        </button>
      </nav>

      {/* Student card */}
      <div className="border-t border-surface-border pt-4">
        <div className="flex items-center gap-3 px-2 mb-3">
          <div className="w-9 h-9 rounded-full bg-brand-700 flex items-center justify-center text-xs font-bold text-brand-200 shrink-0">
            {student?.avatar || "??"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{student?.name}</p>
            <p className="text-xs text-gray-500 font-mono truncate">{student?.id}</p>
          </div>
        </div>
        <button onClick={handleLogout}
          className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all">
          <LogOut size={16} /> Sign out
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-surface">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-56 shrink-0 border-r border-surface-border bg-surface-card flex-col">
        <SidebarContent onClose={() => {}} />
      </aside>

      {/* Mobile sidebar */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-64 bg-surface-card border-r border-surface-border">
            <button onClick={() => setMobileOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white p-1">
              <X size={20} />
            </button>
            <SidebarContent onClose={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="lg:hidden flex items-center gap-3 px-4 py-3 border-b border-surface-border bg-surface-card">
          <button onClick={() => setMobileOpen(true)} className="text-gray-400 hover:text-white">
            <Menu size={22} />
          </button>
          <GraduationCap size={18} className="text-brand-400" />
          <span className="font-bold text-white text-sm">StudyHub</span>
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
