// Google Ads API Service
// Direct integration with Google Ads API v15.0
// For Search, Display, and YouTube ads

const axios = require('axios');
const Settings = require('../models/Settings');

const GOOGLE_ADS_API_VERSION = 'v15';
const GOOGLE_ADS_API_BASE = `https://googleads.googleapis.com/${GOOGLE_ADS_API_VERSION}`;

class GoogleAdsService {
    constructor() {
        this.credentials = null;
    }

    // Load credentials from Settings database
    async loadCredentials() {
        const settings = await Settings.getSettings();
        this.credentials = {
            developerToken: settings.googleAds?.developerToken || '',
            clientId: settings.googleAds?.clientId || '',
            clientSecret: settings.googleAds?.clientSecret || '',
            refreshToken: settings.googleAds?.refreshToken || '',
            customerId: settings.googleAds?.customerId?.replace(/-/g, '') || '' // Remove dashes
        };

        if (!this.credentials.developerToken || !this.credentials.customerId) {
            throw new Error('Google Ads credentials not configured. Go to Settings to add them.');
        }

        return this.credentials;
    }

    // Get fresh access token from refresh token
    async getAccessToken() {
        const response = await axios.post('https://oauth2.googleapis.com/token', {
            client_id: this.credentials.clientId,
            client_secret: this.credentials.clientSecret,
            refresh_token: this.credentials.refreshToken,
            grant_type: 'refresh_token'
        });

        return response.data.access_token;
    }

    // Get headers for Google Ads API
    async getHeaders() {
        const accessToken = await this.getAccessToken();
        return {
            'Authorization': `Bearer ${accessToken}`,
            'developer-token': this.credentials.developerToken,
            'Content-Type': 'application/json'
        };
    }

    // Create Campaign
    async createCampaign(campaignData) {
        await this.loadCredentials();
        const headers = await this.getHeaders();

        const response = await axios.post(
            `${GOOGLE_ADS_API_BASE}/customers/${this.credentials.customerId}/campaigns:mutate`,
            {
                operations: [{
                    create: {
                        name: campaignData.name,
                        advertisingChannelType: this.mapChannelType(campaignData.adFormat),
                        status: 'PAUSED',
                        campaignBudget: `customers/${this.credentials.customerId}/campaignBudgets/-1`,
                        biddingStrategyType: this.mapBidStrategy(campaignData.bidStrategy),
                        targetSpend: {}
                    }
                }]
            },
            { headers }
        );

        return response.data;
    }

    // Create Campaign Budget
    async createBudget(budgetData) {
        await this.loadCredentials();
        const headers = await this.getHeaders();

        const response = await axios.post(
            `${GOOGLE_ADS_API_BASE}/customers/${this.credentials.customerId}/campaignBudgets:mutate`,
            {
                operations: [{
                    create: {
                        name: `Budget_${Date.now()}`,
                        amountMicros: (budgetData.daily || 1000) * 1000000, // Convert to micros
                        deliveryMethod: 'STANDARD'
                    }
                }]
            },
            { headers }
        );

        return response.data;
    }

    // Create Ad Group
    async createAdGroup(adGroupData, campaignId) {
        await this.loadCredentials();
        const headers = await this.getHeaders();

        const response = await axios.post(
            `${GOOGLE_ADS_API_BASE}/customers/${this.credentials.customerId}/adGroups:mutate`,
            {
                operations: [{
                    create: {
                        name: adGroupData.name || 'Ad Group',
                        campaign: campaignId,
                        status: 'PAUSED',
                        cpcBidMicros: (adGroupData.cpcBid || 10) * 1000000 // Convert to micros
                    }
                }]
            },
            { headers }
        );

        return response.data;
    }

    // Create Responsive Search Ad
    async createSearchAd(adData, adGroupId) {
        await this.loadCredentials();
        const headers = await this.getHeaders();

        const response = await axios.post(
            `${GOOGLE_ADS_API_BASE}/customers/${this.credentials.customerId}/adGroupAds:mutate`,
            {
                operations: [{
                    create: {
                        adGroup: adGroupId,
                        status: 'PAUSED',
                        ad: {
                            responsiveSearchAd: {
                                headlines: [
                                    { text: adData.headline || 'Shop Now' },
                                    { text: adData.headline2 || 'Best Deals' },
                                    { text: adData.headline3 || 'Limited Time' }
                                ],
                                descriptions: [
                                    { text: adData.description || 'Check out our amazing products' },
                                    { text: adData.description2 || 'Free shipping available' }
                                ]
                            },
                            finalUrls: [adData.linkUrl || adData.url || 'https://example.com']
                        }
                    }
                }]
            },
            { headers }
        );

        return response.data;
    }

    // Full publish flow
    async publishCampaign(campaignData, creativeData) {
        try {
            console.log('🔵 Google Ads: Starting campaign publish...');

            // Step 1: Create Budget
            const budget = await this.createBudget(campaignData.budget || { daily: 1000 });
            console.log('✅ Google Budget Created');

            // Step 2: Create Campaign
            const campaign = await this.createCampaign(campaignData);
            console.log('✅ Google Campaign Created');

            // Step 3: Create Ad Group
            const adGroup = await this.createAdGroup(campaignData, campaign.results?.[0]?.resourceName);
            console.log('✅ Google Ad Group Created');

            // Step 4: Create Ad
            const ad = await this.createSearchAd(creativeData, adGroup.results?.[0]?.resourceName);
            console.log('✅ Google Ad Created');

            return {
                success: true,
                platform: 'google',
                platforms: ['google', 'youtube'],
                campaignId: campaign.results?.[0]?.resourceName,
                adGroupId: adGroup.results?.[0]?.resourceName,
                adId: ad.results?.[0]?.resourceName
            };
        } catch (error) {
            console.error('❌ Google Ads Error:', error.response?.data || error.message);
            return {
                success: false,
                platform: 'google',
                error: error.response?.data?.error?.message || error.message
            };
        }
    }

    // Map channel type
    mapChannelType(adFormat) {
        const map = {
            'search': 'SEARCH',
            'display': 'DISPLAY',
            'video': 'VIDEO',
            'shopping': 'SHOPPING'
        };
        return map[adFormat?.toLowerCase()] || 'SEARCH';
    }

    // Map bid strategy
    mapBidStrategy(strategy) {
        const map = {
            'maximize_clicks': 'MAXIMIZE_CLICKS',
            'maximize_conversions': 'MAXIMIZE_CONVERSIONS',
            'target_cpa': 'TARGET_CPA',
            'target_roas': 'TARGET_ROAS',
            'manual_cpc': 'MANUAL_CPC'
        };
        return map[strategy?.toLowerCase()] || 'MAXIMIZE_CLICKS';
    }
}

module.exports = new GoogleAdsService();
