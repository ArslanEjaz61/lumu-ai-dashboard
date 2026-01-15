const mongoose = require('mongoose');

const publishedAdSchema = new mongoose.Schema({
    // Campaign Details
    name: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['draft', 'scheduled', 'publishing', 'active', 'paused', 'completed', 'failed'],
        default: 'draft'
    },

    // Campaign Reference
    campaignId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Campaign'
    },

    // Platforms
    platforms: [{
        type: String,
        enum: ['facebook', 'instagram', 'google', 'youtube', 'tiktok']
    }],
    platformCampaignIds: [{
        platform: String,
        campaignId: String,
        adSetId: String,
        adId: String,
        status: String,
        publishedAt: Date,
        error: String
    }],

    // Ad Placements (where to show)
    placements: {
        facebook: {
            type: [String],
            enum: ['feed', 'stories', 'reels', 'marketplace', 'right_column', 'video_feeds'],
            default: ['feed', 'stories']
        },
        instagram: {
            type: [String],
            enum: ['feed', 'stories', 'reels', 'explore'],
            default: ['feed', 'stories']
        },
        google: {
            type: [String],
            enum: ['search', 'display', 'shopping', 'youtube', 'discovery'],
            default: ['search', 'display']
        },
        tiktok: {
            type: [String],
            enum: ['for_you', 'following', 'search'],
            default: ['for_you']
        }
    },

    // Ad Format
    adFormat: {
        type: String,
        enum: ['single_image', 'single_video', 'carousel', 'collection', 'stories', 'responsive'],
        default: 'single_image'
    },

    // Creative Reference
    creativeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AdCreative'
    },
    creative: {
        headline: { type: String, maxlength: 100 },           // Short headline (25-30 chars recommended)
        primaryText: { type: String, maxlength: 500 },        // Main ad copy (125 chars for FB)
        description: { type: String, maxlength: 200 },        // Link description
        image: String,
        video: String,
        thumbnailUrl: String,                                  // Video thumbnail
        cta: {
            type: String,
            enum: ['shop_now', 'learn_more', 'sign_up', 'book_now', 'contact_us', 'download', 'get_offer', 'order_now', 'subscribe', 'watch_more'],
            default: 'shop_now'
        },
        // Carousel items (if carousel format)
        carouselCards: [{
            headline: String,
            description: String,
            image: String,
            linkUrl: String
        }]
    },

    // Destination URL (REQUIRED for all platforms)
    linkUrl: {
        type: String,
        required: true
    },
    displayUrl: String,        // Shown URL (for Google Ads)
    deepLink: String,          // App deep link (optional)

    // Tracking
    tracking: {
        facebookPixelId: String,
        googleConversionId: String,
        tiktokPixelId: String,
        utmSource: String,
        utmMedium: String,
        utmCampaign: String,
        utmContent: String
    },

    // Budget
    budget: {
        daily: { type: Number, default: 0 },
        total: { type: Number, default: 0 },
        spent: { type: Number, default: 0 },
        currency: { type: String, default: 'PKR' }
    },

    // Bid Strategy
    bidStrategy: {
        type: String,
        enum: ['lowest_cost', 'cost_cap', 'bid_cap', 'target_cost', 'maximize_conversions', 'maximize_clicks'],
        default: 'lowest_cost'
    },
    bidAmount: Number,         // For bid_cap or cost_cap

    // Targeting
    targeting: {
        ageMin: { type: Number, default: 18, min: 13, max: 65 },
        ageMax: { type: Number, default: 65, min: 18, max: 65 },
        gender: { type: String, enum: ['all', 'male', 'female'], default: 'all' },

        // Locations
        countries: { type: [String], default: ['PK'] },
        cities: [String],
        regions: [String],

        // Interests & Behaviors
        interests: [String],
        behaviors: [String],

        // Custom Audiences
        customAudiences: [String],
        lookalikeAudiences: [String],
        excludedAudiences: [String],

        // Device Targeting
        devices: {
            type: [String],
            enum: ['mobile', 'desktop', 'tablet', 'all'],
            default: ['all']
        },
        operatingSystems: {
            type: [String],
            enum: ['ios', 'android', 'windows', 'macos', 'all'],
            default: ['all']
        },

        // Language
        languages: { type: [String], default: ['en', 'ur'] }
    },

    // Schedule
    publishMode: {
        type: String,
        enum: ['now', 'schedule'],
        default: 'now'
    },
    scheduledFor: Date,
    publishedAt: Date,
    endDate: Date,              // Campaign end date

    // Performance Metrics
    metrics: {
        reach: { type: Number, default: 0 },
        impressions: { type: Number, default: 0 },
        clicks: { type: Number, default: 0 },
        conversions: { type: Number, default: 0 },
        spend: { type: Number, default: 0 },
        ctr: { type: Number, default: 0 },
        cpc: { type: Number, default: 0 },
        cpm: { type: Number, default: 0 },
        roas: { type: Number, default: 0 },
        frequency: { type: Number, default: 0 },
        videoViews: { type: Number, default: 0 },
        videoCompletions: { type: Number, default: 0 }
    },

    // N8N Workflow Tracking
    n8nWorkflowId: String,
    n8nExecutionId: String,
    webhookResponse: mongoose.Schema.Types.Mixed,

    // Error Tracking
    errors: [{
        platform: String,
        message: String,
        code: String,
        occurredAt: { type: Date, default: Date.now }
    }],

    // User/Creator
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, { timestamps: true });

// Indexes
publishedAdSchema.index({ status: 1, createdAt: -1 });
publishedAdSchema.index({ 'platforms': 1 });
publishedAdSchema.index({ scheduledFor: 1 });
publishedAdSchema.index({ campaignId: 1 });

const PublishedAd = mongoose.model('PublishedAd', publishedAdSchema);

module.exports = PublishedAd;
