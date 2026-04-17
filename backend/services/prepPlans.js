const VALID_STATUSES = new Set(["not_started", "in_progress", "done", "revise_again"]);
const PRIORITY_ORDER = { high: 0, medium: 1, low: 2 };

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40) || "topic";
}

function normalizeText(value, fallback = "") {
  return String(value ?? fallback).replace(/\s+/g, " ").trim();
}

function titleCase(value) {
  return normalizeText(value)
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function sanitizeTopicTitle(raw) {
  return normalizeText(raw)
    .replace(/^[\-\u2022*0-9.)\s]+/, "")
    .replace(/\s+/g, " ")
    .slice(0, 140);
}

function dedupeByTitle(items) {
  const seen = new Set();
  return items.filter((item) => {
    const key = normalizeText(item.title).toLowerCase();
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function splitTopicCandidates(raw) {
  const cleaned = sanitizeTopicTitle(raw);
  if (!cleaned) return [];

  const separators = cleaned.includes(";")
    ? cleaned.split(";")
    : cleaned.includes(",") && cleaned.length > 55
    ? cleaned.split(",")
    : [cleaned];

  return separators.map((part) => sanitizeTopicTitle(part)).filter(Boolean);
}

export function parseSyllabusToSections(rawSyllabus) {
  const lines = String(rawSyllabus || "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const sections = [];
  let current = null;

  for (const line of lines) {
    const isHeading = /^(unit|module|chapter|section)\b/i.test(line) || (/^[A-Za-z ]{3,40}:/.test(line) && !line.includes("http"));
    if (isHeading) {
      const [heading, remainder] = line.split(/:(.*)/s);
      current = {
        title: titleCase(heading || "Core Topics"),
        topics: [],
      };
      sections.push(current);
      if (remainder) {
        for (const topic of splitTopicCandidates(remainder)) {
          current.topics.push({ title: topic });
        }
      }
      continue;
    }

    if (!current) {
      current = { title: "Core Topics", topics: [] };
      sections.push(current);
    }

    for (const topic of splitTopicCandidates(line)) {
      current.topics.push({ title: topic });
    }
  }

  const normalized = sections
    .map((section, sectionIndex) => ({
      id: `section-${sectionIndex + 1}`,
      title: normalizeText(section.title, `Section ${sectionIndex + 1}`),
      topics: dedupeByTitle(section.topics).map((topic, topicIndex) => ({
        id: `topic-${sectionIndex + 1}-${topicIndex + 1}-${slugify(topic.title)}`,
        title: topic.title,
      })),
    }))
    .filter((section) => section.topics.length > 0);

  if (normalized.length > 0) return normalized;

  return [
    {
      id: "section-1",
      title: "Core Topics",
      topics: [
        { id: "topic-1-1-core-concepts", title: "Core Concepts" },
        { id: "topic-1-2-important-problems", title: "Important Problems" },
        { id: "topic-1-3-revision-notes", title: "Revision Notes" },
      ],
    },
  ];
}

function estimateTopicHours(priority, familiarity, effortLevel) {
  const base = priority === "high" ? 1.5 : priority === "medium" ? 1.1 : 0.7;
  const familiarityFactor = familiarity === "beginner" ? 1.25 : familiarity === "strong" ? 0.85 : 1;
  const effortFactor = effortLevel === "high" ? 1.05 : effortLevel === "low" ? 0.9 : 1;
  return Math.max(0.5, Math.round(base * familiarityFactor * effortFactor * 2) / 2);
}

function priorityForIndex(index, totalTopics, goal, daysLeft) {
  const ratio = totalTopics <= 1 ? 0 : index / (totalTopics - 1);
  if (daysLeft <= 3) {
    if (ratio <= 0.45) return "high";
    if (ratio <= 0.8) return "medium";
    return "low";
  }
  if (goal === "score_high") {
    if (ratio <= 0.35) return "high";
    if (ratio <= 0.75) return "medium";
    return "low";
  }
  if (ratio <= 0.5) return "high";
  if (ratio <= 0.85) return "medium";
  return "low";
}

function buildReason(priority, goal, daysLeft, title) {
  if (priority === "high") {
    if (daysLeft <= 3) return `${title} gives you the fastest score lift for a short timeline, so it needs early focus.`;
    return goal === "score_high"
      ? `${title} is a scoring anchor topic and should be locked in before lower-value sections.`
      : `${title} covers foundational marks and reduces the risk of missing easy questions.`;
  }
  if (priority === "medium") {
    return `${title} strengthens coverage after the must-do topics are secure.`;
  }
  return `${title} is useful for completeness, but it should come after the higher-yield material.`;
}

function buildKeyConcepts(title, priority) {
  return [
    `Understand the definition and core pattern behind ${title}.`,
    priority === "high" ? `Practice one exam-style question from ${title}.` : `Review one concise example for ${title}.`,
    `Write a 3-line summary so revision is faster later.`,
  ];
}

function buildQuickNotes(title, priority) {
  return priority === "high"
    ? `Make a one-page cheat sheet for ${title} with formulas, steps, and one solved example.`
    : `Capture the main idea, one example, and the most likely confusion point for ${title}.`;
}

function buildDailyPlan(flatTopics, daysLeft, hoursPerDay) {
  const totalDays = clamp(daysLeft || 1, 1, 14);
  const buckets = Array.from({ length: totalDays }, (_, i) => ({
    day: i + 1,
    label: `Day ${i + 1}`,
    sessions: [],
    totalHours: 0,
  }));

  let pointer = 0;
  for (const topic of flatTopics) {
    const bucket = buckets[pointer % totalDays];
    bucket.sessions.push({
      topicId: topic.id,
      topicTitle: topic.title,
      priority: topic.priority,
      focus: topic.priority === "high" ? "Learn + active recall" : "Concept review + quick practice",
      estimatedHours: topic.estimatedHours,
    });
    bucket.totalHours += topic.estimatedHours;
    pointer++;
  }

  return buckets.map((bucket, index) => ({
    day: bucket.day,
    label: bucket.label,
    dateLabel: index === totalDays - 1 ? `${bucket.label} · final revision` : bucket.label,
    totalHours: Math.min(Math.max(bucket.totalHours, Math.min(hoursPerDay, 1.5)), hoursPerDay + 1),
    headline: bucket.sessions[0]?.topicTitle || "Revision block",
    sessions: bucket.sessions,
    revisionFocus: index === totalDays - 1
      ? "Rapid recap of starred and high-priority topics"
      : "End with 15 minutes of active recall from today's topics",
  }));
}

function buildRevisionStrategy(flatTopics, daysLeft) {
  const highPriority = flatTopics.filter((topic) => topic.priority === "high").slice(0, 5).map((topic) => topic.title);
  return {
    cadence: daysLeft <= 3 ? "Revise twice daily: after each study block and before sleep." : "End each day with a short recall pass and reserve the last day for consolidation.",
    checkpoints: [
      "After every study block, close the notes and recall the topic in your own words.",
      "Star the topics that still feel shaky and revisit them before moving to low-priority content.",
      "Use one final pass to review formulas, definitions, and common exam traps.",
    ],
    lastDayChecklist: highPriority.length > 0 ? highPriority : ["Core formulas", "Definitions", "Most likely long questions"],
  };
}

function buildResources() {
  return {
    videoStrategy: "Use concise concept videos first, then switch to solved examples for the highest-priority topics.",
    recommendedChannels: ["Gate Smashers", "Neso Academy", "Unacademy", "Knowledge Gate"],
    searchHints: [
      "Search topic name + one shot",
      "Search topic name + important questions",
      "Search topic name + exam revision",
    ],
  };
}

export function buildFallbackPrepPlan(inputs, options = {}) {
  const sections = parseSyllabusToSections(inputs.syllabusText);
  const totalTopics = sections.reduce((sum, section) => sum + section.topics.length, 0);
  let globalIndex = 0;

  const normalizedSections = sections.map((section, sectionIndex) => ({
    id: section.id || `section-${sectionIndex + 1}`,
    title: section.title,
    topics: section.topics.map((topic, topicIndex) => {
      const priority = priorityForIndex(globalIndex, totalTopics, inputs.goal, inputs.daysLeft);
      const estimatedHours = estimateTopicHours(priority, inputs.familiarity, inputs.effortLevel);
      const normalizedTopic = {
        id: topic.id || `topic-${sectionIndex + 1}-${topicIndex + 1}-${slugify(topic.title)}`,
        title: topic.title,
        priority,
        estimatedHours,
        whyPriority: buildReason(priority, inputs.goal, inputs.daysLeft, topic.title),
        keyConcepts: buildKeyConcepts(topic.title, priority),
        quickNotes: buildQuickNotes(topic.title, priority),
        videoRecommendation: {
          title: `${topic.title} quick revision`,
          searchQuery: `${topic.title} ${inputs.goal === "score_high" ? "important questions" : "one shot"} exam prep`,
        },
        practiceRecommendation: `${topic.title} important questions`,
      };
      globalIndex += 1;
      return normalizedTopic;
    }),
  }));

  const flatTopics = normalizedSections.flatMap((section) =>
    section.topics.map((topic) => ({
      ...topic,
      sectionTitle: section.title,
    }))
  ).sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]);

  const titleBase = normalizedSections[0]?.title === "Core Topics" ? "A2Z Prep Plan" : `${normalizedSections[0]?.title} Prep Plan`;

  return {
    title: options.title || titleBase,
    overview: {
      summary: inputs.daysLeft <= 3
        ? "Time is tight, so this plan front-loads the highest-yield topics first and saves low-value material for the end."
        : "This plan balances coverage, scoring topics, and revision so you know exactly what to study each day.",
      limitedTimeStrategy: inputs.daysLeft <= 3
        ? "Prioritize high-yield topics, keep notes ultra-short, and revise every night."
        : "Start with scoring foundations, build coverage steadily, and use the final pass for revision-heavy topics.",
      goalLabel: inputs.goal === "score_high" ? "Score high marks" : "Pass exam confidently",
      estimatedTotalHours: Math.round(flatTopics.reduce((sum, topic) => sum + topic.estimatedHours, 0) * 10) / 10,
      generationMode: options.generationMode || "fallback",
      generationNote: options.generationNote || "Built from your syllabus with a smart local fallback because AI was unavailable.",
    },
    topics: normalizedSections,
    dailyPlan: buildDailyPlan(flatTopics, inputs.daysLeft, inputs.hoursPerDay),
    revisionStrategy: buildRevisionStrategy(flatTopics, inputs.daysLeft),
    resources: buildResources(),
    progress: {
      totalTopics: flatTopics.length,
      completedTopics: 0,
      completionPercent: 0,
    },
  };
}

function normalizeTopic(rawTopic, fallbackTopic, sectionIndex, topicIndex) {
  return {
    id: normalizeText(rawTopic?.id, fallbackTopic.id || `topic-${sectionIndex + 1}-${topicIndex + 1}-${slugify(rawTopic?.title || fallbackTopic.title)}`),
    title: normalizeText(rawTopic?.title, fallbackTopic.title),
    priority: ["high", "medium", "low"].includes(String(rawTopic?.priority).toLowerCase())
      ? String(rawTopic.priority).toLowerCase()
      : fallbackTopic.priority,
    estimatedHours: clamp(Number(rawTopic?.estimatedHours || fallbackTopic.estimatedHours || 1), 0.5, 8),
    whyPriority: normalizeText(rawTopic?.whyPriority, fallbackTopic.whyPriority),
    keyConcepts: Array.isArray(rawTopic?.keyConcepts) && rawTopic.keyConcepts.length > 0
      ? rawTopic.keyConcepts.map((item) => normalizeText(item)).filter(Boolean).slice(0, 4)
      : fallbackTopic.keyConcepts,
    quickNotes: normalizeText(rawTopic?.quickNotes, fallbackTopic.quickNotes),
    videoRecommendation: {
      title: normalizeText(rawTopic?.videoRecommendation?.title, fallbackTopic.videoRecommendation.title),
      searchQuery: normalizeText(rawTopic?.videoRecommendation?.searchQuery, fallbackTopic.videoRecommendation.searchQuery),
    },
    practiceRecommendation: normalizeText(rawTopic?.practiceRecommendation, fallbackTopic.practiceRecommendation),
  };
}

export function normalizeAiPrepPlan(aiPlan, inputs) {
  const fallbackPlan = buildFallbackPrepPlan(inputs, {
    generationMode: "fallback",
    generationNote: "We filled missing AI fields with a safe local fallback.",
  });

  const rawSections = Array.isArray(aiPlan?.topics)
    ? aiPlan.topics
    : Array.isArray(aiPlan?.sections)
    ? aiPlan.sections
    : [];

  const topics = rawSections.length > 0
    ? rawSections.map((section, sectionIndex) => {
        const fallbackSection = fallbackPlan.topics[sectionIndex] || fallbackPlan.topics[fallbackPlan.topics.length - 1];
        const fallbackTopics = fallbackSection?.topics || [];
        const rawTopics = Array.isArray(section?.topics) ? section.topics : [];
        return {
          id: normalizeText(section?.id, `section-${sectionIndex + 1}`),
          title: normalizeText(section?.title, fallbackSection?.title || `Section ${sectionIndex + 1}`),
          topics: (rawTopics.length > 0 ? rawTopics : fallbackTopics).map((topic, topicIndex) =>
            normalizeTopic(topic, fallbackTopics[topicIndex] || fallbackTopics[fallbackTopics.length - 1] || fallbackPlan.topics[0].topics[0], sectionIndex, topicIndex)
          ),
        };
      })
    : fallbackPlan.topics;

  const flatTopics = topics.flatMap((section) => section.topics);
  const dailyPlan = Array.isArray(aiPlan?.dailyPlan) && aiPlan.dailyPlan.length > 0
    ? aiPlan.dailyPlan.map((day, index) => ({
        day: Number(day?.day || index + 1),
        label: normalizeText(day?.label, `Day ${index + 1}`),
        dateLabel: normalizeText(day?.dateLabel, normalizeText(day?.label, `Day ${index + 1}`)),
        totalHours: clamp(Number(day?.totalHours || inputs.hoursPerDay || 2), 0.5, 12),
        headline: normalizeText(day?.headline, day?.focus || fallbackPlan.dailyPlan[index % fallbackPlan.dailyPlan.length]?.headline || "Focus session"),
        revisionFocus: normalizeText(day?.revisionFocus, fallbackPlan.dailyPlan[index % fallbackPlan.dailyPlan.length]?.revisionFocus),
        sessions: Array.isArray(day?.sessions) && day.sessions.length > 0
          ? day.sessions.map((session) => ({
              topicId: normalizeText(session?.topicId, slugify(session?.topicTitle || session?.focus || "session")),
              topicTitle: normalizeText(session?.topicTitle, session?.focus || "Topic focus"),
              priority: ["high", "medium", "low"].includes(String(session?.priority).toLowerCase())
                ? String(session.priority).toLowerCase()
                : "medium",
              focus: normalizeText(session?.focus, "Concept review"),
              estimatedHours: clamp(Number(session?.estimatedHours || 1), 0.25, 6),
            }))
          : fallbackPlan.dailyPlan[index % fallbackPlan.dailyPlan.length]?.sessions || [],
      }))
    : fallbackPlan.dailyPlan;

  return {
    title: normalizeText(aiPlan?.title, fallbackPlan.title),
    overview: {
      summary: normalizeText(aiPlan?.overview?.summary, aiPlan?.summary || fallbackPlan.overview.summary),
      limitedTimeStrategy: normalizeText(aiPlan?.overview?.limitedTimeStrategy, fallbackPlan.overview.limitedTimeStrategy),
      goalLabel: normalizeText(aiPlan?.overview?.goalLabel, fallbackPlan.overview.goalLabel),
      estimatedTotalHours: clamp(
        Number(aiPlan?.overview?.estimatedTotalHours || flatTopics.reduce((sum, topic) => sum + topic.estimatedHours, 0)),
        1,
        200
      ),
      generationMode: "ai",
      generationNote: normalizeText(aiPlan?.overview?.generationNote, "Generated with AI and normalized for a clean student-friendly experience."),
    },
    topics,
    dailyPlan,
    revisionStrategy: {
      cadence: normalizeText(aiPlan?.revisionStrategy?.cadence, fallbackPlan.revisionStrategy.cadence),
      checkpoints: Array.isArray(aiPlan?.revisionStrategy?.checkpoints) && aiPlan.revisionStrategy.checkpoints.length > 0
        ? aiPlan.revisionStrategy.checkpoints.map((item) => normalizeText(item)).filter(Boolean).slice(0, 5)
        : fallbackPlan.revisionStrategy.checkpoints,
      lastDayChecklist: Array.isArray(aiPlan?.revisionStrategy?.lastDayChecklist) && aiPlan.revisionStrategy.lastDayChecklist.length > 0
        ? aiPlan.revisionStrategy.lastDayChecklist.map((item) => normalizeText(item)).filter(Boolean).slice(0, 6)
        : fallbackPlan.revisionStrategy.lastDayChecklist,
    },
    resources: {
      videoStrategy: normalizeText(aiPlan?.resources?.videoStrategy, fallbackPlan.resources.videoStrategy),
      recommendedChannels: Array.isArray(aiPlan?.resources?.recommendedChannels) && aiPlan.resources.recommendedChannels.length > 0
        ? aiPlan.resources.recommendedChannels.map((item) => normalizeText(item)).filter(Boolean).slice(0, 6)
        : fallbackPlan.resources.recommendedChannels,
      searchHints: Array.isArray(aiPlan?.resources?.searchHints) && aiPlan.resources.searchHints.length > 0
        ? aiPlan.resources.searchHints.map((item) => normalizeText(item)).filter(Boolean).slice(0, 6)
        : fallbackPlan.resources.searchHints,
    },
    progress: {
      totalTopics: flatTopics.length,
      completedTopics: 0,
      completionPercent: 0,
    },
  };
}

export function buildPremiumPreview() {
  return {
    title: "Exam Mode",
    tagline: "Premium score-maximizing layer for last-minute prep.",
    bullets: [
      "Most-asked and highest-scoring concepts",
      "Score-maximizing topic order",
      "Last-minute survival plan for short deadlines",
      "Section-wise focus strategy for limited time",
    ],
  };
}

export function computePlanSummary(planData, topicStatuses = {}) {
  const flatTopics = (planData?.topics || []).flatMap((section) =>
    (section.topics || []).map((topic) => ({ ...topic, sectionTitle: section.title }))
  );
  const totalTopics = flatTopics.length;
  const counts = {
    not_started: 0,
    in_progress: 0,
    done: 0,
    revise_again: 0,
  };
  let starredCount = 0;

  for (const topic of flatTopics) {
    const status = topicStatuses[topic.id]?.status;
    const normalizedStatus = VALID_STATUSES.has(status) ? status : "not_started";
    counts[normalizedStatus] += 1;
    if (topicStatuses[topic.id]?.starred) starredCount += 1;
  }

  const completionPercent = totalTopics ? Math.round((counts.done / totalTopics) * 100) : 0;
  const nextTopic = flatTopics.find((topic) => topicStatuses[topic.id]?.status !== "done") || null;

  const revisionBlock = flatTopics.find((topic) => topicStatuses[topic.id]?.status === "revise_again")
    || flatTopics.find((topic) => topic.priority === "high" && topicStatuses[topic.id]?.status !== "done")
    || nextTopic;

  return {
    totalTopics,
    completionPercent,
    counts,
    starredCount,
    nextTopic: nextTopic
      ? { id: nextTopic.id, title: nextTopic.title, priority: nextTopic.priority, sectionTitle: nextTopic.sectionTitle }
      : null,
    revisionBlock: revisionBlock
      ? { id: revisionBlock.id, title: revisionBlock.title, priority: revisionBlock.priority, sectionTitle: revisionBlock.sectionTitle }
      : null,
  };
}
