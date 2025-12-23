const express = require('express');
const router = express.Router();
const campaignController = require('../controllers/campaignController');

// GET /api/campaigns - Get all campaigns (Meta + Google)
router.get('/', campaignController.getAllCampaigns);

// GET /api/campaigns/meta - Get Meta (Facebook/Instagram) campaigns
router.get('/meta', campaignController.getMetaCampaigns);

// GET /api/campaigns/google - Get Google Ads campaigns
router.get('/google', campaignController.getGoogleCampaigns);

// GET /api/campaigns/:id - Get single campaign details
router.get('/:id', campaignController.getCampaignById);

// GET /api/campaigns/performance - Get performance comparison
router.get('/performance/compare', campaignController.getPerformanceComparison);

module.exports = router;
