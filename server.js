require("dotenv").config();

const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const multer = require("multer");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
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

// MYSQL CONNECTION (USING VARIABLES)
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT
});

// TEST CONNECTION
db.connect((err) => {
  if (err) {
    console.log("❌ Database connection failed:", err);
  } else {
    console.log("✅ Connected to Railway MySQL");
  }
});

// TEST ROUTE
app.get("/", (req, res) => {
  res.send("GDEH Backend Running");
});

// ADMISSION API
app.post("/api/admission", upload.single("photo"), (req, res) => {
  const data = req.body;
  const photo = req.file ? req.file.filename : null;

  const sql = `
    INSERT INTO students 
    (first_name, last_name, gender, phone, email, course, intake, mode_of_study, address, county, sub_county, ward, emergency_contact_name, emergency_contact_phone, photo)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const values = [
    data.first_name,
    data.last_name,
    data.gender,
    data.phone,
    data.email,
    data.course,
    data.intake,
    data.mode_of_study,
    data.address,
    data.county,
    data.sub_county,
    data.ward,
    data.emergency_contact_name,
    data.emergency_contact_phone,
    photo
  ];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).json({
        success: false,
        message: "Database error"
      });
    }

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
