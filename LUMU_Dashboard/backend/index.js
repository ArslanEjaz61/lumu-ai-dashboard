require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
const morgan = require('morgan');

// Import routes
const analyticsRoutes = require('./src/routes/analytics');
const campaignRoutes = require('./src/routes/campaigns');
const audienceRoutes = require('./src/routes/audience');
const fraudRoutes = require('./src/routes/fraud');
const insightsRoutes = require('./src/routes/insights');
const geoRoutes = require('./src/routes/geo');
const settingsRoutes = require('./src/routes/settings');
const usersRoutes = require('./src/routes/users');
const campaignManagerRoutes = require('./src/routes/campaignManager');
const creativesRoutes = require('./src/routes/creatives');
const uploadRoutes = require('./src/routes/upload');
const publishRoutes = require('./src/routes/publish');
const budgetRoutes = require('./src/routes/budget');
const triggersRoutes = require('./src/routes/triggers');
const croRoutes = require('./src/routes/cro');
const retargetingRoutes = require('./src/routes/retargeting');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Morgan Logger - shows API calls in console
// Format: :method :url :status :response-time ms
app.use(morgan('dev'));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));


// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/lumu_dashboard')
    .then(() => console.log('✅ MongoDB Connected'))
    .catch(err => console.error('❌ MongoDB Connection Error:', err));

// Routes
app.use('/api/analytics', analyticsRoutes);
app.use('/api/campaigns', campaignRoutes);
app.use('/api/audience', audienceRoutes);
app.use('/api/fraud', fraudRoutes);
app.use('/api/insights', insightsRoutes);
app.use('/api/geo', geoRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/campaign-manager', campaignManagerRoutes);
app.use('/api/creatives', creativesRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/publish', publishRoutes);
app.use('/api/budget', budgetRoutes);
app.use('/api/triggers', triggersRoutes);
app.use('/api/cro', croRoutes);
app.use('/api/retargeting', retargetingRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'LUMU Dashboard API is running' });
    //res.send('LUMU Dashboard API server is running');
});

// Overview endpoint - aggregated KPIs
app.get('/api/overview', async (req, res) => {
    try {
        // This will aggregate data from all services
        const overview = {
            totalSales: 0,
            revenue: 0,
            roas: 0,
            adSpend: 0,
            conversions: 0,
            ctr: 0,
            cpc: 0,
            invalidClicks: 0,
            moneySaved: 0,
            lastUpdated: new Date()
        };
        res.json(overview);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});

module.exports = app;
