const mongoose = require('mongoose');

const budgetAllocationSchema = new mongoose.Schema({
    platform: {
        type: String,
        required: true,
        enum: ['Facebook', 'Instagram', 'Google Ads', 'YouTube', 'TikTok']
    },
    percentage: {
        type: Number,
        required: true,
        min: 0,
        max: 100
    },
    dailyBudget: {
        type: Number,
        default: 0
    },
    totalBudget: {
        type: Number,
        default: 0
    },
    spent: {
        type: Number,
        default: 0
    },
    remaining: {
        type: Number,
        default: 0
    },
    color: {
        type: String,
        default: '#3b82f6'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    // Day/Night performance tracking
    dayPerformance: {
        spend: { type: Number, default: 0 },
        conversions: { type: Number, default: 0 },
        cpc: { type: Number, default: 0 },
        roas: { type: Number, default: 0 }
    },
    nightPerformance: {
        spend: { type: Number, default: 0 },
        conversions: { type: Number, default: 0 },
        cpc: { type: Number, default: 0 },
        roas: { type: Number, default: 0 }
    },
    // AI Recommendations applied
    recommendationsApplied: [{
        type: { type: String },
        suggestion: String,
        appliedAt: Date,
        impact: String
    }]
}, { timestamps: true });

// Hourly spend tracking
const hourlySpendSchema = new mongoose.Schema({
    platform: String,
    hour: String,
    spend: Number,
    conversions: Number,
    date: { type: Date, default: Date.now }
});

// AI Budget Recommendation
const budgetRecommendationSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['increase', 'decrease', 'shift', 'pause', 'resume']
    },
    platform: String,
    current: mongoose.Schema.Types.Mixed,
    suggested: mongoose.Schema.Types.Mixed,
    reason: String,
    impact: String,
    priority: {
        type: String,
        enum: ['high', 'medium', 'low'],
        default: 'medium'
    },
    status: {
        type: String,
        enum: ['pending', 'applied', 'dismissed'],
        default: 'pending'
    },
    appliedAt: Date
}, { timestamps: true });

const BudgetAllocation = mongoose.model('BudgetAllocation', budgetAllocationSchema);
const HourlySpend = mongoose.model('HourlySpend', hourlySpendSchema);
const BudgetRecommendation = mongoose.model('BudgetRecommendation', budgetRecommendationSchema);

module.exports = { BudgetAllocation, HourlySpend, BudgetRecommendation };
