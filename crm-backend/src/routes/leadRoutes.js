// src/routes/leadRoutes.js

const express = require('express');
const router = express.Router();
const leadController = require('../controllers/leadController');
const { protect, restrictTo } = require('../middleware/auth');
const { createLeadRules, updateLeadRules, addNoteRules, mongoIdRule } = require('../middleware/validate');

// ── Public: Website contact form → creates a lead ─────────────────────────────
router.post('/public/submit', leadController.publicSubmitLead);

// ── All routes below require login ────────────────────────────────────────────
router.use(protect);

// Dashboard stats
router.get('/stats', leadController.getDashboardStats);

// Core CRUD
router.route('/')
  .get(leadController.getLeads)
  .post(createLeadRules, leadController.createLead);

router.route('/:id')
  .get(mongoIdRule('id'), leadController.getLead)
  .put(mongoIdRule('id'), updateLeadRules, leadController.updateLead)
  .patch(mongoIdRule('id'), updateLeadRules, leadController.updateLead)
  .delete(mongoIdRule('id'), restrictTo('admin', 'manager'), leadController.deleteLead);

// Status update (convenience endpoint)
router.patch('/:id/status', mongoIdRule('id'), leadController.updateStatus);

// Notes
router.post('/:id/notes',           mongoIdRule('id'), addNoteRules, leadController.addNote);
router.delete('/:id/notes/:noteId', mongoIdRule('id'), leadController.deleteNote);

module.exports = router;
