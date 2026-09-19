const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

// Import routes
const authRoutes = require('./routes/auth.routes');
const resumeRoutes = require('./routes/resume.routes');
const jobRoutes = require('./routes/job.routes');
const matchRoutes = require('./routes/match.routes');
const careerRoutes = require('./routes/career-advisor.routes');
const reviewRoutes = require('./routes/review.routes');

// Import middleware
const { errorHandler } = require('./middlewares/error.middleware');
const { sanitizeRequestData } = require('./utils/validation');

const app = express();
const PORT = process.env.PORT || 5000;
console.log(
  "Gemini API Key configured:",
  Boolean(process.env.GEMINI_API_KEY)
);

console.log(
  "Gemini Model:",
  process.env.GEMINI_MODEL
);

// ─── Middleware ────────────────────────────────────────────────────────────────
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || origin.startsWith('http://localhost:') || origin === process.env.CLIENT_URL) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Global input sanitization middleware
app.use(sanitizeRequestData);

// Static uploads folder
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// ─── Health Check ──────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'AI Resume Analyzer API is running',
    timestamp: new Date().toISOString(),
  });
});

// ─── API Routes ────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/resumes', resumeRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/career-advisor', careerRoutes);
app.use('/api/reviews', reviewRoutes);

// ─── 404 Handler ───────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

// ─── Global Error Handler ──────────────────────────────────────────────────────
app.use(errorHandler);

// ─── Start Server ──────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀 Server running on http://localhost:${PORT}`);
  console.log(`📋 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`💚 Health check: http://localhost:${PORT}/api/health\n`);
});

module.exports = app;
