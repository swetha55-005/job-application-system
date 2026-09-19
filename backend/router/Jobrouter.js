const express = require("express");

const { createJob, getEmployeeJobs, getAllJobs, getPendingJobs, approveJob,rejectJob, deleteJob,} = require("../controller/Job");

const router = express.Router();
router.post( "/create-job",createJob);

router.get("/employee-job/:employeeId", getEmployeeJobs);


router.get("/all-jobs", getAllJobs);

router.get("/pending-jobs", getPendingJobs);

router.put("/approve/:jobId",approveJob);

router.put( "/reject/:jobId", rejectJob);

router.delete( "/delete/:jobId",deleteJob);

module.exports = router;