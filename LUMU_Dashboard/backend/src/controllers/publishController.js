// Publish Controller - Complete Publish System with N8N Webhook
const PublishedAd = require('../models/PublishedAd');
const AdCreative = require('../models/AdCreative');
const axios = require('axios');

// N8N Webhook URL (configure in .env)
const N8N_WEBHOOK_URL = process.env.N8N_PUBLISH_WEBHOOK || 'http://localhost:5678/webhook/lumu-publish-ad';

// Publish ad immediately
exports.publishAd = async (req, res) => {
    try {
        const {
            name,
            platforms,
            budget,
            targeting,
            creativeId,
            creative,
            publishMode = 'now',
            scheduledFor
        } = req.body;

        // Validate platforms
        if (!platforms || platforms.length === 0) {
            return res.status(400).json({ error: 'At least one platform is required' });
        }

        // Get creative details if creativeId provided
        let creativeData = creative;
        if (creativeId) {
            const savedCreative = await AdCreative.findById(creativeId);
            if (savedCreative) {
                creativeData = {
                    headline: savedCreative.headline || savedCreative.name,
                    description: savedCreative.description || savedCreative.adCopy,
                    image: savedCreative.imageUrl || savedCreative.images?.[0],
                    video: savedCreative.videoUrl,
                    cta: savedCreative.cta || 'Shop Now'
                };
            }
        }

        // Create published ad record
        const publishedAd = new PublishedAd({
            name: name || `Campaign ${Date.now()}`,
            platforms,
            creativeId,
            creative: creativeData,
            budget: {
                daily: budget?.daily || 1000,
                total: budget?.total || 7000,
                currency: 'PKR'
            },
            targeting: {
                ageMin: targeting?.ageMin || 18,
                ageMax: targeting?.ageMax || 55,
                gender: targeting?.gender || 'all',
                cities: targeting?.cities || ['Karachi', 'Lahore', 'Islamabad']
            },
            publishMode,
            scheduledFor: publishMode === 'schedule' ? new Date(scheduledFor) : null,
            status: publishMode === 'schedule' ? 'scheduled' : 'publishing'
        });

        await publishedAd.save();

        // Trigger N8N Webhook for actual publishing
        let webhookResponse = null;
        try {
            const webhookPayload = {
                adId: publishedAd._id.toString(),
                platforms,
                creative: creativeData,
                budget,
                targeting,
                schedule: {
                    mode: publishMode,
                    date: scheduledFor
                },
                timestamp: new Date().toISOString()
            };

            const response = await axios.post(N8N_WEBHOOK_URL, webhookPayload, {
                timeout: 10000,
                headers: { 'Content-Type': 'application/json' }
            });

            webhookResponse = response.data;

            // Update with webhook response
            publishedAd.webhookResponse = webhookResponse;
            publishedAd.n8nExecutionId = webhookResponse?.executionId;

            if (publishMode === 'now') {
                publishedAd.status = 'active';
                publishedAd.publishedAt = new Date();
            }

            await publishedAd.save();

        } catch (webhookError) {
            console.error('N8N Webhook Error:', webhookError.message);
            // Don't fail the request, just log the error
            publishedAd.errors.push({
                platform: 'n8n',
                message: webhookError.message,
                code: 'WEBHOOK_ERROR'
            });
            await publishedAd.save();
        }

        // Calculate estimated reach
        const estimatedReach = platforms.length * 15000000;

        res.status(201).json({
            success: true,
            publishedAd: {
                id: publishedAd._id,
                name: publishedAd.name,
                status: publishedAd.status,
                platforms: publishedAd.platforms,
                publishedAt: publishedAd.publishedAt,
                scheduledFor: publishedAd.scheduledFor
            },
            estimatedReach,
            webhookTriggered: !!webhookResponse,
            message: publishMode === 'now'
                ? 'Ad campaign published successfully!'
                : `Ad campaign scheduled for ${scheduledFor}`
        });

    } catch (error) {
        console.error('Publish Error:', error);
        res.status(500).json({ error: 'Failed to publish ad', details: error.message });
    }
};

