const express = require("express");

const { createJob, getEmployeeJobs, getAllJobs, getPendingJobs, approveJob,rejectJob, deleteJob,} = require("../controller/Job");
const { Auth } = require("../Middleware/Auth");
const router = express.Router();
router.post( "/create-job",Auth,createJob);

router.get("/employee-job/:employeeId", Auth,getEmployeeJobs);


router.get("/all-jobs",Auth, getAllJobs);

router.get("/pending-jobs", Auth, getPendingJobs);

router.put("/approve/:jobId",Auth,approveJob);

router.put( "/reject/:jobId", Auth,rejectJob);

router.delete( "/delete/:jobId",Auth,deleteJob);

module.exports = router;