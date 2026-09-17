const JobModel = require("../models/Job");
const UserModel = require("../models/User");
const NotificationModel = require("../models/Notification");
const EmailNotification = require("../until/EmailNotification");

// =====================================================
// FIND USER BY ID
// =====================================================

const findUser = async (userId) => {
    try {
        const cleanId = String(userId || "").trim();

        if (!cleanId) {
            return null;
        }

        const user = await UserModel.findOne({
            Id: cleanId,
        });

        return user;

    } catch (error) {
        console.error("Find User Error:", error);
        return null;
    }
};


// =====================================================
// CREATE JOB
// =====================================================

const createJob = async (req, res) => {

    try {

        const {
            projectId,
            jobTitle,
            jobType,
            jobDescription,
            createdBy,
            startDate,
            dueDate,
            tasks,
            assignedEmployees,
        } = req.body;


        // =================================================
        // REQUIRED FIELD CHECK
        // =================================================

        if (
            !projectId ||
            !jobTitle ||
            !jobType ||
            !jobDescription ||
            !createdBy ||
            !startDate ||
            !dueDate ||
            !Array.isArray(tasks) ||
            tasks.length === 0
        ) {

            return res.status(400).json({
                success: false,
                message: "Please fill all required fields",
            });

        }


        // =================================================
        // FIND USER
        // =================================================

        const user = await findUser(createdBy);

        console.log("================================");
        console.log("Created By:", createdBy);
        console.log("Found User:", user);


        if (!user) {

            return res.status(404).json({
                success: false,
                message: `User not found for ID: ${createdBy}`,
            });

        }


        // =================================================
        // GET ROLE
        // =================================================

        const createdByRole =
            String(user.role || "").toLowerCase();

        console.log("User Role:", createdByRole);


        if (
            createdByRole !== "employee" &&
            createdByRole !== "admin"
        ) {

            return res.status(403).json({
                success: false,
                message: "Invalid user role",
            });

        }


        // =================================================
        // TASK VALIDATION
        // =================================================

        for (const task of tasks) {

            if (
                !task.taskName ||
                task.hours === undefined ||
                task.hours === null ||
                Number(task.hours) <= 0
            ) {

                return res.status(400).json({
                    success: false,
                    message:
                        "Each task must have taskName and valid hours",
                });

            }

        }


        // =================================================
        // CALCULATE TOTAL HOURS
        // =================================================

        const totalHours = tasks.reduce(
            (total, task) => {
                return total + Number(task.hours);
            },
            0
        );


        // =====================================================
        // EMPLOYEE CREATE JOB
        // =====================================================

        if (createdByRole === "employee") {


            // =================================================
            // EMPLOYEE CANNOT ASSIGN JOB
            // =================================================

            if (
                Array.isArray(assignedEmployees) &&
                assignedEmployees.length > 0
            ) {

                return res.status(403).json({
                    success: false,
                    message:
                        "Employee cannot assign jobs to other employees",
                });

            }


            // =================================================
            // FIND ADMIN
            // =================================================

            const admins = await UserModel.find({
                role: "admin",
            });

            console.log("Admins Found:", admins);


            if (!admins || admins.length === 0) {

                return res.status(404).json({
                    success: false,
                    message: "No admin found",
                });

            }


            // =================================================
            // CREATE EMPLOYEE JOB
            // =================================================

            const newJob = await JobModel.create({

                projectId: projectId.trim(),

                jobTitle: jobTitle.trim(),

                jobType: jobType,

                jobDescription:
                    jobDescription.trim(),

                createdBy: user.Id,

                createdByRole: "employee",

                startDate: startDate,

                dueDate: dueDate,

                tasks: tasks,

                totalHours: totalHours,

                assignedEmployees: [],

                approvalStatus: "pending",

                rejectionReason: "",

            });


            console.log(
                "Employee Job Created:",
                newJob._id
            );


            // =================================================
            // SEND NOTIFICATION TO ALL ADMINS
            // =================================================

            for (const admin of admins) {

                if (!admin.Id) {
                    continue;
                }

                await NotificationModel.create({

                    recipient: admin.Id,

                    sender: user.Id,

                    jobId: newJob._id,

                    message:
                        `${user.Id} created a new job "${newJob.jobTitle}" and requested admin approval`,

                    type: "job-approval",

                    isRead: false,

                });

            }


            console.log(
                "Admin notification created successfully"
            );


            // =================================================
            // RESPONSE
            // =================================================

            return res.status(201).json({

                success: true,

                message:
                    "Job created and sent to admin for approval",

                job: newJob,

            });

        }


        // =====================================================
        // ADMIN CREATE JOB
        // =====================================================

        if (createdByRole === "admin") {

            let finalAssignedEmployees = [];


            // =================================================
            // GET ASSIGNED EMPLOYEES
            // =================================================

            if (Array.isArray(assignedEmployees)) {

                finalAssignedEmployees = [
                    ...new Set(
                        assignedEmployees
                            .map((id) =>
                                String(id).trim()
                            )
                            .filter(Boolean)
                    ),
                ];

            }


            // =================================================
            // VALIDATE EMPLOYEE IDS
            // =================================================

            if (
                finalAssignedEmployees.length > 0
            ) {

                const invalidEmployee =
                    finalAssignedEmployees.some(
                        (employeeId) =>
                            !employeeId
                                .toUpperCase()
                                .startsWith("EMP")
                    );


                if (invalidEmployee) {

                    return res.status(400).json({

                        success: false,

                        message:
                            "Only employee IDs can be assigned",

                    });

                }


                // =================================================
                // CHECK EMPLOYEE EXISTS
                // =================================================

                const employees =
                    await UserModel.find({

                        Id: {
                            $in:
                                finalAssignedEmployees,
                        },

                        role: "employee",

                    });


                if (
                    employees.length !==
                    finalAssignedEmployees.length
                ) {

                    return res.status(400).json({

                        success: false,

                        message:
                            "One or more employee IDs are invalid",

                    });

                }

            }


            // =================================================
            // CREATE ADMIN JOB
            // =================================================

            const newJob =
                await JobModel.create({

                    projectId:
                        projectId.trim(),

                    jobTitle:
                        jobTitle.trim(),

                    jobType:
                        jobType,

                    jobDescription:
                        jobDescription.trim(),

                    createdBy:
                        user.Id,

                    createdByRole:
                        "admin",

                    startDate:
                        startDate,

                    dueDate:
                        dueDate,

                    tasks:
                        tasks,

                    totalHours:
                        totalHours,

                    assignedEmployees:
                        finalAssignedEmployees,

                    approvalStatus:
                        "accepted",

                    rejectionReason:
                        "",

                });


            console.log(
                "Admin Job Created:",
                newJob._id
            );


            // =================================================
            // NOTIFICATION TO ASSIGNED EMPLOYEES
            // =================================================

            for (
                const employeeId
                of finalAssignedEmployees
            ) {

                await NotificationModel.create({

                    recipient:
                        employeeId,

                    sender:
                        user.Id,

                    jobId:
                        newJob._id,

                    message:
                        `A new job "${newJob.jobTitle}" has been assigned to you by Admin`,

                    type:
                        "job-assigned",

                    isRead:
                        false,

                });

            }


            // =================================================
            // RESPONSE
            // =================================================

            return res.status(201).json({

                success: true,

                message:
                    "Job created and assigned successfully",

                job:
                    newJob,

            });

        }


    } catch (error) {

        console.error(
            "Create Job Error:",
            error
        );


        // =================================================
        // DUPLICATE PROJECT ID
        // =================================================

        if (error.code === 11000) {

            return res.status(400).json({

                success: false,

                message:
                    "Project ID already exists",

            });

        }


        return res.status(500).json({

            success: false,

            message:
                "Server error",

            error:
                error.message,

        });

    }

};


