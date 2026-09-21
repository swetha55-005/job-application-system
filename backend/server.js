const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");

const connectDB = require("./config/db");
const listen = require("./config/listen");
const indexRouter = require("./router");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);

dotenv.config({ quiet: true });

const app = express();


app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);


app.use(express.json());


const store = new MongoDBStore({
    uri: process.env.MONGO_URI,
    databaseName: "jobapplications",
    collection: "sessions",
    
});

store.on("error", (error) => {
  console.log("mongodb session store error",error);
});
app.use(
    session({
        secret:
            process.env.SESSION_SECRET ||
            "technova-session-secret",

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


app.use(indexRouter);


connectDB();


listen(app);