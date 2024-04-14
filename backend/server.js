const express = require("express");
const app = express();
const User = require("./models/User");
const Message = require("./models/Message");
const Medication = require("./models/Medication");
const Estimation = require("./models/Estimation");
const cors = require("cors");

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());


app.post('/user', async(req, res)=> {
  try {
    const {name, password} = req.body;
    console.log(req.body);
    const user = await User.create({name, password});
    res.status(201).json(user);
  } catch (e) {
    let msg;
    if(e.code == 11000){
      msg = "User already exists"
    } else {
      msg = e.message;
    }
    console.log(e);
    res.status(400).json(msg)
  }
})

app.post('/user/login', async(req, res)=> {
  try {
    const {name, password} = req.body;
    const user = await User.findByCredentials(name, password);
    await user.save();
    res.status(200).json(user);
  } catch (e) {
      res.status(400).json(e.message)
  }
})

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

app.get("/getusers", (req, res) => {
  User.find()
    .then((users) => res.json(users))
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
  const { _id } = req.body; 
  Medication.find({ from: _id }) 
    .then((medications) => res.json(medications)) 
    .catch((err) => res.json(err));
});


app.post("/createmedication", (req, res) => {
  Medication.create(req.body)
    .then((medication) => res.json(medication))
    .catch((err) => res.json(err));
});

app.post("/getestimation", (req, res) => {
  const { _id } = req.body; 
  Estimation.find({ to: _id , check: false }) 
    .then((estimation) => res.json(estimation)) 
    .catch((err) => res.json(err));
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

/// upload photo
const multer = require('multer');
const fs = require('fs');
const upload = multer();

// เพิ่มเส้นทาง API สำหรับอัปโหลดรูปภาพเพิ่มเข้าไปใน array
app.post('/uploadphoto', upload.single('photo'), async (req, res) => {
  try {
      const { _id } = req.body;
      const estimation = await Estimation.findById(_id);

      const base64Image = req.file.buffer.toString('base64');

      estimation.photos.push(base64Image);
      await estimation.save();

      res.status(200).json({ message: 'Photo uploaded successfully' });
  } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
  }
});
//////////////////////////////////////

app.post("/createstimation", (req, res) => {
  Estimation.create(req.body)
    .then((estimation) => res.json(estimation))
    .catch((err) => res.json(err));
});

app.post("/getmessage", (req, res) => {
  const { from , to } = req.body; 
  Message.find({ from: from , to: to }) 
    .then((message) => res.json(message)) 
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
