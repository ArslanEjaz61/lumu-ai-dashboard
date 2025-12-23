const clickCeaseService = require('../services/clickCeaseService');

// Get fraud overview
exports.getFraudOverview = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const data = await clickCeaseService.getOverview(startDate, endDate);
        res.json(data);
    } catch (error) {
        console.error('Fraud Overview Error:', error);
        res.status(500).json({ error: error.message });
    }
};

// Get invalid click details
exports.getInvalidClicks = async (req, res) => {
    try {
        const { startDate, endDate, page = 1, limit = 50 } = req.query;
        const data = await clickCeaseService.getInvalidClicks(startDate, endDate, page, limit);
        res.json(data);
    } catch (error) {
        console.error('Invalid Clicks Error:', error);
        res.status(500).json({ error: error.message });
    }
};

// Get blocked IPs
exports.getBlockedIPs = async (req, res) => {
    try {
        const data = await clickCeaseService.getBlockedIPs();
        res.json(data);
    } catch (error) {
        console.error('Blocked IPs Error:', error);
        res.status(500).json({ error: error.message });
    }
};

// Get savings from fraud prevention
exports.getSavings = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const data = await clickCeaseService.getSavings(startDate, endDate);
        res.json(data);
    } catch (error) {
        console.error('Savings Error:', error);
        res.status(500).json({ error: error.message });
    }
};

// Get detailed fraud report
exports.getDetailedReport = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const data = await clickCeaseService.getDetailedReport(startDate, endDate);
        res.json(data);
    } catch (error) {
        console.error('Detailed Report Error:', error);
        res.status(500).json({ error: error.message });
    }
};
