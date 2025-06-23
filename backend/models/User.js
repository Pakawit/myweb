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
    phone: {
      type: String,
      required: [true, "Can't be blank"],
    },
    other_numbers: {
      type: String,
      default: "",
    },
    age: {
      type: Number,
      required: [true, "Can't be blank"],
    },
    diagnosis: {
      type: String,
      default: "",
    },
    hospital_number: {
      type: String,
      default: "",
    },
    other_medicine : {
      type: String,
      default: "",
    },
    morningTime : {
      type: String,
      default: "08:00",
    },
    eveningTime : {
      type: String,
      default: "20:00",
    },
    taking_capecitabine : {
      type: String,
      default: "",
    },
    FirstLogin :{
      type:Boolean,
      default:true,
    }
  },
  { timestamps: true, minimize: false }
);
// ทำงานก่อนการบันทึก
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
// ทำงานก่อนส่ง response
UserSchema.methods.toJSON = function () {
  const user = this;
  const userObject = user.toObject();
  delete userObject.password;
  return userObject;
};
//ตรวจสอบสิทธิ์
UserSchema.statics.findByCredentials = async function (name, password) {
  const user = await User.findOne({ name });
  if (!user) throw new Error("invalid username or password");

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new Error("invalid username or password");

  return user;
};

const User = mongoose.model("User", UserSchema);

module.exports = User;