const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// ─── Helpers ────────────────────────────────────────────────────────────────

const generateToken = (user) =>
    jwt.sign(
        { id: user._id, role: user.role, name: user.name },
        process.env.JWT_SECRET,
        { expiresIn: '8h' }
    );

// ─── Signup (users only) ─────────────────────────────────────────────────────

exports.signup = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        // Block admin self-registration
        if (role === 'admin') {
            return res.status(400).json({
                message: 'Admin accounts cannot be self-registered. Contact your system administrator.',
            });
        }

        // Check required fields
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Name, email, and password are required.' });
        }

        // Duplicate email check
        const existing = await User.findOne({ email: email.toLowerCase() });
        if (existing) {
            return res.status(409).json({ message: 'An account with this email already exists.' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user
        const user = await User.create({
            name: name.trim(),
            email: email.toLowerCase().trim(),
            password: hashedPassword,
            role: 'user',
        });

        const token = generateToken(user);

        return res.status(201).json({
            message: 'Account created successfully.',
            token,
            role: user.role,
            name: user.name,
            id: user._id,
            isVerified: user.isVerified,
        });
    } catch (err) {
        if (err.code === 11000) {
            return res.status(409).json({ message: 'An account with this email already exists.' });
        }
        console.error('Signup error:', err);
        return res.status(500).json({ message: 'Server error. Please try again later.' });
    }
};

// ─── Login (admin + user) ────────────────────────────────────────────────────

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required.' });
        }

        // Find user
        const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        // Compare password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        const token = generateToken(user);

        return res.status(200).json({
            message: 'Login successful.',
            token,
            role: user.role,
            name: user.name,
            id: user._id,
            isVerified: user.isVerified,
        });
    } catch (err) {
        console.error('Login error:', err);
        return res.status(500).json({ message: 'Server error. Please try again later.' });
    }
};

// ─── Get Current User ────────────────────────────────────────────────────────

exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found.' });
        return res.status(200).json({ user });
    } catch (err) {
        console.error('GetMe error:', err);
        return res.status(500).json({ message: 'Server error.' });
    }
};

// ─── Verification Assessment ────────────────────────────────────────────────
exports.verifyUser = async (req, res) => {
    try {
        const {
            leadership, ethics, speed, awareness, resourcefulness,
            totalScore, maxTotal, percentage, tier, choices
        } = req.body;

        const { QuizResult, PASS_THRESHOLD } = require('../models/QuizResult');

        if (percentage == null) {
            return res.status(400).json({ message: 'Assessment data is incomplete.' });
        }

        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found.' });

        const verified = percentage >= PASS_THRESHOLD ? 1 : 0;

        // Save formal result record
        await QuizResult.create({
            userId: user._id,
            leadership, ethics, speed, awareness, resourcefulness,
            totalScore, maxTotal, percentage, tier,
            verified,
            choices: choices || []
        });

        if (verified === 1) {
            user.isVerified = true;
            await user.save();
            return res.status(200).json({
                message: 'Self-verification successful!',
                isVerified: true,
                tier
            });
        } else {
            return res.status(200).json({
                message: 'Assessment score too low. Please try again.',
                isVerified: false
            });
        }
    } catch (err) {
        console.error('VerifyUser error:', err);
        return res.status(500).json({ message: 'Server error.' });
    }
};
// ─── Update Profile (authenticated users) ────────────────────────────────────
exports.updateProfile = async (req, res) => {
    try {
        const { name, password } = req.body;
        const user = await User.findById(req.user.id);

        if (!user) return res.status(404).json({ message: 'User not found.' });

        if (name) {
            if (name.trim().length < 2) {
                return res.status(400).json({ message: 'Name must be at least 2 characters.' });
            }
            user.name = name.trim();
        }

        if (password) {
            if (password.length < 6) {
                return res.status(400).json({ message: 'Password must be at least 6 characters.' });
            }
            const salt = await bcrypt.genSalt(12);
            user.password = await bcrypt.hash(password, salt);
        }

        await user.save();

        const token = generateToken(user);

        return res.status(200).json({
            message: 'Profile updated successfully.',
            token,
            name: user.name,
            id: user._id,
            isVerified: user.isVerified
        });
    } catch (err) {
        console.error('UpdateProfile error:', err);
        return res.status(500).json({ message: 'Server error. Please try again.' });
    }
};
