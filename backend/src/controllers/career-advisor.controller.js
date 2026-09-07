const { analyzeCareer, getCareerAnalysis } = require('../services/career-advisor.service');

const getCareerAnalysisController = async (req, res, next) => {
  try {
    const { resumeId } = req.params;

    // First ensure the user owns this resume
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    const resume = await prisma.resume.findUnique({
      where: { id: resumeId },
    });

    if (!resume) {
      return res.status(404).json({ success: false, message: 'Resume not found' });
    }

    if (resume.userId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to access this resume' });
    }

    const analysis = await getCareerAnalysis(resumeId);

    if (!analysis) {
      return res.status(404).json({ success: false, message: 'Analysis not found' });
    }

    res.status(200).json({ success: true, data: analysis });
  } catch (error) {
    next(error);
  }
};

const analyzeCareerController = async (req, res, next) => {
  try {
    const { resumeId } = req.params;

    // Verify ownership
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    const resume = await prisma.resume.findUnique({
      where: { id: resumeId },
    });

    if (!resume) {
      return res.status(404).json({ success: false, message: 'Resume not found' });
    }

    if (resume.userId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to access this resume' });
    }

    const analysis = await analyzeCareer(resumeId, false);
    res.status(200).json({ success: true, data: analysis });
  } catch (error) {
    next(error);
  }
};

const regenerateCareerAnalysisController = async (req, res, next) => {
  try {
    const { resumeId } = req.params;

    // Verify ownership
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    const resume = await prisma.resume.findUnique({
      where: { id: resumeId },
    });

    if (!resume) {
      return res.status(404).json({ success: false, message: 'Resume not found' });
    }

    if (resume.userId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to access this resume' });
    }

    const analysis = await analyzeCareer(resumeId, true);
    res.status(200).json({ success: true, data: analysis });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCareerAnalysisController,
  analyzeCareerController,
  regenerateCareerAnalysisController
};
