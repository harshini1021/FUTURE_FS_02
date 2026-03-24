// src/middleware/validate.js
// Request validation using express-validator

const { body, param, query, validationResult } = require('express-validator');

// ─── HELPER: Run validation and return errors ─────────────────────────────────

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(e => ({ field: e.path, message: e.msg })),
    });
  }
  next();
};

// ─── AUTH RULES ───────────────────────────────────────────────────────────────

const registerRules = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ max: 60 }).withMessage('Name too long'),
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Must be a valid email')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('Password must contain uppercase, lowercase, and a number'),
  body('role')
    .optional()
    .isIn(['admin', 'manager', 'viewer']).withMessage('Invalid role'),
  validate,
];

const loginRules = [
  body('email').trim().notEmpty().withMessage('Email is required').isEmail().normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
  validate,
];

// ─── LEAD RULES ───────────────────────────────────────────────────────────────

const createLeadRules = [
  body('firstName').trim().notEmpty().withMessage('First name is required').isLength({ max: 50 }),
  body('lastName').trim().optional().isLength({ max: 50 }),
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Must be a valid email')
    .normalizeEmail(),
  body('phone').optional().trim(),
  body('company').optional().trim().isLength({ max: 100 }),
  body('message').optional().trim().isLength({ max: 2000 }),
  body('source').optional().isIn(['web', 'social', 'referral', 'cold', 'email', 'other']),
  body('status').optional().isIn(['new', 'contacted', 'qualified', 'converted', 'lost']),
  body('priority').optional().isIn(['low', 'medium', 'high']),
  validate,
];

const updateLeadRules = [
  body('firstName').optional().trim().notEmpty().isLength({ max: 50 }),
  body('lastName').optional().trim().isLength({ max: 50 }),
  body('email').optional().trim().isEmail().normalizeEmail(),
  body('source').optional().isIn(['web', 'social', 'referral', 'cold', 'email', 'other']),
  body('status').optional().isIn(['new', 'contacted', 'qualified', 'converted', 'lost']),
  body('priority').optional().isIn(['low', 'medium', 'high']),
  validate,
];

const addNoteRules = [
  body('text').trim().notEmpty().withMessage('Note text is required').isLength({ max: 1000 }),
  validate,
];

const mongoIdRule = (paramName = 'id') => [
  param(paramName).isMongoId().withMessage(`Invalid ${paramName}`),
  validate,
];

module.exports = {
  registerRules,
  loginRules,
  createLeadRules,
  updateLeadRules,
  addNoteRules,
  mongoIdRule,
};
