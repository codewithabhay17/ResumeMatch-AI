const authService = require('../services/auth.service');
const { validateRegisterInput, validateLoginInput, sanitizeString } = require('../utils/validation');

/**
 * Register controller
 */
async function registerController(req, res) {
  try {
    const { email, name, password, confirmPassword } = req.body;

    // Validate input
    const validation = validateRegisterInput(email, name, password, confirmPassword);
    if (!validation.isValid) {
      return res.status(400).json({
        status: 'error',
        message: validation.errors[0],
        errors: validation.errors,
      });
    }

    const user = await authService.register(
      sanitizeString(email),
      sanitizeString(name),
      password
    );

    res.status(201).json({
      status: 'success',
      message: 'User registered successfully',
      data: user,
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message,
    });
  }
}

/**
 * Login controller
 */
async function loginController(req, res) {
  try {
    const { email, password } = req.body;

    // Validate input
    const validation = validateLoginInput(email, password);
    if (!validation.isValid) {
      return res.status(400).json({
        status: 'error',
        message: validation.errors[0],
        errors: validation.errors,
      });
    }

    const result = await authService.login(
      sanitizeString(email),
      password
    );

    res.status(200).json({
      status: 'success',
      message: 'Login successful',
      data: result,
    });
  } catch (error) {
    res.status(401).json({
      status: 'error',
      message: error.message,
    });
  }
}

/**
 * Get current user controller
 */
async function getCurrentUserController(req, res) {
  try {
    const user = await authService.getUserById(req.user.id);

    res.status(200).json({
      status: 'success',
      data: user,
    });
  } catch (error) {
    res.status(404).json({
      status: 'error',
      message: error.message,
    });
  }
}

module.exports = {
  registerController,
  loginController,
  getCurrentUserController,
};
