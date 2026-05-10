const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const multer = require("multer");

const app = express();

const fs = require("fs");

if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}
require("dotenv").config();
// MIDDLEWARE
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));
app.use("/uploads", express.static("uploads"));
// FILE UPLOAD CONFIG
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  }
});

const upload = multer({ storage });

// MYSQL CONNECTION
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT)
});

// TEST DB CONNECTION
db.connect((err) => {
  if (err) {
    console.log("❌ Database connection failed:", err);
  } else {
    console.log("✅ Connected to Railway MySQL");
  }
});

// HOME ROUTE
app.get("/", (req, res) => {
  res.send("GDEH Backend Running");
});

// ADMISSION ROUTE
app.post("/api/admission", upload.single("photo"), (req, res) => {

  console.log("🔥 FORM SUBMITTED");
  console.log("BODY:", req.body);
  console.log("FILE:", req.file);

  const photo = req.file ? req.file.filename : null;

  const sql = `
    INSERT INTO students
    (first_name, last_name, gender, phone, email, course, intake, mode_of_study, address, county, sub_county, ward, emergency_contact_name, emergency_contact_phone, photo)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const values = [
    req.body.first_name,
    req.body.last_name,
    req.body.gender,
    req.body.phone,
    req.body.email,
    req.body.course,
    req.body.intake,
    req.body.mode_of_study,
    req.body.address,
    req.body.county,
    req.body.sub_county,
    req.body.ward,
    req.body.emergency_contact_name,
    req.body.emergency_contact_phone,
    photo
  ];

  db.query(sql, values, (err, result) => {

    if (err) {
      console.log("❌ DATABASE ERROR:", err);

      return res.status(500).json({
        success: false,
        message: "Database error",
        error: err.message
      });
    }

    console.log("✅ INSERT SUCCESS");

    res.json({
      success: true,
      message: "Application submitted successfully",
      student_id: result.insertId
    });
  });
});

// START SERVER
const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
//
// ===============================
// ADMIN SYSTEM (FULL MODULE)
// ===============================
//

const const ADMIN = {
  username: process.env.ADMIN_USER,
  password: process.env.ADMIN_PASSWORD
};

//
// 🔐 LOGIN ADMIN
//
app.post("/admin/login", (req, res) => {
  const { username, password } = req.body;

  if (username === ADMIN.username && password === ADMIN.password) {
    return res.json({
      success: true,
      message: "Login successful"
    });
  }

  return res.status(401).json({
    success: false,
    message: "Invalid credentials"
  });
});

//
// 📊 GET ALL STUDENTS (DASHBOARD)
//
app.get("/admin/students", (req, res) => {

  const sql = "SELECT * FROM students ORDER BY id DESC";

  db.query(sql, (err, results) => {
    if (err) {
      console.log("DB ERROR:", err);
      return res.status(500).json({
        success: false,
        error: err.message
      });
    }

    res.json(results);
  });
});

//
// 🗑️ DELETE STUDENT
//
app.delete("/admin/student/:id", (req, res) => {

  const sql = "DELETE FROM students WHERE id = ?";

  db.query(sql, [req.params.id], (err) => {
    if (err) {
      console.log("DELETE ERROR:", err);
      return res.status(500).json({
        success: false,
        error: err.message
      });
    }

    res.json({
      success: true,
      message: "Student deleted successfully"
    });
  });
});

//
// ✏️ UPDATE STUDENT
//
app.put("/admin/student/:id", (req, res) => {

  const sql = `
    UPDATE students SET
      first_name = ?,
      last_name = ?,
      phone = ?,
      email = ?,
      course = ?,
      county = ?
    WHERE id = ?
  `;

  const values = [
    req.body.first_name,
    req.body.last_name,
    req.body.phone,
    req.body.email,
    req.body.course,
    req.body.county,
    req.params.id
  ];

  db.query(sql, values, (err) => {

    if (err) {
      console.log("UPDATE ERROR:", err);
      return res.status(500).json({
        success: false,
        error: err.message
      });
    }

    res.json({
      success: true,
      message: "Student updated successfully"
    });
  });
});
