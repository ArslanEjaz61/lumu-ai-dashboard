const n8nService = require('../services/n8nService');
const Insight = require('../models/Insight');

// Get all insights
exports.getAllInsights = async (req, res) => {
    try {
        const { limit = 20 } = req.query;

        // Get stored insights from database
        const insights = await Insight.find()
            .sort({ createdAt: -1 })
            .limit(parseInt(limit));

        res.json(insights);
    } catch (error) {
        console.error('Get Insights Error:', error);
        res.status(500).json({ error: error.message });
    }
};

// Get optimization recommendations
exports.getRecommendations = async (req, res) => {
    try {
        const recommendations = await Insight.find({ type: 'recommendation' })
            .sort({ priority: -1, createdAt: -1 })
            .limit(10);

        res.json(recommendations);
    } catch (error) {
        console.error('Recommendations Error:', error);
        res.status(500).json({ error: error.message });
    }
};

// Get active alerts
exports.getAlerts = async (req, res) => {
    try {
        const alerts = await Insight.find({
            type: 'alert',
            status: 'active'
        }).sort({ createdAt: -1 });

        res.json(alerts);
    } catch (error) {
        console.error('Alerts Error:', error);
        res.status(500).json({ error: error.message });
    }
};

// Trigger n8n workflow
exports.triggerWorkflow = async (req, res) => {
    try {
        const { workflow } = req.params;
        const payload = req.body;

        const result = await n8nService.triggerWorkflow(workflow, payload);
        res.json(result);
    } catch (error) {
        console.error('Trigger Workflow Error:', error);
        res.status(500).json({ error: error.message });
    }
};

// Get demand forecast
exports.getDemandForecast = async (req, res) => {
    try {
        const forecast = await Insight.find({ type: 'forecast' })
            .sort({ createdAt: -1 })
            .limit(1);

        res.json(forecast[0] || null);
    } catch (error) {
        console.error('Forecast Error:', error);
        res.status(500).json({ error: error.message });
    }
};
