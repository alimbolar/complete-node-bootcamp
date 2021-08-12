const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/AppError');

const signToken = function(id) {
  return jwt.sign({ id: id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

exports.signup = catchAsync(async function(req, res, next) {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordChangedAt: req.body.passwordChangedAt
  });

  const token = signToken(newUser._id);

  res.status(201).json({
    status: 'success',
    token,
    data: {
      user: newUser
    }
  });
});

exports.login = catchAsync(async function(req, res, next) {
  const { email, password } = req.body;

  // 1) Check if email and password exists
  if (!email || !password)
    return next(new AppError('Please provide email and password', 401));

  // 2) Check if the user exists and if the password is correct

  const currentUser = await User.findOne({ email }).select('+password');

  console.log(currentUser);

  const correct = await currentUser.correctPassword(
    password,
    currentUser.password
  );

  console.log('correct', correct);
  if (
    !currentUser ||
    !(await currentUser.correctPassword(password, currentUser.password))
  ) {
    return next(new AppError('Incorrect email or password', 401));
  }

  // 3) Send token back to client

  const token = signToken(currentUser._id);
  res.status(200).json({
    status: 'success',
    token
  });
});

exports.protect = catchAsync(async function(req, res, next) {
  let token;
  // 1) Get Token and check if it exists
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }
  // console.log(token);

  if (!token) {
    return next(
      new AppError('You are not logged in.. please log in again', 401)
    );
  }
  // 2) Verify Token

  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  console.log(decoded);

  // 3) Check if user still exists

  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(new AppError('The User with this token does not exist', 401));
  }

  console.log('status', currentUser.changedPasswordAfter(decoded.iat));
  // Check if user changed password after token was issued

  if (currentUser.changedPasswordAfter(decoded.iat)) {
    console.log(
      decoded.iat,
      parseInt(currentUser.passwordChangedAt.getTime() / 1000)
    );
    return next(
      new AppError('The password was changed since the token issue', 401)
    );
  }

  // GRANT ACCESS TO PROTECTED ROUTE
  req.use = currentUser;
  next();
});
