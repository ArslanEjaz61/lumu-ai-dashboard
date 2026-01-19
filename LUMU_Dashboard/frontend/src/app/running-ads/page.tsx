"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Facebook,
    Instagram,
    Youtube,
    Target,
    Sparkles,
    Loader2,
    Play,
    Pause,
    BarChart3,
    Eye,
    TrendingUp,
    DollarSign,
    Users,
    MousePointer,
    RefreshCw,
    ExternalLink,
    MoreVertical,
    Trash2,
    Copy
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface PublishedAd {
    _id: string;
    name: string;
    status: 'active' | 'paused' | 'scheduled' | 'completed' | 'failed';
    platforms: string[];
    platformCampaignIds: Array<{
        platform: string;
        campaignId?: string;
        status?: string;
        metrics?: {
            impressions: number;
            clicks: number;
            conversions: number;
            spend: number;
            ctr: number;
        };
    }>;
    budget: {
        daily: number;
        total: number;
        spent: number;
        currency: string;
    };
    metrics: {
        impressions: number;
        clicks: number;
        conversions: number;
        reach: number;
        ctr: number;
        cpc: number;
        spend: number;
    };
    creative?: {
        headline?: string;
        image?: string;
        video?: string;
    };
    campaignId?: {
        _id: string;
        name: string;
        objective: string;
    };
    publishedAt?: string;
    createdAt: string;
}

const platformIcons: { [key: string]: any } = {
    facebook: Facebook,
    instagram: Instagram,
    youtube: Youtube,
    google: Target,
    tiktok: Sparkles,
    twitter: Target
};

const platformColors: { [key: string]: string } = {
    facebook: '#1877F2',
    instagram: '#E4405F',
    youtube: '#FF0000',
    google: '#4285F4',
    tiktok: '#000000',
    twitter: '#1DA1F2'
};

