const express = require("express");
const { Auth } = require("../Middleware/Auth");

const {
    getAllEmployees,
} = require("../controller/Employee");

const router = express.Router();

router.get("/employees", Auth,getAllEmployees);

module.exports = router;