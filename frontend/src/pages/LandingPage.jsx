import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  Sparkles, ArrowRight, CheckCircle2, Zap, Clock, Target,
  BookOpen, ChevronRight, Star, Shield, TrendingUp, Play,
  GraduationCap, Menu, X, Youtube, Code2, Brain, Trophy,
  Flame, Lock,
} from "lucide-react";
/* ─── tiny animation hook ─── */
function useInView(threshold = 0.15) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return [ref, visible];
}

/* ─── Mock sheet preview data ─── */
const MOCK_TOPICS = [
  { id: 1, title: "Arrays & Hashing", diff: "Easy",   done: true,  unit: "Unit 1" },
  { id: 2, title: "Two Pointers",     diff: "Easy",   done: true,  unit: "Unit 1" },
  { id: 3, title: "Sliding Window",   diff: "Medium", done: false, unit: "Unit 2" },
  { id: 4, title: "Binary Search",    diff: "Medium", done: false, unit: "Unit 2" },
  { id: 5, title: "Linked Lists",     diff: "Hard",   done: false, unit: "Unit 3" },
];
const DIFF_COLOR = { Easy: "#22c55e", Medium: "#eab308", Hard: "#ef4444" };

/* ─── Floating Hero Card ─── */
function FloatingCard({ delay = 0, children, style = {} }) {
  return (
    <div style={{
      animation: `float ${3 + delay}s ease-in-out infinite`,
      animationDelay: `${delay}s`,
      ...style,
    }}>
      {children}
    </div>
  );
}

/* ─── Stat Bubble ─── */
function StatBubble({ value, label, color }) {
  return (
    <div style={{
      background: "rgba(22,22,30,0.9)",
      border: "1px solid rgba(14,165,233,0.3)",
      borderRadius: 16,
      padding: "14px 20px",
      textAlign: "center",
      backdropFilter: "blur(12px)",
      minWidth: 100,
    }}>
      <div style={{ fontSize: 24, fontWeight: 800, color }}>{value}</div>
      <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }}>{label}</div>
    </div>
  );
}

/* ─── Step Card ─── */
function StepCard({ step, icon: Icon, title, desc, color, visible, delay }) {
  return (
    <div style={{
      background: "rgba(22,22,30,0.8)",
      border: "1px solid rgba(42,42,56,0.8)",
      borderRadius: 20,
      padding: "32px 28px",
      flex: 1,
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0)" : "translateY(32px)",
      transition: `all 0.6s ease ${delay}ms`,
      position: "relative",
      overflow: "hidden",
    }}>
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 3,
        background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
      }} />
      <div style={{
        width: 48, height: 48, borderRadius: 14,
        background: `${color}18`, border: `1px solid ${color}40`,
        display: "flex", alignItems: "center", justifyContent: "center",
        marginBottom: 20,
      }}>
        <Icon size={22} color={color} />
      </div>
      <div style={{ fontSize: 11, fontWeight: 700, color, letterSpacing: "0.1em", marginBottom: 8 }}>
        STEP {step}
      </div>
      <div style={{ fontSize: 18, fontWeight: 700, color: "#fff", marginBottom: 10 }}>{title}</div>
      <div style={{ fontSize: 14, color: "#9ca3af", lineHeight: 1.6 }}>{desc}</div>
    </div>
  );
}

/* ─── Testimonial Card ─── */
function TestimonialCard({ name, role, text, avatar, visible, delay }) {
  return (
    <div style={{
      background: "rgba(22,22,30,0.9)",
      border: "1px solid rgba(42,42,56,0.8)",
      borderRadius: 20,
      padding: "28px 24px",
      flex: 1,
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0)" : "translateY(32px)",
      transition: `all 0.6s ease ${delay}ms`,
    }}>
      <div style={{ display: "flex", gap: 4, marginBottom: 16 }}>
        {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="#f59e0b" color="#f59e0b" />)}
      </div>
      <p style={{ fontSize: 14, color: "#d1d5db", lineHeight: 1.7, marginBottom: 20 }}>"{text}"</p>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{
          width: 40, height: 40, borderRadius: "50%",
          background: "linear-gradient(135deg, #0369a1, #0ea5e9)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 16, fontWeight: 700, color: "#fff",
        }}>{avatar}</div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, color: "#fff" }}>{name}</div>
          <div style={{ fontSize: 12, color: "#6b7280" }}>{role}</div>
        </div>
      </div>
    </div>
  );
}

