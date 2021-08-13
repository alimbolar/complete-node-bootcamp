const express = require('express');
const userRouter = require('../controllers/userController');
const authController = require('./../controllers/authController');
const userController = require('./../controllers/userController');

const router = express.Router();

router.route('/signup').post(authController.signup);
router.route('/login').post(authController.login);
router
  .route('/')
  .get(authController.protect, userRouter.getAllUsers)
  .post(userRouter.createUser);

router.route('/forgotPassword').post(authController.forgotPassword);
router.route('/resetPassword/:token').patch(authController.resetPassword);

router
  .route('/:id')
  .get(userRouter.getUser)
  .patch(userRouter.updateUser)
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    userController.deleteUser
  );

module.exports = router;
