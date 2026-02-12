"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Facebook,
    Instagram,
    Youtube,
    Check,
    Calendar,
    Clock,
    DollarSign,
    Users,
    Target,
    Sparkles,
    Rocket,
    AlertCircle,
    Loader2,
    Eye,
    Image,
    ChevronRight,
    X,
    RefreshCw,
    Megaphone,
    TrendingUp,
    BarChart3,
    MousePointer,
    ShoppingCart,
    Percent,
    Activity
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface Campaign {
    _id: string;
    name: string;
    description: string;
    objective: string;
    status: string;
    budget: {
        daily: number;
        total: number;
        spent: number;
        currency: string;
    };
    platforms: string[];
    targeting: {
        locations: Array<{ city: string; region: string }>;
        ageRange: { min: number; max: number };
        gender: string;
        interests: string[];
    };
    adFormat?: string;
    creatives?: Array<{
        _id: string;
        name: string;
        creativeType?: string;
        media?: {
            imageUrl?: string;
            videoUrl?: string;
            thumbnailUrl?: string;
        };
        content?: {
            headline?: string;
            description?: string;
        };
    }>;
}

interface Creative {
    _id: string;
    name: string;
    creativeType?: string;
    media?: {
        imageUrl?: string;
        videoUrl?: string;
    };
    content?: {
        headline?: string;
        description?: string;
        primaryText?: string;
    };
    usage?: {
        platforms?: string[];
    };
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

const allPlatforms = [
    { id: 'facebook', name: 'Facebook', icon: Facebook, color: '#1877F2' },
    { id: 'instagram', name: 'Instagram', icon: Instagram, color: '#E4405F' },
    { id: 'google', name: 'Google Ads', icon: Target, color: '#4285F4' },
    { id: 'youtube', name: 'YouTube', icon: Youtube, color: '#FF0000' },
    { id: 'tiktok', name: 'TikTok', icon: Sparkles, color: '#000000' },
    { id: 'twitter', name: 'X (Twitter)', icon: Target, color: '#1DA1F2' }
];

export default function PublishPage() {
    // Selection states
    const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
    const [selectedCreative, setSelectedCreative] = useState<Creative | null>(null);

    // Data states
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [creatives, setCreatives] = useState<Creative[]>([]);

    // UI states
    const [loading, setLoading] = useState(true);
    const [publishing, setPublishing] = useState(false);
    const [published, setPublished] = useState(false);
    const [publishResult, setPublishResult] = useState<any>(null);
    const [error, setError] = useState('');

    // Modal states
    const [showCampaignModal, setShowCampaignModal] = useState(false);
    const [showCreativeModal, setShowCreativeModal] = useState(false);
    const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);

    // Schedule
    const [publishMode, setPublishMode] = useState<'now' | 'schedule'>('now');
    const [scheduleDate, setScheduleDate] = useState('');
    const [scheduleTime, setScheduleTime] = useState('');

