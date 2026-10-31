
const dotenv = require("dotenv");
dotenv.config({ quiet: true });
const express = require("express");
const cors = require("cors");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const path = require("path");
const connectDB = require("./config/db");
const listen = require("./config/listen");
const MulterRouter = require("./router/Multerrouter");
const imageRouter = require("./router/imageRouter");
const uploadRoutes = require("./router/UploadRoutes");
const presignedUrlRouter = require("./router/PresignedUrl");
const paymentRoutes = require("./router/PaymentRoutes");
const authRoutes = require("./router/Authrouter")
console.log("SESSION_SECRET loaded:", !!process.env.SESSION_SECRET);
console.log("Cloudinary config check:", {
  cloudNameLoaded: !!process.env.CLOUDINARY_CLOUD_NAME,
  apiKeyLoaded: !!process.env.CLOUDINARY_API_KEY,
  apiSecretLoaded: !!process.env.CLOUDINARY_API_SECRET,
});
const app = express();

app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://technova-solution-frontend.onrender.com",
    ],
    credentials: true,
  })
);

app.use(express.json());
const store = new MongoDBStore({
  uri: process.env.MONGO_URI,
  databaseName: "jobapplications",
  collection: "sessions",});
store.on("error", (error) => {
  console.log("MongoDB session store error:", error);
});
app.use(
  session({
    secret:
      process.env.SESSION_SECRET || "my-local-session-secret-123",
    resave: false,
    saveUninitialized: false,
    store: store,
    cookie: {
      httpOnly: true,
      secure: false,
      maxAge: 24 * 60 * 60 * 1000,
    },
  })
);
app.use("/multer", MulterRouter);
app.use(imageRouter);
app.use("/api/upload", uploadRoutes);
app.use("/api",presignedUrlRouter);
app.use("/api/payments",paymentRoutes);
app.use("/api/auth",authRoutes);
app.use("/upload",express.static(path.join(__dirname,"upload")));connectDB();
listen(app);