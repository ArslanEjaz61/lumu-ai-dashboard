const express = require('express');
const router = express.Router();
const triggerController = require('../controllers/triggerController');

// Trigger rules endpoints
router.get('/', triggerController.getRules);
router.post('/', triggerController.createRule);
router.put('/:id', triggerController.updateRule);
router.delete('/:id', triggerController.deleteRule);
router.post('/:id/toggle', triggerController.toggleRule);
router.post('/:id/trigger', triggerController.triggerRule);

// Weather & Events
router.get('/weather', triggerController.getWeather);
router.get('/events', triggerController.getEvents);
router.post('/events', triggerController.upsertEvent);

module.exports = router;
