const mongoose = require('mongoose');

// Funnel Stage Schema
const funnelStageSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    order: {
        type: Number,
        required: true
    },
    value: {
        type: Number,
        default: 0
    },
    rate: {
        type: Number,
        default: 0
    },
    date: {
        type: Date,
        default: Date.now
    }
});

// CRO Alert Schema
const croAlertSchema = new mongoose.Schema({
    stage: {
        type: String,
        required: true
    },
    fromStage: String,
    toStage: String,
    dropRate: {
        type: Number,
        required: true
    },
    avgDropRate: {
        type: Number,
        default: 50
    },
    severity: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical'],
        default: 'medium'
    },
    issue: String,
    suggestion: String,
    potentialRevenue: Number,
    status: {
        type: String,
        enum: ['active', 'resolved', 'dismissed'],
        default: 'active'
    },
    resolvedAt: Date
}, { timestamps: true });

// CTA Suggestion Schema
const ctaSuggestionSchema = new mongoose.Schema({
    page: {
        type: String,
        required: true
    },
    element: String,
    current: {
        type: String,
        required: true
    },
    suggested: {
        type: String,
        required: true
    },
    expectedLift: String,
    status: {
        type: String,
        enum: ['pending', 'applied', 'rejected', 'testing'],
        default: 'pending'
    },
    appliedAt: Date,
    actualLift: String
}, { timestamps: true });

// A/B Test Schema
const abTestSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: String,
    variationA: String,
    variationB: String,
    status: {
        type: String,
        enum: ['draft', 'running', 'completed', 'cancelled'],
        default: 'draft'
    },
    impact: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium'
    },
    startDate: Date,
    endDate: Date,
    results: {
        variationAConversions: Number,
        variationBConversions: Number,
        winner: String,
        statisticalSignificance: Number
    }
}, { timestamps: true });

// Page Performance Schema
const pagePerformanceSchema = new mongoose.Schema({
    page: {
        type: String,
        required: true
    },
    url: String,
    views: {
        type: Number,
        default: 0
    },
    bounceRate: {
        type: Number,
        default: 0
    },
    avgTime: String,
    avgTimeSeconds: Number,
    date: {
        type: Date,
        default: Date.now
    }
});

const FunnelStage = mongoose.model('FunnelStage', funnelStageSchema);
const CROAlert = mongoose.model('CROAlert', croAlertSchema);
const CTASuggestion = mongoose.model('CTASuggestion', ctaSuggestionSchema);
const ABTest = mongoose.model('ABTest', abTestSchema);
const PagePerformance = mongoose.model('PagePerformance', pagePerformanceSchema);

module.exports = { FunnelStage, CROAlert, CTASuggestion, ABTest, PagePerformance };
