const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');

// Get settings
router.get('/', settingsController.getSettings);

// Update settings
router.put('/', settingsController.updateSettings);

// Get branding only (for sidebar/header)
router.get('/branding', settingsController.getBranding);

// Test connection
router.post('/test/:platform', settingsController.testConnection);

// User management
router.post('/users', settingsController.addUser);
router.put('/users/:userId', settingsController.updateUser);
router.delete('/users/:userId', settingsController.deleteUser);

module.exports = router;
