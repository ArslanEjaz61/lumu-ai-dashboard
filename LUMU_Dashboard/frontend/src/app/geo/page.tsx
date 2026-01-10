"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import {
    MapPin,
    Users,
    DollarSign,
    Sparkles,
    Check,
    Copy,
    Lightbulb,
    Globe,
    Target,
    TrendingUp
} from "lucide-react";

// City data with targeting info
const cityData = [
    { city: "Karachi", users: 45000, sales: 2450, revenue: 2850000, tone: "Premium", language: "English/Urdu Mix" },
    { city: "Lahore", users: 38000, sales: 1980, revenue: 2100000, tone: "Premium", language: "Urdu/Punjabi" },
    { city: "Islamabad", users: 22000, sales: 1450, revenue: 1650000, tone: "Premium", language: "English" },
    { city: "Rawalpindi", users: 15000, sales: 780, revenue: 850000, tone: "Value", language: "Urdu/Punjabi" },
    { city: "Faisalabad", users: 12000, sales: 520, revenue: 620000, tone: "Value", language: "Punjabi/Urdu" },
    { city: "Multan", users: 8000, sales: 380, revenue: 380000, tone: "Value", language: "Saraiki/Urdu" },
    { city: "Peshawar", users: 6000, sales: 280, revenue: 280000, tone: "Value", language: "Pashto/Urdu" },
];

const tierData = [
    { tier: "Tier 1 (Metro)", cities: ["Karachi", "Lahore", "Islamabad"], users: 105000, revenue: 6600000, color: "#10b981" },
    { tier: "Tier 2 (Major)", cities: ["Rawalpindi", "Faisalabad", "Multan", "Peshawar"], users: 41000, revenue: 2130000, color: "#3b82f6" },
    { tier: "Tier 3 (Other)", cities: ["Gujranwala", "Sialkot", "Hyderabad"], users: 15000, revenue: 450000, color: "#8b5cf6" },
];

const regionData = [
    { region: "Punjab", percentage: 53, users: 82000, color: "#10b981" },
    { region: "Sindh", percentage: 29, users: 45000, color: "#3b82f6" },
    { region: "KPK", percentage: 12, users: 18000, color: "#f59e0b" },
    { region: "Islamabad", percentage: 4, users: 6200, color: "#8b5cf6" },
    { region: "Balochistan", percentage: 2, users: 3000, color: "#ef4444" },
];

// AI Messaging suggestions based on region
const aiMessagingSuggestions = {
    "Karachi": {
        tone: "Premium & Urban",
        headlines: [
            "🔥 Karachi Exclusive: Premium Deals Just for You!",
            "Fast Delivery to Your Karachi Address",
            "Shop Now, Pay Later - Available in Karachi"
        ],
        tips: "Use English/Urdu mix, highlight fast delivery & COD"
    },
    "Lahore": {
        tone: "Premium & Cultural",
        headlines: [
            "Lahore ke Liye Khaas Offer! 🎁",
            "Premium Quality, Lahore Express Delivery",
            "Shoq se Kharido - Lahore Special"
        ],
        tips: "Mix Punjabi phrases, emphasize quality & tradition"
    },
    "Interior Sindh": {
        tone: "Value & Trust",
        headlines: [
            "Sindh ke Liye Behtareen Prices!",
            "Trusted Quality - Free Delivery",
            "Cash on Delivery - No Risk Shopping"
        ],
        tips: "Focus on value, trust, and COD availability"
    },
    "Interior Punjab": {
        tone: "Value & Family",
        headlines: [
            "Ghar Baithe Shopping - Punjab Delivery Free!",
            "Family Pack Offers - Extra Savings",
            "Bharosa Karein - Quality Guaranteed"
        ],
        tips: "Family-oriented messaging, emphasize savings"
    }
};

