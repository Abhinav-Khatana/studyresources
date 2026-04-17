import express from "express";
import cors    from "cors";
import dotenv  from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

import authRoutes          from "./routes/auth.js";
import subjectRoutes       from "./routes/subjects.js";
import progressRoutes      from "./routes/progress.js";
import leaderboardRoutes   from "./routes/leaderboard.js";
import aiRoutes            from "./routes/ai.js";
import announcementRoutes  from "./routes/announcements.js";
import bookmarkRoutes      from "./routes/bookmarks.js";
import voteRoutes          from "./routes/votes.js";
import searchRoutes        from "./routes/search.js";
import examRoutes          from "./routes/exams.js";
import adminRoutes         from "./routes/admin.js";
import notificationRoutes  from "./routes/notifications.js";
import badgeRoutes         from "./routes/badges.js";
import syllabusRoutes      from "./routes/syllabus.js";
import planRoutes          from "./routes/plans.js";
import dsaRoutes           from "./routes/dsa.js";

dotenv.config();

const app  = express();
const PORT = process.env.PORT || 5000;
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const frontendDistDir = path.resolve(__dirname, "../frontend/dist");

function getAllowedOrigins() {
  const configured = String(process.env.CORS_ORIGIN || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  return new Set([
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    ...configured,
  ]);
}

const allowedOrigins = getAllowedOrigins();

function corsOrigin(origin, callback) {
  if (!origin || allowedOrigins.has(origin)) {
    callback(null, true);
    return;
  }
  callback(new Error(`Origin ${origin} is not allowed by CORS`));
}

// ── Middleware ─────────────────────────────────────────────────────────────
app.set("trust proxy", 1);
app.use(cors({ origin: corsOrigin, credentials: true }));
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true, limit: "2mb" }));

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
app.use("/api/notifications", notificationRoutes);
app.use("/api/badges",        badgeRoutes);
app.use("/api/syllabus",      syllabusRoutes);
app.use("/api/plans",         planRoutes);
app.use("/api/dsa",           dsaRoutes);

app.get("/api/health", (req, res) => res.json({ status: "ok", version: "3.0.0" }));

if (fs.existsSync(frontendDistDir)) {
  app.use(express.static(frontendDistDir));
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api")) {
      next();
      return;
    }
    res.sendFile(path.join(frontendDistDir, "index.html"));
  });
}

// ── Global error handler ──────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Internal server error", details: err.message });
});

app.listen(PORT, () => {
  console.log(`\n🚀 StudyHub v3 backend running at http://localhost:${PORT}`);
  console.log(`   Environment: ${process.env.NODE_ENV || "development"}\n`);

  // ── Startup checks ─────────────────────────────────────────
  const geminiKey = process.env.GEMINI_API_KEY || "";
  if (!geminiKey || geminiKey.startsWith("your_")) {
    console.warn("\n⚠️  GEMINI_API_KEY is not set in backend/.env");
    console.warn("   AI features (roadmap, plans, syllabus parse) will fail.");
    console.warn("   Get a FREE key at: https://aistudio.google.com/apikey\n");
  } else {
    console.log(`   ✅ Gemini AI key detected (${geminiKey.slice(0, 6)}...)`);
  }

  const dbHost = process.env.DATABASE_URL ? "[URL]" : (process.env.DB_HOST || "localhost");
  console.log(`   💾 Database: ${dbHost}:${process.env.DB_PORT || 5432}/${process.env.DB_NAME || "studyhub"}\n`);
});

// ── Unhandled promise rejections ───────────────────────────────────────
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Promise Rejection:", reason);
});
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err.message);
});

