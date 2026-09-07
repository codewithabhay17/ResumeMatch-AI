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

async function analyzeCareer(resumeId, forceRegenerate = false) {
  // 1. Fetch Resume
  const resume = await prisma.resume.findUnique({
    where: { id: resumeId },
    include: { careerAnalysis: true },
  });

  if (!resume) {
    throw new Error("Resume not found");
  }

  // 2. Check existing analysis
  if (!forceRegenerate && resume.careerAnalysis) {
    return resume.careerAnalysis.analysis;
  }

  const text = String(resume.parsedText || "").slice(0, 30000);
  if (!text.trim()) {
    throw new Error("Resume has no parsed text to analyze");
  }

  // 3. Call Gemini
  const ai = getGeminiClient();
  const modelName = getModelName();

  const prompt = `You are an expert career advisor.
Analyze this resume using only information explicitly present in the resume.
Determine the candidate's strongest career directions, suitable roles, strengths, skill gaps, improvement areas, and learning roadmap.
Do not invent experience, skills, projects, certifications, achievements, or metrics.
Return ONLY valid JSON.

Resume:
${text}

Return exact structure:
{
  "careerSummary": "",
  "experienceLevel": "",
  "bestCareerArea": { "name": "", "score": 0, "reason": "" },
  "careerAreas": [{ "area": "", "score": 0, "reason": "" }],
  "recommendedRoles": [{ "role": "", "score": 0, "reason": "" }],
  "strengths": [],
  "skillGaps": [],
  "improvementAreas": [],
  "roadmap": [{ "phase": "", "skills": [], "reason": "" }],
  "recommendedProjects": [],
  "careerAdvice": ""
}`;

  const response = await ai.models.generateContent({
    model: modelName,
    contents: prompt,
  });

  const data = parseJson(response.text);

  // 4. Save to DB
  if (resume.careerAnalysis) {
    await prisma.careerAnalysis.update({
      where: { id: resume.careerAnalysis.id },
      data: { analysis: data },
    });
  } else {
    await prisma.careerAnalysis.create({
      data: {
        resumeId: resume.id,
        analysis: data,
      },
    });
  }

  return data;
}

async function getCareerAnalysis(resumeId) {
  const analysis = await prisma.careerAnalysis.findUnique({
    where: { resumeId },
  });
  return analysis ? analysis.analysis : null;
}

module.exports = {
  analyzeCareer,
  getCareerAnalysis,
};