export default function GeoPage() {
    const [selectedCities, setSelectedCities] = useState<string[]>([]);
    const [copiedText, setCopiedText] = useState<string | null>(null);

    const toggleCity = (city: string) => {
        setSelectedCities(prev =>
            prev.includes(city)
                ? prev.filter(c => c !== city)
                : [...prev, city]
        );
    };

    const copyText = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopiedText(text);
        setTimeout(() => setCopiedText(null), 2000);
    };

    const selectedRevenue = cityData
        .filter(c => selectedCities.includes(c.city))
        .reduce((sum, c) => sum + c.revenue, 0);
    const selectedUsers = cityData
        .filter(c => selectedCities.includes(c.city))
        .reduce((sum, c) => sum + c.users, 0);

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Geo & Locality Targeting</h1>
                    <p className="text-slate-500">Target specific cities and get AI-suggested messaging</p>
                </div>
                {selectedCities.length > 0 && (
                    <div className="flex items-center gap-3 bg-emerald-50 px-4 py-2 rounded-lg">
                        <Target size={20} className="text-emerald-600" />
                        <span className="font-medium text-emerald-700">
                            {selectedCities.length} cities selected
                        </span>
                        <Badge className="bg-emerald-600">
                            {(selectedUsers / 1000).toFixed(0)}K users
                        </Badge>
                    </div>
                )}
            </div>

            {/* City Selection Grid */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <MapPin size={20} />
                        Select Target Cities
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
                        {cityData.map((city) => (
                            <button
                                key={city.city}
                                onClick={() => toggleCity(city.city)}
                                className={`p-3 rounded-xl border-2 text-left transition-all ${selectedCities.includes(city.city)
                                        ? 'border-emerald-500 bg-emerald-50 shadow-md'
                                        : 'border-slate-200 hover:border-slate-300'
                                    }`}
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <span className="font-semibold text-sm">{city.city}</span>
                                    {selectedCities.includes(city.city) && (
                                        <Check size={16} className="text-emerald-600" />
                                    )}
                                </div>
                                <p className="text-xs text-slate-500">{(city.users / 1000).toFixed(0)}K users</p>
                                <p className="text-xs text-emerald-600 font-medium">PKR {(city.revenue / 1000000).toFixed(1)}M</p>
                            </button>
                        ))}
                    </div>
                    {selectedCities.length > 0 && (
                        <div className="mt-4 p-4 bg-slate-50 rounded-lg flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-500">Selected Target Audience</p>
                                <p className="text-2xl font-bold">{selectedUsers.toLocaleString()} users</p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-slate-500">Potential Revenue</p>
                                <p className="text-2xl font-bold text-emerald-600">PKR {(selectedRevenue / 1000000).toFixed(1)}M</p>
                            </div>
                            <Button className="bg-emerald-600">
                                <Target size={16} className="mr-2" />
                                Apply Targeting
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* AI Messaging Suggestions */}
            <Card className="border-purple-200 bg-gradient-to-br from-purple-50/50 to-white">
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Sparkles size={20} className="text-purple-600" />
                        AI Messaging Suggestions
                        <Badge className="bg-purple-100 text-purple-700">Smart Copy</Badge>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Object.entries(aiMessagingSuggestions).map(([region, data]) => (
                            <div key={region} className="p-4 bg-white rounded-xl border shadow-sm">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <Globe size={18} className="text-purple-600" />
                                        <span className="font-semibold">{region}</span>
                                    </div>
                                    <Badge variant="outline" className="text-purple-600 border-purple-300">
                                        {data.tone}
                                    </Badge>
                                </div>
                                <div className="space-y-2 mb-3">
                                    {data.headlines.map((headline, idx) => (
                                        <div
                                            key={idx}
                                            className="flex items-center justify-between p-2 bg-slate-50 rounded-lg text-sm"
                                        >
                                            <span>{headline}</span>
                                            <button
                                                onClick={() => copyText(headline)}
                                                className="p-1 hover:bg-slate-200 rounded"
                                            >
                                                {copiedText === headline ? (
                                                    <Check size={14} className="text-emerald-600" />
                                                ) : (
                                                    <Copy size={14} className="text-slate-400" />
                                                )}
                                            </button>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex items-start gap-2 p-2 bg-amber-50 rounded-lg">
                                    <Lightbulb size={14} className="text-amber-600 mt-0.5" />
                                    <p className="text-xs text-amber-700">{data.tips}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

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
                                    <p className="text-xl font-bold">{(tier.users / 1000).toFixed(0)}K</p>
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 text-slate-500 text-sm mb-1">
                                        <DollarSign size={14} />
                                        Revenue
                                    </div>
                                    <p className="text-xl font-bold">PKR {(tier.revenue / 1000000).toFixed(1)}M</p>
                                </div>
                            </div>
                            <div className="mt-3 pt-3 border-t">
                                <p className="text-xs text-slate-500">
                                    {tier.cities.join(", ")}
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
                                        formatter={(value) => `PKR ${(Number(value) / 1000000).toFixed(1)}M`}
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
                        <CardTitle className="text-lg">Users by Province</CardTitle>
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
                                            {(region.users / 1000).toFixed(0)}K users
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
                    <CardTitle className="text-lg">City Performance Details</CardTitle>
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
                                    <th className="text-center py-3 px-4 text-sm font-medium text-slate-500">Tone</th>
                                    <th className="text-center py-3 px-4 text-sm font-medium text-slate-500">Language</th>
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
                                        <td className="text-right py-3 px-4">{(city.users / 1000).toFixed(0)}K</td>
                                        <td className="text-right py-3 px-4">{city.sales.toLocaleString()}</td>
                                        <td className="text-right py-3 px-4 font-medium text-emerald-600">
                                            PKR {(city.revenue / 1000000).toFixed(1)}M
                                        </td>
                                        <td className="text-center py-3 px-4">
                                            <Badge variant="outline" className={city.tone === 'Premium' ? 'border-purple-300 text-purple-600' : 'border-blue-300 text-blue-600'}>
                                                {city.tone}
                                            </Badge>
                                        </td>
                                        <td className="text-center py-3 px-4 text-sm text-slate-500">
                                            {city.language}
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
