const express = require("express");

const router = express.Router();

const Authrouter = require("./Authrouter");
const Jobrouter = require("./Jobrouter");
const Notification = require("./Notification");
const EmployeeRouter = require("./Employee");
router.use("/", Authrouter);
router.use("/api/jobs", Jobrouter);

router.use("/api/notifications", Notification);
router.use("/", EmployeeRouter);
module.exports = router;