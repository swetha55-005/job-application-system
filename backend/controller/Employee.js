const UserModel = require("../models/User");

// GET ALL EMPLOYEES
const getAllEmployees = async (req, res) => {
    try {
        const employees = await UserModel.find(
            { role: "employee" },
            {
                _id: 1,
                employeeId: 1,
                fullName: 1,
                personalEmail: 1,
                workEmail: 1,
                phoneNumber: 1,
                role: 1,
            }
        ).sort({ fullName: 1 });

        return res.status(200).json({
            success: true,
            employees,
        });

    } catch (error) {
        console.error("Get All Employees Error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch employees",
            error: error.message,
        });
    }
};

module.exports = {
    getAllEmployees,
};