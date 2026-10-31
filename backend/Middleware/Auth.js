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

const allowRoles = (...allowedRoles) => {
    return (req,res,next) => {
        if(!req.user)
        {
            return res.status(401).json({
                success:false,
                message:"user not authenticated",
            });
        }

        if(!allowedRoles.includes(req.user.role))
        {
            return res.status(403).json({
                success:false,
                message:"access denied",
            });
        }

        next();
    }
}

const  jwt = require("jsonwebtoken");

const Auth = (req,res,next) => {
    try{
        const authHeader = req.header("Authorization");

        if(!authHeader)
        {
            return res.status(401).json({
                success:false,
                message:"Authorization header missing"
            });
        }

        const token = authHeader.split(" ")[1];

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.user = decoded;
        next();
    }
    catch(error)
    {
        console.log("JWT VERIFY ERROR", error);
        console.log("JWT VERIFY MESSAGE", error.message);
        return res.status(401).json({
            success:false,
            message:"Invalid or expired token"
        });
    }
};

module.exports = {middleware, allowRoles, Auth};