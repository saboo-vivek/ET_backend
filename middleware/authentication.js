const jwt = require('jsonwebtoken');
const User = require('../models/user');

exports.authenticate = async (req, res, next) => {
    try {
        const token = req.header('Authorization');
        if (!token) {
            return res.status(401).json({ success: false, message: 'Access denied. No token provided.' });
        }

        const decoded = jwt.verify(token, process.env.TOKEN_KEY);
        const userId = decoded._id;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }

        req.user = user;
        next();
    } catch (err) {
        console.error('Authentication error:', err.message);
        if (err.name === 'JsonWebTokenError') {
            return res.status(400).json({ success: false, message: 'Invalid token.' });
        } else if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ success: false, message: 'Token expired.' });
        } else {
            return res.status(500).json({ success: false, message: 'Internal server error.' });
        }
    }
}

exports.checkPremium = (req, res, next) => {
    if (!req.user.ispremiumuser) {
        return res.status(403).json({ success: false, message: 'Please buy a premium subscription to access this feature.' });
    }
    next();
}
