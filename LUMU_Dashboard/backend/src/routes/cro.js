const express = require('express');
const router = express.Router();
const croController = require('../controllers/croController');

// CRO endpoints
router.get('/funnel', croController.getFunnel);
router.post('/funnel', croController.updateFunnelStage);
router.get('/alerts', croController.getAlerts);
router.post('/alerts', croController.createAlert);
router.post('/alerts/:id/resolve', croController.resolveAlert);
router.get('/suggestions', croController.getSuggestions);
router.post('/suggestions', croController.createSuggestion);
router.post('/apply-suggestion', croController.applySuggestion);
router.get('/pages', croController.getPagePerformance);
router.post('/pages', croController.updatePagePerformance);
router.post('/ab-tests', croController.upsertABTest);

module.exports = router;
