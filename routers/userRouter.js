const express = require('express');
const userController = require('../controllers/userController');
const authController = require('../controllers/authCountroller');

const userRouter = express.Router();

userRouter.route('/me').get(userController.getMe, userController.getUser);
userRouter.route('/signup').post(authController.signup);
userRouter.route('/signin').post(authController.signin);
userRouter.route('/logout').get(authController.logOut);

userRouter.route('/forgot-password').post(authController.forgotPassword);
userRouter.route('/reset-password/:token').patch(authController.resetPassword);
// Protect all routes after this middleware
userRouter.use(authController.protect);
userRouter.route('/update-password').patch(authController.updatePassword);
userRouter
  .route('/update-me')
  .patch(
    userController.uploadUserPic,
    userController.resizeUserPhoto,
    userController.updateMe,
  );
userRouter.route('/delete-me').delete(userController.deleteMe);

userRouter.use(authController.permition('admin'));
userRouter
  .route('/')
  .get(userController.getUsers)
  .post(userController.createUser);
userRouter
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = userRouter;
