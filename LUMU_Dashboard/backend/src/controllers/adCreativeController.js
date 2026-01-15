const AdCreative = require('../models/AdCreative');
const axios = require('axios');

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

// Generate AI Creative (using OpenAI GPT-4 + DALL-E)
exports.generateAiCreative = async (req, res) => {
    try {
        const { prompt, type, language, platforms, previewOnly, referenceImages } = req.body;
        const Settings = require('../models/Settings');
        const settings = await Settings.getSettings();

        const openaiApiKey = settings?.openai?.apiKey || process.env.OPENAI_API_KEY;

        if (!openaiApiKey) {
            return res.status(400).json({ error: 'OpenAI API key not configured. Please add it in Settings or .env file.' });
        }

        // 1. Generate ad copy using GPT-4
        let generatedContent = {
            headline: '',
            description: '',
            primaryText: prompt,
            suggestions: []
        };

        try {
            const languageInstruction = language === 'urdu'
                ? 'Write in Urdu script.'
                : language === 'roman_urdu'
                    ? 'Write in Roman Urdu (Urdu written in English letters).'
                    : 'Write in English.';

            const platformContext = platforms?.length > 0
                ? `Optimized for ${platforms.join(', ')}.`
                : 'Optimized for social media ads.';

            const gptResponse = await axios.post(
                'https://api.openai.com/v1/chat/completions',
                {
                    model: 'gpt-4',
                    messages: [
                        {
                            role: 'system',
                            content: `You are an expert ad copywriter for Pakistan market. Create compelling ad copy that converts. ${languageInstruction} ${platformContext}
                            
                            Return JSON format:
                            {
                                "headline": "Short catchy headline (max 25 chars)",
                                "description": "Compelling description (max 90 chars)",
                                "primaryText": "Main ad copy (max 125 chars)",
                                "suggestions": ["suggestion 1", "suggestion 2", "suggestion 3"]
                            }`
                        },
                        {
                            role: 'user',
                            content: `Create ad copy for: ${prompt}`
                        }
                    ],
                    temperature: 0.8,
                    max_tokens: 500
                },
                {
                    headers: {
                        'Authorization': `Bearer ${openaiApiKey}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            const gptContent = gptResponse.data.choices[0]?.message?.content;
            if (gptContent) {
                try {
                    // Try to parse JSON response
                    const parsed = JSON.parse(gptContent);
                    generatedContent = {
                        headline: parsed.headline || 'Your Perfect Choice',
                        description: parsed.description || 'Premium quality products at best prices',
                        primaryText: parsed.primaryText || prompt,
                        suggestions: parsed.suggestions || ['Add discount', 'Mention free delivery', 'Include COD option']
                    };
                } catch (parseErr) {
                    // If not JSON, use raw text
                    generatedContent.headline = gptContent.substring(0, 50);
                    generatedContent.description = gptContent.substring(0, 100);
                }
            }
        } catch (gptError) {
            console.error('GPT Error:', gptError.response?.data || gptError.message);
            // Use fallback content
            generatedContent = {
                headline: `${prompt.substring(0, 20)}...`,
                description: 'Premium quality at best prices in Pakistan!',
                primaryText: prompt,
                suggestions: ['Add a discount offer', 'Mention free delivery', 'Include COD option']
            };
        }

        // 2. Generate image using DALL-E 3
        let generatedImageUrl = 'https://via.placeholder.com/1024x1024/9333ea/ffffff?text=AI+Generated';

        if (type === 'image' || !type) {
            try {
                const imagePrompt = `Professional ${type === 'video' ? 'video thumbnail' : 'advertisement image'} for: ${prompt}. 
                Style: Modern, clean, premium, suitable for Pakistan market. 
                No text on image. High quality product photography style.`;

                const dalleResponse = await axios.post(
                    'https://api.openai.com/v1/images/generations',
                    {
                        model: 'dall-e-3',
                        prompt: imagePrompt,
                        n: 1,
                        size: '1024x1024',
                        quality: 'standard',
                        response_format: 'url'
                    },
                    {
                        headers: {
                            'Authorization': `Bearer ${openaiApiKey}`,
                            'Content-Type': 'application/json'
                        }
                    }
                );

                generatedImageUrl = dalleResponse.data.data[0]?.url || generatedImageUrl;
            } catch (dalleError) {
                console.error('DALL-E Error:', dalleError.response?.data || dalleError.message);
                // Keep placeholder image
            }
        }

        // If previewOnly, just return the preview data without saving
        if (previewOnly) {
            return res.status(200).json({
                success: true,
                preview: true,
                generatedImageUrl,
                content: {
                    headline: generatedContent.headline,
                    description: generatedContent.description,
                    primaryText: generatedContent.primaryText
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
                model: 'gpt-4 + dall-e-3',
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
