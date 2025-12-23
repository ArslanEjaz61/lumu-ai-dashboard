"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
} from "recharts";
import { ShieldCheck, ShieldAlert, DollarSign, Ban, AlertTriangle, Loader2, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { api, FraudOverview, FraudReport, SavingsData, InvalidClicksData } from "@/lib/api";

// Default data
const defaultFraudOverview: FraudOverview = {
    totalClicks: 23070,
    invalidClicks: 1845,
    invalidPercentage: 8.0,
    blockedIPs: 342,
    moneySaved: 18450,
    fraudScore: "Medium",
    lastUpdated: new Date().toISOString(),
};

const defaultFraudTypes = [
    { type: "Bot Traffic", count: 720, percentage: 39, color: "#ef4444" },
    { type: "Click Farms", count: 450, percentage: 24, color: "#f97316" },
    { type: "VPN/Proxy", count: 380, percentage: 21, color: "#eab308" },
    { type: "Repetitive Clicks", count: 295, percentage: 16, color: "#84cc16" },
];

const defaultSavingsTrend = [
    { month: "Oct", saved: 15200 },
    { month: "Nov", saved: 16800 },
    { month: "Dec", saved: 18450 },
];

const defaultPlatformBreakdown = [
    { platform: "Google Ads", invalidClicks: 1120, saved: 11200, color: "#10b981" },
    { platform: "Meta Ads", invalidClicks: 725, saved: 7250, color: "#3b82f6" },
];

const defaultRecentBlocks = [
    { ip: "203.xxx.xxx.45", clicks: 45, reason: "Bot Traffic", platform: "Google", time: "2 min ago" },
    { ip: "182.xxx.xxx.12", clicks: 32, reason: "Click Farm", platform: "Meta", time: "15 min ago" },
    { ip: "39.xxx.xxx.78", clicks: 28, reason: "VPN/Proxy", platform: "Google", time: "1 hour ago" },
    { ip: "119.xxx.xxx.90", clicks: 25, reason: "Repetitive", platform: "Meta", time: "2 hours ago" },
    { ip: "45.xxx.xxx.23", clicks: 22, reason: "Bot Traffic", platform: "Google", time: "3 hours ago" },
];

export default function FraudPage() {
    const [fraudOverview, setFraudOverview] = useState(defaultFraudOverview);
    const [fraudTypes, setFraudTypes] = useState(defaultFraudTypes);
    const [savingsTrend, setSavingsTrend] = useState(defaultSavingsTrend);
    const [platformBreakdown, setPlatformBreakdown] = useState(defaultPlatformBreakdown);
    const [recentBlocks, setRecentBlocks] = useState(defaultRecentBlocks);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchFraudData = async () => {
        setLoading(true);
        setError(null);
        try {
            const [overview, report, savings, invalidClicks] = await Promise.all([
                api.getFraudOverview().catch(() => null),
                api.getFraudReport().catch(() => null),
                api.getFraudSavings().catch(() => null),
                api.getInvalidClicks().catch(() => null),
            ]);

            if (overview) {
                setFraudOverview(overview);
            }

            if (report) {
                setFraudTypes(report.fraudTypes.map((t, i) => ({
                    ...t,
                    color: ["#ef4444", "#f97316", "#eab308", "#84cc16"][i % 4],
                })));
            }

            if (savings) {
                setSavingsTrend(savings.monthlyTrend);
                setPlatformBreakdown(savings.byPlatform.map((p, i) => ({
                    ...p,
                    color: ["#10b981", "#3b82f6"][i % 2],
                })));
            }

            if (invalidClicks && invalidClicks.data) {
                setRecentBlocks(invalidClicks.data.slice(0, 5).map(d => ({
                    ip: d.ip,
                    clicks: d.clicks,
                    reason: d.reason,
                    platform: d.platform === "google" ? "Google" : "Meta",
                    time: "Recently",
                })));
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load fraud data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFraudData();
    }, []);

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                        Fraud Report
                    </h1>
                    <p className="text-slate-500">Click fraud detection and prevention powered by ClickCease</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={fetchFraudData} disabled={loading}>
                        <RefreshCw size={16} className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                    <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-emerald-200">
                        <ShieldCheck size={14} className="mr-1" />
                        Protection Active
                    </Badge>
                </div>
            </div>

            {error && (
                <div className="bg-amber-50 text-amber-700 px-4 py-3 rounded-lg text-sm">
                    ⚠️ Using demo data. {error}
                </div>
            )}

            {/* Overview Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="border-l-4 border-l-emerald-500">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-500">Money Saved</p>
                                <p className="text-2xl font-bold text-emerald-600">
                                    {loading ? <Loader2 className="animate-spin" /> : `PKR ${(fraudOverview.moneySaved / 1000).toFixed(1)}K`}
                                </p>
                            </div>
                            <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
                                <DollarSign className="text-emerald-600" size={24} />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-red-500">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-500">Invalid Clicks</p>
                                <p className="text-2xl font-bold text-red-600">
                                    {loading ? <Loader2 className="animate-spin" /> : fraudOverview.invalidClicks}
                                </p>
                                <p className="text-xs text-slate-400">{fraudOverview.invalidPercentage}% of total</p>
                            </div>
                            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                                <ShieldAlert className="text-red-600" size={24} />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-amber-500">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-500">Blocked IPs</p>
                                <p className="text-2xl font-bold text-amber-600">
                                    {loading ? <Loader2 className="animate-spin" /> : fraudOverview.blockedIPs}
                                </p>
                            </div>
                            <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
                                <Ban className="text-amber-600" size={24} />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-blue-500">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-500">Total Clicks</p>
                                <p className="text-2xl font-bold">
                                    {loading ? <Loader2 className="animate-spin" /> : fraudOverview.totalClicks.toLocaleString()}
                                </p>
                                <p className="text-xs text-emerald-500">{100 - fraudOverview.invalidPercentage}% valid</p>
                            </div>
                            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                                <ShieldCheck className="text-blue-600" size={24} />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Fraud Types */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Fraud Types Detected</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[200px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={fraudTypes}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={50}
                                        outerRadius={80}
                                        paddingAngle={2}
                                        dataKey="count"
                                    >
                                        {fraudTypes.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="grid grid-cols-2 gap-3 mt-4">
                            {fraudTypes.map((type) => (
                                <div key={type.type} className="flex items-center gap-2">
                                    <div
                                        className="w-3 h-3 rounded-full"
                                        style={{ backgroundColor: type.color }}
                                    />
                                    <span className="text-sm text-slate-600">
                                        {type.type} ({type.percentage}%)
                                    </span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Savings Trend */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Savings Trend</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[250px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={savingsTrend}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                    <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
                                    <YAxis stroke="#94a3b8" fontSize={12} />
                                    <Tooltip
                                        formatter={(value) => `PKR ${(Number(value) / 1000).toFixed(1)}K`}
                                        contentStyle={{
                                            backgroundColor: "#1e293b",
                                            border: "none",
                                            borderRadius: "8px",
                                            color: "#fff",
                                        }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="saved"
                                        stroke="#10b981"
                                        strokeWidth={3}
                                        dot={{ fill: "#10b981", strokeWidth: 2 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Platform Breakdown */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Platform Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {platformBreakdown.map((platform) => (
                            <div
                                key={platform.platform}
                                className="p-4 rounded-lg border"
                                style={{ borderLeftColor: platform.color, borderLeftWidth: "4px" }}
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-medium">{platform.platform}</h3>
                                    <Badge
                                        variant="outline"
                                        style={{
                                            backgroundColor: `${platform.color}20`,
                                            color: platform.color,
                                            borderColor: platform.color,
                                        }}
                                    >
                                        {platform.invalidClicks} invalid
                                    </Badge>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-slate-500">Invalid Clicks</p>
                                        <p className="text-xl font-bold">{platform.invalidClicks}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-slate-500">Money Saved</p>
                                        <p className="text-xl font-bold text-emerald-600">
                                            PKR {(platform.saved / 1000).toFixed(1)}K
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Recent Blocks */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <AlertTriangle size={18} className="text-amber-500" />
                        Recently Blocked IPs
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b">
                                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">IP Address</th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Reason</th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Platform</th>
                                    <th className="text-right py-3 px-4 text-sm font-medium text-slate-500">Clicks</th>
                                    <th className="text-right py-3 px-4 text-sm font-medium text-slate-500">Time</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentBlocks.map((block, index) => (
                                    <tr key={index} className="border-b last:border-0 hover:bg-slate-50">
                                        <td className="py-3 px-4 font-mono text-sm">{block.ip}</td>
                                        <td className="py-3 px-4">
                                            <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200">
                                                {block.reason}
                                            </Badge>
                                        </td>
                                        <td className="py-3 px-4">
                                            <Badge
                                                variant="outline"
                                                className={
                                                    block.platform === "Google"
                                                        ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                                                        : "bg-blue-50 text-blue-600 border-blue-200"
                                                }
                                            >
                                                {block.platform}
                                            </Badge>
                                        </td>
                                        <td className="text-right py-3 px-4 font-medium">{block.clicks}</td>
                                        <td className="text-right py-3 px-4 text-slate-500 text-sm">{block.time}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
