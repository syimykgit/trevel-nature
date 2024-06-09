const express = require('express');
const viewController = require('../controllers/viewController');
const authCountroller = require('../controllers/authCountroller');
const bookingCountroller = require('../controllers/bookingController');

const router = express.Router();

router.get('/me', authCountroller.protect, viewController.getAccount);

router.use(authCountroller.isUserLogged);
router.get('/login', viewController.getLoginForm);
router.get(
  '/',
  bookingCountroller.createBookingCheckout,
  viewController.getOverview,
);
router.get('/tour/:slug', viewController.getTour);
router.get(
  '/my-bookings',
  authCountroller.protect,
  viewController.getAMyBookings,
);

module.exports = router;
