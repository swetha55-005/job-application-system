const express = require("express");

const {
    getAllEmployees,
} = require("../controller/Employee");

const router = express.Router();

router.get("/employees", getAllEmployees);

module.exports = router;