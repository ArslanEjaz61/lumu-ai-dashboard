const express = require('express');
const router = express.Router();
const creativeController = require('../controllers/adCreativeController');

// Get creative stats
router.get('/stats', creativeController.getCreativeStats);

// Get all creatives
router.get('/', creativeController.getAllCreatives);

// Get creative by ID
router.get('/:id', creativeController.getCreativeById);

// Create creative (Manual)
router.post('/', creativeController.createCreative);

// Generate AI creative
router.post('/generate-ai', creativeController.generateAiCreative);

// Update creative
router.put('/:id', creativeController.updateCreative);

// Update status
router.patch('/:id/status', creativeController.updateStatus);

// Set usage type (post/ad)
router.patch('/:id/usage', creativeController.setUsage);

// Schedule post
router.post('/:id/schedule', creativeController.schedulePost);

// Delete creative
router.delete('/:id', creativeController.deleteCreative);

module.exports = router;