    // Platform selection (user selects on publish page)
    const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['facebook', 'instagram']);

    const togglePlatform = (platformId: string) => {
        setSelectedPlatforms(prev =>
            prev.includes(platformId)
                ? prev.filter(p => p !== platformId)
                : [...prev, platformId]
        );
    };
    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Fetch campaigns
            const campaignsRes = await fetch(`${API_URL}/campaigns`);
            const campaignsData = await campaignsRes.json();
            setCampaigns(Array.isArray(campaignsData) ? campaignsData : []);

            // Fetch creatives
            const creativesRes = await fetch(`${API_URL}/creatives`);
            const creativesData = await creativesRes.json();
            setCreatives(Array.isArray(creativesData) ? creativesData : []);
        } catch (err) {
            console.error('Failed to fetch data:', err);
        } finally {
            setLoading(false);
        }
    };

    const handlePublish = async () => {
        if (!selectedCampaign) {
            setError('Please select a campaign first');
            return;
        }

        if (selectedPlatforms.length === 0) {
            setError('Please select at least one platform');
            return;
        }

        setPublishing(true);
        setError('');

        try {
            const payload = {
                name: selectedCampaign.name,
                campaignId: selectedCampaign._id,
                platforms: selectedPlatforms,
                budget: selectedCampaign.budget,
                targeting: {
                    ageMin: selectedCampaign.targeting?.ageRange?.min || 18,
                    ageMax: selectedCampaign.targeting?.ageRange?.max || 55,
                    gender: selectedCampaign.targeting?.gender || 'all',
                    cities: selectedCampaign.targeting?.locations?.map(l => l.city) || []
                },
                creativeIds: selectedCampaign.creatives?.map(c => c._id) || [],
                creative: selectedCampaign.creatives?.[0] ? {
                    headline: selectedCampaign.creatives[0].content?.headline || selectedCampaign.creatives[0].name,
                    description: selectedCampaign.creatives[0].content?.description || selectedCampaign.description,
                    image: selectedCampaign.creatives[0].media?.imageUrl,
                    video: selectedCampaign.creatives[0].media?.videoUrl,
                    cta: 'Shop Now'
                } : null,
                publishMode,
                scheduledFor: publishMode === 'schedule' ? `${scheduleDate}T${scheduleTime}` : null
            };

            const response = await fetch(`${API_URL}/publish`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Failed to publish');
            }

            setPublishResult(result);
            setPublished(true);

        } catch (err: any) {
            setError(err.message || 'Failed to publish campaign');
        } finally {
            setPublishing(false);
        }
    };

    const resetForm = () => {
        setPublished(false);
        setPublishResult(null);
        setSelectedCampaign(null);
        setSelectedPlatforms(['facebook', 'instagram']);
        setError('');
    };

    const totalReach = selectedPlatforms.length * 15000000;

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="animate-spin text-purple-500" size={48} />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <Rocket className="text-purple-500" size={28} />
                        Publish Ad Campaign
                    </h1>
                    <p className="text-slate-500">Select campaign & creative, then go live!</p>
                </div>
                {selectedCampaign && (
                    <div className="flex items-center gap-3 bg-purple-50 px-4 py-2 rounded-lg">
                        <Target size={20} className="text-purple-600" />
                        <span className="font-medium text-purple-700">
                            Est. Reach: {(totalReach / 1000000).toFixed(1)}M users
                        </span>
                    </div>
                )}
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
                    <AlertCircle size={18} />
                    {error}
                </div>
            )}

            {published ? (
                // Success State
                <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50 to-cyan-50">
                    <CardContent className="py-12 text-center">
                        <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                            <Check size={40} className="text-emerald-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-emerald-700 mb-2">
                            {publishMode === 'now' ? 'Campaign Published!' : 'Campaign Scheduled!'}
                        </h2>
                        <p className="text-slate-600 mb-2">
                            {publishResult?.message || `Your ad "${selectedCampaign?.name}" is now ${publishMode === 'now' ? 'live' : 'scheduled'}!`}
                        </p>
                        {publishResult?.webhookTriggered && (
                            <Badge className="bg-blue-100 text-blue-700 mb-4">
                                <RefreshCw size={12} className="mr-1" /> N8N Workflow Triggered
                            </Badge>
                        )}
                        <div className="flex justify-center gap-3 mt-6">
                            <Button variant="outline" onClick={resetForm}>
                                Publish Another
                            </Button>
                            <Button className="bg-emerald-600" onClick={() => setShowAnalyticsModal(true)}>
                                <BarChart3 size={16} className="mr-2" />
                                View Analytics
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left: Campaign & Creative Selection */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Step 1: Select Campaign */}
                        <Card className={selectedCampaign ? 'border-emerald-300 bg-emerald-50/30' : ''}>
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center justify-between">
                                    <span className="flex items-center gap-2">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${selectedCampaign ? 'bg-emerald-500' : 'bg-purple-500'}`}>
                                            {selectedCampaign ? <Check size={16} /> : '1'}
                                        </div>
                                        Select Campaign
                                    </span>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setShowCampaignModal(true)}
                                    >
                                        {selectedCampaign ? 'Change' : 'Browse Campaigns'}
                                    </Button>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {selectedCampaign ? (
                                    <div className="p-4 bg-white rounded-lg border border-emerald-200">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <Megaphone size={20} className="text-purple-500" />
                                                    <h3 className="font-semibold text-lg">{selectedCampaign.name}</h3>
                                                    <Badge className="bg-emerald-100 text-emerald-700">{selectedCampaign.objective}</Badge>
                                                </div>
                                                <p className="text-sm text-slate-600 mb-3">{selectedCampaign.description || 'No description'}</p>

                                                <div className="grid grid-cols-3 gap-4 text-sm">
                                                    <div className="p-2 bg-slate-50 rounded">
                                                        <p className="text-slate-500 text-xs">Daily Budget</p>
                                                        <p className="font-semibold">PKR {selectedCampaign.budget?.daily?.toLocaleString() || 0}</p>
                                                    </div>
                                                    <div className="p-2 bg-slate-50 rounded">
                                                        <p className="text-slate-500 text-xs">Total Budget</p>
                                                        <p className="font-semibold">PKR {selectedCampaign.budget?.total?.toLocaleString() || 0}</p>
                                                    </div>
                                                    <div className="p-2 bg-slate-50 rounded">
                                                        <p className="text-slate-500 text-xs">Targeting</p>
                                                        <p className="font-semibold">{selectedCampaign.targeting?.ageRange?.min || 18}-{selectedCampaign.targeting?.ageRange?.max || 55}, {selectedCampaign.targeting?.gender || 'All'}</p>
                                                    </div>
                                                </div>

                                                <div className="flex gap-2 mt-3">
                                                    {selectedCampaign.platforms?.map(platform => {
                                                        const Icon = platformIcons[platform] || Target;
                                                        return (
                                                            <div key={platform} className="flex items-center gap-1 px-2 py-1 bg-slate-100 rounded text-xs">
                                                                <Icon size={12} style={{ color: platformColors[platform] }} />
                                                                {platform}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                            <button onClick={() => setSelectedCampaign(null)} className="text-slate-400 hover:text-red-500">
                                                <X size={18} />
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div
                                        onClick={() => setShowCampaignModal(true)}
                                        className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center cursor-pointer hover:border-purple-400 hover:bg-purple-50 transition-all"
                                    >
                                        <Megaphone size={40} className="mx-auto text-slate-400 mb-2" />
                                        <p className="text-slate-600 font-medium">Select a Campaign</p>
                                        <p className="text-xs text-slate-400 mt-1">Campaign includes budget, targeting & platforms</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Step 2: Select Creative */}
                        <Card className={selectedCreative ? 'border-emerald-300 bg-emerald-50/30' : ''}>
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center justify-between">
                                    <span className="flex items-center gap-2">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${selectedCreative ? 'bg-emerald-500' : 'bg-purple-500'}`}>
                                            {selectedCreative ? <Check size={16} /> : '2'}
                                        </div>
                                        Select Creative
                                    </span>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setShowCreativeModal(true)}
                                    >
                                        {selectedCreative ? 'Change' : 'Browse Creatives'}
                                    </Button>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {selectedCreative ? (
                                    <div className="p-4 bg-white rounded-lg border border-emerald-200">
                                        <div className="flex items-start justify-between">
                                            <div className="flex gap-4">
                                                {/* Creative Preview */}
                                                <div className="w-24 h-24 rounded-lg overflow-hidden bg-slate-200 flex-shrink-0">
                                                    {selectedCreative.media?.videoUrl ? (
                                                        <video src={selectedCreative.media.videoUrl} className="w-full h-full object-cover" muted />
                                                    ) : selectedCreative.media?.imageUrl ? (
                                                        <img src={selectedCreative.media.imageUrl} alt={selectedCreative.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center">
                                                            <Image size={24} className="text-slate-400" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold">{selectedCreative.name}</h3>
                                                    <p className="text-sm text-slate-500 mt-1">
                                                        {selectedCreative.content?.headline || 'No headline'}
                                                    </p>
                                                    <p className="text-xs text-slate-400 mt-1 capitalize">
                                                        Type: {selectedCreative.creativeType || 'image'}
                                                    </p>
                                                </div>
                                            </div>
                                            <button onClick={() => setSelectedCreative(null)} className="text-slate-400 hover:text-red-500">
                                                <X size={18} />
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div
                                        onClick={() => setShowCreativeModal(true)}
                                        className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center cursor-pointer hover:border-purple-400 hover:bg-purple-50 transition-all"
                                    >
                                        <Image size={40} className="mx-auto text-slate-400 mb-2" />
                                        <p className="text-slate-600 font-medium">Select a Creative</p>
                                        <p className="text-xs text-slate-400 mt-1">Choose from Creative Studio</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Step 3: Select Platforms */}
                        <Card className={selectedPlatforms.length > 0 ? 'border-emerald-300 bg-emerald-50/30' : ''}>
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center justify-between">
                                    <span className="flex items-center gap-2">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${selectedPlatforms.length > 0 ? 'bg-emerald-500' : 'bg-purple-500'}`}>
                                            {selectedPlatforms.length > 0 ? <Check size={16} /> : '3'}
                                        </div>
                                        Select Platforms
                                    </span>
                                    <Badge className="bg-purple-100 text-purple-700">{selectedPlatforms.length} selected</Badge>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                    {allPlatforms.map((platform) => {
                                        const Icon = platform.icon;
                                        const isSelected = selectedPlatforms.includes(platform.id);
                                        return (
                                            <button
                                                key={platform.id}
                                                onClick={() => togglePlatform(platform.id)}
                                                className={`p-4 rounded-xl border-2 flex items-center gap-3 transition-all ${isSelected
                                                    ? 'border-emerald-500 bg-emerald-50'
                                                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                                                    }`}
                                            >
                                                <div
                                                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                                                    style={{ backgroundColor: isSelected ? platform.color : '#e2e8f0' }}
                                                >
                                                    <Icon size={20} className={isSelected ? 'text-white' : 'text-slate-500'} />
                                                </div>
                                                <div className="text-left">
                                                    <p className={`font-medium ${isSelected ? 'text-emerald-700' : 'text-slate-700'}`}>
                                                        {platform.name}
                                                    </p>
                                                    {platform.id === 'tiktok' && (
                                                        <p className="text-xs text-orange-500">Video required</p>
                                                    )}
                                                </div>
                                                {isSelected && (
                                                    <Check size={18} className="text-emerald-500 ml-auto" />
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Step 3: When to Publish */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-white font-bold">3</div>
                                    When to Publish
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex gap-4">
                                    <button
                                        onClick={() => setPublishMode('now')}
                                        className={`flex-1 p-4 rounded-xl border-2 text-center transition-all ${publishMode === 'now'
                                            ? 'border-emerald-500 bg-emerald-50'
                                            : 'border-slate-200 hover:border-slate-300'
                                            }`}
                                    >
                                        <Rocket size={24} className={`mx-auto mb-2 ${publishMode === 'now' ? 'text-emerald-600' : 'text-slate-400'}`} />
                                        <p className="font-semibold">Publish Now</p>
                                        <p className="text-xs text-slate-500">Go live immediately</p>
                                    </button>
                                    <button
                                        onClick={() => setPublishMode('schedule')}
                                        className={`flex-1 p-4 rounded-xl border-2 text-center transition-all ${publishMode === 'schedule'
                                            ? 'border-blue-500 bg-blue-50'
                                            : 'border-slate-200 hover:border-slate-300'
                                            }`}
                                    >
                                        <Clock size={24} className={`mx-auto mb-2 ${publishMode === 'schedule' ? 'text-blue-600' : 'text-slate-400'}`} />
                                        <p className="font-semibold">Schedule</p>
                                        <p className="text-xs text-slate-500">Set date & time</p>
                                    </button>
                                </div>

                                {publishMode === 'schedule' && (
                                    <div className="grid grid-cols-2 gap-4 p-4 mt-4 bg-blue-50 rounded-lg">
                                        <div>
                                            <label className="text-sm font-medium text-slate-700">Date</label>
                                            <input
                                                type="date"
                                                value={scheduleDate}
                                                onChange={(e) => setScheduleDate(e.target.value)}
                                                className="w-full mt-1 px-3 py-2 border rounded-lg"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-slate-700">Time</label>
                                            <input
                                                type="time"
                                                value={scheduleTime}
                                                onChange={(e) => setScheduleTime(e.target.value)}
                                                className="w-full mt-1 px-3 py-2 border rounded-lg"
                                            />
                                        </div>
                                        <div className="col-span-2 flex items-center gap-2 text-sm text-blue-600">
                                            <Sparkles size={14} />
                                            AI suggests: 7-10 PM for peak engagement
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right: Preview & Publish */}
                    <div className="space-y-6">
                        {/* Preview */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Eye size={20} />
                                    Ad Preview
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {selectedCreative ? (
                                    <div className="rounded-lg border overflow-hidden">
                                        {/* Creative Preview */}
                                        <div className="h-48 bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center overflow-hidden">
                                            {selectedCreative.media?.videoUrl ? (
                                                <video
                                                    src={selectedCreative.media.videoUrl}
                                                    className="w-full h-full object-cover"
                                                    controls
                                                    muted
                                                />
                                            ) : selectedCreative.media?.imageUrl ? (
                                                <img
                                                    src={selectedCreative.media.imageUrl}
                                                    alt={selectedCreative.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="text-center text-white/50">
                                                    <Image size={32} className="mx-auto mb-2" />
                                                    <p className="text-xs">No media</p>
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-3 bg-white">
                                            <p className="font-semibold text-sm">
                                                {selectedCreative.content?.headline || selectedCreative.name}
                                            </p>
                                            <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                                                {selectedCreative.content?.description || 'Your ad description'}
                                            </p>
                                            <Button size="sm" className="w-full mt-3 bg-blue-600">Shop Now</Button>
                                        </div>
                                    </div>
                                ) : selectedCampaign ? (
                                    <div className="rounded-lg border overflow-hidden">
                                        <div className="h-40 bg-gradient-to-br from-purple-100 to-pink-100 flex flex-col items-center justify-center text-slate-500">
                                            <Image size={32} className="mb-2 opacity-50" />
                                            <p className="text-sm font-medium">No Creative Selected</p>
                                            <p className="text-xs">Click "Select Creative" above</p>
                                        </div>
                                        <div className="p-3">
                                            <p className="font-semibold text-sm">{selectedCampaign.name}</p>
                                            <p className="text-xs text-slate-500 mt-1">{selectedCampaign.description || 'Select a creative to preview'}</p>
                                            <Button size="sm" className="w-full mt-3 bg-blue-600" disabled>Shop Now</Button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="rounded-lg border overflow-hidden">
                                        <div className="h-40 bg-gradient-to-br from-slate-200 to-slate-300 flex flex-col items-center justify-center text-slate-500">
                                            <Image size={32} className="mb-2 opacity-50" />
                                            <p className="text-sm font-medium">No Selection</p>
                                            <p className="text-xs">Select campaign & creative</p>
                                        </div>
                                        <div className="p-3">
                                            <p className="font-semibold text-sm">Ad Preview</p>
                                            <p className="text-xs text-slate-500 mt-1">Your ad will appear here</p>
                                            <Button size="sm" className="w-full mt-3 bg-blue-600" disabled>Shop Now</Button>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Summary & Publish */}
                        <Card className="bg-gradient-to-br from-slate-900 to-slate-800 text-white">
                            <CardHeader>
                                <CardTitle className="text-lg">Ready to Publish</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-400">Campaign</span>
                                    <span className="font-medium truncate max-w-[140px]">{selectedCampaign?.name || 'Not selected'}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-400">Creative</span>
                                    <span className="font-medium truncate max-w-[140px]">{selectedCreative?.name || 'Not selected'}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-400">Platforms</span>
                                    <span className="font-medium">{selectedPlatforms.length} selected</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-400">Budget</span>
                                    <span className="font-medium">PKR {selectedCampaign?.budget?.daily?.toLocaleString() || 0}/day</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-400">Schedule</span>
                                    <span className="font-medium">{publishMode === 'now' ? 'Immediately' : scheduleDate || 'Not set'}</span>
                                </div>

                                <div className="pt-4 border-t border-slate-700">
                                    <Button
                                        onClick={handlePublish}
                                        disabled={publishing || !selectedCampaign}
                                        className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600"
                                    >
                                        {publishing ? (
                                            <>
                                                <Loader2 size={16} className="mr-2 animate-spin" />
                                                Publishing...
                                            </>
                                        ) : (
                                            <>
                                                <Rocket size={16} className="mr-2" />
                                                {publishMode === 'now' ? 'Publish Now' : 'Schedule Campaign'}
                                            </>
                                        )}
                                    </Button>
                                    {!selectedCampaign && (
                                        <p className="text-xs text-slate-400 text-center mt-2">Select a campaign to continue</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            )}

            {/* Campaign Selection Modal */}
            {showCampaignModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
                        <div className="p-4 border-b flex items-center justify-between">
                            <h3 className="text-lg font-semibold">Select Campaign</h3>
                            <button onClick={() => setShowCampaignModal(false)} className="text-slate-500 hover:text-slate-700">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-4 overflow-y-auto max-h-[60vh]">
                            {campaigns.length === 0 ? (
                                <div className="text-center py-8">
                                    <Megaphone size={48} className="mx-auto text-slate-300 mb-2" />
                                    <p className="text-slate-500">No campaigns found</p>
                                    <p className="text-xs text-slate-400">Create a campaign first in Campaign Manager</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {campaigns.filter(c => c.status === 'draft' || c.status === 'active').map((campaign) => (
                                        <button
                                            key={campaign._id}
                                            onClick={() => {
                                                setSelectedCampaign(campaign);
                                                setShowCampaignModal(false);
                                            }}
                                            className={`w-full p-4 rounded-lg border-2 text-left transition-all hover:border-purple-400 ${selectedCampaign?._id === campaign._id ? 'border-purple-500 bg-purple-50' : 'border-slate-200'
                                                }`}
                                        >
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="font-semibold">{campaign.name}</span>
                                                <Badge>{campaign.objective}</Badge>
                                            </div>
                                            <p className="text-sm text-slate-500 mb-2">{campaign.description || 'No description'}</p>
                                            <div className="flex items-center gap-4 text-xs text-slate-500">
                                                <span>Budget: PKR {campaign.budget?.daily?.toLocaleString()}/day</span>
                                                <span>Platforms: {campaign.platforms?.length || 0}</span>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}


            {/* Analytics Modal - Professional Dashboard */}
            {showAnalyticsModal && (
                <div className="fixed inset-0 bg-gradient-to-br from-slate-900/95 via-purple-900/50 to-slate-900/95 backdrop-blur-md flex items-center justify-center z-50 p-4">
                    <div className="w-full max-w-5xl max-h-[92vh] overflow-y-auto bg-white rounded-2xl shadow-2xl">

                        {/* Header */}
                        <div className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 p-6 rounded-t-2xl">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                                        <BarChart3 size={28} />
                                        Campaign Analytics
                                    </h2>
                                    <p className="text-emerald-100 mt-1">
                                        {selectedCampaign?.name || 'Campaign'} • Real-time Performance
                                    </p>
                                </div>
                                <button
                                    onClick={() => setShowAnalyticsModal(false)}
                                    className="bg-white/20 hover:bg-white/30 p-2 rounded-full transition-all"
                                >
                                    <X size={20} className="text-white" />
                                </button>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-6 space-y-6">

                            {/* Key Metrics Row */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
                                    <div className="flex items-center justify-between mb-2">
                                        <Eye size={20} className="text-blue-600" />
                                        <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">+12.5%</span>
                                    </div>
                                    <p className="text-2xl font-bold text-blue-700">{((totalReach / 1000000) * 0.15).toFixed(1)}M</p>
                                    <p className="text-xs text-blue-600 font-medium">Impressions</p>
                                </div>

                                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
                                    <div className="flex items-center justify-between mb-2">
                                        <MousePointer size={20} className="text-purple-600" />
                                        <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">+8.3%</span>
                                    </div>
                                    <p className="text-2xl font-bold text-purple-700">{Math.floor(totalReach * 0.00015).toLocaleString()}</p>
                                    <p className="text-xs text-purple-600 font-medium">Clicks</p>
                                </div>

                                <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-4 border border-emerald-200">
                                    <div className="flex items-center justify-between mb-2">
                                        <ShoppingCart size={20} className="text-emerald-600" />
                                        <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">+15.2%</span>
                                    </div>
                                    <p className="text-2xl font-bold text-emerald-700">{Math.floor(totalReach * 0.000015).toLocaleString()}</p>
                                    <p className="text-xs text-emerald-600 font-medium">Conversions</p>
                                </div>

                                <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-4 border border-amber-200">
                                    <div className="flex items-center justify-between mb-2">
                                        <TrendingUp size={20} className="text-amber-600" />
                                        <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">4.2x</span>
                                    </div>
                                    <p className="text-2xl font-bold text-amber-700">4.2x</p>
                                    <p className="text-xs text-amber-600 font-medium">ROAS</p>
                                </div>
                            </div>

                            {/* Charts Section */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                                {/* Performance Chart */}
                                <div className="bg-slate-50 rounded-xl p-5 border">
                                    <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                                        <Activity size={18} className="text-purple-500" />
                                        Performance Trend (7 Days)
                                    </h3>
                                    <div className="h-48 flex items-end justify-between gap-2">
                                        {[35, 42, 38, 55, 48, 62, 70].map((height, i) => (
                                            <div key={i} className="flex-1 flex flex-col items-center gap-1">
                                                <div
                                                    className="w-full bg-gradient-to-t from-purple-500 to-purple-400 rounded-t-lg transition-all hover:from-purple-600 hover:to-purple-500"
                                                    style={{ height: `${height}%` }}
                                                />
                                                <span className="text-[10px] text-slate-500">
                                                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i]}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Platform Performance */}
                                <div className="bg-slate-50 rounded-xl p-5 border">
                                    <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                                        <Target size={18} className="text-emerald-500" />
                                        Platform Performance
                                    </h3>
                                    <div className="space-y-4">
                                        {selectedPlatforms.map((platform, i) => {
                                            const performance = [85, 72, 65, 58, 45, 40][i] || 50;
                                            const platformConfig: { [key: string]: { color: string, icon: any } } = {
                                                facebook: { color: 'bg-blue-500', icon: Facebook },
                                                instagram: { color: 'bg-gradient-to-r from-purple-500 to-pink-500', icon: Instagram },
                                                google: { color: 'bg-red-500', icon: Target },
                                                youtube: { color: 'bg-red-600', icon: Youtube },
                                                tiktok: { color: 'bg-slate-900', icon: Sparkles },
                                                twitter: { color: 'bg-sky-500', icon: Target }
                                            };
                                            const config = platformConfig[platform] || { color: 'bg-slate-500', icon: Target };
                                            const IconComponent = config.icon;

                                            return (
                                                <div key={platform} className="flex items-center gap-3">
                                                    <div className={`w-8 h-8 rounded-lg ${config.color} flex items-center justify-center`}>
                                                        <IconComponent size={16} className="text-white" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex justify-between mb-1">
                                                            <span className="text-sm font-medium capitalize">{platform}</span>
                                                            <span className="text-sm font-bold text-slate-700">{performance}%</span>
                                                        </div>
                                                        <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                                                            <div
                                                                className={`h-full ${config.color} rounded-full transition-all`}
                                                                style={{ width: `${performance}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                            {/* Additional Stats */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="bg-white rounded-xl p-4 border shadow-sm text-center">
                                    <Percent size={24} className="text-purple-500 mx-auto mb-2" />
                                    <p className="text-xl font-bold text-slate-800">2.4%</p>
                                    <p className="text-xs text-slate-500">Click Rate (CTR)</p>
                                </div>
                                <div className="bg-white rounded-xl p-4 border shadow-sm text-center">
                                    <DollarSign size={24} className="text-emerald-500 mx-auto mb-2" />
                                    <p className="text-xl font-bold text-slate-800">PKR 12.50</p>
                                    <p className="text-xs text-slate-500">Cost Per Click</p>
                                </div>
                                <div className="bg-white rounded-xl p-4 border shadow-sm text-center">
                                    <Users size={24} className="text-blue-500 mx-auto mb-2" />
                                    <p className="text-xl font-bold text-slate-800">68%</p>
                                    <p className="text-xs text-slate-500">Audience Reach</p>
                                </div>
                                <div className="bg-white rounded-xl p-4 border shadow-sm text-center">
                                    <Activity size={24} className="text-amber-500 mx-auto mb-2" />
                                    <p className="text-xl font-bold text-slate-800">Active</p>
                                    <p className="text-xs text-slate-500">Campaign Status</p>
                                </div>
                            </div>

                            {/* Action Button */}
                            <div className="pt-4 border-t">
                                <Button
                                    variant="outline"
                                    className="w-full"
                                    onClick={() => setShowAnalyticsModal(false)}
                                >
                                    Close
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Creative Selection Modal */}
            {showCreativeModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl max-w-3xl w-full max-h-[80vh] overflow-hidden">
                        <div className="p-4 border-b flex items-center justify-between">
                            <h3 className="text-lg font-semibold">Select Creative</h3>
                            <button onClick={() => setShowCreativeModal(false)} className="text-slate-500 hover:text-slate-700">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-4 overflow-y-auto max-h-[60vh]">
                            {creatives.length === 0 ? (
                                <div className="text-center py-8">
                                    <Image size={48} className="mx-auto text-slate-300 mb-2" />
                                    <p className="text-slate-500">No creatives found</p>
                                    <p className="text-xs text-slate-400">Create ads in Creative Studio first</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    {creatives.map((creative) => (
                                        <button
                                            key={creative._id}
                                            onClick={() => {
                                                setSelectedCreative(creative);
                                                setShowCreativeModal(false);
                                            }}
                                            className={`p-3 rounded-lg border-2 text-left transition-all hover:border-purple-400 ${selectedCreative?._id === creative._id ? 'border-purple-500 bg-purple-50' : 'border-slate-200'
                                                }`}
                                        >
                                            <div className="aspect-video rounded bg-gradient-to-br from-slate-800 to-slate-900 mb-2 overflow-hidden">
                                                {creative.media?.videoUrl ? (
                                                    <video src={creative.media.videoUrl} className="w-full h-full object-cover" muted />
                                                ) : creative.media?.imageUrl ? (
                                                    <img src={creative.media.imageUrl} alt={creative.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-slate-500">
                                                        <Image size={24} />
                                                    </div>
                                                )}
                                            </div>
                                            <p className="font-medium text-sm truncate">{creative.name}</p>
                                            <p className="text-xs text-slate-500 truncate">{creative.content?.headline || 'No headline'}</p>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
