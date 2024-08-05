const jwt = require('jsonwebtoken');
const UserModel = require('../models/UserModel');

const getUserDetailFromToken = async (token) => {
    if (!token) {
        return {
            message: "Session expired",
            logout: true
        };
    }

    try {
        // Verify the token
        const decoded = await jwt.verify(token, process.env.JWT_SECRET_KEY);

        // Fetch user details excluding the password
        const user = await UserModel.findById(decoded.id).select('-password');
        return user;

    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return {
                message: "Token expired",
                logout: true
            };
        } else {
            throw new Error(error.message || "Internal Server Error");
        }
    }
};

module.exports = getUserDetailFromToken;
