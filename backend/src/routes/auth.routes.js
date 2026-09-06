const express = require('express');
const router = express.Router();
const { registerController, loginController, getCurrentUserController } = require('../controllers/auth.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { validateRequestBody } = require('../utils/validation');

// Public routes with validation
router.post('/register', validateRequestBody, registerController);
router.post('/login', validateRequestBody, loginController);

// Protected routes
router.get('/profile', authenticate, getCurrentUserController);

module.exports = router;
