const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Generate JWT Token
const generateToken = (id) => {
    try {
        const secret = process.env.JWT_SECRET;
        if (!secret) {
            console.error('JWT_SECRET is not set in environment variables');
            throw new Error('JWT_SECRET is not configured');
        }
        const token = jwt.sign({ id }, secret, {
            expiresIn: '30d'
        });
        console.log('Token generated successfully for user ID:', id);
        return token;
    } catch (error) {
        console.error('Token generation error:', error);
        throw error;
    }
};

// Get all users
exports.getUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Register a new user
exports.register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Check if user already exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Create new user
        const user = await User.create({
            name,
            email,
            password
        });

        // Generate token
        const token = generateToken(user._id);

        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Login user
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log('Login attempt for email:', email);

        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            console.log('User not found for email:', email);
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Check password
        console.log('Attempting password comparison');
        const isMatch = await user.comparePassword(password);
        console.log('Password match result:', isMatch);
        
        if (!isMatch) {
            console.log('Password mismatch for user:', email);
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Generate token
        const token = generateToken(user._id);
        console.log('Token generated successfully for user:', email);

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'An error occurred during login' });
    }
};

// Get user profile
exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update user profile
exports.updateProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (user) {
            user.name = req.body.name || user.name;
            user.email = req.body.email || user.email;
            if (req.body.password) {
                user.password = req.body.password;
            }

            const updatedUser = await user.save();

            res.json({
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                role: updatedUser.role,
                token: generateToken(updatedUser._id)
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}; 