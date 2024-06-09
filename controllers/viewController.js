const Tour = require('../model/tourModel');
const Booking = require('../model/bookingModel');
const AppError = require('../utils/appError');
const asyncErrHandler = require('../utils/asyncErrHandler');

exports.getOverview = asyncErrHandler(async (req, res) => {
  const tours = await Tour.find();

  res.status(200).render('overview', {
    title: 'it is overview',
    tours,
  });
});

exports.getTour = asyncErrHandler(async (req, res, next) => {
  const data = req.params.slug;
  const tour = await Tour.findOne({ slugName: data }).populate({
    path: 'reviews',
    select: 'review rating user',
  });

  if (!tour) {
    return next(new AppError('There is no tour with that name.', 404));
  }
  res.status(200).render('tour', {
    title: tour.name,
    tour,
  });
});
// .set(
//   'Content-Security-Policy',
//   "default-src 'self' https://*.mapbox.com https://js.stripe.com/v3/;base-uri 'self';block-all-mixed-content;font-src 'self' https: data:;frame-ancestors 'self';img-src 'self' data:;object-src 'none';script-src https://js.stripe.com/v3/ https://cdnjs.cloudflare.com https://api.mapbox.com 'self' blob: ;script-src-attr 'none';style-src 'self' https: 'unsafe-inline';upgrade-insecure-requests;",
// )
exports.getLoginForm = asyncErrHandler(async (req, res) => {
  res.status(200).render('login', {
    title: 'log in',
  });
});

exports.getAccount = (req, res) => {
  res.status(200).render('account', {
    title: 'Your account',
  });
};

// i hav to refactor it into virtual populate or just populate

exports.getAMyBookings = async (req, res) => {
  const booking = await Booking.find({ user: req.user.id });
  console.log(booking);

  const tours = booking.map((el) => el.tour);

  // const tours = await Tour.find({ _id: { $in: BookingIdArr } });

  res.status(200).render('overview', {
    status: 'success',
    title: 'bookings',
    tours,
  });
};
