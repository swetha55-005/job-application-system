const express = require("express");

const router = express.Router();

const sendotprouter = require("./sendotprouter");


router.use(sendotprouter);

module.exports = router;