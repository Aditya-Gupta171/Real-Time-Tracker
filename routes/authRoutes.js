import express from 'express';
import { registerUser, loginUser } from '../controllers/authController.js';
import { body, validationResult } from 'express-validator';

const router = express.Router();

// Validation middleware
const validateUser = [
    body('username').notEmpty().withMessage('Username is required'),
    body('email').isEmail().withMessage('Invalid email address'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];

// Routes
router.post('/register', validateUser, registerUser);
router.post('/login', validateUser, loginUser);

export default router;
