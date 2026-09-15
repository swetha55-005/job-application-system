const express = require("express");

const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");
const listen = require("./config/listen");
const indexRouter = require("./router");

dotenv.config({quiet: true});

const app = express();
app.use(cors());
app.use(express.json());
app.use(indexRouter)


connectDB();
listen(app);




