const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface FetchOptions extends RequestInit {
    timeout?: number;
}

class ApiClient {
    private baseUrl: string;

    constructor(baseUrl: string) {
        this.baseUrl = baseUrl;
    }

    private async request<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
        const { timeout = 10000, ...fetchOptions } = options;

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        try {
            const response = await fetch(`${this.baseUrl}${endpoint}`, {
                ...fetchOptions,
                signal: controller.signal,
                headers: {
                    'Content-Type': 'application/json',
                    ...fetchOptions.headers,
                },
            });

            if (!response.ok) {
                throw new Error(`API Error: ${response.status} ${response.statusText}`);
            }

            return response.json();
        } finally {
            clearTimeout(timeoutId);
        }
    }

    // Overview
    async getOverview() {
        return this.request<OverviewData>('/overview');
    }

    // Analytics
    async getAnalyticsOverview(startDate?: string, endDate?: string) {
        const params = new URLSearchParams();
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
        return this.request<AnalyticsData>(`/analytics?${params}`);
    }

    async getRealtimeAnalytics() {
        return this.request<RealtimeData>('/analytics/realtime');
    }

    async getTrafficSources(startDate?: string, endDate?: string) {
        const params = new URLSearchParams();
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
        return this.request<TrafficSource[]>(`/analytics/traffic?${params}`);
    }

    async getConversions(startDate?: string, endDate?: string) {
        const params = new URLSearchParams();
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
        return this.request<ConversionData>(`/analytics/conversions?${params}`);
    }

    async getDeviceBreakdown(startDate?: string, endDate?: string) {
        const params = new URLSearchParams();
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
        return this.request<DeviceData[]>(`/analytics/devices?${params}`);
    }

    // Campaigns
    async getAllCampaigns(startDate?: string, endDate?: string) {
        const params = new URLSearchParams();
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
        return this.request<CampaignsData>(`/campaigns?${params}`);
    }

    async getMetaCampaigns(startDate?: string, endDate?: string) {
        const params = new URLSearchParams();
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
        return this.request<Campaign[]>(`/campaigns/meta?${params}`);
    }

    async getGoogleCampaigns(startDate?: string, endDate?: string) {
        const params = new URLSearchParams();
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
        return this.request<Campaign[]>(`/campaigns/google?${params}`);
    }

    async getCampaignPerformance(startDate?: string, endDate?: string) {
        const params = new URLSearchParams();
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
        return this.request<PerformanceComparison>(`/campaigns/performance/compare?${params}`);
    }

    // Audience
    async getAudienceOverview(startDate?: string, endDate?: string) {
        const params = new URLSearchParams();
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
        return this.request<AudienceOverview>(`/audience?${params}`);
    }

    async getDemographics(startDate?: string, endDate?: string) {
        const params = new URLSearchParams();
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
        return this.request<DemographicsData>(`/audience/demographics?${params}`);
    }

    async getAudienceSegments(startDate?: string, endDate?: string) {
        const params = new URLSearchParams();
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
        return this.request<SegmentData[]>(`/audience/segments?${params}`);
    }

    async getUserBehavior(startDate?: string, endDate?: string) {
        const params = new URLSearchParams();
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
        return this.request<UserBehaviorData>(`/audience/behavior?${params}`);
    }

    // Fraud
    async getFraudOverview(startDate?: string, endDate?: string) {
        const params = new URLSearchParams();
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
        return this.request<FraudOverview>(`/fraud?${params}`);
    }

    async getInvalidClicks(startDate?: string, endDate?: string, page = 1, limit = 50) {
        const params = new URLSearchParams();
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
        params.append('page', String(page));
        params.append('limit', String(limit));
        return this.request<InvalidClicksData>(`/fraud/invalid-clicks?${params}`);
    }

    async getBlockedIPs() {
        return this.request<BlockedIPsData>('/fraud/blocked-ips');
    }

    async getFraudSavings(startDate?: string, endDate?: string) {
        const params = new URLSearchParams();
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
        return this.request<SavingsData>(`/fraud/savings?${params}`);
    }

    async getFraudReport(startDate?: string, endDate?: string) {
        const params = new URLSearchParams();
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
        return this.request<FraudReport>(`/fraud/report?${params}`);
    }

    // Insights
    async getInsights(limit = 20) {
        return this.request<Insight[]>(`/insights?limit=${limit}`);
    }

    async getRecommendations() {
        return this.request<Insight[]>('/insights/recommendations');
    }

    async getAlerts() {
        return this.request<Insight[]>('/insights/alerts');
    }

    async getDemandForecast() {
        return this.request<ForecastData>('/insights/forecast');
    }

    async triggerWorkflow(workflow: string, payload: Record<string, unknown>) {
        return this.request<WorkflowResponse>(`/insights/trigger/${workflow}`, {
            method: 'POST',
            body: JSON.stringify(payload),
        });
    }

    // Geo
    async getGeoOverview(startDate?: string, endDate?: string) {
        const params = new URLSearchParams();
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
        return this.request<GeoOverview>(`/geo?${params}`);
    }

    async getCityData(startDate?: string, endDate?: string) {
        const params = new URLSearchParams();
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
        return this.request<CityData[]>(`/geo/cities?${params}`);
    }

    async getTierBreakdown(startDate?: string, endDate?: string) {
        const params = new URLSearchParams();
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
        return this.request<TierData>(`/geo/tiers?${params}`);
    }

    async getRegionData(startDate?: string, endDate?: string) {
        const params = new URLSearchParams();
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
        return this.request<RegionData[]>(`/geo/regions?${params}`);
    }

    // Settings
    async getSettings() {
        return this.request<SettingsData>('/settings');
    }

    async updateSettings(settings: Partial<SettingsData>) {
        return this.request<{ success: boolean; message: string }>('/settings', {
            method: 'PUT',
            body: JSON.stringify(settings),
        });
    }

    async testConnection(platform: string) {
        return this.request<{ success: boolean; message: string }>(`/settings/test/${platform}`, {
            method: 'POST',
        });
    }

    // Get branding for sidebar
    async getBranding() {
        return this.request<BrandingData>('/settings/branding');
    }

    // User management (separate User model)
    async getUsers() {
        return this.request<UserData[]>('/users');
    }

    async getUserById(userId: string) {
        return this.request<UserData>(`/users/${userId}`);
    }

    async addUser(user: { name: string; email: string; password: string; role?: string; phone?: string; department?: string }) {
        return this.request<{ success: boolean; message: string; user: UserData }>('/users', {
            method: 'POST',
            body: JSON.stringify(user),
        });
    }

    async updateUser(userId: string, updates: Partial<UserData>) {
        return this.request<{ success: boolean; message: string; user: UserData }>(`/users/${userId}`, {
            method: 'PUT',
            body: JSON.stringify(updates),
        });
    }

    async updatePassword(userId: string, currentPassword: string, newPassword: string) {
        return this.request<{ success: boolean; message: string }>(`/users/${userId}/password`, {
            method: 'PUT',
            body: JSON.stringify({ currentPassword, newPassword }),
        });
    }

    async deleteUser(userId: string) {
        return this.request<{ success: boolean; message: string }>(`/users/${userId}`, {
            method: 'DELETE',
        });
    }

    async login(email: string, password: string) {
        return this.request<{ success: boolean; user: UserData }>('/users/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });
    }
}

