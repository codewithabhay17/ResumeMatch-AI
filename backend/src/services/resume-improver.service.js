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

function parseJson(text) {
  const cleaned = String(text || "").replace(/```json/gi, "").replace(/```/g, "").trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) {
    throw new Error("AI returned invalid JSON");
  }
  try {
    return JSON.parse(cleaned.slice(start, end + 1));
  } catch (error) {
    throw new Error("AI returned invalid JSON");
  }
}

async function improveResume(resumeId, jobDescription = "") {
  // 1. Fetch Resume
  const resume = await prisma.resume.findUnique({
    where: { id: resumeId },
  });

  if (!resume) {
    throw new Error("Resume not found");
  }

  const text = String(resume.parsedText || "").slice(0, 30000);
  if (!text.trim()) {
    throw new Error("Resume has no parsed text to analyze");
  }

  // 2. Call Gemini
  const ai = getGeminiClient();
  const modelName = getModelName();

  const prompt = `You are an expert resume writer and ATS optimization specialist.
Improve this resume while preserving all factual information.
Never invent experience, skills, projects, certifications, achievements, dates, metrics, or technologies.
Improve grammar, clarity, impact, structure, action verbs, and ATS relevance.
If a target job description is provided, optimize wording for relevant keywords only when those keywords are supported by the candidate's actual experience.
Return ONLY valid JSON.

Resume:
${text}

Target job:
${jobDescription || "General resume improvement"}

Return exact structure:
{
  "overallScore": 0,
  "summary": {
    "original": "",
    "improved": "",
    "reason": ""
  },
  "experience": [
    {
      "original": "",
      "improved": "",
      "reason": ""
    }
  ],
  "projects": [
    {
      "original": "",
      "improved": "",
      "reason": ""
    }
  ],
  "skills": {
    "current": [],
    "recommended": [],
    "reason": ""
  },
  "atsKeywords": [],
  "grammarIssues": [],
  "missingSections": [],
  "improvementAreas": [],
  "overallRecommendations": []
}`;

  const response = await ai.models.generateContent({
    model: modelName,
    contents: prompt,
  });

  return parseJson(response.text);
}

module.exports = {
  improveResume,
};
