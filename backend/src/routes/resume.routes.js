const express = require('express');
const multer = require('multer');
const router = express.Router();
const { authenticate } = require('../middlewares/auth.middleware');
const {
  uploadResumeController,
  getUserResumesController,
  getResumeController,
  deleteResumeController,
  analyzeResumeController,
} = require('../controllers/resume.controller');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
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

// Delete resume
router.delete('/:resumeId', deleteResumeController);

module.exports = router;
