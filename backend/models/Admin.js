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
// ทำงานก่อนการบันทึก
AdminSchema.pre("save", function (next) {
  const admin = this;
  
  // ตรวจสอบว่ามีการเปลี่ยนแปลงรหัสผ่านหรือไม่
  if (!admin.isModified("password")) return next();

  // สร้าง salt และ hash รหัสผ่านเฉพาะเมื่อมีการเปลี่ยนแปลงรหัสผ่าน
  bcrypt.genSalt(10, function (err, salt) {
    if (err) return next(err);

    bcrypt.hash(admin.password, salt, function (err, hash) {
      if (err) return next(err);

      admin.password = hash;
      next();
    });
  });
});
// ทำงานก่อนส่ง response
AdminSchema.methods.toJSON = function () {
  const admin = this;
  const adminObject = admin.toObject();
  delete adminObject.password;
  return adminObject;
};
//ตรวจสอบสิทธิ์
AdminSchema.statics.findByCredentials = async function (name, password) {
  const admin = await Admin.findOne({ name });
  if (!admin) throw new Error("invalid username or password");

  const isMatch = await bcrypt.compare(password, admin.password);
  if (!isMatch) throw new Error("invalid username or password");

  return admin;
};

const Admin = mongoose.model("Admin", AdminSchema);

module.exports = Admin;
