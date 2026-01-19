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

// Update individual platform status (pause/resume specific platform)
exports.updatePlatformStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { platform, status } = req.body; // status: 'active', 'paused'

        if (!platform || !status) {
            return res.status(400).json({ error: 'Platform and status are required' });
        }

        const ad = await PublishedAd.findById(id);
        if (!ad) {
            return res.status(404).json({ error: 'Published ad not found' });
        }

        // Find and update the specific platform status
        let platformFound = false;
        ad.platformCampaignIds = ad.platformCampaignIds.map(p => {
            if (p.platform === platform) {
                platformFound = true;
                return { ...p.toObject(), status };
            }
            return p;
        });

        // If platform wasn't found in platformCampaignIds, add it
        if (!platformFound && ad.platforms.includes(platform)) {
            ad.platformCampaignIds.push({
                platform,
                status,
                updatedAt: new Date()
            });
        }

        // Update overall ad status based on platform statuses
        const activeCount = ad.platformCampaignIds.filter(p => p.status === 'active').length;
        const pausedCount = ad.platformCampaignIds.filter(p => p.status === 'paused').length;

        if (pausedCount === ad.platforms.length) {
            ad.status = 'paused';
        } else if (activeCount > 0) {
            ad.status = 'active';
        }

        await ad.save();

        // TODO: Call actual platform APIs to pause/resume
        // For example:
        // if (platform === 'facebook' || platform === 'instagram') {
        //     await metaAdsService.updateCampaignStatus(campaignId, status);
        // }

        res.json({
            success: true,
            ad,
            message: `${platform} ${status === 'paused' ? 'paused' : 'resumed'} successfully`
        });
    } catch (error) {
        console.error('Update Platform Status Error:', error);
        res.status(500).json({ error: 'Failed to update platform status' });
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

// Sync metrics from all platforms (real-time fetch)
exports.syncMetrics = async (req, res) => {
    try {
        const { id } = req.params;

        const ad = await PublishedAd.findById(id);
        if (!ad) {
            return res.status(404).json({ error: 'Published ad not found' });
        }

        console.log(`📊 Syncing metrics for ad: ${ad.name}`);

        const platformMetrics = [];
        let totalMetrics = {
            impressions: 0,
            clicks: 0,
            spend: 0,
            reach: 0,
            conversions: 0,
            ctr: 0
        };

        // Fetch metrics from each platform
        for (const platformData of ad.platformCampaignIds) {
            const { platform, campaignId } = platformData;
            let result = null;

            try {
                switch (platform) {
                    case 'facebook':
                    case 'instagram':
                        if (campaignId) {
                            result = await metaAdsService.getCampaignMetrics(campaignId);
                        }
                        break;

                    case 'tiktok':
                        if (campaignId) {
                            result = await tiktokAdsService.getCampaignMetrics(campaignId);
                        }
                        break;

                    case 'google':
                    case 'youtube':
                        // Google Ads metrics would go here
                        result = { success: true, metrics: { impressions: 0, clicks: 0, spend: 0, conversions: 0, ctr: 0 } };
                        break;

                    case 'twitter':
                        // Twitter Ads metrics would go here
                        result = { success: true, metrics: { impressions: 0, clicks: 0, spend: 0, conversions: 0, ctr: 0 } };
                        break;
                }

                if (result?.success && result.metrics) {
                    platformMetrics.push({
                        platform,
                        campaignId,
                        status: platformData.status || 'active',
                        metrics: result.metrics
                    });

                    // Add to totals
                    totalMetrics.impressions += result.metrics.impressions || 0;
                    totalMetrics.clicks += result.metrics.clicks || 0;
                    totalMetrics.spend += result.metrics.spend || 0;
                    totalMetrics.reach += result.metrics.reach || 0;
                    totalMetrics.conversions += result.metrics.conversions || 0;
                }
            } catch (platformError) {
                console.error(`Error fetching ${platform} metrics:`, platformError.message);
                platformMetrics.push({
                    platform,
                    campaignId,
                    status: platformData.status || 'active',
                    metrics: { impressions: 0, clicks: 0, spend: 0, conversions: 0, ctr: 0 },
                    error: platformError.message
                });
            }
        }

        // Calculate CTR
        if (totalMetrics.impressions > 0) {
            totalMetrics.ctr = (totalMetrics.clicks / totalMetrics.impressions) * 100;
        }

        // Update the ad with new metrics
        ad.platformCampaignIds = platformMetrics;
        ad.metrics = {
            ...ad.metrics,
            ...totalMetrics
        };
        ad.budget.spent = totalMetrics.spend;

        await ad.save();

        console.log(`✅ Metrics synced for ${ad.name}`);

        res.json({
            success: true,
            ad,
            platformMetrics,
            totalMetrics
        });

    } catch (error) {
        console.error('Sync Metrics Error:', error);
        res.status(500).json({ error: 'Failed to sync metrics', details: error.message });
    }
};

// Sync all active ads metrics
exports.syncAllMetrics = async (req, res) => {
    try {
        const activeAds = await PublishedAd.find({ status: 'active' });

        console.log(`📊 Syncing metrics for ${activeAds.length} active ads...`);

        const results = [];
        for (const ad of activeAds) {
            try {
                // Simulate the sync for each ad
                const platformMetrics = [];
                let totalMetrics = { impressions: 0, clicks: 0, spend: 0, conversions: 0, ctr: 0 };

                for (const platformData of ad.platformCampaignIds) {
                    const { platform, campaignId } = platformData;
                    let result = null;

                    if (platform === 'facebook' || platform === 'instagram') {
                        if (campaignId) result = await metaAdsService.getCampaignMetrics(campaignId);
                    } else if (platform === 'tiktok') {
                        if (campaignId) result = await tiktokAdsService.getCampaignMetrics(campaignId);
                    }

                    if (result?.success && result.metrics) {
                        platformMetrics.push({
                            ...platformData,
                            metrics: result.metrics
                        });
                        totalMetrics.impressions += result.metrics.impressions || 0;
                        totalMetrics.clicks += result.metrics.clicks || 0;
                        totalMetrics.spend += result.metrics.spend || 0;
                        totalMetrics.conversions += result.metrics.conversions || 0;
                    }
                }

                if (totalMetrics.impressions > 0) {
                    totalMetrics.ctr = (totalMetrics.clicks / totalMetrics.impressions) * 100;
                }

                ad.platformCampaignIds = platformMetrics.length > 0 ? platformMetrics : ad.platformCampaignIds;
                ad.metrics = { ...ad.metrics, ...totalMetrics };
                ad.budget.spent = totalMetrics.spend;
                await ad.save();

                results.push({ adId: ad._id, name: ad.name, success: true });
            } catch (adError) {
                results.push({ adId: ad._id, name: ad.name, success: false, error: adError.message });
            }
        }

        res.json({ success: true, synced: results.length, results });
    } catch (error) {
        console.error('Sync All Metrics Error:', error);
        res.status(500).json({ error: 'Failed to sync all metrics' });
    }
};
