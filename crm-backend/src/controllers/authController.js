// src/controllers/authController.js
// Register, Login, Refresh Token, Logout, Get Me, Change Password

const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const { AppError } = require('../middleware/errorHandler');

// ─── HELPERS ─────────────────────────────────────────────────────────────────

const sendTokenResponse = async (user, statusCode, res, message = 'Success') => {
  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  // Store hashed refresh token in DB (for rotation + invalidation)
  const hashedRefresh = crypto.createHash('sha256').update(refreshToken).digest('hex');
  user.refreshTokens = [...(user.refreshTokens || []).slice(-4), hashedRefresh]; // keep last 5
  user.lastLogin = Date.now();
  await user.save({ validateBeforeSave: false });

  // Cookie options
  const isProd = process.env.NODE_ENV === 'production';
  const cookieOptions = {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax', // Use 'none' for cross-domain in prod
  };

  res
    .cookie('accessToken', accessToken, { ...cookieOptions, maxAge: 15 * 60 * 1000 })       // 15m
    .cookie('refreshToken', refreshToken, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 * 1000 }) // 7d
    .status(statusCode)
    .json({
      success: true,
      message,
      data: {
        user: user.toPublicJSON(),
        accessToken,
        refreshToken,
      },
    });
};

// ─── REGISTER ─────────────────────────────────────────────────────────────────

exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    // Only allow creating non-admin users unless first user (no users exist yet)
    const userCount = await User.countDocuments();
    const assignedRole = userCount === 0 ? 'admin' : (role || 'viewer');

    const user = await User.create({ name, email, password, role: assignedRole });
    await sendTokenResponse(user, 201, res, 'Account created successfully');
  } catch (error) {
    next(error);
  }
};

// ─── LOGIN ────────────────────────────────────────────────────────────────────

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user and explicitly select password (hidden by default)
    const user = await User.findOne({ email }).select('+password +refreshTokens');

    if (!user || !(await user.comparePassword(password))) {
      return next(new AppError('Invalid email or password', 401));
    }

    if (!user.isActive) {
      return next(new AppError('Account deactivated. Contact admin.', 403));
    }

    await sendTokenResponse(user, 200, res, 'Logged in successfully');
  } catch (error) {
    next(error);
  }
};

// ─── REFRESH TOKEN ────────────────────────────────────────────────────────────

exports.refreshToken = async (req, res, next) => {
  try {
    const token = req.cookies?.refreshToken || req.body?.refreshToken;

    if (!token) {
      return next(new AppError('No refresh token provided', 401));
    }

    // Verify refresh token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    } catch {
      return next(new AppError('Invalid or expired refresh token', 401));
    }

    // Check token is in our DB (rotation check)
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findById(decoded.id).select('+refreshTokens');

    if (!user || !user.refreshTokens.includes(hashedToken)) {
      return next(new AppError('Refresh token revoked. Please log in again.', 401));
    }

    // Remove used refresh token (rotation)
    user.refreshTokens = user.refreshTokens.filter(t => t !== hashedToken);
    await sendTokenResponse(user, 200, res, 'Token refreshed');
  } catch (error) {
    next(error);
  }
};

// ─── LOGOUT ───────────────────────────────────────────────────────────────────

exports.logout = async (req, res, next) => {
  try {
    const token = req.cookies?.refreshToken || req.body?.refreshToken;

    if (token) {
      const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
      const user = await User.findById(req.user._id).select('+refreshTokens');
      if (user) {
        user.refreshTokens = user.refreshTokens.filter(t => t !== hashedToken);
        await user.save({ validateBeforeSave: false });
      }
    }

    res
      .clearCookie('accessToken')
      .clearCookie('refreshToken')
      .status(200)
      .json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
};

// ─── GET ME ───────────────────────────────────────────────────────────────────

exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    res.status(200).json({
      success: true,
      data: { user: user.toPublicJSON() },
    });
  } catch (error) {
    next(error);
  }
};

// ─── CHANGE PASSWORD ──────────────────────────────────────────────────────────

exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return next(new AppError('Both current and new password required', 400));
    }
    if (newPassword.length < 8) {
      return next(new AppError('New password must be at least 8 characters', 400));
    }

    const user = await User.findById(req.user._id).select('+password +refreshTokens');

    if (!(await user.comparePassword(currentPassword))) {
      return next(new AppError('Current password is incorrect', 401));
    }

    user.password = newPassword;
    user.refreshTokens = []; // invalidate all sessions
    await user.save();

    await sendTokenResponse(user, 200, res, 'Password changed successfully');
  } catch (error) {
    next(error);
  }
};

// ─── GET ALL USERS ─────────────────────────────────────────────────────────────

exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find({ isActive: true }).select('name email role');
    res.status(200).json({
      success: true,
      data: { users },
    });
  } catch (error) {
    next(error);
  }
};
