const Tour = require('./../models/tourModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/AppError');

exports.getLoginForm = catchAsync(async function(req,res,next){
  res.status(200).render('login');

});


exports.getOverview = catchAsync(async (req, res,next) => {
  // 1) Get tour data from the collection
  // 2) Build the template
  // 3) Render template with data from step 1

  // STEP 1
  const tours = await Tour.find();

  // STEP 2
  // This happens in the PUG template

  // STEP 3

    res.status(200).render('overview',{
        title : "All Tours",
        tours
        
    });
  });

exports.getTour = catchAsync(async (req, res,next) => {


    const tour = await Tour.findOne({"slug": req.params.slug }).populate({
      path:"reviews",
      fields : "review rating user"
    });

    if(!tour){
      return next( new AppError("No tour with this name found",404))
    }


    res.status(200).render('tour',{
        title : "The Forest Hiker",
        tour
    });
  });

