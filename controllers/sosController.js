const mongoose = require('mongoose');
const SOS = require('../models/Sos');
const User = require('../models/User');
const { calculateDistance } = require('../utils/proximity');

// This map will store online users and their live locations
// In a production environment, this should ideally be in Redis
const onlineUsers = new Map(); // socketId -> { userId, lat, lng }

// Initialize Guest User if not present
let GUEST_USER_ID = null;
const ensureGuestUser = async () => {
    if (GUEST_USER_ID) return GUEST_USER_ID;
    try {
        let guest = await User.findOne({ email: 'guest@pulse.gov.int' });
        if (!guest) {
            guest = await User.create({
                name: 'Guest Citizen',
                email: 'guest@pulse.gov.int',
                password: 'GuestPassword123!', // Met complexity
                role: 'user',
                isVerified: false
            });
            console.log('✅ Guest Citizen record initialized');
        }
        GUEST_USER_ID = guest._id;
        return GUEST_USER_ID;
    } catch (err) {
        console.error('FAILED to initialize Guest User:', err.message);
        return null;
    }
};

/**
 * Handle SOS Creation
 */
exports.createSOS = async (req, res) => {
    try {
        let { userId, latitude, longitude, emergencyType } = req.body;

        // Handle Guest SOS
        if (!userId || userId === 'GUEST') {
            userId = await ensureGuestUser();
        }

        // 1. Validation
        if (!userId || !latitude || !longitude || !emergencyType) {
            return res.status(400).json({ message: "Missing required SOS data" });
        }


        // 3. Create SOS record (Validate userId format before querying)
        let creatorName = "Anonymous Citizen";
        if (mongoose.isValidObjectId(userId)) {
            const creator = await User.findById(userId);
            if (creator) creatorName = creator.name;
        }

        const newSOS = await SOS.create({
            userId,
            location: { latitude, longitude },
            emergencyType,
            status: "active"
        });

        // 4. Proximity Matching & Alert Dispatch
        const io = req.app.get('socketio');
        const nearbyUsers = [];

        // Always emit globally for Admins and system-wide visibility
        io.emit('SOS_ALERT', {
            sosId: newSOS._id,
            creatorId: userId,
            creatorName: creatorName,
            emergencyType,
            distance: 0,
            location: { latitude, longitude },
            createdAt: newSOS.createdAt
        });

        onlineUsers.forEach((data, socketId) => {
            // Calculate distance using Haversine
            const distance = calculateDistance(latitude, longitude, data.lat, data.lng);

            // Identify users within 2km radius
            if (distance <= 2) {
                nearbyUsers.push(socketId);
                // The global emit already covers this for anyone listening to SOS_ALERT,
                // but we can keep it here if we want to send specific targeted payloads later.
            }
        });

        res.status(201).json({
            message: "SOS created and alerts dispatched",
            sosId: newSOS._id,
            notifiedResponders: nearbyUsers.length
        });

    } catch (error) {
        console.error("SOS Creation Error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

/**
 * Handle SOS Response
 */
exports.respondToSOS = async (req, res) => {
    try {
        const { sosId, userId } = req.body;
        console.log(`[SOS_RESPOND] Request - SOS: ${sosId}, User: ${userId}`);

        if (!sosId || !userId || sosId === 'undefined') {
            console.warn("[SOS_RESPOND] Invalid or missing parameters");
            return res.status(400).json({ message: "SOS ID and User ID are required" });
        }

        if (!mongoose.isValidObjectId(sosId)) {
            return res.status(400).json({ message: "Invalid SOS ID format" });
        }

        const sos = await SOS.findById(sosId);
        if (!sos) {
            console.warn(`[SOS_RESPOND] Alert not found: ${sosId}`);
            return res.status(404).json({ message: "SOS not found" });
        }

        if (sos.status === 'resolved') {
            return res.status(400).json({ message: "This SOS is already resolved" });
        }

        // Add responder and update status if it was active
        // Safe check for existing responders
        const alreadyResponding = (sos.responders || []).some(r =>
            r.userId && r.userId.toString() === userId.toString()
        );

        if (alreadyResponding) {
            return res.status(400).json({ message: "You are already responding to this SOS" });
        }

        sos.responders.push({ userId });
        sos.status = 'responding';
        await sos.save();

        // Broadcast status update
        const io = req.app.get('socketio');
        if (io) {
            io.emit('SOS_STATUS_UPDATE', {
                sosId: sos._id,
                status: sos.status,
                responderCount: sos.responders.length
            });
        } else {
            console.warn("[SOS_RESPOND] Socket.io not found on app instance");
        }

        return res.json({ message: "Response registered", status: sos.status });

    } catch (error) {
        console.error("SOS Response Error:", error);
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

/**
 * Resolve SOS
 */
exports.resolveSOS = async (req, res) => {
    try {
        const { sosId, userId } = req.body;

        const sos = await SOS.findById(sosId);
        if (!sos) return res.status(404).json({ message: "SOS not found" });

        // Only creator can resolve
        if (sos.userId.toString() !== userId) {
            return res.status(403).json({ message: "Only the SOS creator can resolve it" });
        }

        sos.status = 'resolved';
        await sos.save();

        // Notify all
        const io = req.app.get('socketio');
        io.emit('SOS_STATUS_UPDATE', { sosId: sos._id, status: sos.status });

        res.json({ message: "SOS marked as resolved" });

    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
};

/**
 * Admin: Dismiss (Resolve) any SOS
 */
exports.dismissSOS = async (req, res) => {
    try {
        const { sosId } = req.body;

        const sos = await SOS.findById(sosId);
        if (!sos) return res.status(404).json({ message: "SOS not found" });

        sos.status = 'resolved';
        await sos.save();

        // Notify all via Socket.io
        const io = req.app.get('socketio');
        io.emit('SOS_STATUS_UPDATE', {
            sosId: sos._id,
            status: sos.status,
            dismissedBy: "admin"
        });

        res.json({ message: "SOS dismissed by admin" });

    } catch (error) {
        console.error("Admin Dismiss Error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

/**
 * Get Active Alerts (Filtered by proximity if coords provided)
 */
exports.getActiveAlerts = async (req, res) => {
    try {
        const { lat, lng, radius = 5 } = req.query; // Default 5km

        const query = { status: { $in: ['active', 'responding'] } };
        const alerts = await SOS.find(query).populate('userId', 'name').sort({ createdAt: -1 });

        if (lat && lng) {
            const filtered = alerts.filter(alert => {
                const isBroadcast = alert.emergencyType.startsWith('BROADCAST');
                if (isBroadcast) {
                    alert._doc.distance = 0; // System level
                    return true;
                }

                const distance = calculateDistance(
                    parseFloat(lat),
                    parseFloat(lng),
                    alert.location.latitude,
                    alert.location.longitude
                );
                alert._doc.distance = distance.toFixed(2);
                return distance <= parseFloat(radius);
            });
            return res.json(filtered);
        }

        res.json(alerts);
    } catch (error) {
        res.status(500).json({ message: "Error fetching alerts" });
    }
};

/**
 * Admin: Get All SOS Records
 */
exports.getAllAlerts = async (req, res) => {
    try {
        const alerts = await SOS.find()
            .populate('userId', 'name email')
            .populate('responders.userId', 'name')
            .sort({ createdAt: -1 });
        res.json(alerts);
    } catch (error) {
        res.status(500).json({ message: "Error fetching admin alerts" });
    }
};

/**
 * Admin: Issue Global Emergency Alert
 */
exports.issueGlobalAlert = async (req, res) => {
    try {
        const { message, severity, latitude, longitude, radius = 5 } = req.body;
        const io = req.app.get('socketio');

        const alertPayload = {
            message,
            severity, // 'critical', 'warning', 'info'
            timestamp: new Date(),
            origin: latitude ? { latitude, longitude } : null
        };

        // Persistent Incident Logging
        // Use a system/admin context for the broadcast identity
        let adminUser = await User.findOne({ role: 'admin' });
        const adminId = adminUser ? adminUser._id : null;

        const broadcastSOS = await SOS.create({
            userId: adminId,
            location: {
                latitude: latitude || 0,
                longitude: longitude || 0
            },
            emergencyType: `BROADCAST: ${message.slice(0, 30)}${message.length > 30 ? '...' : ''}`,
            status: "active"
        });

        const sosPayload = {
            sosId: broadcastSOS._id,
            creatorId: adminId,
            creatorName: "SYSTEM BROADCAST",
            emergencyType: "Broadcast",
            message: message,
            distance: 0, // Broadcasts always prioritized
            location: { latitude: latitude || 0, longitude: longitude || 0 },
            createdAt: broadcastSOS.createdAt
        };

        console.log(`[GLOBAL_ALERT] Persistent ID: ${broadcastSOS._id}`);

        if (latitude && longitude) {
            // Proximity targeted alert
            let notifiedCount = 0;
            onlineUsers.forEach((data, socketId) => {
                const distance = calculateDistance(latitude, longitude, data.lat, data.lng);
                if (distance <= parseFloat(radius)) {
                    io.to(socketId).emit('GLOBAL_EMERGENCY', alertPayload);
                    io.to(socketId).emit('SOS_ALERT', { ...sosPayload, distance: distance.toFixed(2) });
                    notifiedCount++;
                }
            });
            return res.json({ message: `Targeted alert broadcasted to ${notifiedCount} users in range.` });
        }

        // Global alert
        io.emit('GLOBAL_EMERGENCY', alertPayload);
        io.emit('SOS_ALERT', sosPayload);
        res.json({ message: "Global alert broadcasted to all channels" });
    } catch (error) {
        res.status(500).json({ message: "Error broadcasting alert" });
    }
};

// Export the online users map for socket handlers
exports.onlineUsers = onlineUsers;
