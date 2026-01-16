// Publish Controller - Direct Platform API Integration
// Publishes ads directly to Meta, Google, TikTok, and Twitter

const PublishedAd = require('../models/PublishedAd');
const AdCreative = require('../models/AdCreative');
const Campaign = require('../models/Campaign');

// Import platform services
const metaAdsService = require('../services/metaAdsService');
const googleAdsService = require('../services/googleAdsService');
const tiktokAdsService = require('../services/tiktokAdsService');
const twitterAdsService = require('../services/twitterAdsService');

// Publish ad to selected platforms
exports.publishAd = async (req, res) => {
    try {
        const {
            name,
            platforms,
            budget,
            targeting,
            creativeId,
            creative,
            campaignId,
            publishMode = 'now',
            scheduledFor
        } = req.body;

        // Validate platforms
        if (!platforms || platforms.length === 0) {
            return res.status(400).json({ error: 'At least one platform is required' });
        }

        // Get campaign details if campaignId provided
        let campaignData = { name, budget, targeting };
        if (campaignId) {
            const campaign = await Campaign.findById(campaignId);
            if (campaign) {
                campaignData = {
                    name: campaign.name,
                    objective: campaign.objective,
                    budget: campaign.budget,
                    targeting: campaign.targetAudience,
                    adFormat: campaign.adFormat,
                    bidStrategy: campaign.bidStrategy,
                    linkUrl: campaign.linkUrl
                };
            }
        }

        // Get creative details if creativeId provided
        let creativeData = creative || {};
        if (creativeId) {
            const savedCreative = await AdCreative.findById(creativeId);
            if (savedCreative) {
                creativeData = {
                    name: savedCreative.name,
                    headline: savedCreative.headline || savedCreative.name,
                    description: savedCreative.description || savedCreative.adCopy,
                    primaryText: savedCreative.primaryText,
                    imageUrl: savedCreative.imageUrl || savedCreative.images?.[0],
                    image: savedCreative.imageUrl || savedCreative.images?.[0],
                    videoUrl: savedCreative.videoUrl,
                    video: savedCreative.videoUrl,
                    cta: savedCreative.cta || 'Shop Now',
                    linkUrl: savedCreative.linkUrl || campaignData.linkUrl
                };
            }
        }

        // Create published ad record
        const publishedAd = new PublishedAd({
            name: campaignData.name || `Campaign ${Date.now()}`,
            platforms,
            campaignId,
            creativeId,
            creative: creativeData,
            budget: {
                daily: budget?.daily || campaignData.budget?.daily || 1000,
                total: budget?.total || campaignData.budget?.total || 7000,
                currency: 'PKR'
            },
            targeting: {
                ageMin: targeting?.ageMin || campaignData.targeting?.ageMin || 18,
                ageMax: targeting?.ageMax || campaignData.targeting?.ageMax || 55,
                gender: targeting?.gender || campaignData.targeting?.gender || 'all',
                cities: targeting?.cities || campaignData.targeting?.cities || ['Karachi', 'Lahore']
            },
            publishMode,
            scheduledFor: publishMode === 'schedule' ? new Date(scheduledFor) : null,
            status: publishMode === 'schedule' ? 'scheduled' : 'publishing'
        });

        await publishedAd.save();

        // Publish to each platform
        const results = [];
        const platformCampaignIds = [];
        const errors = [];

        console.log('🚀 Starting multi-platform publish to:', platforms);

        for (const platform of platforms) {
            try {
                let result;

                switch (platform) {
                    case 'facebook':
                    case 'instagram':
                        // Meta handles both FB and IG
                        if (!results.find(r => r.platform === 'meta')) {
                            console.log(`📘 Publishing to Meta (${platform})...`);
                            result = await metaAdsService.publishCampaign(campaignData, creativeData);
                            if (result.success) {
                                platformCampaignIds.push({
                                    platform: 'facebook',
                                    campaignId: result.campaignId,
                                    adSetId: result.adSetId,
                                    adId: result.adId
                                });
                                if (platforms.includes('instagram')) {
                                    platformCampaignIds.push({
                                        platform: 'instagram',
                                        campaignId: result.campaignId,
                                        adSetId: result.adSetId,
                                        adId: result.adId
                                    });
                                }
                            }
                            results.push(result);
                        }
                        break;

                    case 'google':
                    case 'youtube':
                        // Google handles both Search and YouTube
                        if (!results.find(r => r.platform === 'google')) {
                            console.log(`🔵 Publishing to Google Ads (${platform})...`);
                            result = await googleAdsService.publishCampaign(campaignData, creativeData);
                            if (result.success) {
                                platformCampaignIds.push({
                                    platform: 'google',
                                    campaignId: result.campaignId,
                                    adGroupId: result.adGroupId,
                                    adId: result.adId
                                });
                                if (platforms.includes('youtube')) {
                                    platformCampaignIds.push({
                                        platform: 'youtube',
                                        campaignId: result.campaignId
                                    });
                                }
                            }
                            results.push(result);
                        }
                        break;

                    case 'tiktok':
                        console.log('🎵 Publishing to TikTok...');
                        result = await tiktokAdsService.publishCampaign(campaignData, creativeData);
                        if (result.success) {
                            platformCampaignIds.push({
                                platform: 'tiktok',
                                campaignId: result.campaignId,
                                adGroupId: result.adGroupId,
                                adId: result.adId,
                                videoId: result.videoId
                            });
                        }
                        results.push(result);
                        break;

                    case 'twitter':
                        console.log('🐦 Publishing to Twitter/X...');
                        result = await twitterAdsService.publishCampaign(campaignData, creativeData);
                        if (result.success) {
                            platformCampaignIds.push({
                                platform: 'twitter',
                                campaignId: result.campaignId,
                                lineItemId: result.lineItemId,
                                promotedTweetId: result.promotedTweetId
                            });
                        }
                        results.push(result);
                        break;

                    default:
                        console.log(`⚠️ Unknown platform: ${platform}`);
                }

            } catch (platformError) {
                console.error(`❌ Error publishing to ${platform}:`, platformError.message);
                errors.push({
                    platform,
                    message: platformError.message,
                    code: 'PLATFORM_ERROR'
                });
            }
        }

        // Update published ad with results
        const successCount = results.filter(r => r.success).length;
        const failCount = results.filter(r => !r.success).length;

        publishedAd.platformCampaignIds = platformCampaignIds;
        publishedAd.errors = [
            ...errors,
            ...results.filter(r => !r.success).map(r => ({
                platform: r.platform,
                message: r.error,
                code: 'API_ERROR'
            }))
        ];

        if (successCount > 0 && publishMode === 'now') {
            publishedAd.status = 'active';
            publishedAd.publishedAt = new Date();
        } else if (failCount === results.length) {
            publishedAd.status = 'failed';
        }

        await publishedAd.save();

        // Calculate estimated reach
        const estimatedReach = successCount * 15000000;

        res.status(201).json({
            success: successCount > 0,
            publishedAd: {
                id: publishedAd._id,
                name: publishedAd.name,
                status: publishedAd.status,
                platforms: publishedAd.platforms
            },
            results: {
                total: platforms.length,
                success: successCount,
                failed: failCount,
                details: results
            },
            platformCampaignIds,
            estimatedReach,
            message: successCount > 0
                ? `✅ Published to ${successCount} platform(s)!`
                : '❌ All platforms failed to publish'
        });

    } catch (error) {
        console.error('Publish Error:', error);
        res.status(500).json({ error: 'Failed to publish ad', details: error.message });
    }
};

// Schedule ad for later
exports.scheduleAd = async (req, res) => {
    try {
        const { scheduleDate, scheduleTime } = req.body;

        const scheduledFor = new Date(`${scheduleDate}T${scheduleTime}`);

        if (scheduledFor <= new Date()) {
            return res.status(400).json({ error: 'Scheduled time must be in the future' });
        }

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
            .populate('creativeId', 'name imageUrl')
            .populate('campaignId', 'name objective');

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

        const ad = await PublishedAd.findById(id)
            .populate('creativeId')
            .populate('campaignId');

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

        // TODO: Update status on actual platforms via their APIs

        res.json({ success: true, ad });
    } catch (error) {
        console.error('Update Status Error:', error);
        res.status(500).json({ error: 'Failed to update status' });
    }
};

// Update metrics
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

// Get available creatives
exports.getCreatives = async (req, res) => {
    try {
        const creatives = await AdCreative.find({ status: 'approved' })
            .sort({ createdAt: -1 })
            .limit(20)
            .select('name headline adCopy imageUrl videoUrl images platform aspectRatio');

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
        const failedAds = await PublishedAd.countDocuments({ status: 'failed' });

        // Aggregate metrics
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
                failedAds,
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
