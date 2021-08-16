const Tour = require('./../models/tourModel');
const catchAsync = require('./../utils/catchAsync');
const APIFeatures = require('./../utils/APIFeatures');
const AppError = require('./../utils/AppError');

// const tours = JSON.parse(
//   fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`, 'utf-8')
// );

// exports.checkID = (req, res, next, val) => {
//   if (req.params.id * 1 > tours.length - 1) {
//     return res.status(404).json({
//       status: 'fail',
//       message: 'Invalid Id'
//     });
//   }
//   next();
// };

// const newTour = new Tour({
//   name: 'A Swim In The Ocean',
//   price: 297
// });

// newTour
//   .save()
//   .then(doc => console.log(doc))
//   .catch(err => console.log(err));

// exports.checkBody = (req, res, next) => {
//   if (!req.body.name || !req.body.price) {
//     return res.status(400).json({
//       status: 'fail',
//       message: 'Missing Name or Price'
//     });
//   }
//   next();
// };

exports.aliasTopTours = (req, res, next) => {
  // req.query = { price: { lte: '500' }, fields: 'name,price,duration' };
  req.query.sort = 'price';
  req.query.limit = '5';
  // req.query.price[lte] = 500;
  req.query.fields = 'name,price,duration';
  next();
};

exports.getAllTours = catchAsync(async (req, res, next) => {
  // Create Query
  const features = new APIFeatures(Tour.find(), req.query)
    .filter()
    .sort('-duration')
    .limitFields()
    .paginate();
  //Execute Query
  const tours = await features.query;

  res.status(200).json({
    status: 'success',
    result: tours.length,
    data: {
      tours: tours
    }
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findById(req.params.id).populate({
    path: 'reviews',
    select: 'review'
  });

  if (!tour) {
    return next(new AppError('A tour with this ID does not exist', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      tour
    }
  });
});

exports.createTour = catchAsync(async (req, res, next) => {
  const newTour = await Tour.create(req.body);
  res.status(200).json({
    status: 'success',
    data: {
      tour: newTour
    }
  });
});

exports.updateTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  if (!tour) {
    return next(new AppError('A tour with this ID does not exist', 404));
  }
  res.status(200).json({
    status: 'success',
    data: {
      tour
    }
  });
});

exports.deleteTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndDelete(req.params.id);

  if (!tour) {
    return next(new AppError('A tour with this ID does not exist', 404));
  }
  //some action on req object
  res.status(204).json({
    status: 'success',
    data: null
  });
});

exports.getTourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.0 } }
    },
    {
      $group: {
        _id: '$difficulty',
        numTours: { $sum: 1 },
        numRating: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' }
      }
    },
    { $sort: { avgPrice: -1 } }
    // {
    //   $match: { _id: { $eq: 'easy' } }
    // }
  ]);

  res.status(200).json({
    status: 'success',
    results: stats.length,
    data: {
      stats
    }
  });
});

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1;
  console.log(year);
  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates'
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`)
        }
      }
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numTourStart: { $sum: 1 },
        tourName: { $push: '$name' }
      }
    },
    {
      $sort: { _id: 1 }
    },
    {
      $addFields: {
        month: '$_id'
      }
    },
    {
      $project: {
        _id: 0
      }
    }
    // {
    //   $limit: 6
    // }
  ]);

  res.status(200).json({
    status: 'success',
    results: plan.length,
    data: {
      plan
    }
  });
});
