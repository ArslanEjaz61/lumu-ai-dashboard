"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
} from "recharts";
import {
    Users,
    Smartphone,
    Monitor,
    Tablet,
    MousePointer,
    Timer,
    MapPin,
    TrendingUp,
    ShoppingCart,
    UserCheck,
    UserPlus,
    Crown,
    RefreshCw,
    Loader2,
    Target,
    Heart,
    Repeat
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// City-wise data (Pakistan focused)
const cityData = [
    { city: "Karachi", users: 45000, revenue: 2850000, orders: 1250, color: "#10b981" },
    { city: "Lahore", users: 38000, revenue: 2100000, orders: 980, color: "#3b82f6" },
    { city: "Islamabad", users: 22000, revenue: 1650000, orders: 720, color: "#8b5cf6" },
    { city: "Rawalpindi", users: 15000, revenue: 850000, orders: 420, color: "#f59e0b" },
    { city: "Faisalabad", users: 12000, revenue: 620000, orders: 310, color: "#ec4899" },
    { city: "Multan", users: 8000, revenue: 380000, orders: 180, color: "#06b6d4" },
];

const ageData = [
    { range: "18-24", percentage: 28, color: "#10b981" },
    { range: "25-34", percentage: 35, color: "#3b82f6" },
    { range: "35-44", percentage: 22, color: "#8b5cf6" },
    { range: "45-54", percentage: 10, color: "#f59e0b" },
    { range: "55+", percentage: 5, color: "#ef4444" },
];

const genderData = [
    { type: "Male", percentage: 58, color: "#3b82f6" },
    { type: "Female", percentage: 42, color: "#ec4899" },
];

const deviceData = [
    { device: "Android Mobile", users: 11566, percentage: 75, icon: Smartphone },
    { device: "iOS Mobile", users: 1850, percentage: 12, icon: Smartphone },
    { device: "Desktop", users: 1543, percentage: 10, icon: Monitor },
    { device: "Tablet", users: 461, percentage: 3, icon: Tablet },
];

export default function AudiencePage() {
    const [loading, setLoading] = useState(false);
    const [activeSegment, setActiveSegment] = useState<string | null>(null);

    const segments = [
        {
            id: 'new',
            name: 'New Visitors',
            users: 8540,
            percentage: 35,
            revenue: 85000,
            icon: UserPlus,
            color: 'bg-blue-500',
            description: 'First-time visitors'
        },
        {
            id: 'returning',
            name: 'Returning Customers',
            users: 4200,
            percentage: 28,
            revenue: 320000,
            icon: Repeat,
            color: 'bg-emerald-500',
            description: 'Came back 2+ times'
        },
        {
            id: 'high_value',
            name: 'High-Value Buyers',
            users: 2450,
            percentage: 18,
            revenue: 425000,
            icon: Crown,
            color: 'bg-amber-500',
            description: 'Top 20% by spend'
        },
        {
            id: 'cart_abandoners',
            name: 'Cart Abandoners',
            users: 3200,
            percentage: 19,
            revenue: 0,
            icon: ShoppingCart,
            color: 'bg-red-500',
            description: 'Left items in cart'
        },
    ];

    const behaviorMetrics = [
        { label: "Avg. Session Duration", value: "3m 05s", icon: Timer, trend: "+12%" },
        { label: "Pages per Session", value: "4.2", icon: Target, trend: "+8%" },
        { label: "Bounce Rate", value: "42%", icon: MousePointer, trend: "-5%", status: "warning" },
        { label: "Engagement Rate", value: "68%", icon: Heart, trend: "+15%" },
    ];

    const totalUsers = cityData.reduce((sum, c) => sum + c.users, 0);
    const totalRevenue = cityData.reduce((sum, c) => sum + c.revenue, 0);

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Audience Intelligence</h1>
                    <p className="text-slate-500">Understand your audience behavior, demographics & segments</p>
                </div>
                <Button variant="outline" disabled={loading}>
                    <RefreshCw size={16} className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
                    Refresh Data
                </Button>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                    <CardContent className="pt-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-blue-100 text-sm">Total Audience</p>
                                <p className="text-3xl font-bold">{(totalUsers / 1000).toFixed(0)}K</p>
                            </div>
                            <Users size={32} className="opacity-80" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
                    <CardContent className="pt-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-emerald-100 text-sm">Total Revenue</p>
                                <p className="text-3xl font-bold">PKR {(totalRevenue / 1000000).toFixed(1)}M</p>
                            </div>
                            <TrendingUp size={32} className="opacity-80" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                    <CardContent className="pt-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-purple-100 text-sm">Active Cities</p>
                                <p className="text-3xl font-bold">{cityData.length}</p>
                            </div>
                            <MapPin size={32} className="opacity-80" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-amber-500 to-amber-600 text-white">
                    <CardContent className="pt-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-amber-100 text-sm">Avg. Order Value</p>
                                <p className="text-3xl font-bold">PKR 2,150</p>
                            </div>
                            <ShoppingCart size={32} className="opacity-80" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Audience Segments */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Users size={20} />
                        Audience Segments
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {segments.map((segment) => {
                            const Icon = segment.icon;
                            return (
                                <div
                                    key={segment.id}
                                    onClick={() => setActiveSegment(activeSegment === segment.id ? null : segment.id)}
                                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${activeSegment === segment.id
                                            ? 'border-emerald-500 bg-emerald-50 shadow-lg'
                                            : 'border-slate-200 hover:border-slate-300'
                                        }`}
                                >
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className={`w-10 h-10 rounded-full ${segment.color} flex items-center justify-center`}>
                                            <Icon size={20} className="text-white" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-sm">{segment.name}</p>
                                            <p className="text-xs text-slate-500">{segment.description}</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                        <div>
                                            <p className="text-slate-500">Users</p>
                                            <p className="font-bold">{segment.users.toLocaleString()}</p>
                                        </div>
                                        <div>
                                            <p className="text-slate-500">Revenue</p>
                                            <p className="font-bold">PKR {(segment.revenue / 1000).toFixed(0)}K</p>
                                        </div>
                                    </div>
                                    <div className="mt-3">
                                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full ${segment.color} rounded-full`}
                                                style={{ width: `${segment.percentage}%` }}
                                            />
                                        </div>
                                        <p className="text-xs text-slate-500 mt-1">{segment.percentage}% of audience</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>

            {/* City-wise Analysis */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <MapPin size={20} />
                        City-wise Performance (Pakistan)
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Chart */}
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={cityData} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                    <XAxis type="number" stroke="#94a3b8" fontSize={12} />
                                    <YAxis dataKey="city" type="category" stroke="#94a3b8" fontSize={12} width={80} />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: "#1e293b",
                                            border: "none",
                                            borderRadius: "8px",
                                            color: "#fff",
                                        }}
                                        formatter={(value: number) => value.toLocaleString()}
                                    />
                                    <Bar dataKey="users" fill="#10b981" radius={[0, 4, 4, 0]} name="Users" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                        {/* Table */}
                        <div className="space-y-3">
                            {cityData.map((city, index) => (
                                <div key={city.city} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-white shadow flex items-center justify-center font-bold text-sm">
                                            {index + 1}
                                        </div>
                                        <div>
                                            <p className="font-semibold">{city.city}</p>
                                            <p className="text-xs text-slate-500">{city.users.toLocaleString()} users</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-emerald-600">PKR {(city.revenue / 1000).toFixed(0)}K</p>
                                        <p className="text-xs text-slate-500">{city.orders} orders</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Demographics Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Age Distribution */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Age Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[200px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={ageData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={50}
                                        outerRadius={80}
                                        paddingAngle={2}
                                        dataKey="percentage"
                                    >
                                        {ageData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value) => `${value}%`} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="grid grid-cols-3 gap-2 mt-4">
                            {ageData.map((item) => (
                                <div key={item.range} className="flex items-center gap-1 text-xs">
                                    <div
                                        className="w-2 h-2 rounded-full"
                                        style={{ backgroundColor: item.color }}
                                    />
                                    <span className="text-slate-600">{item.range}: {item.percentage}%</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Gender Split */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Gender Split</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[200px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={genderData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={50}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="percentage"
                                    >
                                        {genderData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value) => `${value}%`} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="flex justify-center gap-6 mt-4">
                            {genderData.map((item) => (
                                <div key={item.type} className="flex items-center gap-2">
                                    <div
                                        className="w-3 h-3 rounded-full"
                                        style={{ backgroundColor: item.color }}
                                    />
                                    <span className="text-sm text-slate-600">
                                        {item.type}: {item.percentage}%
                                    </span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Device Breakdown */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Device Breakdown</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {deviceData.map((device) => {
                                const Icon = device.icon;
                                return (
                                    <div key={device.device} className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Icon size={16} className="text-slate-500" />
                                                <span className="text-sm">{device.device}</span>
                                            </div>
                                            <span className="text-sm font-medium">{device.percentage}%</span>
                                        </div>
                                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-gradient-to-r from-emerald-400 to-cyan-500 rounded-full"
                                                style={{ width: `${device.percentage}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Behavior Metrics */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        User Behavior
                        <Badge variant="outline" className="bg-purple-50 text-purple-600 border-purple-200">
                            Analytics
                        </Badge>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {behaviorMetrics.map((metric) => {
                            const Icon = metric.icon;
                            return (
                                <div key={metric.label} className="text-center p-4 bg-slate-50 rounded-xl">
                                    <div className="w-12 h-12 mx-auto rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center mb-3">
                                        <Icon size={20} className="text-white" />
                                    </div>
                                    <p className={`text-2xl font-bold ${metric.status === "warning" ? "text-amber-600" : ""}`}>
                                        {metric.value}
                                    </p>
                                    <p className="text-sm text-slate-500">{metric.label}</p>
                                    <p className={`text-xs mt-1 ${metric.trend.startsWith('+') ? 'text-emerald-600' : 'text-red-500'}`}>
                                        {metric.trend} vs last month
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
