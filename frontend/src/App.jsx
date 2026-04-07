import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { PomodoroProvider } from "./context/PomodoroContext";

import LoginPage         from "./pages/LoginPage";
import DashboardPage     from "./pages/DashboardPage";
import SubjectsPage      from "./pages/SubjectsPage";
import SubjectDetailPage from "./pages/SubjectDetailPage";
import LeaderboardPage   from "./pages/LeaderboardPage";
import RoadmapPage       from "./pages/RoadmapPage";
import BookmarksPage     from "./pages/BookmarksPage";
import SearchPage        from "./pages/SearchPage";
import AdminPage         from "./pages/AdminPage";
import Layout            from "./components/Layout";

function Protected({ children }) {
  const { student, loading } = useAuth();
  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-surface">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-400 text-sm">Loading StudyHub...</p>
      </div>
    </div>
  );
  return student ? children : <Navigate to="/login" replace />;
}

function AdminOnly({ children }) {
  const { isAdmin } = useAuth();
  return isAdmin ? children : <Navigate to="/dashboard" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <PomodoroProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={<Protected><Layout /></Protected>}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard"        element={<DashboardPage />} />
              <Route path="subjects"         element={<SubjectsPage />} />
              <Route path="subjects/:id"     element={<SubjectDetailPage />} />
              <Route path="leaderboard"      element={<LeaderboardPage />} />
              <Route path="roadmap"          element={<RoadmapPage />} />
              <Route path="bookmarks"        element={<BookmarksPage />} />
              <Route path="search"           element={<SearchPage />} />
              <Route path="admin"            element={<AdminOnly><AdminPage /></AdminOnly>} />
            </Route>
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </PomodoroProvider>
    </AuthProvider>
  );
}
