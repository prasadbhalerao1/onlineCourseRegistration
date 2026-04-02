const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Configure CORS to only allow specific origins
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:5173').split(',');
const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(express.json()); // Order matters: CORS middleware should be before other middleware

// Routes
const courseRoutes = require('./routes/courses');
const studentRoutes = require('./routes/students');

app.use('/api/courses', courseRoutes);
app.use('/api/students', studentRoutes);

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.warn("⚠️ MONGO_URI is not defined in the environment variables.");
  console.warn("⚠️ Please set it in backend/.env before starting the database.");
  // We'll let the server start but it won't connect to DB.
} else {
  mongoose.connect(MONGO_URI)
    .then(() => console.log('✅ Connected to MongoDB'))
    .catch((err) => console.error('❌ MongoDB connection error:', err));
}

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
