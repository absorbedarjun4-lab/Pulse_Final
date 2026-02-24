const socketio = require('socket.io');
const { onlineUsers } = require('./controllers/sosController');

/**
 * Initialize Socket.IO logic
 * @param {object} server - HTTP Server instance
 */
const initSOSSocket = (server) => {
    const io = socketio(server, {
        cors: {
            origin: "*", // Adjust origins in production
            methods: ["GET", "POST"]
        }
    });

    console.log("⚡ Socket.IO initialized for SOS Alerts");

    io.on('connection', (socket) => {
        console.log(`📡 New connection: ${socket.id}`);

        /**
         * Event: Update live location
         * Clients should emit this periodically or when moving
         */
        socket.on('UPDATE_LOCATION', (data) => {
            const { userId, latitude, longitude } = data;
            if (userId && latitude && longitude) {
                onlineUsers.set(socket.id, {
                    userId,
                    lat: latitude,
                    lng: longitude
                });
                // console.log(`📍 Location updated for User ${userId}: ${latitude}, ${longitude}`);
            }
        });

        /**
         * Clean up on disconnect
         */
        socket.on('disconnect', () => {
            console.log(`❌ Connection closed: ${socket.id}`);
            onlineUsers.delete(socket.id);
        });
    });

    return io;
};

module.exports = initSOSSocket;
