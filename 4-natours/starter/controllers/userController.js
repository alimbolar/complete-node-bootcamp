const APIFeatures = require('./../utils/APIFeatures');
const catchAsync = require('./../utils/catchAsync');
const User = require('./../models/userModel');

// exports.getAllUsers = (req, res) => {
//   res.status(200).json({
//     status: 'success',
//     data: 'This route is yet to be defined!'
//   });
// };

exports.getAllUsers = catchAsync(async (req, res, next) => {
  // Create Query
  const features = new APIFeatures(User.find(), req.query)
    .filter()
    .sort('-duration')
    .limitFields()
    .paginate();
  //Execute Query
  const users = await features.query;

  res.status(200).json({
    status: 'success',
    result: users.length,
    data: {
      users
    }
  });
});

exports.getUser = (req, res) => {
  res.status(200).json({
    status: 'success',
    data: 'This route is yet to be defined!'
  });
};

exports.createUser = (req, res) => {
  res.status(200).json({
    status: 'success',
    data: 'This route is yet to be defined!'
  });
};

exports.updateUser = (req, res) => {
  res.status(200).json({
    status: 'success',
    data: 'This route is yet to be defined!'
  });
};

exports.deleteUser = (req, res) => {
  res.status(200).json({
    status: 'success',
    data: 'This route is yet to be defined!'
  });
};
