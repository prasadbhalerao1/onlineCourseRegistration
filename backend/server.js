const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(
    cors({
        origin: true, // Allow all origins
        credentials: true,
    }),
);

app.use(express.json());

// Health check
app.get("/health", (_req, res) =>
    res.json({ status: "ok", timestamp: new Date().toISOString() }),
);

// Routes
const courseRoutes = require("./routes/courses");
const studentRoutes = require("./routes/students");

app.use("/api/courses", courseRoutes);
app.use("/api/students", studentRoutes);

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
    console.warn("⚠️ MONGO_URI is not defined in the environment variables.");
    console.warn(
        "⚠️ Please set it in backend/.env before starting the database.",
    );
    // We'll let the server start but it won't connect to DB.
} else {
    mongoose
        .connect(MONGO_URI)
        .then(() => console.log("✅ Connected to MongoDB"))
        .catch((err) => console.error("❌ MongoDB connection error:", err));
}

if (process.env.NODE_ENV !== "production") {
    app.listen(PORT, () => {
        console.log(`🚀 Server is running on port ${PORT}`);
    });
}

module.exports = app;