// Schedule ad for later
exports.scheduleAd = async (req, res) => {
    try {
        const { platforms, budget, targeting, creative, creativeId, scheduleDate, scheduleTime } = req.body;

        const scheduledFor = new Date(`${scheduleDate}T${scheduleTime}`);

        if (scheduledFor <= new Date()) {
            return res.status(400).json({ error: 'Scheduled time must be in the future' });
        }

        // Use publishAd with schedule mode
        req.body.publishMode = 'schedule';
        req.body.scheduledFor = scheduledFor;

        return exports.publishAd(req, res);

    } catch (error) {
        console.error('Schedule Error:', error);
        res.status(500).json({ error: 'Failed to schedule ad' });
    }
};

// Get publishing history
exports.getHistory = async (req, res) => {
    try {
        const { status, platform, limit = 20, page = 1 } = req.query;

        const query = {};
        if (status) query.status = status;
        if (platform) query.platforms = platform;

        const skip = (page - 1) * limit;

        const history = await PublishedAd.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit))
            .populate('creativeId', 'name imageUrl');

        const total = await PublishedAd.countDocuments(query);

        res.json({
            history,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('History Error:', error);
        res.status(500).json({ error: 'Failed to get history' });
    }
};

// Get single published ad
exports.getPublishedAd = async (req, res) => {
    try {
        const { id } = req.params;

        const ad = await PublishedAd.findById(id).populate('creativeId');

        if (!ad) {
            return res.status(404).json({ error: 'Published ad not found' });
        }

        res.json({ ad });
    } catch (error) {
        console.error('Get Ad Error:', error);
        res.status(500).json({ error: 'Failed to get ad details' });
    }
};

// Update ad status
exports.updateStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const ad = await PublishedAd.findByIdAndUpdate(
            id,
            { status },
            { new: true }
        );

        if (!ad) {
            return res.status(404).json({ error: 'Published ad not found' });
        }

        // Trigger N8N webhook to update status on platforms
        try {
            await axios.post(N8N_WEBHOOK_URL, {
                action: 'update_status',
                adId: id,
                newStatus: status,
                platformCampaignIds: ad.platformCampaignIds
            });
        } catch (webhookError) {
            console.error('Status update webhook error:', webhookError.message);
        }

        res.json({ success: true, ad });
    } catch (error) {
        console.error('Update Status Error:', error);
        res.status(500).json({ error: 'Failed to update status' });
    }
};

// Update metrics (called by N8N or sync job)
exports.updateMetrics = async (req, res) => {
    try {
        const { id } = req.params;
        const { metrics, platformCampaignIds } = req.body;

        const ad = await PublishedAd.findByIdAndUpdate(
            id,
            {
                metrics,
                platformCampaignIds,
                'budget.spent': metrics?.spend || 0
            },
            { new: true }
        );

        res.json({ success: true, ad });
    } catch (error) {
        console.error('Update Metrics Error:', error);
        res.status(500).json({ error: 'Failed to update metrics' });
    }
};

// Get available creatives for selection
exports.getCreatives = async (req, res) => {
    try {
        const creatives = await AdCreative.find({ status: 'approved' })
            .sort({ createdAt: -1 })
            .limit(20)
            .select('name headline adCopy imageUrl images platform aspectRatio');

        res.json({ creatives });
    } catch (error) {
        console.error('Get Creatives Error:', error);
        res.status(500).json({ error: 'Failed to get creatives' });
    }
};

// Get dashboard stats
exports.getStats = async (req, res) => {
    try {
        const totalAds = await PublishedAd.countDocuments();
        const activeAds = await PublishedAd.countDocuments({ status: 'active' });
        const scheduledAds = await PublishedAd.countDocuments({ status: 'scheduled' });

        // Aggregate total spend and conversions
        const metrics = await PublishedAd.aggregate([
            { $match: { status: { $in: ['active', 'completed'] } } },
            {
                $group: {
                    _id: null,
                    totalSpend: { $sum: '$metrics.spend' },
                    totalConversions: { $sum: '$metrics.conversions' },
                    totalReach: { $sum: '$metrics.reach' },
                    totalClicks: { $sum: '$metrics.clicks' }
                }
            }
        ]);

        res.json({
            stats: {
                totalAds,
                activeAds,
                scheduledAds,
                totalSpend: metrics[0]?.totalSpend || 0,
                totalConversions: metrics[0]?.totalConversions || 0,
                totalReach: metrics[0]?.totalReach || 0,
                totalClicks: metrics[0]?.totalClicks || 0
            }
        });
    } catch (error) {
        console.error('Stats Error:', error);
        res.status(500).json({ error: 'Failed to get stats' });
    }
};
