// TikTok Ads API Service
// Direct integration with TikTok Marketing API v1.3
// IMPORTANT: TikTok requires VIDEO for main feed ads!

const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');
const Settings = require('../models/Settings');

const TIKTOK_API_VERSION = 'v1.3';
const TIKTOK_API_BASE = `https://business-api.tiktok.com/open_api/${TIKTOK_API_VERSION}`;

class TikTokAdsService {
    constructor() {
        this.credentials = null;
    }

    // Load credentials from Settings database
    async loadCredentials() {
        const settings = await Settings.getSettings();
        this.credentials = {
            accessToken: settings.tiktokAds?.accessToken || '',
            advertiserId: settings.tiktokAds?.advertiserId || '',
            appId: settings.tiktokAds?.appId || '',
            businessCenterId: settings.tiktokAds?.businessCenterId || ''
        };

        if (!this.credentials.accessToken || !this.credentials.advertiserId) {
            throw new Error('TikTok Ads credentials not configured. Go to Settings to add them.');
        }

        return this.credentials;
    }

    // Get headers for TikTok API
    getHeaders() {
        return {
            'Access-Token': this.credentials.accessToken,
            'Content-Type': 'application/json'
        };
    }

    // Upload Video (Required for TikTok ads!)
    async uploadVideo(videoPath) {
        await this.loadCredentials();

        // Check if it's a URL or local file
        if (videoPath.startsWith('http')) {
            // Upload from URL
            const response = await axios.post(
                `${TIKTOK_API_BASE}/file/video/ad/upload/`,
                {
                    advertiser_id: this.credentials.advertiserId,
                    video_url: videoPath,
                    upload_type: 'UPLOAD_BY_URL'
                },
                { headers: this.getHeaders() }
            );

            if (response.data.code !== 0) {
                throw new Error(response.data.message);
            }

            return response.data.data.video_id;
        } else {
            // Upload from local file
            const formData = new FormData();
            formData.append('advertiser_id', this.credentials.advertiserId);
            formData.append('video_file', fs.createReadStream(videoPath));

            const response = await axios.post(
                `${TIKTOK_API_BASE}/file/video/ad/upload/`,
                formData,
                {
                    headers: {
                        'Access-Token': this.credentials.accessToken,
                        ...formData.getHeaders()
                    }
                }
            );

            if (response.data.code !== 0) {
                throw new Error(response.data.message);
            }

            return response.data.data.video_id;
        }
    }

    // Create Campaign
    async createCampaign(campaignData) {
        await this.loadCredentials();

        const response = await axios.post(
            `${TIKTOK_API_BASE}/campaign/create/`,
            {
                advertiser_id: this.credentials.advertiserId,
                campaign_name: campaignData.name,
                objective_type: this.mapObjective(campaignData.objective),
                budget_mode: 'BUDGET_MODE_DAY',
                budget: campaignData.budget?.daily || 5000 // In account currency
            },
            { headers: this.getHeaders() }
        );

        if (response.data.code !== 0) {
            throw new Error(response.data.message);
        }

        return response.data.data;
    }

    // Create Ad Group
    async createAdGroup(adGroupData, campaignId) {
        await this.loadCredentials();

        const response = await axios.post(
            `${TIKTOK_API_BASE}/adgroup/create/`,
            {
                advertiser_id: this.credentials.advertiserId,
                campaign_id: campaignId,
                adgroup_name: adGroupData.name || 'Ad Group',
                placement_type: 'PLACEMENT_TYPE_AUTOMATIC',
                placements: ['PLACEMENT_TIKTOK'],
                location_ids: this.getLocationIds(adGroupData.targeting),
                age_groups: this.mapAgeGroups(adGroupData.targeting),
                gender: this.mapGender(adGroupData.targeting?.gender),
                languages: ['en', 'ur'],
                operating_systems: ['ANDROID', 'IOS'],
                budget_mode: 'BUDGET_MODE_DAY',
                budget: adGroupData.budget?.daily || 3000,
                schedule_type: 'SCHEDULE_FROM_NOW',
                optimization_goal: 'CLICK',
                bid_type: 'BID_TYPE_NO_BID', // Automatic bidding
                billing_event: 'CPC'
            },
            { headers: this.getHeaders() }
        );

        if (response.data.code !== 0) {
            throw new Error(response.data.message);
        }

        return response.data.data;
    }

