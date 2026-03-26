// src/controllers/leadController.js
// Full CRUD + notes + status management for leads

const Lead = require('../models/Lead');
const { AppError } = require('../middleware/errorHandler');

// ─── HELPERS ─────────────────────────────────────────────────────────────────

const buildQuery = (queryParams, userId) => {
  const filter = { isArchived: false };
  const { status, source, priority, assignedTo, search, startDate, endDate } = queryParams;

  if (status) filter.status = status;
  if (source) filter.source = source;
  if (priority) filter.priority = priority;
  
  // Enforce user-specific filtering unless it's a specific assignedTo request
  // (In our case, we want users to see only their own leads by default)
  if (assignedTo) {
    filter.assignedTo = assignedTo;
  } else if (userId) {
    filter.assignedTo = userId;
  }

  // Date range filter
  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) filter.createdAt.$gte = new Date(startDate);
    if (endDate) filter.createdAt.$lte = new Date(endDate);
  }

  // Text search (uses MongoDB text index)
  if (search) {
    filter.$text = { $search: search };
  }

  return filter;
};

// ─── GET ALL LEADS ────────────────────────────────────────────────────────────

exports.getLeads = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 20);
    const skip = (page - 1) * limit;
    const sortBy = req.query.sortBy || '-createdAt';

    const filter = buildQuery(req.query, req.user._id);

    const [leads, total] = await Promise.all([
      Lead.find(filter)
        .sort(sortBy)
        .skip(skip)
        .limit(limit)
        .populate('assignedTo', 'name email')
        .populate('notes.addedBy', 'name')
        .lean({ virtuals: true }),
      Lead.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: {
        leads,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─── GET SINGLE LEAD ──────────────────────────────────────────────────────────

exports.getLead = async (req, res, next) => {
  try {
    const lead = await Lead.findById(req.params.id)
      .populate('assignedTo', 'name email')
      .populate('notes.addedBy', 'name email')
      .populate('statusHistory.changedBy', 'name');

    if (!lead) return next(new AppError('Lead not found', 404));

    res.status(200).json({ success: true, data: { lead } });
  } catch (error) {
    next(error);
  }
};

// ─── CREATE LEAD ──────────────────────────────────────────────────────────────

exports.createLead = async (req, res, next) => {
  try {
    const leadData = { ...req.body };

    // If a note was passed at creation, format it
    if (leadData.initialNote) {
      leadData.notes = [{
        text: leadData.initialNote,
        addedBy: req.user._id,
        addedByName: req.user.name,
      }];
      delete leadData.initialNote;
    }

    // Auto-assign to creator if not specified
    if (!leadData.assignedTo) {
      leadData.assignedTo = req.user._id;
    }

    // Record initial status in history
    leadData.statusHistory = [{
      from: null,
      to: leadData.status || 'new',
      changedBy: req.user._id,
      changedByName: req.user.name,
    }];

    const lead = await Lead.create(leadData);

    res.status(201).json({
      success: true,
      message: 'Lead created successfully',
      data: { lead },
    });
  } catch (error) {
    next(error);
  }
};

// ─── UPDATE LEAD ──────────────────────────────────────────────────────────────

exports.updateLead = async (req, res, next) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) return next(new AppError('Lead not found', 404));

    // Track status change
    if (req.body.status && req.body.status !== lead.status) {
      lead.statusHistory.push({
        from: lead.status,
        to: req.body.status,
        changedBy: req.user._id,
        changedByName: req.user.name,
      });
    }

    // Update allowed fields
    const allowedFields = [
      'firstName', 'lastName', 'email', 'phone', 'company', 'message',
      'source', 'status', 'priority', 'assignedTo', 'followUpDate', 'tags',
    ];
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) lead[field] = req.body[field];
    });

    await lead.save();

    res.status(200).json({
      success: true,
      message: 'Lead updated successfully',
      data: { lead },
    });
  } catch (error) {
    next(error);
  }
};

// ─── UPDATE STATUS (dedicated endpoint) ──────────────────────────────────────

exports.updateStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const validStatuses = ['new', 'contacted', 'qualified', 'converted', 'lost'];

    if (!validStatuses.includes(status)) {
      return next(new AppError(`Invalid status. Must be one of: ${validStatuses.join(', ')}`, 400));
    }

    const lead = await Lead.findById(req.params.id);
    if (!lead) return next(new AppError('Lead not found', 404));

    const previousStatus = lead.status;
    lead.status = status;
    lead.statusHistory.push({
      from: previousStatus,
      to: status,
      changedBy: req.user._id,
      changedByName: req.user.name,
    });

    await lead.save();

    res.status(200).json({
      success: true,
      message: `Status updated: ${previousStatus} → ${status}`,
      data: { lead },
    });
  } catch (error) {
    next(error);
  }
};

// ─── DELETE LEAD ──────────────────────────────────────────────────────────────

exports.deleteLead = async (req, res, next) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) return next(new AppError('Lead not found', 404));

    // Soft delete: archive instead of actually deleting
    lead.isArchived = true;
    await lead.save();

    res.status(200).json({
      success: true,
      message: 'Lead archived successfully',
    });
  } catch (error) {
    next(error);
  }
};

// ─── ADD NOTE ─────────────────────────────────────────────────────────────────

