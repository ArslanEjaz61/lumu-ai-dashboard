"use client";

import { useState } from "react";
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
    ChevronRight
} from "lucide-react";

// Platform options
const platforms = [
    {
        id: 'facebook',
        name: 'Facebook',
        icon: Facebook,
        color: '#1877F2',
        reach: '45M users',
        recommended: true,
        formats: ['Feed', 'Stories', 'Reels', 'Marketplace']
    },
    {
        id: 'instagram',
        name: 'Instagram',
        icon: Instagram,
        color: '#E4405F',
        reach: '35M users',
        recommended: true,
        formats: ['Feed', 'Stories', 'Reels', 'Explore']
    },
    {
        id: 'google',
        name: 'Google Ads',
        icon: Target,
        color: '#4285F4',
        reach: '100M+ searches',
        recommended: false,
        formats: ['Search', 'Display', 'Shopping', 'YouTube']
    },
    {
        id: 'youtube',
        name: 'YouTube',
        icon: Youtube,
        color: '#FF0000',
        reach: '50M viewers',
        recommended: false,
        formats: ['In-Stream', 'Discovery', 'Bumper', 'Shorts']
    },
];

// Mock ad for preview
const mockAd = {
    headline: "Winter Sale - Up to 50% Off!",
    description: "Shop the best deals on winter collection. Limited time offer.",
    image: "/uploads/winter-sale.jpg",
    cta: "Shop Now"
};

