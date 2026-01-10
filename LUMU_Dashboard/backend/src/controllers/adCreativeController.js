const AdCreative = require('../models/AdCreative');

// Get all creatives
exports.getAllCreatives = async (req, res) => {
    try {
        const { status, type, campaignId, usage } = req.query;
        let query = {};

        if (status) query.status = status;
        if (type) query.creativeType = type;
        if (campaignId) query.campaignId = campaignId;
        if (usage) query['usage.usageType'] = usage;

        const creatives = await AdCreative.find(query)
            .sort({ createdAt: -1 })
            .populate('campaignId', 'name status')
            .populate('createdBy', 'name email');

        res.json(creatives);
    } catch (error) {
        console.error('Get Creatives Error:', error);
        res.status(500).json({ error: error.message });
    }
};

// Get creative by ID
exports.getCreativeById = async (req, res) => {
    try {
        const creative = await AdCreative.findById(req.params.id)
            .populate('campaignId', 'name status')
            .populate('createdBy', 'name email');

        if (!creative) {
            return res.status(404).json({ error: 'Creative not found' });
        }

        res.json(creative);
    } catch (error) {
        console.error('Get Creative Error:', error);
        res.status(500).json({ error: error.message });
    }
};

// Create creative (Manual)
exports.createCreative = async (req, res) => {
    try {
        const creative = await AdCreative.create(req.body);
        res.status(201).json({ success: true, creative });
    } catch (error) {
        console.error('Create Creative Error:', error);
        res.status(500).json({ error: error.message });
    }
};

// Update creative
exports.updateCreative = async (req, res) => {
    try {
        const creative = await AdCreative.findByIdAndUpdate(
            req.params.id,
            { ...req.body, updatedAt: new Date() },
            { new: true, runValidators: true }
        );

        if (!creative) {
            return res.status(404).json({ error: 'Creative not found' });
        }

        res.json({ success: true, creative });
    } catch (error) {
        console.error('Update Creative Error:', error);
        res.status(500).json({ error: error.message });
    }
};

// Delete creative
exports.deleteCreative = async (req, res) => {
    try {
        const creative = await AdCreative.findByIdAndDelete(req.params.id);

        if (!creative) {
            return res.status(404).json({ error: 'Creative not found' });
        }

        res.json({ success: true, message: 'Creative deleted successfully' });
    } catch (error) {
        console.error('Delete Creative Error:', error);
        res.status(500).json({ error: error.message });
    }
};

// Generate AI Creative (using OpenAI)
exports.generateAiCreative = async (req, res) => {
    try {
        const { prompt, type, language, platforms, previewOnly } = req.body;
        const Settings = require('../models/Settings');
        const settings = await Settings.getSettings();

        if (!settings.openai.apiKey) {
            return res.status(400).json({ error: 'OpenAI API key not configured. Please add it in Settings.' });
        }

        // Here you would call OpenAI API
        // For now, return mock generated content
        const generatedContent = {
            headline: `AI Generated Headline for ${type}`,
            description: 'This is an AI-generated description optimized for Pakistan audience.',
            primaryText: prompt,
            suggestions: [
                'Consider adding a discount percentage',
                'Include free delivery message',
                'Mention COD (Cash on Delivery) option'
            ]
        };

        // Mock generated image URL (would come from AI image generation)
        const generatedImageUrl = 'https://via.placeholder.com/512x512/9333ea/ffffff?text=AI+Generated';

        // If previewOnly, just return the preview data without saving
        if (previewOnly) {
            return res.status(200).json({
                success: true,
                preview: true,
                generatedImageUrl,
                content: {
                    headline: generatedContent.headline,
                    description: generatedContent.description
                },
                suggestions: generatedContent.suggestions
            });
        }

        // Create creative with AI flag
        const creative = await AdCreative.create({
            name: `AI Creative - ${new Date().toISOString().split('T')[0]}`,
            creativeType: type || 'image',
            content: {
                headline: generatedContent.headline,
                description: generatedContent.description,
                primaryText: generatedContent.primaryText,
                language: language || 'english'
            },
            media: {
                imageUrl: generatedImageUrl
            },
            aiGenerated: {
                isAiGenerated: true,
                prompt: prompt,
                model: 'gpt-4',
                generatedAt: new Date()
            },
            usage: {
                usageType: 'ad',
                platforms: platforms || ['facebook', 'instagram']
            },
            status: 'draft'
        });

        res.status(201).json({
            success: true,
            creative,
            suggestions: generatedContent.suggestions
        });
    } catch (error) {
        console.error('Generate AI Creative Error:', error);
        res.status(500).json({ error: error.message });
    }
};

// Update creative status
exports.updateStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const creative = await AdCreative.findByIdAndUpdate(
            req.params.id,
            { status, updatedAt: new Date() },
            { new: true }
        );

        if (!creative) {
            return res.status(404).json({ error: 'Creative not found' });
        }

        res.json({ success: true, creative });
    } catch (error) {
        console.error('Update Status Error:', error);
        res.status(500).json({ error: error.message });
    }
};

// Set usage type (post/ad)
exports.setUsage = async (req, res) => {
    try {
        const { usageType, platforms } = req.body;

        const creative = await AdCreative.findByIdAndUpdate(
            req.params.id,
            {
                'usage.usageType': usageType,
                'usage.platforms': platforms
            },
            { new: true }
        );

        if (!creative) {
            return res.status(404).json({ error: 'Creative not found' });
        }

        res.json({ success: true, creative });
    } catch (error) {
        console.error('Set Usage Error:', error);
        res.status(500).json({ error: error.message });
    }
};

// Schedule post
exports.schedulePost = async (req, res) => {
    try {
        const { pageId, pageName, hashtags, scheduledAt } = req.body;

        const creative = await AdCreative.findByIdAndUpdate(
            req.params.id,
            {
                'postSettings.pageId': pageId,
                'postSettings.pageName': pageName,
                'postSettings.hashtags': hashtags,
                'postSettings.scheduledAt': new Date(scheduledAt),
                'usage.usageType': 'post'
            },
            { new: true }
        );

        if (!creative) {
            return res.status(404).json({ error: 'Creative not found' });
        }

        res.json({ success: true, message: 'Post scheduled successfully', creative });
    } catch (error) {
        console.error('Schedule Post Error:', error);
        res.status(500).json({ error: error.message });
    }
};

// Get creative stats
exports.getCreativeStats = async (req, res) => {
    try {
        const stats = await AdCreative.aggregate([
            {
                $group: {
                    _id: null,
                    totalCreatives: { $sum: 1 },
                    aiGenerated: {
                        $sum: { $cond: ['$aiGenerated.isAiGenerated', 1, 0] }
                    },
                    liveAds: {
                        $sum: { $cond: [{ $eq: ['$status', 'live'] }, 1, 0] }
                    },
                    scheduledPosts: {
                        $sum: { $cond: [{ $ne: ['$postSettings.scheduledAt', null] }, 1, 0] }
                    }
                }
            }
        ]);

        res.json(stats[0] || { totalCreatives: 0, aiGenerated: 0, liveAds: 0, scheduledPosts: 0 });
    } catch (error) {
        console.error('Get Creative Stats Error:', error);
        res.status(500).json({ error: error.message });
    }
};