// =====================================================
// GET EMPLOYEE JOBS
// =====================================================

const getEmployeeJobs = async (req, res) => {

    try {

        const { employeeId } = req.params;


        // =================================================
        // FIND EMPLOYEE
        // =================================================

        const employee =
            await findUser(employeeId);


        if (!employee) {

            return res.status(404).json({

                success: false,

                message:
                    `Employee not found for ID: ${employeeId}`,

            });

        }


        // =================================================
        // FIND JOBS
        // =================================================

        const jobs =
            await JobModel.find({

                $or: [

                    {
                        assignedEmployees:
                            employee.Id,

                        approvalStatus:
                            "accepted",
                    },

                    {
                        createdBy:
                            employee.Id,

                        approvalStatus: {
                            $in: [
                                "pending",
                                "accepted",
                                "rejected",
                            ],
                        },
                    },

                ],

            }).sort({
                createdAt: -1,
            });


        return res.status(200).json({

            success: true,

            jobs,

        });


    } catch (error) {

        console.error(
            "Get Employee Jobs Error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Server error",

            error:
                error.message,

        });

    }

};


// =====================================================
// GET ALL JOBS
// =====================================================

const getAllJobs = async (req, res) => {

    try {

        const jobs =
            await JobModel.find()
                .sort({
                    createdAt: -1,
                });


        return res.status(200).json({

            success: true,

            jobs,

        });


    } catch (error) {

        console.error(
            "Get All Jobs Error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Server error",

            error:
                error.message,

        });

    }

};


