const express = require('express');
const router = express.Router();

// @route   GET /api/weather
// @desc    Proxy for OpenWeather API to avoid exposing API key on frontend
router.get('/', async (req, res) => {
    try {
        const { lat, lon } = req.query;
        const apiKey = process.env.OPENWEATHER_API_KEY;

        if (!apiKey) {
            return res.status(500).json({ message: "OpenWeather API key not configured on server" });
        }

        if (!lat || !lon) {
            return res.status(400).json({ message: "Latitude and longitude are required" });
        }

        const weatherRes = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`);
        const data = await weatherRes.json();

        if (!weatherRes.ok) {
            return res.status(weatherRes.status).json(data);
        }

        res.json(data);
    } catch (error) {
        console.error("Error fetching weather:", error);
        res.status(500).json({ message: "Internal server error while fetching weather" });
    }
});

// @route   GET /api/weather/geocode
// @desc    Reverse geocoding proxy
router.get('/geocode', async (req, res) => {
    try {
        const { lat, lon } = req.query;
        const apiKey = process.env.OPENWEATHER_API_KEY;

        if (!apiKey) {
            return res.status(500).json({ message: "OpenWeather API key not configured" });
        }

        if (!lat || !lon) {
            return res.status(400).json({ message: "Latitude and longitude required" });
        }

        const geoRes = await fetch(`https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${apiKey}`);
        const data = await geoRes.json();

        if (!geoRes.ok) {
            return res.status(geoRes.status).json(data);
        }

        res.json(data[0] || { name: "Unknown Sector" });
    } catch (error) {
        console.error("Error geocoding:", error);
        res.status(500).json({ message: "Server error during geocoding" });
    }
});

module.exports = router;
