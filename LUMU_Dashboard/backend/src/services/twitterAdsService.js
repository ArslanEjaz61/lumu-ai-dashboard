// Twitter/X Ads API Service
// Direct integration with X Ads API
// For Tweet promotions and campaigns

const axios = require('axios');
const crypto = require('crypto');
const Settings = require('../models/Settings');

const TWITTER_API_BASE = 'https://ads-api.twitter.com/12';

class TwitterAdsService {
    constructor() {
        this.credentials = null;
    }

    // Load credentials from Settings database
    async loadCredentials() {
        const settings = await Settings.getSettings();
        this.credentials = {
            apiKey: settings.twitterAds?.apiKey || '',
            apiSecret: settings.twitterAds?.apiSecret || '',
            accessToken: settings.twitterAds?.accessToken || '',
            accessTokenSecret: settings.twitterAds?.accessTokenSecret || '',
            adAccountId: settings.twitterAds?.adAccountId || ''
        };

        if (!this.credentials.apiKey || !this.credentials.adAccountId) {
            throw new Error('Twitter Ads credentials not configured. Go to Settings to add them.');
        }

        return this.credentials;
    }

    // Generate OAuth 1.0a signature
    generateOAuthSignature(method, url, params) {
        const signatureBase = `${method}&${encodeURIComponent(url)}&${encodeURIComponent(
            Object.keys(params).sort().map(k => `${k}=${params[k]}`).join('&')
        )}`;

        const signingKey = `${encodeURIComponent(this.credentials.apiSecret)}&${encodeURIComponent(this.credentials.accessTokenSecret)}`;

        return crypto.createHmac('sha1', signingKey).update(signatureBase).digest('base64');
    }

    // Get OAuth 1.0a headers
    getOAuthHeaders(method, url) {
        const oauthParams = {
            oauth_consumer_key: this.credentials.apiKey,
            oauth_token: this.credentials.accessToken,
            oauth_signature_method: 'HMAC-SHA1',
            oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
            oauth_nonce: crypto.randomBytes(16).toString('hex'),
            oauth_version: '1.0'
        };

        oauthParams.oauth_signature = this.generateOAuthSignature(method, url, oauthParams);

        const authHeader = 'OAuth ' + Object.keys(oauthParams)
            .sort()
            .map(k => `${encodeURIComponent(k)}="${encodeURIComponent(oauthParams[k])}"`)
            .join(', ');

        return {
            'Authorization': authHeader,
            'Content-Type': 'application/json'
        };
    }

    // Create Campaign
    async createCampaign(campaignData) {
        await this.loadCredentials();

        const url = `${TWITTER_API_BASE}/accounts/${this.credentials.adAccountId}/campaigns`;
        const headers = this.getOAuthHeaders('POST', url);

        const response = await axios.post(url, {
            name: campaignData.name,
            funding_instrument_id: await this.getFundingInstrument(),
            daily_budget_amount_local_micro: (campaignData.budget?.daily || 1000) * 1000000,
            entity_status: 'PAUSED'
        }, { headers });

        return response.data;
    }

    // Get Funding Instrument (payment method)
    async getFundingInstrument() {
        await this.loadCredentials();

        const url = `${TWITTER_API_BASE}/accounts/${this.credentials.adAccountId}/funding_instruments`;
        const headers = this.getOAuthHeaders('GET', url);

        const response = await axios.get(url, { headers });

        // Return first active funding instrument
        const instruments = response.data.data || [];
        const active = instruments.find(i => i.entity_status === 'ACTIVE');

        return active?.id;
    }

    // Create Line Item (Ad Group equivalent)
    async createLineItem(lineItemData, campaignId) {
        await this.loadCredentials();

        const url = `${TWITTER_API_BASE}/accounts/${this.credentials.adAccountId}/line_items`;
        const headers = this.getOAuthHeaders('POST', url);

        const response = await axios.post(url, {
            campaign_id: campaignId,
            name: lineItemData.name || 'Line Item',
            product_type: 'PROMOTED_TWEETS',
            placements: ['ALL_ON_TWITTER'],
            objective: this.mapObjective(lineItemData.objective),
            bid_amount_local_micro: (lineItemData.bidAmount || 5) * 1000000,
            entity_status: 'PAUSED'
        }, { headers });

        return response.data;
    }

    // Create Promoted Tweet
    async createPromotedTweet(adData, lineItemId) {
        await this.loadCredentials();

        // First create a tweet if not exists
        let tweetId = adData.tweetId;

        if (!tweetId) {
            // Create a draft tweet for promotion
            tweetId = await this.createTweet(adData);
        }

        const url = `${TWITTER_API_BASE}/accounts/${this.credentials.adAccountId}/promoted_tweets`;
        const headers = this.getOAuthHeaders('POST', url);

        const response = await axios.post(url, {
            line_item_id: lineItemId,
            tweet_ids: [tweetId]
        }, { headers });

        return response.data;
    }

    // Create Tweet for promotion
    async createTweet(adData) {
        // Use Twitter v2 API to create tweet
        const url = 'https://api.twitter.com/2/tweets';
        const headers = this.getOAuthHeaders('POST', url);

        const text = `${adData.headline || ''}\n\n${adData.description || ''}\n\n${adData.linkUrl || ''}`;

        const response = await axios.post(url, {
            text: text.substring(0, 280) // Twitter limit
        }, { headers });

        return response.data.data?.id;
    }

    // Full publish flow
    async publishCampaign(campaignData, creativeData) {
        try {
            console.log('🐦 Twitter: Starting campaign publish...');

            // Step 1: Create Campaign
            const campaign = await this.createCampaign(campaignData);
            console.log('✅ Twitter Campaign Created:', campaign.data?.id);

            // Step 2: Create Line Item
            const lineItem = await this.createLineItem(campaignData, campaign.data?.id);
            console.log('✅ Twitter Line Item Created:', lineItem.data?.id);

            // Step 3: Create Promoted Tweet
            const promotedTweet = await this.createPromotedTweet(creativeData, lineItem.data?.id);
            console.log('✅ Twitter Promoted Tweet Created');

            return {
                success: true,
                platform: 'twitter',
                campaignId: campaign.data?.id,
                lineItemId: lineItem.data?.id,
                promotedTweetId: promotedTweet.data?.[0]?.id
            };
        } catch (error) {
            console.error('❌ Twitter Ads Error:', error.response?.data || error.message);
            return {
                success: false,
                platform: 'twitter',
                error: error.response?.data?.errors?.[0]?.message || error.message
            };
        }
    }

    // Map objective to Twitter format
    mapObjective(objective) {
        const map = {
            'awareness': 'REACH',
            'traffic': 'WEBSITE_CLICKS',
            'engagement': 'TWEET_ENGAGEMENTS',
            'video_views': 'VIDEO_VIEWS',
            'conversions': 'WEBSITE_CONVERSIONS',
            'app_install': 'APP_INSTALLS'
        };
        return map[objective?.toLowerCase()] || 'WEBSITE_CLICKS';
    }
}

module.exports = new TwitterAdsService();
