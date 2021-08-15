const APIFeatures = require('./../utils/APIFeatures');
const catchAsync = require('./../utils/catchAsync');
const User = require('./../models/userModel');
const AppError = require('./../utils/AppError');

// exports.getAllUsers = (req, res) => {
//   res.status(200).json({
//     status: 'success',
//     data: 'This route is yet to be defined!'
//   });
// };

const filterObj = function(obj, ...allowedFields) {
  const newObj = {};
  Object.keys(obj).forEach(el => {
    if (allowedFields.includes(el)) {
      newObj[el] = obj[el];
    }
  });

  return newObj;
};

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

exports.updateMe = catchAsync(async function(req, res, next) {
  // 1. Create error if user posts password data

  if (req.body.password || req.body.passwordConfirm)
    return next(
      new AppError(
        'This is the wrong route for password updation. Please use /updateMyPassword',
        401
      )
    );

  // 2. Filter out unwanted field names that are not allowed to be updated

  console.log(req.body);
  const filteredBody = filterObj(req.body, 'name', 'email');

  // 3. Update user document
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser
    }
  });
});

exports.deleteMe = catchAsync(async function(req, res, next) {
  const deletedUser = await User.findByIdAndUpdate(req.user.id, {
    active: false
  });
  res.status(204).json({
    status: 'success',
    data: {
      user: null
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

exports.deleteUser = async (req, res, next) => {
  const user = await User.findByIdAndDelete(req.params.id);

  res.status(200).json({
    status: 'success',
    data: {
      user
    }
  });
};
