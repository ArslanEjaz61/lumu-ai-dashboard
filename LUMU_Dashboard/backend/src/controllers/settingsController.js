const Settings = require('../models/Settings');

// Get all settings (masked secrets)
exports.getSettings = async (req, res) => {
    try {
        const settings = await Settings.getSettings();

        // Mask sensitive data
        const masked = {
            googleAds: {
                developerToken: settings.googleAds.developerToken ? '••••••••' : '',
                clientId: settings.googleAds.clientId || '',
                clientSecret: settings.googleAds.clientSecret ? '••••••••' : '',
                refreshToken: settings.googleAds.refreshToken ? '••••••••' : '',
                customerId: settings.googleAds.customerId || '',
                connected: settings.googleAds.connected
            },
            metaAds: {
                appId: settings.metaAds.appId || '',
                appSecret: settings.metaAds.appSecret ? '••••••••' : '',
                accessToken: settings.metaAds.accessToken ? '••••••••' : '',
                adAccountId: settings.metaAds.adAccountId || '',
                connected: settings.metaAds.connected
            },
            ga4: {
                propertyId: settings.ga4.propertyId || '',
                accessToken: settings.ga4.accessToken ? '••••••••' : '',
                connected: settings.ga4.connected
            },
            clickCease: {
                apiKey: settings.clickCease.apiKey ? '••••••••' : '',
                domain: settings.clickCease.domain || '',
                connected: settings.clickCease.connected
            },
            openai: {
                apiKey: settings.openai.apiKey ? '••••••••' : '',
                connected: settings.openai.connected
            },
            n8n: settings.n8n,
            branding: settings.branding || { dashboardName: 'LUMU', tagline: 'AI Dashboard', logoUrl: '', primaryColor: '#10b981' },
            users: settings.users || [],
            currency: settings.currency,
            syncInterval: settings.syncInterval,
            dataRetention: settings.dataRetention,
            updatedAt: settings.updatedAt
        };

        res.json(masked);
    } catch (error) {
        console.error('Get Settings Error:', error);
        res.status(500).json({ error: error.message });
    }
};

// Update settings
exports.updateSettings = async (req, res) => {
    try {
        const settings = await Settings.getSettings();
        const updates = req.body;

        // Update each section
        if (updates.googleAds) {
            Object.keys(updates.googleAds).forEach(key => {
                if (updates.googleAds[key] !== '••••••••') {
                    settings.googleAds[key] = updates.googleAds[key];
                }
            });
            settings.googleAds.connected = !!(
                settings.googleAds.developerToken &&
                settings.googleAds.clientId &&
                settings.googleAds.customerId
            );
        }

        if (updates.metaAds) {
            Object.keys(updates.metaAds).forEach(key => {
                if (updates.metaAds[key] !== '••••••••') {
                    settings.metaAds[key] = updates.metaAds[key];
                }
            });
            settings.metaAds.connected = !!(
                settings.metaAds.appId &&
                settings.metaAds.accessToken &&
                settings.metaAds.adAccountId
            );
        }

        if (updates.ga4) {
            Object.keys(updates.ga4).forEach(key => {
                if (updates.ga4[key] !== '••••••••') {
                    settings.ga4[key] = updates.ga4[key];
                }
            });
            settings.ga4.connected = !!(settings.ga4.propertyId && settings.ga4.accessToken);
        }

        if (updates.clickCease) {
            Object.keys(updates.clickCease).forEach(key => {
                if (updates.clickCease[key] !== '••••••••') {
                    settings.clickCease[key] = updates.clickCease[key];
                }
            });
            settings.clickCease.connected = !!(settings.clickCease.apiKey);
        }

        if (updates.openai) {
            Object.keys(updates.openai).forEach(key => {
                if (updates.openai[key] !== '••••••••') {
                    settings.openai[key] = updates.openai[key];
                }
            });
            settings.openai.connected = !!(settings.openai.apiKey);
        }

        if (updates.n8n) {
            settings.n8n = { ...settings.n8n, ...updates.n8n };
        }

        if (updates.branding) {
            if (!settings.branding) {
                settings.branding = { dashboardName: 'LUMU', tagline: 'AI Dashboard', logoUrl: '', primaryColor: '#10b981' };
            }
            if (updates.branding.dashboardName !== undefined) settings.branding.dashboardName = updates.branding.dashboardName;
            if (updates.branding.tagline !== undefined) settings.branding.tagline = updates.branding.tagline;
            if (updates.branding.logoUrl !== undefined) settings.branding.logoUrl = updates.branding.logoUrl;
            if (updates.branding.primaryColor !== undefined) settings.branding.primaryColor = updates.branding.primaryColor;
        }

        if (updates.currency) settings.currency = updates.currency;
        if (updates.syncInterval) settings.syncInterval = updates.syncInterval;
        if (updates.dataRetention) settings.dataRetention = updates.dataRetention;

        settings.updatedAt = new Date();
        await settings.save();

        res.json({ success: true, message: 'Settings updated successfully' });
    } catch (error) {
        console.error('Update Settings Error:', error);
        res.status(500).json({ error: error.message });
    }
};

