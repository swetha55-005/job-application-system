const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");

const connectDB = require("./config/db");
const listen = require("./config/listen");
const indexRouter = require("./router");
const session = require("express-session");
const { MongoStore } = require("connect-mongo");

dotenv.config({ quiet: true });

const app = express();


app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);


app.use(express.json());

app.use(
    session({
        secret:
            process.env.SESSION_SECRET ||
            "technova-session-secret",

        resave: false,

        saveUninitialized: false,

        store: MongoStore.create({
            mongoUrl: process.env.MONGO_URI,
            collectionName: "sessions",
        }),

        cookie: {
            httpOnly: true,
            secure: false,
            maxAge: 24 * 60 * 60 * 1000,
        },
    })
);


app.use(indexRouter);


connectDB();


listen(app);