// Types
export interface OverviewData {
    totalSales: number;
    revenue: number;
    roas: number;
    adSpend: number;
    conversions: number;
    ctr: number;
    cpc: number;
    invalidClicks: number;
    moneySaved: number;
    lastUpdated: string;
}

export interface AnalyticsData {
    users: number;
    sessions: number;
    pageViews: number;
    bounceRate: number;
    avgSessionDuration: number;
    conversions: number;
    conversionRate: number;
}

export interface RealtimeData {
    activeUsers: number;
    pageViews: number;
    topPages: { path: string; users: number }[];
}

export interface TrafficSource {
    source: string;
    users: number;
    sessions: number;
    conversions: number;
}

export interface ConversionData {
    total: number;
    value: number;
    rate: number;
    byDay: { date: string; conversions: number }[];
}

export interface DeviceData {
    device: string;
    users: number;
    percentage: number;
}

export interface Campaign {
    id: string;
    name: string;
    status: string;
    platform: string;
    budget: number;
    spend: number;
    impressions: number;
    clicks: number;
    ctr: number;
    cpc: number;
    conversions: number;
    revenue: number;
    roas: number;
}

export interface CampaignsData {
    meta: Campaign[];
    google: Campaign[];
    total: number;
}

export interface PerformanceComparison {
    meta: PerformanceMetrics;
    google: PerformanceMetrics;
    comparison: {
        betterROAS: string;
        betterCTR: string;
        lowerCPC: string;
    };
}

export interface PerformanceMetrics {
    totalSpend: number;
    totalImpressions: number;
    totalClicks: number;
    totalConversions: number;
    totalRevenue: number;
    ctr: number;
    cpc: number;
    roas: number;
    cpa: number;
}

export interface AudienceOverview {
    ga4: {
        newUsers: number;
        returningUsers: number;
        avgEngagementTime: number;
        engagedSessions: number;
    };
    clarity: {
        totalSessions: number;
        avgSessionDuration: number;
        scrollDepth: number;
        rageClicks: number;
        deadClicks: number;
        quickbacks: number;
    };
}

