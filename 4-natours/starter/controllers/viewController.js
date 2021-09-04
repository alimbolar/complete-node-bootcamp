const Tour = require('./../models/tourModel');
const catchAsync = require('./../utils/catchAsync');

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

exports.getTour = (req, res) => {
    res.status(200).render('tour',{
        title : "The Forest Hiker"
    });
  }