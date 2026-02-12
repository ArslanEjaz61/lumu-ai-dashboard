// Seed script to create demo users
// Run with: node src/scripts/seedUsers.js

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/lumu_dashboard';

const demoUsers = [
    {
        name: 'Admin User',
        email: 'admin@bambly.ai',
        password: 'admin123',
        role: 'admin',
        department: 'Management',
        active: true
    },
    {
        name: 'Marketing Manager',
        email: 'manager@bambly.ai',
        password: 'manager123',
        role: 'manager',
        department: 'Marketing',
        active: true
    },
    {
        name: 'Marketing Analyst',
        email: 'analyst@bambly.ai',
        password: 'analyst123',
        role: 'viewer',
        department: 'Analytics',
        active: true
    }
];

async function seedUsers() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        for (const userData of demoUsers) {
            // Check if user exists
            const existingUser = await User.findOne({ email: userData.email });

            if (existingUser) {
                console.log(`⏭️  User ${userData.email} already exists, skipping...`);
            } else {
                await User.create(userData);
                console.log(`✅ Created user: ${userData.email} (password: ${userData.password})`);
            }
        }

        console.log('\n🎉 Demo users seeded successfully!');
        console.log('\nLogin Credentials:');
        console.log('═══════════════════════════════════════');
        demoUsers.forEach(u => {
            console.log(`${u.role.toUpperCase().padEnd(10)} | ${u.email} | ${u.password}`);
        });
        console.log('═══════════════════════════════════════');

    } catch (error) {
        console.error('❌ Seed Error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('\n📤 Disconnected from MongoDB');
    }
}

seedUsers();
