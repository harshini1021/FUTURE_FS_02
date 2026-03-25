// src/server.js
// Main entry point — Express app setup, middleware, routes, error handling

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');

const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const leadRoutes = require('./routes/leadRoutes');
const { errorHandler } = require('./middleware/errorHandler');

// ─── CONNECT DATABASE ─────────────────────────────────────────────────────────
connectDB();

// ─── CREATE APP ───────────────────────────────────────────────────────────────
const app = express();

// Trust proxy (required for rate limiting behind proxies like Railway/Vercel)
app.set('trust proxy', 1);

// ─── SECURITY MIDDLEWARE ──────────────────────────────────────────────────────

// Set security HTTP headers
app.use(helmet());

// CORS — allow requests from frontend
app.use(cors({
  origin: function (origin, callback) {
    // Dynamically allow any origin (perfect for Vercel deployments and local testing)
    callback(null, true);
  },
  credentials: true, // allow cookies
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Rate limiting — prevent brute force / DDoS
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.' },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // stricter for auth endpoints
  message: { success: false, message: 'Too many login attempts, try again in 15 minutes.' },
});

app.use('/api/', globalLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// ─── GENERAL MIDDLEWARE ───────────────────────────────────────────────────────

app.use(express.json({ limit: '10kb' })); // Parse JSON bodies, limit size
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser()); // Parse cookies (for JWT httpOnly cookies)

// HTTP request logging (only in development)
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// ─── HEALTH CHECK ─────────────────────────────────────────────────────────────

app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'LeadFlow CRM API is running',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// ─── ROUTES ───────────────────────────────────────────────────────────────────

app.use('/api/auth',  authRoutes);
app.use('/api/leads', leadRoutes);

// ─── 404 HANDLER ─────────────────────────────────────────────────────────────

app.all('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

// ─── GLOBAL ERROR HANDLER ─────────────────────────────────────────────────────

app.use(errorHandler);

// ─── START SERVER ─────────────────────────────────────────────────────────────

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`  🚀 LeadFlow CRM API`);
  console.log(`  📡 http://localhost:${PORT}`);
  console.log(`  🌍 ENV: ${process.env.NODE_ENV || 'development'}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Rejection:', err.message);
  server.close(() => process.exit(1));
});

module.exports = app;
