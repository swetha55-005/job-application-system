const express = require("express");
const { Auth } = require("../Middleware/Auth");

const {getNotifications, markNotificationAsRead} = require("../controller/Notification");

const router = express.Router();



router.get("/:userId",Auth, getNotifications);


router.put("/read/:notificationId", Auth, markNotificationAsRead);


module.exports = router;