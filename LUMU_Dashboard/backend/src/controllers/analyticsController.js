const ga4Service = require('../services/ga4Service');

// Get overview analytics
exports.getOverview = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const data = await ga4Service.getOverviewMetrics(startDate, endDate);
        res.json(data);
    } catch (error) {
        console.error('Analytics Overview Error:', error);
        res.status(500).json({ error: error.message });
    }
};

// Get real-time data
exports.getRealtime = async (req, res) => {
    try {
        const data = await ga4Service.getRealtimeData();
        res.json(data);
    } catch (error) {
        console.error('Realtime Error:', error);
        res.status(500).json({ error: error.message });
    }
};

// Get traffic sources
exports.getTrafficSources = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const data = await ga4Service.getTrafficSources(startDate, endDate);
        res.json(data);
    } catch (error) {
        console.error('Traffic Sources Error:', error);
        res.status(500).json({ error: error.message });
    }
};

// Get conversion data
exports.getConversions = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const data = await ga4Service.getConversions(startDate, endDate);
        res.json(data);
    } catch (error) {
        console.error('Conversions Error:', error);
        res.status(500).json({ error: error.message });
    }
};

// Get device breakdown
exports.getDeviceBreakdown = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const data = await ga4Service.getDeviceBreakdown(startDate, endDate);
        res.json(data);
    } catch (error) {
        console.error('Device Breakdown Error:', error);
        res.status(500).json({ error: error.message });
    }
};
