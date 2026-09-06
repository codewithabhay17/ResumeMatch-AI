const { PrismaClient } = require('@prisma/client');
const fs = require('fs').promises;
const path = require('path');

const prisma = new PrismaClient();

/**
 * Upload and process resume
 */
async function uploadResume(userId, file, parsedText) {
  try {
    // Extract skills from parsed text (basic extraction)
    const extractedSkills = extractSkills(parsedText);

    // Create resume record
    const resume = await prisma.resume.create({
      data: {
        userId,
        fileName: file.originalname,
        filePath: file.path,
        fileSize: file.size,
        mimeType: file.mimetype,
        parsedText,
        extractedSkills,
      },
    });

    // Create skill associations
    for (const skillName of extractedSkills) {
      let skill = await prisma.skill.findUnique({
        where: { name: skillName.toLowerCase() },
      });

      if (!skill) {
        skill = await prisma.skill.create({
          data: {
            name: skillName.toLowerCase(),
            category: getSkillCategory(skillName),
          },
        });
      }

      await prisma.resumeSkill.create({
        data: {
          resumeId: resume.id,
          skillId: skill.id,
          proficiency: 'intermediate', // Default, can be enhanced by AI
        },
      });
    }

    return resume;
  } catch (error) {
    throw new Error(`Failed to upload resume: ${error.message}`);
  }
}

/**
 * Get user's resumes
 */
async function getUserResumes(userId) {
  try {
    const resumes = await prisma.resume.findMany({
      where: { userId },
      include: {
        skills: {
          include: {
            skill: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return resumes;
  } catch (error) {
    throw new Error(`Failed to get resumes: ${error.message}`);
  }
}

/**
 * Get resume by ID
 */
async function getResumeById(resumeId, userId) {
  try {
    const resume = await prisma.resume.findFirst({
      where: {
        id: resumeId,
        userId,
      },
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

    return resume;
  } catch (error) {
    throw new Error(`Failed to get resume: ${error.message}`);
  }
}

/**
 * Delete resume
 */
async function deleteResume(resumeId, userId) {
  try {
    const resume = await prisma.resume.findFirst({
      where: {
        id: resumeId,
        userId,
      },
    });

    if (!resume) {
      throw new Error('Resume not found');
    }

    // Delete file
    try {
      await fs.unlink(resume.filePath);
    } catch {
      console.warn(`Could not delete file: ${resume.filePath}`);
    }

    // Delete resume record (cascades to skills)
    await prisma.resume.delete({
      where: { id: resumeId },
    });

    return { message: 'Resume deleted successfully' };
  } catch (error) {
    throw new Error(`Failed to delete resume: ${error.message}`);
  }
}

/**
 * Extract skills from text (basic implementation)
 * In production, this could use NLP or AI
 */
function extractSkills(text) {
  const commonSkills = [
    'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'Go', 'Rust',
    'React', 'Vue', 'Angular', 'Node.js', 'Express', 'Django', 'FastAPI',
    'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'Elasticsearch',
    'Docker', 'Kubernetes', 'AWS', 'GCP', 'Azure',
    'Git', 'GitHub', 'GitLab', 'CI/CD', 'Jenkins',
    'REST API', 'GraphQL', 'WebSocket', 'WebRTC',
    'HTML', 'CSS', 'Tailwind', 'Bootstrap',
    'Machine Learning', 'TensorFlow', 'PyTorch', 'Scikit-learn',
    'Agile', 'Scrum', 'Kanban', 'JIRA',
    'Leadership', 'Communication', 'Project Management',
  ];

  const foundSkills = [];
  const textLower = text.toLowerCase();

  for (const skill of commonSkills) {
    if (textLower.includes(skill.toLowerCase())) {
      foundSkills.push(skill);
    }
  }

  return [...new Set(foundSkills)]; // Remove duplicates
}

/**
 * Categorize skill
 */
function getSkillCategory(skill) {
  const categories = {
    programming: ['JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'Go', 'Rust'],
    frontend: ['React', 'Vue', 'Angular', 'HTML', 'CSS', 'Tailwind', 'Bootstrap'],
    backend: ['Node.js', 'Express', 'Django', 'FastAPI', 'Spring'],
    database: ['PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'Elasticsearch'],
    devops: ['Docker', 'Kubernetes', 'AWS', 'GCP', 'Azure', 'CI/CD', 'Jenkins'],
    soft_skills: ['Leadership', 'Communication', 'Project Management', 'Agile', 'Scrum'],
  };

  for (const [category, skills] of Object.entries(categories)) {
    if (skills.some(s => s.toLowerCase() === skill.toLowerCase())) {
      return category;
    }
  }

  return 'other';
}

module.exports = {
  uploadResume,
  getUserResumes,
  getResumeById,
  deleteResume,
  extractSkills,
};
