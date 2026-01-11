"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    DollarSign,
    TrendingUp,
    TrendingDown,
    Sun,
    Moon,
    Sparkles,
    AlertTriangle,
    CheckCircle,
    ArrowRight,
    RefreshCw,
    PieChart,
    BarChart3,
    Zap,
    Target,
    Clock
} from "lucide-react";
import { PieChart as RechartPie, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';

// Mock data
const budgetAllocation = [
    { name: 'Facebook', value: 35, color: '#1877F2', spent: 24500, remaining: 10500 },
    { name: 'Instagram', value: 30, color: '#E4405F', spent: 21000, remaining: 9000 },
    { name: 'Google Ads', value: 25, color: '#4285F4', spent: 17500, remaining: 7500 },
    { name: 'YouTube', value: 10, color: '#FF0000', spent: 7000, remaining: 3000 },
];

const hourlySpend = [
    { hour: '6AM', spend: 500, conversions: 5 },
    { hour: '9AM', spend: 1200, conversions: 12 },
    { hour: '12PM', spend: 1500, conversions: 18 },
    { hour: '3PM', spend: 1800, conversions: 22 },
    { hour: '6PM', spend: 2500, conversions: 35 },
    { hour: '9PM', spend: 3000, conversions: 45 },
    { hour: '12AM', spend: 800, conversions: 8 },
];

const aiRecommendations = [
    {
        id: 1,
        type: 'increase',
        platform: 'Instagram',
        current: 30,
        suggested: 40,
        reason: 'Higher ROAS (4.2x) during evening hours',
        impact: '+15% conversions expected',
        priority: 'high'
    },
    {
        id: 2,
        type: 'decrease',
        platform: 'Google Ads',
        current: 25,
        suggested: 18,
        reason: 'CPC increased 25% this week',
        impact: 'Save PKR 12,000/week',
        priority: 'medium'
    },
    {
        id: 3,
        type: 'shift',
        platform: 'Facebook',
        current: 'Day',
        suggested: 'Night (7-11 PM)',
        reason: 'Peak engagement window',
        impact: '+22% CTR improvement',
        priority: 'high'
    },
];

const dayNightData = {
    day: { spend: 45000, conversions: 120, cpc: 45, roas: 2.8 },
    night: { spend: 55000, conversions: 230, cpc: 28, roas: 4.5 }
};

export default function BudgetPage() {
    const [totalBudget, setTotalBudget] = useState(100000);
    const [autoOptimize, setAutoOptimize] = useState(true);
    const [appliedRecommendations, setAppliedRecommendations] = useState<number[]>([]);

    const applyRecommendation = (id: number) => {
        setAppliedRecommendations(prev => [...prev, id]);
    };

    const totalSpent = budgetAllocation.reduce((acc, p) => acc + p.spent, 0);
    const totalRemaining = budgetAllocation.reduce((acc, p) => acc + p.remaining, 0);

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <DollarSign className="text-emerald-500" size={28} />
                        AI Budget Optimization
                    </h1>
                    <p className="text-slate-500">Smart budget allocation powered by AI</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 bg-slate-100 px-3 py-2 rounded-lg">
                        <span className="text-sm text-slate-600">Auto-Optimize</span>
                        <button
                            onClick={() => setAutoOptimize(!autoOptimize)}
                            className={`w-12 h-6 rounded-full transition-colors ${autoOptimize ? 'bg-emerald-500' : 'bg-slate-300'}`}
                        >
                            <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${autoOptimize ? 'translate-x-6' : 'translate-x-0.5'}`} />
                        </button>
                    </div>
                    <Button className="bg-emerald-600 hover:bg-emerald-700">
                        <RefreshCw size={16} className="mr-2" />
                        Recalculate
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-br from-emerald-500 to-cyan-500 text-white">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-emerald-100 text-sm">Total Budget</p>
                                <p className="text-2xl font-bold">PKR {totalBudget.toLocaleString()}</p>
                            </div>
                            <DollarSign size={32} className="text-white/50" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-slate-500 text-sm">Spent</p>
                                <p className="text-2xl font-bold text-slate-900">PKR {totalSpent.toLocaleString()}</p>
                            </div>
                            <TrendingUp size={24} className="text-blue-500" />
                        </div>
                        <div className="mt-2 h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500" style={{ width: `${(totalSpent / totalBudget) * 100}%` }} />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-slate-500 text-sm">Remaining</p>
                                <p className="text-2xl font-bold text-slate-900">PKR {totalRemaining.toLocaleString()}</p>
                            </div>
                            <Target size={24} className="text-emerald-500" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-slate-500 text-sm">Avg. ROAS</p>
                                <p className="text-2xl font-bold text-slate-900">3.8x</p>
                            </div>
                            <Zap size={24} className="text-amber-500" />
                        </div>
                        <p className="text-xs text-emerald-500 mt-1">+0.5x from last week</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left: Allocation & Charts */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Platform Allocation */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <PieChart size={20} />
                                Budget Allocation by Platform
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="h-64">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <RechartPie>
                                            <Pie
                                                data={budgetAllocation}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={90}
                                                paddingAngle={3}
                                                dataKey="value"
                                            >
                                                {budgetAllocation.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                        </RechartPie>
                                    </ResponsiveContainer>
                                </div>
                                <div className="space-y-3">
                                    {budgetAllocation.map((platform) => (
                                        <div key={platform.name} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: platform.color }} />
                                                <div>
                                                    <p className="font-medium text-sm">{platform.name}</p>
                                                    <p className="text-xs text-slate-500">{platform.value}% allocation</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-semibold text-sm">PKR {platform.spent.toLocaleString()}</p>
                                                <p className="text-xs text-slate-500">{platform.remaining.toLocaleString()} left</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Day vs Night Performance */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Clock size={20} />
                                Day vs Night Performance
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200">
                                    <div className="flex items-center gap-2 mb-3">
                                        <Sun size={20} className="text-amber-500" />
                                        <span className="font-semibold">Day (6AM - 6PM)</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <p className="text-xs text-slate-500">Spend</p>
                                            <p className="font-bold">PKR {dayNightData.day.spend.toLocaleString()}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-500">Conversions</p>
                                            <p className="font-bold">{dayNightData.day.conversions}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-500">CPC</p>
                                            <p className="font-bold">PKR {dayNightData.day.cpc}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-500">ROAS</p>
                                            <p className="font-bold">{dayNightData.day.roas}x</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-200">
                                    <div className="flex items-center gap-2 mb-3">
                                        <Moon size={20} className="text-indigo-500" />
                                        <span className="font-semibold">Night (6PM - 12AM)</span>
                                        <Badge className="bg-emerald-100 text-emerald-700 text-xs">Better</Badge>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <p className="text-xs text-slate-500">Spend</p>
                                            <p className="font-bold">PKR {dayNightData.night.spend.toLocaleString()}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-500">Conversions</p>
                                            <p className="font-bold text-emerald-600">{dayNightData.night.conversions} ↑</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-500">CPC</p>
                                            <p className="font-bold text-emerald-600">PKR {dayNightData.night.cpc} ↓</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-500">ROAS</p>
                                            <p className="font-bold text-emerald-600">{dayNightData.night.roas}x ↑</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Hourly Chart */}
                            <div className="h-64 mt-6">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={hourlySpend}>
                                        <XAxis dataKey="hour" fontSize={12} />
                                        <YAxis fontSize={12} />
                                        <Tooltip />
                                        <Legend />
                                        <Bar dataKey="spend" name="Spend (PKR)" fill="#10b981" radius={[4, 4, 0, 0]} />
                                        <Bar dataKey="conversions" name="Conversions" fill="#6366f1" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right: AI Recommendations */}
                <div className="space-y-6">
                    <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-purple-700">
                                <Sparkles size={20} />
                                AI Recommendations
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {aiRecommendations.map((rec) => {
                                const isApplied = appliedRecommendations.includes(rec.id);
                                return (
                                    <div
                                        key={rec.id}
                                        className={`p-4 rounded-lg border ${isApplied ? 'bg-emerald-50 border-emerald-200' : 'bg-white'}`}
                                    >
                                        <div className="flex items-start justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                {rec.type === 'increase' ? (
                                                    <TrendingUp size={16} className="text-emerald-500" />
                                                ) : rec.type === 'decrease' ? (
                                                    <TrendingDown size={16} className="text-red-500" />
                                                ) : (
                                                    <ArrowRight size={16} className="text-blue-500" />
                                                )}
                                                <span className="font-semibold text-sm">{rec.platform}</span>
                                            </div>
                                            <Badge className={`text-xs ${rec.priority === 'high' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                                                }`}>
                                                {rec.priority}
                                            </Badge>
                                        </div>

                                        <p className="text-sm text-slate-600 mb-2">{rec.reason}</p>

                                        <div className="flex items-center gap-2 text-xs text-emerald-600 mb-3">
                                            <Zap size={12} />
                                            {rec.impact}
                                        </div>

                                        {isApplied ? (
                                            <div className="flex items-center gap-2 text-emerald-600 text-sm">
                                                <CheckCircle size={16} />
                                                Applied
                                            </div>
                                        ) : (
                                            <Button
                                                size="sm"
                                                onClick={() => applyRecommendation(rec.id)}
                                                className="w-full bg-purple-600 hover:bg-purple-700"
                                            >
                                                Apply Suggestion
                                            </Button>
                                        )}
                                    </div>
                                );
                            })}
                        </CardContent>
                    </Card>

                    {/* Quick Actions */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Quick Actions</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <Button variant="outline" className="w-full justify-start">
                                <Sun size={16} className="mr-2" />
                                Pause Day Ads
                            </Button>
                            <Button variant="outline" className="w-full justify-start">
                                <Moon size={16} className="mr-2" />
                                Boost Night Budget
                            </Button>
                            <Button variant="outline" className="w-full justify-start">
                                <AlertTriangle size={16} className="mr-2 text-amber-500" />
                                Set Spend Alerts
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
