const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const dotenv = require("dotenv");
const multer = require("multer");
const path = require("path");

dotenv.config();

const app = express();

/*
CORS
*/

app.use(cors({
    origin: "*"
}));

/*
JSON
*/

app.use(express.json());

/*
UPLOADS ACCESS
*/

app.use(
    "/uploads",
    express.static("uploads")
);

/*
MYSQL CONNECTION
*/

const db = mysql.createPool({

    host: process.env.DB_HOST,

    user: process.env.DB_USER,

    password: process.env.DB_PASSWORD,

    database: process.env.DB_NAME

});

/*
MULTER STORAGE
*/

const storage = multer.diskStorage({

    destination: (req, file, cb) => {

        cb(null, "uploads/");

    },

    filename: (req, file, cb) => {

        const uniqueName =
            Date.now() +
            path.extname(file.originalname);

        cb(null, uniqueName);

    }

});

const upload = multer({ storage });

/*
HOME ROUTE
*/

app.get("/", (req, res) => {

    res.send("GDEH Admission API Running");

});

/*
ADMISSION FORM API
*/

app.post(
    "/api/admission",
    upload.single("photo"),
    (req, res) => {

    try {

        const {

            first_name,
            last_name,
            gender,
            phone,
            email,
            course,
            intake,
            mode_of_study,
            address,
            county,
            sub_county,
            ward,
            emergency_contact_name,
            emergency_contact_phone

        } = req.body;

        const photo =
            req.file
            ? req.file.filename
            : null;

        const sql = `
            INSERT INTO students
            (
                first_name,
                last_name,
                gender,
                phone,
                email,
                course,
                intake,
                mode_of_study,
                address,
                county,
                sub_county,
                ward,
                emergency_contact_name,
                emergency_contact_phone,
                photo
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        db.query(sql, [

            first_name,
            last_name,
            gender,
            phone,
            email,
            course,
            intake,
            mode_of_study,
            address,
            county,
            sub_county,
            ward,
            emergency_contact_name,
            emergency_contact_phone,
            photo

        ], (err, result) => {

            if (err) {

                console.log(err);

                return res.status(500).json({

                    success: false,
                    message: "Database error"

                });

            }

            res.json({

                success: true,
                message:
                "Admission submitted successfully"

            });

        });

    } catch (error) {

        console.log(error);

        res.status(500).json({

            success: false,
            message: "Server error"

        });

    }

});

/*
START SERVER
*/

app.listen(process.env.PORT, () => {

    console.log(
        `Server running on port ${process.env.PORT}`
    );

});
