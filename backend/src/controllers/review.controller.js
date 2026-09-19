const reviewService = require('../services/review.service');

/**
 * Get all reviews (public)
 */
async function getReviewsController(req, res) {
  try {
    const reviews = await reviewService.getAllReviews();
    res.status(200).json({
      status: 'success',
      data: reviews,
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
}

/**
 * Create a review (protected)
 */
async function createReviewController(req, res) {
  try {
    const { rating, comment } = req.body;
    const userName = req.body.userName || req.user.email?.split('@')[0] || 'User';

    const review = await reviewService.createReview(
      req.user.id,
      userName,
      Number(rating),
      comment
    );

    res.status(201).json({
      status: 'success',
      data: review,
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message,
    });
  }
}

/**
 * Delete a review (protected, owner only)
 */
async function deleteReviewController(req, res) {
  try {
    const result = await reviewService.deleteReview(req.params.id, req.user.id);
    res.status(200).json({
      status: 'success',
      message: result.message,
    });
  } catch (error) {
    const status = error.message.includes('not found') ? 404 : 403;
    res.status(status).json({
      status: 'error',
      message: error.message,
    });
  }
}

module.exports = {
  getReviewsController,
  createReviewController,
  deleteReviewController,
};
