const express = require("express");

const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");


dotenv.config();

const app = express();


app.use(cors());
app.use(express.json());

app.get("/",(req,res) => {
    res.json("job application backend is running")
});


connectDB();


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`server is running ${PORT}`);
});
