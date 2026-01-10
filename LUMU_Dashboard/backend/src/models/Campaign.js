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
        enum: ['sales', 'awareness', 'retargeting', 'traffic', 'engagement', 'leads'],
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

    // Scheduling
    schedule: {
        startDate: { type: Date },
        endDate: { type: Date },
        timezone: { type: String, default: 'Asia/Karachi' }
    },

    // Platforms
    platforms: [{
        type: String,
        enum: ['facebook', 'instagram', 'google', 'youtube']
    }],

    // Targeting
    targeting: {
        locations: [{
            city: String,
            region: String,
            country: { type: String, default: 'Pakistan' }
        }],
        ageRange: {
            min: { type: Number, default: 18 },
            max: { type: Number, default: 65 }
        },
        gender: {
            type: String,
            enum: ['all', 'male', 'female'],
            default: 'all'
        },
        interests: [String],
        devices: [{
            type: String,
            enum: ['mobile', 'desktop', 'tablet', 'all']
        }]
    },

    // Performance Metrics (updated automatically)
    metrics: {
        impressions: { type: Number, default: 0 },
        clicks: { type: Number, default: 0 },
        conversions: { type: Number, default: 0 },
        revenue: { type: Number, default: 0 },
        ctr: { type: Number, default: 0 },
        cpc: { type: Number, default: 0 },
        roas: { type: Number, default: 0 }
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

// Calculate CTR, CPC, ROAS before saving
CampaignSchema.pre('save', function () {
    // Only calculate if metrics exist
    if (this.metrics && this.budget) {
        if (this.metrics.clicks > 0 && this.metrics.impressions > 0) {
            this.metrics.ctr = (this.metrics.clicks / this.metrics.impressions) * 100;
        }
        if (this.metrics.clicks > 0 && this.budget.spent > 0) {
            this.metrics.cpc = this.budget.spent / this.metrics.clicks;
        }
        if (this.budget.spent > 0 && this.metrics.revenue > 0) {
            this.metrics.roas = this.metrics.revenue / this.budget.spent;
        }
    }
});

module.exports = mongoose.model('Campaign', CampaignSchema);
