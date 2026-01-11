const express = require('express');
const router = express.Router();
const retargetingController = require('../controllers/retargetingController');

// Flows endpoints
router.get('/flows', retargetingController.getFlows);
router.post('/flows', retargetingController.createFlow);
router.put('/flows/:id', retargetingController.updateFlow);
router.delete('/flows/:id', retargetingController.deleteFlow);
router.post('/flows/:id/toggle', retargetingController.toggleFlow);
router.post('/flows/:id/metrics', retargetingController.updateFlowMetrics);

// Segments
router.get('/segments', retargetingController.getSegments);
router.post('/segments', retargetingController.upsertSegment);

// Activity
router.get('/activity', retargetingController.getActivity);
router.post('/activity', retargetingController.logActivity);

// Channels
router.get('/channels', retargetingController.getChannelPerformance);
router.post('/channels', retargetingController.updateChannelPerformance);

module.exports = router;
