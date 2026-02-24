const express = require('express');
const router = express.Router();
const { QuizResult, PASS_THRESHOLD } = require('../models/QuizResult');

// POST /api/results — save a quiz result
router.post('/', async (req, res) => {
    try {
        const {
            leadership, ethics, speed, awareness, resourcefulness,
            totalScore, maxTotal, percentage, tier, choices,
        } = req.body;

        // Basic validation
        if (
            leadership == null || ethics == null || speed == null ||
            awareness == null || resourcefulness == null ||
            totalScore == null || percentage == null || !tier
        ) {
            return res.status(400).json({ error: 'Missing required fields.' });
        }

        // Evaluate: verified = 1 if percentage >= threshold, else 0
        const verified = percentage >= PASS_THRESHOLD ? 1 : 0;

        const result = await QuizResult.create({
            leadership, ethics, speed, awareness, resourcefulness,
            totalScore, maxTotal, percentage, tier,
            verified,
            choices: choices || [],
        });

        return res.status(201).json({
            message: 'Result saved successfully.',
            id: result._id,
            verified,
        });
    } catch (err) {
        console.error('Error saving result:', err);
        return res.status(500).json({ error: 'Internal server error.' });
    }
});

// GET /api/results — retrieve all results (latest first)
router.get('/', async (req, res) => {
    try {
        const results = await QuizResult.find().sort({ createdAt: -1 }).limit(100);
        return res.json(results);
    } catch (err) {
        console.error('Error fetching results:', err);
        return res.status(500).json({ error: 'Internal server error.' });
    }
});

// GET /api/results/:id — retrieve a single result
router.get('/:id', async (req, res) => {
    try {
        const result = await QuizResult.findById(req.params.id);
        if (!result) return res.status(404).json({ error: 'Result not found.' });
        return res.json(result);
    } catch (err) {
        console.error('Error fetching result:', err);
        return res.status(500).json({ error: 'Internal server error.' });
    }
});

module.exports = router;