exports.addNote = async (req, res, next) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) return next(new AppError('Lead not found', 404));

    lead.notes.push({
      text: req.body.text,
      addedBy: req.user._id,
      addedByName: req.user.name,
    });

    await lead.save();

    res.status(201).json({
      success: true,
      message: 'Note added',
      data: { notes: lead.notes },
    });
  } catch (error) {
    next(error);
  }
};

// ─── DELETE NOTE ──────────────────────────────────────────────────────────────

exports.deleteNote = async (req, res, next) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) return next(new AppError('Lead not found', 404));

    const note = lead.notes.id(req.params.noteId);
    if (!note) return next(new AppError('Note not found', 404));

    // Only the note author or admin can delete
    if (note.addedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return next(new AppError('Not authorized to delete this note', 403));
    }

    note.deleteOne();
    await lead.save();

    res.status(200).json({ success: true, message: 'Note deleted' });
  } catch (error) {
    next(error);
  }
};

// ─── GET DASHBOARD STATS ──────────────────────────────────────────────────────

exports.getDashboardStats = async (req, res, next) => {
  try {
    // Last 5 leads
    const [statusStats, sourceStats, dailyStats, recentLeads, totalLeads, recentActivity, valueStats] = await Promise.all([
      // ... existing aggregates ...
      Lead.aggregate([
        { $match: { isArchived: false, assignedTo: req.user._id } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      Lead.aggregate([
        { $match: { isArchived: false, assignedTo: req.user._id } },
        { $group: { _id: '$source', count: { $sum: 1 } } },
      ]),
      Lead.aggregate([
        { 
          $match: { 
            isArchived: false, 
            assignedTo: req.user._id,
            createdAt: { $gte: new Date(new Date().setDate(new Date().getDate() - 7)) } 
          } 
        },
        { 
          $group: { 
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, 
            count: { $sum: 1 } 
          } 
        },
        { $sort: { _id: 1 } }
      ]),
      Lead.find({ isArchived: false, assignedTo: req.user._id })
        .sort('-createdAt')
        .limit(5)
        .select('firstName lastName email status source leadValue createdAt')
        .lean(),
      Lead.countDocuments({ isArchived: false, assignedTo: req.user._id }),
      // NEW: Recent Activity (Status changes + Notes)
      Lead.aggregate([
        { $match: { isArchived: false, assignedTo: req.user._id } },
        {
          $project: {
            activities: {
              $concatArrays: [
                {
                  $map: {
                    input: "$statusHistory",
                    as: "h",
                    in: {
                      type: "status_change",
                      leadId: "$_id",
                      leadName: { $concat: ["$firstName", " ", "$lastName"] },
                      from: "$$h.from",
                      to: "$$h.to",
                      user: "$$h.changedByName",
                      timestamp: "$$h.createdAt"
                    }
                  }
                },
                {
                  $map: {
                    input: "$notes",
                    as: "n",
                    in: {
                      type: "note_added",
                      leadId: "$_id",
                      leadName: { $concat: ["$firstName", " ", "$lastName"] },
                      text: "$$n.text",
                      user: "$$n.addedByName",
                      timestamp: "$$n.createdAt"
                    }
                  }
                }
              ]
            }
          }
        },
        { $unwind: "$activities" },
        { $sort: { "activities.timestamp": -1 } },
        { $limit: 10 },
        { $replaceRoot: { newRoot: "$activities" } }
      ]),
      // NEW: Total Pipeline Value
      Lead.aggregate([
        { $match: { isArchived: false, assignedTo: req.user._id } },
        { $group: { _id: null, totalValue: { $sum: '$leadValue' } } }
      ])
    ]);

    // Shape status counts into a map
    const byStatus = statusStats.reduce((acc, s) => {
      acc[s._id] = s.count;
      return acc;
    }, {});

    const converted = byStatus.converted || 0;
    const conversionRate = totalLeads > 0 ? ((converted / totalLeads) * 100).toFixed(1) : 0;

    res.status(200).json({
      success: true,
      data: {
        overview: {
          total: totalLeads,
          new: byStatus.new || 0,
          contacted: byStatus.contacted || 0,
          qualified: byStatus.qualified || 0,
          converted,
          lost: byStatus.lost || 0,
          conversionRate: `${conversionRate}%`,
          totalPipelineValue: valueStats[0]?.totalValue || 0,
        },
        bySource: sourceStats.reduce((acc, s) => { acc[s._id] = s.count; return acc; }, {}),
        leadsPerDay: dailyStats.map(d => ({ date: d._id, leads: d.count })),
        recentLeads,
        recentActivity,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─── PUBLIC: Receive contact form submission ──────────────────────────────────

exports.publicSubmitLead = async (req, res, next) => {
  try {
    const { firstName, lastName, email, phone, company, message } = req.body;

    if (!firstName || !email) {
      return next(new AppError('First name and email are required', 400));
    }

    const lead = await Lead.create({
      firstName,
      lastName: lastName || '',
      email,
      phone: phone || '',
      company: company || '',
      message: message || '',
      source: 'web',
      status: 'new',
    });

    res.status(201).json({
      success: true,
      message: 'Thank you! We will get back to you soon.',
      data: { id: lead._id },
    });
  } catch (error) {
    next(error);
  }
};
