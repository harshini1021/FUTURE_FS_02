// src/utils/seed.js
// Run: npm run seed
// Creates the first admin user and sample leads

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Lead = require('../models/Lead');
const connectDB = require('../config/db');

const sampleLeads = [
  { firstName: 'Priya',    lastName: 'Sharma',    email: 'priya@techsolutions.in',  company: 'Tech Solutions',  phone: '+91 98001 12345', source: 'web',      status: 'new',       priority: 'high' },
  { firstName: 'Arjun',    lastName: 'Mehta',     email: 'arjun@startup.io',         company: 'StartupIO',       phone: '+91 98002 23456', source: 'social',   status: 'contacted', priority: 'medium' },
  { firstName: 'Sarah',    lastName: 'Johnson',   email: 'sarah@globalcorp.com',      company: 'Global Corp',     phone: '+1 555 0134',     source: 'referral', status: 'converted', priority: 'high' },
  { firstName: 'Mohammed', lastName: 'Al-Hassan', email: 'm.hassan@ventures.ae',      company: 'AE Ventures',     phone: '+971 50 123 4567',source: 'cold',     status: 'new',       priority: 'low' },
  { firstName: 'Divya',    lastName: 'Nair',      email: 'divya@kerala.com',          company: 'Kerala Spices',   phone: '+91 98003 34567', source: 'web',      status: 'contacted', priority: 'medium' },
  { firstName: 'Ravi',     lastName: 'Patel',     email: 'ravi@patel.co',             company: 'Patel & Co',      phone: '+91 98004 45678', source: 'referral', status: 'converted', priority: 'high' },
  { firstName: 'Emma',     lastName: 'Wilson',    email: 'emma@ukdigital.co.uk',      company: 'UK Digital',      phone: '+44 7911 123456', source: 'social',   status: 'lost',      priority: 'low' },
];

const seed = async () => {
  try {
    await connectDB();
    console.log('\n🌱 Starting database seed...\n');

    // Clear existing data
    await Promise.all([User.deleteMany(), Lead.deleteMany()]);
    console.log('🗑  Cleared existing data');

    // Create admin user
    const admin = await User.create({
      name: 'Admin User',
      email: process.env.SEED_ADMIN_EMAIL || 'admin@leadflow.com',
      password: process.env.SEED_ADMIN_PASSWORD || 'Admin@1234',
      role: 'admin',
    });
    console.log(`👤 Admin created: ${admin.email} / password: ${process.env.SEED_ADMIN_PASSWORD || 'Admin@1234'}`);

    // Create sample leads (assigned to admin)
    const leadsWithOwner = sampleLeads.map(l => ({
      ...l,
      assignedTo: admin._id,
      statusHistory: [{ from: null, to: l.status, changedBy: admin._id, changedByName: admin.name }],
      notes: l.status !== 'new' ? [{ text: 'Initial follow-up completed.', addedBy: admin._id, addedByName: admin.name }] : [],
    }));

    const leads = await Lead.insertMany(leadsWithOwner);
    console.log(`📋 ${leads.length} sample leads created`);

    console.log('\n✅ Seed complete!\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`  Admin Email:    ${admin.email}`);
    console.log(`  Admin Password: ${process.env.SEED_ADMIN_PASSWORD || 'Admin@1234'}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
    process.exit(1);
  }
};

seed();
