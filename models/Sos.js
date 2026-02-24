const mongoose = require('mongoose');

const sosSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        location: {
            latitude: { type: Number, required: true },
            longitude: { type: Number, required: true },
        },
        emergencyType: {
            type: String,
            required: true,
            trim: true,
        },
        status: {
            type: String,
            enum: ['active', 'responding', 'resolved'],
            default: 'active',
        },
        responders: [
            {
                userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
                responseTime: { type: Date, default: Date.now },
            }
        ],
        reports: [
            {
                userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
                reason: String,
                timestamp: { type: Date, default: Date.now },
            }
        ]
    },
    { timestamps: true }
);

// Index for geo-spatial queries if needed later, but we calculate proximity dynamically as per requirements
sosSchema.index({ "location.latitude": 1, "location.longitude": 1 });

module.exports = mongoose.model('SOS', sosSchema, 'sos_alerts');
