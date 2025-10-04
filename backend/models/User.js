const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const { Schema } = mongoose;

const UserSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Can't be blank"],
      unique: true,
      index: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Can't be blank"],
    },
    phone: {
      type: String,
      required: [true, "Can't be blank"],
      trim: true,
    },
    other_numbers: {
      type: String,
      default: "",
      trim: true,
    },
    age: {
      type: Number,
      required: [true, "Can't be blank"],
      min: 0,
    },
    diagnosis: {
      type: String,
      default: "",
      trim: true,
    },
    hospital_number: {
      type: String,
      default: "",
      trim: true,
    },
    other_medicine: {
      type: String,
      default: "",
      trim: true,
    },
    morningTime: {
      type: String,
      default: "08:00",
    },
    eveningTime: {
      type: String,
      default: "20:00",
    },
    taking_capecitabine: {
      type: String,
      default: "",
      trim: true,
    },
    FirstLogin: {
      type: Boolean,
      default: true,
    },

    // ⬇️ ฟิลด์ใหม่ ใช้เก็บข้อมูลที่รออนุมัติ (Apatnipa ส่ง / Chureeporn กดยืนยัน)
    pendingEdits: {
      type: Schema.Types.Mixed, // เก็บ object ได้ยืดหยุ่น
      default: null,
    },
  },
  {
    timestamps: true,
    minimize: false, // กัน object ว่างโดนลดรูป
  }
);

// ทำงานก่อนการบันทึก (hash password ถ้ามีแก้ไข)
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

// ทำงานก่อนส่ง response: ซ่อน password
UserSchema.methods.toJSON = function () {
  const user = this;
  const userObject = user.toObject();
  delete userObject.password;
  return userObject;
};

// ตรวจสอบสิทธิ์
UserSchema.statics.findByCredentials = async function (name, password) {
  const user = await User.findOne({ name });
  if (!user) throw new Error("invalid username or password");

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new Error("invalid username or password");

  return user;
};

const User = mongoose.model("User", UserSchema);

module.exports = User;