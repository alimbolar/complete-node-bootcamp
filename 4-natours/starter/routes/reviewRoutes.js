const express = require('express');

const reviewController = require('./../controllers/reviewController');
const authController = require('./../controllers/authController');

const router = express.Router({ mergeParams: true });

router.use(authController.protect);

router
  .route('/')
  .get(reviewController.getAllReviews)
  .post(reviewController.setTourUserIds, reviewController.createOneReview);

router
  .route('/:id')
  .patch(
    authController.restrictTo('admin', 'user'),
    reviewController.updateOneReview
  )
  .delete(
    authController.restrictTo('admin', 'user'),
    reviewController.deleteOneReview
  );

module.exports = router;
