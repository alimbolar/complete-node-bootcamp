const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'Review is a mandatory field']
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: [true, 'Rating is mandatory']
    },
    createdAt: {
      type: Date,
      default: Date.now()
    },
    tour:{
        type: mongoose.Schema.ObjectId,
        ref: 'Tour',
        require: [true, 'Tour is required']
      },
    user:{
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'User is required']
      }
  
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

reviewSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'tour',
    select: 'name'
  }).populate({
    path : 'user',
    select : 'name'
  })
  next();
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
