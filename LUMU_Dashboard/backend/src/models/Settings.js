const mongoose = require('mongoose');

const SettingsSchema = new mongoose.Schema({
    // Meta Ads (Facebook/Instagram)
    metaAds: {
        appId: { type: String, default: '' },
        appSecret: { type: String, default: '' },
        accessToken: { type: String, default: '' },
        adAccountId: { type: String, default: '' },
        pageId: { type: String, default: '' },
        connected: { type: Boolean, default: false }
    },

    // Google Ads (Search, Display, YouTube, Shopping)
    googleAds: {
        developerToken: { type: String, default: '' },
        clientId: { type: String, default: '' },
        clientSecret: { type: String, default: '' },
        refreshToken: { type: String, default: '' },
        customerId: { type: String, default: '' },
        connected: { type: Boolean, default: false }
    },

    // TikTok Ads
    tiktokAds: {
        appId: { type: String, default: '' },
        appSecret: { type: String, default: '' },
        accessToken: { type: String, default: '' },
        advertiserId: { type: String, default: '' },
        businessCenterId: { type: String, default: '' },
        connected: { type: Boolean, default: false }
    },

    // Twitter/X Ads
    twitterAds: {
        apiKey: { type: String, default: '' },
        apiSecret: { type: String, default: '' },
        accessToken: { type: String, default: '' },
        accessTokenSecret: { type: String, default: '' },
        adAccountId: { type: String, default: '' },
        connected: { type: Boolean, default: false }
    },

    // Google Analytics 4
    ga4: {
        propertyId: { type: String, default: '' },
        accessToken: { type: String, default: '' },
        connected: { type: Boolean, default: false }
    },

    // ClickCease
    clickCease: {
        apiKey: { type: String, default: '' },
        domain: { type: String, default: '' },
        connected: { type: Boolean, default: false }
    },

    // OpenAI for AI features
    openai: {
        apiKey: { type: String, default: '' },
        connected: { type: Boolean, default: false }
    },

    // N8N Webhooks
    n8n: {
        dailyReportWebhook: { type: String, default: '' },
        budgetAlertWebhook: { type: String, default: '' },
        fraudAlertWebhook: { type: String, default: '' },
        publishAdsWebhook: { type: String, default: '' }
    },

    // Branding
    branding: {
        dashboardName: { type: String, default: 'Bambly AI' },
        tagline: { type: String, default: 'AI Marketing OS' },
        logoUrl: { type: String, default: '' },
        primaryColor: { type: String, default: '#10b981' }
    },

    // Users
    users: [{
        name: { type: String, required: true },
        email: { type: String, required: true },
        role: { type: String, enum: ['admin', 'manager', 'viewer'], default: 'viewer' },
        active: { type: Boolean, default: true },
        createdAt: { type: Date, default: Date.now }
    }],

    // General settings
    currency: { type: String, default: 'PKR' },
    syncInterval: { type: Number, default: 30 }, // seconds
    dataRetention: { type: Number, default: 90 }, // days
    updatedAt: { type: Date, default: Date.now }
});

// Ensure only one settings document exists
SettingsSchema.statics.getSettings = async function () {
    let settings = await this.findOne();
    if (!settings) {
        settings = await this.create({});
    }
    return settings;
};

module.exports = mongoose.model('Settings', SettingsSchema);
