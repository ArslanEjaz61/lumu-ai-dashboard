"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    RefreshCw,
    ShoppingCart,
    Eye,
    Heart,
    Users,
    Clock,
    Mail,
    Smartphone,
    TrendingUp,
    Target,
    Sparkles,
    Play,
    Pause,
    Settings,
    Crown,
    Gift,
    AlertCircle,
    CheckCircle,
    ArrowRight,
    Zap,
    DollarSign
} from "lucide-react";

// Retargeting Flows
const retargetingFlows = [
    {
        id: 1,
        name: 'Cart Abandonment',
        icon: ShoppingCart,
        status: 'active',
        triggers: 'Abandoned cart > 1 hour',
        audience: 12500,
        conversions: 850,
        revenue: 1250000,
        steps: ['Email (1h)', 'SMS (24h)', 'Ad (48h)', 'Discount (72h)'],
        color: '#ef4444'
    },
    {
        id: 2,
        name: 'Viewed Not Purchased',
        icon: Eye,
        status: 'active',
        triggers: 'Viewed product 3+ times',
        audience: 8200,
        conversions: 420,
        revenue: 680000,
        steps: ['Email (24h)', 'Ad (48h)', 'Similar products (7d)'],
        color: '#f59e0b'
    },
    {
        id: 3,
        name: 'Wishlist Reminders',
        icon: Heart,
        status: 'active',
        triggers: 'Item in wishlist > 7 days',
        audience: 5600,
        conversions: 280,
        revenue: 420000,
        steps: ['Email (7d)', 'Price drop alert', 'Stock alert'],
        color: '#ec4899'
    },
    {
        id: 4,
        name: 'Win Back Campaign',
        icon: RefreshCw,
        status: 'paused',
        triggers: 'No purchase in 60 days',
        audience: 15000,
        conversions: 320,
        revenue: 480000,
        steps: ['Email (60d)', 'Special offer (75d)', 'Final call (90d)'],
        color: '#8b5cf6'
    },
];

// Customer Segments
const customerSegments = [
    { name: 'New Visitors', count: 45000, icon: Users, color: '#3b82f6', actions: ['Welcome offer', 'First purchase discount'] },
    { name: 'One-time Buyers', count: 18000, icon: ShoppingCart, color: '#10b981', actions: ['Second purchase incentive', 'Category recommendations'] },
    { name: 'Repeat Customers', count: 8500, icon: RefreshCw, color: '#f59e0b', actions: ['Loyalty points', 'Early access'] },
    { name: 'VIP/Loyal', count: 2200, icon: Crown, color: '#8b5cf6', actions: ['Exclusive deals', 'VIP support'] },
    { name: 'At Risk', count: 5600, icon: AlertCircle, color: '#ef4444', actions: ['Win-back offers', 'Feedback request'] },
];

// Recent triggers
const recentTriggers = [
    { id: 1, flow: 'Cart Abandonment', user: 'ahmed***@gmail.com', action: 'Email sent', time: '5m ago', status: 'sent' },
    { id: 2, flow: 'Viewed Not Purchased', user: 'sara***@hotmail.com', action: 'Ad served', time: '12m ago', status: 'clicked' },
    { id: 3, flow: 'Wishlist Reminders', user: 'ali***@gmail.com', action: 'Price drop alert', time: '1h ago', status: 'converted' },
    { id: 4, flow: 'Cart Abandonment', user: 'fatima***@yahoo.com', action: 'SMS sent', time: '2h ago', status: 'sent' },
    { id: 5, flow: 'Win Back', user: 'usman***@gmail.com', action: 'Special offer', time: '3h ago', status: 'opened' },
];