export default function PublishPage() {
    const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['facebook', 'instagram']);
    const [publishMode, setPublishMode] = useState<'now' | 'schedule'>('now');
    const [scheduleDate, setScheduleDate] = useState('');
    const [scheduleTime, setScheduleTime] = useState('');
    const [budget, setBudget] = useState({ daily: 1000, total: 7000 });
    const [targeting, setTargeting] = useState({
        ageMin: 18,
        ageMax: 45,
        gender: 'all',
        cities: ['Karachi', 'Lahore', 'Islamabad']
    });
    const [publishing, setPublishing] = useState(false);
    const [published, setPublished] = useState(false);

    const togglePlatform = (platformId: string) => {
        setSelectedPlatforms(prev =>
            prev.includes(platformId)
                ? prev.filter(p => p !== platformId)
                : [...prev, platformId]
        );
    };

    const handlePublish = async () => {
        setPublishing(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 2000));
        setPublishing(false);
        setPublished(true);
    };

    const totalReach = selectedPlatforms.length * 15000000; // Mock calculation

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <Rocket className="text-purple-500" size={28} />
                        Publish Ad Campaign
                    </h1>
                    <p className="text-slate-500">Select platforms and configure your campaign launch</p>
                </div>
                {selectedPlatforms.length > 0 && (
                    <div className="flex items-center gap-3 bg-purple-50 px-4 py-2 rounded-lg">
                        <Target size={20} className="text-purple-600" />
                        <span className="font-medium text-purple-700">
                            Est. Reach: {(totalReach / 1000000).toFixed(1)}M users
                        </span>
                    </div>
                )}
            </div>

            {published ? (
                // Success State
                <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50 to-cyan-50">
                    <CardContent className="py-12 text-center">
                        <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                            <Check size={40} className="text-emerald-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-emerald-700 mb-2">Campaign Published!</h2>
                        <p className="text-slate-600 mb-6">
                            Your ad is now live on {selectedPlatforms.length} platform(s)
                        </p>
                        <div className="flex justify-center gap-3">
                            <Button variant="outline" onClick={() => setPublished(false)}>
                                Create Another
                            </Button>
                            <Button className="bg-emerald-600">
                                View Campaign
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left: Platform Selection & Settings */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Platform Selection */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Target size={20} />
                                    Select Platforms
                                    <Badge className="ml-2 bg-purple-100 text-purple-700">{selectedPlatforms.length} selected</Badge>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {platforms.map((platform) => {
                                        const Icon = platform.icon;
                                        const isSelected = selectedPlatforms.includes(platform.id);
                                        return (
                                            <button
                                                key={platform.id}
                                                onClick={() => togglePlatform(platform.id)}
                                                className={`p-4 rounded-xl border-2 text-left transition-all relative ${isSelected
                                                        ? 'border-purple-500 bg-purple-50 shadow-md'
                                                        : 'border-slate-200 hover:border-slate-300'
                                                    }`}
                                            >
                                                {platform.recommended && (
                                                    <Badge className="absolute -top-2 -right-2 bg-amber-500 text-xs">
                                                        Recommended
                                                    </Badge>
                                                )}
                                                {isSelected && (
                                                    <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-purple-500 flex items-center justify-center">
                                                        <Check size={12} className="text-white" />
                                                    </div>
                                                )}
                                                <div
                                                    className="w-10 h-10 rounded-lg flex items-center justify-center mb-3"
                                                    style={{ backgroundColor: `${platform.color}20` }}
                                                >
                                                    <Icon size={24} style={{ color: platform.color }} />
                                                </div>
                                                <p className="font-semibold text-sm">{platform.name}</p>
                                                <p className="text-xs text-slate-500">{platform.reach}</p>
                                            </button>
                                        );
                                    })}
                                </div>

                                {/* AI Recommendation */}
                                <div className="mt-4 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg flex items-start gap-3">
                                    <Sparkles size={18} className="text-purple-600 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-medium text-purple-700">AI Recommendation</p>
                                        <p className="text-xs text-purple-600">Based on your audience, Instagram Stories and Facebook Feed will deliver the best ROAS.</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Publish Mode */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Calendar size={20} />
                                    When to Publish
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex gap-4 mb-4">
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
                                    <div className="grid grid-cols-2 gap-4 p-4 bg-blue-50 rounded-lg">
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
                                            <AlertCircle size={14} />
                                            Peak engagement: 7-10 PM PKT
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Budget & Targeting */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <DollarSign size={20} />
                                    Budget & Targeting
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-slate-700">Daily Budget (PKR)</label>
                                        <input
                                            type="number"
                                            value={budget.daily}
                                            onChange={(e) => setBudget({ ...budget, daily: Number(e.target.value) })}
                                            className="w-full mt-1 px-3 py-2 border rounded-lg"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-slate-700">Total Budget (PKR)</label>
                                        <input
                                            type="number"
                                            value={budget.total}
                                            onChange={(e) => setBudget({ ...budget, total: Number(e.target.value) })}
                                            className="w-full mt-1 px-3 py-2 border rounded-lg"
                                        />
                                    </div>
                                </div>

                                <div className="pt-4 border-t">
                                    <div className="flex items-center gap-2 mb-3">
                                        <Users size={18} className="text-slate-500" />
                                        <span className="font-medium">Audience Targeting</span>
                                    </div>
                                    <div className="grid grid-cols-3 gap-4">
                                        <div>
                                            <label className="text-xs text-slate-500">Age Range</label>
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="number"
                                                    value={targeting.ageMin}
                                                    onChange={(e) => setTargeting({ ...targeting, ageMin: Number(e.target.value) })}
                                                    className="w-16 px-2 py-1 border rounded text-sm text-center"
                                                />
                                                <span>-</span>
                                                <input
                                                    type="number"
                                                    value={targeting.ageMax}
                                                    onChange={(e) => setTargeting({ ...targeting, ageMax: Number(e.target.value) })}
                                                    className="w-16 px-2 py-1 border rounded text-sm text-center"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-xs text-slate-500">Gender</label>
                                            <select
                                                value={targeting.gender}
                                                onChange={(e) => setTargeting({ ...targeting, gender: e.target.value })}
                                                className="w-full px-2 py-1 border rounded text-sm"
                                            >
                                                <option value="all">All</option>
                                                <option value="male">Male</option>
                                                <option value="female">Female</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-xs text-slate-500">Cities</label>
                                            <p className="text-sm font-medium">{targeting.cities.length} selected</p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right: Preview & Publish */}
                    <div className="space-y-6">
                        {/* Ad Preview */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Eye size={20} />
                                    Ad Preview
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="rounded-lg border overflow-hidden">
                                    <div className="h-40 bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-white font-bold">
                                        [Ad Image Preview]
                                    </div>
                                    <div className="p-3">
                                        <p className="font-semibold text-sm">{mockAd.headline}</p>
                                        <p className="text-xs text-slate-500 mt-1">{mockAd.description}</p>
                                        <Button size="sm" className="w-full mt-3 bg-blue-600">
                                            {mockAd.cta}
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Summary */}
                        <Card className="bg-gradient-to-br from-slate-900 to-slate-800 text-white">
                            <CardHeader>
                                <CardTitle className="text-lg">Campaign Summary</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-400">Platforms</span>
                                    <span className="font-medium">{selectedPlatforms.length} selected</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-400">Est. Reach</span>
                                    <span className="font-medium">{(totalReach / 1000000).toFixed(1)}M</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-400">Daily Budget</span>
                                    <span className="font-medium">PKR {budget.daily.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-400">Total Budget</span>
                                    <span className="font-medium">PKR {budget.total.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-400">Schedule</span>
                                    <span className="font-medium">{publishMode === 'now' ? 'Immediately' : scheduleDate || 'Not set'}</span>
                                </div>

                                <div className="pt-4 border-t border-slate-700">
                                    <Button
                                        onClick={handlePublish}
                                        disabled={publishing || selectedPlatforms.length === 0}
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
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            )}
        </div>
    );
}
