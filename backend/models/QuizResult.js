const mongoose = require('mongoose');

// Minimum percentage to pass the assessment
const PASS_THRESHOLD = 75;

const quizResultSchema = new mongoose.Schema(
    {
        // Dimension scores
        leadership: { type: Number, required: true },
        ethics: { type: Number, required: true },
        speed: { type: Number, required: true },
        awareness: { type: Number, required: true },
        resourcefulness: { type: Number, required: true },

        // Totals
        totalScore: { type: Number, required: true },
        maxTotal: { type: Number, required: true },
        percentage: { type: Number, required: true },

        // Tier
        tier: { type: String, required: true },

        // Verified: 1 = passed (>= 60%), 0 = failed
        verified: { type: Number, enum: [0, 1], required: true },

        // Per-scenario choice log
        choices: [
            {
                scenarioId: Number,
                choiceId: String,
                timedOut: Boolean,
            },
        ],

        // Timestamp
        completedAt: { type: Date, default: Date.now },
    },
    { timestamps: true }
);

const QuizResult = mongoose.model('QuizResult', quizResultSchema);
module.exports = { QuizResult, PASS_THRESHOLD };
