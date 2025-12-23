const express = require('express');
const router = express.Router();
const geoController = require('../controllers/geoController');

// GET /api/geo - Get geo overview
router.get('/', geoController.getGeoOverview);

// GET /api/geo/cities - Get city-wise data
router.get('/cities', geoController.getCityData);

// GET /api/geo/tiers - Get tier-wise breakdown (Tier 1, 2, 3 cities)
router.get('/tiers', geoController.getTierBreakdown);

// GET /api/geo/regions - Get region-wise data
router.get('/regions', geoController.getRegionData);

module.exports = router;
