const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const path = require('path');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');
const xss = require('xss-clean');
const { whitelist } = require('validator');
const cookieParser = require('cookie-parser');
const globErrController = require('./controllers/errorController');
const tourRouter = require('./routers/tourRouter');
const userRouter = require('./routers/userRouter');
const reviewRouter = require('./routers/reviewRouter');
const viewRouter = require('./routers/viewRouter');
const bookingRouter = require('./routers/bookingRouter');

const AppError = require('./utils/appError');

const app = express();
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

//////////// rendering statick file in browser by node /////////////
app.use(express.static(path.join(__dirname, 'public')));

////////////////// limitation request to API ///////////////////////
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'too many request please try again in an hour',
});

///////////////////// security midlewate ///////////////////////////
app.use(helmet());
// app.use(
//   helmet.contentSecurityPolicy({
//     directives: {
//       defaultSrc: ["'self'"],
//       baseUri: ["'self'"],
//       fontSrc: ["'self'", 'https:', 'data:'],
//       scriptSrc: ["'self'", 'https://*.cloudflare.com'],
//       objectSrc: ["'none'"],
//       styleSrc: ["'self'", 'https:', 'unsafe-inline'],
//       upgradeInsecureRequests: [],
//     },
//   }),
// );

/////////////////////developmen midleware //////////////////////////
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

////////////////// parsing data from body //////////////////////////
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// Data sanitization agains noSQL query injection after  body parser
app.use(xss());
//Data sanitization agains XSS atack after  body parser ////////////
app.use(mongoSanitize());

//// prevent patameter pollution after all security sinitizers /////
app.use(
  hpp({
    whitelist: [
      'price',
      'duration',
      'difficulty',
      'maxGroupSize',
      'ratingsAverage',
      'ratingsQuantity',
    ],
  }),
);

app.use((req, res, next) => {
  req.author = 'Syimyk Satimbaev';
  next();
});

////////////////// set limit to client request /////////////////////
app.use('/api', limiter);

//////////////////// route midleware ///////////////////////////////
app.use('/', viewRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);

////////////////// midleware for unhandled routes ///////////////////////
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

////////////////// global Error Hanler midle ware ///////////////////////
app.use(globErrController);

module.exports = app;
