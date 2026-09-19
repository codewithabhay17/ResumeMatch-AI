const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/auth.middleware');
const {
  getReviewsController,
  createReviewController,
  deleteReviewController,
} = require('../controllers/review.controller');

// Public — anyone can read reviews
router.get('/', getReviewsController);

// Protected — must be logged in to create or delete
router.post('/', authenticate, createReviewController);
router.delete('/:id', authenticate, deleteReviewController);

module.exports = router;
