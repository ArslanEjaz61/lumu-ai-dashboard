const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');

// GET /api/analytics - Get overview analytics from GA4
router.get('/', analyticsController.getOverview);

// GET /api/analytics/realtime - Get real-time data
router.get('/realtime', analyticsController.getRealtime);

// GET /api/analytics/traffic - Get traffic sources
router.get('/traffic', analyticsController.getTrafficSources);

// GET /api/analytics/conversions - Get conversion data
router.get('/conversions', analyticsController.getConversions);

// GET /api/analytics/devices - Get device breakdown
router.get('/devices', analyticsController.getDeviceBreakdown);

module.exports = router;
