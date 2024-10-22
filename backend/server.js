const express = require("express");
const app = express();
const User = require("./models/User");
const Admin = require("./models/Admin");
const Message = require("./models/Message");
const Medication = require("./models/Medication");
const Estimation = require("./models/Estimation");
const Log = require("./models/Log");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const upload = multer();

app.use(express.urlencoded({ extended: true, limit: "750kb" }));
app.use(express.json({ limit: "750kb" }));
app.use(cors());

// File paths
const BASE_PATH = path.join(__dirname, "..", "frontend", "src", "json");
const USERS_FILE_PATH = path.join(BASE_PATH, "users.json");
const MEDICATIONS_FILE_PATH = path.join(BASE_PATH, "medications.json");
const CHAT_NOTIFICATION_FILE_PATH = path.join(
  BASE_PATH,
  "chatnotification.json"
);
const ESTIMATIONHFS_FILE_PATH = path.join(BASE_PATH, "estimationHFS.json");
const PERSONAL_FILE_PATH = path.join(BASE_PATH, "personal.json");
const HFS_NOTIFICATION_FILE_PATH = path.join(BASE_PATH, "hfsnotification.json");

// ฟังก์ชันอ่านไฟล์ JSON
const readJSONFile = async (filePath) => {
  try {
    const data = await fs.promises.readFile(filePath, "utf8");
    return JSON.parse(data);
  } catch (err) {
    return {};
  }
};