export default function LandingPage() {
  const { student, loading } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [heroRef, heroVisible] = useInView(0.1);
  const [stepsRef, stepsVisible] = useInView(0.1);
  const [previewRef, previewVisible] = useInView(0.1);
  const [testimonialRef, testimonialVisible] = useInView(0.1);
  const [premiumRef, premiumVisible] = useInView(0.1);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Compute CTA destination based on auth state
  const ctaLink = student ? "/dashboard" : "/auth";
  const ctaText = student ? "Go to Dashboard" : "Get Started";

  const S = {
    page: {
      background: "#0a0a0f",
      minHeight: "100vh",
      fontFamily: "'Inter', system-ui, sans-serif",
      color: "#fff",
      overflowX: "hidden",
    },
    nav: {
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
      background: scrolled ? "rgba(10,10,15,0.95)" : "transparent",
      backdropFilter: scrolled ? "blur(20px)" : "none",
      borderBottom: scrolled ? "1px solid rgba(42,42,56,0.5)" : "1px solid transparent",
      transition: "all 0.3s ease",
      padding: "0 clamp(16px, 5vw, 80px)",
    },
    navInner: { maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center", height: 64, gap: 8 },
    logo: { display: "flex", alignItems: "center", gap: 10, textDecoration: "none" },
    logoIcon: {
      width: 36, height: 36, borderRadius: 10,
      background: "linear-gradient(135deg, #0369a1, #0ea5e9)",
      display: "flex", alignItems: "center", justifyContent: "center",
    },
    logoText: { fontSize: 18, fontWeight: 800, color: "#fff", letterSpacing: "-0.03em" },
    navLinks: { display: "flex", alignItems: "center", gap: 32, marginLeft: "auto", marginRight: 24 },
    navLink: { fontSize: 14, color: "#9ca3af", textDecoration: "none", transition: "color 0.2s" },
    btnGhost: {
      fontSize: 14, color: "#38bdf8", background: "transparent",
      border: "1px solid rgba(14,165,233,0.3)", borderRadius: 10,
      padding: "8px 18px", cursor: "pointer", textDecoration: "none",
      transition: "all 0.2s",
    },
    btnPrimary: {
      fontSize: 14, fontWeight: 700, color: "#fff",
      background: "linear-gradient(135deg, #0369a1, #0ea5e9)",
      border: "none", borderRadius: 10, padding: "10px 22px",
      cursor: "pointer", textDecoration: "none",
      boxShadow: "0 0 24px rgba(14,165,233,0.35)",
      transition: "all 0.2s",
      display: "inline-flex", alignItems: "center", gap: 8,
    },
    section: { padding: "80px clamp(16px, 5vw, 80px)" },
    maxW: { maxWidth: 1200, margin: "0 auto" },
  };

  return (
    <div style={S.page}>
      <style>{`
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        @keyframes pulse-glow { 0%,100%{box-shadow:0 0 40px rgba(14,165,233,0.25)} 50%{box-shadow:0 0 80px rgba(14,165,233,0.5)} }
        @keyframes shimmer { 0%{background-position:-200% center} 100%{background-position:200% center} }
        .nav-link:hover { color: #38bdf8 !important; }
        .btn-ghost:hover { background: rgba(14,165,233,0.1) !important; border-color: #0ea5e9 !important; }
        .btn-primary-lg:hover { transform: translateY(-2px); box-shadow: 0 0 40px rgba(14,165,233,0.5) !important; }
        .topic-row:hover { background: rgba(14,165,233,0.06) !important; }
        .feature-card:hover { border-color: rgba(14,165,233,0.4) !important; transform: translateY(-4px); }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: #09090b; }
        ::-webkit-scrollbar-thumb { background: #27272a; border-radius: 99px; }
      `}</style>

      {/* ── NAV ── */}
      <nav style={S.nav}>
        <div style={S.navInner}>
          <Link to="/" style={S.logo}>
            <div style={S.logoIcon}><GraduationCap size={18} color="#fff" /></div>
            <span style={S.logoText}>StudyHub</span>
          </Link>
          <div style={S.navLinks} className="hidden-mobile">
            <a href="#how" style={S.navLink} className="nav-link">How it works</a>
            <a href="#features" style={S.navLink} className="nav-link">Features</a>
            <a href="#premium" style={S.navLink} className="nav-link">Premium</a>
          </div>
          <div style={{ marginLeft: "auto", display: "flex", gap: 10, alignItems: "center" }}>
            {student
              ? <Link to="/dashboard" style={S.btnGhost} className="btn-ghost">My Dashboard</Link>
              : <Link to="/auth" style={S.btnGhost} className="btn-ghost">Sign in</Link>
            }
            <Link to={ctaLink} style={{ ...S.btnPrimary, textDecoration: "none" }} className="btn-primary-lg">
              {ctaText} <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{ padding: "140px clamp(16px, 5vw, 80px) 80px", position: "relative", overflow: "hidden" }}>
        {/* Background glow */}
        <div style={{
          position: "absolute", top: "10%", left: "50%", transform: "translateX(-50%)",
          width: 800, height: 800, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(14,165,233,0.12) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />
        {/* Grid */}
        <div style={{
          position: "absolute", inset: 0, opacity: 0.04,
          backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.1) 1px,transparent 1px)",
          backgroundSize: "60px 60px",
          pointerEvents: "none",
        }} />

        <div ref={heroRef} style={{ ...S.maxW, textAlign: "center", position: "relative" }}>
          {/* Badge */}
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: "rgba(14,165,233,0.15)", border: "1px solid rgba(14,165,233,0.35)",
            borderRadius: 99, padding: "7px 16px", marginBottom: 28,
            opacity: heroVisible ? 1 : 0, transition: "opacity 0.5s ease",
          }}>
            <Sparkles size={13} color="#38bdf8" />
            <span style={{ fontSize: 12, fontWeight: 600, color: "#38bdf8" }}>AI-Powered Study Planning</span>
          </div>

          {/* Headline */}
          <h1 style={{
            fontSize: "clamp(38px, 7vw, 80px)", fontWeight: 900,
            lineHeight: 1.08, letterSpacing: "-0.04em",
            margin: "0 0 20px",
            opacity: heroVisible ? 1 : 0,
            transform: heroVisible ? "translateY(0)" : "translateY(24px)",
            transition: "all 0.6s ease 0.1s",
          }}>
            Stop wasting time.<br />
            <span style={{
              background: "linear-gradient(135deg, #0369a1 0%, #0ea5e9 50%, #34d399 100%)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            }}>Study smarter.</span>
          </h1>

          {/* Sub */}
          <p style={{
            fontSize: "clamp(16px, 2.5vw, 20px)", color: "#9ca3af",
            maxWidth: 580, margin: "0 auto 40px", lineHeight: 1.6,
            opacity: heroVisible ? 1 : 0,
            transform: heroVisible ? "translateY(0)" : "translateY(24px)",
            transition: "all 0.6s ease 0.2s",
          }}>
            Paste your syllabus. Tell us your time. Get a complete, prioritized
            <strong style={{ color: "#d1d5db" }}> A2Z study plan</strong> with resources — in seconds.
          </p>

          {/* CTAs */}
          <div style={{
            display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap",
            opacity: heroVisible ? 1 : 0,
            transition: "opacity 0.6s ease 0.3s",
          }}>
            <Link to={ctaLink} style={{
              ...S.btnPrimary, fontSize: 16, padding: "14px 32px",
              borderRadius: 14, textDecoration: "none",
              animation: "pulse-glow 3s ease-in-out infinite",
            }} className="btn-primary-lg">
              {student ? "Go to Dashboard" : "Generate My Plan — Free"} <ArrowRight size={16} />
            </Link>
            <a href="#preview" style={{
              fontSize: 15, color: "#9ca3af", background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)", borderRadius: 14,
              padding: "14px 28px", cursor: "pointer", textDecoration: "none",
              display: "flex", alignItems: "center", gap: 8, transition: "all 0.2s",
            }}>
              <Play size={15} fill="#9ca3af" /> See demo
            </a>
          </div>

          {/* Trust line */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            gap: 20, marginTop: 32, flexWrap: "wrap",
            opacity: heroVisible ? 1 : 0, transition: "opacity 0.6s ease 0.4s",
          }}>
            {[
              { icon: CheckCircle2, text: "No credit card needed", color: "#22c55e" },
              { icon: Zap,          text: "Plan ready in 10 seconds", color: "#f59e0b" },
              { icon: Shield,       text: "Free forever for students", color: "#38bdf8" },
            ].map(({ icon: Icon, text, color }) => (
              <div key={text} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <Icon size={14} color={color} />
                <span style={{ fontSize: 13, color: "#6b7280" }}>{text}</span>
              </div>
            ))}
          </div>

          {/* Floating stats */}
          <div style={{
            display: "flex", gap: 12, justifyContent: "center",
            marginTop: 60, flexWrap: "wrap",
            opacity: heroVisible ? 1 : 0, transition: "opacity 0.6s ease 0.5s",
          }}>
            <FloatingCard delay={0}><StatBubble value="10s" label="Plan generated" color="#38bdf8" /></FloatingCard>
            <FloatingCard delay={0.5}><StatBubble value="100%" label="Topic coverage" color="#22c55e" /></FloatingCard>
            <FloatingCard delay={1}><StatBubble value="A2Z" label="Prioritized plan" color="#f59e0b" /></FloatingCard>
            <FloatingCard delay={1.5}><StatBubble value="Free" label="Forever" color="#ec4899" /></FloatingCard>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how" style={S.section}>
        <div style={S.maxW}>
          <div style={{ textAlign: "center", marginBottom: 60 }}>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.25)",
              borderRadius: 99, padding: "7px 16px", marginBottom: 20,
            }}>
              <TrendingUp size={13} color="#22c55e" />
              <span style={{ fontSize: 12, fontWeight: 600, color: "#22c55e" }}>How it works</span>
            </div>
            <h2 style={{ fontSize: "clamp(28px, 5vw, 48px)", fontWeight: 800, letterSpacing: "-0.03em", margin: 0 }}>
              From <span style={{ color: "#ef4444" }}>panic</span> to{" "}
              <span style={{ color: "#22c55e" }}>plan</span> in 3 steps
            </h2>
            <p style={{ color: "#6b7280", marginTop: 14, fontSize: 16 }}>
              No signup wall. No complex setup. Just results.
            </p>
          </div>

          <div ref={stepsRef} style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
            <StepCard step={1} icon={BookOpen}  color="#0ea5e9" visible={stepsVisible} delay={0}
              title="Paste your syllabus"
              desc="Drop in any syllabus — a PDF, a copied list, university notes. AI reads and structures it instantly." />
            <StepCard step={2} icon={Target}    color="#f59e0b" visible={stepsVisible} delay={150}
              title="Set your time & goal"
              desc="Tell us how many days you have, hours per day, your subject level, and whether you're aiming to pass or top the class." />
            <StepCard step={3} icon={Sparkles}  color="#22c55e" visible={stepsVisible} delay={300}
              title="Get your A2Z plan"
              desc="Receive a complete study sheet with priority tags, day-wise plan, YouTube links, notes and practice problems per topic." />
          </div>
        </div>
      </section>

      {/* ── DEMO PREVIEW ── */}
      <section id="preview" ref={previewRef} style={{ ...S.section, background: "rgba(22,22,30,0.4)" }}>
        <div style={S.maxW}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <h2 style={{ fontSize: "clamp(26px, 4vw, 42px)", fontWeight: 800, letterSpacing: "-0.03em" }}>
              Your A2Z sheet looks like this
            </h2>
            <p style={{ color: "#6b7280", marginTop: 12, fontSize: 15 }}>
              Every topic, prioritized. Every resource, linked. Track progress as you go.
            </p>
          </div>

          <div style={{
            maxWidth: 860, margin: "0 auto",
            background: "rgba(22,22,30,0.95)",
            border: "1px solid rgba(42,42,56,0.9)",
            borderRadius: 24, overflow: "hidden",
            boxShadow: "0 40px 100px rgba(0,0,0,0.5)",
            opacity: previewVisible ? 1 : 0,
            transform: previewVisible ? "translateY(0)" : "translateY(40px)",
            transition: "all 0.8s ease",
          }}>
            {/* Window chrome */}
            <div style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "14px 20px",
              background: "rgba(15,15,19,0.8)",
              borderBottom: "1px solid rgba(42,42,56,0.6)",
            }}>
              {["#ef4444","#f59e0b","#22c55e"].map(c => (
                <div key={c} style={{ width: 12, height: 12, borderRadius: "50%", background: c }} />
              ))}
              <div style={{
                marginLeft: 12, flex: 1, background: "rgba(42,42,56,0.5)",
                borderRadius: 6, padding: "5px 12px", fontSize: 12, color: "#6b7280",
              }}>
                studyhub.app/sheet — DSA Sheet · 5 days left · Target: Score High
              </div>
            </div>

            {/* Progress bar header */}
            <div style={{ padding: "20px 24px", borderBottom: "1px solid rgba(42,42,56,0.5)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 700 }}>📊 DSA Sheet</div>
                  <div style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>5 topics · 2 done · 3 pending</div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  {["🔴 High", "🟡 Medium", "🟢 Low"].map(t => (
                    <span key={t} style={{
                      fontSize: 11, padding: "4px 10px", borderRadius: 99,
                      background: "rgba(42,42,56,0.5)", color: "#9ca3af",
                    }}>{t}</span>
                  ))}
                </div>
              </div>
              <div style={{ height: 6, background: "rgba(42,42,56,0.8)", borderRadius: 99 }}>
                <div style={{
                  height: "100%", width: "40%", borderRadius: 99,
                  background: "linear-gradient(90deg, #0369a1, #0ea5e9)",
                  transition: "width 1s ease",
                }} />
              </div>
            </div>

            {/* Column headers */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "2.2rem 1fr 2.5rem 2.5rem 2.5rem 5.5rem",
              gap: 8, padding: "10px 24px",
              fontSize: 10, fontWeight: 700, color: "#4b5563",
              textTransform: "uppercase", letterSpacing: "0.08em",
              borderBottom: "1px solid rgba(42,42,56,0.4)",
            }}>
              <span>Status</span><span>Topic</span>
              <span style={{ textAlign: "center", color: "#f87171" }}>▶ YT</span>
              <span style={{ textAlign: "center", color: "#60a5fa" }}>📄</span>
              <span style={{ textAlign: "center", color: "#fb923c" }}>💻</span>
              <span style={{ textAlign: "center" }}>Priority</span>
            </div>

            {/* Topic rows */}
            {MOCK_TOPICS.map((t, i) => (
              <div key={t.id} className="topic-row" style={{
                display: "grid",
                gridTemplateColumns: "2.2rem 1fr 2.5rem 2.5rem 2.5rem 5.5rem",
                gap: 8, padding: "14px 24px",
                borderBottom: "1px solid rgba(42,42,56,0.3)",
                alignItems: "center",
                transition: "background 0.2s",
                cursor: "default",
              }}>
                {/* Status */}
                <div style={{
                  width: 24, height: 24, borderRadius: 6,
                  border: `2px solid ${t.done ? "#22c55e" : "rgba(42,42,56,0.8)"}`,
                  background: t.done ? "rgba(34,197,94,0.15)" : "transparent",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 11, fontWeight: 700, color: "#22c55e",
                }}>
                  {t.done ? "✓" : "○"}
                </div>
                {/* Title */}
                <span style={{
                  fontSize: 14, color: t.done ? "#6b7280" : "#e5e7eb",
                  textDecoration: t.done ? "line-through" : "none",
                }}>
                  {t.title}
                  <span style={{ fontSize: 11, color: "#4b5563", marginLeft: 8 }}>{t.unit}</span>
                </span>
                {/* Icons */}
                {[{ color: "#ef4444", bg: "rgba(239,68,68,0.12)" },
                  { color: "#3b82f6", bg: "rgba(59,130,246,0.12)" },
                  { color: "#f97316", bg: "rgba(249,115,22,0.12)" }].map((ic, idx) => (
                  <div key={idx} style={{
                    width: 28, height: 28, borderRadius: 8,
                    background: ic.bg, border: `1px solid ${ic.color}30`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    margin: "0 auto", cursor: "pointer",
                  }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: ic.color, opacity: 0.8 }} />
                  </div>
                ))}
                {/* Difficulty */}
                <div style={{ display: "flex", justifyContent: "center" }}>
                  <span style={{
                    fontSize: 11, padding: "3px 8px", borderRadius: 99, fontWeight: 600,
                    color: DIFF_COLOR[t.diff],
                    background: `${DIFF_COLOR[t.diff]}18`,
                    border: `1px solid ${DIFF_COLOR[t.diff]}35`,
                  }}>{t.diff}</span>
                </div>
              </div>
            ))}

            {/* CTA inside */}
            <div style={{
              padding: "20px 24px",
              background: "linear-gradient(135deg, rgba(14,165,233,0.08), rgba(56,189,248,0.05))",
              display: "flex", alignItems: "center", justifyContent: "space-between",
            }}>
              <span style={{ fontSize: 13, color: "#9ca3af" }}>
                🎯 AI identified <strong style={{ color: "#38bdf8" }}>Binary Search</strong> as highest-priority for your exam
              </span>
              <Link to="/auth" style={{
                ...S.btnPrimary, fontSize: 13, padding: "9px 18px",
                borderRadius: 10, textDecoration: "none",
              }}>
                Create mine <ArrowRight size={13} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES GRID ── */}
      <section id="features" style={S.section}>
        <div style={S.maxW}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <h2 style={{ fontSize: "clamp(26px, 4vw, 42px)", fontWeight: 800, letterSpacing: "-0.03em" }}>
              Everything a student needs
            </h2>
            <p style={{ color: "#6b7280", marginTop: 12, fontSize: 15 }}>Built by students, for students — not corporate.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>
            {[
              { icon: Brain,       color: "#38bdf8", title: "AI Study Plans",       desc: "Paste syllabus → AI generates complete A2Z sheet with priorities in 10 seconds." },
              { icon: Target,      color: "#f59e0b", title: "Priority Tagging",      desc: "Know exactly what to study first. High/Medium/Low priority based on your goals and time." },
              { icon: Youtube,     color: "#ef4444", title: "Video Resources",       desc: "One-click YouTube tutorials for every topic. No searching, just learning." },
              { icon: Code2,       color: "#f97316", title: "Practice Links",        desc: "LeetCode, GFG, HackerRank — linked per topic. Go from theory to practice instantly." },
              { icon: TrendingUp,  color: "#22c55e", title: "Progress Tracking",     desc: "Mark topics as Done, In Revision, or Pending. Visual progress with completion %" },
              { icon: Clock,       color: "#3b82f6", title: "Day-wise Scheduling",   desc: "Your syllabus broken into a day-by-day plan that fits your available time." },
              { icon: Flame,       color: "#ef4444", title: "Streak & Gamification", desc: "Maintain study streaks, earn badges, and stay motivated with a leaderboard." },
              { icon: Trophy,      color: "#eab308", title: "Leaderboard",           desc: "See where you rank among peers. Healthy competition drives consistent effort." },
            ].map(({ icon: Icon, color, title, desc }) => (
              <div key={title} className="feature-card" style={{
                background: "rgba(22,22,30,0.8)", border: "1px solid rgba(42,42,56,0.7)",
                borderRadius: 18, padding: "28px 24px",
                transition: "all 0.3s ease", cursor: "default",
              }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 12,
                  background: `${color}18`, border: `1px solid ${color}35`,
                  display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16,
                }}>
                  <Icon size={20} color={color} />
                </div>
                <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 8 }}>{title}</div>
                <div style={{ fontSize: 13, color: "#6b7280", lineHeight: 1.6 }}>{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PREMIUM ── */}
      <section id="premium" ref={premiumRef} style={{ ...S.section, background: "rgba(22,22,30,0.4)" }}>
        <div style={{ ...S.maxW, maxWidth: 800, textAlign: "center" }}>
          <div style={{
            position: "relative", overflow: "hidden",
            background: "linear-gradient(135deg, rgba(14,165,233,0.15), rgba(56,189,248,0.08))",
            border: "1px solid rgba(14,165,233,0.35)",
            borderRadius: 28, padding: "56px 48px",
            opacity: premiumVisible ? 1 : 0,
            transform: premiumVisible ? "translateY(0)" : "translateY(32px)",
            transition: "all 0.8s ease",
          }}>
            {/* Glow */}
            <div style={{
              position: "absolute", top: -100, left: "50%", transform: "translateX(-50%)",
              width: 500, height: 300,
              background: "radial-gradient(circle, rgba(14,165,233,0.2) 0%, transparent 70%)",
              pointerEvents: "none",
            }} />
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              background: "linear-gradient(135deg, #0ea5e9, #34d399)",
              borderRadius: 99, padding: "6px 16px", marginBottom: 24,
            }}>
              <Sparkles size={12} color="#fff" />
              <span style={{ fontSize: 12, fontWeight: 700, color: "#fff" }}>COMING SOON — PREMIUM</span>
            </div>
            <h2 style={{ fontSize: "clamp(26px, 4vw, 42px)", fontWeight: 800, letterSpacing: "-0.03em", marginBottom: 16 }}>
              Exam Mode — Score Maximizer
            </h2>
            <p style={{ fontSize: 16, color: "#9ca3af", lineHeight: 1.7, marginBottom: 40, maxWidth: 560, margin: "0 auto 40px" }}>
              AI analyzes your syllabus against exam patterns to identify
              <strong style={{ color: "#fff" }}> the highest-scoring topics</strong> and generates
              a survival strategy calibrated for your exact exam.
            </p>
            <div style={{
              display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: 14, marginBottom: 40, textAlign: "left",
            }}>
              {[
                "🎯 Most frequently asked topics",
                "⚡ Last-minute survival plan",
                "📊 Score-maximizing strategy",
                "🔒 High-value sections to focus on",
              ].map(f => (
                <div key={f} style={{
                  display: "flex", alignItems: "center", gap: 10,
                  background: "rgba(255,255,255,0.04)", borderRadius: 12,
                  padding: "14px 16px", border: "1px solid rgba(255,255,255,0.08)",
                }}>
                  <Lock size={13} color="#38bdf8" style={{ flexShrink: 0 }} />
                  <span style={{ fontSize: 13, color: "#d1d5db" }}>{f}</span>
                </div>
              ))}
            </div>
            <Link to="/auth" style={{
              ...S.btnPrimary, fontSize: 15, padding: "14px 32px",
              borderRadius: 14, textDecoration: "none",
            }} className="btn-primary-lg">
              Join the waitlist <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section ref={testimonialRef} style={S.section}>
        <div style={S.maxW}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <h2 style={{ fontSize: "clamp(26px, 4vw, 40px)", fontWeight: 800, letterSpacing: "-0.03em" }}>
              Students love it
            </h2>
            <p style={{ color: "#6b7280", marginTop: 12 }}>Real students. Real results.</p>
          </div>
          <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
            <TestimonialCard visible={testimonialVisible} delay={0} avatar="P" name="Priya Sharma" role="CSE 5th Semester"
              text="I had 3 days for my DBMS exam. StudyHub generated my entire plan, highlighted what actually matters, and I ended up scoring 87%. I was expecting 60 honestly." />
            <TestimonialCard visible={testimonialVisible} delay={150} avatar="R" name="Rahul Verma" role="CSE 6th Semester"
              text="The A2Z sheet with YouTube and practice links for every topic is insane. I don't waste 30 minutes searching for what to watch anymore. Just click and study." />
            <TestimonialCard visible={testimonialVisible} delay={300} avatar="A" name="Ananya Patel" role="IT 4th Semester"
              text="The priority tagging changed how I study. I used to start from topic 1. Now I attack the high-priority stuff first. My grades went from B to A consistently." />
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section style={{ ...S.section, textAlign: "center", paddingBottom: 120 }}>
        <div style={{ maxWidth: 600, margin: "0 auto" }}>
          <h2 style={{ fontSize: "clamp(32px, 5vw, 56px)", fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 1.1 }}>
            Your exam is coming.<br />
            <span style={{
              background: "linear-gradient(135deg, #0ea5e9, #38bdf8, #34d399)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            }}>Are you ready?</span>
          </h2>
          <p style={{ color: "#6b7280", marginTop: 16, fontSize: 16, marginBottom: 40 }}>
            Generate your personalized A2Z study plan in under 10 seconds. Free forever.
          </p>
          <Link to="/auth" style={{
            ...S.btnPrimary, fontSize: 18, padding: "18px 44px",
            borderRadius: 16, textDecoration: "none",
            animation: "pulse-glow 3s ease-in-out infinite",
          }} className="btn-primary-lg">
            Get started — it's free <ArrowRight size={18} />
          </Link>
          <div style={{ marginTop: 24, fontSize: 13, color: "#4b5563" }}>
            Google or email · no clutter · straight into your prep flow
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{
        borderTop: "1px solid rgba(42,42,56,0.5)",
        padding: "32px clamp(16px, 5vw, 80px)",
      }}>
        <div style={{ ...S.maxW, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ ...S.logoIcon, width: 28, height: 28, borderRadius: 8 }}>
              <GraduationCap size={14} color="#fff" />
            </div>
            <span style={{ fontSize: 15, fontWeight: 700 }}>StudyHub</span>
          </div>
          <div style={{ fontSize: 13, color: "#4b5563" }}>
            Built for students who want to spend time studying, not planning.
          </div>
          <div style={{ display: "flex", gap: 20 }}>
            <Link to="/auth" style={{ fontSize: 13, color: "#6b7280", textDecoration: "none" }}>Get started</Link>
            <Link to="/login" style={{ fontSize: 13, color: "#6b7280", textDecoration: "none" }}>Email sign in</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
