const { GoogleGenAI } = require("@google/genai");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is not configured");
  return new GoogleGenAI({ apiKey });
}

function getModelName() {
  return process.env.GEMINI_MODEL || "gemini-3.6-flash";
}

/**
 * Humanize a resume — rewrite its content in natural, human-sounding language
 * that AI detectors cannot flag while preserving all factual information.
 */
async function humanizeResume(resumeId) {
  const resume = await prisma.resume.findUnique({
    where: { id: resumeId },
  });

  if (!resume) {
    throw new Error("Resume not found");
  }

  const text = String(resume.parsedText || "").slice(0, 30000);
  if (!text.trim()) {
    throw new Error("Resume has no parsed text to humanize");
  }

  const ai = getGeminiClient();
  const modelName = getModelName();

  const prompt = `You are an expert human resume writer who writes in a warm, authentic, and natural voice.

Your task: Rewrite the resume text below so it sounds like a real person wrote it from scratch — NOT like AI generated it.

CRITICAL RULES for natural human writing:
1. Vary sentence lengths dramatically — mix short punchy sentences with longer flowing ones.
2. Use contractions naturally (I've, didn't, won't, it's) where they feel right.
3. Start sentences differently — avoid repeating the same sentence structure.
4. Use casual transitions: "On top of that," "Along the way," "What really stood out was," "One thing I'm proud of is," etc.
5. Add subtle personal voice — phrases like "I really enjoyed," "This taught me," "I jumped at the chance to," "I got to work on," etc.
6. Avoid AI-typical patterns: no "leveraged," "utilized," "spearheaded," "orchestrated," "facilitated," "endeavored." Use normal words: "used," "led," "built," "helped," "worked on," "set up."
7. Break the formulaic pattern — not every bullet needs to follow "Action verb + what + result." Mix in context, motivation, or learning.
8. Occasionally use incomplete thoughts or dashes for emphasis — like real people write.
9. Keep some intentional imperfection — a slightly informal phrase here and there makes it human.
10. NEVER invent new facts, dates, companies, skills, projects, achievements, or technologies. Only rephrase what already exists.
11. Preserve the resume's structure and all sections (experience, education, skills, projects, etc.).
12. Keep it professional but natural — this is still a resume, not a blog post.

Resume text to humanize:
${text}

Return ONLY the rewritten resume text. No explanations, no JSON, no markdown formatting, no code fences. Just the humanized resume content.`;

  const response = await ai.models.generateContent({
    model: modelName,
    contents: prompt,
  });

  const result = response.text;
  if (!result || !result.trim()) {
    throw new Error("AI returned an empty response");
  }

  return {
    humanizedText: result.trim(),
    originalLength: text.length,
    humanizedLength: result.trim().length,
  };
}

module.exports = {
  humanizeResume,
};
