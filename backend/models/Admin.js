const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const AdminSchema = new mongoose.Schema(
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
    }
  },
  { timestamps: true, minimize: false }
);

AdminSchema.pre("save", function (next) {
  const user = this;
  
  // ตรวจสอบว่ามีการเปลี่ยนแปลงรหัสผ่านหรือไม่
  if (!user.isModified("password")) return next();

  // สร้าง salt และ hash รหัสผ่านเฉพาะเมื่อมีการเปลี่ยนแปลงรหัสผ่าน
  bcrypt.genSalt(10, function (err, salt) {
    if (err) return next(err);

    bcrypt.hash(user.password, salt, function (err, hash) {
      if (err) return next(err);

      user.password = hash;
      next();
    });
  });
});


AdminSchema.methods.toJSON = function () {
  const user = this;
  const userObject = user.toObject();
  delete userObject.password;
  return userObject;
};

AdminSchema.statics.findByCredentials = async function (name, password) {
  const user = await Admin.findOne({ name });
  if (!user) throw new Error("invalid username or password");

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new Error("invalid username or password");

  return user;
};

const Admin = mongoose.model("Admin", AdminSchema);

module.exports = Admin;
