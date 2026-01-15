// Budget Controller - AI Budget Optimization with Real MongoDB Data
const { BudgetAllocation, HourlySpend, BudgetRecommendation } = require('../models/BudgetAllocation');
const Campaign = require('../models/Campaign');

// Get budget allocation
exports.getAllocation = async (req, res) => {
    try {
        // Get all budget allocations
        const allocations = await BudgetAllocation.find({ isActive: true }).sort({ percentage: -1 });

        // Calculate totals
        const totalBudget = allocations.reduce((sum, a) => sum + a.totalBudget, 0);
        const totalSpent = allocations.reduce((sum, a) => sum + a.spent, 0);
        const totalRemaining = allocations.reduce((sum, a) => sum + a.remaining, 0);

        // Get day/night aggregated data
        const dayPerformance = {
            spend: allocations.reduce((sum, a) => sum + (a.dayPerformance?.spend || 0), 0),
            conversions: allocations.reduce((sum, a) => sum + (a.dayPerformance?.conversions || 0), 0),
            cpc: allocations.length > 0 ? allocations.reduce((sum, a) => sum + (a.dayPerformance?.cpc || 0), 0) / allocations.length : 0,
            roas: allocations.length > 0 ? allocations.reduce((sum, a) => sum + (a.dayPerformance?.roas || 0), 0) / allocations.length : 0
        };

        const nightPerformance = {
            spend: allocations.reduce((sum, a) => sum + (a.nightPerformance?.spend || 0), 0),
            conversions: allocations.reduce((sum, a) => sum + (a.nightPerformance?.conversions || 0), 0),
            cpc: allocations.length > 0 ? allocations.reduce((sum, a) => sum + (a.nightPerformance?.cpc || 0), 0) / allocations.length : 0,
            roas: allocations.length > 0 ? allocations.reduce((sum, a) => sum + (a.nightPerformance?.roas || 0), 0) / allocations.length : 0
        };

        // Get hourly spend for today
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const hourlySpend = await HourlySpend.find({
            date: { $gte: today }
        }).sort({ hour: 1 });

        // Calculate average ROAS
        const avgRoas = totalSpent > 0 ? ((nightPerformance.roas + dayPerformance.roas) / 2).toFixed(1) : 0;

        res.json({
            totalBudget: totalBudget || 100000,
            totalSpent: totalSpent || 0,
            totalRemaining: totalRemaining || totalBudget,
            avgRoas: parseFloat(avgRoas),
            allocation: allocations.map(a => ({
                platform: a.platform,
                percentage: a.percentage,
                spent: a.spent,
                remaining: a.remaining,
                color: a.color
            })),
            dayNight: {
                day: dayPerformance,
                night: nightPerformance
            },
            hourlySpend: hourlySpend.length > 0 ? hourlySpend : [
                { hour: '6AM', spend: 0, conversions: 0 },
                { hour: '9AM', spend: 0, conversions: 0 },
                { hour: '12PM', spend: 0, conversions: 0 },
                { hour: '3PM', spend: 0, conversions: 0 },
                { hour: '6PM', spend: 0, conversions: 0 },
                { hour: '9PM', spend: 0, conversions: 0 },
                { hour: '12AM', spend: 0, conversions: 0 }
            ]
        });
    } catch (error) {
        console.error('Allocation Error:', error);
        res.status(500).json({ error: 'Failed to get allocation' });
    }
};

// Update budget allocation
exports.updateAllocation = async (req, res) => {
    try {
        const { platform, percentage, dailyBudget, totalBudget } = req.body;

        const allocation = await BudgetAllocation.findOneAndUpdate(
            { platform },
            {
                percentage,
                dailyBudget,
                totalBudget,
                remaining: totalBudget
            },
            { new: true, upsert: true }
        );

        res.json({
            success: true,
            message: 'Budget allocation updated',
            allocation
        });
    } catch (error) {
        console.error('Update Error:', error);
        res.status(500).json({ error: 'Failed to update allocation' });
    }
};

// Get AI recommendations
exports.getRecommendations = async (req, res) => {
    try {
        const recommendations = await BudgetRecommendation.find({ status: 'pending' })
            .sort({ priority: -1, createdAt: -1 })
            .limit(10);

        res.json({ recommendations });
    } catch (error) {
        console.error('Recommendations Error:', error);
        res.status(500).json({ error: 'Failed to get recommendations' });
    }
};

// Apply AI recommendation
exports.applyRecommendation = async (req, res) => {
    try {
        const { recommendationId } = req.body;

        const recommendation = await BudgetRecommendation.findByIdAndUpdate(
            recommendationId,
            {
                status: 'applied',
                appliedAt: new Date()
            },
            { new: true }
        );

        if (!recommendation) {
            return res.status(404).json({ error: 'Recommendation not found' });
        }

        // Apply the recommendation to budget allocation
        if (recommendation.platform && recommendation.type) {
            const allocation = await BudgetAllocation.findOne({ platform: recommendation.platform });
            if (allocation) {
                allocation.recommendationsApplied.push({
                    type: recommendation.type,
                    suggestion: recommendation.suggested,
                    appliedAt: new Date(),
                    impact: recommendation.impact
                });
                await allocation.save();
            }
        }

        res.json({
            success: true,
            message: 'Recommendation applied successfully',
            recommendation
        });
    } catch (error) {
        console.error('Apply Error:', error);
        res.status(500).json({ error: 'Failed to apply recommendation' });
    }
};

// Create recommendation (for AI agents)
exports.createRecommendation = async (req, res) => {
    try {
        const { type, platform, current, suggested, reason, impact, priority } = req.body;

        const recommendation = new BudgetRecommendation({
            type,
            platform,
            current,
            suggested,
            reason,
            impact,
            priority: priority || 'medium'
        });

        await recommendation.save();

        res.status(201).json({
            success: true,
            recommendation
        });
    } catch (error) {
        console.error('Create Recommendation Error:', error);
        res.status(500).json({ error: 'Failed to create recommendation' });
    }
};

// Update hourly spend (for data sync)
exports.updateHourlySpend = async (req, res) => {
    try {
        const { platform, hour, spend, conversions } = req.body;

        const hourlySpend = await HourlySpend.findOneAndUpdate(
            { platform, hour, date: { $gte: new Date().setHours(0, 0, 0, 0) } },
            { spend, conversions },
            { new: true, upsert: true }
        );

        res.json({ success: true, hourlySpend });
    } catch (error) {
        console.error('Hourly Spend Error:', error);
        res.status(500).json({ error: 'Failed to update hourly spend' });
    }
};
