// Retargeting Controller - Customer Lifecycle & Retargeting with Real MongoDB Data
const { RetargetingFlow, CustomerSegment, RetargetingActivity, ChannelPerformance } = require('../models/RetargetingFlow');

// Get all flows
exports.getFlows = async (req, res) => {
    try {
        const flows = await RetargetingFlow.find().sort({ createdAt: -1 });
        res.json({ flows });
    } catch (error) {
        console.error('Flows Error:', error);
        res.status(500).json({ error: 'Failed to get flows' });
    }
};

// Create new flow
exports.createFlow = async (req, res) => {
    try {
        const { name, type, triggers, triggerConditions, steps } = req.body;

        const flow = new RetargetingFlow({
            name,
            type: type || 'custom',
            triggers,
            triggerConditions,
            steps: steps || []
        });

        await flow.save();

        res.status(201).json({ success: true, flow });
    } catch (error) {
        console.error('Create Flow Error:', error);
        res.status(500).json({ error: 'Failed to create flow' });
    }
};

// Update flow
exports.updateFlow = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const flow = await RetargetingFlow.findByIdAndUpdate(id, updates, { new: true });

        if (!flow) {
            return res.status(404).json({ error: 'Flow not found' });
        }

        res.json({ success: true, flow });
    } catch (error) {
        console.error('Update Flow Error:', error);
        res.status(500).json({ error: 'Failed to update flow' });
    }
};

// Delete flow
exports.deleteFlow = async (req, res) => {
    try {
        const { id } = req.params;

        const flow = await RetargetingFlow.findByIdAndDelete(id);

        if (!flow) {
            return res.status(404).json({ error: 'Flow not found' });
        }

        res.json({ success: true, deletedId: id });
    } catch (error) {
        console.error('Delete Flow Error:', error);
        res.status(500).json({ error: 'Failed to delete flow' });
    }
};

// Toggle flow status
exports.toggleFlow = async (req, res) => {
    try {
        const { id } = req.params;

        const flow = await RetargetingFlow.findById(id);
        if (!flow) {
            return res.status(404).json({ error: 'Flow not found' });
        }

        flow.status = flow.status === 'active' ? 'paused' : 'active';
        await flow.save();

        res.json({ success: true, flow });
    } catch (error) {
        console.error('Toggle Flow Error:', error);
        res.status(500).json({ error: 'Failed to toggle flow' });
    }
};

// Update flow metrics (for n8n agents)
exports.updateFlowMetrics = async (req, res) => {
    try {
        const { id } = req.params;
        const { audience, conversions, revenue } = req.body;

        const flow = await RetargetingFlow.findById(id);
        if (!flow) {
            return res.status(404).json({ error: 'Flow not found' });
        }

        if (audience !== undefined) flow.audience = audience;
        if (conversions !== undefined) flow.conversions = conversions;
        if (revenue !== undefined) flow.revenue = revenue;

        flow.conversionRate = flow.audience > 0 ? ((flow.conversions / flow.audience) * 100).toFixed(2) : 0;

        await flow.save();

        res.json({ success: true, flow });
    } catch (error) {
        console.error('Update Metrics Error:', error);
        res.status(500).json({ error: 'Failed to update flow metrics' });
    }
};

// Get customer segments
exports.getSegments = async (req, res) => {
    try {
        const segments = await CustomerSegment.find().sort({ count: -1 });
        res.json({ segments });
    } catch (error) {
        console.error('Segments Error:', error);
        res.status(500).json({ error: 'Failed to get segments' });
    }
};

// Create/Update segment
exports.upsertSegment = async (req, res) => {
    try {
        const { slug, name, description, criteria, count, actions, color, icon } = req.body;

        const segment = await CustomerSegment.findOneAndUpdate(
            { slug },
            { name, description, criteria, count, actions, color, icon, lastUpdated: new Date() },
            { new: true, upsert: true }
        );

        res.json({ success: true, segment });
    } catch (error) {
        console.error('Upsert Segment Error:', error);
        res.status(500).json({ error: 'Failed to save segment' });
    }
};

// Get recent activity
exports.getActivity = async (req, res) => {
    try {
        const activity = await RetargetingActivity.find()
            .sort({ createdAt: -1 })
            .limit(50);

        res.json({ activity });
    } catch (error) {
        console.error('Activity Error:', error);
        res.status(500).json({ error: 'Failed to get activity' });
    }
};

// Log activity (for n8n agents)
exports.logActivity = async (req, res) => {
    try {
        const { flow, flowId, user, userId, action, actionType, status, revenue, metadata } = req.body;

        const activity = new RetargetingActivity({
            flow,
            flowId,
            user,
            userId,
            action,
            actionType,
            status: status || 'sent',
            revenue,
            metadata
        });

        await activity.save();

        // Update flow conversion count if converted
        if (status === 'converted' && flowId) {
            await RetargetingFlow.findByIdAndUpdate(flowId, {
                $inc: { conversions: 1, revenue: revenue || 0 }
            });
        }

        res.status(201).json({ success: true, activity });
    } catch (error) {
        console.error('Log Activity Error:', error);
        res.status(500).json({ error: 'Failed to log activity' });
    }
};

// Get channel performance
exports.getChannelPerformance = async (req, res) => {
    try {
        // Get latest performance for each channel
        const channels = await ChannelPerformance.aggregate([
            { $sort: { date: -1 } },
            {
                $group: {
                    _id: '$channel',
                    channel: { $first: '$channel' },
                    metrics: { $first: '$metrics' },
                    rates: { $first: '$rates' },
                    date: { $first: '$date' }
                }
            }
        ]);

        // Transform to expected format
        const performance = {};
        for (const ch of channels) {
            performance[ch.channel] = {
                ...ch.metrics,
                ...ch.rates
            };
        }

        res.json({ channels: performance });
    } catch (error) {
        console.error('Channel Error:', error);
        res.status(500).json({ error: 'Failed to get channel performance' });
    }
};

// Update channel performance (for data sync)
exports.updateChannelPerformance = async (req, res) => {
    try {
        const { channel, metrics, rates } = req.body;

        const performance = await ChannelPerformance.findOneAndUpdate(
            { channel, date: { $gte: new Date().setHours(0, 0, 0, 0) } },
            { metrics, rates },
            { new: true, upsert: true }
        );

        res.json({ success: true, performance });
    } catch (error) {
        console.error('Update Channel Error:', error);
        res.status(500).json({ error: 'Failed to update channel performance' });
    }
};
