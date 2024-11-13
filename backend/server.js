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

const swaggerSetup = require('./swagger');
swaggerSetup(app);

app.use(express.urlencoded({ extended: true, limit: "750kb" }));
app.use(express.json({ limit: "750kb" }));
app.use(cors());

// File paths
const BASE_PATH = path.join(__dirname, "..", "frontend", "src", "json");
const USERS_FILE_PATH = path.join(BASE_PATH, "users.json");
const MEDICATIONS_FILE_PATH = path.join(BASE_PATH, "medications.json");
const CHAT_NOTIFICATION_FILE_PATH = path.join(BASE_PATH,"chatnotification.json");
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

/**
 * @swagger
 * /admin:
 *   post:
 *     summary: Create a new admin
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: admin1
 *               password:
 *                 type: string
 *                 example: password123
 *     responses:
 *       201:
 *         description: Admin created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 name:
 *                   type: string
 *                   example: admin1
 *                 _id:
 *                   type: string
 *                   example: 1234567890abcdef
 *       400:
 *         description: Error creating admin
 */
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

/**
 * @swagger
 * /admin/login:
 *   post:
 *     summary: Login as an admin
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: admin1
 *               password:
 *                 type: string
 *                 example: password123
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 name:
 *                   type: string
 *                   example: admin1
 *                 password:
 *                   type: string
 *                   example: 123456
 *       400:
 *         description: Invalid credentials
 */
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

/**
 * @swagger
 * /admin/logout:
 *   post:
 *     summary: Logout as an admin
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: admin1
 *     responses:
 *       200:
 *         description: Logout successful
 *       400:
 *         description: Logout failed
 */
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

/**
 * @swagger
 * /getusers:
 *   get:
 *     summary: Get all users
 *     responses:
 *       200:
 *         description: A list of users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   name:
 *                     type: string
 *                     example: John Doe
 *                   phone:
 *                     type: string
 *                     example: "123456789"
 *                   age:
 *                     type: number
 *                     example: 25
 *       500:
 *         description: Error retrieving users
 */
app.get("/getusers", async (req, res) => {
  try {
    const users = await User.find();
    await writeJSONFile(USERS_FILE_PATH, users);
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: "Error writing JSON file" });
  }
});

/**
 * @swagger
 * /getuser:
 *   post:
 *     summary: Get a specific user by ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *                 example: 1234567890abcdef
 *     responses:
 *       200:
 *         description: User found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 name:
 *                   type: string
 *                   example: John Doe
 *                 phone:
 *                   type: string
 *                   example: "123456789"
 *                 age:
 *                   type: number
 *                   example: 25
 *       404:
 *         description: User not found
 *       500:
 *         description: Error fetching user
 */
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

/**
 * @swagger
 * /user:
 *   post:
 *     summary: Create a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: John Doe
 *               phone:
 *                 type: string
 *                 example: "123456789"
 *               password:
 *                 type: string
 *                 example: password123
 *               age:
 *                 type: number
 *                 example: 25
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 name:
 *                   type: string
 *                   example: John Doe
 *                 phone:
 *                   type: string
 *                   example: "123456789"
 *                 age:
 *                   type: number
 *                   example: 25
 *                 _id:
 *                   type: string
 *                   example: 1234567890abcdef
 *       400:
 *         description: Error creating user
 */
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

/**
 * @swagger
 * /user/login:
 *   post:
 *     summary: User login
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: John Doe
 *               password:
 *                 type: string
 *                 example: password123
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                       example: John Doe
 *                     phone:
 *                       type: string
 *                       example: "123456789"
 *                     age:
 *                       type: number
 *                       example: 25
 *                 isFirstLogin:
 *                   type: boolean
 *                   example: true
 *       401:
 *         description: Invalid credentials
 *       400:
 *         description: Error logging in
 */
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

/**
 * @swagger
 * /logout:
 *   delete:
 *     summary: Delete a user and logout
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               _id:
 *                 type: string
 *                 example: 1234567890abcdef
 *     responses:
 *       200:
 *         description: User deleted and logged out successfully
 *       400:
 *         description: Error deleting user or logging out
 */
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
/**
 * @swagger
 * /saveChangesToJson:
 *   post:
 *     summary: Save changes to personal.json
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               changes:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                     example: 1234567890abcdef
 *                   name:
 *                     type: string
 *                     example: John Doe
 *     responses:
 *       200:
 *         description: Changes saved successfully
 *       500:
 *         description: Error saving changes
 */
