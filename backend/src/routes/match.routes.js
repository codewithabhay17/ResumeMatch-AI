const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/auth.middleware');
const {
  getMatchesController,
  getMatchController,
  calculateMatchController,
  updateMatchStatusController,
  generateAIAnalysisController,
} = require('../controllers/match.controller');

// All match routes are protected
router.use(authenticate);

// Get all user matches
router.get('/', getMatchesController);

// Calculate match for resume and job
router.post('/calculate', calculateMatchController);

// Get specific match
router.get('/:matchId', getMatchController);

// Generate/refresh AI analysis
router.post('/:matchId/ai-analysis', generateAIAnalysisController);

// Update match status
router.patch('/:matchId/status', updateMatchStatusController);

module.exports = router;