    // Create Ad (with video)
    async createAd(adData, adGroupId, videoId) {
        await this.loadCredentials();

        const response = await axios.post(
            `${TIKTOK_API_BASE}/ad/create/`,
            {
                advertiser_id: this.credentials.advertiserId,
                adgroup_id: adGroupId,
                creatives: [{
                    ad_name: adData.name || 'TikTok Ad',
                    ad_text: adData.description || adData.primaryText || '', // Max 100 chars
                    video_id: videoId,
                    call_to_action: this.mapCTA(adData.cta),
                    landing_page_url: adData.linkUrl || adData.url || '',
                    display_name: adData.brandName || 'Brand',
                    identity_type: 'CUSTOMIZED_USER',
                    identity_authorized_bc_id: this.credentials.businessCenterId
                }]
            },
            { headers: this.getHeaders() }
        );

        if (response.data.code !== 0) {
            throw new Error(response.data.message);
        }

        return response.data.data;
    }

    // Full publish flow with video upload
    async publishCampaign(campaignData, creativeData) {
        try {
            console.log('🎵 TikTok: Starting campaign publish...');

            // IMPORTANT: Check for video - TikTok requires video!
            if (!creativeData.videoUrl && !creativeData.video) {
                return {
                    success: false,
                    platform: 'tiktok',
                    error: 'TikTok requires a VIDEO file. Please add a video to your creative.'
                };
            }

            // Step 1: Upload Video
            console.log('📹 Uploading video to TikTok...');
            const videoId = await this.uploadVideo(creativeData.videoUrl || creativeData.video);
            console.log('✅ TikTok Video Uploaded:', videoId);

            // Step 2: Create Campaign
            const campaign = await this.createCampaign(campaignData);
            console.log('✅ TikTok Campaign Created:', campaign.campaign_id);

            // Step 3: Create Ad Group
            const adGroup = await this.createAdGroup(campaignData, campaign.campaign_id);
            console.log('✅ TikTok Ad Group Created:', adGroup.adgroup_id);

            // Step 4: Create Ad
            const ad = await this.createAd(creativeData, adGroup.adgroup_id, videoId);
            console.log('✅ TikTok Ad Created:', ad.ad_ids?.[0]);

            return {
                success: true,
                platform: 'tiktok',
                campaignId: campaign.campaign_id,
                adGroupId: adGroup.adgroup_id,
                adId: ad.ad_ids?.[0],
                videoId: videoId
            };
        } catch (error) {
            console.error('❌ TikTok Ads Error:', error.response?.data || error.message);
            return {
                success: false,
                platform: 'tiktok',
                error: error.response?.data?.message || error.message
            };
        }
    }

    // Map objective to TikTok format
    mapObjective(objective) {
        const map = {
            'awareness': 'REACH',
            'traffic': 'TRAFFIC',
            'engagement': 'VIDEO_VIEWS',
            'leads': 'LEAD_GENERATION',
            'sales': 'CONVERSIONS',
            'conversions': 'CONVERSIONS',
            'app_install': 'APP_PROMOTION'
        };
        return map[objective?.toLowerCase()] || 'TRAFFIC';
    }

    // Map CTA to TikTok format
    mapCTA(cta) {
        const map = {
            'shop_now': 'SHOP_NOW',
            'learn_more': 'LEARN_MORE',
            'sign_up': 'SIGN_UP',
            'download': 'DOWNLOAD',
            'contact_us': 'CONTACT_US',
            'book_now': 'BOOK_NOW',
            'watch_more': 'WATCH_MORE'
        };
        return map[cta?.toLowerCase()?.replace(' ', '_')] || 'LEARN_MORE';
    }

