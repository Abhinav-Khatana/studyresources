import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowUpRight,
  BookOpen,
  CheckCircle2,
  Circle,
  Clock3,
  Loader2,
  MessageSquare,
  Sparkles,
  Star,
  Target,
} from "lucide-react";
import { plansApi } from "../lib/api";

const STATUS_ORDER = ["not_started", "in_progress", "done", "revise_again"];
const STATUS_LABELS = {
  not_started: "Not started",
  in_progress: "In progress",
  done: "Done",
  revise_again: "Revise again",
};

const PRIORITY_STYLES = {
  high: "border-red-500/30 bg-red-500/10 text-red-300",
  medium: "border-amber-500/30 bg-amber-500/10 text-amber-300",
  low: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
};

function topicUrl(query) {
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
}

export default function PlanDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [planRecord, setPlanRecord] = useState(null);
  const [topicStatuses, setTopicStatuses] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [noteModal, setNoteModal] = useState(null);

  useEffect(() => {
    setLoading(true);
    plansApi.get(id)
      .then((res) => {
        setPlanRecord(res.data);
        setTopicStatuses(res.data.topicStatuses || {});
      })
      .catch((err) => setError(err.response?.data?.error || "Could not load this prep plan."))
      .finally(() => setLoading(false));
  }, [id]);

  const summary = useMemo(() => planRecord?.summary || { completionPercent: 0 }, [planRecord]);

  const persistTopicChange = async (topicId, patch) => {
    const previousStatuses = topicStatuses;
    setTopicStatuses((current) => ({
      ...current,
      [topicId]: {
        ...current[topicId],
        ...patch,
      },
    }));

    try {
      await plansApi.updateTopic(id, topicId, patch);
      const refreshed = await plansApi.get(id);
      setPlanRecord(refreshed.data);
      setTopicStatuses(refreshed.data.topicStatuses || {});
    } catch (err) {
      setTopicStatuses(previousStatuses);
      setError(err.response?.data?.error || "Could not save that update.");
    }
  };

  const cycleStatus = (topicId) => {
    const current = topicStatuses[topicId]?.status || "not_started";
    const next = STATUS_ORDER[(STATUS_ORDER.indexOf(current) + 1) % STATUS_ORDER.length];
    persistTopicChange(topicId, { status: next });
  };

  const saveNote = () => {
    if (!noteModal) return;
    persistTopicChange(noteModal.topicId, { note: noteModal.value || "" });
    setNoteModal(null);
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 size={28} className="animate-spin text-brand-400" />
      </div>
    );
  }

  if (!planRecord) {
    return (
      <div className="card text-center">
        <p className="text-lg font-semibold text-white">This prep plan isn’t available.</p>
        <p className="mt-2 text-sm text-gray-500">{error || "Try returning to the plans list."}</p>
        <button onClick={() => navigate("/plans")} className="btn-primary mt-4">Back to plans</button>
      </div>
    );
  }

  const plan = planRecord.plan || {};
  const planTopics    = Array.isArray(plan.topics)         ? plan.topics         : [];
  const planDailyPlan = Array.isArray(plan.dailyPlan)      ? plan.dailyPlan      : [];
  const revisionStrat = plan.revisionStrategy              || {};
  const planResources = plan.resources                     || {};
  const planOverview  = plan.overview                      || {};

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link to="/plans" className="mb-3 inline-flex items-center gap-2 text-sm text-gray-500 hover:text-white">
            <ArrowLeft size={14} />
            Back to plans
          </Link>
          <p className="section-label">Prep Plan</p>
          <h1 className="mt-2 text-3xl font-black text-white">{planRecord.title}</h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-gray-400">{planOverview.summary || ""}</p>
        </div>
        <Link to="/create-plan" className="btn-secondary inline-flex items-center gap-2">
          <Sparkles size={16} />
          Create another plan
        </Link>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {planRecord.generationSource !== "ai" && (
        <div className="rounded-[28px] border border-amber-500/30 bg-amber-500/10 px-5 py-4 text-sm text-amber-100">
          <span className="font-semibold">Smart fallback plan:</span> {planRecord.generationNote}
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
        <section className="card">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="section-label">Progress</p>
              <h2 className="mt-2 text-xl font-bold text-white">{summary.completionPercent}% complete</h2>
            </div>
            <div className="text-right text-sm text-gray-500">
              <p>{summary.counts?.done || 0} done</p>
              <p>{summary.counts?.revise_again || 0} in revision</p>
            </div>
          </div>
          <div className="mt-4 h-3 rounded-full bg-surface">
            <div className="h-full rounded-full bg-gradient-to-r from-brand-700 via-brand-500 to-accent-400" style={{ width: `${summary.completionPercent}%` }} />
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-surface-border bg-surface px-4 py-4">
              <p className="text-xs uppercase tracking-[0.18em] text-gray-500">Quick Resume</p>
              <p className="mt-2 font-semibold text-white">{summary.nextTopic?.title || "All core topics covered"}</p>
              <p className="mt-1 text-sm text-gray-500">{summary.nextTopic?.sectionTitle || "You’re in review mode now."}</p>
            </div>
            <div className="rounded-2xl border border-surface-border bg-surface px-4 py-4">
              <p className="text-xs uppercase tracking-[0.18em] text-gray-500">Limited Time Strategy</p>
          <p className="mt-2 text-sm leading-6 text-gray-300">{planOverview.limitedTimeStrategy || ""}</p>
            </div>
          </div>
        </section>

        <section className="card">
          <p className="section-label">Plan Inputs</p>
          <div className="mt-4 space-y-3 text-sm text-gray-300">
            <div className="flex items-center justify-between"><span>Goal</span><span>{planRecord.inputSettings?.goal === "score_high" ? "Score high marks" : "Pass exam"}</span></div>
            <div className="flex items-center justify-between"><span>Days left</span><span>{planRecord.inputSettings?.daysLeft ?? "—"}</span></div>
            <div className="flex items-center justify-between"><span>Hours per day</span><span>{planRecord.inputSettings?.hoursPerDay ?? "—"}</span></div>
            <div className="flex items-center justify-between"><span>Familiarity</span><span className="capitalize">{planRecord.inputSettings?.familiarity ?? "—"}</span></div>
            <div className="flex items-center justify-between"><span>Effort</span><span className="capitalize">{planRecord.inputSettings?.effortLevel ?? "—"}</span></div>
          </div>
        </section>
      </div>

      <section className="card">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="section-label">Topic Breakdown</p>
            <h2 className="mt-2 text-xl font-bold text-white">What to study first</h2>
          </div>
        </div>

        <div className="space-y-5">
          {planTopics.map((section) => (
            <article key={section.id} className="rounded-[28px] border border-surface-border bg-surface p-4">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white">{section.title}</h3>
                  <p className="text-sm text-gray-500">{section.topics.length} topics</p>
                </div>
              </div>
              <div className="space-y-3">
                {(section.topics || []).map((topic) => {
                  const status = topicStatuses[topic.id]?.status || "not_started";
                  const note = topicStatuses[topic.id]?.note || "";
                  const starred = Boolean(topicStatuses[topic.id]?.starred);

                  return (
                    <div key={topic.id} className="rounded-3xl border border-surface-border bg-surface-card p-4">
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <button
                              type="button"
                              onClick={() => cycleStatus(topic.id)}
                              className="rounded-full border border-surface-border bg-surface px-3 py-1 text-xs text-gray-300 transition-all hover:border-brand-500/30 hover:text-white"
                            >
                              {STATUS_LABELS[status]}
                            </button>
                            <span className={`rounded-full border px-3 py-1 text-xs font-medium ${PRIORITY_STYLES[topic.priority] || PRIORITY_STYLES.medium}`}>
                              {topic.priority} priority
                            </span>
                            <span className="rounded-full border border-surface-border bg-surface px-3 py-1 text-xs text-gray-400">
                              {topic.estimatedHours}h
                            </span>
                          </div>

                          <h4 className="mt-3 text-lg font-semibold text-white">{topic.title}</h4>
                          <p className="mt-2 text-sm leading-6 text-gray-400">{topic.whyPriority}</p>

                          <div className="mt-3 grid gap-2 md:grid-cols-3">
                            {(Array.isArray(topic.keyConcepts) ? topic.keyConcepts : []).slice(0, 3).map((concept) => (
                              <div key={concept} className="rounded-2xl border border-surface-border bg-surface px-3 py-3 text-sm text-gray-300">
                                {concept}
                              </div>
                            ))}
                          </div>

                          {note && (
                            <div className="mt-3 rounded-2xl border border-brand-500/20 bg-brand-500/10 px-3 py-3 text-sm text-brand-100">
                              {note}
                            </div>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          <a
                            href={topicUrl(topic.videoRecommendation?.searchQuery || topic.title)}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-2 rounded-full border border-surface-border px-4 py-2 text-sm text-gray-300 transition-all hover:border-brand-500/30 hover:text-white"
                          >
                            <BookOpen size={14} />
                            Video
                            <ArrowUpRight size={12} />
                          </a>
                          <button
                            type="button"
                            onClick={() => persistTopicChange(topic.id, { starred: !starred })}
                            className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition-all ${
                              starred
                                ? "border-amber-500/30 bg-amber-500/10 text-amber-300"
                                : "border-surface-border text-gray-300 hover:border-amber-500/30 hover:text-white"
                            }`}
                          >
                            <Star size={14} className={starred ? "fill-amber-300" : ""} />
                            Star
                          </button>
                          <button
                            type="button"
                            onClick={() => setNoteModal({ topicId: topic.id, value: note })}
                            className="inline-flex items-center gap-2 rounded-full border border-surface-border px-4 py-2 text-sm text-gray-300 transition-all hover:border-brand-500/30 hover:text-white"
                          >
                            <MessageSquare size={14} />
                            Note
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </article>
          ))}
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
        <section className="card">
          <p className="section-label">Day-wise Plan</p>
          <div className="mt-4 space-y-3">
            {planDailyPlan.map((day) => (
              <div key={day.day} className="rounded-3xl border border-surface-border bg-surface px-4 py-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold text-white">{day.label}</p>
                    <p className="text-sm text-gray-500">{day.headline}</p>
                  </div>
                  <div className="inline-flex items-center gap-2 text-sm text-gray-400">
                    <Clock3 size={14} />
                    {day.totalHours}h
                  </div>
                </div>
                <div className="mt-3 space-y-2">
                  {(day.sessions || []).map((session) => (
                    <div key={`${day.day}-${session.topicId}`} className="flex items-start gap-3 rounded-2xl border border-surface-border bg-surface-card px-3 py-3">
                      <Target size={14} className="mt-0.5 text-brand-400" />
                      <div>
                        <p className="text-sm font-medium text-white">{session.topicTitle}</p>
                        <p className="text-sm text-gray-500">{session.focus}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="mt-3 text-sm text-brand-100">{day.revisionFocus}</p>
              </div>
            ))}
          </div>
        </section>

        <div className="space-y-4">
          <section className="card">
            <p className="section-label">Revision Strategy</p>
            <p className="mt-3 text-sm leading-6 text-gray-300">{revisionStrat.cadence || ""}</p>
            <div className="mt-4 space-y-2">
              {(revisionStrat.checkpoints || []).map((checkpoint) => (
                <div key={checkpoint} className="flex items-start gap-3 rounded-2xl border border-surface-border bg-surface px-3 py-3 text-sm text-gray-300">
                  <CheckCircle2 size={14} className="mt-0.5 text-emerald-400" />
                  {checkpoint}
                </div>
              ))}
            </div>
          </section>

          <section className="card">
            <p className="section-label">Resource Strategy</p>
            <p className="mt-3 text-sm leading-6 text-gray-300">{planResources.videoStrategy || ""}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {(planResources.recommendedChannels || []).map((channel) => (
                <span key={channel} className="rounded-full border border-surface-border bg-surface px-3 py-2 text-sm text-gray-300">
                  {channel}
                </span>
              ))}
            </div>
          </section>
        </div>
      </div>

      {noteModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onClick={(event) => event.target === event.currentTarget && setNoteModal(null)}
        >
          <div className="w-full max-w-lg rounded-[28px] border border-surface-border bg-surface-card p-6">
            <h3 className="text-xl font-bold text-white">Topic note</h3>
            <p className="mt-2 text-sm text-gray-500">Use this for formulas, revision cues, or tricky reminders.</p>
            <textarea
              rows={6}
              value={noteModal.value}
              onChange={(event) => setNoteModal((current) => ({ ...current, value: event.target.value }))}
              className="mt-4 w-full resize-none rounded-2xl border border-surface-border bg-surface px-4 py-3 text-sm text-white placeholder-gray-600 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              placeholder="Add a quick note for this topic..."
            />
            <div className="mt-5 flex items-center justify-between gap-3">
              <button onClick={() => setNoteModal(null)} className="btn-secondary">Cancel</button>
              <button onClick={saveNote} className="btn-primary">Save note</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