// =====================================================
// GET PENDING JOBS
// =====================================================

const getPendingJobs = async (req, res) => {

    try {

        const jobs =
            await JobModel.find({

                createdByRole:
                    "employee",

                approvalStatus:
                    "pending",

            }).sort({
                createdAt: -1,
            });


        return res.status(200).json({

            success: true,

            jobs,

        });


    } catch (error) {

        console.error(
            "Get Pending Jobs Error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Server error",

            error:
                error.message,

        });

    }

};


// =====================================================
// APPROVE JOB
// =====================================================

const approveJob = async (req, res) => {

    try {

        const { jobId } = req.params;


        console.log("================================");
        console.log("APPROVE JOB START");
        console.log("Job ID:", jobId);


        // =================================================
        // FIND JOB
        // =================================================

        const job =
            await JobModel.findById(jobId);


        if (!job) {

            return res.status(404).json({

                success: false,

                message:
                    "Job not found",

            });

        }


        console.log(
            "Approval Status:",
            job.approvalStatus
        );


        // =================================================
        // CHECK PENDING
        // =================================================

        if (
            job.approvalStatus !==
            "pending"
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Job is already processed",

                currentStatus:
                    job.approvalStatus,

            });

        }


        // =================================================
        // FIND EMPLOYEE
        // =================================================

        const employee =
            await findUser(
                job.createdBy
            );


        console.log(
            "Employee:",
            employee
        );


        if (!employee) {

            return res.status(404).json({

                success: false,

                message:
                    `Employee not found for ID: ${job.createdBy}`,

            });

        }


        // =================================================
        // UPDATE JOB
        // =================================================

        job.approvalStatus =
            "accepted";

        job.rejectionReason =
            "";

        await job.save();


        // =================================================
        // CREATE EMPLOYEE NOTIFICATION
        // =================================================

        await NotificationModel.create({

            recipient:
                employee.Id,

            sender:
                "ADMIN",

            jobId:
                job._id,

            message:
                `Your job "${job.jobTitle}" has been accepted by Admin`,

            type:
                "job-accepted",

            isRead:
                false,

        });


        // =================================================
        // SEND ACCEPT EMAIL
        // =================================================

        let emailSent = false;


        if (
            employee.workEmail
        ) {

            emailSent =
                await EmailNotification({

                    receiverEmail:
                        employee.workEmail,

                    subject:
                        "Job Accepted - TechNova Private Limited",

                    dynamicHtml: `

                        <h2 style="
                            color:#16a34a;
                            text-align:center;
                        ">
                            Job Accepted
                        </h2>

                        <p>
                            Hello
                            <strong>
                                ${employee.fullName}
                            </strong>,
                        </p>

                        <p>
                            Your job has been
                            <strong>
                                accepted
                            </strong>
                            by Admin.
                        </p>

                        <div style="
                            background:#f0fdf4;
                            padding:20px;
                            border-radius:8px;
                        ">

                            <p>
                                <strong>
                                    Project ID:
                                </strong>
                                ${job.projectId}
                            </p>

                            <p>
                                <strong>
                                    Job Title:
                                </strong>
                                ${job.jobTitle}
                            </p>

                            <p>
                                <strong>
                                    Job Type:
                                </strong>
                                ${job.jobType}
                            </p>

                            <p>
                                <strong>
                                    Start Date:
                                </strong>
                                ${new Date(
                                    job.startDate
                                ).toLocaleDateString()}
                            </p>

                            <p>
                                <strong>
                                    Due Date:
                                </strong>
                                ${new Date(
                                    job.dueDate
                                ).toLocaleDateString()}
                            </p>

                            <p>
                                <strong>
                                    Total Hours:
                                </strong>
                                ${job.totalHours}
                            </p>

                        </div>

                        <p>
                            You can now proceed with the job.
                        </p>

                        <p>
                            Regards,<br>
                            <strong>
                                TechNova Private Limited
                            </strong>
                        </p>

                    `,

                });

        }


        console.log(
            "Accept Email Sent:",
            emailSent
        );


        console.log("================================");


        return res.status(200).json({

            success: true,

            message:
                emailSent
                    ? "Job accepted and email sent successfully"
                    : "Job accepted, but email could not be sent",

            job,

        });


    } catch (error) {

        console.error(
            "Approve Job Error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Server error",

            error:
                error.message,

        });

    }

};


