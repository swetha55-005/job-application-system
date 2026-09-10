const express = require("express");

const router = express.Router();

const Authrouter = require("./Authrouter");


router.use(Authrouter);

module.exports = router;