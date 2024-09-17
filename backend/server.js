const express = require("express");
const app = express();
const User = require("./models/User");
const Admin = require("./models/Admin");
const Message = require("./models/Message");
const Medication = require("./models/Medication");
const Estimation = require("./models/Estimation");
const Notification = require("./models/Notification");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const upload = multer();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());

// File paths

app.use(
  "/json",
  express.static(path.join(__dirname, "..", "frontend", "src", "json"))
);
const BASE_PATH = path.join(__dirname, "..", "frontend", "src", "json");
const USERS_FILE_PATH = path.join(BASE_PATH, "users.json");
const MEDICATIONS_FILE_PATH = path.join(BASE_PATH, "medications.json");
const ESTIMATIONS_FILE_PATH = path.join(BASE_PATH, "estimations.json");

// Notification helpers

app.get("/getnotifications", async (req, res) => {
  try {
    const notifications = await Notification.find();
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ error: "Error fetching notifications" });
  }
});

const updateNotification = async ( from ) => {
  try {
    const userExists = await User.findById( from );
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

//Admin

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
    res.status(200).json(admin);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

app.delete("/admin/logout", async (req, res) => {
  try {
    const { _id } = req.body;
    await Admin.findByIdAndDelete(_id);
    res.status(200).send();
  } catch (e) {
    res.status(400).send({ error: e.message });
  }
});

//User

app.post("/user", async (req, res) => {
  try {
    const { name, phone, password, age } = req.body; 
    const user = await User.create({ name, phone, password, age });

    const users = await User.find();
    await fs.promises.writeFile(
      USERS_FILE_PATH,
      JSON.stringify(users, null, 2)
    );

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
    await fs.promises.writeFile(
      USERS_FILE_PATH,
      JSON.stringify(users, null, 2)
    );
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: "Error writing JSON file" });
  }
});

app.post('/getuser', async (req, res) => {
  const { id } = req.body;

  try {
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching user' });
  }
});

app.put("/update", async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(req.body._id, req.body, {
      new: true,
    });

    const users = await User.find();
    await fs.promises.writeFile(
      USERS_FILE_PATH,
      JSON.stringify(users, null, 2)
    );
    res.json(updatedUser);
  } catch (err) {
    res.status(500).json({ error: "Error updating user" });
  }
});

// Medication

app.post("/getmedication", async (req, res) => {
  try {
    const medications = await Medication.find();
    await fs.promises.writeFile(
      MEDICATIONS_FILE_PATH,
      JSON.stringify(medications, null, 2)
    );
    res.json(medications);
  } catch (err) {
    res.status(500).json({ error: "Error writing JSON file" });
  }
});

app.post("/createmedication", async (req, res) => {
  try {
    const medication = await Medication.create(req.body);
    const medications = await Medication.find();
    await fs.promises.writeFile(
      MEDICATIONS_FILE_PATH,
      JSON.stringify(medications, null, 2)
    );
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
    await fs.promises.writeFile(
      MEDICATIONS_FILE_PATH,
      JSON.stringify(medications, null, 2)
    );

    res.json(medication);
  } catch (err) {
    res.status(500).json({ error: "Error updating medication status" });
  }
});

// Estimation

app.post("/getestimation", async (req, res) => {
  try {
    const estimations = await Estimation.find();
    await fs.promises.writeFile(
      ESTIMATIONS_FILE_PATH,
      JSON.stringify(estimations, null, 2)
    );
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

app.put("/editestimation", async (req, res) => {
  try {
    const editestimation = await Estimation.findByIdAndUpdate(
      req.body._id,
      req.body,
      { new: true }
    );

    const estimations = await Estimation.find();
    await fs.promises.writeFile(
      ESTIMATIONS_FILE_PATH,
      JSON.stringify(estimations, null, 2)
    );

    res.json(editestimation);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/createstimation", async (req, res) => {
  try {
    const estimation = await Estimation.create(req.body);

    const estimations = await Estimation.find();
    await fs.promises.writeFile(
      ESTIMATIONS_FILE_PATH,
      JSON.stringify(estimations, null, 2)
    );

    res.json(estimation);
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
    const { from, to, date, time, content } = req.body; // รับ selectuser จาก request

    const newMessage = await Message.create({
      content: content,
      contentType: "text",
      from,
      to,
      date,
      time,
    });

    await updateNotification( from );

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

    await updateNotification( from );

    res.json(newMessage);
  } catch (error) {
    console.error("Error processing chat photo:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

require("./connection");

const server = require("http").createServer(app);
const PORT = 4452;

server.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});