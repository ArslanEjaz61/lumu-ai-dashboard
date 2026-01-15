const express = require('express');
const router = express.Router();
const campaignController = require('../controllers/campaignManagerController');

// Get campaign stats
router.get('/stats', campaignController.getCampaignStats);

// Get all campaigns
router.get('/', campaignController.getAllCampaigns);

// Get campaign by ID
router.get('/:id', campaignController.getCampaignById);

// Create campaign
router.post('/', campaignController.createCampaign);

// Update campaign
router.put('/:id', campaignController.updateCampaign);

// Update campaign status
router.patch('/:id/status', campaignController.updateStatus);

// Add AI suggestion
router.post('/:id/ai-suggestion', campaignController.addAiSuggestion);

// Delete campaign
router.delete('/:id', campaignController.deleteCampaign);

module.exports = router;
