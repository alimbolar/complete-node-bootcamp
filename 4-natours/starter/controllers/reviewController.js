const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/AppError');
const Review = require('./../models/reviewModel');



exports.getAllReviews = catchAsync(async function(req, res, next) {
  const review = await Review.find();

  res.status(200).json({
    status: 'success',
    result: review.length,
    data: {
      review
    }
  });
});

exports.createOneReview = catchAsync(async function(req, res, next) {

  if(!req.body.tour) req.body.tour = req.params.tourId;
  if(!req.body.user) req.body.user = req.user.id // sent from the protect middleware
  const review = await Review.create({
    review: req.body.review,
    rating: req.body.rating,
    createdAt: req.body.createdAt,
    tour: req.body.tour,
    user: req.body.user
  });

  res.status(200).json({
    status: 'success',
    message: 'Review Done',
    review
  });
});
