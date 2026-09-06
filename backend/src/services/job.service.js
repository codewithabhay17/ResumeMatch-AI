const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/**
 * Get or create jobs
 */
async function createOrGetJob(jobData) {
  try {
    // Check if job already exists
    let job = await prisma.job.findFirst({
      where: {
        title: jobData.title,
        company: jobData.company,
      },
    });

    if (job) {
      return job;
    }

    // Create new job
    job = await prisma.job.create({
      data: {
        title: jobData.title,
        company: jobData.company,
        description: jobData.description,
        location: jobData.location,
        salary: jobData.salary,
        jobUrl: jobData.jobUrl,
        postedDate: jobData.postedDate,
      },
    });

    // Add skills to job
    if (jobData.skills && Array.isArray(jobData.skills)) {
      for (const skillData of jobData.skills) {
        let skill = await prisma.skill.findUnique({
          where: { name: skillData.name.toLowerCase() },
        });

        if (!skill) {
          skill = await prisma.skill.create({
            data: {
              name: skillData.name.toLowerCase(),
              category: skillData.category || 'other',
            },
          });
        }

        await prisma.jobSkill.create({
          data: {
            jobId: job.id,
            skillId: skill.id,
            required: skillData.required || false,
            level: skillData.level,
          },
        });
      }
    }

    return job;
  } catch (error) {
    throw new Error(`Failed to create or get job: ${error.message}`);
  }
}

/**
 * Get all jobs with pagination
 */
async function getJobs(limit = 20, offset = 0) {
  try {
    const jobs = await prisma.job.findMany({
      include: {
        skills: {
          include: {
            skill: true,
          },
        },
      },
      orderBy: { postedDate: 'desc' },
      take: limit,
      skip: offset,
    });

    const total = await prisma.job.count();

    return { jobs, total };
  } catch (error) {
    throw new Error(`Failed to get jobs: ${error.message}`);
  }
}

/**
 * Get job by ID
 */
async function getJobById(jobId) {
  try {
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

    return job;
  } catch (error) {
    throw new Error(`Failed to get job: ${error.message}`);
  }
}

/**
 * Search jobs by title or company
 */
async function searchJobs(query, limit = 20, offset = 0) {
  try {
    const jobs = await prisma.job.findMany({
      where: {
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { company: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
        ],
      },
      include: {
        skills: {
          include: {
            skill: true,
          },
        },
      },
      take: limit,
      skip: offset,
    });

    const total = await prisma.job.count({
      where: {
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { company: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
        ],
      },
    });

    return { jobs, total };
  } catch (error) {
    throw new Error(`Failed to search jobs: ${error.message}`);
  }
}

module.exports = {
  createOrGetJob,
  getJobs,
  getJobById,
  searchJobs,
};
