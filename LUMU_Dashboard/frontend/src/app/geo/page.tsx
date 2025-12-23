"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
} from "recharts";
import { MapPin, Users, DollarSign, ShoppingCart } from "lucide-react";

// Mock geo data
const cityData = [
    { city: "Karachi", users: 3200, sales: 245, revenue: 125000 },
    { city: "Lahore", users: 2800, sales: 198, revenue: 98000 },
    { city: "Islamabad", users: 1200, sales: 145, revenue: 85000 },
    { city: "Rawalpindi", users: 950, sales: 78, revenue: 42000 },
    { city: "Faisalabad", users: 720, sales: 52, revenue: 28000 },
    { city: "Multan", users: 580, sales: 38, revenue: 19000 },
    { city: "Peshawar", users: 450, sales: 32, revenue: 16000 },
];

const tierData = [
    { tier: "Tier 1", cities: ["Karachi", "Lahore", "Islamabad", "Rawalpindi", "Faisalabad"], users: 8870, revenue: 378000, color: "#10b981" },
    { tier: "Tier 2", cities: ["Multan", "Peshawar", "Quetta", "Gujranwala"], users: 1850, revenue: 65000, color: "#3b82f6" },
    { tier: "Tier 3", cities: ["Other cities"], users: 700, revenue: 22000, color: "#8b5cf6" },
];

const regionData = [
    { region: "Punjab", percentage: 53, users: 8200, color: "#10b981" },
    { region: "Sindh", percentage: 29, users: 4500, color: "#3b82f6" },
    { region: "KPK", percentage: 12, users: 1800, color: "#f59e0b" },
    { region: "Islamabad", percentage: 4, users: 620, color: "#8b5cf6" },
    { region: "Balochistan", percentage: 2, users: 300, color: "#ef4444" },
];

export default function GeoPage() {
    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                    Geo Analytics
                </h1>
                <p className="text-slate-500">Geographic distribution of your audience across Pakistan</p>
            </div>

            {/* Tier Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {tierData.map((tier) => (
                    <Card key={tier.tier} className="relative overflow-hidden">
                        <div
                            className="absolute top-0 left-0 w-1 h-full"
                            style={{ backgroundColor: tier.color }}
                        />
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg flex items-center justify-between">
                                {tier.tier}
                                <Badge
                                    variant="outline"
                                    style={{
                                        backgroundColor: `${tier.color}20`,
                                        color: tier.color,
                                        borderColor: tier.color,
                                    }}
                                >
                                    {tier.cities.length} cities
                                </Badge>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <div className="flex items-center gap-2 text-slate-500 text-sm mb-1">
                                        <Users size={14} />
                                        Users
                                    </div>
                                    <p className="text-xl font-bold">{tier.users.toLocaleString()}</p>
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 text-slate-500 text-sm mb-1">
                                        <DollarSign size={14} />
                                        Revenue
                                    </div>
                                    <p className="text-xl font-bold">PKR {(tier.revenue / 1000).toFixed(0)}K</p>
                                </div>
                            </div>
                            <div className="mt-3 pt-3 border-t">
                                <p className="text-xs text-slate-500">
                                    {tier.cities.slice(0, 3).join(", ")}
                                    {tier.cities.length > 3 && ` +${tier.cities.length - 3} more`}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* City Performance */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Top Cities by Revenue</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[350px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={cityData} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                    <XAxis type="number" stroke="#94a3b8" fontSize={12} />
                                    <YAxis dataKey="city" type="category" stroke="#94a3b8" fontSize={12} width={80} />
                                    <Tooltip
                                        formatter={(value) => `PKR ${(Number(value) / 1000).toFixed(0)}K`}
                                        contentStyle={{
                                            backgroundColor: "#1e293b",
                                            border: "none",
                                            borderRadius: "8px",
                                            color: "#fff",
                                        }}
                                    />
                                    <Bar dataKey="revenue" fill="#10b981" radius={[0, 4, 4, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Region Distribution */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Users by Region</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[200px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={regionData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={2}
                                        dataKey="percentage"
                                    >
                                        {regionData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value) => `${value}%`} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="space-y-3 mt-4">
                            {regionData.map((region) => (
                                <div key={region.region} className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div
                                            className="w-3 h-3 rounded-full"
                                            style={{ backgroundColor: region.color }}
                                        />
                                        <span className="text-sm">{region.region}</span>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className="text-sm text-slate-500">
                                            {region.users.toLocaleString()} users
                                        </span>
                                        <span className="text-sm font-medium">{region.percentage}%</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* City Details Table */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">City-wise Performance</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b">
                                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">City</th>
                                    <th className="text-right py-3 px-4 text-sm font-medium text-slate-500">Users</th>
                                    <th className="text-right py-3 px-4 text-sm font-medium text-slate-500">Sales</th>
                                    <th className="text-right py-3 px-4 text-sm font-medium text-slate-500">Revenue</th>
                                    <th className="text-right py-3 px-4 text-sm font-medium text-slate-500">AOV</th>
                                </tr>
                            </thead>
                            <tbody>
                                {cityData.map((city, index) => (
                                    <tr key={city.city} className="border-b last:border-0 hover:bg-slate-50">
                                        <td className="py-3 px-4">
                                            <div className="flex items-center gap-2">
                                                <MapPin size={14} className="text-emerald-500" />
                                                <span className="font-medium">{city.city}</span>
                                                {index === 0 && (
                                                    <Badge className="bg-amber-100 text-amber-700 border-0">Top</Badge>
                                                )}
                                            </div>
                                        </td>
                                        <td className="text-right py-3 px-4">{city.users.toLocaleString()}</td>
                                        <td className="text-right py-3 px-4">{city.sales}</td>
                                        <td className="text-right py-3 px-4 font-medium">
                                            PKR {(city.revenue / 1000).toFixed(0)}K
                                        </td>
                                        <td className="text-right py-3 px-4 text-slate-500">
                                            PKR {Math.round(city.revenue / city.sales).toLocaleString()}
                                        </td>
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
