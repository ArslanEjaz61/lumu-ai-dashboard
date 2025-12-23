const ga4Service = require('../services/ga4Service');
const clarityService = require('../services/clarityService');

// Get audience overview
exports.getAudienceOverview = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        const [ga4Audience, clarityData] = await Promise.all([
            ga4Service.getAudienceData(startDate, endDate),
            clarityService.getSessionSummary(startDate, endDate)
        ]);

        res.json({
            ga4: ga4Audience,
            clarity: clarityData
        });
    } catch (error) {
        console.error('Audience Overview Error:', error);
        res.status(500).json({ error: error.message });
    }
};

// Get demographics
exports.getDemographics = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const data = await ga4Service.getDemographics(startDate, endDate);
        res.json(data);
    } catch (error) {
        console.error('Demographics Error:', error);
        res.status(500).json({ error: error.message });
    }
};

// Get audience segments
exports.getSegments = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const data = await ga4Service.getAudienceSegments(startDate, endDate);
        res.json(data);
    } catch (error) {
        console.error('Segments Error:', error);
        res.status(500).json({ error: error.message });
    }
};

// Get user behavior from Clarity
exports.getUserBehavior = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const data = await clarityService.getUserBehavior(startDate, endDate);
        res.json(data);
    } catch (error) {
        console.error('User Behavior Error:', error);
        res.status(500).json({ error: error.message });
    }
};

// Get heatmap data from Clarity
exports.getHeatmaps = async (req, res) => {
    try {
        const { page } = req.query;
        const data = await clarityService.getHeatmapData(page);
        res.json(data);
    } catch (error) {
        console.error('Heatmaps Error:', error);
        res.status(500).json({ error: error.message });
    }
};
