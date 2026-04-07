import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("studyhub_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("studyhub_token");
      localStorage.removeItem("studyhub_student");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

export const authApi = {
  login: (studentId, password) => api.post("/auth/login", { studentId, password }),
  me: () => api.get("/auth/me"),
};

export const subjectsApi = {
  list: () => api.get("/subjects"),
  get: (id) => api.get(`/subjects/${id}`),
};

export const progressApi = {
  me: () => api.get("/progress/me"),
  log: (minutes) => api.post("/progress/log", { minutes }),
  complete: (resourceId) => api.post("/progress/complete", { resourceId }),
  uncomplete: (resourceId) => api.delete(`/progress/complete/${resourceId}`),
};

export const leaderboardApi = {
  get: () => api.get("/leaderboard"),
};

export const aiApi = {
  roadmap: (payload) => api.post("/ai/roadmap", payload),
  getRoadmaps: () => api.get("/ai/roadmaps"),
  deleteRoadmap: (id) => api.delete(`/ai/roadmaps/${id}`),
};

export const announcementApi = {
  list: () => api.get("/announcements"),
  create: (data) => api.post("/announcements", data),
  delete: (id) => api.delete(`/announcements/${id}`),
};

export const bookmarkApi = {
  list: () => api.get("/bookmarks"),
  add: (resourceId) => api.post("/bookmarks", { resourceId }),
  remove: (resourceId) => api.delete(`/bookmarks/${resourceId}`),
};

export const voteApi = {
  cast: (resourceId, vote) => api.post("/votes", { resourceId, vote }),
  myVotes: () => api.get("/votes/my"),
};

export const searchApi = {
  search: (q, type, subject) => api.get("/search", { params: { q, type, subject } }),
};

export const examApi = {
  list: () => api.get("/exams"),
  create: (data) => api.post("/exams", data),
  delete: (id) => api.delete(`/exams/${id}`),
};

export const adminApi = {
  getResources: () => api.get("/admin/resources"),
  getUnits: () => api.get("/admin/units"),
  addResource: (data) => api.post("/admin/resources", data),
  updateResource: (id, data) => api.put(`/admin/resources/${id}`, data),
  deleteResource: (id) => api.delete(`/admin/resources/${id}`),
};

export default api;
