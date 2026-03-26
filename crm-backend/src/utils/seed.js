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

    // 0. Clear existing leads
    await Lead.deleteMany({});
    console.log('🗑️ Existing leads cleared.');

    // 1. Find or create specific demo admin user
    let admin = await User.findOne({ email: 'admin@leadflow.com' });
    if (!admin) {
      console.log('👤 Demo admin not found, creating...');
      admin = await User.create({
        name: 'Admin User',
        email: 'admin@leadflow.com',
        password: 'Admin@1234',
        role: 'admin',
      });
    } else {
      console.log('👤 Demo admin exists, resetting password for consistency...');
      admin.password = 'Admin@1234';
      admin.role = 'admin'; // ensure it's admin
      await admin.save();
    }
    console.log(`👤 Demo admin ready: ${admin.email}`);

    // 2. Prepare sample leads with random dates for the dashboard chart
    const leadsWithOwner = [
      { firstName: 'James', lastName: 'Wilson', email: 'j.wilson@brighttech.com', company: 'BrightTech Solutions', source: 'web', status: 'new', priority: 'high' },
      { firstName: 'Sarah', lastName: 'Chen', email: 'schen@innovate.io', company: 'Innovate AI', source: 'referral', status: 'contacted', priority: 'medium' },
      { firstName: 'Michael', lastName: 'Rodriguez', email: 'm.rod@globex.org', company: 'Globex Corp', source: 'social', status: 'qualified', priority: 'high' },
      { firstName: 'Emma', lastName: 'Thompson', email: 'emma.t@nexus.net', company: 'Nexus Logistics', source: 'cold', status: 'new', priority: 'low' },
      { firstName: 'David', lastName: 'Kim', email: 'david.kim@quantum.co', company: 'Quantum Systems', source: 'email', status: 'converted', priority: 'medium' },
      { firstName: 'Olivia', lastName: 'Garcia', email: 'olivia@pixelperfect.com', company: 'PixelPerfect Design', source: 'web', status: 'contacted', priority: 'high' },
      { firstName: 'William', lastName: 'Brown', email: 'w.brown@steelworks.com', company: 'Steelworks Manufacturing', source: 'referral', status: 'lost', priority: 'low' },
      { firstName: 'Sophia', lastName: 'Patel', email: 'spatel@zenith.edu', company: 'Zenith Education', source: 'social', status: 'new', priority: 'medium' },
      { firstName: 'Lucas', lastName: 'Müller', email: 'lucas.m@berlintech.de', company: 'BerlinTech', source: 'web', status: 'qualified', priority: 'high' },
      { firstName: 'Mia', lastName: 'Davis', email: 'mia.d@cloudscale.com', company: 'CloudScale Inc', source: 'cold', status: 'contacted', priority: 'medium' },
      { firstName: 'Alexander', lastName: 'Wright', email: 'alex@wrightlegal.com', company: 'Wright Legal Group', source: 'referral', status: 'converted', priority: 'medium' },
      { firstName: 'Isabella', lastName: 'Lopez', email: 'isabella@fiestafoods.com', company: 'Fiesta Foods', source: 'social', status: 'new', priority: 'low' },
      { firstName: 'Ethan', lastName: 'Hunt', email: 'ethan.h@impossible.org', company: 'Impossible Missions', source: 'web', status: 'lost', priority: 'high' },
      { firstName: 'Charlotte', lastName: 'Evans', email: 'charlotte@evansrealty.com', company: 'Evans Realty', source: 'email', status: 'contacted', priority: 'medium' },
      { firstName: 'Noah', lastName: 'Miller', email: 'noah@craftbrew.co', company: 'CraftBrew Co', source: 'referral', status: 'new', priority: 'medium' }
    ].map(l => {
      const daysAgo = Math.floor(Math.random() * 8); // Random date in last 7 days
      const date = new Date();
      date.setDate(date.getDate() - daysAgo);
      
      return {
        ...l,
        leadValue: Math.floor(Math.random() * 90000) + 10000, // Range: 10k - 100k
        assignedTo: admin._id,
        createdAt: date,
        updatedAt: date,
        statusHistory: [{ from: null, to: l.status, changedBy: admin._id, changedByName: admin.name, createdAt: date }],
        notes: l.status !== 'new' ? [{ text: 'Follow-up call completed.', addedBy: admin._id, addedByName: admin.name, createdAt: date }] : [],
      };
    });

    const leads = await Lead.insertMany(leadsWithOwner);
    console.log(`📋 ${leads.length} sample leads created successfully!`);

    console.log('\n✅ Seed complete!\n');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
    process.exit(1);
  }
};

seed();