export interface DemographicsData {
    age: { range: string; percentage: number }[];
    gender: { type: string; percentage: number }[];
}

export interface SegmentData {
    name: string;
    users: number;
    revenue?: number;
    potentialRevenue?: number;
    conversionRate?: number;
}

export interface UserBehaviorData {
    topPages: {
        page: string;
        views: number;
        avgTime: number;
        scrollDepth: number;
    }[];
    userFrustration: {
        rageClicks: number;
        topRagePages: string[];
        deadClicks: number;
        topDeadAreas: string[];
    };
    scrollBehavior: {
        avgScrollDepth: number;
        below50percent: number;
        above75percent: number;
    };
}

export interface FraudOverview {
    totalClicks: number;
    invalidClicks: number;
    invalidPercentage: number;
    blockedIPs: number;
    moneySaved: number;
    fraudScore: string;
    lastUpdated: string;
}

export interface InvalidClicksData {
    total: number;
    page: number;
    limit: number;
    data: {
        ip: string;
        clicks: number;
        reason: string;
        platform: string;
        blocked: boolean;
    }[];
}

export interface BlockedIPsData {
    total: number;
    activeBlocks: number;
    expiredBlocks: number;
    topCountries: { country: string; count: number }[];
}

export interface SavingsData {
    totalSaved: number;
    currency: string;
    byPlatform: { platform: string; saved: number; invalidClicks: number }[];
    monthlyTrend: { month: string; saved: number }[];
}

export interface FraudReport {
    summary: {
        totalClicks: number;
        invalidClicks: number;
        blockedClicks: number;
        moneySaved: number;
    };
    fraudTypes: { type: string; count: number; percentage: number }[];
    recommendations: string[];
}

export interface Insight {
    _id: string;
    type: string;
    title: string;
    description: string;
    priority: string;
    status: string;
    category: string;
    platform: string;
    data: Record<string, unknown>;
    actionItems: { action: string; completed: boolean }[];
    createdAt: string;
}

export interface ForecastData {
    type: string;
    data: {
        predictedSales: number;
        predictedRevenue: number;
        confidence: number;
        factors: string[];
    };
}

export interface WorkflowResponse {
    success: boolean;
    workflow: string;
    message?: string;
    response?: unknown;
}

export interface GeoOverview {
    country: string;
    totalUsers: number;
    topRegions: { region: string; users: number }[];
}

export interface CityData {
    name: string;
    users: number;
    sales: number;
    revenue: number;
}

export interface TierData {
    tier1: TierInfo;
    tier2: TierInfo;
    tier3: TierInfo;
    other: TierInfo;
}

export interface TierInfo {
    cities: CityData[];
    totalSales: number;
    totalUsers: number;
}

export interface RegionData {
    region: string;
    users: number;
    sales: number;
    revenue: number;
}

export interface SettingsData {
    googleAds: {
        developerToken: string;
        clientId: string;
        clientSecret: string;
        refreshToken: string;
        customerId: string;
        connected: boolean;
    };
    metaAds: {
        appId: string;
        appSecret: string;
        accessToken: string;
        adAccountId: string;
        pageId?: string;
        connected: boolean;
    };
    tiktokAds: {
        appId: string;
        appSecret: string;
        accessToken: string;
        advertiserId: string;
        businessCenterId: string;
        connected: boolean;
    };
    twitterAds: {
        apiKey: string;
        apiSecret: string;
        accessToken: string;
        accessTokenSecret: string;
        adAccountId: string;
        connected: boolean;
    };
    ga4: {
        propertyId: string;
        accessToken: string;
        connected: boolean;
    };
    clickCease: {
        apiKey: string;
        domain: string;
        connected: boolean;
    };
    openai: {
        apiKey: string;
        connected: boolean;
    };
    n8n: {
        dailyReportWebhook: string;
        budgetAlertWebhook: string;
        fraudAlertWebhook: string;
        publishAdsWebhook?: string;
    };
    branding: {
        dashboardName: string;
        tagline: string;
        logoUrl: string;
        primaryColor: string;
    };
    users: UserData[];
    currency: string;
    syncInterval: number;
    dataRetention: number;
    updatedAt: string;
}

export interface UserData {
    _id: string;
    name: string;
    email: string;
    role: 'admin' | 'manager' | 'viewer';
    phone?: string;
    department?: string;
    avatar?: string;
    active: boolean;
    lastLogin?: string;
    createdAt: string;
    updatedAt?: string;
}

export interface BrandingData {
    dashboardName: string;
    tagline: string;
    logoUrl: string;
    primaryColor: string;
}

// Export singleton instance
export const api = new ApiClient(API_BASE_URL);

