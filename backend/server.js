const express = require("express");
const app = express();
const User = require("./models/User");
const Admin = require("./models/Admin");
const Message = require("./models/Message");
const Medication = require("./models/Medication");
const Estimation = require("./models/Estimation");
const Notification = require("./models/Notification");
const Log = require("./models/Log");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const upload = multer();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());

// File paths
const BASE_PATH = path.join(__dirname, "..", "frontend", "src", "json");
const USERS_FILE_PATH = path.join(BASE_PATH, "users.json");
const MEDICATIONS_FILE_PATH = path.join(BASE_PATH, "medications.json");
const ESTIMATIONS_FILE_PATH = path.join(BASE_PATH, "estimations.json");
const ESTIMATIONHFS_FILE_PATH = path.join(BASE_PATH, "estimationHFS.json");
const PERSONAL_FILE_PATH = path.join(BASE_PATH, "personal.json");

// ฟังก์ชันอ่านไฟล์ JSON (ยืดหยุ่นรับพาธไฟล์)
const readJSONFile = async (filePath) => {
  try {
    const data = await fs.promises.readFile(filePath, "utf8");
    return JSON.parse(data);
  } catch (err) {
    // ถ้าไฟล์ยังไม่มีให้คืนค่าว่าง
    return {};
  }
};

// ฟังก์ชันเขียนไฟล์ JSON (ยืดหยุ่นรับพาธไฟล์)
const writeJSONFile = async (filePath, data) => {
  try {
    await fs.promises.writeFile(filePath, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("Error writing to JSON file:", err);
  }
};

// Notification helpers
app.get("/getnotifications", async (req, res) => {
  try {
    const notifications = await Notification.find();
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ error: "Error fetching notifications" });
  }
});

const updateNotification = async (from) => {
  try {
    const userExists = await User.findById(from);
    if (!userExists) {
      console.log("User not found, notification not created");
      return;
    }

    const notification = await Notification.findOne({ from });
    if (!notification) {
      await Notification.create({ from });
    } else {
      console.log("Notification already exists for this user");
    }
    console.log("Notification updated successfully");
  } catch (error) {
    console.error("Error updating notification:", error.message);
  }
};

