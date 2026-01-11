"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    TrendingDown,
    TrendingUp,
    AlertTriangle,
    Target,
    MousePointer,
    ShoppingCart,
    CreditCard,
    CheckCircle,
    Sparkles,
    Eye,
    ArrowRight,
    Zap,
    BarChart3,
    RefreshCw,
    Lightbulb,
    ChevronDown
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, FunnelChart, Funnel, LabelList } from 'recharts';

// Funnel Data
const funnelData = [
    { name: 'Page Views', value: 100000, fill: '#3b82f6', rate: 100 },
    { name: 'Product Views', value: 45000, fill: '#06b6d4', rate: 45 },
    { name: 'Add to Cart', value: 12000, fill: '#10b981', rate: 12 },
    { name: 'Checkout', value: 5000, fill: '#f59e0b', rate: 5 },
    { name: 'Purchase', value: 2500, fill: '#8b5cf6', rate: 2.5 },
];

// Drop-off alerts
const dropAlerts = [
    {
        id: 1,
        stage: 'Product View → Add to Cart',
        dropRate: 73,
        avgDropRate: 60,
        severity: 'high',
        issue: 'Price visibility issue on mobile',
        suggestion: 'Add prominent "Add to Cart" button above fold',
        potentialRevenue: 'PKR 450,000/month'
    },
    {
        id: 2,
        stage: 'Add to Cart → Checkout',
        dropRate: 58,
        avgDropRate: 50,
        severity: 'medium',
        issue: 'High shipping cost display',
        suggestion: 'Show free shipping threshold earlier',
        potentialRevenue: 'PKR 280,000/month'
    },
    {
        id: 3,
        stage: 'Checkout → Purchase',
        dropRate: 50,
        avgDropRate: 40,
        severity: 'high',
        issue: 'Payment failure on certain banks',
        suggestion: 'Add more payment options (JazzCash, EasyPaisa)',
        potentialRevenue: 'PKR 520,000/month'
    },
];

// CTA Suggestions
const ctaSuggestions = [
    {
        id: 1,
        current: 'Buy Now',
        suggested: 'Get Yours - 20% Off Today!',
        page: 'Product Page',
        expectedLift: '+18% CTR'
    },
    {
        id: 2,
        current: 'Add to Cart',
        suggested: 'Add to Cart - Only 3 Left!',
        page: 'Category Page',
        expectedLift: '+25% CTR'
    },
    {
        id: 3,
        current: 'Complete Order',
        suggested: 'Complete Order - Free Delivery!',
        page: 'Checkout',
        expectedLift: '+12% Conversion'
    },
];

// A/B Test Ideas
const abTestIdeas = [
    { id: 1, name: 'Hero Image Style', variation: 'Lifestyle vs Product Only', impact: 'High' },
    { id: 2, name: 'CTA Button Color', variation: 'Green vs Orange', impact: 'Medium' },
    { id: 3, name: 'Free Shipping Banner', variation: 'Top vs Bottom', impact: 'High' },
    { id: 4, name: 'Reviews Position', variation: 'Above vs Below Fold', impact: 'Medium' },
];

// Page performance
const pagePerformance = [
    { page: 'Home', views: 45000, bounceRate: 35, avgTime: '2:30' },
    { page: 'Category', views: 32000, bounceRate: 42, avgTime: '1:45' },
    { page: 'Product', views: 28000, bounceRate: 55, avgTime: '3:10' },
    { page: 'Cart', views: 12000, bounceRate: 25, avgTime: '2:00' },
    { page: 'Checkout', views: 5000, bounceRate: 48, avgTime: '4:20' },
];

