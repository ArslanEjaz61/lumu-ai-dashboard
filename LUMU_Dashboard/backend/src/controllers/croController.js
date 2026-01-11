// CRO Controller - Conversion Rate Optimization with Real MongoDB Data
const { FunnelStage, CROAlert, CTASuggestion, ABTest, PagePerformance } = require('../models/CROData');

// Get funnel data
exports.getFunnel = async (req, res) => {
    try {
        // Get latest funnel stages
        const funnel = await FunnelStage.find().sort({ order: 1 });

        // Get overall metrics
        const pageViews = funnel.find(f => f.name === 'Page Views')?.value || 100000;
        const purchases = funnel.find(f => f.name === 'Purchase')?.value || 2500;
        const cartValue = funnel.find(f => f.name === 'Add to Cart')?.value || 12000;

        const conversionRate = pageViews > 0 ? ((purchases / pageViews) * 100).toFixed(2) : 0;
        const cartAbandonment = cartValue > 0 ? (((cartValue - purchases) / cartValue) * 100).toFixed(0) : 0;

        // Get active alerts count
        const activeAlerts = await CROAlert.countDocuments({ status: 'active' });

        const metrics = {
            conversionRate: parseFloat(conversionRate),
            industryAvg: 2.1,
            cartAbandonment: parseInt(cartAbandonment),
            avgOrderValue: 4500,
            revenueLost: parseInt(cartAbandonment) * 4500 * 0.1,
            activeAlerts
        };

        res.json({ funnel, metrics });
    } catch (error) {
        console.error('Funnel Error:', error);
        res.status(500).json({ error: 'Failed to get funnel' });
    }
};

// Get drop-off alerts
exports.getAlerts = async (req, res) => {
    try {
        const alerts = await CROAlert.find({ status: 'active' })
            .sort({ severity: -1, dropRate: -1 });

        res.json({ alerts });
    } catch (error) {
        console.error('Alerts Error:', error);
        res.status(500).json({ error: 'Failed to get alerts' });
    }
};

// Create CRO alert (for AI agents)
exports.createAlert = async (req, res) => {
    try {
        const { stage, fromStage, toStage, dropRate, avgDropRate, severity, issue, suggestion, potentialRevenue } = req.body;

        const alert = new CROAlert({
            stage,
            fromStage,
            toStage,
            dropRate,
            avgDropRate,
            severity,
            issue,
            suggestion,
            potentialRevenue
        });

        await alert.save();

        res.status(201).json({ success: true, alert });
    } catch (error) {
        console.error('Create Alert Error:', error);
        res.status(500).json({ error: 'Failed to create alert' });
    }
};

// Resolve alert
exports.resolveAlert = async (req, res) => {
    try {
        const { id } = req.params;

        const alert = await CROAlert.findByIdAndUpdate(
            id,
            { status: 'resolved', resolvedAt: new Date() },
            { new: true }
        );

        res.json({ success: true, alert });
    } catch (error) {
        console.error('Resolve Alert Error:', error);
        res.status(500).json({ error: 'Failed to resolve alert' });
    }
};

// Get CTA suggestions
exports.getSuggestions = async (req, res) => {
    try {
        const suggestions = await CTASuggestion.find({ status: { $in: ['pending', 'testing'] } })
            .sort({ createdAt: -1 });

        const abTests = await ABTest.find({ status: { $in: ['draft', 'running'] } })
            .sort({ impact: -1 });

        res.json({ suggestions, abTests });
    } catch (error) {
        console.error('Suggestions Error:', error);
        res.status(500).json({ error: 'Failed to get suggestions' });
    }
};

// Apply CTA suggestion
exports.applySuggestion = async (req, res) => {
    try {
        const { suggestionId } = req.body;

        const suggestion = await CTASuggestion.findByIdAndUpdate(
            suggestionId,
            { status: 'applied', appliedAt: new Date() },
            { new: true }
        );

        if (!suggestion) {
            return res.status(404).json({ error: 'Suggestion not found' });
        }

        res.json({
            success: true,
            message: 'CTA suggestion applied',
            suggestion
        });
    } catch (error) {
        console.error('Apply Error:', error);
        res.status(500).json({ error: 'Failed to apply suggestion' });
    }
};

// Create CTA suggestion (for AI agents)
exports.createSuggestion = async (req, res) => {
    try {
        const { page, element, current, suggested, expectedLift } = req.body;

        const suggestion = new CTASuggestion({
            page,
            element,
            current,
            suggested,
            expectedLift
        });

        await suggestion.save();

        res.status(201).json({ success: true, suggestion });
    } catch (error) {
        console.error('Create Suggestion Error:', error);
        res.status(500).json({ error: 'Failed to create suggestion' });
    }
};

// Get page performance
exports.getPagePerformance = async (req, res) => {
    try {
        const pages = await PagePerformance.find()
            .sort({ views: -1 })
            .limit(10);

        res.json({ pages });
    } catch (error) {
        console.error('Performance Error:', error);
        res.status(500).json({ error: 'Failed to get page performance' });
    }
};

// Update page performance (for data sync)
exports.updatePagePerformance = async (req, res) => {
    try {
        const { page, url, views, bounceRate, avgTime, avgTimeSeconds } = req.body;

        const performance = await PagePerformance.findOneAndUpdate(
            { page },
            { url, views, bounceRate, avgTime, avgTimeSeconds, date: new Date() },
            { new: true, upsert: true }
        );

        res.json({ success: true, performance });
    } catch (error) {
        console.error('Update Performance Error:', error);
        res.status(500).json({ error: 'Failed to update performance' });
    }
};

// Update funnel stage (for data sync)
exports.updateFunnelStage = async (req, res) => {
    try {
        const { name, order, value, rate } = req.body;

        const stage = await FunnelStage.findOneAndUpdate(
            { name },
            { order, value, rate, date: new Date() },
            { new: true, upsert: true }
        );

        res.json({ success: true, stage });
    } catch (error) {
        console.error('Update Funnel Error:', error);
        res.status(500).json({ error: 'Failed to update funnel stage' });
    }
};

// Create/Update A/B Test
exports.upsertABTest = async (req, res) => {
    try {
        const { id, name, description, variationA, variationB, status, impact, startDate, endDate } = req.body;

        let test;
        if (id) {
            test = await ABTest.findByIdAndUpdate(id, req.body, { new: true });
        } else {
            test = new ABTest({ name, description, variationA, variationB, status, impact, startDate, endDate });
            await test.save();
        }

        res.json({ success: true, test });
    } catch (error) {
        console.error('A/B Test Error:', error);
        res.status(500).json({ error: 'Failed to save A/B test' });
    }
};
