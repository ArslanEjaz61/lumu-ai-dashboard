const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./src/models/User');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/lumu_dashboard';

async function removeOldUsers() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        const result = await User.deleteMany({ email: { $regex: /@lumu\.ai$/ } });
        console.log(`✅ Deleted ${result.deletedCount} old users with @lumu.ai email`);

    } catch (error) {
        console.error('❌ Deletion Error:', error);
    } finally {
        await mongoose.disconnect();
    }
}

removeOldUsers();
