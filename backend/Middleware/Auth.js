const user = require("../models/User");

const middleware = async (req, res, next) => {
    try {
        if (!req.session.user) {
            return res.status(401).json({
                success: false,
                message: "User not authenticated",
            });
        }

        const fetchuser = await user.findOne({
            employeeId: req.session.user.employeeId,
        });

        if (!fetchuser) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        req.user = fetchuser;

        console.log("Middleware:", fetchuser);

        next();

    } catch (error) {
        console.error("Middleware Error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};

module.exports = middleware;