// Test API connection
exports.testConnection = async (req, res) => {
    try {
        const { platform } = req.params;
        const settings = await Settings.getSettings();

        let result = { success: false, message: 'Unknown platform' };

        switch (platform) {
            case 'google':
                result = settings.googleAds.developerToken
                    ? { success: true, message: 'Google Ads credentials configured' }
                    : { success: false, message: 'Missing Google Ads credentials' };
                break;
            case 'meta':
                result = settings.metaAds.accessToken
                    ? { success: true, message: 'Meta Ads credentials configured' }
                    : { success: false, message: 'Missing Meta Ads credentials' };
                break;
            case 'ga4':
                result = settings.ga4.propertyId
                    ? { success: true, message: 'GA4 credentials configured' }
                    : { success: false, message: 'Missing GA4 credentials' };
                break;
            case 'openai':
                result = settings.openai.apiKey
                    ? { success: true, message: 'OpenAI API key configured' }
                    : { success: false, message: 'Missing OpenAI API key' };
                break;
        }

        res.json(result);
    } catch (error) {
        console.error('Test Connection Error:', error);
        res.status(500).json({ error: error.message });
    }
};

// Add user
exports.addUser = async (req, res) => {
    try {
        const settings = await Settings.getSettings();
        const { name, email, role } = req.body;

        if (!name || !email) {
            return res.status(400).json({ error: 'Name and email are required' });
        }

        // Check if email already exists
        const exists = settings.users.find(u => u.email === email);
        if (exists) {
            return res.status(400).json({ error: 'User with this email already exists' });
        }

        settings.users.push({ name, email, role: role || 'viewer', active: true });
        await settings.save();

        res.json({ success: true, message: 'User added successfully' });
    } catch (error) {
        console.error('Add User Error:', error);
        res.status(500).json({ error: error.message });
    }
};

// Update user
exports.updateUser = async (req, res) => {
    try {
        const settings = await Settings.getSettings();
        const { userId } = req.params;
        const updates = req.body;

        const userIndex = settings.users.findIndex(u => u._id.toString() === userId);
        if (userIndex === -1) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (updates.name) settings.users[userIndex].name = updates.name;
        if (updates.email) settings.users[userIndex].email = updates.email;
        if (updates.role) settings.users[userIndex].role = updates.role;
        if (typeof updates.active === 'boolean') settings.users[userIndex].active = updates.active;

        await settings.save();
        res.json({ success: true, message: 'User updated successfully' });
    } catch (error) {
        console.error('Update User Error:', error);
        res.status(500).json({ error: error.message });
    }
};

// Delete user
exports.deleteUser = async (req, res) => {
    try {
        const settings = await Settings.getSettings();
        const { userId } = req.params;

        settings.users = settings.users.filter(u => u._id.toString() !== userId);
        await settings.save();

        res.json({ success: true, message: 'User deleted successfully' });
    } catch (error) {
        console.error('Delete User Error:', error);
        res.status(500).json({ error: error.message });
    }
};

// Get branding only (for public access)
exports.getBranding = async (req, res) => {
    try {
        const settings = await Settings.getSettings();
        res.json(settings.branding || { dashboardName: 'LUMU', tagline: 'AI Dashboard', logoUrl: '', primaryColor: '#10b981' });
    } catch (error) {
        console.error('Get Branding Error:', error);
        res.status(500).json({ error: error.message });
    }
};
