const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/auth.middleware');
const {
  getJobsController,
  getJobController,
  searchJobsController,
  createJobController,
} = require('../controllers/job.controller');

// Public routes - Get jobs
router.get('/', getJobsController);

// Search jobs
router.get('/search', searchJobsController);

// Get specific job
router.get('/:jobId', getJobController);

// Protected routes - Create job (admin only)
router.post('/', authenticate, createJobController);

module.exports = router;