// =====================================================
// REJECT JOB
// =====================================================

const rejectJob = async (req, res) => {
    try {

        console.log("================================");
        console.log("REJECT JOB START");

        const { jobId } = req.params;

        // req.body undefined இருந்தாலும் crash ஆகக்கூடாது
        const { reason = "" } = req.body || {};

        console.log("Job ID:", jobId);
        console.log("Reject Reason:", reason);


        // =========================================
        // CHECK REASON
        // =========================================

        if (!reason.trim()) {

            return res.status(400).json({
                success: false,
                message: "Rejection reason is required"
            });

        }


        // =========================================
        // FIND JOB
        // =========================================

        const job = await JobModel.findById(jobId);

        if (!job) {

            return res.status(404).json({
                success: false,
                message: "Job not found"
            });

        }


        // =========================================
        // CHECK PENDING
        // =========================================

        if (job.approvalStatus !== "pending") {

            return res.status(400).json({
                success: false,
                message: "Job is already processed",
                currentStatus: job.approvalStatus
            });

        }


        // =========================================
        // UPDATE JOB
        // =========================================

        job.approvalStatus = "rejected";

        job.rejectionReason = reason.trim();

        await job.save();


        // =========================================
        // FIND EMPLOYEE
        // =========================================

        const employee = await UserModel.findOne({
            Id: job.createdBy
        });

        console.log("Employee:", employee);


        // =========================================
        // EMPLOYEE NOT FOUND
        // =========================================

        if (!employee) {

            return res.status(404).json({
                success: false,
                message: `Employee not found for ID: ${job.createdBy}`
            });

        }


        // =========================================
        // CREATE NOTIFICATION
        // =========================================

        await NotificationModel.create({

            recipient: employee.Id,

            sender: "ADMIN",

            jobId: job._id,

            message:
                `Your job "${job.jobTitle}" has been rejected. Reason: ${reason.trim()}`,

            type: "job-rejected",

            isRead: false

        });


        // =========================================
        // SEND REJECT EMAIL
        // =========================================

        let emailSent = false;

        if (employee.workEmail) {

            emailSent = await EmailNotification({

                receiverEmail: employee.workEmail,

                subject:
                    "Job Rejected - TechNova Private Limited",

                dynamicHtml: `

                    <h2 style="
                        color: #dc2626;
                        text-align: center;
                    ">
                        Job Rejected
                    </h2>

                    <p>
                        Hello
                        <strong>
                            ${employee.fullName}
                        </strong>,
                    </p>

                    <p>
                        Your job has been
                        <strong>rejected</strong>
                        by Admin.
                    </p>

                    <div style="
                        background-color: #fef2f2;
                        padding: 20px;
                        border-radius: 8px;
                        margin-top: 20px;
                    ">

                        <p>
                            <strong>Project ID:</strong>
                            ${job.projectId}
                        </p>

                        <p>
                            <strong>Job Title:</strong>
                            ${job.jobTitle}
                        </p>

                        <p>
                            <strong>Job Type:</strong>
                            ${job.jobType}
                        </p>

                        <p>
                            <strong>Start Date:</strong>
                            ${job.startDate}
                        </p>

                        <p>
                            <strong>Due Date:</strong>
                            ${job.dueDate}
                        </p>

                        <p>
                            <strong>Total Hours:</strong>
                            ${job.totalHours}
                        </p>

                        <p>
                            <strong>Rejection Reason:</strong>
                        </p>

                        <p style="
                            background-color: white;
                            padding: 12px;
                            border-radius: 5px;
                        ">
                            ${reason.trim()}
                        </p>

                    </div>

                    <p>
                        Please review the reason and make the necessary changes.
                    </p>

                    <p>
                        Regards,<br>
                        <strong>
                            TechNova Private Limited
                        </strong>
                    </p>

                `
            });

            console.log(
                "Reject Email Sent:",
                emailSent
            );
        }


        // =========================================
        // RESPONSE
        // =========================================

        return res.status(200).json({

            success: true,

            message: emailSent
                ? "Job rejected and email sent successfully"
                : "Job rejected, but email could not be sent",

            job

        });


    } catch (error) {

        console.error(
            "Reject Job Error:",
            error
        );

        return res.status(500).json({

            success: false,

            message: "Server error",

            error: error.message

        });

    }
};

module.exports = {
    createJob,
    getEmployeeJobs,
    getAllJobs,
    getPendingJobs,
    approveJob,
    rejectJob,
};