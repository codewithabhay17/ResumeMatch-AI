const resumeService = require('../services/resume.service');
const pdfParse = require('pdf-parse');
const fsSync = require('fs');
const fs = require('fs').promises;
const { analyzeResume } = require('../services/ai-resume.service');

/**
 * Upload resume controller
 * Uses req.file.path (absolute) set by multer — never reconstructs a relative path.
 */
async function uploadResumeController(req, res) {
  // Track the absolute file path so we can clean it up in finally{}
  const filePath = req.file ? req.file.path : null;

  try {
    if (!req.file) {
      return res.status(400).json({
        status: 'error',
        message: 'No file uploaded',
      });
    }

    // Verify the file actually exists on disk before trying to read it
    if (!fsSync.existsSync(filePath)) {
      console.error('[upload] File not found after multer write:', filePath);
      return res.status(500).json({
        status: 'error',
        message: 'File upload failed — could not locate uploaded file.',
      });
    }

    // Parse the file content
    let parsedText = '';
    if (req.file.mimetype === 'application/pdf') {
      try {
        const fileBuffer = await fs.readFile(filePath);
        const pdfData = await pdfParse(fileBuffer);
        parsedText = pdfData.text || '';
      } catch (pdfError) {
        console.error('[upload] PDF parsing error:', pdfError.message);
        parsedText = ''; // Continue — AI analysis will handle empty text gracefully
      }
    } else if (req.file.mimetype === 'text/plain') {
      try {
        parsedText = await fs.readFile(filePath, 'utf-8');
      } catch (txtError) {
        console.error('[upload] TXT read error:', txtError.message);
        parsedText = '';
      }
    }

    // Save to database — pass filename only (not the full filesystem path)
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
    console.error('[upload] Unexpected error:', error.message);
    res.status(400).json({
      status: 'error',
      message: error.message,
    });
  } finally {
    // Always clean up the temp file — Render's filesystem is ephemeral anyway
    if (filePath && fsSync.existsSync(filePath)) {
      fs.unlink(filePath).catch((e) =>
        console.warn('[upload] Could not delete temp file:', e.message)
      );
    }
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
