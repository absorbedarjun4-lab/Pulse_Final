require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const healthRoutes = require('./routes/healthRoutes');
const sosRoutes = require('./routes/sosRoutes');
const weatherRoutes = require('./routes/weatherRoutes');
const proximityRoutes = require('./routes/proximityRoutes');
const initSOSSocket = require('./sosSocket');

const app = express();
const server = require('http').createServer(app);

// Initialize Socket.io
const io = initSOSSocket(server);
app.set('socketio', io);

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// ─── Serve Static Assets (CSS, JS, images — but NOT auto-index.html) ─────────
// { index: false } prevents express from auto-serving public/index.html for '/'
// so our explicit app.get('/') and app.get('/auth') routes take control instead.
app.use(express.static(path.join(__dirname, 'public'), { index: false }));
app.use('/resmap', express.static(path.join(__dirname, 'public', 'resmap')));
app.use('/safeWalk', express.static(path.join(__dirname, 'public', 'safeWalk')));
app.use('/store', express.static(path.join(__dirname, 'public', 'store'), { index: true }));

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/sos', sosRoutes);
app.use('/api/weather', weatherRoutes);
app.use('/api/proximity', proximityRoutes);
app.use('/api/results', require('./hackss/backend/routes/results'));

// ─── Health Check ────────────────────────────────────────────────────────────
app.use('/health', healthRoutes);

// ─── Page Routes ─────────────────────────────────────────────────────────────
// GET /        → Landing / home page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'home.html'));
});

// GET /auth    → Login & signup page
app.get('/auth', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'auth.html'));
});

// GET /testimonials → Testimonials page
app.get('/testimonials', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'testimonials', 'index.html'));
});

// GET /contact-us   → Contact Us page
app.get(['/contact-us', '/contact us', '/contact%20us'], (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'contact-us', 'index.html'));
});

// GET /sos & /sos-help → SOS help instruction page
app.get(['/sos', '/sos-help'], (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'sos-help.html'));
});

// Dashboard Routes
app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'user-dashboard.html'));
});

app.get('/admin-panel', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin-dashboard.html'));
});


// ─── 404 Fallback ────────────────────────────────────────────────────────────
// API routes get JSON; everything else gets the friendly 404 page
app.use((req, res) => {
    if (req.path.startsWith('/api/')) {
        return res.status(404).json({ message: 'Route not found.' });
    }
    res.status(404).sendFile(path.join(__dirname, 'public', '404.html'));
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Internal server error.' });
});

// ─── Connect DB & Listen ─────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

process.on('unhandledRejection', (err) => {
    console.error('Unhandled Rejection! Shutting down...', err);
    // In production, you might want to restart the process
});

process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception! Shutting down...', err);
    // In production, you might want to restart the process
});

connectDB().then(() => {
    server.listen(PORT, () => {
        console.log(`🚀  Server running on http://localhost:${PORT}`);
    });
});
