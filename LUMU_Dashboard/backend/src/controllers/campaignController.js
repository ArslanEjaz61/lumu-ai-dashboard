const metaAdsService = require('../services/metaAdsService');
const googleAdsService = require('../services/googleAdsService');

// Get all campaigns (Meta + Google)
exports.getAllCampaigns = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        const [metaCampaigns, googleCampaigns] = await Promise.all([
            metaAdsService.getCampaigns(startDate, endDate),
            googleAdsService.getCampaigns(startDate, endDate)
        ]);

        res.json({
            meta: metaCampaigns,
            google: googleCampaigns,
            total: metaCampaigns.length + googleCampaigns.length
        });
    } catch (error) {
        console.error('Get All Campaigns Error:', error);
        res.status(500).json({ error: error.message });
    }
};

// Get Meta campaigns only
exports.getMetaCampaigns = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const data = await metaAdsService.getCampaigns(startDate, endDate);
        res.json(data);
    } catch (error) {
        console.error('Meta Campaigns Error:', error);
        res.status(500).json({ error: error.message });
    }
};

// Get Google Ads campaigns only
exports.getGoogleCampaigns = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const data = await googleAdsService.getCampaigns(startDate, endDate);
        res.json(data);
    } catch (error) {
        console.error('Google Campaigns Error:', error);
        res.status(500).json({ error: error.message });
    }
};

// Get single campaign by ID
exports.getCampaignById = async (req, res) => {
    try {
        const { id } = req.params;
        const { platform } = req.query;

        let data;
        if (platform === 'meta') {
            data = await metaAdsService.getCampaignById(id);
        } else if (platform === 'google') {
            data = await googleAdsService.getCampaignById(id);
        } else {
            return res.status(400).json({ error: 'Platform must be specified (meta/google)' });
        }

        res.json(data);
    } catch (error) {
        console.error('Campaign By ID Error:', error);
        res.status(500).json({ error: error.message });
    }
};

// Get performance comparison
exports.getPerformanceComparison = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        const [metaPerformance, googlePerformance] = await Promise.all([
            metaAdsService.getPerformanceMetrics(startDate, endDate),
            googleAdsService.getPerformanceMetrics(startDate, endDate)
        ]);

        res.json({
            meta: metaPerformance,
            google: googlePerformance,
            comparison: {
                betterROAS: metaPerformance.roas > googlePerformance.roas ? 'meta' : 'google',
                betterCTR: metaPerformance.ctr > googlePerformance.ctr ? 'meta' : 'google',
                lowerCPC: metaPerformance.cpc < googlePerformance.cpc ? 'meta' : 'google'
            }
        });
    } catch (error) {
        console.error('Performance Comparison Error:', error);
        res.status(500).json({ error: error.message });
    }
};
