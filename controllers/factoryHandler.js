const AppError = require('../utils/appError');
const asyncErrorHandler = require('../utils/asyncErrHandler');
const APIFeatures = require('../utils/apiFeatures');

exports.deleteOne = function (model) {
  return asyncErrorHandler(async (req, res, next) => {
    const doc = await model.findByIdAndDelete(req.params.id);

    if (!doc) {
      return next(new AppError('there is no documents with this ID', 404));
    }

    res.status(204).json({
      satuss: 'succsess',
      data: null,
    });
  });
};

exports.updateOne = function (model) {
  return asyncErrorHandler(async (req, res, next) => {
    if (req.body.password || req.body.passwordConfirm)
      return next(
        new AppError('you can not update password from this route', 400),
      );
    const doc = await model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!doc) {
      return next(new AppError('there is no documents with this ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: doc,
    });
  });
};

exports.createOne = function (model) {
  return asyncErrorHandler(async (req, res) => {
    const data = await model.create(req.body);

    res.status(200).json({
      status: 'success',
      data: data,
    });
  });
};

exports.getOne = function (model, populateOption) {
  return asyncErrorHandler(async (req, res, next) => {
    let doc = await model.findById(req.params.id);
    if (!doc) {
      return next(new AppError('incorrect ID', 404));
    }

    if (populateOption) doc = await doc.populate(populateOption);

    res.status(200).json({
      status: 'success',
      data: doc,
    });
  });
};

exports.getAll = function (model) {
  return asyncErrorHandler(async (req, res, next) => {
    let filter = {};

    if (req.params.tourId) filter = { tour: req.params.tourId };

    const features = new APIFeatures(model.find(filter), req.query)
      .filter(req.query)
      .sort()
      .fields()
      .pagination();

    //document statistics like checking how mony documents scaned mongoDB: "const doc = await features.query.explain()";

    const doc = await features.query;

    res.status(200).json({
      status: 'success',
      result: doc.length,
      data: doc,
    });
  });
};
