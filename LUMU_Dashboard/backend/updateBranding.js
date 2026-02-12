const mongoose = require('mongoose');
require('dotenv').config();
const Settings = require('./src/models/Settings');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/lumu_dashboard';

async function updateBranding() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        const settings = await Settings.getSettings();
        settings.branding = {
            dashboardName: 'Bambly AI',
            tagline: 'AI Marketing OS',
            logoUrl: '',
            primaryColor: '#10b981'
        };
        await settings.save();
        console.log('✅ Branding updated to Bambly AI');

    } catch (error) {
        console.error('❌ Update Error:', error);
    } finally {
        await mongoose.disconnect();
    }
}

updateBranding();
