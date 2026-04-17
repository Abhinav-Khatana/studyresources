import { GoogleGenAI } from "@google/genai";

const modelName = process.env.GEMINI_MODEL || "gemini-2.0-flash";
const hasGeminiKey = Boolean(process.env.GEMINI_API_KEY && !process.env.GEMINI_API_KEY.startsWith("your_"));
const ai = hasGeminiKey ? new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY }) : null;

export function createGeminiError(code, status, message, extra = {}) {
  const err = new Error(message);
  err.code = code;
  err.status = status;
  Object.assign(err, extra);
  return err;
}

function extractJsonBlock(text) {
  const cleaned = String(text || "")
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  if (!cleaned) {
    throw createGeminiError("empty_response", 502, "The AI response was empty.");
  }

  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");
  if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
    throw createGeminiError("invalid_json", 502, "The AI response was not valid JSON.");
  }

  return cleaned.slice(firstBrace, lastBrace + 1);
}

export function mapGeminiError(err) {
  const rawMessage = err?.message || "";
  const message = rawMessage.toLowerCase();

  if (!hasGeminiKey) {
    return createGeminiError(
      "gemini_not_configured",
      503,
      "Gemini is not configured yet. Add GEMINI_API_KEY in backend/.env to enable AI generation."
    );
  }

  if (err?.code && err?.status) return err;

  if (err?.status === 429 || message.includes("429") || message.includes("quota") || message.includes("rate limit")) {
    return createGeminiError(
      "gemini_rate_limited",
      429,
      "Gemini is busy right now. We can retry, or fall back to a smart local plan.",
      { retryAfterSeconds: 45 }
    );
  }

  if (message.includes("api key") || message.includes("permission")) {
    return createGeminiError("gemini_auth_error", 503, "Gemini could not be reached with the current API configuration.");
  }

  return createGeminiError("gemini_failed", 502, rawMessage || "Gemini could not generate a plan right now.");
}

export async function askGeminiJson(prompt, { retries = 3 } = {}) {
  if (!hasGeminiKey || !ai) {
    throw mapGeminiError(createGeminiError("gemini_not_configured", 503, "Gemini is not configured."));
  }

  let lastError = null;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await ai.models.generateContent({
        model: modelName,
        contents: prompt,
      });
      return JSON.parse(extractJsonBlock(response.text));
    } catch (err) {
      lastError = mapGeminiError(err);
      if (lastError.status === 429 && attempt < retries) {
        const waitMs = attempt * 5000;
        await new Promise((resolve) => setTimeout(resolve, waitMs));
        continue;
      }
      throw lastError;
    }
  }

  throw lastError || createGeminiError("gemini_failed", 502, "Gemini could not generate a plan.");
}

export { hasGeminiKey, modelName };
