const express = require("express");
const app = express();
const cors = require("cors");
const multer = require("multer");
const upload = multer();

const User = require("./models/User");
const Admin = require("./models/Admin");
const Message = require("./models/Message");
const Medication = require("./models/Medication");
const Estimation = require("./models/Estimation");
const Log = require("./models/Log");

const mongoose = require("mongoose");
const { Schema } = mongoose;

const ChatNotification =
  mongoose.models.ChatNotification ||
  mongoose.model(
    "ChatNotification",
    new Schema(
      {
        from: { type: Schema.Types.ObjectId, ref: "User", index: true, unique: true },
        createdAt: { type: Date, default: Date.now },
      },
      { timestamps: true }
    )
  );

const HFSNotification =
  mongoose.models.HFSNotification ||
  mongoose.model(
    "HFSNotification",
    new Schema(
      {
        estimationId: { type: Schema.Types.ObjectId, ref: "Estimation", index: true, unique: true },
        userId: { type: Schema.Types.ObjectId, ref: "User", index: true },
        createdAt: { type: Date, default: Date.now },
      },
      { timestamps: true }
    )
  );

// Middlewares
app.use(cors());
app.use(express.urlencoded({ extended: true, limit: "2mb" }));
app.use(express.json({ limit: "2mb" }));

/* ----------------------------- Admin ------------------------------ */
app.post("/admin", async (req, res) => {
  try {
    const { name, password } = req.body;
    const admin = await Admin.create({ name, password });
    res.status(201).json(admin);
  } catch (e) {
    const msg = e.code === 11000 ? "admin already exists" : e.message;
    res.status(400).json({ error: msg });
  }
});

