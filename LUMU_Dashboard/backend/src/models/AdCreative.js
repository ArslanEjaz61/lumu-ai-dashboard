const mongoose = require('mongoose');

const AdCreativeSchema = new mongoose.Schema({
    // Basic Info
    name: {
        type: String,
        required: [true, 'Creative name is required'],
        trim: true
    },
    creativeType: {
        type: String,
        enum: ['image', 'video', 'carousel', 'story', 'reel'],
        default: 'image'
    },
    status: {
        type: String,
        enum: ['draft', 'pending', 'approved', 'live', 'paused', 'rejected'],
        default: 'draft'
    },

    // Creative Content
    content: {
        headline: { type: String, default: '' },
        description: { type: String, default: '' },
        primaryText: { type: String, default: '' },
        callToAction: {
            type: String,
            enum: ['shop_now', 'learn_more', 'sign_up', 'contact_us', 'get_offer', 'order_now', 'book_now', 'download'],
            default: 'shop_now'
        },
        language: {
            type: String,
            enum: ['english', 'urdu', 'roman_urdu', 'mixed'],
            default: 'english'
        }
    },

    // Media Files
    media: {
        imageUrl: { type: String, default: '' },
        videoUrl: { type: String, default: '' },
        thumbnailUrl: { type: String, default: '' },
        carouselImages: [{
            url: String,
            headline: String,
            link: String
        }]
    },

    // AI Generation
    aiGenerated: {
        isAiGenerated: { type: Boolean, default: false },
        prompt: { type: String, default: '' },
        model: { type: String, default: '' },
        generatedAt: { type: Date }
    },

    // AI Scoring
    aiScore: {
        overall: { type: Number, default: 0 },
        engagement: { type: Number, default: 0 },
        relevance: { type: Number, default: 0 },
        cultural: { type: Number, default: 0 }
    },

    // Variants (A/B Testing)
    variants: [{
        headline: String,
        description: String,
        imageUrl: String,
        performance: {
            impressions: Number,
            clicks: Number,
            conversions: Number
        }
    }],

    // Usage - can be Post or Ad
    usage: {
        usageType: {
            type: String,
            enum: ['post', 'ad', 'both'],
            default: 'ad'
        },
        platforms: [String]
    },

    // Social Post Settings
    postSettings: {
        pageId: String,
        pageName: String,
        hashtags: [String],
        scheduledAt: Date,
        isPublished: { type: Boolean, default: false },
        publishedAt: Date,
        postId: String
    },

    // Performance Metrics
    metrics: {
        impressions: { type: Number, default: 0 },
        clicks: { type: Number, default: 0 },
        engagement: { type: Number, default: 0 },
        conversions: { type: Number, default: 0 },
        shares: { type: Number, default: 0 },
        comments: { type: Number, default: 0 },
        likes: { type: Number, default: 0 }
    },

    // Relations
    campaignId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Campaign'
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true // Automatically adds createdAt and updatedAt
});

module.exports = mongoose.model('AdCreative', AdCreativeSchema);
