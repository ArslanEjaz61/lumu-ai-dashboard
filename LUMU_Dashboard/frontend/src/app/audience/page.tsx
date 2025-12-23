"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
} from "recharts";
import { Users, Smartphone, Monitor, Tablet, MousePointer, Timer } from "lucide-react";

// Mock audience data
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

const segmentData = [
    { name: "High-Value Buyers", users: 2450, revenue: 425000 },
    { name: "Cart Abandoners", users: 3200, revenue: 0 },
    { name: "New Visitors", users: 8540, revenue: 85000 },
    { name: "Returning Customers", users: 4200, revenue: 320000 },
    { name: "Mobile Shoppers", users: 11566, revenue: 420000 },
];

const behaviorMetrics = [
    { label: "Avg. Session Duration", value: "3m 05s", icon: Timer },
    { label: "Rage Clicks", value: "342", icon: MousePointer, status: "warning" },
    { label: "Dead Clicks", value: "892", icon: MousePointer, status: "warning" },
    { label: "Scroll Depth", value: "62%", icon: Users },
];

export default function AudiencePage() {
    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                    Audience Insights
                </h1>
                <p className="text-slate-500">Understand your audience demographics and behavior</p>
            </div>

            {/* Demographics Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                                    <span className="text-slate-600">{item.range}</span>
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

            {/* Behavior Metrics (from Clarity) */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        User Behavior
                        <Badge variant="outline" className="bg-purple-50 text-purple-600 border-purple-200">
                            Microsoft Clarity
                        </Badge>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {behaviorMetrics.map((metric) => {
                            const Icon = metric.icon;
                            return (
                                <div key={metric.label} className="text-center p-4 bg-slate-50 rounded-lg">
                                    <div className="w-12 h-12 mx-auto rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center mb-3">
                                        <Icon size={20} className="text-white" />
                                    </div>
                                    <p
                                        className={`text-2xl font-bold ${metric.status === "warning" ? "text-amber-600" : ""
                                            }`}
                                    >
                                        {metric.value}
                                    </p>
                                    <p className="text-sm text-slate-500">{metric.label}</p>
                                </div>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>

            {/* Audience Segments */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Audience Segments</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={segmentData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} angle={-15} textAnchor="end" height={60} />
                                <YAxis stroke="#94a3b8" fontSize={12} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: "#1e293b",
                                        border: "none",
                                        borderRadius: "8px",
                                        color: "#fff",
                                    }}
                                />
                                <Bar dataKey="users" fill="#10b981" radius={[4, 4, 0, 0]} name="Users" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
