const express = require('express');
const router = express.Router();
const campaignController = require('../controllers/campaignController');
const campaignManagerController = require('../controllers/campaignManagerController');

// GET /api/campaigns - Get all campaigns (from DB)
router.get('/', campaignManagerController.getAllCampaigns);

// GET /api/campaigns/stats - Get campaign stats
router.get('/stats', campaignManagerController.getCampaignStats);

// GET /api/campaigns/meta - Get Meta (Facebook/Instagram) campaigns
router.get('/meta', campaignController.getMetaCampaigns);

// GET /api/campaigns/google - Get Google Ads campaigns
router.get('/google', campaignController.getGoogleCampaigns);

// GET /api/campaigns/performance - Get performance comparison
router.get('/performance/compare', campaignController.getPerformanceComparison);

// POST /api/campaigns - Create new campaign
router.post('/', campaignManagerController.createCampaign);

// GET /api/campaigns/:id - Get single campaign details
router.get('/:id', campaignManagerController.getCampaignById);

// PUT /api/campaigns/:id - Update campaign
router.put('/:id', campaignManagerController.updateCampaign);

// DELETE /api/campaigns/:id - Delete campaign
router.delete('/:id', campaignManagerController.deleteCampaign);

// PATCH /api/campaigns/:id/status - Update campaign status
router.patch('/:id/status', campaignManagerController.updateStatus);

// POST /api/campaigns/:id/ai-suggestion - Add AI suggestion
router.post('/:id/ai-suggestion', campaignManagerController.addAiSuggestion);

module.exports = router;

