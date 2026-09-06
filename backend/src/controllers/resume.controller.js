const resumeService = require('../services/resume.service');
const pdfParse = require('pdf-parse');
const fs = require('fs').promises;
const { analyzeResume } = require('../services/ai-resume.service');

/**
 * Upload resume controller
 */
async function uploadResumeController(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({
        status: 'error',
        message: 'No file uploaded',
      });
    }

    // Parse PDF if needed
    let parsedText = '';
    if (req.file.mimetype === 'application/pdf') {
      try {
        const fileBuffer = await fs.readFile(req.file.path);
        const pdfData = await pdfParse(fileBuffer);
        parsedText = pdfData.text;
      } catch (pdfError) {
        console.error('PDF parsing error:', pdfError);
        parsedText = req.file.originalname; // Fallback
      }
    } else if (req.file.mimetype === 'text/plain') {
      parsedText = await fs.readFile(req.file.path, 'utf-8');
    }

    const resume = await resumeService.uploadResume(
      req.user.id,
      req.file,
      parsedText
    );

    res.status(201).json({
      status: 'success',
      message: 'Resume uploaded successfully',
      data: resume,
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message,
    });
  }
}

/**
 * Get user resumes controller
 */
async function getUserResumesController(req, res) {
  try {
    const resumes = await resumeService.getUserResumes(req.user.id);

    res.status(200).json({
      status: 'success',
      data: resumes,
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message,
    });
  }
}

/**
 * Get resume by ID controller
 */
async function getResumeController(req, res) {
  try {
    const { resumeId } = req.params;
    const resume = await resumeService.getResumeById(resumeId, req.user.id);

    res.status(200).json({
      status: 'success',
      data: resume,
    });
  } catch (error) {
    res.status(404).json({
      status: 'error',
      message: error.message,
    });
  }
}

/**
 * Delete resume controller
 */
async function deleteResumeController(req, res) {
  try {
    const { resumeId } = req.params;
    const result = await resumeService.deleteResume(resumeId, req.user.id);

    res.status(200).json({
      status: 'success',
      message: result.message,
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message,
    });
  }
}


async function analyzeResumeController(req, res) {
  try {
    const resume = await resumeService.getResumeById(req.params.resumeId, req.user.id);
    const analysis = await analyzeResume(resume);
    res.status(200).json({ status: 'success', data: analysis });
  } catch (error) {
    const status = /not found|not configured|no parsed text/i.test(error.message) ? 400 : 502;
    res.status(status).json({ status: 'error', message: error.message });
  }
}

module.exports = {
  uploadResumeController,
  getUserResumesController,
  getResumeController,
  deleteResumeController,
  analyzeResumeController,
};
