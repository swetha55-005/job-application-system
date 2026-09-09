const express = require("express");

const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");
const listen = require("./config/listen");
const indexRouter = require("./router");



dotenv.config();

const app = express();


app.use(cors());
app.use(express.json());
app.use(indexRouter)


app.get("/",(req,res) => {
    res.json("job application backend is running")
});

const PORT = process.env.PORT || 5000;
connectDB();

listen(app,PORT);




