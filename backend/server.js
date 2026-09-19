const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");

const connectDB = require("./config/db");
const listen = require("./config/listen");
const indexRouter = require("./router");

dotenv.config({ quiet: true });

const app = express();

// ===============================
// CORS
// ===============================
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

// ===============================
// JSON
// ===============================
app.use(express.json());

// ===============================
// ROUTES
// ===============================
app.use(indexRouter);

// ===============================
// DATABASE
// ===============================
connectDB();

// ===============================
// SERVER
// ===============================
listen(app);