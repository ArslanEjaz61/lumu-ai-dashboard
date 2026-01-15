const express = require('express');
const router = express.Router();
const budgetController = require('../controllers/budgetController');

// Budget endpoints
router.get('/allocation', budgetController.getAllocation);
router.put('/allocation', budgetController.updateAllocation);
router.get('/recommendations', budgetController.getRecommendations);
router.post('/recommendations', budgetController.createRecommendation);
router.post('/apply-recommendation', budgetController.applyRecommendation);
router.post('/hourly-spend', budgetController.updateHourlySpend);

module.exports = router;
