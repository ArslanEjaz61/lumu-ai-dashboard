const express = require('express');
const router = express.Router();
const publishController = require('../controllers/publishController');

// Publish endpoints
router.post('/', publishController.publishAd);
router.post('/schedule', publishController.scheduleAd);
router.get('/history', publishController.getHistory);
router.get('/stats', publishController.getStats);
router.get('/creatives', publishController.getCreatives);
router.post('/sync-all', publishController.syncAllMetrics);  // Sync all active ads
router.get('/:id', publishController.getPublishedAd);
router.put('/:id/status', publishController.updateStatus);
router.patch('/:id/platform-status', publishController.updatePlatformStatus);
router.put('/:id/metrics', publishController.updateMetrics);
router.post('/:id/sync', publishController.syncMetrics);  // Sync single ad

module.exports = router;