export default function RunningAdsPage() {
    const [ads, setAds] = useState<PublishedAd[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'active' | 'paused' | 'completed'>('all');
    const [updatingPlatform, setUpdatingPlatform] = useState<string | null>(null);
    const [syncing, setSyncing] = useState(false);
    const [syncingAdId, setSyncingAdId] = useState<string | null>(null);

    useEffect(() => {
        fetchAds();
    }, []);

    const fetchAds = async () => {
        try {
            setLoading(true);
            const res = await fetch(`${API_URL}/publish/history?limit=50`);
            const data = await res.json();
            setAds(data.history || []);
        } catch (error) {
            console.error('Failed to fetch ads:', error);
        } finally {
            setLoading(false);
        }
    };

    const updatePlatformStatus = async (adId: string, platform: string, newStatus: 'active' | 'paused') => {
        try {
            setUpdatingPlatform(`${adId}-${platform}`);
            const res = await fetch(`${API_URL}/publish/${adId}/platform-status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ platform, status: newStatus })
            });
            if (res.ok) {
                fetchAds();
            }
        } catch (error) {
            console.error('Failed to update platform status:', error);
        } finally {
            setUpdatingPlatform(null);
        }
    };

    const updateAdStatus = async (adId: string, newStatus: 'active' | 'paused') => {
        try {
            const res = await fetch(`${API_URL}/publish/${adId}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });
            if (res.ok) {
                fetchAds();
            }
        } catch (error) {
            console.error('Failed to update ad status:', error);
        }
    };

    // Sync all metrics from platforms (real-time)
    const syncAllMetrics = async () => {
        try {
            setSyncing(true);
            const res = await fetch(`${API_URL}/publish/sync-all`, { method: 'POST' });
            if (res.ok) {
                await fetchAds();
            }
        } catch (error) {
            console.error('Failed to sync metrics:', error);
        } finally {
            setSyncing(false);
        }
    };

    // Sync single ad metrics
    const syncSingleAd = async (adId: string) => {
        try {
            setSyncingAdId(adId);
            const res = await fetch(`${API_URL}/publish/${adId}/sync`, { method: 'POST' });
            if (res.ok) {
                await fetchAds();
            }
        } catch (error) {
            console.error('Failed to sync ad metrics:', error);
        } finally {
            setSyncingAdId(null);
        }
    };

    const getPlatformStatus = (ad: PublishedAd, platform: string) => {
        const platformData = ad.platformCampaignIds?.find(p => p.platform === platform);
        return platformData?.status || (ad.status === 'active' ? 'active' : 'paused');
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'bg-emerald-500';
            case 'paused': return 'bg-amber-500';
            case 'scheduled': return 'bg-blue-500';
            case 'completed': return 'bg-slate-500';
            case 'failed': return 'bg-red-500';
            default: return 'bg-slate-400';
        }
    };

    const filteredAds = ads.filter(ad => {
        if (filter === 'all') return true;
        return ad.status === filter;
    });

    // Stats
    const totalActive = ads.filter(a => a.status === 'active').length;
    const totalPaused = ads.filter(a => a.status === 'paused').length;
    const totalSpent = ads.reduce((sum, a) => sum + (a.budget?.spent || a.metrics?.spend || 0), 0);
    const totalImpressions = ads.reduce((sum, a) => sum + (a.metrics?.impressions || 0), 0);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="animate-spin text-purple-500" size={48} />
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        🚀 Running Ads
                    </h1>
                    <p className="text-slate-500">Manage your live campaigns across all platforms</p>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        onClick={syncAllMetrics}
                        disabled={syncing}
                        className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-0 hover:from-blue-600 hover:to-cyan-600"
                    >
                        {syncing ? (
                            <><Loader2 size={16} className="mr-2 animate-spin" /> Syncing...</>
                        ) : (
                            <><RefreshCw size={16} className="mr-2" /> Sync Metrics</>
                        )}
                    </Button>
                    <Button variant="outline" onClick={fetchAds}>
                        <RefreshCw size={16} className="mr-2" />
                        Refresh
                    </Button>
                    <Button onClick={() => window.location.href = '/publish'}>
                        + New Ad
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="pt-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-500">Active Ads</p>
                                <p className="text-2xl font-bold text-emerald-600">{totalActive}</p>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                                <Play className="text-emerald-600" size={20} />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-500">Paused</p>
                                <p className="text-2xl font-bold text-amber-600">{totalPaused}</p>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                                <Pause className="text-amber-600" size={20} />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-500">Total Spent</p>
                                <p className="text-2xl font-bold">PKR {totalSpent.toLocaleString()}</p>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                                <DollarSign className="text-purple-600" size={20} />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-500">Impressions</p>
                                <p className="text-2xl font-bold">{(totalImpressions / 1000).toFixed(1)}K</p>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                                <Eye className="text-blue-600" size={20} />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 border-b">
                {['all', 'active', 'paused', 'completed'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setFilter(tab as typeof filter)}
                        className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px capitalize ${filter === tab
                            ? 'border-purple-500 text-purple-600'
                            : 'border-transparent text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        {tab} ({tab === 'all' ? ads.length : ads.filter(a => a.status === tab).length})
                    </button>
                ))}
            </div>

            {/* Ads List */}
            {filteredAds.length === 0 ? (
                <div className="text-center py-12">
                    <BarChart3 className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500">No ads found</p>
                    <Button onClick={() => window.location.href = '/publish'} className="mt-4">
                        Publish Your First Ad
                    </Button>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredAds.map((ad) => (
                        <Card key={ad._id} className="hover:shadow-lg transition-shadow">
                            <CardContent className="p-6">
                                <div className="flex items-start gap-6">
                                    {/* Creative Preview */}
                                    <div className="w-32 h-24 rounded-lg bg-gradient-to-br from-purple-400 to-pink-500 flex-shrink-0 overflow-hidden">
                                        {ad.creative?.image ? (
                                            <img src={ad.creative.image} alt={ad.name} className="w-full h-full object-cover" />
                                        ) : ad.creative?.video ? (
                                            <video src={ad.creative.video} className="w-full h-full object-cover" muted />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-white text-xs font-medium">
                                                Ad Preview
                                            </div>
                                        )}
                                    </div>

                                    {/* Main Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between mb-3">
                                            <div>
                                                <h3 className="font-semibold text-lg">{ad.name}</h3>
                                                {ad.campaignId && (
                                                    <p className="text-sm text-slate-500">
                                                        Campaign: {ad.campaignId.name}
                                                    </p>
                                                )}
                                            </div>
                                            <Badge className={`${getStatusColor(ad.status)} text-white`}>
                                                {ad.status === 'active' && <Play size={10} className="mr-1" />}
                                                {ad.status === 'paused' && <Pause size={10} className="mr-1" />}
                                                {ad.status}
                                            </Badge>
                                        </div>

                                        {/* Platform Status Pills */}
                                        <div className="flex flex-wrap gap-2 mb-4">
                                            <span className="text-sm text-slate-500 mr-2">Platforms:</span>
                                            {ad.platforms.map((platform) => {
                                                const Icon = platformIcons[platform] || Target;
                                                const status = getPlatformStatus(ad, platform);
                                                const isUpdating = updatingPlatform === `${ad._id}-${platform}`;

                                                return (
                                                    <button
                                                        key={platform}
                                                        onClick={() => updatePlatformStatus(
                                                            ad._id,
                                                            platform,
                                                            status === 'active' ? 'paused' : 'active'
                                                        )}
                                                        disabled={isUpdating}
                                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${status === 'active'
                                                            ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                                                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                                            }`}
                                                    >
                                                        {isUpdating ? (
                                                            <Loader2 size={12} className="animate-spin" />
                                                        ) : (
                                                            <Icon size={12} style={{ color: platformColors[platform] }} />
                                                        )}
                                                        <span className="capitalize">{platform}</span>
                                                        {status === 'active' ? (
                                                            <Play size={10} className="text-emerald-600" />
                                                        ) : (
                                                            <Pause size={10} className="text-slate-400" />
                                                        )}
                                                    </button>
                                                );
                                            })}
                                        </div>

                                        {/* Per-Platform Metrics */}
                                        <div className="space-y-2">
                                            <p className="text-sm text-slate-500 font-medium">Platform Metrics:</p>
                                            <div className="bg-slate-50 rounded-lg overflow-hidden">
                                                <table className="w-full text-sm">
                                                    <thead className="bg-slate-100">
                                                        <tr>
                                                            <th className="px-3 py-2 text-left text-xs font-medium text-slate-600">Platform</th>
                                                            <th className="px-3 py-2 text-right text-xs font-medium text-slate-600">Spent</th>
                                                            <th className="px-3 py-2 text-right text-xs font-medium text-slate-600">Impressions</th>
                                                            <th className="px-3 py-2 text-right text-xs font-medium text-slate-600">Clicks</th>
                                                            <th className="px-3 py-2 text-right text-xs font-medium text-slate-600">CTR</th>
                                                            <th className="px-3 py-2 text-right text-xs font-medium text-slate-600">Conversions</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-slate-200">
                                                        {ad.platforms.map((platform) => {
                                                            const Icon = platformIcons[platform] || Target;
                                                            const platformData = ad.platformCampaignIds?.find(p => p.platform === platform);
                                                            const metrics = platformData?.metrics || { spend: 0, impressions: 0, clicks: 0, ctr: 0, conversions: 0 };
                                                            const status = platformData?.status || ad.status;

                                                            return (
                                                                <tr key={platform} className={status === 'paused' ? 'bg-slate-50/50 opacity-60' : ''}>
                                                                    <td className="px-3 py-2">
                                                                        <div className="flex items-center gap-2">
                                                                            <Icon size={14} style={{ color: platformColors[platform] }} />
                                                                            <span className="capitalize font-medium">{platform}</span>
                                                                            {status === 'paused' && (
                                                                                <Badge className="bg-amber-100 text-amber-700 text-xs px-1">Paused</Badge>
                                                                            )}
                                                                        </div>
                                                                    </td>
                                                                    <td className="px-3 py-2 text-right font-mono">PKR {(metrics.spend || 0).toLocaleString()}</td>
                                                                    <td className="px-3 py-2 text-right font-mono">{(metrics.impressions || 0).toLocaleString()}</td>
                                                                    <td className="px-3 py-2 text-right font-mono">{(metrics.clicks || 0).toLocaleString()}</td>
                                                                    <td className="px-3 py-2 text-right font-mono">{(metrics.ctr || 0).toFixed(2)}%</td>
                                                                    <td className="px-3 py-2 text-right font-mono">{(metrics.conversions || 0).toLocaleString()}</td>
                                                                </tr>
                                                            );
                                                        })}
                                                        {/* Total Row */}
                                                        <tr className="bg-slate-100 font-semibold">
                                                            <td className="px-3 py-2">Total</td>
                                                            <td className="px-3 py-2 text-right font-mono">PKR {(ad.metrics?.spend || ad.budget?.spent || 0).toLocaleString()}</td>
                                                            <td className="px-3 py-2 text-right font-mono">{(ad.metrics?.impressions || 0).toLocaleString()}</td>
                                                            <td className="px-3 py-2 text-right font-mono">{(ad.metrics?.clicks || 0).toLocaleString()}</td>
                                                            <td className="px-3 py-2 text-right font-mono">{(ad.metrics?.ctr || 0).toFixed(2)}%</td>
                                                            <td className="px-3 py-2 text-right font-mono">{(ad.metrics?.conversions || 0).toLocaleString()}</td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex flex-col gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => updateAdStatus(ad._id, ad.status === 'active' ? 'paused' : 'active')}
                                        >
                                            {ad.status === 'active' ? (
                                                <><Pause size={14} className="mr-1" /> Pause All</>
                                            ) : (
                                                <><Play size={14} className="mr-1" /> Resume All</>
                                            )}
                                        </Button>
                                        <Button variant="ghost" size="sm">
                                            <BarChart3 size={14} className="mr-1" /> Analytics
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
