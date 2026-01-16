// Meta Ads API Service - Facebook & Instagram
// Direct integration with Meta Marketing API v18.0

const axios = require('axios');
const Settings = require('../models/Settings');

const META_API_VERSION = 'v18.0';
const META_API_BASE = `https://graph.facebook.com/${META_API_VERSION}`;

class MetaAdsService {
    constructor() {
        this.credentials = null;
    }

    // Load credentials from Settings database
    async loadCredentials() {
        const settings = await Settings.getSettings();
        this.credentials = {
            accessToken: settings.metaAds?.accessToken || '',
            adAccountId: settings.metaAds?.adAccountId || '',
            appId: settings.metaAds?.appId || '',
            pageId: settings.metaAds?.pageId || ''
        };

        if (!this.credentials.accessToken || !this.credentials.adAccountId) {
            throw new Error('Meta Ads credentials not configured. Go to Settings to add them.');
        }

        return this.credentials;
    }

    // Create Campaign
    async createCampaign(campaignData) {
        await this.loadCredentials();

        const response = await axios.post(
            `${META_API_BASE}/act_${this.credentials.adAccountId}/campaigns`,
            {
                name: campaignData.name,
                objective: this.mapObjective(campaignData.objective),
                status: campaignData.status || 'PAUSED',
                special_ad_categories: []
            },
            { params: { access_token: this.credentials.accessToken } }
        );

        return response.data;
    }

    // Create Ad Set
    async createAdSet(adSetData, campaignId) {
        await this.loadCredentials();

        const response = await axios.post(
            `${META_API_BASE}/act_${this.credentials.adAccountId}/adsets`,
            {
                name: adSetData.name || 'Ad Set',
                campaign_id: campaignId,
                billing_event: 'IMPRESSIONS',
                optimization_goal: 'REACH',
                daily_budget: Math.round((adSetData.budget?.daily || 1000) * 100), // Convert to cents
                targeting: this.formatTargeting(adSetData.targeting),
                status: 'PAUSED'
            },
            { params: { access_token: this.credentials.accessToken } }
        );

        return response.data;
    }

    // Create Ad Creative
    async createCreative(creativeData) {
        await this.loadCredentials();

        const creative = {
            name: creativeData.name || 'Creative',
            object_story_spec: {
                page_id: this.credentials.pageId,
                link_data: {
                    link: creativeData.linkUrl || creativeData.url || 'https://example.com',
                    message: creativeData.primaryText || creativeData.description || '',
                    name: creativeData.headline || creativeData.name || '',
                    description: creativeData.description || '',
                    call_to_action: {
                        type: this.mapCTA(creativeData.cta)
                    }
                }
            }
        };

        if (creativeData.imageUrl || creativeData.image) {
            creative.object_story_spec.link_data.image_url = creativeData.imageUrl || creativeData.image;
        }

        const response = await axios.post(
            `${META_API_BASE}/act_${this.credentials.adAccountId}/adcreatives`,
            creative,
            { params: { access_token: this.credentials.accessToken } }
        );

        return response.data;
    }

    // Create Ad
    async createAd(adData, adSetId, creativeId) {
        await this.loadCredentials();

        const response = await axios.post(
            `${META_API_BASE}/act_${this.credentials.adAccountId}/ads`,
            {
                name: adData.name || 'Ad',
                adset_id: adSetId,
                creative: { creative_id: creativeId },
                status: 'PAUSED'
            },
            { params: { access_token: this.credentials.accessToken } }
        );

        return response.data;
    }

    // Full publish flow - creates Campaign → Ad Set → Creative → Ad
    async publishCampaign(campaignData, creativeData) {
        try {
            console.log('📘 Meta: Starting campaign publish...');

            // Step 1: Create Campaign
            const campaign = await this.createCampaign(campaignData);
            console.log('✅ Meta Campaign Created:', campaign.id);

            // Step 2: Create Ad Set
            const adSet = await this.createAdSet(campaignData, campaign.id);
            console.log('✅ Meta Ad Set Created:', adSet.id);

            // Step 3: Create Creative
            const creative = await this.createCreative(creativeData);
            console.log('✅ Meta Creative Created:', creative.id);

            // Step 4: Create Ad
            const ad = await this.createAd(campaignData, adSet.id, creative.id);
            console.log('✅ Meta Ad Created:', ad.id);

            return {
                success: true,
                platform: 'meta',
                platforms: ['facebook', 'instagram'],
                campaignId: campaign.id,
                adSetId: adSet.id,
                creativeId: creative.id,
                adId: ad.id
            };
        } catch (error) {
            console.error('❌ Meta Ads Error:', error.response?.data || error.message);
            return {
                success: false,
                platform: 'meta',
                error: error.response?.data?.error?.message || error.message
            };
        }
    }

    // Map objective to Meta format
    mapObjective(objective) {
        const map = {
            'awareness': 'OUTCOME_AWARENESS',
            'traffic': 'OUTCOME_TRAFFIC',
            'engagement': 'OUTCOME_ENGAGEMENT',
            'leads': 'OUTCOME_LEADS',
            'sales': 'OUTCOME_SALES',
            'conversions': 'OUTCOME_SALES'
        };
        return map[objective?.toLowerCase()] || 'OUTCOME_TRAFFIC';
    }

    // Map CTA to Meta format
    mapCTA(cta) {
        const map = {
            'shop_now': 'SHOP_NOW',
            'learn_more': 'LEARN_MORE',
            'sign_up': 'SIGN_UP',
            'download': 'DOWNLOAD',
            'contact_us': 'CONTACT_US',
            'get_offer': 'GET_OFFER',
            'book_now': 'BOOK_NOW'
        };
        return map[cta?.toLowerCase()?.replace(' ', '_')] || 'LEARN_MORE';
    }

    // Format targeting for Meta API
    formatTargeting(targeting) {
        const result = {
            geo_locations: {
                countries: ['PK']
            },
            age_min: targeting?.ageMin || 18,
            age_max: targeting?.ageMax || 65
        };

        if (targeting?.gender && targeting.gender !== 'all') {
            result.genders = targeting.gender === 'male' ? [1] : [2];
        }

        return result;
    }

    // Get existing campaigns (for analytics)
    async getCampaigns() {
        try {
            await this.loadCredentials();

            const response = await axios.get(
                `${META_API_BASE}/act_${this.credentials.adAccountId}/campaigns`,
                {
                    params: {
                        access_token: this.credentials.accessToken,
                        fields: 'id,name,status,objective,daily_budget,lifetime_budget'
                    }
                }
            );

            return response.data.data || [];
        } catch (error) {
            console.error('Meta getCampaigns Error:', error.message);
            return [];
        }
    }
}

module.exports = new MetaAdsService();
