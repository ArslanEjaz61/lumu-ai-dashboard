const express = require('express');
const router = express.Router();
const audienceController = require('../controllers/audienceController');

// GET /api/audience - Get audience overview
router.get('/', audienceController.getAudienceOverview);

// GET /api/audience/demographics - Get demographics (age, gender)
router.get('/demographics', audienceController.getDemographics);

// GET /api/audience/segments - Get audience segments
router.get('/segments', audienceController.getSegments);

// GET /api/audience/behavior - Get user behavior from Clarity
router.get('/behavior', audienceController.getUserBehavior);

// GET /api/audience/heatmaps - Get heatmap data from Clarity
router.get('/heatmaps', audienceController.getHeatmaps);

module.exports = router;
