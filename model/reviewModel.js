const mongoose = require('mongoose');
const Tour = require('./tourModel');
// rating / review / createdAt / ref to tour / ref to user //

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'review is required'],
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },

    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'tour is required'],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'user is required'],
    },
  },

  { toJSON: { virtuals: true }, toObject: { virtuals: true } },
);

reviewSchema.statics.handleRatingAvg = async function (tourId) {
  const stats = await this.aggregate([
    {
      $match: { tour: tourId },
    },
    {
      $group: {
        _id: '$tour',
        avgRating: { $avg: '$rating' },
        nQuantity: { $sum: 1 },
      },
    },
  ]);

  const tours = await Tour.findByIdAndUpdate(
    tourId,
    {
      ratingsAverage: stats[0].avgRating || 4.5,
      ratingsQuantity: stats[0].nQuantity || 0,
    },
    { new: true },
  );

  return tours;
};

reviewSchema.post('save', async function () {
  const tourId = this.tour;
  await this.constructor.handleRatingAvg(tourId);
});

reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

reviewSchema.pre(/^findOneAnd/, async function (next) {
  this.r = await this.clone().findOne();
  next();
});

reviewSchema.post(/^findOneAnd/, async function () {
  this.r.constructor.handleRatingAvg(this.r.tour);
});

reviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'user',
    select: 'name photo',
  });
  next();
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
