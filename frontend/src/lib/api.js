import axios from "axios";

const rawBaseUrl = import.meta.env.VITE_API_BASE_URL || "/api";
const baseURL = rawBaseUrl.endsWith("/") ? rawBaseUrl.slice(0, -1) : rawBaseUrl;

const api = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("studyhub_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      sessionStorage.removeItem("studyhub_token");
      sessionStorage.removeItem("studyhub_student");
      localStorage.removeItem("studyhub_token");
      localStorage.removeItem("studyhub_student");
      if (!["/", "/auth", "/login", "/register"].includes(window.location.pathname)) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(err);
  }
);

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authApi = {
  login:          (identifier, password) => api.post("/auth/login", { identifier, password }),
  google:         (idToken)             => api.post("/auth/google", { idToken }),
  register:       (data)               => api.post("/auth/register", data),
  me:             ()                   => api.get("/auth/me"),
  updateProfile:  (data)               => api.patch("/auth/profile", data),
  updateAvatar:   (avatar)             => api.patch("/auth/avatar", { avatar }),
  changePassword: (data)               => api.patch("/auth/password", data),
};

// ── Subjects ──────────────────────────────────────────────────────────────────
export const subjectsApi = {
  list: () => api.get("/subjects"),
  get:  (id) => api.get(`/subjects/${id}`),
};

// ── Progress ──────────────────────────────────────────────────────────────────
export const progressApi = {
  me:         ()           => api.get("/progress/me"),
  log:        (minutes)    => api.post("/progress/log", { minutes }),
  complete:   (resourceId) => api.post("/progress/complete", { resourceId }),
  uncomplete: (resourceId) => api.delete(`/progress/complete/${resourceId}`),
};

// ── Leaderboard ───────────────────────────────────────────────────────────────
export const leaderboardApi = { get: () => api.get("/leaderboard") };

// ── AI ────────────────────────────────────────────────────────────────────────
export const aiApi = {
  roadmap:      (payload)  => api.post("/ai/roadmap", payload),
  getRoadmaps:  ()         => api.get("/ai/roadmaps"),
  deleteRoadmap:(id)       => api.delete(`/ai/roadmaps/${id}`),
  weeklyPlan:   (payload)  => api.post("/ai/weekly-plan", payload),
  crashPlan:    (payload)  => api.post("/ai/crash-plan", payload),
  getPlans:     ()         => api.get("/ai/plans"),
};

// ── Announcements ─────────────────────────────────────────────────────────────
export const announcementApi = {
  list:   ()     => api.get("/announcements"),
  create: (data) => api.post("/announcements", data),
  delete: (id)   => api.delete(`/announcements/${id}`),
};

// ── Bookmarks ─────────────────────────────────────────────────────────────────
export const bookmarkApi = {
  list:   ()           => api.get("/bookmarks"),
  add:    (resourceId) => api.post("/bookmarks", { resourceId }),
  remove: (resourceId) => api.delete(`/bookmarks/${resourceId}`),
};

// ── Votes ─────────────────────────────────────────────────────────────────────
export const voteApi = {
  cast:    (resourceId, vote) => api.post("/votes", { resourceId, vote }),
  myVotes: ()                 => api.get("/votes/my"),
};

// ── Search ────────────────────────────────────────────────────────────────────
export const searchApi = {
  search: (q, type, subject) => api.get("/search", { params: { q, type, subject } }),
};

// ── Exams ─────────────────────────────────────────────────────────────────────
export const examApi = {
  list:   ()     => api.get("/exams"),
  create: (data) => api.post("/exams", data),
  delete: (id)   => api.delete(`/exams/${id}`),
};

// ── Admin ─────────────────────────────────────────────────────────────────────
export const adminApi = {
  getResources:   ()         => api.get("/admin/resources"),
  getUnits:       ()         => api.get("/admin/units"),
  addResource:    (data)     => api.post("/admin/resources", data),
  updateResource: (id, data) => api.put(`/admin/resources/${id}`, data),
  deleteResource: (id)       => api.delete(`/admin/resources/${id}`),
};

// ── Notifications ─────────────────────────────────────────────────────────────
export const notificationApi = {
  list:           () => api.get("/notifications"),
  unreadCount:    () => api.get("/notifications/unread-count"),
  markRead:       (id) => api.post(`/notifications/read/${id}`),
  markAllRead:    () => api.post("/notifications/read-all"),
  subscribe:      (sub) => api.post("/notifications/push-subscribe", { subscription: sub }),
  vapidKey:       () => api.get("/notifications/vapid-key"),
};

// ── Badges ────────────────────────────────────────────────────────────────────
export const badgeApi = { list: () => api.get("/badges") };

// ── DSA Prep ──────────────────────────────────────────────────────────────────
export const dsaApi = {
  getProgress:     ()           => api.get("/dsa/progress"),
  updateProgress:  (id, data)   => api.patch(`/dsa/progress/${id}`, data),
};


// ── Syllabus Sheet Tracker ─────────────────────────────────────────────────────
export const syllabusApi = {
  parse:       (rawSyllabus, title)       => api.post("/syllabus/parse", { rawSyllabus, title }),
  list:        ()                         => api.get("/syllabus"),
  get:         (id)                       => api.get(`/syllabus/${id}`),
  create:      (data)                     => api.post("/syllabus", data),
  updateTopic: (sheetId, topicId, data)   => api.patch(`/syllabus/${sheetId}/topic/${topicId}`, data),
  delete:      (id)                       => api.delete(`/syllabus/${id}`),
};

export const plansApi = {
  generate:    (data)                     => api.post("/plans/generate", data),
  list:        ()                         => api.get("/plans"),
  get:         (id)                       => api.get(`/plans/${id}`),
  updateTopic: (planId, topicId, data)    => api.patch(`/plans/${planId}/topic/${topicId}`, data),
  delete:      (id)                       => api.delete(`/plans/${id}`),
};

export default api;
