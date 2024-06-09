const express = require('express');
const tourController = require('../controllers/tourController');
const authCountroller = require('../controllers/authCountroller');
const reviewRouter = require('./reviewRouter');

const tourRouter = express.Router();

//////////////////// merging tour router with review router ////////////////////
tourRouter.use('/:tourId/reviews', reviewRouter);

tourRouter
  .route('/tours-within/:distance/center/:latlng/unit/:unit')
  .get(tourController.getTourByRadius);

tourRouter
  .route('/distances/:latlng/unit/:unit')
  .get(tourController.getDistances);

tourRouter
  .route('/month-tour/:id')
  .get(
    authCountroller.protect,
    authCountroller.permition('admin', 'lead-guide', 'guide'),
    tourController.countTourByMounth,
  );
tourRouter.route('/averave').get(tourController.tourAvg);

tourRouter
  .route('/top-5-cheap')
  .get(tourController.topCheapTours, tourController.getTours);

tourRouter
  .route('/')
  .get(tourController.getTours)
  .post(
    authCountroller.protect,
    authCountroller.permition('admin', 'lead-guide'),
    tourController.createTour,
  );

tourRouter
  .route('/:id')
  .get(tourController.getTour)
  .patch(
    authCountroller.protect,
    authCountroller.permition('admin', 'lead-guide'),
    tourController.uploadTourImages,
    tourController.resizeTourImages,
    tourController.updateTour,
  )
  .delete(
    authCountroller.protect,
    authCountroller.permition('admin', 'lead-guid'),
    tourController.deleteTour,
  );

module.exports = tourRouter;
