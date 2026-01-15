const mongoose = require('mongoose');

const triggerRuleSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['weather', 'time', 'seasonal', 'custom'],
        default: 'custom'
    },
    condition: {
        type: String,
        required: true
    },
    conditionDetails: {
        // For weather triggers
        temperature: { min: Number, max: Number },
        weatherType: String, // sunny, rainy, cloudy, etc.

        // For time triggers
        startHour: Number,
        endHour: Number,
        days: [String], // ['Monday', 'Tuesday', etc.]

        // For seasonal triggers
        startDate: Date,
        endDate: Date
    },
    action: {
        type: String,
        required: true
    },
    actionDetails: {
        campaignIds: [String],
        budgetChange: Number, // percentage
        platforms: [String],
        creativeSets: [String]
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'paused'],
        default: 'active'
    },
    triggered: {
        type: Number,
        default: 0
    },
    lastTriggered: Date,
    lastTriggeredResult: String,
    priority: {
        type: Number,
        default: 5 // 1-10 scale
    }
}, { timestamps: true });

// Seasonal Event Schema
const seasonalEventSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    slug: {
        type: String,
        unique: true
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    isActive: {
        type: Boolean,
        default: false
    },
    rules: [{
        description: String,
        action: String,
        isApplied: { type: Boolean, default: false }
    }],
    expectedImpact: String,
    actualImpact: String,
    notes: String
}, { timestamps: true });

// Weather Data Cache
const weatherCacheSchema = new mongoose.Schema({
    city: {
        type: String,
        required: true
    },
    country: {
        type: String,
        default: 'Pakistan'
    },
    temperature: Number,
    condition: String,
    humidity: Number,
    wind: Number,
    forecast: [{
        day: String,
        temp: Number,
        condition: String
    }],
    fetchedAt: {
        type: Date,
        default: Date.now
    }
});

// Auto-expire weather cache after 1 hour
weatherCacheSchema.index({ fetchedAt: 1 }, { expireAfterSeconds: 3600 });

const TriggerRule = mongoose.model('TriggerRule', triggerRuleSchema);
const SeasonalEvent = mongoose.model('SeasonalEvent', seasonalEventSchema);
const WeatherCache = mongoose.model('WeatherCache', weatherCacheSchema);

module.exports = { TriggerRule, SeasonalEvent, WeatherCache };
