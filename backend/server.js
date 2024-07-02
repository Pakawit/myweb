const express = require("express");
const app = express();
const mongoose = require("mongoose");
const User = require("./models/User");
const Admin = require("./models/Admin");
const Message = require("./models/Message");
const Medication = require("./models/Medication");
const MedNoti = require("./models/MedNoti");
const Estimation = require("./models/Estimation");
const cors = require("cors");
const multer = require("multer");
const upload = multer();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());

///////////Admin
app.post("/admin", async (req, res) => {
  try {
    const { name, password } = req.body;
    console.log(req.body);
    const admin = await Admin.create({ name, password });
    res.status(201).json(admin);
  } catch (e) {
    let msg;
    if (e.code == 11000) {
      msg = "admin already exists";
    } else {
      msg = e.message;
    }
    console.log(e);
    res.status(400).json(msg);
  }
});

app.post("/admin/login", async (req, res) => {
  try {
    const { name, password } = req.body;
    const admin = await Admin.findByCredentials(name, password);
    await admin.save();
    res.status(200).json(admin);
  } catch (e) {
    res.status(400).json(e.message);
  }
});

app.delete("/admin/logout", async (req, res) => {
  try {
    const { _id } = req.body;
    const admin = await Admin.findById(_id);
    await admin.save();
    res.status(200).send();
  } catch (e) {
    console.log(e);
    res.status(400).send();
  }
});
///////////////////////////////////////////
////////////////////user
app.post("/user", async (req, res) => {
  try {
    const { name, phone, password } = req.body;
    console.log(req.body);
    const user = await User.create({ name, phone, password });
    res.status(201).json(user);
  } catch (e) {
    let msg;
    if (e.code == 11000) {
      msg = "User already exists";
    } else {
      msg = e.message;
    }
    console.log(e);
    res.status(400).json(msg);
  }
});

app.post("/user/login", async (req, res) => {
  try {
    const { name, password } = req.body;
    const user = await User.findByCredentials(name, password);
    if (!user) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    // Check if it's the first login
    const isFirstLogin = user.FirstLogin;

    // Update FirstLogin status to false after first login
    if (isFirstLogin) {
      user.FirstLogin = false;
      await user.save();
    }

    res.status(200).json({ isFirstLogin, user });
  } catch (e) {
    res.status(400).json(e.message);
  }
});

app.delete("/logout", async (req, res) => {
  try {
    const { _id } = req.body;
    const user = await User.findById(_id);
    await user.save();
    res.status(200).send();
  } catch (e) {
    console.log(e);
    res.status(400).send();
  }
});

///////////////////////////////////////////
app.get("/getusers", (req, res) => {
  User.find()
    .then((users) => {
      res.json(users); 
    })
    .catch((err) => res.json(err));
});

app.put("/update", async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.body._id,
      {
        name: req.body.name,
        phone: req.body.phone,
        other_numbers: req.body.other_numbers,
        age: req.body.age,
        diagnosis: req.body.diagnosis,
        hospital_number: req.body.hospital_number,
        ms_medicine: req.body.ms_medicine,
        other_medicine: req.body.other_medicine,
        laststatus: req.body.laststatus,
        taking_capecitabine: req.body.taking_capecitabine,
      },
      { new: true }
    );
    res.json(updatedUser);
  } catch (err) {
    res.json(err);
  }
});

app.post("/getmedication", (req, res) => {
  Medication.find()
    .then((medications) => {
      res.json(medications); 
    })
    .catch((err) => res.json(err));
});

// Route to create a new medication entry
app.post("/createmedication", async (req, res) => {
  const { from, status, time, date } = req.body;
  try {
    const medication = new Medication({ from, status, time, date });
    await medication.save();
    res.status(201).json(medication);
  } catch (err) {
    console.error("Error creating medication entry:", err);
    res.status(500).json({ error: "Error creating medication entry" });
  }
});

