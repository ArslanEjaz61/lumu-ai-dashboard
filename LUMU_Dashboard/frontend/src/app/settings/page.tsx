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
                appId: data.metaAds.appId,
                appSecret: data.metaAds.appSecret,
                accessToken: data.metaAds.accessToken,
                adAccountId: data.metaAds.adAccountId,
            });
            setOpenai({ apiKey: data.openai.apiKey });
            setClickCease({ apiKey: data.clickCease.apiKey, domain: data.clickCease.domain });
            setGa4({ propertyId: data.ga4.propertyId, accessToken: data.ga4.accessToken });
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
                googleAds,
                metaAds,
                openai,
                clickCease,
                ga4,
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
            fetchUsers();
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
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Google Ads */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg flex items-center justify-between">
                                <span className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded bg-emerald-100 flex items-center justify-center">
                                        <span className="text-emerald-600 font-bold text-sm">G</span>
                                    </div>
                                    Google Ads
                                </span>
                                <Badge variant="outline" className={settings?.googleAds.connected ? "bg-emerald-50 text-emerald-600" : "bg-slate-50 text-slate-600"}>
                                    {settings?.googleAds.connected ? <><CheckCircle size={12} className="mr-1" /> Connected</> : <><AlertCircle size={12} className="mr-1" /> Not Connected</>}
                                </Badge>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <InputField label="Customer ID" value={googleAds.customerId} onChange={(v) => setGoogleAds({ ...googleAds, customerId: v })} placeholder="xxx-xxx-xxxx" />
                            <InputField label="Developer Token" value={googleAds.developerToken} onChange={(v) => setGoogleAds({ ...googleAds, developerToken: v })} secretKey="googleDev" placeholder="Enter developer token" />
                            <InputField label="Client ID" value={googleAds.clientId} onChange={(v) => setGoogleAds({ ...googleAds, clientId: v })} placeholder="OAuth Client ID" />
                            <InputField label="Client Secret" value={googleAds.clientSecret} onChange={(v) => setGoogleAds({ ...googleAds, clientSecret: v })} secretKey="googleSecret" placeholder="OAuth Client Secret" />
                            <InputField label="Refresh Token" value={googleAds.refreshToken} onChange={(v) => setGoogleAds({ ...googleAds, refreshToken: v })} secretKey="googleRefresh" placeholder="OAuth Refresh Token" />
                        </CardContent>
                    </Card>

                    {/* Meta Ads */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg flex items-center justify-between">
                                <span className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded bg-blue-100 flex items-center justify-center">
                                        <span className="text-blue-600 font-bold text-sm">M</span>
                                    </div>
                                    Meta Ads (Facebook/Instagram)
                                </span>
                                <Badge variant="outline" className={settings?.metaAds.connected ? "bg-emerald-50 text-emerald-600" : "bg-slate-50 text-slate-600"}>
                                    {settings?.metaAds.connected ? <><CheckCircle size={12} className="mr-1" /> Connected</> : <><AlertCircle size={12} className="mr-1" /> Not Connected</>}
                                </Badge>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <InputField label="Ad Account ID" value={metaAds.adAccountId} onChange={(v) => setMetaAds({ ...metaAds, adAccountId: v })} placeholder="act_xxxxxxxxxx" />
                            <InputField label="App ID" value={metaAds.appId} onChange={(v) => setMetaAds({ ...metaAds, appId: v })} placeholder="Meta App ID" />
                            <InputField label="App Secret" value={metaAds.appSecret} onChange={(v) => setMetaAds({ ...metaAds, appSecret: v })} secretKey="metaSecret" placeholder="Meta App Secret" />
                            <InputField label="Access Token" value={metaAds.accessToken} onChange={(v) => setMetaAds({ ...metaAds, accessToken: v })} secretKey="metaToken" placeholder="Long-lived Access Token" />
                        </CardContent>
                    </Card>

                    {/* OpenAI */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg flex items-center justify-between">
                                <span className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded bg-purple-100 flex items-center justify-center">
                                        <span className="text-purple-600 font-bold text-sm">AI</span>
                                    </div>
                                    OpenAI (AI Features)
                                </span>
                                <Badge variant="outline" className={settings?.openai.connected ? "bg-emerald-50 text-emerald-600" : "bg-slate-50 text-slate-600"}>
                                    {settings?.openai.connected ? <><CheckCircle size={12} className="mr-1" /> Connected</> : <><AlertCircle size={12} className="mr-1" /> Not Connected</>}
                                </Badge>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <InputField label="API Key" value={openai.apiKey} onChange={(v) => setOpenai({ apiKey: v })} secretKey="openaiKey" placeholder="sk-xxxxxxxxxxxxxxxx" />
                            <p className="text-xs text-slate-500">Used for AI campaign optimization and smart recommendations.</p>
                        </CardContent>
                    </Card>

                    {/* Google Analytics 4 */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg flex items-center justify-between">
                                <span className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded bg-orange-100 flex items-center justify-center">
                                        <span className="text-orange-600 font-bold text-sm">GA</span>
                                    </div>
                                    Google Analytics 4
                                </span>
                                <Badge variant="outline" className={settings?.ga4.connected ? "bg-emerald-50 text-emerald-600" : "bg-slate-50 text-slate-600"}>
                                    {settings?.ga4.connected ? <><CheckCircle size={12} className="mr-1" /> Connected</> : <><AlertCircle size={12} className="mr-1" /> Not Connected</>}
                                </Badge>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <InputField label="Property ID" value={ga4.propertyId} onChange={(v) => setGa4({ ...ga4, propertyId: v })} placeholder="xxxxxxxxx" />
                            <InputField label="Access Token" value={ga4.accessToken} onChange={(v) => setGa4({ ...ga4, accessToken: v })} secretKey="ga4Token" placeholder="OAuth Access Token" />
                        </CardContent>
                    </Card>

                    {/* ClickCease */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg flex items-center justify-between">
                                <span className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded bg-red-100 flex items-center justify-center">
                                        <span className="text-red-600 font-bold text-sm">CC</span>
                                    </div>
                                    ClickCease (Fraud Protection)
                                </span>
                                <Badge variant="outline" className={settings?.clickCease.connected ? "bg-emerald-50 text-emerald-600" : "bg-slate-50 text-slate-600"}>
                                    {settings?.clickCease.connected ? <><CheckCircle size={12} className="mr-1" /> Connected</> : <><AlertCircle size={12} className="mr-1" /> Not Connected</>}
                                </Badge>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <InputField label="API Key" value={clickCease.apiKey} onChange={(v) => setClickCease({ ...clickCease, apiKey: v })} secretKey="ccKey" placeholder="Your ClickCease API key" />
                            <InputField label="Domain" value={clickCease.domain} onChange={(v) => setClickCease({ ...clickCease, domain: v })} placeholder="yourdomain.com" />
                        </CardContent>
                    </Card>

                    {/* Connection Status */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Settings size={18} className="text-slate-500" />
                                Connection Status
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {[
                                { name: 'Google Ads', connected: settings?.googleAds.connected },
                                { name: 'Meta Ads', connected: settings?.metaAds.connected },
                                { name: 'Google Analytics 4', connected: settings?.ga4.connected },
                                { name: 'ClickCease', connected: settings?.clickCease.connected },
                                { name: 'OpenAI', connected: settings?.openai.connected },
                            ].map((item) => (
                                <div key={item.name} className="flex items-center justify-between p-2 rounded-lg bg-slate-50">
                                    <span className="text-sm">{item.name}</span>
                                    {item.connected ? (
                                        <CheckCircle size={16} className="text-emerald-500" />
                                    ) : (
                                        <AlertCircle size={16} className="text-slate-400" />
                                    )}
                                </div>
                            ))}
                            <Button variant="outline" className="w-full mt-4" onClick={fetchSettings}>
                                <RefreshCw size={14} className="mr-2" />
                                Refresh Status
                            </Button>
                        </CardContent>
                    </Card>
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
                    {/* Add User */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Plus size={18} className="text-emerald-500" />
                                Add New User
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <input
                                    type="text"
                                    value={newUser.name}
                                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                                    placeholder="Name *"
                                    className="px-3 py-2 border rounded-lg text-sm"
                                />
                                <input
                                    type="email"
                                    value={newUser.email}
                                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                                    placeholder="Email *"
                                    className="px-3 py-2 border rounded-lg text-sm"
                                />
                                <input
                                    type="password"
                                    value={newUser.password}
                                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                                    placeholder="Password *"
                                    className="px-3 py-2 border rounded-lg text-sm"
                                />
                                <select
                                    value={newUser.role}
                                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                                    className="px-3 py-2 border rounded-lg text-sm bg-white"
                                >
                                    <option value="viewer">Viewer</option>
                                    <option value="manager">Manager</option>
                                    <option value="admin">Admin</option>
                                </select>
                                <Button onClick={handleAddUser} disabled={addingUser} className="bg-emerald-600 hover:bg-emerald-700">
                                    {addingUser ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                                    <span className="ml-2">Add User</span>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

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
                                                <Badge variant="outline" className={user.active ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}>
                                                    {user.active ? 'Active' : 'Inactive'}
                                                </Badge>
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
                </div>
            )}
        </div>
    );
}
