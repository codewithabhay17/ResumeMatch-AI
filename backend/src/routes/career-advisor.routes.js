const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/auth.middleware');
const {
  getCareerAnalysisController,
  analyzeCareerController,
  regenerateCareerAnalysisController
} = require('../controllers/career-advisor.controller');

router.use(authenticate);

router.get('/:resumeId', getCareerAnalysisController);
router.post('/analyze/:resumeId', analyzeCareerController);
router.post('/regenerate/:resumeId', regenerateCareerAnalysisController);

module.exports = router;
