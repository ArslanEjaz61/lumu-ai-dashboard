const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Get all users
router.get('/', userController.getAllUsers);

// Get user by ID
router.get('/:id', userController.getUserById);

// Create user
router.post('/', userController.createUser);

// Update user
router.put('/:id', userController.updateUser);

// Update password
router.put('/:id/password', userController.updatePassword);

// Delete user
router.delete('/:id', userController.deleteUser);

// Login
router.post('/login', userController.login);

module.exports = router;
