"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Settings,
    RefreshCw,
    CheckCircle,
    AlertCircle,
    Eye,
    EyeOff,
    Save,
    Loader2,
    Plus,
    Trash2,
    Palette,
    Users,
    Edit2,
    ChevronDown,
} from "lucide-react";
import { useState, useEffect } from "react";
import { api, SettingsData, UserData } from "@/lib/api";

export default function SettingsPage() {
    const [settings, setSettings] = useState<SettingsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [activeTab, setActiveTab] = useState<'api' | 'branding' | 'users'>('api');
    const [expandedPlatform, setExpandedPlatform] = useState<string | null>(null);

    // Form states
    const [googleAds, setGoogleAds] = useState({
        developerToken: '',
        clientId: '',
        clientSecret: '',
        refreshToken: '',
        customerId: '',
    });
    const [metaAds, setMetaAds] = useState({
        appId: '',
        appSecret: '',
        accessToken: '',
        adAccountId: '',
        pageId: '',
    });
    const [tiktokAds, setTiktokAds] = useState({
        appId: '',
        appSecret: '',
        accessToken: '',
        advertiserId: '',
        businessCenterId: '',
    });
    const [twitterAds, setTwitterAds] = useState({
        apiKey: '',
        apiSecret: '',
        accessToken: '',
        accessTokenSecret: '',
        adAccountId: '',
    });
    const [openai, setOpenai] = useState({ apiKey: '' });
    const [clickCease, setClickCease] = useState({ apiKey: '', domain: '' });
    const [ga4, setGa4] = useState({ propertyId: '', accessToken: '' });
    const [branding, setBranding] = useState({
        dashboardName: 'LUMU',
        tagline: 'AI Dashboard',
        logoUrl: '',
        primaryColor: '#10b981'
    });

    // New user form
    const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'viewer', phone: '', department: '' });
    const [addingUser, setAddingUser] = useState(false);
    const [users, setUsers] = useState<UserData[]>([]);

    // Edit user modal
    const [editingUser, setEditingUser] = useState<UserData | null>(null);
    const [editForm, setEditForm] = useState<{ name: string; email: string; role: 'viewer' | 'admin' | 'manager'; department: string; active: boolean }>({ name: '', email: '', role: 'viewer', department: '', active: true });
    const [updatingUser, setUpdatingUser] = useState(false);

    // Add user modal
    const [showAddModal, setShowAddModal] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        setLoading(true);
        try {
            const data = await api.getSettings();
            setSettings(data);
            // Pre-fill forms with existing data
            setGoogleAds({
                developerToken: data.googleAds.developerToken,
                clientId: data.googleAds.clientId,
                clientSecret: data.googleAds.clientSecret,
                refreshToken: data.googleAds.refreshToken,
                customerId: data.googleAds.customerId,
            });
            setMetaAds({
                appId: data.metaAds?.appId || '',
                appSecret: data.metaAds?.appSecret || '',
                accessToken: data.metaAds?.accessToken || '',
                adAccountId: data.metaAds?.adAccountId || '',
                pageId: data.metaAds?.pageId || '',
            });
            setTiktokAds({
                appId: data.tiktokAds?.appId || '',
                appSecret: data.tiktokAds?.appSecret || '',
                accessToken: data.tiktokAds?.accessToken || '',
                advertiserId: data.tiktokAds?.advertiserId || '',
                businessCenterId: data.tiktokAds?.businessCenterId || '',
            });
            setTwitterAds({
                apiKey: data.twitterAds?.apiKey || '',
                apiSecret: data.twitterAds?.apiSecret || '',
                accessToken: data.twitterAds?.accessToken || '',
                accessTokenSecret: data.twitterAds?.accessTokenSecret || '',
                adAccountId: data.twitterAds?.adAccountId || '',
            });
            setOpenai({ apiKey: data.openai?.apiKey || '' });
            setClickCease({ apiKey: data.clickCease?.apiKey || '', domain: data.clickCease?.domain || '' });
            setGa4({ propertyId: data.ga4?.propertyId || '', accessToken: data.ga4?.accessToken || '' });
            if (data.branding) {
                setBranding(data.branding);
            }
        } catch (error) {
            console.error('Failed to load settings:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        setMessage(null);
        try {
            await api.updateSettings({
                googleAds: { ...googleAds, connected: false },
                metaAds: { ...metaAds, connected: false },
                tiktokAds: { ...tiktokAds, connected: false },
                twitterAds: { ...twitterAds, connected: false },
                openai: { ...openai, connected: false },
                clickCease: { ...clickCease, connected: false },
                ga4: { ...ga4, connected: false },
                branding,
            });
            setMessage({ type: 'success', text: 'Settings saved successfully!' });
            fetchSettings();
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to save settings' });
        } finally {
            setSaving(false);
        }
    };

    const handleAddUser = async () => {
        if (!newUser.name || !newUser.email || !newUser.password) {
            setMessage({ type: 'error', text: 'Name, email and password are required' });
            return;
        }
        if (newUser.password.length < 6) {
            setMessage({ type: 'error', text: 'Password must be at least 6 characters' });
            return;
        }
        setAddingUser(true);
        try {
            await api.addUser(newUser);
            setNewUser({ name: '', email: '', password: '', role: 'viewer', phone: '', department: '' });
            setMessage({ type: 'success', text: 'User added successfully!' });
            fetchSettings();
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to add user' });
        } finally {
            setAddingUser(false);
        }
    };

    const handleDeleteUser = async (userId: string) => {
        if (!confirm('Are you sure you want to delete this user?')) return;
        try {
            await api.deleteUser(userId);
            setMessage({ type: 'success', text: 'User deleted successfully!' });
            fetchSettings();
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to delete user' });
        }
    };

    const handleEditUser = (user: UserData) => {
        setEditingUser(user);
        setEditForm({
            name: user.name,
            email: user.email,
            role: user.role as 'viewer' | 'admin' | 'manager',
            department: user.department || '',
            active: user.active !== false
        });
    };

    const handleUpdateUser = async () => {
        if (!editingUser) return;
        setUpdatingUser(true);
        try {
            await api.updateUser(editingUser._id, editForm);
            setMessage({ type: 'success', text: 'User updated successfully!' });
            setEditingUser(null);
            fetchSettings();
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to update user' });
        } finally {
            setUpdatingUser(false);
        }
    };

    const toggleSecret = (key: string) => {
        setShowSecrets(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const InputField = ({
        label,
        value,
        onChange,
        secretKey,
        placeholder
    }: {
        label: string;
        value: string;
        onChange: (v: string) => void;
        secretKey?: string;
        placeholder?: string;
    }) => (
        <div className="space-y-1">
            <label className="text-sm font-medium text-slate-600">{label}</label>
            <div className="relative">
                <input
                    type={secretKey && !showSecrets[secretKey] ? "password" : "text"}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
                {secretKey && (
                    <button
                        type="button"
                        onClick={() => toggleSecret(secretKey)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                        {showSecrets[secretKey] ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                )}
            </div>
        </div>
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                        Settings
                    </h1>
                    <p className="text-slate-500">Manage API credentials, branding, and users</p>
                </div>
                <Button onClick={handleSave} disabled={saving} className="bg-emerald-600 hover:bg-emerald-700">
                    {saving ? <Loader2 size={16} className="mr-2 animate-spin" /> : <Save size={16} className="mr-2" />}
                    Save All Settings
                </Button>
            </div>

            {message && (
                <div className={`px-4 py-3 rounded-lg ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                    {message.type === 'success' ? '✅' : '❌'} {message.text}
                </div>
            )}

            {/* Tabs */}
            <div className="flex gap-2 border-b pb-4">
                <button
                    onClick={() => setActiveTab('api')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'api' ? 'bg-emerald-100 text-emerald-700' : 'text-slate-600 hover:bg-slate-100'}`}
                >
                    API Credentials
                </button>
                <button
                    onClick={() => setActiveTab('branding')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${activeTab === 'branding' ? 'bg-emerald-100 text-emerald-700' : 'text-slate-600 hover:bg-slate-100'}`}
                >
                    <Palette size={16} /> Branding
                </button>
                <button
                    onClick={() => setActiveTab('users')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${activeTab === 'users' ? 'bg-emerald-100 text-emerald-700' : 'text-slate-600 hover:bg-slate-100'}`}
                >
                    <Users size={16} /> Users
                </button>
            </div>

            {/* API Credentials Tab */}
            {activeTab === 'api' && (
                <div className="space-y-2">
                    {/* Ad Platforms Header */}
                    <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">Ad Platforms</h3>
                    
                    {/* Meta Ads Row */}
                    <div className="border rounded-lg overflow-hidden">
                        <button
                            onClick={() => setExpandedPlatform(expandedPlatform === 'meta' ? null : 'meta')}
                            className="w-full flex items-center justify-between p-4 bg-white hover:bg-slate-50 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center">
                                    <span className="text-white font-bold">M</span>
                                </div>
                                <div className="text-left">
                                    <p className="font-semibold text-slate-800">Meta Ads</p>
                                    <p className="text-sm text-slate-500">Facebook & Instagram</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Badge variant="outline" className={settings?.metaAds?.connected ? "bg-emerald-50 text-emerald-600" : "bg-slate-50 text-slate-500"}>
                                    {settings?.metaAds?.connected ? 'Connected' : 'Not Connected'}
                                </Badge>
                                <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${expandedPlatform === 'meta' ? 'rotate-180' : ''}`} />
                            </div>
                        </button>
                        {expandedPlatform === 'meta' && (
                            <div className="p-4 bg-slate-50 border-t space-y-3">
                                <InputField label="Ad Account ID" value={metaAds.adAccountId} onChange={(v) => setMetaAds({ ...metaAds, adAccountId: v })} placeholder="act_xxxxxxxxxx" />
                                <InputField label="Page ID" value={metaAds.pageId} onChange={(v) => setMetaAds({ ...metaAds, pageId: v })} placeholder="Page ID" />
                                <InputField label="App ID" value={metaAds.appId} onChange={(v) => setMetaAds({ ...metaAds, appId: v })} placeholder="Meta App ID" />
                                <InputField label="App Secret" value={metaAds.appSecret} onChange={(v) => setMetaAds({ ...metaAds, appSecret: v })} secretKey="metaSecret" placeholder="Meta App Secret" />
                                <InputField label="Access Token" value={metaAds.accessToken} onChange={(v) => setMetaAds({ ...metaAds, accessToken: v })} secretKey="metaToken" placeholder="Long-lived Access Token" />
                                <div className="flex gap-2 pt-3">
                                    <Button variant="outline" size="sm">Test Connection</Button>
                                    <Button size="sm" onClick={handleSave} disabled={saving} className="bg-blue-600 hover:bg-blue-700 ml-auto">
                                        {saving ? <Loader2 size={14} className="animate-spin mr-1" /> : <Save size={14} className="mr-1" />} Save
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Google Ads Row */}
                    <div className="border rounded-lg overflow-hidden">
                        <button
                            onClick={() => setExpandedPlatform(expandedPlatform === 'google' ? null : 'google')}
                            className="w-full flex items-center justify-between p-4 bg-white hover:bg-slate-50 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-emerald-500 flex items-center justify-center">
                                    <span className="text-white font-bold">G</span>
                                </div>
                                <div className="text-left">
                                    <p className="font-semibold text-slate-800">Google Ads</p>
                                    <p className="text-sm text-slate-500">Search, Display & YouTube</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Badge variant="outline" className={settings?.googleAds?.connected ? "bg-emerald-50 text-emerald-600" : "bg-slate-50 text-slate-500"}>
                                    {settings?.googleAds?.connected ? 'Connected' : 'Not Connected'}
                                </Badge>
                                <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${expandedPlatform === 'google' ? 'rotate-180' : ''}`} />
                            </div>
                        </button>
                        {expandedPlatform === 'google' && (
                            <div className="p-4 bg-slate-50 border-t space-y-3">
                                <InputField label="Customer ID" value={googleAds.customerId} onChange={(v) => setGoogleAds({ ...googleAds, customerId: v })} placeholder="xxx-xxx-xxxx" />
                                <InputField label="Developer Token" value={googleAds.developerToken} onChange={(v) => setGoogleAds({ ...googleAds, developerToken: v })} secretKey="googleDev" placeholder="Developer Token" />
                                <InputField label="Client ID" value={googleAds.clientId} onChange={(v) => setGoogleAds({ ...googleAds, clientId: v })} placeholder="OAuth Client ID" />
                                <InputField label="Client Secret" value={googleAds.clientSecret} onChange={(v) => setGoogleAds({ ...googleAds, clientSecret: v })} secretKey="googleSecret" placeholder="OAuth Client Secret" />
                                <InputField label="Refresh Token" value={googleAds.refreshToken} onChange={(v) => setGoogleAds({ ...googleAds, refreshToken: v })} secretKey="googleRefresh" placeholder="OAuth Refresh Token" />
                                <div className="flex gap-2 pt-3">
                                    <Button variant="outline" size="sm">Test Connection</Button>
                                    <Button size="sm" onClick={handleSave} disabled={saving} className="bg-emerald-600 hover:bg-emerald-700 ml-auto">
                                        {saving ? <Loader2 size={14} className="animate-spin mr-1" /> : <Save size={14} className="mr-1" />} Save
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* TikTok Ads Row */}
                    <div className="border rounded-lg overflow-hidden">
                        <button
                            onClick={() => setExpandedPlatform(expandedPlatform === 'tiktok' ? null : 'tiktok')}
                            className="w-full flex items-center justify-between p-4 bg-white hover:bg-slate-50 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-black flex items-center justify-center">
                                    <span className="text-white font-bold text-sm">TT</span>
                                </div>
                                <div className="text-left">
                                    <p className="font-semibold text-slate-800">TikTok Ads</p>
                                    <p className="text-sm text-slate-500">Video Advertising</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Badge variant="outline" className={settings?.tiktokAds?.connected ? "bg-emerald-50 text-emerald-600" : "bg-slate-50 text-slate-500"}>
                                    {settings?.tiktokAds?.connected ? 'Connected' : 'Not Connected'}
                                </Badge>
                                <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${expandedPlatform === 'tiktok' ? 'rotate-180' : ''}`} />
                            </div>
                        </button>
                        {expandedPlatform === 'tiktok' && (
                            <div className="p-4 bg-slate-50 border-t space-y-3">
                                <InputField label="Advertiser ID" value={tiktokAds.advertiserId} onChange={(v) => setTiktokAds({ ...tiktokAds, advertiserId: v })} placeholder="TikTok Advertiser ID" />
                                <InputField label="Business Center ID" value={tiktokAds.businessCenterId} onChange={(v) => setTiktokAds({ ...tiktokAds, businessCenterId: v })} placeholder="Business Center ID" />
                                <InputField label="App ID" value={tiktokAds.appId} onChange={(v) => setTiktokAds({ ...tiktokAds, appId: v })} placeholder="TikTok App ID" />
                                <InputField label="App Secret" value={tiktokAds.appSecret} onChange={(v) => setTiktokAds({ ...tiktokAds, appSecret: v })} secretKey="tiktokSecret" placeholder="TikTok App Secret" />
                                <InputField label="Access Token" value={tiktokAds.accessToken} onChange={(v) => setTiktokAds({ ...tiktokAds, accessToken: v })} secretKey="tiktokToken" placeholder="TikTok Access Token" />
                                <div className="flex gap-2 pt-3">
                                    <Button variant="outline" size="sm">Test Connection</Button>
                                    <Button size="sm" onClick={handleSave} disabled={saving} className="bg-black hover:bg-gray-800 ml-auto">
                                        {saving ? <Loader2 size={14} className="animate-spin mr-1" /> : <Save size={14} className="mr-1" />} Save
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* X (Twitter) Ads Row */}
                    <div className="border rounded-lg overflow-hidden">
                        <button
                            onClick={() => setExpandedPlatform(expandedPlatform === 'twitter' ? null : 'twitter')}
                            className="w-full flex items-center justify-between p-4 bg-white hover:bg-slate-50 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-sky-500 flex items-center justify-center">
                                    <span className="text-white font-bold">X</span>
                                </div>
                                <div className="text-left">
                                    <p className="font-semibold text-slate-800">X (Twitter) Ads</p>
                                    <p className="text-sm text-slate-500">Tweet Promotions</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Badge variant="outline" className={settings?.twitterAds?.connected ? "bg-emerald-50 text-emerald-600" : "bg-slate-50 text-slate-500"}>
                                    {settings?.twitterAds?.connected ? 'Connected' : 'Not Connected'}
                                </Badge>
                                <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${expandedPlatform === 'twitter' ? 'rotate-180' : ''}`} />
                            </div>
                        </button>
                        {expandedPlatform === 'twitter' && (
                            <div className="p-4 bg-slate-50 border-t space-y-3">
                                <InputField label="Ad Account ID" value={twitterAds.adAccountId} onChange={(v) => setTwitterAds({ ...twitterAds, adAccountId: v })} placeholder="Twitter Ad Account ID" />
                                <InputField label="API Key" value={twitterAds.apiKey} onChange={(v) => setTwitterAds({ ...twitterAds, apiKey: v })} secretKey="twitterKey" placeholder="Twitter API Key" />
                                <InputField label="API Secret" value={twitterAds.apiSecret} onChange={(v) => setTwitterAds({ ...twitterAds, apiSecret: v })} secretKey="twitterApiSecret" placeholder="Twitter API Secret" />
                                <InputField label="Access Token" value={twitterAds.accessToken} onChange={(v) => setTwitterAds({ ...twitterAds, accessToken: v })} secretKey="twitterAccessToken" placeholder="Access Token" />
                                <InputField label="Access Token Secret" value={twitterAds.accessTokenSecret} onChange={(v) => setTwitterAds({ ...twitterAds, accessTokenSecret: v })} secretKey="twitterTokenSecret" placeholder="Access Token Secret" />
                                <div className="flex gap-2 pt-3">
                                    <Button variant="outline" size="sm">Test Connection</Button>
                                    <Button size="sm" onClick={handleSave} disabled={saving} className="bg-sky-500 hover:bg-sky-600 ml-auto">
                                        {saving ? <Loader2 size={14} className="animate-spin mr-1" /> : <Save size={14} className="mr-1" />} Save
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Other Services Header */}
                    <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mt-8 mb-4">Other Services</h3>

                    {/* OpenAI Row */}
                    <div className="border rounded-lg overflow-hidden">
                        <button
                            onClick={() => setExpandedPlatform(expandedPlatform === 'openai' ? null : 'openai')}
                            className="w-full flex items-center justify-between p-4 bg-white hover:bg-slate-50 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-purple-500 flex items-center justify-center">
                                    <span className="text-white font-bold text-sm">AI</span>
                                </div>
                                <div className="text-left">
                                    <p className="font-semibold text-slate-800">OpenAI</p>
                                    <p className="text-sm text-slate-500">AI Features & Generation</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Badge variant="outline" className={settings?.openai?.connected ? "bg-emerald-50 text-emerald-600" : "bg-slate-50 text-slate-500"}>
                                    {settings?.openai?.connected ? 'Connected' : 'Not Connected'}
                                </Badge>
                                <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${expandedPlatform === 'openai' ? 'rotate-180' : ''}`} />
                            </div>
                        </button>
                        {expandedPlatform === 'openai' && (
                            <div className="p-4 bg-slate-50 border-t space-y-3">
                                <InputField label="API Key" value={openai.apiKey} onChange={(v) => setOpenai({ apiKey: v })} secretKey="openaiKey" placeholder="sk-xxxxxxxxxxxxxxxx" />
                                <p className="text-xs text-slate-500">Used for AI-powered ad copy and image generation.</p>
                                <div className="flex gap-2 pt-3">
                                    <Button variant="outline" size="sm">Test Connection</Button>
                                    <Button size="sm" onClick={handleSave} disabled={saving} className="bg-purple-600 hover:bg-purple-700 ml-auto">
                                        {saving ? <Loader2 size={14} className="animate-spin mr-1" /> : <Save size={14} className="mr-1" />} Save
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Google Analytics Row */}
                    <div className="border rounded-lg overflow-hidden">
                        <button
                            onClick={() => setExpandedPlatform(expandedPlatform === 'ga4' ? null : 'ga4')}
                            className="w-full flex items-center justify-between p-4 bg-white hover:bg-slate-50 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-orange-500 flex items-center justify-center">
                                    <span className="text-white font-bold text-sm">GA</span>
                                </div>
                                <div className="text-left">
                                    <p className="font-semibold text-slate-800">Google Analytics 4</p>
                                    <p className="text-sm text-slate-500">Website Analytics</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Badge variant="outline" className={settings?.ga4?.connected ? "bg-emerald-50 text-emerald-600" : "bg-slate-50 text-slate-500"}>
                                    {settings?.ga4?.connected ? 'Connected' : 'Not Connected'}
                                </Badge>
                                <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${expandedPlatform === 'ga4' ? 'rotate-180' : ''}`} />
                            </div>
                        </button>
                        {expandedPlatform === 'ga4' && (
                            <div className="p-4 bg-slate-50 border-t space-y-3">
                                <InputField label="Property ID" value={ga4.propertyId} onChange={(v) => setGa4({ ...ga4, propertyId: v })} placeholder="xxxxxxxxx" />
                                <InputField label="Access Token" value={ga4.accessToken} onChange={(v) => setGa4({ ...ga4, accessToken: v })} secretKey="ga4Token" placeholder="OAuth Access Token" />
                                <div className="flex gap-2 pt-3">
                                    <Button variant="outline" size="sm">Test Connection</Button>
                                    <Button size="sm" onClick={handleSave} disabled={saving} className="bg-orange-600 hover:bg-orange-700 ml-auto">
                                        {saving ? <Loader2 size={14} className="animate-spin mr-1" /> : <Save size={14} className="mr-1" />} Save
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* ClickCease Row */}
                    <div className="border rounded-lg overflow-hidden">
                        <button
                            onClick={() => setExpandedPlatform(expandedPlatform === 'clickcease' ? null : 'clickcease')}
                            className="w-full flex items-center justify-between p-4 bg-white hover:bg-slate-50 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-red-500 flex items-center justify-center">
                                    <span className="text-white font-bold text-sm">CC</span>
                                </div>
                                <div className="text-left">
                                    <p className="font-semibold text-slate-800">ClickCease</p>
                                    <p className="text-sm text-slate-500">Fraud Protection</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Badge variant="outline" className={settings?.clickCease?.connected ? "bg-emerald-50 text-emerald-600" : "bg-slate-50 text-slate-500"}>
                                    {settings?.clickCease?.connected ? 'Connected' : 'Not Connected'}
                                </Badge>
                                <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${expandedPlatform === 'clickcease' ? 'rotate-180' : ''}`} />
                            </div>
                        </button>
                        {expandedPlatform === 'clickcease' && (
                            <div className="p-4 bg-slate-50 border-t space-y-3">
                                <InputField label="API Key" value={clickCease.apiKey} onChange={(v) => setClickCease({ ...clickCease, apiKey: v })} secretKey="ccKey" placeholder="Your ClickCease API key" />
                                <InputField label="Domain" value={clickCease.domain} onChange={(v) => setClickCease({ ...clickCease, domain: v })} placeholder="yourdomain.com" />
                                <div className="flex gap-2 pt-3">
                                    <Button variant="outline" size="sm">Test Connection</Button>
                                    <Button size="sm" onClick={handleSave} disabled={saving} className="bg-red-600 hover:bg-red-700 ml-auto">
                                        {saving ? <Loader2 size={14} className="animate-spin mr-1" /> : <Save size={14} className="mr-1" />} Save
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Branding Tab */}
            {activeTab === 'branding' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Palette size={18} className="text-purple-500" />
                                Dashboard Branding
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-slate-600">Dashboard Name</label>
                                <input
                                    type="text"
                                    value={branding.dashboardName}
                                    onChange={(e) => setBranding({ ...branding, dashboardName: e.target.value })}
                                    placeholder="Enter dashboard name"
                                    className="w-full px-3 py-2 border rounded-lg bg-white text-sm focus:ring-2 focus:ring-emerald-500"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-slate-600">Tagline</label>
                                <input
                                    type="text"
                                    value={branding.tagline}
                                    onChange={(e) => setBranding({ ...branding, tagline: e.target.value })}
                                    placeholder="AI Dashboard"
                                    className="w-full px-3 py-2 border rounded-lg bg-white text-sm focus:ring-2 focus:ring-emerald-500"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-slate-600">Logo URL (optional)</label>
                                <input
                                    type="text"
                                    value={branding.logoUrl}
                                    onChange={(e) => setBranding({ ...branding, logoUrl: e.target.value })}
                                    placeholder="https://example.com/logo.png"
                                    className="w-full px-3 py-2 border rounded-lg bg-white text-sm focus:ring-2 focus:ring-emerald-500"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-slate-600">Primary Color</label>
                                <div className="flex gap-3 items-center">
                                    <input
                                        type="color"
                                        value={branding.primaryColor}
                                        onChange={(e) => setBranding({ ...branding, primaryColor: e.target.value })}
                                        className="w-12 h-10 rounded border cursor-pointer"
                                    />
                                    <input
                                        type="text"
                                        value={branding.primaryColor}
                                        onChange={(e) => setBranding({ ...branding, primaryColor: e.target.value })}
                                        className="flex-1 px-3 py-2 border rounded-lg bg-white text-sm"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Preview */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg">Preview</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="bg-slate-900 rounded-lg p-4">
                                <div className="flex items-center gap-3">
                                    <div
                                        className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg text-white"
                                        style={{ background: `linear-gradient(135deg, ${branding.primaryColor}, #06b6d4)` }}
                                    >
                                        {branding.logoUrl ? (
                                            <img src={branding.logoUrl} alt="Logo" className="w-8 h-8 rounded" />
                                        ) : (
                                            branding.dashboardName.charAt(0).toUpperCase()
                                        )}
                                    </div>
                                    <div>
                                        <h1 className="font-bold text-lg text-white">{branding.dashboardName || 'LUMU'}</h1>
                                        <p className="text-xs text-slate-400">{branding.tagline || 'AI Dashboard'}</p>
                                    </div>
                                </div>
                            </div>
                            <p className="text-xs text-slate-500 mt-3">This is how your sidebar header will look.</p>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Users Tab */}
            {activeTab === 'users' && (
                <div className="space-y-6">
                    {/* Add User Button */}
                    <div className="flex justify-between items-center">
                        <h2 className="text-lg font-semibold">User Management</h2>
                        <Button onClick={() => setShowAddModal(true)} className="bg-emerald-600 hover:bg-emerald-700">
                            <Plus size={16} className="mr-2" />
                            Add User
                        </Button>
                    </div>

                    {/* Users List */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Users size={18} className="text-blue-500" />
                                Users ({settings?.users?.length || 0})
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {settings?.users && settings.users.length > 0 ? (
                                <div className="space-y-2">
                                    {settings.users.map((user) => (
                                        <div key={user._id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center font-bold text-emerald-600">
                                                    {user.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-medium">{user.name}</p>
                                                    <p className="text-sm text-slate-500">{user.email}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <Badge variant="outline" className={
                                                    user.role === 'admin' ? 'bg-purple-50 text-purple-600' :
                                                        user.role === 'manager' ? 'bg-blue-50 text-blue-600' :
                                                            'bg-slate-50 text-slate-600'
                                                }>
                                                    {user.role}
                                                </Badge>
                                                <Badge variant="outline" className={user.active !== false ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}>
                                                    {user.active !== false ? 'Active' : 'Inactive'}
                                                </Badge>
                                                <Button variant="ghost" size="icon-sm" onClick={() => handleEditUser(user)} className="text-blue-500 hover:text-blue-700 hover:bg-blue-50">
                                                    <Edit2 size={16} />
                                                </Button>
                                                <Button variant="ghost" size="icon-sm" onClick={() => handleDeleteUser(user._id)} className="text-red-500 hover:text-red-700 hover:bg-red-50">
                                                    <Trash2 size={16} />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-slate-500">
                                    <Users size={40} className="mx-auto mb-3 opacity-50" />
                                    <p>No users added yet</p>
                                    <p className="text-sm">Add your first user above</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Edit User Modal */}
                    {editingUser && (
                        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                            <Card className="w-full max-w-md">
                                <CardHeader>
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <Edit2 size={18} className="text-blue-500" />
                                        Edit User
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <label className="text-sm font-medium">Name</label>
                                        <input
                                            type="text"
                                            value={editForm.name}
                                            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                            className="w-full mt-1 px-3 py-2 border rounded-lg"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium">Email</label>
                                        <input
                                            type="email"
                                            value={editForm.email}
                                            onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                                            className="w-full mt-1 px-3 py-2 border rounded-lg"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-sm font-medium">Role</label>
                                            <select
                                                value={editForm.role}
                                                onChange={(e) => setEditForm({ ...editForm, role: e.target.value as 'viewer' | 'admin' | 'manager' })}
                                                className="w-full mt-1 px-3 py-2 border rounded-lg bg-white"
                                            >
                                                <option value="viewer">Viewer</option>
                                                <option value="manager">Manager</option>
                                                <option value="admin">Admin</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium">Department</label>
                                            <input
                                                type="text"
                                                value={editForm.department}
                                                onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
                                                className="w-full mt-1 px-3 py-2 border rounded-lg"
                                                placeholder="e.g. Marketing"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <label className="text-sm font-medium">Active Status</label>
                                        <button
                                            type="button"
                                            onClick={() => setEditForm({ ...editForm, active: !editForm.active })}
                                            className={`w-12 h-6 rounded-full transition-colors ${editForm.active ? 'bg-emerald-500' : 'bg-slate-300'}`}
                                        >
                                            <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${editForm.active ? 'translate-x-6' : 'translate-x-0.5'}`} />
                                        </button>
                                        <span className={`text-sm ${editForm.active ? 'text-emerald-600' : 'text-slate-500'}`}>
                                            {editForm.active ? 'Active' : 'Inactive'}
                                        </span>
                                    </div>
                                    <div className="flex gap-3 pt-4 border-t">
                                        <Button variant="outline" onClick={() => setEditingUser(null)} className="flex-1">
                                            Cancel
                                        </Button>
                                        <Button onClick={handleUpdateUser} disabled={updatingUser} className="flex-1 bg-blue-600 hover:bg-blue-700">
                                            {updatingUser ? <Loader2 size={16} className="mr-2 animate-spin" /> : <Save size={16} className="mr-2" />}
                                            Save Changes
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {/* Add User Modal */}
                    {showAddModal && (
                        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                            <Card className="w-full max-w-md">
                                <CardHeader>
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <Plus size={18} className="text-emerald-500" />
                                        Add New User
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <label className="text-sm font-medium">Name *</label>
                                        <input
                                            type="text"
                                            value={newUser.name}
                                            onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                                            className="w-full mt-1 px-3 py-2 border rounded-lg"
                                            placeholder="Full name"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium">Email *</label>
                                        <input
                                            type="email"
                                            value={newUser.email}
                                            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                                            className="w-full mt-1 px-3 py-2 border rounded-lg"
                                            placeholder="email@example.com"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium">Password * (min 6 chars)</label>
                                        <div className="relative mt-1">
                                            <input
                                                type={showNewPassword ? 'text' : 'password'}
                                                value={newUser.password}
                                                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                                                className="w-full px-3 py-2 pr-10 border rounded-lg"
                                                placeholder="••••••••"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowNewPassword(!showNewPassword)}
                                                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                            >
                                                {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                            </button>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-sm font-medium">Role</label>
                                            <select
                                                value={newUser.role}
                                                onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                                                className="w-full mt-1 px-3 py-2 border rounded-lg bg-white"
                                            >
                                                <option value="viewer">Viewer</option>
                                                <option value="manager">Manager</option>
                                                <option value="admin">Admin</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium">Department</label>
                                            <input
                                                type="text"
                                                value={newUser.department}
                                                onChange={(e) => setNewUser({ ...newUser, department: e.target.value })}
                                                className="w-full mt-1 px-3 py-2 border rounded-lg"
                                                placeholder="e.g. Marketing"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex gap-3 pt-4 border-t">
                                        <Button variant="outline" onClick={() => { setShowAddModal(false); setNewUser({ name: '', email: '', password: '', role: 'viewer', phone: '', department: '' }); }} className="flex-1">
                                            Cancel
                                        </Button>
                                        <Button onClick={() => { handleAddUser(); setShowAddModal(false); }} disabled={addingUser || !newUser.name || !newUser.email || !newUser.password} className="flex-1 bg-emerald-600 hover:bg-emerald-700">
                                            {addingUser ? <Loader2 size={16} className="mr-2 animate-spin" /> : <Plus size={16} className="mr-2" />}
                                            Add User
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
