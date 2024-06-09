const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const Tour = require('../model/tourModel');
const Booking = require('../model/bookingModel');
const asyncErrorHandler = require('../utils/asyncErrHandler');
const factory = require('./factoryHandler');
// const AppError = require('../utils/appError');

exports.getCheckoutSession = asyncErrorHandler(async (req, res, next) => {
  const tour = await Tour.findById(req.params.tourId);

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    success_url: `${req.protocol}://${req.get('host')}/?price=${tour.price}&user=${req.user.id}&tour=${tour.id}`,
    cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slugName}/`,
    customer_email: req.user.email,
    client_reference_id: req.params.tourId,
    mode: 'payment',
    line_items: [
      {
        quantity: 1,
        price_data: {
          unit_amount: tour.price * 100,
          currency: 'usd',
          product_data: {
            name: `${tour.name} Tour`,
            description: tour.summary,
            images: [`https://www.natours.dev/img/tpors/${tour.imageCover}`],
          },
        },
      },
    ],
  });

  res.status(200).json({
    status: 'success',
    session,
  });
});

exports.createBookingCheckout = asyncErrorHandler(async (req, res, next) => {
  const { price, user, tour } = req.query;
  if (!price && !user && !tour) return next();
  await Booking.create({ price, user, tour });
  res.redirect('/');
});

exports.getBooking = factory.getOne(Booking);
exports.getAllBooking = factory.getAll(Booking);
exports.createBooking = factory.createOne(Booking);
exports.deleteBooking = factory.deleteOne(Booking);
exports.updateBooking = factory.updateOne(Booking);
