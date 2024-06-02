const express = require("express");
const app = express();
const User = require("./models/User");
const Admin = require("./models/Admin");
const Message = require("./models/Message");
const Medication = require("./models/Medication");
const Estimation = require("./models/Estimation");
const cors = require("cors");
const fs = require('fs'); 
const path = require('path'); 
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
    const { name, password } = req.body;
    console.log(req.body);
    const user = await User.create({ name, password });
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
    await user.save();
    res.status(200).json(user);
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

      const filePath = path.join(__dirname, '..', 'frontend', 'src', 'json' , 'users.json');

      fs.writeFile(filePath, JSON.stringify(users), (err) => {
        if (err) {
          console.error('Error writing JSON file:', err);
          res.status(500).json({ error: 'Error writing JSON file' });
        } else {
          console.log('JSON file updated successfully');
          res.json(users); 
        }
      });
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

      const filePath = path.join(__dirname, '..', 'frontend', 'src', 'json' , 'medications.json');

      fs.writeFile(filePath, JSON.stringify(medications), (err) => {
        if (err) {
          console.error('Error writing JSON file:', err);
          res.status(500).json({ error: 'Error writing JSON file' });
        } else {
          console.log('JSON file updated successfully');
          res.json(medications); 
        }
      });
    })
    .catch((err) => res.json(err));
});

app.post("/createmedication", (req, res) => {
  Medication.create(req.body)
    .then((medication) => res.json(medication))
    .catch((err) => res.json(err));
});

app.post("/getestimation", (req, res) => {
  const { _id } = req.body;
  Estimation.find({ hfsLevel: 0 })
    .then((estimations) => {
      const filePath = path.join(__dirname, '..', 'frontend', 'src', 'json', 'estimations.json');


      fs.writeFile(filePath, JSON.stringify(estimations), (err) => {
        if (err) {
          console.error('Error writing JSON file:', err);
          return res.status(500).json({ error: 'Error writing JSON file' });
        } else {
          console.log('JSON file updated successfully');
          res.json(estimations);
        }
      });
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
      const filePath = path.join(__dirname, '..', 'frontend', 'src','json' , 'messages.json');

      fs.writeFile(filePath, JSON.stringify(messages), (err) => {
        if (err) {
          console.error('Error writing JSON file:', err);
          res.status(500).json({ error: 'Error writing JSON file' });
        } else {
          console.log('JSON file updated successfully');
          res.json(messages);
        }
      });
    })
    .catch((err) => res.json(err));
});

app.post("/createmessage", (req, res) => {
  Message.create(req.body)
    .then((message) => res.json(message))
    .catch((err) => res.json(err));
});

require("./connection");

const server = require("http").createServer(app);
const PORT = 5001;

server.listen(PORT, () => {
  console.log("listening to port", PORT);
});
