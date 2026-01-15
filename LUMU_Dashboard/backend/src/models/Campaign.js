const mongoose = require('mongoose');

const CampaignSchema = new mongoose.Schema({
    // Basic Info
    name: {
        type: String,
        required: [true, 'Campaign name is required'],
        trim: true
    },
    description: {
        type: String,
        default: ''
    },
    objective: {
        type: String,
        enum: ['sales', 'awareness', 'retargeting', 'traffic', 'engagement', 'leads', 'app_installs', 'video_views'],
        default: 'sales'
    },
    status: {
        type: String,
        enum: ['draft', 'pending', 'active', 'paused', 'completed'],
        default: 'draft'
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
    bidAmount: Number,

    // Scheduling
    schedule: {
        startDate: { type: Date },
        endDate: { type: Date },
        timezone: { type: String, default: 'Asia/Karachi' }
    },

    // Platforms
    platforms: [{
        type: String,
        enum: ['facebook', 'instagram', 'google', 'youtube', 'tiktok']
    }],

    // Ad Placements per platform
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

    // Destination URL (required for ads)
    linkUrl: {
        type: String,
        default: ''
    },
    displayUrl: String,

    // Targeting
    targeting: {
        locations: [{
            city: String,
            region: String,
            country: { type: String, default: 'Pakistan' }
        }],
        countries: { type: [String], default: ['PK'] },
        ageRange: {
            min: { type: Number, default: 18, min: 13, max: 65 },
            max: { type: Number, default: 65, min: 18, max: 65 }
        },
        gender: {
            type: String,
            enum: ['all', 'male', 'female'],
            default: 'all'
        },
        interests: [String],
        behaviors: [String],
        customAudiences: [String],
        lookalikeAudiences: [String],
        excludedAudiences: [String],
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
        languages: { type: [String], default: ['en', 'ur'] }
    },

    // Tracking Pixels
    tracking: {
        facebookPixelId: String,
        googleConversionId: String,
        tiktokPixelId: String,
        utmSource: String,
        utmMedium: String,
        utmCampaign: String
    },

    // Performance Metrics (updated automatically)
    metrics: {
        reach: { type: Number, default: 0 },
        impressions: { type: Number, default: 0 },
        clicks: { type: Number, default: 0 },
        conversions: { type: Number, default: 0 },
        revenue: { type: Number, default: 0 },
        ctr: { type: Number, default: 0 },
        cpc: { type: Number, default: 0 },
        cpm: { type: Number, default: 0 },
        roas: { type: Number, default: 0 },
        frequency: { type: Number, default: 0 }
    },

    // AI Agent Suggestions
    aiSuggestions: [{
        agentName: String,
        suggestion: String,
        action: String,
        confidence: Number,
        applied: { type: Boolean, default: false },
        createdAt: { type: Date, default: Date.now }
    }],

    // Relations
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },

    // Timestamps
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

// Indexes
CampaignSchema.index({ status: 1, createdAt: -1 });
CampaignSchema.index({ 'platforms': 1 });

// Calculate CTR, CPC, ROAS before saving
CampaignSchema.pre('save', function () {
    if (this.metrics && this.budget) {
        if (this.metrics.clicks > 0 && this.metrics.impressions > 0) {
            this.metrics.ctr = (this.metrics.clicks / this.metrics.impressions) * 100;
        }
        if (this.metrics.clicks > 0 && this.budget.spent > 0) {
            this.metrics.cpc = this.budget.spent / this.metrics.clicks;
        }
        if (this.metrics.impressions > 0 && this.budget.spent > 0) {
            this.metrics.cpm = (this.budget.spent / this.metrics.impressions) * 1000;
        }
        if (this.budget.spent > 0 && this.metrics.revenue > 0) {
            this.metrics.roas = this.metrics.revenue / this.budget.spent;
        }
    }
});

module.exports = mongoose.model('Campaign', CampaignSchema);
