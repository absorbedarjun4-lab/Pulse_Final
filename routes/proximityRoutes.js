const express = require('express');
const router = express.Router();
const { calculateDistance } = require('../utils/proximity');

/**
 * @route   GET /api/proximity/nearby
 * @desc    Fetch closest emergency facilities from Overpass API (OSM)
 */
router.get('/nearby', async (req, res) => {
    try {
        const { lat, lon } = req.query;
        if (!lat || !lon) {
            return res.status(400).json({ message: "Latitude and longitude are required" });
        }

        const radius = 10000; // 10km search
        const query = `[out:json];
            (
                node["amenity"="hospital"](around:${radius},${lat},${lon});
                node["amenity"="police"](around:${radius},${lat},${lon});
                node["amenity"="fire_station"](around:${radius},${lat},${lon});
                way["amenity"="hospital"](around:${radius},${lat},${lon});
                way["amenity"="police"](around:${radius},${lat},${lon});
                way["amenity"="fire_station"](around:${radius},${lat},${lon});
            );
            out center;`;

        const overpassUrl = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

        const apiRes = await fetch(overpassUrl, { signal: controller.signal });
        clearTimeout(timeoutId);

        if (!apiRes.ok) {
            const errorText = await apiRes.text();
            console.error(`[PROXIMITY] Overpass API Error ${apiRes.status}:`, errorText);
            return res.status(503).json({ message: "Overpass API is currently unavailable or rate-limited" });
        }

        const data = await apiRes.json();
        const results = data.elements || [];

        // Categorize and find closest
        const findClosest = (type) => {
            const filtered = results.filter(el => {
                const tags = el.tags || {};
                return tags.amenity === type;
            });

            if (filtered.length === 0) return null;

            return filtered.map(el => {
                const elLat = el.lat || (el.center && el.center.lat);
                const elLon = el.lon || (el.center && el.center.lon);

                if (!elLat || !elLon) return null;

                const dist = calculateDistance(lat, lon, elLat, elLon);
                return {
                    name: el.tags.name || `Local ${type.replace('_', ' ')}`,
                    distance: dist,
                    type: type
                };
            }).filter(Boolean).sort((a, b) => a.distance - b.distance)[0];
        };

        const nearby = {
            hospital: findClosest('hospital'),
            police: findClosest('police'),
            fire_station: findClosest('fire_station')
        };

        res.json(nearby);

    } catch (error) {
        if (error.name === 'AbortError') {
            console.error("[PROXIMITY] Overpass API Request Timed Out");
            return res.status(504).json({ message: "Request to mapping service timed out" });
        }
        console.error("[PROXIMITY] Proximity Fetch Error:", error.message);
        res.status(500).json({ message: "Internal server error fetching nearby facilities" });
    }
});

module.exports = router;
