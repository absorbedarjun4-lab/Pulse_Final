const express = require('express');
const router = express.Router();
const { signup, login, getMe, verifyUser, updateProfile } = require('../controllers/authController');
const auth = require('../middleware/auth');
const roleGuard = require('../middleware/roleGuard');

// POST /api/auth/signup  — users only
router.post('/signup', signup);

// POST /api/auth/login   — admin + user
router.post('/login', login);

// GET  /api/auth/me      — authenticated users
router.get('/me', auth, getMe);

// POST /api/auth/verify  — authenticated users
router.post('/verify', auth, verifyUser);

// PATCH /api/auth/profile — authenticated users
router.patch('/profile', auth, updateProfile);

// Example of role-protected route (for integration use)
// router.get('/admin-dashboard', auth, roleGuard('admin'), (req, res) => {
//   res.json({ message: 'Admin access granted', user: req.user });
// });

module.exports = router;
