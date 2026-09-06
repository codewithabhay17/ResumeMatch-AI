const jobService = require('../services/job.service');

/**
 * Get all jobs
 */
async function getJobsController(req, res) {
  try {
    const { limit = 20, offset = 0 } = req.query;
    const jobs = await jobService.getJobs(parseInt(limit), parseInt(offset));

    res.status(200).json({
      status: 'success',
      data: jobs,
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message,
    });
  }
}

/**
 * Get job by ID
 */
async function getJobController(req, res) {
  try {
    const { jobId } = req.params;
    const job = await jobService.getJobById(jobId);

    res.status(200).json({
      status: 'success',
      data: job,
    });
  } catch (error) {
    res.status(404).json({
      status: 'error',
      message: error.message,
    });
  }
}

/**
 * Search jobs
 */
async function searchJobsController(req, res) {
  try {
    const { q, limit = 20, offset = 0 } = req.query;

    if (!q) {
      return res.status(400).json({
        status: 'error',
        message: 'Search query (q) is required',
      });
    }

    const jobs = await jobService.searchJobs(q, parseInt(limit), parseInt(offset));

    res.status(200).json({
      status: 'success',
      data: jobs,
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message,
    });
  }
}

/**
 * Create or get job (admin only - can be protected later)
 */
async function createJobController(req, res) {
  try {
    const jobData = req.body;

    if (!jobData.title || !jobData.company || !jobData.description) {
      return res.status(400).json({
        status: 'error',
        message: 'title, company, and description are required',
      });
    }

    const job = await jobService.createOrGetJob(jobData);

    res.status(201).json({
      status: 'success',
      message: 'Job created or retrieved successfully',
      data: job,
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message,
    });
  }
}

module.exports = {
  getJobsController,
  getJobController,
  searchJobsController,
  createJobController,
};
