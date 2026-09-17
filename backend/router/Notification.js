const express = require("express");

const {getNotifications, markNotificationAsRead} = require("../controller/Notification");

const router = express.Router();



router.get("/:userId", getNotifications);


router.put("/read/:notificationId",markNotificationAsRead);


module.exports = router;