const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/AppError');
const sendMail = require('../utils/email');
const { networkInterfaces } = require('os');

const signToken = function (id) {
  return jwt.sign({ id: id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const cookieOptions = {
  expires: new Date(
    Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
  ),
  httpOnly: true,
};
if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

const createSendToken = function (user, statusCode, res) {
  const token = signToken(user._id);

  res.cookie('jwt', token, cookieOptions);

  // Clear password from response
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    user,
  });
};

exports.signup = catchAsync(async function (req, res, next) {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordChangedAt: req.body.passwordChangedAt,
  });

  createSendToken(newUser, 201, res);
  // const token = signToken(newUser._id);

  // res.status(201).json({
  //   status: 'success',
  //   token,
  //   data: {
  //     user: newUser
  //   }
  // });
});

exports.login = catchAsync(async function (req, res, next) {
  const { email, password } = req.body;

  // 1) Check if email and password exists
  if (!email || !password)
    return next(new AppError('Please provide email and password', 401));

  // 2) Check if the user exists and if the password is correct

  const currentUser = await User.findOne({ email }).select('+password');

  if (
    !currentUser ||
    !(await currentUser.correctPassword(password, currentUser.password))
  ) {
    return next(new AppError('Incorrect email or password', 401));
  }

  // 3) Send token back to client

  createSendToken(currentUser, 200, res);

  // const token = signToken(currentUser._id);
  // res.status(200).json({
  //   status: 'success',
  //   token
  // });
});

exports.logout = function (req, res, next) {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({ status: 'success' });
};

exports.protect = catchAsync(async function (req, res, next) {
  let token;
  // 1) Get Token and check if it exists
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }
  // console.log(token);

  if (!token) {
    return next(
      new AppError('You are not logged in.. please log in again', 401)
    );
  }
  // 2) Verify Token

  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // console.log(decoded);

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
  req.user = currentUser; // this is important for the next step in restrictTo()
  next();
});

exports.isLoggedIn = async function (req, res, next) {
  try {
    if (req.cookies.jwt) {
      const decoded = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET
      );

      // 3) Check if user still exists
      const currentUser = await User.findById(decoded.id);
      if (!currentUser) {
        return next();
      }

      // Check if user changed password after token was issued
      if (currentUser.changedPasswordAfter(decoded.iat)) {
        return next();
      }

      // create user variable in template local
      res.locals.user = currentUser;
      return next();
    }
  } catch (err) {
    return next();
  }

  next();
};

exports.restrictTo = function (...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError('Not authorised to access this page', 403));
    }
    next();
  };
};

exports.forgotPassword = catchAsync(async function (req, res, next) {
  //get user based on POSTed email
  const user = await User.findOne({ email: req.body.email });

  if (!user) return next(new AppError('Email not registered', 404));
  //generate the random Token

  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });
  console.log(user);

  //send it back as an email

  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetPassword/${resetToken}`;

  const message = `Forgot your password? Send this back to us: ${resetURL}\n This to test newline option `;

  try {
    await sendMail({
      email: user.email,
      subject: 'Your Reset Token, valid for 10 minutes',
      message: message,
    });

    res.status(200).json({
      status: 'success',
      message: 'Token sent by email',
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(new AppError('There was an error sending this email', 500));
  }
});

exports.resetPassword = catchAsync(async function (req, res, next) {
  //get user based on the token

  const hashedToken = await crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    // passwordResetExpires: { $gt: Date.now() }
  });

  //check if the token has not expired and that there is a user

  if (!user) return next(new AppError('Token is invalid or expired', 400));
  //set new password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  //update passwordChangedAt prooperty for the user

  //Log the user in by sending the JWT
  createSendToken(user, 201, res);
  // const token = signToken(user._id);
  // res.status(200).json({
  //   status: 'success',
  //   token
  // });
});

exports.updatePassword = catchAsync(async function (req, res, next) {
  // 1.Get User From Collection

  // let token;
  // if (
  //   req.headers.authorization &&
  //   req.headers.authorization.startsWith('Bearer')
  // ) {
  //   token = req.headers.authorization.split(' ')[1];
  // }

  // if (!token) return next(new AppError('Invalid Token', 401));

  // const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  console.log(req.user);
  const user = await User.findById(req.user.id).select('+password');

  // 2. Check if POSTed password is correct

  if (!(await user.correctPassword(req.body.passwordCurrent, user.password)))
    return next(new AppError('Wrong password', 401));

  //3. If so, update password

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();
  //4. Log user in, send JWT token

  createSendToken(user, 200, res);
  // res.status(200).json({
  //   status: 'success',
  //   // token,

  //   message: `The id of the user is ${
  //     req.body.id
  //   } and his password is ${await user.correctPassword(
  //     req.body.passwordCurrent,
  //     user.password
  //   )} because his old password ${
  //     req.body.passwordCurrent
  //   } has been updated password to ${user.password} using this variable ${
  //     req.body.password
  //   }`,
  //   user: user
  // });
});
