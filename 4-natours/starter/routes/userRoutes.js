const express = require('express');
const userRouter = require('../controllers/userController');
const authController = require('./../controllers/authController');
const userController = require('./../controllers/userController');

const router = express.Router();

router.route('/signup').post(authController.signup);
router.route('/login').post(authController.login);
router.route('/logout').get(authController.logout);

router.route('/forgotPassword').post(authController.forgotPassword);
router.route('/resetPassword/:token').patch(authController.resetPassword);

// TO PROTECT ALL ROUTES AFTER THIS
router.use(authController.protect);

router.route('/updateMyPassword').patch(authController.updatePassword);

router.route('/me').get(userController.getMe, userController.getUser);

router.route('/updateMe').patch(userController.updateMe);

router.route('/deleteMe').delete(userController.deleteMe);

// TO RESTRICT TO ADMIN ALL ROUTES AFTER THIS
router.use(authController.restrictTo('admin'));

router.route('/').get(userRouter.getAllUsers).post(userRouter.createUser);

router
  .route('/:id')
  .get(userRouter.getUser)
  .patch(userRouter.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
