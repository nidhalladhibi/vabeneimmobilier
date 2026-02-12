import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import propertyRoutes from "./routes/propertyRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";
import multer from "multer";
import path from "path";
import userAttendsRoutes from "./routes/userAttendsRoutes.js";



dotenv.config();
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json()); // ✅ Parse JSON requests

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Save files in the "uploads" folder
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`); // Unique filename
  },
});
const upload = multer({ storage });

// Serve static files from the "uploads" directory
app.use("/uploads", express.static(path.join(path.resolve(), "uploads")));

// Routes
app.use("/api/properties", propertyRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/users", userAttendsRoutes);

// File upload endpoint
app.post("/upload_files", upload.array("files", 5), (req, res) => {
  try {
    const filePaths = req.files.map((file) => file.path); // Get file paths
    res
      .status(200)
      .json({ message: "Files uploaded successfully", files: filePaths });
  } catch (error) {
    console.error("Error uploading files:", error);
    res.status(500).json({ message: "Error uploading files" });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    // Handle multer-specific errors
    return res.status(400).json({ message: err.message });
  } else if (err) {
    // Handle other errors
    return res.status(500).json({ message: err.message });
  }
  next();
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur le port ${PORT}`);
});