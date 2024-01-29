const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Can't be blank"],
      unique: [true],
      index: true,
    },
    password: {
      type: String,
      required: [true, "Can't be blank"],
    },
    newMessages: {
      type: Object,
      default: {},
    },
    isAdmin: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  { timestamps: true, minimize: false }
);

UserSchema.pre("save", function (next) {
  const user = this;
  if (!user.isModified("password")) return next();

  bcrypt.genSalt(10, function (err, salt) {
    if (err) return next(err);

    bcrypt.hash(user.password, salt, function (err, hash) {
      if (err) return next(err);

      user.password = hash;
      next();
    });
  });
});

UserSchema.methods.toJSON = function () {
  const user = this;
  const userObject = user.toObject();
  delete userObject.password;
  return userObject;
};

UserSchema.statics.findByCredentials = async function (name, password) {
  const user = await User.findOne({ name });
  if (!user) throw new Error("invalid username or password");

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new Error("invalid username or password");

  return user;
};

const User = mongoose.model("User", UserSchema);

module.exports = User;
