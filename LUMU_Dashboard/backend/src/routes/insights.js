const express = require('express');
const router = express.Router();
const insightsController = require('../controllers/insightsController');

// GET /api/insights - Get AI-powered insights from n8n
router.get('/', insightsController.getAllInsights);

// GET /api/insights/recommendations - Get optimization recommendations
router.get('/recommendations', insightsController.getRecommendations);

// GET /api/insights/alerts - Get active alerts
router.get('/alerts', insightsController.getAlerts);

// POST /api/insights/trigger - Trigger n8n workflow
router.post('/trigger/:workflow', insightsController.triggerWorkflow);

// GET /api/insights/forecast - Get demand forecast
router.get('/forecast', insightsController.getDemandForecast);

module.exports = router;