app.post("/saveChangesToJson", async (req, res) => {
  const { changes } = req.body;
  try {
    await Log.create({
      action: "แก้ไขข้อมูล",
      user: "Apatnipa",
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

/**
 * @swagger
 * /confirmChanges:
 *   post:
 *     summary: Confirm changes to a user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               _id:
 *                 type: string
 *                 example: 1234567890abcdef
 *               name:
 *                 type: string
 *                 example: John Doe
 *     responses:
 *       200:
 *         description: Changes confirmed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Changes confirmed successfully
 *                 pendingChange:
 *                   type: object
 *       404:
 *         description: No pending changes found
 *       500:
 *         description: Error confirming changes
 */
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
      user: "Chureeporn",
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

/**
 * @swagger
 * /rejectChanges:
 *   post:
 *     summary: Reject changes to a user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               _id:
 *                 type: string
 *                 example: 1234567890abcdef
 *               name:
 *                 type: string
 *                 example: John Doe
 *     responses:
 *       200:
 *         description: Changes rejected successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Changes rejected successfully
 *       404:
 *         description: No pending changes found
 *       500:
 *         description: Error rejecting changes
 */
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
      user: "Chureeporn",
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
/**
 * @swagger
 * /getmedication:
 *   post:
 *     summary: Get all medications
 *     responses:
 *       200:
 *         description: List of medications
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                     example: 1234567890abcdef
 *                   name:
 *                     type: string
 *                     example: Paracetamol
 *                   dosage:
 *                     type: string
 *                     example: 500mg
 *       500:
 *         description: Error retrieving medications
 */
app.post("/getmedication", async (req, res) => {
  try {
    const medications = await Medication.find();
    await writeJSONFile(MEDICATIONS_FILE_PATH, medications);
    res.json(medications);
  } catch (err) {
    res.status(500).json({ error: "Error writing JSON file" });
  }
});

/**
 * @swagger
 * /createmedication:
 *   post:
 *     summary: Create a new medication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Paracetamol
 *               dosage:
 *                 type: string
 *                 example: 500mg
 *     responses:
 *       201:
 *         description: Medication created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   example: 1234567890abcdef
 *                 name:
 *                   type: string
 *                   example: Paracetamol
 *                 dosage:
 *                   type: string
 *                   example: 500mg
 *       500:
 *         description: Error creating medication
 */
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

/**
 * @swagger
 * /updatemedication:
 *   put:
 *     summary: Update medication status
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               from:
 *                 type: string
 *                 example: 1234567890abcdef
 *               status:
 *                 type: string
 *                 example: Taken
 *               time:
 *                 type: string
 *                 example: 08:00 AM
 *               date:
 *                 type: string
 *                 example: 2024-11-01
 *     responses:
 *       200:
 *         description: Medication status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   example: 1234567890abcdef
 *                 status:
 *                   type: string
 *                   example: Taken
 *       500:
 *         description: Error updating medication status
 */
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
/**
 * @swagger
 * /getestimation:
 *   post:
 *     summary: Get estimations for a user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               from:
 *                 type: string
 *                 example: 1234567890abcdef
 *               page:
 *                 type: integer
 *                 example: 0
 *               limit:
 *                 type: integer
 *                 example: 10
 *     responses:
 *       200:
 *         description: List of estimations
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                 total:
 *                   type: integer
 *                   example: 20
 *                 page:
 *                   type: integer
 *                   example: 0
 *                 limit:
 *                   type: integer
 *                   example: 10
 *       500:
 *         description: Error fetching estimations
 */
app.post("/getestimation", async (req, res) => {
  const { from, page = 0, limit = 10 } = req.body;

  try {
    const estimations = await Estimation.find({ from })
      .sort({ date: -1, time: -1 })
      .skip(page * limit)
      .limit(limit);

    const totalEstimations = await Estimation.countDocuments({ from });

    res.json({
      data: estimations,
      total: totalEstimations,
      page: page,
      limit: limit,
    });
  } catch (error) {
    console.error("Error fetching estimations:", error);
    res.status(500).json({ error: "Error fetching estimations" });
  }
});

/**
 * @swagger
 * /getHFSDetails:
 *   post:
 *     summary: Get HFS details for a user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *                 example: 1234567890abcdef
 *     responses:
 *       200:
 *         description: List of HFS details
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   hfsLevel:
 *                     type: integer
 *                     example: 2
 *                   date:
 *                     type: string
 *                     example: 2024-11-01
 *       400:
 *         description: User ID is required
 *       500:
 *         description: Error fetching HFS details
 */
app.post("/getHFSDetails", async (req, res) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    const estimations = await Estimation.find(
      { from: userId, hfsLevel: { $ne: 0 } },
      { photos: 0 } 
    );
    
    res.json(estimations);
  } catch (err) {
    res.status(500).json({ error: "Error fetching estimations" });
  }
});

/**
 * @swagger
 * /createstimation:
 *   post:
 *     summary: Create a new estimation
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               from:
 *                 type: string
 *                 example: 1234567890abcdef
 *               data:
 *                 type: object
 *                 example: {}
 *     responses:
 *       201:
 *         description: Estimation created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   example: 1234567890abcdef
 *       500:
 *         description: Error creating estimation
 */
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

/**
 * @swagger
 * /evaluateHFS:
 *   put:
 *     summary: Evaluate HFS for a user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               estimationId:
 *                 type: string
 *                 example: 1234567890abcdef
 *               user:
 *                 type: object
 *                 example: {"name": "John Doe"}
 *               adminName:
 *                 type: string
 *                 example: Apatnipa
 *               hfsLevel:
 *                 type: integer
 *                 example: 2
 *     responses:
 *       200:
 *         description: HFS evaluation completed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: HFS evaluation completed successfully
 *       500:
 *         description: Error evaluating HFS
 */
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

    const { Apatnipa, Chureeporn } = estimation.evaluations;

    // ตรวจสอบว่าทั้ง Apatnipa และ Chureeporn ประเมินแล้วหรือยัง
    if (Apatnipa?.hfsLevel !== undefined && Chureeporn?.hfsLevel !== undefined) {
      if (Apatnipa.hfsLevel === Chureeporn.hfsLevel) {
        const updatedEstimation = await Estimation.findOneAndUpdate({ _id: estimationId },{ hfsLevel: Apatnipa.hfsLevel },{ new: true });//ส่งกลับหลัง update

        let hfsNotifications = await readJSONFile(HFS_NOTIFICATION_FILE_PATH);
        hfsNotifications = hfsNotifications.filter(
          (n) => n.estimationId !== estimationId
        );
        await writeJSONFile(HFS_NOTIFICATION_FILE_PATH, hfsNotifications);

        res.json({message: `ประเมินอาการ ${user.name} เสร็จสิ้น`,updatedEstimation});

        await Log.create({action: "ประเมินอาการ HFS",user: adminName,details: `ประเมินอาการ ${user.name} เสร็จสิ้น`});

        delete estimationsHFS[estimationId];

        await writeJSONFile(ESTIMATIONHFS_FILE_PATH, estimationsHFS);
      } else {
        await Log.create({action: "ประเมินอาการ HFS",user: adminName,details: `ประเมินอาการ ${user.name} ผิดพลาด`});

        delete estimation.evaluations.Apatnipa.hfsLevel;
        delete estimation.evaluations.Chureeporn.hfsLevel;
        res.json({ message: `ประเมินอาการ ${user.name} ผิดพลาด`});
      }
    } else {
      await Log.create({action: "ประเมินอาการ HFS",user: adminName,details: `ประเมินอาการโดย ${adminName}`});

      res.json({message: `ประเมินสำเร็จ กำลังรอ ${Apatnipa?.hfsLevel === undefined ? "Apatnipa" : "Chureeporn"} ประเมิน`});
    }
    await writeJSONFile(ESTIMATIONHFS_FILE_PATH, estimationsHFS);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Chatnotification
/**
 * @swagger
 * /getchatnotification:
 *   get:
 *     summary: Get chat notifications
 *     responses:
 *       200:
 *         description: List of chat notifications
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   from:
 *                     type: string
 *                     example: 1234567890abcdef
 *                   createdAt:
 *                     type: string
 *                     example: 2024-11-01T10:00:00Z
 *       500:
 *         description: Error fetching chat notifications
 */
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

/**
 * @swagger
 * /removechatnotification:
 *   post:
 *     summary: Remove a chat notification
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               from:
 *                 type: string
 *                 example: 1234567890abcdef
 *     responses:
 *       200:
 *         description: Chat notification removed successfully
 *       500:
 *         description: Error removing chat notification
 */
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
/**
 * @swagger
 * /getmessage:
 *   post:
 *     summary: Get chat messages between two users
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               from:
 *                 type: string
 *                 example: 1234567890abcdef
 *               to:
 *                 type: string
 *                 example: 0987654321fedcba
 *     responses:
 *       200:
 *         description: List of chat messages
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   from:
 *                     type: string
 *                     example: 1234567890abcdef
 *                   to:
 *                     type: string
 *                     example: 0987654321fedcba
 *                   content:
 *                     type: string
 *                     example: Hello!
 *                   date:
 *                     type: string
 *                     example: 2024-11-01
 *                   time:
 *                     type: string
 *                     example: 10:00 AM
 *       500:
 *         description: Error fetching chat messages
 */
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

/**
 * @swagger
 * /createmessage:
 *   post:
 *     summary: Create a new chat message
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               from:
 *                 type: string
 *                 example: 1234567890abcdef
 *               to:
 *                 type: string
 *                 example: 0987654321fedcba
 *               content:
 *                 type: string
 *                 example: Hello!
 *               date:
 *                 type: string
 *                 example: 2024-11-01
 *               time:
 *                 type: string
 *                 example: 10:00 AM
 *     responses:
 *       201:
 *         description: Chat message created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 from:
 *                   type: string
 *                   example: 1234567890abcdef
 *                 to:
 *                   type: string
 *                   example: 0987654321fedcba
 *                 content:
 *                   type: string
 *                   example: Hello!
 *                 date:
 *                   type: string
 *                   example: 2024-11-01
 *                 time:
 *                   type: string
 *                   example: 10:00 AM
 *       500:
 *         description: Error creating chat message
 */

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

    if (from !== "admin") {
      await updateChatNotification(from);
    }

    res.json(newMessage);
  } catch (err) {
    console.error("Error creating message:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

/**
 * @swagger
 * /chatphoto:
 *   post:
 *     summary: Upload a chat photo
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               from:
 *                 type: string
 *                 example: 1234567890abcdef
 *               to:
 *                 type: string
 *                 example: 0987654321fedcba
 *               date:
 *                 type: string
 *                 example: 2024-11-01
 *               time:
 *                 type: string
 *                 example: 10:00 AM
 *               photo:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Chat photo uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 from:
 *                   type: string
 *                   example: 1234567890abcdef
 *                 to:
 *                   type: string
 *                   example: 0987654321fedcba
 *                 date:
 *                   type: string
 *                   example: 2024-11-01
 *                 time:
 *                   type: string
 *                   example: 10:00 AM
 *                 content:
 *                   type: string
 *                   format: binary
 *       500:
 *         description: Error uploading chat photo
 */
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

    if (from !== "admin") {
      await updateChatNotification(from);
    }

    res.json(newMessage);
  } catch (error) {
    console.error("Error processing chat photo:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//log
/**
 * @swagger
 * /logs:
 *   get:
 *     summary: Get all logs
 *     responses:
 *       200:
 *         description: List of logs
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   action:
 *                     type: string
 *                     example: admin login
 *                   user:
 *                     type: string
 *                     example: admin1
 *                   details:
 *                     type: string
 *                     example: Admin logged in
 *                   timestamp:
 *                     type: string
 *                     example: 2024-11-01T10:00:00Z
 *       500:
 *         description: Error fetching logs
 */
app.get("/logs", async (req, res) => {
  try {
    const logs = await Log.find().sort({ timestamp: -1 });
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /video:
 *   get:
 *     summary: Stream a video
 *     responses:
 *       206:
 *         description: Video stream
 *         content:
 *           video/mp4:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: Video not found
 *       416:
 *         description: Range header required
 */
app.get("/video", (req, res) => {
  const videoPath = path.join(__dirname, "video", "VDO_nurse_final.mp4");

  fs.stat(videoPath, (err, stats) => {
    if (err) {
      console.error("Error retrieving video:", err);
      return res.status(404).send("Video not found");
    }

    const range = req.headers.range;
    if (!range) {
      return res.status(416).send("Requires Range header");
    }

    const videoSize = stats.size;
    const CHUNK_SIZE = 10 ** 6; 
    const start = Number(range.replace(/\D/g, ""));
    const end = Math.min(start + CHUNK_SIZE, videoSize - 1);

    const contentLength = end - start + 1;
    const headers = {
      "Content-Range": `bytes ${start}-${end}/${videoSize}`,
      "Accept-Ranges": "bytes",
      "Content-Length": contentLength,
      "Content-Type": "video/mp4",
    };

    res.writeHead(206, headers);

    const videoStream = fs.createReadStream(videoPath, { start, end });
    videoStream.pipe(res);
  });
});

require("./connection");

const server = require("http").createServer(app);
const PORT = 4452;

server.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});