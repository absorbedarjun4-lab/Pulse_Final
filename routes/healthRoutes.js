const express = require('express');
const mongoose = require('mongoose');
const os = require('os');
const path = require('path');
const router = express.Router();

// ─── GET /health  (JSON API) ─────────────────────────────────────────────────
router.get('/status', (req, res) => {
    const dbState = mongoose.connection.readyState;
    const dbStateMap = { 0: 'disconnected', 1: 'connected', 2: 'connecting', 3: 'disconnecting' };

    const uptimeSec = Math.floor(process.uptime());
    const hours = Math.floor(uptimeSec / 3600);
    const minutes = Math.floor((uptimeSec % 3600) / 60);
    const seconds = uptimeSec % 60;

    res.status(dbState === 1 ? 200 : 503).json({
        status: dbState === 1 ? 'ok' : 'degraded',
        timestamp: new Date().toISOString(),
        uptime: `${hours}h ${minutes}m ${seconds}s`,
        server: {
            node: process.version,
            platform: process.platform,
            memory: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)} MB`,
        },
        database: {
            state: dbStateMap[dbState] || 'unknown',
            host: mongoose.connection.host || 'n/a',
            name: mongoose.connection.name || 'n/a',
        },
    });
});

// ─── GET /health  (HTML page) ────────────────────────────────────────────────
router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/health.html'));
});

module.exports = router;
