const express = require('express');
const bookingController = require('../controllers/bookingController');
const authController = require('../controllers/authCountroller');

const bookingRouter = express.Router();

bookingRouter.use(authController.protect);

bookingRouter.get(
  '/checkout-session/:tourId',
  bookingController.getCheckoutSession,
);

bookingRouter.use(authController.permition('admin', 'lead-guide'));

bookingRouter
  .route('/')
  .post(bookingController.createBooking)
  .get(bookingController.getAllBooking);

bookingRouter
  .route('/:id')
  .get(bookingController.getBooking)
  .patch(bookingController.updateBooking)
  .delete(bookingController.deleteBooking);

module.exports = bookingRouter;
