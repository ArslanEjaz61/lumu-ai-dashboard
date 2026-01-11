const express = require('express');
const router = express.Router();
const publishController = require('../controllers/publishController');

// Publish endpoints
router.post('/', publishController.publishAd);
router.post('/schedule', publishController.scheduleAd);
router.get('/history', publishController.getHistory);

module.exports = router;
