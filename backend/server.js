const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();
mongoose.set("bufferCommands", false);

const dbStateMap = {
    0: "disconnected",
    1: "connected",
    2: "connecting",
    3: "disconnecting",
};

app.use(
    cors({
        origin: true, // Allow all origins
        credentials: true,
    }),
);

app.use(express.json());

// Health check
app.get("/health", (_req, res) =>
    res.json({
        status: "ok",
        dbStatus: dbStateMap[mongoose.connection.readyState] || "unknown",
        dbState: mongoose.connection.readyState,
        timestamp: new Date().toISOString(),
    }),
);

// Silence browser favicon probing on backend root URL.
app.get("/favicon.ico", (_req, res) => {
    res.status(204).end();
});

// Root route
app.get("/", (req, res) => {
    res.send("Online Course Registration API is running!");
});

// Routes
const courseRoutes = require("./routes/courses");
const studentRoutes = require("./routes/students");

app.use("/api", (_req, res, next) => {
    connectToDatabase()
        .then((isConnected) => {
            if (!isConnected) {
                return res.status(503).json({
                    message: "Database not connected. Please check MONGO_URI on Vercel.",
                });
            }
            next();
        })
        .catch(() => {
            res.status(503).json({
                message: "Database not connected. Please check MONGO_URI on Vercel.",
            });
        });
});

app.use("/api/courses", courseRoutes);
app.use("/api/students", studentRoutes);

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;
let dbConnectPromise = null;

const connectToDatabase = async () => {
    if (mongoose.connection.readyState === 1) return true;
    if (!MONGO_URI) return false;

    try {
        if (!dbConnectPromise) {
            dbConnectPromise = mongoose.connect(MONGO_URI, {
                serverSelectionTimeoutMS: 5000,
            });
        }
        await dbConnectPromise;
        return true;
    } catch (err) {
        console.error("❌ MongoDB connection error:", err.message || err);
        dbConnectPromise = null;
        return false;
    }
};

if (!MONGO_URI) {
    console.warn("⚠️ MONGO_URI is not defined in the environment variables.");
    console.warn(
        "⚠️ Please set it in backend/.env before starting the database.",
    );
    // We'll let the server start but it won't connect to DB.
} else {
    connectToDatabase().then((isConnected) => {
        if (isConnected) {
            console.log("✅ Connected to MongoDB");
        }
    });
}

if (process.env.NODE_ENV !== "production") {
    app.listen(PORT, () => {
        console.log(`🚀 Server is running on port ${PORT}`);
    });
}

module.exports = app;
