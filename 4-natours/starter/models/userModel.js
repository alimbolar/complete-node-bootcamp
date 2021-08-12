const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: [true, 'Email is needed'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Email is not valid']
  },
  photo: {
    type: String
  },
  password: {
    type: String,
    required: [true, 'Password is needed'],
    minlength: 8,
    select: false
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm password'],
    validate: {
      // This works only with save() OR create()
      validator: function(el) {
        return el === this.password;
      }
    }
  },
  passwordChangedAt: {
    type: Date
  }
});

userSchema.pre('save', async function(next) {
  {
    if (!this.isModified('password')) return next();

    this.password = await bcrypt.hash(this.password, 12);
    this.passwordConfirm = undefined;
    next();
  }
});

userSchema.methods.correctPassword = async function(
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimeStamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    console.log(JWTTimestamp, changedTimeStamp);

    return JWTTimestamp < changedTimeStamp;
  }

  return false;
};
const User = mongoose.model('User', userSchema);

module.exports = User;
