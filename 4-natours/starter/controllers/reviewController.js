const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/AppError');
const Review = require('./../models/reviewModel');
const factory = require('./handlerController');

exports.getAllReviews = factory.getAll(Review);

exports.setTourUserIds = function (req, res, next) {
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id; // sent from the protect middleware
  next();
};

exports.createOneReview = factory.createOne(Review);
exports.updateOneReview = factory.updateOne(Review);
exports.deleteOneReview = factory.deleteOne(Review);
