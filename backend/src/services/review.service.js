const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Get all reviews (public, newest first)
 */
async function getAllReviews(limit = 50) {
  return prisma.review.findMany({
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
}

/**
 * Create a new review
 */
async function createReview(userId, userName, rating, comment) {
  if (rating < 1 || rating > 5) {
    throw new Error('Rating must be between 1 and 5');
  }
  if (!comment || comment.trim().length < 5) {
    throw new Error('Comment must be at least 5 characters');
  }
  if (comment.trim().length > 1000) {
    throw new Error('Comment must be under 1000 characters');
  }

  return prisma.review.create({
    data: {
      userId,
      userName: userName || 'Anonymous',
      rating: Math.round(rating),
      comment: comment.trim(),
    },
  });
}

/**
 * Delete a review (only the owner can delete)
 */
async function deleteReview(reviewId, userId) {
  const review = await prisma.review.findUnique({
    where: { id: reviewId },
  });

  if (!review) {
    throw new Error('Review not found');
  }
  if (review.userId !== userId) {
    throw new Error('You can only delete your own reviews');
  }

  await prisma.review.delete({ where: { id: reviewId } });
  return { message: 'Review deleted successfully' };
}

module.exports = {
  getAllReviews,
  createReview,
  deleteReview,
};
