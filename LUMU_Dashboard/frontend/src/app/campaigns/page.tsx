"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Plus,
    TrendingUp,
    TrendingDown,
    Play,
    Pause,
    Edit2,
    Trash2,
    Loader2,
    RefreshCw,
    Target,
    DollarSign,
    Users,
    Calendar,
    Facebook,
    Instagram,
    Globe,
    Eye,
    Sparkles,
    X
} from "lucide-react";

// API Base URL
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
    metrics: {
        impressions: number;
        clicks: number;
        conversions: number;
        revenue: number;
        ctr: number;
        roas: number;
    };
    createdAt: string;
}

export default function CampaignManagerPage() {
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState<'all' | 'active' | 'draft' | 'paused'>('all');

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        objective: 'sales',
        dailyBudget: 1000,
        totalBudget: 30000,
        platforms: ['facebook', 'instagram'],
        cities: ['Karachi', 'Lahore'],
        ageMin: 18,
        ageMax: 45,
        gender: 'all',
        interests: '',
        // New fields for platform APIs
        linkUrl: '',
        adFormat: 'single_image',
        bidStrategy: 'lowest_cost'
    });

    useEffect(() => {
        fetchCampaigns();
    }, []);

    const fetchCampaigns = async () => {
        try {
            setLoading(true);
            const res = await fetch(`${API_URL}/campaigns`);
            const data = await res.json();
            setCampaigns(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Failed to fetch campaigns:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async () => {
        try {
            setSaving(true);
            const res = await fetch(`${API_URL}/campaigns`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name,
                    description: formData.description,
                    objective: formData.objective,
                    budget: {
                        daily: formData.dailyBudget,
                        total: formData.totalBudget,
                        currency: 'PKR'
                    },
                    platforms: formData.platforms,
                    targeting: {
                        locations: formData.cities.map(city => ({ city, country: 'Pakistan' })),
                        ageRange: { min: formData.ageMin, max: formData.ageMax },
                        gender: formData.gender,
                        interests: formData.interests.split(',').map(i => i.trim()).filter(Boolean)
                    },
                    linkUrl: formData.linkUrl,
                    adFormat: formData.adFormat,
                    bidStrategy: formData.bidStrategy,
                    status: 'draft'
                })
            });
            if (res.ok) {
                fetchCampaigns();
                setShowCreateModal(false);
                resetForm();
            }
        } catch (error) {
            console.error('Failed to create campaign:', error);
        } finally {
            setSaving(false);
        }
    };

    const handleUpdate = async () => {
        if (!editingCampaign) return;
        try {
            setSaving(true);
            const res = await fetch(`${API_URL}/campaigns/${editingCampaign._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name,
                    description: formData.description,
                    objective: formData.objective,
                    budget: {
                        daily: formData.dailyBudget,
                        total: formData.totalBudget,
                        currency: 'PKR'
                    },
                    platforms: formData.platforms,
                    targeting: {
                        locations: formData.cities.map(city => ({ city, country: 'Pakistan' })),
                        ageRange: { min: formData.ageMin, max: formData.ageMax },
                        gender: formData.gender,
                        interests: formData.interests.split(',').map(i => i.trim()).filter(Boolean)
                    },
                    linkUrl: formData.linkUrl,
                    adFormat: formData.adFormat,
                    bidStrategy: formData.bidStrategy
                })
            });
            if (res.ok) {
                fetchCampaigns();
                setShowCreateModal(false);
                setEditingCampaign(null);
                resetForm();
            }
        } catch (error) {
            console.error('Failed to update campaign:', error);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this campaign?')) return;
        try {
            await fetch(`${API_URL}/campaigns/${id}`, { method: 'DELETE' });
            fetchCampaigns();
        } catch (error) {
            console.error('Failed to delete:', error);
        }
    };

    const handleToggleStatus = async (id: string, currentStatus: string) => {
        const newStatus = currentStatus === 'active' ? 'paused' : 'active';
        try {
            await fetch(`${API_URL}/campaigns/${id}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });
            fetchCampaigns();
        } catch (error) {
            console.error('Failed to toggle status:', error);
        }
    };

    const handleEdit = (campaign: Campaign) => {
        setEditingCampaign(campaign);
        setFormData({
            name: campaign.name,
            description: campaign.description || '',
            objective: campaign.objective,
            dailyBudget: campaign.budget?.daily || 1000,
            totalBudget: campaign.budget?.total || 30000,
            platforms: campaign.platforms || ['facebook', 'instagram'],
            cities: campaign.targeting?.locations?.map(l => l.city) || ['Karachi'],
            ageMin: campaign.targeting?.ageRange?.min || 18,
            ageMax: campaign.targeting?.ageRange?.max || 45,
            gender: campaign.targeting?.gender || 'all',
            interests: campaign.targeting?.interests?.join(', ') || '',
            linkUrl: (campaign as any).linkUrl || '',
            adFormat: (campaign as any).adFormat || 'single_image',
            bidStrategy: (campaign as any).bidStrategy || 'lowest_cost'
        });
        setShowCreateModal(true);
    };

    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            objective: 'sales',
            dailyBudget: 1000,
            totalBudget: 30000,
            platforms: ['facebook', 'instagram'],
            cities: ['Karachi', 'Lahore'],
            ageMin: 18,
            ageMax: 45,
            gender: 'all',
            interests: '',
            linkUrl: '',
            adFormat: 'single_image',
            bidStrategy: 'lowest_cost'
        });
    };

    const filteredCampaigns = campaigns.filter(c => {
        if (activeTab === 'active') return c.status === 'active';
        if (activeTab === 'draft') return c.status === 'draft';
        if (activeTab === 'paused') return c.status === 'paused';
        return true;
    });

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            active: 'bg-emerald-100 text-emerald-700',
            draft: 'bg-slate-100 text-slate-700',
            paused: 'bg-amber-100 text-amber-700',
            completed: 'bg-blue-100 text-blue-700'
        };
        return colors[status] || 'bg-slate-100 text-slate-700';
    };

    const getObjectiveIcon = (objective: string) => {
        switch (objective) {
            case 'sales': return <DollarSign size={14} />;
            case 'awareness': return <Eye size={14} />;
            case 'retargeting': return <Users size={14} />;
            case 'traffic': return <Globe size={14} />;
            default: return <Target size={14} />;
        }
    };

    // Stats
    const totalSpent = campaigns.reduce((sum, c) => sum + (c.budget?.spent || 0), 0);
    const totalRevenue = campaigns.reduce((sum, c) => sum + (c.metrics?.revenue || 0), 0);
    const activeCampaigns = campaigns.filter(c => c.status === 'active').length;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Campaign Manager</h1>
                    <p className="text-slate-500">Create and manage your advertising campaigns</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={fetchCampaigns} disabled={loading}>
                        <RefreshCw size={16} className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                    <Button
                        onClick={() => { setEditingCampaign(null); resetForm(); setShowCreateModal(true); }}
                        className="bg-gradient-to-r from-emerald-500 to-cyan-500"
                    >
                        <Plus size={16} className="mr-2" />
                        New Campaign
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="pt-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-500">Total Campaigns</p>
                                <p className="text-2xl font-bold">{campaigns.length}</p>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                                <Target className="text-blue-600" size={20} />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-500">Active</p>
                                <p className="text-2xl font-bold text-emerald-600">{activeCampaigns}</p>
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
                                <p className="text-sm text-slate-500">Total Spent</p>
                                <p className="text-2xl font-bold">PKR {(totalSpent / 1000).toFixed(0)}K</p>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                                <DollarSign className="text-amber-600" size={20} />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-500">Revenue</p>
                                <p className="text-2xl font-bold text-emerald-600">PKR {(totalRevenue / 1000).toFixed(0)}K</p>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                                <TrendingUp className="text-emerald-600" size={20} />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 border-b">
                {['all', 'active', 'draft', 'paused'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab as typeof activeTab)}
                        className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px capitalize ${activeTab === tab
                            ? 'border-emerald-500 text-emerald-600'
                            : 'border-transparent text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        {tab} ({tab === 'all' ? campaigns.length : campaigns.filter(c => c.status === tab).length})
                    </button>
                ))}
            </div>

            {/* Campaigns Grid */}
            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
                </div>
            ) : filteredCampaigns.length === 0 ? (
                <div className="text-center py-12">
                    <Target className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500">No campaigns found</p>
                    <Button
                        onClick={() => { resetForm(); setShowCreateModal(true); }}
                        className="mt-4"
                    >
                        Create First Campaign
                    </Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredCampaigns.map((campaign) => (
                        <Card key={campaign._id} className="hover:shadow-lg transition-shadow">
                            <CardHeader className="pb-2">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <CardTitle className="text-lg">{campaign.name}</CardTitle>
                                        <p className="text-sm text-slate-500 mt-1">{campaign.description || 'No description'}</p>
                                    </div>
                                    <Badge className={getStatusColor(campaign.status)}>
                                        {campaign.status === 'active' && <Play size={10} className="mr-1" />}
                                        {campaign.status === 'paused' && <Pause size={10} className="mr-1" />}
                                        {campaign.status}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Objective & Platforms */}
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-1 text-sm text-slate-600">
                                        {getObjectiveIcon(campaign.objective)}
                                        <span className="capitalize">{campaign.objective}</span>
                                    </div>
                                    <div className="flex gap-1">
                                        {campaign.platforms?.includes('facebook') && <Facebook size={14} className="text-blue-600" />}
                                        {campaign.platforms?.includes('instagram') && <Instagram size={14} className="text-pink-600" />}
                                        {campaign.platforms?.includes('google') && <Globe size={14} className="text-green-600" />}
                                    </div>
                                </div>

                                {/* Budget */}
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <p className="text-slate-500">Daily Budget</p>
                                        <p className="font-semibold">PKR {campaign.budget?.daily?.toLocaleString() || 0}</p>
                                    </div>
                                    <div>
                                        <p className="text-slate-500">Spent</p>
                                        <p className="font-semibold">PKR {campaign.budget?.spent?.toLocaleString() || 0}</p>
                                    </div>
                                </div>

                                {/* Metrics */}
                                <div className="grid grid-cols-3 gap-2 text-center bg-slate-50 rounded-lg p-3">
                                    <div>
                                        <p className="text-xs text-slate-500">Clicks</p>
                                        <p className="font-bold">{campaign.metrics?.clicks?.toLocaleString() || 0}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500">Conv.</p>
                                        <p className="font-bold">{campaign.metrics?.conversions || 0}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500">ROAS</p>
                                        <p className={`font-bold ${(campaign.metrics?.roas || 0) >= 2 ? 'text-emerald-600' : 'text-amber-600'}`}>
                                            {(campaign.metrics?.roas || 0).toFixed(1)}x
                                        </p>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-2 pt-2 border-t">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="flex-1"
                                        onClick={() => handleEdit(campaign)}
                                    >
                                        <Edit2 size={14} className="mr-1" /> Edit
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleToggleStatus(campaign._id, campaign.status)}
                                        className={campaign.status === 'active' ? 'text-amber-600' : 'text-emerald-600'}
                                    >
                                        {campaign.status === 'active' ? <Pause size={14} /> : <Play size={14} />}
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleDelete(campaign._id)}
                                        className="text-red-500"
                                    >
                                        <Trash2 size={14} />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Create/Edit Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                                <span className="flex items-center gap-2">
                                    {editingCampaign ? <Edit2 className="text-blue-500" /> : <Plus className="text-emerald-500" />}
                                    {editingCampaign ? 'Edit Campaign' : 'New Campaign'}
                                </span>
                                <button onClick={() => { setShowCreateModal(false); setEditingCampaign(null); }}>
                                    <X size={20} />
                                </button>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Name & Description */}
                            <div className="grid grid-cols-1 gap-4">
                                <div>
                                    <label className="text-sm font-medium">Campaign Name *</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="e.g., Winter Sale - Lahore"
                                        className="w-full mt-1 p-3 border rounded-lg"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium">Description</label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        placeholder="Campaign description..."
                                        className="w-full mt-1 p-3 border rounded-lg h-20 resize-none"
                                    />
                                </div>
                            </div>

                            {/* Objective */}
                            <div>
                                <label className="text-sm font-medium">Campaign Objective</label>
                                <div className="grid grid-cols-3 gap-3 mt-2">
                                    {[
                                        { value: 'sales', label: 'Sales', icon: DollarSign, desc: 'Drive purchases' },
                                        { value: 'awareness', label: 'Awareness', icon: Eye, desc: 'Increase visibility' },
                                        { value: 'retargeting', label: 'Retargeting', icon: Users, desc: 'Re-engage visitors' }
                                    ].map((obj) => (
                                        <button
                                            key={obj.value}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, objective: obj.value })}
                                            className={`p-4 border-2 rounded-xl text-left transition-all ${formData.objective === obj.value
                                                ? 'border-emerald-500 bg-emerald-50'
                                                : 'border-slate-200 hover:border-slate-300'
                                                }`}
                                        >
                                            <obj.icon size={24} className={formData.objective === obj.value ? 'text-emerald-600' : 'text-slate-400'} />
                                            <p className="font-semibold mt-2">{obj.label}</p>
                                            <p className="text-xs text-slate-500">{obj.desc}</p>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Budget */}
                            <div>
                                <label className="text-sm font-medium">Budget (PKR)</label>
                                <div className="grid grid-cols-2 gap-4 mt-2">
                                    <div>
                                        <label className="text-xs text-slate-500">Daily Budget</label>
                                        <input
                                            type="number"
                                            value={formData.dailyBudget}
                                            onChange={(e) => setFormData({ ...formData, dailyBudget: Number(e.target.value) })}
                                            className="w-full mt-1 p-2 border rounded-lg"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-slate-500">Total Budget</label>
                                        <input
                                            type="number"
                                            value={formData.totalBudget}
                                            onChange={(e) => setFormData({ ...formData, totalBudget: Number(e.target.value) })}
                                            className="w-full mt-1 p-2 border rounded-lg"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Platforms */}
                            <div>
                                <label className="text-sm font-medium">Platforms</label>
                                <div className="flex flex-wrap gap-3 mt-2">
                                    {[
                                        { id: 'facebook', icon: Facebook, color: '#1877F2' },
                                        { id: 'instagram', icon: Instagram, color: '#E4405F' },
                                        { id: 'google', icon: Globe, color: '#4285F4' },
                                        { id: 'youtube', icon: Eye, color: '#FF0000' },
                                        { id: 'tiktok', icon: Sparkles, color: '#000000' }
                                    ].map((platform) => (
                                        <label key={platform.id} className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={formData.platforms.includes(platform.id)}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setFormData({ ...formData, platforms: [...formData.platforms, platform.id] });
                                                    } else {
                                                        setFormData({ ...formData, platforms: formData.platforms.filter(p => p !== platform.id) });
                                                    }
                                                }}
                                                className="rounded"
                                            />
                                            <platform.icon size={16} style={{ color: platform.color }} />
                                            <span className="capitalize text-sm">{platform.id}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Targeting */}
                            <div>
                                <label className="text-sm font-medium">Target Audience</label>
                                <div className="grid grid-cols-2 gap-4 mt-2">
                                    <div>
                                        <label className="text-xs text-slate-500">Age Range</label>
                                        <div className="flex gap-2 mt-1">
                                            <input
                                                type="number"
                                                value={formData.ageMin}
                                                onChange={(e) => setFormData({ ...formData, ageMin: Number(e.target.value) })}
                                                className="w-full p-2 border rounded-lg"
                                                placeholder="Min"
                                            />
                                            <span className="self-center">-</span>
                                            <input
                                                type="number"
                                                value={formData.ageMax}
                                                onChange={(e) => setFormData({ ...formData, ageMax: Number(e.target.value) })}
                                                className="w-full p-2 border rounded-lg"
                                                placeholder="Max"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-xs text-slate-500">Gender</label>
                                        <select
                                            value={formData.gender}
                                            onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                                            className="w-full mt-1 p-2 border rounded-lg bg-white"
                                        >
                                            <option value="all">All</option>
                                            <option value="male">Male</option>
                                            <option value="female">Female</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="mt-3">
                                    <label className="text-xs text-slate-500">Interests (comma separated)</label>
                                    <input
                                        type="text"
                                        value={formData.interests}
                                        onChange={(e) => setFormData({ ...formData, interests: e.target.value })}
                                        placeholder="e.g., fashion, electronics, sports"
                                        className="w-full mt-1 p-2 border rounded-lg"
                                    />
                                </div>
                            </div>

                            {/* Link URL (Required for ads) */}
                            <div>
                                <label className="text-sm font-medium">Destination URL *</label>
                                <input
                                    type="url"
                                    value={formData.linkUrl}
                                    onChange={(e) => setFormData({ ...formData, linkUrl: e.target.value })}
                                    placeholder="https://yourwebsite.com/landing-page"
                                    className="w-full mt-1 p-3 border rounded-lg"
                                />
                                <p className="text-xs text-slate-500 mt-1">Where users will go when they click your ad</p>
                            </div>

                            {/* Ad Format & Bid Strategy */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium">Ad Format</label>
                                    <select
                                        value={formData.adFormat}
                                        onChange={(e) => setFormData({ ...formData, adFormat: e.target.value })}
                                        className="w-full mt-1 p-2 border rounded-lg bg-white"
                                    >
                                        <option value="single_image">Single Image</option>
                                        <option value="single_video">Single Video</option>
                                        <option value="carousel">Carousel</option>
                                        <option value="stories">Stories</option>
                                        <option value="collection">Collection</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-sm font-medium">Bid Strategy</label>
                                    <select
                                        value={formData.bidStrategy}
                                        onChange={(e) => setFormData({ ...formData, bidStrategy: e.target.value })}
                                        className="w-full mt-1 p-2 border rounded-lg bg-white"
                                    >
                                        <option value="lowest_cost">Lowest Cost (Auto)</option>
                                        <option value="cost_cap">Cost Cap</option>
                                        <option value="bid_cap">Bid Cap</option>
                                        <option value="maximize_conversions">Maximize Conversions</option>
                                        <option value="maximize_clicks">Maximize Clicks</option>
                                    </select>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3 pt-4 border-t">
                                <Button
                                    variant="outline"
                                    onClick={() => { setShowCreateModal(false); setEditingCampaign(null); resetForm(); }}
                                    className="flex-1"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={editingCampaign ? handleUpdate : handleCreate}
                                    disabled={saving || !formData.name}
                                    className={`flex-1 ${editingCampaign ? 'bg-blue-600' : 'bg-emerald-600'}`}
                                >
                                    {saving ? (
                                        <Loader2 size={16} className="mr-2 animate-spin" />
                                    ) : editingCampaign ? (
                                        <Edit2 size={16} className="mr-2" />
                                    ) : (
                                        <Plus size={16} className="mr-2" />
                                    )}
                                    {saving ? 'Saving...' : editingCampaign ? 'Update Campaign' : 'Create Campaign'}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
