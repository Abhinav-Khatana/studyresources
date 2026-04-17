import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth }               from "./context/AuthContext";
import { PomodoroProvider }                    from "./context/PomodoroContext";
import { NotificationProvider }                from "./context/NotificationContext";

import LandingPage        from "./pages/LandingPage";
import AuthChoicePage     from "./pages/AuthChoicePage";
import LoginPage          from "./pages/LoginPage";
import RegisterPage       from "./pages/RegisterPage";
import DashboardPage      from "./pages/DashboardPage";
import CreatePlanPage     from "./pages/CreatePlanPage";
import PlansPage          from "./pages/PlansPage";
import PlanDetailPage     from "./pages/PlanDetailPage";
import ExamModePage       from "./pages/ExamModePage";
import SubjectsPage       from "./pages/SubjectsPage";
import SubjectDetailPage  from "./pages/SubjectDetailPage";
import BookmarksPage      from "./pages/BookmarksPage";
import AdminPage          from "./pages/AdminPage";
import ProfilePage        from "./pages/ProfilePage";
import RoadmapPage        from "./pages/RoadmapPage";
import StudyModePage      from "./pages/StudyModePage";
import LeaderboardPage    from "./pages/LeaderboardPage";
import SearchPage         from "./pages/SearchPage";
import SyllabusSheetPage  from "./pages/SyllabusSheetPage";
import DSAPrepPage        from "./pages/DSAPrepPage";
import Layout             from "./components/Layout";

function Protected({ children }) {
  const { student, loading } = useAuth();
  if (loading) return (
    <div style={{
      height: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: "#0a0a0f",
    }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
        <div style={{
          width: 40, height: 40, borderRadius: "50%",
          border: "3px solid #0ea5e9", borderTopColor: "transparent",
          animation: "spin 0.8s linear infinite",
        }} />
        <p style={{ color: "#6b7280", fontSize: 14 }}>Loading StudyHub...</p>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
  return student ? children : <Navigate to="/login" replace />;
}

function AdminOnly({ children }) {
  const { isAdmin } = useAuth();
  return isAdmin ? children : <Navigate to="/dashboard" replace />;
}

function GuestOnly({ children }) {
  const { student, loading } = useAuth();
  if (loading) return (
    <div style={{
      height: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: "#0a0a0f",
    }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
        <div style={{
          width: 40, height: 40, borderRadius: "50%",
          border: "3px solid #0ea5e9", borderTopColor: "transparent",
          animation: "spin 0.8s linear infinite",
        }} />
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
  return student ? <Navigate to="/dashboard" replace /> : children;
}

export default function App() {
  return (
    <AuthProvider>
      <PomodoroProvider>
        <NotificationProvider>
          <BrowserRouter>
            <Routes>
              {/* Public landing page — no auth needed */}
              <Route path="/"         element={<LandingPage />} />
              <Route path="/auth"     element={<GuestOnly><AuthChoicePage /></GuestOnly>} />
              <Route path="/login"    element={<GuestOnly><LoginPage /></GuestOnly>} />
              <Route path="/register" element={<GuestOnly><RegisterPage /></GuestOnly>} />

              {/* Protected app routes */}
              <Route path="/app" element={<Protected><Layout /></Protected>}>
                <Route index element={<Navigate to="/dashboard" replace />} />
              </Route>
              <Route element={<Protected><Layout /></Protected>}>
                <Route path="dashboard"      element={<DashboardPage />} />
                <Route path="create-plan"    element={<CreatePlanPage />} />
                <Route path="plans"          element={<PlansPage />} />
                <Route path="plans/:id"      element={<PlanDetailPage />} />
                <Route path="exam-mode"      element={<ExamModePage />} />
                <Route path="subjects"       element={<SubjectsPage />} />
                <Route path="subjects/:id"   element={<SubjectDetailPage />} />
                <Route path="bookmarks"      element={<BookmarksPage />} />
                <Route path="profile"        element={<ProfilePage />} />
                <Route path="syllabus"       element={<SyllabusSheetPage />} />
                <Route path="study-mode"     element={<StudyModePage />} />
                <Route path="roadmap"        element={<RoadmapPage />} />
                <Route path="leaderboard"    element={<LeaderboardPage />} />
                <Route path="search"         element={<SearchPage />} />
                <Route path="admin"          element={<AdminOnly><AdminPage /></AdminOnly>} />
                <Route path="dsa"            element={<DSAPrepPage />} />
                {/* Legacy aliases */}
                <Route path="sheet"          element={<Navigate to="/syllabus" replace />} />
                <Route path="prepsheet"      element={<Navigate to="/syllabus" replace />} />
              </Route>

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </NotificationProvider>
      </PomodoroProvider>
    </AuthProvider>
  );
}
