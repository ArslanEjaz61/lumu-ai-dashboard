const express = require('express');
const router = express.Router();
const fraudController = require('../controllers/fraudController');

// GET /api/fraud - Get fraud overview from ClickCease
router.get('/', fraudController.getFraudOverview);

// GET /api/fraud/invalid-clicks - Get invalid click details
router.get('/invalid-clicks', fraudController.getInvalidClicks);

// GET /api/fraud/blocked-ips - Get list of blocked IPs
router.get('/blocked-ips', fraudController.getBlockedIPs);

// GET /api/fraud/savings - Get money saved from fraud prevention
router.get('/savings', fraudController.getSavings);

// GET /api/fraud/report - Get detailed fraud report
router.get('/report', fraudController.getDetailedReport);

module.exports = router;
