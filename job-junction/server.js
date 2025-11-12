// ✅ server.js — Job Junction (Full Final Version)
import express from "express";
import mysql from "mysql2/promise";
import cors from "cors";
import multer from "multer";
import nodemailer from "nodemailer";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));

// ✅ MySQL Connection
const dbConfig = {
  host: "localhost",
  user: "root",
  password: "2002",
  database: "job_junction",
};
let connection;
(async () => {
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log("✅ Connected to MySQL (job_junction)");
  } catch (err) {
    console.error("❌ Database connection failed:", err.message);
    process.exit(1);
  }
})();

// ✅ File Upload (Profile Images)
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, "public/uploads")),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

// ✅ Nodemailer Setup
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "youremail@gmail.com", // 🔧 your Gmail
    pass: "your-app-password",   // 🔧 your App Password
  },
});

// ======================================
// ROUTES
// ======================================

// 🧑 Register User
app.post("/register", upload.single("profile_image"), async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : null;
    const [exists] = await connection.execute("SELECT * FROM users WHERE email = ?", [email]);
    if (exists.length > 0) return res.status(400).json({ message: "Email already registered" });

    await connection.execute(
      "INSERT INTO users (name, email, password, profile_image) VALUES (?, ?, ?, ?)",
      [name, email, password, image]
    );
    res.status(201).json({ message: "User registered successfully!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🔐 Login
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const [user] = await connection.execute(
    "SELECT * FROM users WHERE email = ? AND password = ?",
    [email, password]
  );
  if (user.length > 0) return res.json({ message: "Login successful", user: user[0] });
  res.status(401).json({ message: "Invalid credentials" });
});

// 💼 Get All Jobs
app.get("/jobs", async (req, res) => {
  const [jobs] = await connection.execute("SELECT * FROM jobs ORDER BY posted_date DESC");
  res.json(jobs);
});

// 🏢 Add Job (with website)
app.post("/add-job", async (req, res) => {
  try {
    const { title, company, website, location, description } = req.body;
    if (!title || !company || !location || !description)
      return res.status(400).json({ message: "Please fill all required fields." });

    await connection.execute(
      "INSERT INTO jobs (title, company, website, location, description) VALUES (?, ?, ?, ?, ?)",
      [title, company, website || null, location, description]
    );
    res.status(201).json({ message: "✅ Job added successfully!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🧾 Apply for Job
app.post("/apply", async (req, res) => {
  try {
    const { user_id, job_id, phone, email } = req.body;
    const [exists] = await connection.execute(
      "SELECT * FROM applications WHERE user_id = ? AND job_id = ?",
      [user_id, job_id]
    );
    if (exists.length > 0)
      return res.status(400).json({ message: "You already applied for this job." });

    await connection.execute(
      "INSERT INTO applications (user_id, job_id, phone, email) VALUES (?, ?, ?, ?)",
      [user_id, job_id, phone, email]
    );

    const [[job]] = await connection.execute("SELECT * FROM jobs WHERE id = ?", [job_id]);
    const mail = {
      from: "youremail@gmail.com",
      to: email,
      subject: `Application Received - ${job.title}`,
      text: `Hi! Your application for ${job.title} at ${job.company} has been received.\n\nThank you for using Job Junction!`,
    };
    transporter.sendMail(mail, err => {
      if (err) console.error("Email error:", err.message);
    });

    res.status(201).json({ message: "Application submitted successfully!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🔄 Withdraw Application
app.delete("/withdraw/:appId", async (req, res) => {
  await connection.execute("DELETE FROM applications WHERE id = ?", [req.params.appId]);
  res.json({ message: "Application withdrawn successfully" });
});

// 👤 Profile + Applications
app.get("/profile/:id", async (req, res) => {
  const [user] = await connection.execute("SELECT * FROM users WHERE id = ?", [req.params.id]);
  const [apps] = await connection.execute(
    `SELECT a.id AS appId, j.title, j.company, j.location, a.applied_date
     FROM applications a JOIN jobs j ON a.job_id = j.id
     WHERE a.user_id = ? ORDER BY a.applied_date DESC`,
    [req.params.id]
  );
  res.json({ profile: user[0], applications: apps });
});

// 🧑 Update Profile
app.post("/update-profile", upload.single("profile_image"), async (req, res) => {
  const { id, name, password } = req.body;
  const image = req.file ? `/uploads/${req.file.filename}` : null;
  let query = "UPDATE users SET name = ?";
  const values = [name];
  if (password) { query += ", password = ?"; values.push(password); }
  if (image) { query += ", profile_image = ?"; values.push(image); }
  query += " WHERE id = ?";
  values.push(id);
  await connection.execute(query, values);
  const [updated] = await connection.execute("SELECT * FROM users WHERE id = ?", [id]);
  res.json({ updatedUser: updated[0] });
});

// 🏠 Default route
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

const PORT = 5000;
app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));
// 🏢 Add Job (with website link)
app.post("/add-job", async (req, res) => {
  try {
    const { title, company, website, location, description } = req.body;

    if (!title || !company || !location || !description) {
      return res.status(400).json({ message: "All required fields must be filled." });
    }

    const query = `
      INSERT INTO jobs (title, company, website, location, description)
      VALUES (?, ?, ?, ?, ?)
    `;
    await connection.execute(query, [title, company, website || null, location, description]);

    console.log("✅ New job added:", title);
    res.status(201).json({ message: "✅ Job added successfully!" });
  } catch (err) {
    console.error("❌ Add Job Error:", err.message);
    res.status(500).json({ error: err.message });
  }
});