// Route to update medication status
app.put("/updatemedication", async (req, res) => {
  const { from, status, time, date } = req.body;
  try {
    let medication = await Medication.findOne({ from, time, date });
    if (!medication) {
      // If medication document doesn't exist, create a new one
      medication = new Medication({ from, status, time, date });
      await medication.save();
    } else {
      // Update existing medication document
      medication.status = status;
      await medication.save();
    }
    res.json(medication);
  } catch (err) {
    console.error("Error updating medication status:", err);
    res.status(500).json({ error: "Error updating medication status" });
  }
});


app.post("/getestimation", (req, res) => {
  const { _id } = req.body;
  Estimation.find({ hfsLevel: 0 })
    .then((estimations) => {
      res.json(estimations);
    })
    .catch((err) => {
      console.error('Error fetching estimations:', err);
      res.status(500).json({ error: 'Error fetching estimations' });
    });
});

app.put("/editestimation", async (req, res) => {
  try {
    const editestimation = await Estimation.findByIdAndUpdate(
      req.body._id,
      {
        hfsLevel: req.body.hfsLevel,
        check: req.body.check,
      },
      { new: true }
    );
    res.json(editestimation);
  } catch (err) {
    res.json(err);
  }
});

//upload photo
app.post("/chatphoto", upload.single("photo"), async (req, res) => {
  try {
    const { from, to, date, time } = req.body;
    const image = req.file.buffer.toString("base64");

    // เพิ่มเข้าไปในฐานข้อมูล
    const newMessage = await Message.create({
      content: image, // เปลี่ยน key เป็น content ตามฐานข้อมูล
      contentType: "image", // ระบุประเภทของข้อมูลเป็นรูปภาพ
      from: from,
      to: to,
      date: date,
      time: time,
    });
    res.json(newMessage);
  } catch (error) {
    console.error(error);
    res.json(error);
  }
});

//////////////////////////////////////

app.post("/createstimation", (req, res) => {
  Estimation.create(req.body)
    .then((estimation) => res.json(estimation))
    .catch((err) => res.json(err));
});

app.post("/getmessage", (req, res) => {
  const { from, to } = req.body;
  Message.find({
    $or: [
      { from: from, to: to },
      { from: to, to: from },
    ],
  })
    .then((messages) => {
      res.json(messages);
    })
    .catch((err) => res.status(500).json({ error: 'Error fetching messages' }));
});

app.post("/createmessage", (req, res) => {
  Message.create(req.body)
    .then((message) => res.json(message))
    .catch((err) => res.json(err));
});

// Endpoint to get alarm times
app.post("/mednoti", async (req, res) => {
  try {
    const { morningTime, eveningTime } = req.body;
    const newMedNoti = await MedNoti.create({ morningTime, eveningTime });
    res.status(201).json(newMedNoti);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Route to get MedNoti settings
app.get("/getmednoti", async (req, res) => {
  try {
    const medNoti = await MedNoti.findOne();
    res.json(medNoti);
  } catch (err) {
    console.error("Error fetching MedNoti settings:", err);
    res.status(500).json({ error: "Error fetching MedNoti settings" });
  }
});

// Route to update MedNoti settings
app.put("/updatemednoti", async (req, res) => {
  const { morningTime, eveningTime } = req.body;
  try {
    let medNoti = await MedNoti.findOne();
    if (!medNoti) {
      // If MedNoti document doesn't exist, create a new one
      medNoti = await MedNoti.create({ morningTime, eveningTime });
    } else {
      // Update existing MedNoti document
      medNoti.morningTime = morningTime;
      medNoti.eveningTime = eveningTime;
      await medNoti.save();
    }
    res.json(medNoti);
  } catch (err) {
    console.error("Error updating MedNoti settings:", err);
    res.status(500).json({ error: "Error updating MedNoti settings" });
  }
});


require("./connection");

const server = require("http").createServer(app);
const PORT = 5001;

server.listen(PORT, () => {
  console.log("listening to port", PORT);
});
