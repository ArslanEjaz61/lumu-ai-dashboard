const mongoose = require('mongoose');

const insightSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['recommendation', 'alert', 'forecast', 'report'],
        required: true
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical'],
        default: 'medium'
    },
    status: {
        type: String,
        enum: ['active', 'acknowledged', 'resolved', 'dismissed'],
        default: 'active'
    },
    category: {
        type: String,
        enum: ['budget', 'performance', 'fraud', 'audience', 'creative', 'geo'],
        required: true
    },
    platform: {
        type: String,
        enum: ['meta', 'google', 'all'],
        default: 'all'
    },
    data: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    actionItems: [{
        action: String,
        completed: { type: Boolean, default: false }
    }],
    generatedBy: {
        type: String,
        enum: ['n8n', 'system', 'manual'],
        default: 'n8n'
    },
    expiresAt: {
        type: Date
    }
}, {
    timestamps: true
});

// Index for efficient queries
insightSchema.index({ type: 1, status: 1 });
insightSchema.index({ priority: -1, createdAt: -1 });

module.exports = mongoose.model('Insight', insightSchema);