export default function CROPage() {
    const [selectedTimeframe, setSelectedTimeframe] = useState('7d');
    const [appliedSuggestions, setAppliedSuggestions] = useState<number[]>([]);

    const overallConversionRate = 2.5;
    const industryAvg = 2.1;

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <Target className="text-orange-500" size={28} />
                        CRO & Funnel Analytics
                    </h1>
                    <p className="text-slate-500">Conversion rate optimization insights</p>
                </div>
                <div className="flex items-center gap-3">
                    <select
                        value={selectedTimeframe}
                        onChange={(e) => setSelectedTimeframe(e.target.value)}
                        className="px-3 py-2 border rounded-lg bg-white"
                    >
                        <option value="7d">Last 7 Days</option>
                        <option value="30d">Last 30 Days</option>
                        <option value="90d">Last 90 Days</option>
                    </select>
                    <Button variant="outline">
                        <RefreshCw size={16} className="mr-2" />
                        Refresh
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-br from-orange-500 to-pink-500 text-white">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-orange-100 text-sm">Conversion Rate</p>
                                <p className="text-3xl font-bold">{overallConversionRate}%</p>
                                <p className="text-xs text-orange-100 mt-1">
                                    Industry avg: {industryAvg}%
                                    <span className="text-emerald-300 ml-1">↑ +0.4%</span>
                                </p>
                            </div>
                            <Target size={32} className="text-white/50" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-slate-500 text-sm">Cart Abandonment</p>
                                <p className="text-2xl font-bold text-red-600">58%</p>
                            </div>
                            <ShoppingCart size={24} className="text-red-400" />
                        </div>
                        <p className="text-xs text-slate-500 mt-2">-3% from last week</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-slate-500 text-sm">Avg. Order Value</p>
                                <p className="text-2xl font-bold">PKR 4,500</p>
                            </div>
                            <CreditCard size={24} className="text-emerald-500" />
                        </div>
                        <p className="text-xs text-emerald-500 mt-2">+12% from last week</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-slate-500 text-sm">Revenue Lost</p>
                                <p className="text-2xl font-bold text-amber-600">PKR 1.2M</p>
                            </div>
                            <AlertTriangle size={24} className="text-amber-500" />
                        </div>
                        <p className="text-xs text-slate-500 mt-2">From drop-offs</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Funnel & Alerts */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Conversion Funnel */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <BarChart3 size={20} />
                                Conversion Funnel
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {funnelData.map((stage, idx) => {
                                    const dropRate = idx > 0
                                        ? Math.round((1 - funnelData[idx].value / funnelData[idx - 1].value) * 100)
                                        : 0;
                                    return (
                                        <div key={stage.name}>
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-sm font-medium">{stage.name}</span>
                                                <div className="flex items-center gap-3">
                                                    <span className="text-sm font-bold">{stage.value.toLocaleString()}</span>
                                                    <span className="text-xs text-slate-500">({stage.rate}%)</span>
                                                    {dropRate > 0 && (
                                                        <Badge className={`text-xs ${dropRate > 60 ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                                                            -{dropRate}% drop
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="h-8 bg-slate-100 rounded-lg overflow-hidden">
                                                <div
                                                    className="h-full rounded-lg transition-all"
                                                    style={{
                                                        width: `${stage.rate}%`,
                                                        backgroundColor: stage.fill
                                                    }}
                                                />
                                            </div>
                                            {idx < funnelData.length - 1 && (
                                                <div className="flex justify-center py-1">
                                                    <ChevronDown size={16} className="text-slate-300" />
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Drop-off Alerts */}
                    <Card className="border-red-200">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-red-700">
                                <AlertTriangle size={20} />
                                Drop-off Alerts
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {dropAlerts.map((alert) => (
                                <div
                                    key={alert.id}
                                    className={`p-4 rounded-lg border ${alert.severity === 'high'
                                            ? 'bg-red-50 border-red-200'
                                            : 'bg-amber-50 border-amber-200'
                                        }`}
                                >
                                    <div className="flex items-start justify-between mb-2">
                                        <div>
                                            <p className="font-semibold text-sm">{alert.stage}</p>
                                            <p className="text-xs text-slate-500">{alert.issue}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className={`text-lg font-bold ${alert.severity === 'high' ? 'text-red-600' : 'text-amber-600'}`}>
                                                {alert.dropRate}%
                                            </p>
                                            <p className="text-xs text-slate-500">Avg: {alert.avgDropRate}%</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 p-2 bg-white rounded border mt-2">
                                        <Lightbulb size={14} className="text-amber-500" />
                                        <span className="text-sm">{alert.suggestion}</span>
                                    </div>
                                    <div className="flex items-center justify-between mt-3">
                                        <span className="text-xs text-emerald-600 font-medium">
                                            Potential: {alert.potentialRevenue}
                                        </span>
                                        <Button size="sm" variant="outline">
                                            Fix Now
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>

                {/* Right: CTA & A/B Tests */}
                <div className="space-y-6">
                    {/* CTA Suggestions */}
                    <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-purple-700">
                                <MousePointer size={20} />
                                CTA Suggestions
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {ctaSuggestions.map((cta) => {
                                const isApplied = appliedSuggestions.includes(cta.id);
                                return (
                                    <div key={cta.id} className={`p-3 rounded-lg border ${isApplied ? 'bg-emerald-50 border-emerald-200' : 'bg-white'}`}>
                                        <div className="flex items-center justify-between mb-2">
                                            <Badge variant="outline" className="text-xs">{cta.page}</Badge>
                                            <span className="text-xs text-emerald-600 font-medium">{cta.expectedLift}</span>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-xs text-slate-500 line-through">{cta.current}</p>
                                            <p className="text-sm font-medium text-purple-700">{cta.suggested}</p>
                                        </div>
                                        {isApplied ? (
                                            <div className="flex items-center gap-1 mt-2 text-emerald-600 text-sm">
                                                <CheckCircle size={14} />
                                                Applied
                                            </div>
                                        ) : (
                                            <Button
                                                size="sm"
                                                onClick={() => setAppliedSuggestions(prev => [...prev, cta.id])}
                                                className="w-full mt-2 bg-purple-600"
                                            >
                                                Apply
                                            </Button>
                                        )}
                                    </div>
                                );
                            })}
                        </CardContent>
                    </Card>

                    {/* A/B Test Ideas */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Sparkles size={20} />
                                A/B Test Ideas
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {abTestIdeas.map((test) => (
                                <div key={test.id} className="p-3 bg-slate-50 rounded-lg flex items-center justify-between">
                                    <div>
                                        <p className="font-medium text-sm">{test.name}</p>
                                        <p className="text-xs text-slate-500">{test.variation}</p>
                                    </div>
                                    <Badge className={test.impact === 'High' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}>
                                        {test.impact}
                                    </Badge>
                                </div>
                            ))}
                            <Button variant="outline" className="w-full mt-2">
                                <Zap size={14} className="mr-2" />
                                Start A/B Test
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Page Performance */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Page Performance</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {pagePerformance.map((page) => (
                                    <div key={page.page} className="flex items-center justify-between p-2 hover:bg-slate-50 rounded text-sm">
                                        <span className="font-medium">{page.page}</span>
                                        <div className="flex items-center gap-4 text-xs text-slate-500">
                                            <span>{page.views.toLocaleString()} views</span>
                                            <span className={page.bounceRate > 50 ? 'text-red-500' : 'text-slate-500'}>
                                                {page.bounceRate}% bounce
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
