"use client";

import { useState, useEffect } from "react";
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
    Clock,
    Loader2
} from "lucide-react";
import { PieChart as RechartPie, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface BudgetAllocation {
    platform: string;
    percentage: number;
    spent: number;
    remaining: number;
    color: string;
}

interface DayNightData {
    day: { spend: number; conversions: number; cpc: number; roas: number };
    night: { spend: number; conversions: number; cpc: number; roas: number };
}

interface HourlySpend {
    hour: string;
    spend: number;
    conversions: number;
}

interface Recommendation {
    _id: string;
    type: string;
    platform: string;
    current: any;
    suggested: any;
    reason: string;
    impact: string;
    priority: string;
}

export default function BudgetPage() {
    const [loading, setLoading] = useState(true);
    const [totalBudget, setTotalBudget] = useState(100000);
    const [totalSpent, setTotalSpent] = useState(0);
    const [totalRemaining, setTotalRemaining] = useState(0);
    const [avgRoas, setAvgRoas] = useState(0);
    const [autoOptimize, setAutoOptimize] = useState(true);
    const [appliedRecommendations, setAppliedRecommendations] = useState<string[]>([]);
    const [applyingId, setApplyingId] = useState<string | null>(null);

    const [budgetAllocation, setBudgetAllocation] = useState<BudgetAllocation[]>([]);
    const [hourlySpend, setHourlySpend] = useState<HourlySpend[]>([]);
    const [dayNightData, setDayNightData] = useState<DayNightData>({
        day: { spend: 0, conversions: 0, cpc: 0, roas: 0 },
        night: { spend: 0, conversions: 0, cpc: 0, roas: 0 }
    });
    const [recommendations, setRecommendations] = useState<Recommendation[]>([]);

    useEffect(() => {
        fetchBudgetData();
        fetchRecommendations();
    }, []);

    const fetchBudgetData = async () => {
        try {
            setLoading(true);
            const res = await fetch(`${API_URL}/budget/allocation`);
            const data = await res.json();

            setTotalBudget(data.totalBudget || 100000);
            setTotalSpent(data.totalSpent || 0);
            setTotalRemaining(data.totalRemaining || 0);
            setAvgRoas(data.avgRoas || 0);

            // Map allocation data with colors
            const colorMap: { [key: string]: string } = {
                'Facebook': '#1877F2',
                'Instagram': '#E4405F',
                'Google Ads': '#4285F4',
                'YouTube': '#FF0000',
                'TikTok': '#000000'
            };

            const allocations = (data.allocation || []).map((a: any) => ({
                ...a,
                name: a.platform,
                value: a.percentage,
                color: a.color || colorMap[a.platform] || '#6366f1'
            }));

            setBudgetAllocation(allocations);
            setHourlySpend(data.hourlySpend || []);

            if (data.dayNight) {
                setDayNightData(data.dayNight);
            }
        } catch (error) {
            console.error('Failed to fetch budget data:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchRecommendations = async () => {
        try {
            const res = await fetch(`${API_URL}/budget/recommendations`);
            const data = await res.json();
            setRecommendations(data.recommendations || []);
        } catch (error) {
            console.error('Failed to fetch recommendations:', error);
        }
    };

    const applyRecommendation = async (id: string) => {
        setApplyingId(id);
        try {
            const res = await fetch(`${API_URL}/budget/apply-recommendation`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ recommendationId: id })
            });

            if (res.ok) {
                setAppliedRecommendations(prev => [...prev, id]);
                // Refresh data
                fetchBudgetData();
            }
        } catch (error) {
            console.error('Failed to apply recommendation:', error);
        } finally {
            setApplyingId(null);
        }
    };

    const recalculateBudget = async () => {
        setLoading(true);
        await fetchBudgetData();
        await fetchRecommendations();
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="animate-spin text-emerald-500" size={48} />
            </div>
        );
    }

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
                    <Button onClick={recalculateBudget} className="bg-emerald-600 hover:bg-emerald-700">
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
                                <p className="text-2xl font-bold text-slate-900">{avgRoas}x</p>
                            </div>
                            <Zap size={24} className="text-amber-500" />
                        </div>
                        <p className="text-xs text-emerald-500 mt-1">Real-time data</p>
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
                                    {budgetAllocation.length > 0 ? budgetAllocation.map((platform) => (
                                        <div key={platform.platform} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: platform.color }} />
                                                <div>
                                                    <p className="font-medium text-sm">{platform.platform}</p>
                                                    <p className="text-xs text-slate-500">{platform.percentage}% allocation</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-semibold text-sm">PKR {(platform.spent || 0).toLocaleString()}</p>
                                                <p className="text-xs text-slate-500">{(platform.remaining || 0).toLocaleString()} left</p>
                                            </div>
                                        </div>
                                    )) : (
                                        <p className="text-slate-500 text-center py-4">No allocation data. Run seed script first.</p>
                                    )}
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
                                            <p className="font-bold">PKR {(dayNightData.day.spend || 0).toLocaleString()}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-500">Conversions</p>
                                            <p className="font-bold">{dayNightData.day.conversions || 0}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-500">CPC</p>
                                            <p className="font-bold">PKR {dayNightData.day.cpc || 0}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-500">ROAS</p>
                                            <p className="font-bold">{dayNightData.day.roas || 0}x</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-200">
                                    <div className="flex items-center gap-2 mb-3">
                                        <Moon size={20} className="text-indigo-500" />
                                        <span className="font-semibold">Night (6PM - 12AM)</span>
                                        {dayNightData.night.roas > dayNightData.day.roas && (
                                            <Badge className="bg-emerald-100 text-emerald-700 text-xs">Better</Badge>
                                        )}
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <p className="text-xs text-slate-500">Spend</p>
                                            <p className="font-bold">PKR {(dayNightData.night.spend || 0).toLocaleString()}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-500">Conversions</p>
                                            <p className={`font-bold ${dayNightData.night.conversions > dayNightData.day.conversions ? 'text-emerald-600' : ''}`}>
                                                {dayNightData.night.conversions || 0} {dayNightData.night.conversions > dayNightData.day.conversions && '↑'}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-500">CPC</p>
                                            <p className={`font-bold ${dayNightData.night.cpc < dayNightData.day.cpc ? 'text-emerald-600' : ''}`}>
                                                PKR {dayNightData.night.cpc || 0} {dayNightData.night.cpc < dayNightData.day.cpc && '↓'}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-500">ROAS</p>
                                            <p className={`font-bold ${dayNightData.night.roas > dayNightData.day.roas ? 'text-emerald-600' : ''}`}>
                                                {dayNightData.night.roas || 0}x {dayNightData.night.roas > dayNightData.day.roas && '↑'}
                                            </p>
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
                            {recommendations.length > 0 ? recommendations.map((rec) => {
                                const isApplied = appliedRecommendations.includes(rec._id);
                                const isApplying = applyingId === rec._id;
                                return (
                                    <div
                                        key={rec._id}
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
                                                onClick={() => applyRecommendation(rec._id)}
                                                disabled={isApplying}
                                                className="w-full bg-purple-600 hover:bg-purple-700"
                                            >
                                                {isApplying ? (
                                                    <>
                                                        <Loader2 size={14} className="mr-2 animate-spin" />
                                                        Applying...
                                                    </>
                                                ) : (
                                                    'Apply Suggestion'
                                                )}
                                            </Button>
                                        )}
                                    </div>
                                );
                            }) : (
                                <p className="text-slate-500 text-center py-4">No recommendations. Run seed script first.</p>
                            )}
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