export default function RetargetingPage() {
    const [flows, setFlows] = useState(retargetingFlows);

    const toggleFlow = (id: number) => {
        setFlows(prev => prev.map(flow =>
            flow.id === id
                ? { ...flow, status: flow.status === 'active' ? 'paused' : 'active' }
                : flow
        ));
    };

    const totalAudience = flows.reduce((acc, f) => acc + f.audience, 0);
    const totalConversions = flows.reduce((acc, f) => acc + f.conversions, 0);
    const totalRevenue = flows.reduce((acc, f) => acc + f.revenue, 0);

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <RefreshCw className="text-indigo-500" size={28} />
                        Retargeting & Lifecycle
                    </h1>
                    <p className="text-slate-500">Automated customer journey campaigns</p>
                </div>
                <Button className="bg-indigo-600 hover:bg-indigo-700">
                    <Sparkles size={16} className="mr-2" />
                    Create New Flow
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-br from-indigo-500 to-purple-500 text-white">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-indigo-100 text-sm">Active Audiences</p>
                                <p className="text-3xl font-bold">{totalAudience.toLocaleString()}</p>
                            </div>
                            <Users size={32} className="text-white/50" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-slate-500 text-sm">Conversions</p>
                                <p className="text-2xl font-bold">{totalConversions.toLocaleString()}</p>
                            </div>
                            <Target size={24} className="text-emerald-500" />
                        </div>
                        <p className="text-xs text-emerald-500 mt-2">+18% this month</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-slate-500 text-sm">Revenue Recovered</p>
                                <p className="text-2xl font-bold">PKR {(totalRevenue / 1000000).toFixed(1)}M</p>
                            </div>
                            <DollarSign size={24} className="text-blue-500" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-slate-500 text-sm">Avg. Recovery Rate</p>
                                <p className="text-2xl font-bold">6.8%</p>
                            </div>
                            <TrendingUp size={24} className="text-amber-500" />
                        </div>
                        <p className="text-xs text-slate-500 mt-2">Industry avg: 4.2%</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Retargeting Flows */}
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Zap size={20} />
                                Retargeting Flows
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {flows.map((flow) => {
                                const Icon = flow.icon;
                                return (
                                    <div
                                        key={flow.id}
                                        className={`p-4 rounded-xl border-2 ${flow.status === 'active'
                                                ? 'border-emerald-200 bg-emerald-50/50'
                                                : 'border-slate-200 bg-slate-50'
                                            }`}
                                    >
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                                                    style={{ backgroundColor: `${flow.color}20` }}
                                                >
                                                    <Icon size={24} style={{ color: flow.color }} />
                                                </div>
                                                <div>
                                                    <p className="font-semibold">{flow.name}</p>
                                                    <p className="text-xs text-slate-500">{flow.triggers}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Badge className={flow.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}>
                                                    {flow.status}
                                                </Badge>
                                                <button
                                                    onClick={() => toggleFlow(flow.id)}
                                                    className={`w-10 h-6 rounded-full transition-colors ${flow.status === 'active' ? 'bg-emerald-500' : 'bg-slate-300'
                                                        }`}
                                                >
                                                    <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${flow.status === 'active' ? 'translate-x-4' : 'translate-x-0.5'
                                                        }`} />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Flow Steps */}
                                        <div className="flex items-center gap-2 mb-3 overflow-x-auto pb-2">
                                            {flow.steps.map((step, idx) => (
                                                <div key={idx} className="flex items-center">
                                                    <div className="px-3 py-1 bg-white rounded-full border text-xs whitespace-nowrap">
                                                        {step}
                                                    </div>
                                                    {idx < flow.steps.length - 1 && (
                                                        <ArrowRight size={14} className="text-slate-300 mx-1" />
                                                    )}
                                                </div>
                                            ))}
                                        </div>

                                        {/* Stats */}
                                        <div className="grid grid-cols-3 gap-4 pt-3 border-t">
                                            <div>
                                                <p className="text-xs text-slate-500">Audience</p>
                                                <p className="font-semibold">{flow.audience.toLocaleString()}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-slate-500">Conversions</p>
                                                <p className="font-semibold text-emerald-600">{flow.conversions}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-slate-500">Revenue</p>
                                                <p className="font-semibold">PKR {(flow.revenue / 1000).toFixed(0)}K</p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </CardContent>
                    </Card>

                    {/* Customer Lifecycle Segments */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Users size={20} />
                                Customer Lifecycle
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                                {customerSegments.map((segment) => {
                                    const Icon = segment.icon;
                                    return (
                                        <div
                                            key={segment.name}
                                            className="p-4 rounded-xl border text-center hover:shadow-md transition-shadow cursor-pointer"
                                        >
                                            <div
                                                className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2"
                                                style={{ backgroundColor: `${segment.color}20` }}
                                            >
                                                <Icon size={24} style={{ color: segment.color }} />
                                            </div>
                                            <p className="font-semibold text-sm">{segment.name}</p>
                                            <p className="text-lg font-bold" style={{ color: segment.color }}>
                                                {(segment.count / 1000).toFixed(1)}K
                                            </p>
                                            <div className="mt-2 space-y-1">
                                                {segment.actions.slice(0, 2).map((action, idx) => (
                                                    <p key={idx} className="text-xs text-slate-500 truncate">{action}</p>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right: Activity & Channels */}
                <div className="space-y-6">
                    {/* Recent Activity */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Clock size={20} />
                                Recent Triggers
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {recentTriggers.map((trigger) => (
                                <div key={trigger.id} className="flex items-start gap-3 p-2 hover:bg-slate-50 rounded">
                                    <div className={`w-2 h-2 rounded-full mt-2 ${trigger.status === 'converted' ? 'bg-emerald-500' :
                                            trigger.status === 'clicked' ? 'bg-blue-500' :
                                                trigger.status === 'opened' ? 'bg-amber-500' : 'bg-slate-400'
                                        }`} />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate">{trigger.user}</p>
                                        <p className="text-xs text-slate-500">{trigger.flow} • {trigger.action}</p>
                                    </div>
                                    <div className="text-right">
                                        <Badge className={`text-xs ${trigger.status === 'converted' ? 'bg-emerald-100 text-emerald-700' :
                                                trigger.status === 'clicked' ? 'bg-blue-100 text-blue-700' :
                                                    trigger.status === 'opened' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'
                                            }`}>
                                            {trigger.status}
                                        </Badge>
                                        <p className="text-xs text-slate-400 mt-1">{trigger.time}</p>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    {/* Channel Performance */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Channel Performance</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="p-3 bg-slate-50 rounded-lg">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <Mail size={16} className="text-blue-500" />
                                        <span className="font-medium text-sm">Email</span>
                                    </div>
                                    <span className="text-sm font-bold">42% open rate</span>
                                </div>
                                <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                                    <div className="h-full bg-blue-500 rounded-full" style={{ width: '42%' }} />
                                </div>
                            </div>
                            <div className="p-3 bg-slate-50 rounded-lg">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <Smartphone size={16} className="text-emerald-500" />
                                        <span className="font-medium text-sm">SMS</span>
                                    </div>
                                    <span className="text-sm font-bold">78% delivery</span>
                                </div>
                                <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: '78%' }} />
                                </div>
                            </div>
                            <div className="p-3 bg-slate-50 rounded-lg">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <Target size={16} className="text-purple-500" />
                                        <span className="font-medium text-sm">Retargeting Ads</span>
                                    </div>
                                    <span className="text-sm font-bold">3.2% CTR</span>
                                </div>
                                <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                                    <div className="h-full bg-purple-500 rounded-full" style={{ width: '32%' }} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Quick Actions */}
                    <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-indigo-700">
                                <Sparkles size={20} />
                                AI Suggestions
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="p-3 bg-white rounded-lg border">
                                <p className="text-sm font-medium">🛒 Cart Recovery</p>
                                <p className="text-xs text-slate-500 mt-1">
                                    Add 10% discount at 24h mark to increase recovery by 25%
                                </p>
                            </div>
                            <div className="p-3 bg-white rounded-lg border">
                                <p className="text-sm font-medium">👁️ Viewed Products</p>
                                <p className="text-xs text-slate-500 mt-1">
                                    Target mobile users with app deep links for +15% conversions
                                </p>
                            </div>
                            <div className="p-3 bg-white rounded-lg border">
                                <p className="text-sm font-medium">👑 VIP Customers</p>
                                <p className="text-xs text-slate-500 mt-1">
                                    Launch exclusive early access for 30% higher engagement
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