app.post("/admin/login", async (req, res) => {
  try {
    const { name, password } = req.body;
    const admin = await Admin.findByCredentials(name, password);
    await Log.create({ action: "admin login", user: name, details: "Admin logged in" });
    res.status(200).json(admin);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

app.post("/admin/logout", async (req, res) => {
  try {
    const { name } = req.body;
    await Log.create({ action: "admin logout", user: name, details: "Admin logged out" });
    res.status(200).send();
  } catch (e) {
    res.status(400).send({ error: e.message });
  }
});

/* ------------------------------ Users ----------------------------- */
app.get("/getusers", async (_req, res) => {
  try {
    const users = await User.find().lean();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: "Error fetching users" });
  }
});

app.post("/getuser", async (req, res) => {
  try {
    const { id } = req.body;
    const user = await User.findById(id).lean();
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch {
    res.status(500).json({ error: "Error fetching user" });
  }
});

app.post("/user", async (req, res) => {
  try {
    const { name, phone, password, age } = req.body;
    const user = await User.create({ name, phone, password, age });
    res.status(201).json(user);
  } catch (e) {
    const msg = e.code === 11000 ? "User already exists" : e.message;
    res.status(400).json({ error: msg });
  }
});

app.post("/user/login", async (req, res) => {
  try {
    const { name, password } = req.body;
    const user = await User.findByCredentials(name, password);
    if (!user) return res.status(401).json({ message: "Invalid username or password" });

    const isFirstLogin = user.FirstLogin;
    if (isFirstLogin) {
      user.FirstLogin = false;
      await user.save();
    }
    res.status(200).json({ isFirstLogin, user });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

app.delete("/user", async (req, res) => {
  try {
    const { _id } = req.body;
    await User.findByIdAndDelete(_id);
    res.status(200).send();
  } catch (e) {
    res.status(400).send({ error: e.message });
  }
});

app.post("/logout", async (req, res) => {
  try {
    const { name } = req.body;
    await Log.create({ action: "admin logout", user: name, details: "Admin logged out" });
    return res.status(204).send();
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
});

/* -------- Pending personal changes: เก็บใน User.pendingEdits -------- */

app.get("/personal/pending", async (_req, res) => {
  try {
    const users = await User.find(
      { pendingEdits: { $exists: true, $ne: null } },
      { pendingEdits: 1 } // ดึงแค่ pendingEdits ก็พอ
    ).lean();

    // ส่งเป็น object: { [userId]: pendingEdits }
    const map = {};
    users.forEach((u) => { map[u._id] = u.pendingEdits; });
    res.json(map);
  } catch (err) {
    console.error("❌ Error fetching pending personal edits:", err);
    res.status(500).json({ error: "Error fetching pending personal edits" });
  }
});


app.post("/saveChanges", async (req, res) => {
  try {
    const { changes, originalName } = req.body; // ต้องมี changes._id
    if (!changes?._id) return res.status(400).json({ error: "Missing user _id in changes" });

    await Log.create({ action: "แก้ไขข้อมูล", user: "Apatnipa", details: `กำลังแก้ไขข้อมูล ${originalName}` });

    const user = await User.findByIdAndUpdate(
      changes._id,
      { $set: { pendingEdits: changes } },
      { new: true }
    ).lean();

    return res.json({ message: "Changes queued for approval", pendingEdits: user?.pendingEdits || null });
  } catch (error) {
    return res.status(500).json({ error: "Error queuing changes" });
  }
});

// Approve edits
app.post("/confirmChanges", async (req, res) => {
  try {
    const { _id, name } = req.body;
    const user = await User.findById(_id);
    if (!user?.pendingEdits) return res.status(404).json({ message: "No pending changes found" });

    const { pendingEdits } = user.toObject();

    // เอาค่าใน pendingEdits (ยกเว้น _id / pendingEdits) ไปอัปเดตจริง
    const { _id: _ignored, pendingEdits: __ignored, ...fields } = pendingEdits;
    await User.findByIdAndUpdate(_id, { $set: fields, $unset: { pendingEdits: "" } }, { new: true });

    await Log.create({ action: "แก้ไขข้อมูล", user: "Chureeporn", details: `ยืนยันการแก้ไขข้อมูล ${name}` });
    res.json({ message: "Changes confirmed and saved to database" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Reject edits
app.post("/rejectChanges", async (req, res) => {
  try {
    const { _id, name } = req.body;
    await User.findByIdAndUpdate(_id, { $unset: { pendingEdits: "" } });
    await Log.create({ action: "แก้ไขข้อมูล", user: "Chureeporn", details: `ยกเลิกการแก้ไขข้อมูล ${name}` });
    res.json({ message: "Changes rejected and removed from pending list" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* ---------------------------- Medication -------------------------- */
app.get("/getmedication", async (_req, res) => {
  try {
    const medications = await Medication.find().lean();
    res.json(medications);
  } catch {
    res.status(500).json({ error: "Error fetching medication" });
  }
});

app.post("/createmedication", async (req, res) => {
  try {
    const medication = await Medication.create(req.body);
    res.json(medication);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/deletemedication/:id", async (req, res) => {
  try {
    const deleted = await Medication.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Medication not found" });
    res.status(200).json({ message: "Medication deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete medication" });
  }
});

app.put("/editmedication/:id", async (req, res) => {
  try {
    const { date, time, status } = req.body;
    const updated = await Medication.findByIdAndUpdate(
      req.params.id,
      { date, time, status },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: "Medication not found" });
    res.status(200).json({ message: "Medication updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to update medication" });
  }
});

app.put("/updatemedication", async (req, res) => {
  try {
    const { from, status, time, date } = req.body;
    let med = await Medication.findOne({ from, time, date });
    if (!med) med = await Medication.create({ from, status, time, date });
    else {
      med.status = status;
      await med.save();
    }
    res.json(med);
  } catch {
    res.status(500).json({ error: "Error updating medication status" });
  }
});

/* ----------------------------- Estimation ------------------------- */

app.get("/gethfsnotification", async (_req, res) => {
  try {
    const list = await HFSNotification.find()
      .sort({ createdAt: -1 })
      .populate({
        path: "estimationId",            // ref: "Estimation"
        select: "evaluations hfsLevel",  // เอาเฉพาะที่ต้องใช้
      })
      .lean();

    // แปลงให้อ่านง่ายฝั่ง frontend
    const result = list.map(n => ({
      estimationId: n.estimationId?._id ?? n.estimationId, // เผื่อ populate ว่าง
      userId: n.userId,
      createdAt: n.createdAt,
      evaluations: n.estimationId?.evaluations || {},      // <-- ใช้เช็ค "รออีกคน"
      hfsLevel: n.estimationId?.hfsLevel ?? 0,
    }));

    res.json(result);
  } catch (err) {
    console.error("❌ /gethfsnotification error:", err);
    res.status(500).json({ error: "Error fetching HFS notifications" });
  }
});

// Page + pagination
app.post("/getestimation", async (req, res) => {
  const { from, page = 0, limit = 1 } = req.body;
  try {
    const fromId = new mongoose.Types.ObjectId(from); // ให้แน่ใจว่า cast เป็น ObjectId
    const [data, total] = await Promise.all([
      Estimation.find({ from: fromId })
        .sort({ createdAt: -1 })
        .skip(page * limit)
        .limit(limit)
        .lean(),
      Estimation.countDocuments({ from: fromId }),
    ]);
    res.json({ data, total });
  } catch (error) {
    res.status(500).json({ error: "Error fetching estimations" });
  }
});

// For history view (exclude photos)
app.post("/getHFSDetails", async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: "User ID is required" });

    const estimations = await Estimation.find(
      { from: userId, hfsLevel: { $ne: 0 } },
      { photos: 0 }
    ).lean();

    res.json(estimations);
  } catch {
    res.status(500).json({ error: "Error fetching estimations" });
  }
});

app.post("/createstimation", async (req, res) => {
  try {
    const estimation = await Estimation.create({ ...req.body, evaluations: {} });

    // create HFS notification (unique per estimation)
    await HFSNotification.updateOne(
      { estimationId: estimation._id },
      { $setOnInsert: { estimationId: estimation._id, userId: estimation.from } },
      { upsert: true }
    );

    res.json(estimation);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// สองแอดมินประเมิน: เก็บใน estimation.evaluations.{adminName}.hfsLevel
app.put("/evaluateHFS", async (req, res) => {
  const { estimationId, userId, userName, adminName, hfsLevel } = req.body;

  try {
    const estimation = await Estimation.findById(estimationId);
    if (!estimation) return res.status(404).json({ error: "Estimation not found" });

    // ensure evaluations map
    if (!estimation.evaluations) estimation.evaluations = new Map();

    // ✅ ใช้ set + markModified ให้แน่ใจว่าบันทึก
    estimation.evaluations.set(adminName, { hfsLevel, at: new Date() });
    estimation.markModified("evaluations");

    const eva = estimation.evaluations && Object.fromEntries(estimation.evaluations.entries());
    const hasA = eva?.Apatnipa?.hfsLevel !== undefined;
    const hasC = eva?.Chureeporn?.hfsLevel !== undefined;

    if (hasA && hasC) {
      if (eva.Apatnipa.hfsLevel === eva.Chureeporn.hfsLevel) {
        estimation.hfsLevel = eva.Apatnipa.hfsLevel;
        await estimation.save();

        await HFSNotification.deleteOne({ estimationId });

        await Log.create({
          action: "ประเมินอาการ HFS",
          user: adminName,
          details: `ประเมินอาการของ ${userName} เสร็จสิ้น`,
        });

        // ถ้าอยากล้างผลโหวตภายหลังสรุป
        estimation.evaluations = new Map();
        estimation.markModified("evaluations");
        await estimation.save();

        return res.json({
          message: `ประเมินอาการ ${userName} เสร็จสิ้น`,
          updatedEstimation: estimation.toObject(),
        });
      } else {
        estimation.evaluations = new Map();
        estimation.markModified("evaluations");
        await estimation.save();

        await Log.create({
          action: "ประเมินอาการ HFS",
          user: adminName,
          details: `ประเมินอาการของ ${userName} ไม่ตรงกัน`,
        });

        return res.json({ message: `ประเมินอาการ ${userName} ผิดพลาด` });
      }
    } else {
      await estimation.save();
      await Log.create({
        action: "ประเมินอาการ HFS",
        user: adminName,
        details: `ประเมินอาการโดย ${adminName}`,
      });

      const waitingFor = hasA ? "Chureeporn" : "Apatnipa";
      return res.json({ message: `ประเมินสำเร็จ กำลังรอ ${waitingFor} ประเมิน` });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* ------------------------ Chat Notifications ---------------------- */
app.get("/getchatnotification", async (_req, res) => {
  try {
    const list = await ChatNotification.find().lean();
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: "Error fetching notifications" });
  }
});

const updateChatNotification = async (from) => {
  try {
    const exists = await User.exists({ _id: from });
    if (!exists) return;
    await ChatNotification.updateOne(
      { from },
      { $setOnInsert: { from } },
      { upsert: true }
    );
  } catch (error) {
    console.error("Error updating notification:", error.message);
  }
};

app.post("/removechatnotification", async (req, res) => {
  try {
    const { from } = req.body;
    await ChatNotification.deleteOne({ from });
    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* -------------------------------- Chat ---------------------------- */
app.post("/getmessage", async (req, res) => {
  try {
    const { from, to } = req.body;
    const messages = await Message.find({
      $or: [
        { from: from, to: to },
        { from: to, to: from },
      ],
    }).lean();
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: "Error fetching messages" });
  }
});

app.post("/createmessage", async (req, res) => {
  try {
    const { from, to, date, time, content } = req.body;
    const newMessage = await Message.create({
      content,
      contentType: "text",
      from,
      to,
      date,
      time,
    });

    if (from !== "admin") await updateChatNotification(from);

    res.json(newMessage);
  } catch (err) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/chatphoto", upload.single("photo"), async (req, res) => {
  try {
    const { from, to, date, time } = req.body;
    const image = req.file.buffer.toString("base64");

    const newMessage = await Message.create({
      content: image,
      contentType: "image",
      from,
      to,
      date,
      time,
    });

    if (from !== "admin") await updateChatNotification(from);

    res.json(newMessage);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

/* -------------------------------- Logs --------------------------- */
app.get("/logs", async (_req, res) => {
  try {
    const logs = await Log.find().sort({ timestamp: -1 }).lean();
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* ----------------------------- Video ----------------------------- */
const fs = require("fs");
const path = require("path");
app.get("/video", (req, res) => {
  const videoPath = path.join(__dirname, "video", "VDO_nurse_final.mp4");
  fs.stat(videoPath, (err, stats) => {
    if (err) return res.status(404).send("Video not found");
    const range = req.headers.range;
    if (!range) return res.status(416).send("Requires Range header");

    const videoSize = stats.size;
    const CHUNK_SIZE = 10 ** 6;
    const start = Number(range.replace(/\D/g, ""));
    const end = Math.min(start + CHUNK_SIZE, videoSize - 1);
    const contentLength = end - start + 1;

    res.writeHead(206, {
      "Content-Range": `bytes ${start}-${end}/${videoSize}`,
      "Accept-Ranges": "bytes",
      "Content-Length": contentLength,
      "Content-Type": "video/mp4",
    });

    fs.createReadStream(videoPath, { start, end }).pipe(res);
  });
});

/* ---------------------------- Bootstraps ------------------------- */
require("./connection");

const server = require("http").createServer(app);
const PORT = 4452;
server.listen(PORT, () => console.log(`Listening on port ${PORT}`));