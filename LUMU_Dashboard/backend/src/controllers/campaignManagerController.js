const Campaign = require('../models/Campaign');

// Get all campaigns
exports.getAllCampaigns = async (req, res) => {
    try {
        const { status, platform, objective } = req.query;
        let query = {};

        if (status) query.status = status;
        if (platform) query.platforms = platform;
        if (objective) query.objective = objective;

        const campaigns = await Campaign.find(query)
            .sort({ createdAt: -1 })
            .populate('createdBy', 'name email')
            .populate('creatives', 'name creativeType media');

        res.json(campaigns);
    } catch (error) {
        console.error('Get Campaigns Error:', error);
        res.status(500).json({ error: error.message });
    }
};

// Get campaign by ID
exports.getCampaignById = async (req, res) => {
    try {
        const campaign = await Campaign.findById(req.params.id)
            .populate('createdBy', 'name email')
            .populate('creatives', 'name creativeType media');

        if (!campaign) {
            return res.status(404).json({ error: 'Campaign not found' });
        }

        res.json(campaign);
    } catch (error) {
        console.error('Get Campaign Error:', error);
        res.status(500).json({ error: error.message });
    }
};

// Create campaign
exports.createCampaign = async (req, res) => {
    try {
        const campaign = await Campaign.create(req.body);
        res.status(201).json({ success: true, campaign });
    } catch (error) {
        console.error('Create Campaign Error:', error);
        res.status(500).json({ error: error.message });
    }
};

// Update campaign
exports.updateCampaign = async (req, res) => {
    try {
        const campaign = await Campaign.findByIdAndUpdate(
            req.params.id,
            { ...req.body, updatedAt: new Date() },
            { new: true, runValidators: true }
        );

        if (!campaign) {
            return res.status(404).json({ error: 'Campaign not found' });
        }

        res.json({ success: true, campaign });
    } catch (error) {
        console.error('Update Campaign Error:', error);
        res.status(500).json({ error: error.message });
    }
};

// Delete campaign
exports.deleteCampaign = async (req, res) => {
    try {
        const campaign = await Campaign.findByIdAndDelete(req.params.id);

        if (!campaign) {
            return res.status(404).json({ error: 'Campaign not found' });
        }

        res.json({ success: true, message: 'Campaign deleted successfully' });
    } catch (error) {
        console.error('Delete Campaign Error:', error);
        res.status(500).json({ error: error.message });
    }
};

// Update campaign status
exports.updateStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const campaign = await Campaign.findByIdAndUpdate(
            req.params.id,
            { status, updatedAt: new Date() },
            { new: true }
        );

        if (!campaign) {
            return res.status(404).json({ error: 'Campaign not found' });
        }

        res.json({ success: true, campaign });
    } catch (error) {
        console.error('Update Status Error:', error);
        res.status(500).json({ error: error.message });
    }
};

// Get campaign stats
exports.getCampaignStats = async (req, res) => {
    try {
        const stats = await Campaign.aggregate([
            {
                $group: {
                    _id: null,
                    totalCampaigns: { $sum: 1 },
                    activeCampaigns: {
                        $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
                    },
                    totalSpent: { $sum: '$budget.spent' },
                    totalRevenue: { $sum: '$metrics.revenue' },
                    totalImpressions: { $sum: '$metrics.impressions' },
                    totalClicks: { $sum: '$metrics.clicks' },
                    totalConversions: { $sum: '$metrics.conversions' }
                }
            }
        ]);

        const result = stats[0] || {
            totalCampaigns: 0,
            activeCampaigns: 0,
            totalSpent: 0,
            totalRevenue: 0,
            totalImpressions: 0,
            totalClicks: 0,
            totalConversions: 0
        };

        // Calculate overall ROAS
        result.overallRoas = result.totalSpent > 0
            ? (result.totalRevenue / result.totalSpent).toFixed(2)
            : 0;

        res.json(result);
    } catch (error) {
        console.error('Get Campaign Stats Error:', error);
        res.status(500).json({ error: error.message });
    }
};

// Add AI suggestion to campaign
exports.addAiSuggestion = async (req, res) => {
    try {
        const { agentName, suggestion, action, confidence } = req.body;

        const campaign = await Campaign.findByIdAndUpdate(
            req.params.id,
            {
                $push: {
                    aiSuggestions: {
                        agentName,
                        suggestion,
                        action,
                        confidence,
                        createdAt: new Date()
                    }
                }
            },
            { new: true }
        );

        if (!campaign) {
            return res.status(404).json({ error: 'Campaign not found' });
        }

        res.json({ success: true, campaign });
    } catch (error) {
        console.error('Add AI Suggestion Error:', error);
        res.status(500).json({ error: error.message });
    }
};
