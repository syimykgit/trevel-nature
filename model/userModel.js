const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt1 = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'name is required'],
    unique: [true, 'name must be unique'],
    maxlength: 20,
  },

  email: {
    type: String,
    validate: [validator.isEmail, 'please provide with valid email'],
    required: [true, 'email is required'],
    unique: [true, 'email must be unique'],
    lowercase: true,
  },
  password: {
    type: String,
    required: [true, 'password is required'],
    minlength: 8,
    select: false,
  },
  passwordConfirm: {
    type: String,
    validate: {
      validator: function (value) {
        return this.password === value;
      },
      message: 'confirmation password must be the same',
    },
    required: [true, 'passwordConfirm is required'],
  },

  photo: {
    type: String,
    default: 'default.jpg',
  },

  role: {
    type: String,
    enum: ['admin', 'guide', 'user', 'lead-guide'],
    default: 'user',
  },
  passwordCreatedDate: Date,
  passwordResetToken: String,
  passwordResetExpired: Date,
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});

userSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } });
  next();
});

userSchema.pre('save', async function (next) {
  // run this function if password was not modified
  if (!this.isModified('password')) return next();
  // passwor encrypting

  this.password = await bcrypt1.hash(this.password, 12);

  // delete passwordConfirm field
  this.passwordConfirm = undefined;
  next();
});

userSchema.pre('save', async function (next) {
  // run this function if document is new
  if (!this.isModified('password') || this.isNew) return next();

  // passwor created date
  this.passwordCreatedDate = Date.now() - 1000;
  next();
});

userSchema.methods.checkPassword = async function (
  candidatePassword,
  userPassword,
) {
  return await bcrypt1.compare(candidatePassword, userPassword);
};

userSchema.methods.isPasswortCanged = function (JWTtimestamp) {
  if (this.passwordCreatedDate)
    return this.passwordCreatedDate.getTime() / 1000 > JWTtimestamp;

  return false;
};

userSchema.methods.generatePasswordResetToken = function () {
  const newToken = crypto.randomBytes(32).toString('hex');
  const cryptoToken = crypto
    .createHash('sha256')
    .update(newToken)
    .digest('hex');
  this.passwordResetToken = cryptoToken;
  this.passwordResetExpired = Date.now() + 10 * 60 * 1000;
  return newToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;

// const fs = require('fs');

// const allTdata = JSON.parse(
//   fs.readFileSync('./dev-data/data/users.json', 'utf8'),
// );

// const importFn = async function () {
//   try {
//     await User.create(allTdata);
//     console.log('data imported');
//   } catch (err) {
//     console.log(err);
//   }
//   process.exit();
// };
// importFn();
