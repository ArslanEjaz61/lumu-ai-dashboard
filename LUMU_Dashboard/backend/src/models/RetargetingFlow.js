const mongoose = require('mongoose');

// Retargeting Flow Schema
const retargetingFlowSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['cart_abandonment', 'viewed_not_purchased', 'wishlist', 'win_back', 'upsell', 'cross_sell', 'custom'],
        default: 'custom'
    },
    triggers: {
        type: String,
        required: true
    },
    triggerConditions: {
        timeDelay: Number, // in hours
        minCartValue: Number,
        productViews: Number,
        daysSinceLastPurchase: Number
    },
    steps: [{
        order: Number,
        type: { type: String, enum: ['email', 'sms', 'ad', 'push', 'whatsapp'] },
        delay: String, // e.g., "1h", "24h", "7d"
        delayMinutes: Number,
        template: String,
        subject: String,
        content: String
    }],
    status: {
        type: String,
        enum: ['active', 'paused', 'draft'],
        default: 'draft'
    },
    audience: {
        type: Number,
        default: 0
    },
    conversions: {
        type: Number,
        default: 0
    },
    revenue: {
        type: Number,
        default: 0
    },
    conversionRate: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

// Customer Segment Schema
const customerSegmentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    slug: {
        type: String,
        unique: true
    },
    description: String,
    criteria: {
        purchaseCount: { min: Number, max: Number },
        totalSpent: { min: Number, max: Number },
        lastPurchaseDays: { min: Number, max: Number },
        avgOrderValue: { min: Number, max: Number }
    },
    count: {
        type: Number,
        default: 0
    },
    actions: [String],
    color: String,
    icon: String,
    isAutoUpdated: {
        type: Boolean,
        default: true
    },
    lastUpdated: Date
}, { timestamps: true });

// Retargeting Activity Log
const retargetingActivitySchema = new mongoose.Schema({
    flow: {
        type: String,
        required: true
    },
    flowId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'RetargetingFlow'
    },
    user: {
        type: String, // masked email
        required: true
    },
    userId: mongoose.Schema.Types.ObjectId,
    action: {
        type: String,
        required: true
    },
    actionType: {
        type: String,
        enum: ['email', 'sms', 'ad', 'push', 'discount']
    },
    status: {
        type: String,
        enum: ['sent', 'delivered', 'opened', 'clicked', 'converted', 'bounced', 'failed'],
        default: 'sent'
    },
    revenue: Number,
    metadata: mongoose.Schema.Types.Mixed
}, { timestamps: true });

// Channel Performance
const channelPerformanceSchema = new mongoose.Schema({
    channel: {
        type: String,
        enum: ['email', 'sms', 'ads', 'push', 'whatsapp'],
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    metrics: {
        sent: { type: Number, default: 0 },
        delivered: { type: Number, default: 0 },
        opened: { type: Number, default: 0 },
        clicked: { type: Number, default: 0 },
        conversions: { type: Number, default: 0 },
        revenue: { type: Number, default: 0 }
    },
    rates: {
        deliveryRate: Number,
        openRate: Number,
        clickRate: Number,
        conversionRate: Number
    }
});

const RetargetingFlow = mongoose.model('RetargetingFlow', retargetingFlowSchema);
const CustomerSegment = mongoose.model('CustomerSegment', customerSegmentSchema);
const RetargetingActivity = mongoose.model('RetargetingActivity', retargetingActivitySchema);
const ChannelPerformance = mongoose.model('ChannelPerformance', channelPerformanceSchema);

module.exports = { RetargetingFlow, CustomerSegment, RetargetingActivity, ChannelPerformance };