app.post("/removeNotification", async (req, res) => {
  const { userId } = req.body;
  try {
    await Notification.deleteOne({ userId });
    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin
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
    
    await Log.create({
      action: "admin login",
      user: name,
      details: "Admin logged in",
    });
    res.status(200).json(admin);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

app.post("/admin/logout", async (req, res) => {
  try {
    const { name } = req.body;

    await Log.create({
      action: "admin logout",
      user: name,
      details: "Admin logged out",
    });

    res.status(200).send();
  } catch (e) {
    res.status(400).send({ error: e.message });
  }
});

// Personal

app.get("/getPendingChanges", async (req, res) => {
  try {
    const pendingChanges = await readJSONFile(PERSONAL_FILE_PATH);
    res.status(200).json(Object.values(pendingChanges)); // ส่งคืนข้อมูลเป็น array
  } catch (error) {
    res.status(500).json({ error: "Error fetching pending changes" });
  }
});

app.post("/saveChangesToJson", async (req, res) => {
  const { changes } = req.body; // รับข้อมูล _id และ changes จาก request
  try {
    await Log.create({
      action: "แก้ไขข้อมูล",
      user: "admin1",
      details: `แก้ไขข้อมูล ${changes.name}`,
    });
    let personalData = await readJSONFile(PERSONAL_FILE_PATH);
    personalData[changes._id] = changes; // ใช้ _id แทน userId
    await writeJSONFile(PERSONAL_FILE_PATH, personalData);
    res.json({ message: "Changes saved to personal.json", changes });
  } catch (error) {
    res.status(500).json({ error: "Error saving changes to personal.json" });
  }
});

app.post("/confirmChanges", async (req, res) => {
  const { _id, name } = req.body; // รับ _id แทน userId
  try {
    let personalData = await readJSONFile(PERSONAL_FILE_PATH);
    const pendingChange = personalData[_id];
    if (!pendingChange) {
      return res.status(404).json({ message: "No pending changes found" });
    }

    // อัปเดตข้อมูลในฐานข้อมูล MongoDB
    await User.findByIdAndUpdate(_id, pendingChange, { new: true });

    await Log.create({
      action: "แก้ไขข้อมูล",
      user: "admin2",
      details: `ยืนยันการแก้ไขข้อมูล ${name}`,
    });

    // อัปเดต personal.json ด้วยข้อมูลที่ถูกยืนยัน
    personalData[_id] = pendingChange; // ยืนยันการเปลี่ยนแปลง

    // ลบข้อมูลที่ยืนยันแล้วจากไฟล์ JSON
    delete personalData[_id];
    await writeJSONFile(PERSONAL_FILE_PATH, personalData);
    const users = await User.find();
    await writeJSONFile(USERS_FILE_PATH, users);
    res.json({
      message: "Changes confirmed and saved to database and personal.json",
      pendingChange,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/rejectChanges", async (req, res) => {
  const { _id, name } = req.body; // ใช้ _id แทน userId
  try {
    let personalData = await readJSONFile(PERSONAL_FILE_PATH);
    const pendingChange = personalData[_id];
    if (!pendingChange) {
      return res.status(404).json({ message: "No pending changes found" });
    }
    await Log.create({
      action: "แก้ไขข้อมูล",
      user: "admin2",
      details: `ยกเลิกการแก้ไขข้อมูล ${name}`,
    });
    delete personalData[_id]; // ลบข้อมูลที่ถูกปฏิเสธ
    await writeJSONFile(PERSONAL_FILE_PATH, personalData);
    res.json({ message: "Changes rejected and removed from pending list" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// User
app.post("/user", async (req, res) => {
  try {
    const { name, phone, password, age } = req.body;
    const user = await User.create({ name, phone, password, age });

    const users = await User.find();
    await writeJSONFile(USERS_FILE_PATH, users);

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
    if (!user) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

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

app.delete("/logout", async (req, res) => {
  try {
    const { _id } = req.body;
    await User.findByIdAndDelete(_id);
    res.status(200).send();
  } catch (e) {
    res.status(400).send({ error: e.message });
  }
});

// Users
app.get("/getusers", async (req, res) => {
  try {
    const users = await User.find();
    await writeJSONFile(USERS_FILE_PATH, users);
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: "Error writing JSON file" });
  }
});

app.post("/getuser", async (req, res) => {
  const { id } = req.body;

  try {
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  } catch (err) {
    res.status(500).json({ error: "Error fetching user" });
  }
});

app.put("/update", async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(req.body._id, req.body, {
      new: true,
    });

    const users = await User.find();
    await writeJSONFile(USERS_FILE_PATH, users);
    res.json(updatedUser);
  } catch (err) {
    res.status(500).json({ error: "Error updating user" });
  }
});

// Medication
app.post("/getmedication", async (req, res) => {
  try {
    const medications = await Medication.find();
    await writeJSONFile(MEDICATIONS_FILE_PATH, medications);
    res.json(medications);
  } catch (err) {
    res.status(500).json({ error: "Error writing JSON file" });
  }
});

app.post("/createmedication", async (req, res) => {
  try {
    const medication = await Medication.create(req.body);
    const medications = await Medication.find();
    await writeJSONFile(MEDICATIONS_FILE_PATH, medications);
    res.json(medication);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/updatemedication", async (req, res) => {
  try {
    const { from, status, time, date } = req.body;
    let medication = await Medication.findOne({ from, time, date });
    if (!medication) {
      medication = new Medication({ from, status, time, date });
    } else {
      medication.status = status;
    }
    await medication.save();

    const medications = await Medication.find();
    await writeJSONFile(MEDICATIONS_FILE_PATH, medications);

    res.json(medication);
  } catch (err) {
    res.status(500).json({ error: "Error updating medication status" });
  }
});

// Estimation
app.post("/getestimation", async (req, res) => {
  try {
    const estimations = await Estimation.find();
    await writeJSONFile(ESTIMATIONS_FILE_PATH, estimations);
    res.json(estimations);
  } catch (err) {
    res.status(500).json({ error: "Error fetching estimations" });
  }
});

app.post("/getHFSDetails", async (req, res) => {
  try {
    const estimations = await Estimation.find({ hfsLevel: { $ne: 0 } });
    res.json(estimations);
  } catch (err) {
    res.status(500).json({ error: "Error fetching estimations" });
  }
});

app.post("/createstimation", async (req, res) => {
  try {
    const estimation = await Estimation.create(req.body);
    res.json(estimation);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/evaluateHFS", async (req, res) => {
  const { estimationId, user, adminName, hfsLevel } = req.body; // ใช้ estimationId แทน userId

  try {
    // อ่านข้อมูลจาก estimationHFS.json
    let estimationsHFS = await readJSONFile(ESTIMATIONHFS_FILE_PATH);

    // ถ้ายังไม่มีข้อมูลการประเมิน ให้สร้างข้อมูลใหม่
    let estimation = estimationsHFS[estimationId]; // ใช้ estimationId
    if (!estimation) {
      estimation = { estimationId, user, evaluations: {} }; // ใช้ estimationId แทน userId
      estimationsHFS[estimationId] = estimation;
    }

    // อัปเดตผลการประเมินของแอดมิน
    estimation.evaluations[adminName] = { hfsLevel };

    const { admin1, admin2 } = estimation.evaluations;

    // ตรวจสอบว่าทั้ง admin1 และ admin2 ประเมินแล้วหรือยัง
    if (admin1?.hfsLevel !== undefined && admin2?.hfsLevel !== undefined) {
      if (admin1.hfsLevel === admin2.hfsLevel) {
        // ถ้าผลการประเมินตรงกัน ให้แก้ไข hfsLevel ในฐานข้อมูล MongoDB
        const updatedEstimation = await Estimation.findOneAndUpdate(
          { _id: estimationId }, // ใช้ _id แทนการค้นหาด้วย userId
          { hfsLevel: admin1.hfsLevel }, // อัปเดตค่า hfsLevel ให้เป็นค่าที่ทั้งคู่เห็นตรงกัน
          { new: true } // ส่งคืนเอกสารที่ถูกอัปเดตแล้ว
        );

        // ส่งข้อมูลอัปเดตกลับไปยัง client
        res.json({
          message: `Both admins agreed on HFS level ${admin1.hfsLevel === 5 ? "ไม่พบอาการ" : admin1.hfsLevel}. Estimation updated.`,
          updatedEstimation,
        });

        await Log.create({
          action: "ประเมินอาการ HFS",
          user: adminName,
          details: `ประเมินอาการโดย ${adminName}`,
        });

        // ลบเฉพาะข้อมูลของ estimationId นี้จาก estimationHFS.json
        delete estimationsHFS[estimationId]; // ลบข้อมูลเฉพาะ estimationId ที่ทำการประเมินเสร็จแล้ว

        // บันทึกการเปลี่ยนแปลงกลับไปที่ estimationHFS.json
        await writeJSONFile(ESTIMATIONHFS_FILE_PATH, estimationsHFS);
      } else {
        await Log.create({
          action: "ประเมินอาการ HFS",
          user: 'admin',
          details: `ประเมินอาการผิดพลาด`,
        });
        // ถ้าผลการประเมินไม่ตรงกัน ให้รีเซ็ตการประเมินของทั้งคู่ในไฟล์ JSON
        delete estimation.evaluations.admin1.hfsLevel;
        delete estimation.evaluations.admin2.hfsLevel;
        res.json({ message: "Admins did not agree, please evaluate again." });
      }
    } else {
      // ถ้าผลการประเมินยังไม่ครบทั้งสองคน

      await Log.create({
        action: "ประเมินอาการ HFS",
        user: adminName,
        details: `ประเมินอาการโดย ${adminName}`,
      });
      
      const admin1Status = admin1?.hfsLevel === 5 ? "ไม่พบอาการ" : admin1?.hfsLevel;
      const admin2Status = admin2?.hfsLevel === 5 ? "ไม่พบอาการ" : admin2?.hfsLevel;

      res.json({
        message: `Waiting for ${admin1?.hfsLevel === undefined ? "admin1" : "admin2"} to evaluate. Current: ${admin1?.hfsLevel === undefined ? admin2Status : admin1Status}`,
      });
    }

    // บันทึกการเปลี่ยนแปลงกลับไปที่ estimationHFS.json
    await writeJSONFile(ESTIMATIONHFS_FILE_PATH, estimationsHFS);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Chat
app.post("/getmessage", async (req, res) => {
  try {
    const { from, to } = req.body;
    const messages = await Message.find({
      $or: [
        { from: from, to: to },
        { from: to, to: from },
      ],
    });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: "Error fetching messages" });
  }
});

app.post("/createmessage", async (req, res) => {
  try {
    const { from, to, date, time, content } = req.body; // รับ selectuser จาก request

    const newMessage = await Message.create({
      content: content,
      contentType: "text",
      from,
      to,
      date,
      time,
    });

    await updateNotification(from);

    res.json(newMessage);
  } catch (err) {
    console.error("Error creating message:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/chatphoto", upload.single("photo"), async (req, res) => {
  try {
    const { from, to, date, time } = req.body; // รับ selectuser จาก request
    const image = req.file.buffer.toString("base64");

    const newMessage = await Message.create({
      content: image,
      contentType: "image",
      from,
      to,
      date,
      time,
    });

    await updateNotification(from);

    res.json(newMessage);
  } catch (error) {
    console.error("Error processing chat photo:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//log
app.get("/logs", async (req, res) => {
  try {
    const logs = await Log.find().sort({ timestamp: -1 }); // ดึง log ทั้งหมดและเรียงตามเวลาล่าสุด
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

require("./connection");

const server = require("http").createServer(app);
const PORT = 4452;

server.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});