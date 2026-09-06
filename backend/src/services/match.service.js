const { PrismaClient } = require('@prisma/client');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const prisma = new PrismaClient();
const genAI = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null;
const AI_MODEL = process.env.GEMINI_MODEL || 'gemini-3.6-flash';

/**
 * Calculate match score between resume and job
 */
async function calculateMatchScore(resumeId, jobId, userId) {
  try {
    // Get resume with skills and verify it belongs to the authenticated user
    const resume = await prisma.resume.findFirst({
      where: { id: resumeId, userId },
      include: {
        skills: {
          include: {
            skill: true,
          },
        },
      },
    });

    if (!resume) {
      throw new Error('Resume not found');
    }

    // Get job with skills
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: {
        skills: {
          include: {
            skill: true,
          },
        },
      },
    });

    if (!job) {
      throw new Error('Job not found');
    }

    // Extract skill names
    const resumeSkills = new Set(resume.skills.map(rs => rs.skill.name.toLowerCase()));
    const jobSkills = job.skills.map(js => ({
      name: js.skill.name.toLowerCase(),
      required: js.required,
    }));

    // Calculate match
    const matchedSkills = [];
    const missingSkills = [];
    let matchPoints = 0;
    let totalPoints = 0;

    for (const jobSkill of jobSkills) {
      totalPoints += jobSkill.required ? 2 : 1;

      if (resumeSkills.has(jobSkill.name)) {
        matchPoints += jobSkill.required ? 2 : 1;
        matchedSkills.push(jobSkill.name);
      } else {
        missingSkills.push(jobSkill.name);
      }
    }

    const matchScore = totalPoints > 0 ? (matchPoints / totalPoints) * 100 : 0;

    // Check if match already exists
    let match = await prisma.jobMatch.findUnique({
      where: {
        userId_jobId: {
          userId,
          jobId,
        },
      },
    });

    if (match) {
      // Update existing match
      match = await prisma.jobMatch.update({
        where: { id: match.id },
        data: {
          matchScore,
          matchedSkills,
          missingSkills,
        },
      });
    } else {
      // Create new match
      match = await prisma.jobMatch.create({
        data: {
          userId,
          jobId,
          matchScore,
          matchedSkills,
          missingSkills,
        },
      });
    }

    return match;
  } catch (error) {
    throw new Error(`Failed to calculate match score: ${error.message}`);
  }
}

/**
 * Generate AI analysis for job match
 */
async function generateAIAnalysis(matchId, resumeId, jobId, userId) {
  try {
    const resume = await prisma.resume.findUnique({
      where: { id: resumeId },
      select: { parsedText: true, extractedSkills: true },
    });

    const job = await prisma.job.findUnique({
      where: { id: jobId },
      select: { title: true, description: true },
    });

    const match = await prisma.jobMatch.findFirst({
      where: { id: matchId, ...(userId ? { userId } : {}) },
      select: { matchedSkills: true, missingSkills: true, matchScore: true },
    });

    if (!resume || !job || !match) {
      throw new Error('Required data not found');
    }

    if (!genAI) {
      throw new Error('GEMINI_API_KEY is not configured');
    }

    // Generate analysis using Gemini API
    const model = genAI.getGenerativeModel({ model: AI_MODEL });

    const prompt = `
You are an expert career counselor and recruiter. Analyze the following job match and provide a concise, actionable analysis.

Job Title: ${job.title}
Job Description: ${job.description}

Candidate Skills: ${resume.extractedSkills.join(', ')}

Matched Skills: ${match.matchedSkills.join(', ')}
Missing Skills: ${match.missingSkills.join(', ')}
Match Score: ${match.matchScore.toFixed(1)}%

Provide:
1. A brief assessment of the fit (1-2 sentences)
2. Top 3 strengths for this role
3. Top 2-3 skills to develop
4. Actionable next steps

Keep it concise and professional.
    `;

    const result = await model.generateContent(prompt);
    const analysis = result.response.text();

    // Update match with AI analysis
    const updatedMatch = await prisma.jobMatch.update({
      where: { id: matchId },
      data: { aiAnalysis: analysis },
    });

    return updatedMatch;
  } catch (error) {
    console.error('AI Analysis Error:', error.message);
    // Return match without analysis if AI fails
    return await prisma.jobMatch.findUnique({ where: { id: matchId } });
  }
}

/**
 * Get all job matches for user
 */
async function getUserMatches(userId, limit = 20, offset = 0) {
  try {
    const matches = await prisma.jobMatch.findMany({
      where: { userId },
      include: {
        job: true,
      },
      orderBy: { matchScore: 'desc' },
      take: limit,
      skip: offset,
    });

    const total = await prisma.jobMatch.count({ where: { userId } });

    return { matches, total };
  } catch (error) {
    throw new Error(`Failed to get matches: ${error.message}`);
  }
}

/**
 * Get match by ID
 */
async function getMatchById(matchId, userId) {
  try {
    const match = await prisma.jobMatch.findFirst({
      where: {
        id: matchId,
        userId,
      },
      include: {
        job: {
          include: {
            skills: {
              include: {
                skill: true,
              },
            },
          },
        },
      },
    });

    if (!match) {
      throw new Error('Match not found');
    }

    return match;
  } catch (error) {
    throw new Error(`Failed to get match: ${error.message}`);
  }
}

/**
 * Update match status
 */
async function updateMatchStatus(matchId, userId, status) {
  try {
    const existing = await prisma.jobMatch.findFirst({
      where: { id: matchId, userId },
    });
    if (!existing) throw new Error('Match not found');

    const match = await prisma.jobMatch.update({
      where: { id: existing.id },
      data: { status },
    });

    return match;
  } catch (error) {
    throw new Error(`Failed to update match status: ${error.message}`);
  }
}

module.exports = {
  calculateMatchScore,
  generateAIAnalysis,
  getUserMatches,
  getMatchById,
  updateMatchStatus,
};