    // Map gender to TikTok format
    mapGender(gender) {
        if (!gender || gender === 'all') return 'GENDER_UNLIMITED';
        return gender === 'male' ? 'GENDER_MALE' : 'GENDER_FEMALE';
    }

    // Map age groups to TikTok format
    mapAgeGroups(targeting) {
        // TikTok uses predefined age groups
        const groups = [];
        const minAge = targeting?.ageMin || 18;
        const maxAge = targeting?.ageMax || 55;

        if (minAge <= 24) groups.push('AGE_18_24');
        if (minAge <= 34 && maxAge >= 25) groups.push('AGE_25_34');
        if (minAge <= 44 && maxAge >= 35) groups.push('AGE_35_44');
        if (minAge <= 54 && maxAge >= 45) groups.push('AGE_45_54');
        if (maxAge >= 55) groups.push('AGE_55_100');

        return groups.length > 0 ? groups : ['AGE_18_24', 'AGE_25_34'];
    }

    // Get Pakistan location IDs for TikTok
    getLocationIds(targeting) {
        // Pakistan country code in TikTok
        return ['6252001']; // Pakistan
    }

    // Get campaign metrics (real-time from TikTok Reporting API)
    async getCampaignMetrics(campaignId) {
        try {
            await this.loadCredentials();

            const response = await axios.get(
                `${TIKTOK_API_BASE}/report/integrated/get/`,
                {
                    params: {
                        advertiser_id: this.credentials.advertiserId,
                        service_type: 'AUCTION',
                        report_type: 'BASIC',
                        data_level: 'AUCTION_CAMPAIGN',
                        dimensions: '["campaign_id"]',
                        metrics: '["spend","impressions","clicks","conversion","ctr","cpc","cpm","reach"]',
                        filters: JSON.stringify([{ field_name: 'campaign_id', filter_type: 'IN', filter_value: [campaignId] }]),
                        start_date: '2024-01-01',
                        end_date: new Date().toISOString().split('T')[0]
                    },
                    headers: this.getHeaders()
                }
            );

            if (response.data.code !== 0) {
                throw new Error(response.data.message);
            }

            const data = response.data.data?.list?.[0]?.metrics || {};

            return {
                success: true,
                platform: 'tiktok',
                metrics: {
                    impressions: parseInt(data.impressions || 0),
                    clicks: parseInt(data.clicks || 0),
                    spend: parseFloat(data.spend || 0),
                    reach: parseInt(data.reach || 0),
                    ctr: parseFloat(data.ctr || 0) * 100, // Convert to percentage
                    cpc: parseFloat(data.cpc || 0),
                    cpm: parseFloat(data.cpm || 0),
                    conversions: parseInt(data.conversion || 0)
                }
            };
        } catch (error) {
            console.error('TikTok getCampaignMetrics Error:', error.response?.data || error.message);
            return {
                success: false,
                platform: 'tiktok',
                error: error.message,
                metrics: { impressions: 0, clicks: 0, spend: 0, reach: 0, ctr: 0, cpc: 0, conversions: 0 }
            };
        }
    }

    // Update campaign status (pause/resume)
    async updateCampaignStatus(campaignId, status) {
        try {
            await this.loadCredentials();

            const response = await axios.post(
                `${TIKTOK_API_BASE}/campaign/update/status/`,
                {
                    advertiser_id: this.credentials.advertiserId,
                    campaign_ids: [campaignId],
                    opt_status: status === 'active' ? 'ENABLE' : 'DISABLE'
                },
                { headers: this.getHeaders() }
            );

            if (response.data.code !== 0) {
                throw new Error(response.data.message);
            }

            return { success: true, platform: 'tiktok' };
        } catch (error) {
            console.error('TikTok updateCampaignStatus Error:', error.message);
            return { success: false, platform: 'tiktok', error: error.message };
        }
    }
}

module.exports = new TikTokAdsService();
