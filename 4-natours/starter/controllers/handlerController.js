const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/AppError');
const APIFeatures = require('./../utils/APIFeatures');


exports.getAll = Model => catchAsync(async (req, res, next) => {

    // HACK :: Only for GetAllReviews
    let filter = {};
    if (req.params.tourId) filter = { tour: req.params.tourId };
  
    // Create Query
    const features = new APIFeatures(Model.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();
    //Execute Query
    const doc = await features.query;
  
    res.status(200).json({
      status: 'success',
      result: doc.length,
      data: {
        data : doc,
      },
    });
  });



exports.getOne = (Model,populateOptions) => catchAsync( async (req, res, next) => {

    let query = Model.findById(req.params.id);
    if(populateOptions) query = query.populate(populateOptions)
    const doc = await query;
  
    if (!doc) {
      return next(new AppError('A document with this ID does not exist', 404));
    }
  
    res.status(200).json({
      status: 'success',
      data: {
        data : doc,
      },
    });
  });




exports.createOne = Model => catchAsync(async (req, res, next) => {
    const doc = await Model.create(req.body);
    res.status(200).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  });



exports.updateOne = (Model) => catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
  
    if (!doc) {
      return next(new AppError('A document with this ID does not exist', 404));
    }
    res.status(200).json({
      status: 'success',
      data: {
        data : doc,
      },
    });
  });

exports.deleteOne = (Model) =>
    catchAsync(async (req, res, next) => {
        const doc = await Model.findByIdAndDelete(req.params.id);
      
        if (!doc) {
          return next(new AppError('A document with this ID does not exist', 404));
        }
        
        res.status(204).json({
          status: 'success',
          data: null
        });
      });




