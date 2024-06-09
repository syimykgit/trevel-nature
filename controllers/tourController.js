const Tour = require('../model/tourModel');
const asyncErrorHandler = require('../utils/asyncErrHandler');
const AppError = require('../utils/appError');
const factory = require('./factoryHandler');
const { isLatLong } = require('validator');
const sharp = require('sharp');
const multer = require('multer');

/////////////////////// middlware ///////////////////////////////
exports.topCheapTours = function (req, res, next) {
  req.query.fields = 'name price ratingsAverage summary ';
  req.query.sort = 'price -ratingsAverage';
  req.query.limit = 5;
  next();
};

exports.getTours = factory.getAll(Tour);
exports.getTour = factory.getOne(Tour, { path: 'reviews' });
exports.createTour = factory.createOne(Tour);
exports.updateTour = factory.updateOne(Tour);
exports.deleteTour = factory.deleteOne(Tour);

//////////////////////////// Tour agrigation /////////////////////////
exports.tourAvg = asyncErrorHandler(async (req, res) => {
  const state = await Tour.aggregate([
    {
      $match: { price: { $lte: 1000 } },
    },
    {
      $group: {
        _id: '$name',
        resulrs: { $sum: 1 },
        avgPrice: { $avg: '$price' },
        totalMaxGroupSize: { $sum: '$maxGroupSize' },
      },
    },
    {
      $sort: { _id: -1 },
    },
  ]);
  res.status(200).json({
    satuss: 'success',
    data: { state },
  });
});

module.exports.countTourByMounth = asyncErrorHandler(async (req, res) => {
  const year = +req.params.id;

  const monthStat = await Tour.aggregate([
    {
      $unwind: '$startDates',
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-1-1`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: null,
        result: { $sum: 1 },
        name: { $push: '$name' },
        prices: { $max: '$price' },
        totalMaxGroupSize: { $sum: '$maxGroupSize' },
      },
    },
    {
      $addFields: {
        month: '$_id',
      },
    },
    {
      $project: {
        _id: 0,
      },
    },
    { $sort: { prices: -1 } },
  ]);
  res.status(200).json({
    satuss: 'success',
    data: { monthStat },
  });
});

exports.getTourByRadius = asyncErrorHandler(async (req, res, next) => {
  // '/tours-within/:distance/center/:latlng/unit/:unit'
  const { distance, latlng, unit } = req.params;

  const [lat, lng] = latlng.split(',');

  if (!lat || !lng) return next(AppError('please provide lat / lng', 400));

  const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;

  const tours = await Tour.find({
    startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
  });
  res.status(200).json({
    status: 'success',
    result: tours.length,
    data: { data: tours },
  });
});

exports.getDistances = asyncErrorHandler(async (req, res, next) => {
  // '/distance/:latlng/unit/:unit'
  const { latlng, unit } = req.params;

  const [lat, lng] = latlng.split(',');

  if (!lat || !lng) return next(AppError('please provide lat / lng', 400));

  const mutiplaier = unit === 'mi' ? 0.000621371 : 0.001;

  const distances = await Tour.aggregate([
    {
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [+lat, +lng],
        },
        distanceField: 'distance',
        distanceMultiplier: mutiplaier,
      },
    },
    {
      $project: {
        name: 1,
        distance: 1,
      },
    },
  ]);

  res.status(200).json({
    status: 'success',
    result: distances.length,
    data: { data: distances },
  });
});

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('please upload image file!', 400), false);
  }
};

exports.resizeTourImages = async (req, res, next) => {
  if (!req.files.imageCover || !req.files.images) return next();

  req.body.imageCover = `tour-${req.params.id}-${Date.now()}-cover.jpeg`;

  await sharp(req.files.imageCover[0].buffer)
    .resize(2000, 1333)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/tours/${req.body.imageCover}`);

  req.body.images = await Promise.all(
    req.files.images.map(async (img, i) => {
      const fileName = `tour-${req.params.id}-${Date.now()}-${i + 1}.jpeg`;
      await sharp(img.buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/img/tours/${fileName}`);
      return fileName;
    }),
  );

  next();
};

const upload = multer({
  memoryStorage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadTourImages = upload.fields([
  {
    name: 'imageCover',
    maxCount: 1,
  },
  { name: 'images', maxCount: 3 },
]);