// ฟังก์ชันเขียนไฟล์ JSON
const writeJSONFile = async (filePath, data) => {
  try {
    await fs.promises.writeFile(filePath, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("Error writing to JSON file:", err);
  }
};

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

// User
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

// Personal
app.get("/getPendingChanges", async (req, res) => {
  try {
    const pendingChanges = await readJSONFile(PERSONAL_FILE_PATH);
    res.status(200).json(Object.values(pendingChanges));
  } catch (error) {
    res.status(500).json({ error: "Error fetching pending changes" });
  }
});

app.post("/saveChangesToJson", async (req, res) => {
  const { changes } = req.body;
  try {
    await Log.create({
      action: "แก้ไขข้อมูล",
      user: "admin1",
      details: `แก้ไขข้อมูล ${changes.name}`,
    });
    let personalData = await readJSONFile(PERSONAL_FILE_PATH);
    personalData[changes._id] = changes;
    await writeJSONFile(PERSONAL_FILE_PATH, personalData);
    res.json({ message: "Changes saved to personal.json", changes });
  } catch (error) {
    res.status(500).json({ error: "Error saving changes to personal.json" });
  }
});

app.post("/confirmChanges", async (req, res) => {
  const { _id, name } = req.body;
  try {
    let personalData = await readJSONFile(PERSONAL_FILE_PATH);
    const pendingChange = personalData[_id];
    if (!pendingChange) {
      return res.status(404).json({ message: "No pending changes found" });
    }

    await User.findByIdAndUpdate(_id, pendingChange, { new: true });

    await Log.create({
      action: "แก้ไขข้อมูล",
      user: "admin2",
      details: `ยืนยันการแก้ไขข้อมูล ${name}`,
    });

    personalData[_id] = pendingChange;

    delete personalData[_id]; // ลบข้อมูลที่ยืนยันแล้วจากไฟล์ JSON
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
  const { _id, name } = req.body;
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
  const { from } = req.body;

  try {
    const estimations = await Estimation.find({ from });

    res.json(estimations);
  } catch (error) {
    console.error("Error fetching estimations:", error);
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

    let notifications = await readJSONFile(HFS_NOTIFICATION_FILE_PATH);

    notifications.push({
      estimationId: estimation._id,
      userId: estimation.from,
      timestamp: new Date().toISOString(),
    });

    await writeJSONFile(HFS_NOTIFICATION_FILE_PATH, notifications);

    res.json(estimation);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/evaluateHFS", async (req, res) => {
  const { estimationId, user, adminName, hfsLevel } = req.body;

  try {
    let estimationsHFS = await readJSONFile(ESTIMATIONHFS_FILE_PATH);

    let estimation = estimationsHFS[estimationId]; // ถ้ายังไม่มีข้อมูลการประเมิน ให้สร้างข้อมูลใหม่
    if (!estimation) {
      estimation = { estimationId, user, evaluations: {} };
      estimationsHFS[estimationId] = estimation;
    }

    estimation.evaluations[adminName] = { hfsLevel };

    const { admin1, admin2 } = estimation.evaluations;

    // ตรวจสอบว่าทั้ง admin1 และ admin2 ประเมินแล้วหรือยัง
    if (admin1?.hfsLevel !== undefined && admin2?.hfsLevel !== undefined) {
      if (admin1.hfsLevel === admin2.hfsLevel) {
        const updatedEstimation = await Estimation.findOneAndUpdate(
          { _id: estimationId },
          { hfsLevel: admin1.hfsLevel },
          { new: true }
        );

        let hfsNotifications = await readJSONFile(HFS_NOTIFICATION_FILE_PATH);
        hfsNotifications = hfsNotifications.filter(
          (n) => n.estimationId !== estimationId
        );
        await writeJSONFile(HFS_NOTIFICATION_FILE_PATH, hfsNotifications);

        res.json({
          message: `ประเมินอาการ ${user.name} เสร็จสิ้น`,
          updatedEstimation,
        });

        await Log.create({
          action: "ประเมินอาการ HFS",
          user: adminName,
          details: `ประเมินอาการ ${user.name} เสร็จสิ้น`,
        });

        delete estimationsHFS[estimationId];

        await writeJSONFile(ESTIMATIONHFS_FILE_PATH, estimationsHFS);
      } else {
        await Log.create({
          action: "ประเมินอาการ HFS",
          user: adminName,
          details: `ประเมินอาการ ${user.name} ผิดพลาด`,
        });

        delete estimation.evaluations.admin1.hfsLevel;
        delete estimation.evaluations.admin2.hfsLevel;
        res.json({ message: `ประเมินอาการ ${user.name} ผิดพลาด` });
      }
    } else {
      await Log.create({
        action: "ประเมินอาการ HFS",
        user: adminName,
        details: `ประเมินอาการโดย ${adminName}`,
      });

      res.json({
        message: `ประเมินสำเร็จ กำลังรอ ${
          admin1?.hfsLevel === undefined ? "admin1" : "admin2"
        } ประเมิน`,
      });
    }
    await writeJSONFile(ESTIMATIONHFS_FILE_PATH, estimationsHFS);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Chatnotification
app.get("/getchatnotification", async (req, res) => {
  try {
    const notifications = await readJSONFile(CHAT_NOTIFICATION_FILE_PATH);
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ error: "Error fetching notifications" });
  }
});

const updateChatNotification = async (from) => {
  try {
    const userExists = await User.findById(from);
    if (!userExists) {
      console.log("User not found, notification not created");
      return;
    }

    let notifications = await readJSONFile(CHAT_NOTIFICATION_FILE_PATH);
    const existingNotification = notifications.find((n) => n.from === from);

    if (!existingNotification) {
      notifications.push({ from, createdAt: new Date().toISOString() });
      await writeJSONFile(CHAT_NOTIFICATION_FILE_PATH, notifications);
      console.log("Notification added successfully");
    } else {
      console.log("Notification already exists for this user");
    }
  } catch (error) {
    console.error("Error updating notification:", error.message);
  }
};

app.post("/removechatnotification", async (req, res) => {
  const { from } = req.body;
  try {
    let notifications = await readJSONFile(CHAT_NOTIFICATION_FILE_PATH);
    notifications = notifications.filter((n) => n.from !== from);
    await writeJSONFile(CHAT_NOTIFICATION_FILE_PATH, notifications);
    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
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
    const { from, to, date, time, content } = req.body;

    const newMessage = await Message.create({
      content: content,
      contentType: "text",
      from,
      to,
      date,
      time,
    });

    await updateChatNotification(from);

    res.json(newMessage);
  } catch (err) {
    console.error("Error creating message:", err);
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

    await updateChatNotification(from);

    res.json(newMessage);
  } catch (error) {
    console.error("Error processing chat photo:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//log
app.get("/logs", async (req, res) => {
  try {
    const logs = await Log.find().sort({ timestamp: -1 });
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