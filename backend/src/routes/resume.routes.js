const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();
const { authenticate } = require('../middlewares/auth.middleware');
const {
  uploadResumeController,
  getUserResumesController,
  getResumeController,
  deleteResumeController,
  analyzeResumeController,
  improveResumeController,
  humanizeResumeController,
} = require('../controllers/resume.controller');

// Absolute path to uploads directory — works on both Windows dev and Render Linux
// __dirname = backend/src/routes, so we go up two levels to backend/, then uploads/
const uploadsDir = path.join(__dirname, '..', '..', 'uploads');

// Ensure uploads directory exists before any request is handled
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('[upload] Created uploads directory:', uploadsDir);
}

// Configure multer for file uploads — use absolute path so file is always findable
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    cb(null, `${timestamp}-${file.originalname}`);
  },
});

const fileFilter = (req, file, cb) => {
  // Accept PDF and text files
  const allowedMimes = ['application/pdf', 'text/plain'];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF and text files are allowed'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5242880 },
});

// All resume routes are protected
router.use(authenticate);

// Upload resume
router.post('/upload', upload.single('resume'), uploadResumeController);

// Get all user resumes
router.get('/', getUserResumesController);

// Get specific resume
router.get('/:resumeId', getResumeController);

// AI resume analysis
router.post('/:resumeId/analyze-ai', analyzeResumeController);

// Improve resume
router.post('/:resumeId/improve', improveResumeController);

// Humanize resume (rewrite in natural human language)
router.post('/:resumeId/humanize', humanizeResumeController);

// Delete resume
router.delete('/:resumeId', deleteResumeController);

module.exports = router;
