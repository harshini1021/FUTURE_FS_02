// src/routes/authRoutes.js

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { registerRules, loginRules } = require('../middleware/validate');

// Public routes
router.post('/register', registerRules, authController.register);
router.post('/login',    loginRules,    authController.login);
router.post('/refresh',                authController.refreshToken);

// Protected routes (must be logged in)
router.use(protect);
router.post('/logout',          authController.logout);
router.get('/me',               authController.getMe);
router.patch('/change-password', authController.changePassword);

module.exports = router;
