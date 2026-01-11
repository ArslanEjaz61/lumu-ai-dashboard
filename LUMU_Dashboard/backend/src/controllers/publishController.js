// Publish Controller - Handle ad publishing to platforms
const Campaign = require('../models/Campaign');

// Publish ad immediately
exports.publishAd = async (req, res) => {
    try {
        const { platforms, budget, targeting, creative } = req.body;

        // Mock publish to platforms
        const results = {
            success: true,
            publishedTo: platforms,
            publishedAt: new Date(),
            campaignIds: platforms.map(p => `${p}_${Date.now()}`),
            estimatedReach: platforms.length * 15000000,
            budget: budget,
            status: 'active'
        };

        res.json(results);
    } catch (error) {
        console.error('Publish Error:', error);
        res.status(500).json({ error: 'Failed to publish ad' });
    }
};

// Schedule ad for later
exports.scheduleAd = async (req, res) => {
    try {
        const { platforms, budget, targeting, creative, scheduleDate, scheduleTime } = req.body;

        const scheduledFor = new Date(`${scheduleDate}T${scheduleTime}`);

        const result = {
            success: true,
            scheduled: true,
            scheduledFor: scheduledFor,
            platforms: platforms,
            budget: budget,
            status: 'scheduled',
            id: `scheduled_${Date.now()}`
        };

        res.json(result);
    } catch (error) {
        console.error('Schedule Error:', error);
        res.status(500).json({ error: 'Failed to schedule ad' });
    }
};

// Get publishing history
exports.getHistory = async (req, res) => {
    try {
        const history = [
            {
                id: 'pub_001',
                platforms: ['facebook', 'instagram'],
                publishedAt: new Date('2026-01-09T14:30:00'),
                status: 'active',
                reach: 25000000,
                spend: 45000,
                conversions: 1250
            },
            {
                id: 'pub_002',
                platforms: ['google'],
                publishedAt: new Date('2026-01-08T10:00:00'),
                status: 'completed',
                reach: 18000000,
                spend: 32000,
                conversions: 890
            },
            {
                id: 'pub_003',
                platforms: ['facebook', 'youtube'],
                publishedAt: new Date('2026-01-07T18:00:00'),
                status: 'paused',
                reach: 12000000,
                spend: 28000,
                conversions: 650
            }
        ];

        res.json({ history });
    } catch (error) {
        console.error('History Error:', error);
        res.status(500).json({ error: 'Failed to get history' });
    }
};
