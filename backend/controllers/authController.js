const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Name, email and password are required' });
        }

        // Check if user exists
        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Generate fake UPI ID (e.g., name@qp)
        const upiId = `${name.replace(/\s+/g, '').toLowerCase()}@qp`;

        const user = await User.create({
            name,
            email,
            password,
            upiId,
        });

        if (user) {
            return res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                upiId: user.upiId,
                walletBalance: user.walletBalance,
                token: generateToken(user._id),
            });
        } else {
            return res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (err) {
        console.error('registerUser error:', err);
        return res.status(500).json({ message: err && err.message ? err.message : 'Server error' });
    }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const authUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        const user = await User.findOne({ email });

        if (user && (await user.matchPassword(password))) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                upiId: user.upiId,
                walletBalance: user.walletBalance,
                token: generateToken(user._id),
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (err) {
        console.error('authUser error:', err);
        return res.status(500).json({ message: err && err.message ? err.message : 'Server error' });
    }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
const getUserProfile = async (req, res) => {
    try {
        if (!req.user || !req.user._id) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        const user = await User.findById(req.user._id);

        if (user) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                upiId: user.upiId,
                walletBalance: user.walletBalance,
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (err) {
        console.error('getUserProfile error:', err);
        return res.status(500).json({ message: err && err.message ? err.message : 'Server error' });
    }
};

module.exports = { registerUser, authUser, getUserProfile };
