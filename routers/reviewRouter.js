const express = require('express');
const reviewController = require('../controllers/reviewController');
const authController = require('../controllers/authCountroller');

const reviewRouter = express.Router({ mergeParams: true });

reviewRouter.use(authController.protect);

reviewRouter
  .route('/')
  .get(reviewController.getReviews)
  .post(
    authController.permition('user'),
    reviewController.addBody,
    reviewController.createReview,
  );
reviewRouter
  .route('/:id')
  .get(reviewController.getReview)
  .patch(
    authController.permition('user', 'admin'),
    reviewController.updateReview,
  )
  .delete(
    authController.permition('user', 'admin'),
    reviewController.deleteReview,
  );

module.exports = reviewRouter;
