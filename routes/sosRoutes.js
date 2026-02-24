const express = require('express');
const router = express.Router();
const sosController = require('../controllers/sosController');
const auth = require('../middleware/auth');
const roleGuard = require('../middleware/roleGuard');

// POST /api/sos - Create new SOS alert
router.post('/', sosController.createSOS);

// POST /api/sos/respond - Respond to an SOS
router.post('/respond', sosController.respondToSOS);

// POST /api/sos/resolve - Resolve an SOS
router.post('/resolve', sosController.resolveSOS);

// Admin SOS Dismissal
router.patch('/dismiss', sosController.dismissSOS);

// Dashboard Routes
router.get('/active', sosController.getActiveAlerts);
router.get('/admin-all', sosController.getAllAlerts);
router.post('/global-alert', sosController.issueGlobalAlert);

module.exports = router;
