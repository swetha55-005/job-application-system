const express = require("express");

const router = express.Router();

const Authrouter = require("./Authrouter");

const Jobrouter = require("./Jobrouter");

const Notification =require("./Notification")




router.use(Authrouter);

router.use(Jobrouter);

router.use(Notification);

module.exports = router;