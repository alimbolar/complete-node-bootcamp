const mongoose = require('mongoose');
const slugify = require('slugify');
const User = require('./userModel');
// const dotenv = require('dotenv');

// dotenv.config({ path: `${__dirname}/config.env` });

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: true,
      trim: true,
      maxlength: [40, 'Max 40 characters'],
      minlength: [5, 'Min 5 characters'],
    },
    slug: {
      type: String,
    },
    duration: {
      type: Number,
      required: [true, 'Duration is required'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'Group Size required'],
    },
    difficulty: {
      type: String,
      required: [true, 'Difficulty level is required'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message:
          'The option is not valid.. it can only be easy, medium or difficult',
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating should be more than 1'],
      max: [5, "Rating can't be more than 5"],
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'A tour mush have a price'],
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          console.log(`The price discount is ${val}`);
          return val < this.price;
        },
        message: 'Price Disount ({VALUE}) is more than price!!',
      },
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'Summary is needed'],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, 'Image required'],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false,
    },
    startLocation: {
      //GeoJSON
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number],
      address: String,
      description: String,
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
      },
    ],
  },

  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

tourSchema.index({ price: 1, ratingsAverage: -1 });
tourSchema.index({ slug: 1 });
tourSchema.index({ startLocation: '2dsphere' });

tourSchema.virtual('durationInWeeks').get(function () {
  return this.duration / 7;
});

// Virtual Populate
tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id',
});

// DOCUMENT MIDDLEWARE  - runs before save() and create() and NOT on insertMany()

// DOCUMENT MIDDLEWARE
tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  // console.log(this);
  next();
});

// // EMBEDDING DOCUMENTS

// tourSchema.pre('save', async function(next) {
//   const guidesPromises = this.guides.map(async id => await User.findById(id));
//   this.guides = await Promise.all(guidesPromises);
//   next();
// });

// tourSchema.pre('save', function(next) {
//   console.log('Will save document....');
//   next();
// });

// tourSchema.post('save', function(doc, next) {
//   console.log(doc);
// });

// QUERY MIDDLEWARE

tourSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } });
  this.start = Date.now();
  next();
});

tourSchema.pre(/^find/, function () {
  this.populate({
    path: 'guides',
    select: 'name photo role',
  });
});

tourSchema.post(/^find/, function (docs, next) {
  this.timeTaken = console.log(
    `Query too ${Date.now() - this.start} milliseconds `
  );
  next();
});

// AGGREGATION MIDDLEWARE

// tourSchema.pre('aggregate', function (next) {
//   this.pipeline().unshift({
//     $match: { secretTour: { $ne: true } },
//   });
//   console.log(this.pipeline());
//   next();
// });

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
