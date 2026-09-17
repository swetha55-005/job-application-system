const express = require("express");

const { createJob, getEmployeeJobs, getAllJobs, getPendingJobs, approveJob, rejectJob} = require("../controller/Job");

const router = express.Router();


router.post( "/create-job", createJob);

router.get( "/employee-job/:employeeId", getEmployeeJobs);

router.get( "/all-jobs", getAllJobs);

router.get("/pending-jobs", getPendingJobs);

router.put( "/approve/:jobId", approveJob);

router.put( "/reject/:jobId", rejectJob);


module.exports = router;