import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes         from "./routes/auth.js";
import subjectRoutes      from "./routes/subjects.js";
import progressRoutes     from "./routes/progress.js";
import leaderboardRoutes  from "./routes/leaderboard.js";
import aiRoutes           from "./routes/ai.js";
import announcementRoutes from "./routes/announcements.js";
import bookmarkRoutes     from "./routes/bookmarks.js";
import voteRoutes         from "./routes/votes.js";
import searchRoutes       from "./routes/search.js";
import examRoutes         from "./routes/exams.js";
import adminRoutes        from "./routes/admin.js";

dotenv.config();

const app  = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());

// ── Routes ────────────────────────────────────────────────────────────────────
app.use("/api/auth",          authRoutes);
app.use("/api/subjects",      subjectRoutes);
app.use("/api/progress",      progressRoutes);
app.use("/api/leaderboard",   leaderboardRoutes);
app.use("/api/ai",            aiRoutes);
app.use("/api/announcements", announcementRoutes);
app.use("/api/bookmarks",     bookmarkRoutes);
app.use("/api/votes",         voteRoutes);
app.use("/api/search",        searchRoutes);
app.use("/api/exams",         examRoutes);
app.use("/api/admin",         adminRoutes);

app.get("/api/health", (req, res) => res.json({ status: "ok", version: "2.0.0" }));

// ── Global error handler ──────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Internal server error", details: err.message });
});

app.listen(PORT, () => {
  console.log(`\n🚀 StudyHub v2 backend running at http://localhost:${PORT}`);
  console.log(`   Environment: ${process.env.NODE_ENV || "development"}\n`);
});
