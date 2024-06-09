const mongoose = require('mongoose');
const slugify = require('slugify');
const User = require('./userModel');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'name is required'],
      unique: [true, 'this name is alrady exist'],
      maxlength: [40, 'name characters mast be min 10 max 40'],
      minlength: [10, 'name characters mast be min 10 max 40'],
      trim: true,
    },

    slugName: String,

    secretTours: {
      type: Boolean,
      default: false,
    },
    duration: {
      type: Number,
      required: [true, 'duration must be filed'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'max group size must be filed'],
    },

    difficulty: {
      type: String,
      required: [true, 'difficulty must be filed'],
    },
    price: {
      type: Number,
      required: [true, 'price must be filed'],
    },
    ///////////////// custum validation ////////////////////////
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          return val < this.price;
        },
        message: 'discoun must be below then current price',
      },
    },
    ratingsAverage: {
      type: Number,
      default: 0,
      set: (val) => val.toPrecision(3),
    },

    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    description: {
      type: String,
      trim: true,
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'summary must be filed'],
    },
    imageCover: {
      type: String,
      required: [true, 'tour must have a cover image'],
    },
    images: [String],

    createdAt: {
      type: Date,
      default: Date.now,
    },
    startDates: [Date],

    startLocation: {
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number],
      address: String,
      description: String,
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
      },
    ],
  },
  /////////////////// virtual properties options ///////////////////////////
  { toJSON: { virtuals: true }, toObject: { virtuals: true } },
);

// mongoose indexs

tourSchema.index({
  price: 1,
  ratingsAverage: -1,
  slug: 1,
});

tourSchema.index({ startLocation: '2dsphere' });

///////////////////////////// virtual populate /////////////////////////////
tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id',
});

/////// virtual populate  which is not gonna be saved in database /////////////
tourSchema.pre('save', async function (next) {
  const guidesProm = this.guides.map(async (el) => await User.findById(el));
  this.guides = await Promise.all(guidesProm);
  next();
});

//// definding virtual properties which is not gonna be saved in database ////
tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});

/////////////////// document midleware post / pre ////////////////////////////
tourSchema.pre('save', async function (next) {
  this.slugName = slugify(this.name, { lower: true });
  next();
  /////////// this //////////////
});

tourSchema.post('save', (doc, next) => {
  // console.log(doc);
  next();

  /////////// this or doc //////////////
});

/////////////////// query midleware post / pre ///////////////////////////
tourSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'guides',
    select: '-__v -passwordCreatedDate',
  });
  this.find({ secretTours: { $ne: true } });
  next();
  /////////// this //////////////
});

tourSchema.post(/^find/, (doc, next) => {
  // console.log(doc);
  next();
  /////// //// doc //////////////
});

/////////////////// aggregate midleware post / pre ///////////////////////////
tourSchema.pre('aggregate', function (next) {
  if (!this.pipeline()[0].$geoNear) {
    this.pipeline().unshift({ $match: { secretTours: { $ne: true } } });
    next();
  }
  next();
});

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;

// const fs = require('fs');

// const allTdata = JSON.parse(
//   fs.readFileSync('./dev-data/data/tours.json', 'utf8'),
// );

// const importFn = async function () {
//   try {
//     await Tour.create(allTdata);
//     console.log('data imported');
//   } catch (err) {
//     console.log(err);
//   }
//   process.exit();
// };
// importFn();

// const delateFn = async function () {
//   try {
//     await Tour.deleteMany();
//     console.log('data deleted');
//   } catch (err) {
//     console.log(err);
//   }
//   process.exit();
// };

// delateFn();
