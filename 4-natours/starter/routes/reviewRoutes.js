const express = require('express');

const reviewController = require('./../controllers/reviewController');
const authController = require('./../controllers/authController');

const router = express.Router({ mergeParams: true });

router
  .route('/')
  .get(reviewController.getAllReviews)
  .post(
    authController.protect,
    reviewController.setTourUserIds,
    reviewController.createOneReview
  );

router
  .route('/:id')
  .patch(reviewController.updateOneReview)
  .delete(reviewController.deleteOneReview);

module.exports = router;
