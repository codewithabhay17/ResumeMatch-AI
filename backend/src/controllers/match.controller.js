const matchService = require('../services/match.service');

/**
 * Get job matches for user
 */
async function getMatchesController(req, res) {
  try {
    const { limit = 20, offset = 0 } = req.query;
    const matches = await matchService.getUserMatches(
      req.user.id,
      parseInt(limit),
      parseInt(offset)
    );

    res.status(200).json({
      status: 'success',
      data: matches,
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message,
    });
  }
}

/**
 * Get specific match
 */
async function getMatchController(req, res) {
  try {
    const { matchId } = req.params;
    const match = await matchService.getMatchById(matchId, req.user.id);

    res.status(200).json({
      status: 'success',
      data: match,
    });
  } catch (error) {
    res.status(404).json({
      status: 'error',
      message: error.message,
    });
  }
}

/**
 * Calculate match for resume and job
 */
async function calculateMatchController(req, res) {
  try {
    const { resumeId, jobId } = req.body;

    if (!resumeId || !jobId) {
      return res.status(400).json({
        status: 'error',
        message: 'resumeId and jobId are required',
      });
    }

    let match = await matchService.calculateMatchScore(
      resumeId,
      jobId,
      req.user.id
    );

    // Optionally generate AI analysis
    try {
      const analyzedMatch = await matchService.generateAIAnalysis(match.id, resumeId, jobId, req.user.id);
      if (analyzedMatch) match = analyzedMatch;
    } catch (aiError) {
      console.error('AI analysis generation failed:', aiError);
      // Continue without AI analysis
    }

    res.status(201).json({
      status: 'success',
      message: 'Match calculated successfully',
      data: match,
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message,
    });
  }
}

/**
 * Generate or refresh AI analysis for an existing match
 */
async function generateAIAnalysisController(req, res) {
  try {
    const { matchId } = req.params;
    const match = await matchService.getMatchById(matchId, req.user.id);
    const resumeId = req.body.resumeId || req.query.resumeId;
    if (!resumeId) {
      return res.status(400).json({ status: 'error', message: 'resumeId is required to generate AI analysis' });
    }
    const analyzed = await matchService.generateAIAnalysis(
      match.id,
      resumeId,
      match.jobId,
      req.user.id
    );

    res.status(200).json({
      status: 'success',
      message: 'AI analysis generated successfully',
      data: analyzed,
    });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
}

/**
 * Update match status
 */
async function updateMatchStatusController(req, res) {
  try {
    const { matchId } = req.params;
    const { status } = req.body;

    if (!status || !['active', 'dismissed', 'applied'].includes(status)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid status. Allowed values: active, dismissed, applied',
      });
    }

    const match = await matchService.updateMatchStatus(
      matchId,
      req.user.id,
      status
    );

    res.status(200).json({
      status: 'success',
      message: 'Match status updated',
      data: match,
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message,
    });
  }
}

module.exports = {
  getMatchesController,
  getMatchController,
  calculateMatchController,
  updateMatchStatusController,
  generateAIAnalysisController,
};
