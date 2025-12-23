"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Lightbulb,
    TrendingUp,
    AlertCircle,
    CheckCircle,
    Clock,
    ArrowRight,
    Sparkles,
    Target,
    DollarSign,
} from "lucide-react";

// Mock AI insights from n8n
const recommendations = [
    {
        id: 1,
        title: "Increase Shopping Campaign Budget",
        description: "Your Shopping campaign has the highest ROAS (6.01x). Consider increasing budget by 20% to capture more conversions.",
        category: "budget",
        priority: "high",
        impact: "+PKR 37K estimated revenue",
        platform: "Google",
    },
    {
        id: 2,
        title: "Optimize Ad Schedule for Karachi",
        description: "Peak engagement hours are 7-10 PM. Schedule more ads during this window for better CTR.",
        category: "performance",
        priority: "medium",
        impact: "+15% CTR expected",
        platform: "All",
    },
    {
        id: 3,
        title: "Pause Low-Performing Display Ads",
        description: "3 display creatives have CTR below 0.3%. Consider pausing or refreshing them.",
        category: "creative",
        priority: "medium",
        impact: "Save PKR 5K/week",
        platform: "Google",
    },
    {
        id: 4,
        title: "Expand Retargeting to Lahore",
        description: "Lahore users have high intent signals but low retargeting coverage. Expand audience.",
        category: "audience",
        priority: "high",
        impact: "+25 conversions/week",
        platform: "Meta",
    },
];

const activeAlerts = [
    {
        id: 1,
        type: "warning",
        title: "Budget 85% Used",
        description: "Winter Sale campaign budget is nearly exhausted. 3 days remaining.",
        time: "30 min ago",
    },
    {
        id: 2,
        type: "info",
        title: "High Fraud Activity Detected",
        description: "Unusual click patterns from Karachi region. ClickCease blocked 45 IPs.",
        time: "1 hour ago",
    },
    {
        id: 3,
        type: "success",
        title: "ROAS Target Achieved",
        description: "Shopping campaign exceeded 5x ROAS target. Currently at 6.01x.",
        time: "2 hours ago",
    },
];

const forecast = {
    nextWeek: {
        predictedSales: 520,
        predictedRevenue: 780000,
        confidence: 85,
        factors: ["Eid season approaching", "Historical weekend trends", "Current campaign momentum"],
    },
};

const actionItems = [
    { task: "Review Instagram Stories creative performance", status: "pending", dueIn: "Today" },
    { task: "Approve new audience segment for retargeting", status: "pending", dueIn: "Tomorrow" },
    { task: "Check ClickCease blocked IP report", status: "completed", dueIn: "Yesterday" },
];

export default function InsightsPage() {
    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Sparkles className="text-amber-500" size={28} />
                        AI Insights
                    </h1>
                    <p className="text-slate-500">Intelligent recommendations powered by n8n workflows</p>
                </div>
                <Badge variant="outline" className="bg-purple-50 text-purple-600 border-purple-200 w-fit">
                    n8n Cloud Connected
                </Badge>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card className="bg-gradient-to-br from-emerald-50 to-cyan-50 border-emerald-200">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center">
                                <Lightbulb className="text-white" size={24} />
                            </div>
                            <div>
                                <p className="text-sm text-slate-600">Active Recommendations</p>
                                <p className="text-2xl font-bold">{recommendations.length}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                                <AlertCircle className="text-white" size={24} />
                            </div>
                            <div>
                                <p className="text-sm text-slate-600">Active Alerts</p>
                                <p className="text-2xl font-bold">{activeAlerts.length}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center">
                                <Target className="text-white" size={24} />
                            </div>
                            <div>
                                <p className="text-sm text-slate-600">Forecast Confidence</p>
                                <p className="text-2xl font-bold">{forecast.nextWeek.confidence}%</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recommendations */}
                <div className="lg:col-span-2 space-y-4">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                        <Lightbulb size={20} className="text-amber-500" />
                        AI Recommendations
                    </h2>
                    {recommendations.map((rec) => (
                        <Card key={rec.id} className="hover:shadow-md transition-shadow">
                            <CardContent className="pt-6">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <h3 className="font-medium">{rec.title}</h3>
                                            <Badge
                                                variant="outline"
                                                className={
                                                    rec.priority === "high"
                                                        ? "bg-red-50 text-red-600 border-red-200"
                                                        : "bg-amber-50 text-amber-600 border-amber-200"
                                                }
                                            >
                                                {rec.priority}
                                            </Badge>
                                            <Badge variant="outline" className="bg-slate-50 text-slate-600 border-slate-200">
                                                {rec.platform}
                                            </Badge>
                                        </div>
                                        <p className="text-sm text-slate-600 mb-3">{rec.description}</p>
                                        <div className="flex items-center gap-2 text-emerald-600">
                                            <TrendingUp size={14} />
                                            <span className="text-sm font-medium">{rec.impact}</span>
                                        </div>
                                    </div>
                                    <Button size="sm" variant="outline" className="shrink-0">
                                        Apply
                                        <ArrowRight size={14} className="ml-1" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Alerts */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <AlertCircle size={18} className="text-amber-500" />
                                Active Alerts
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {activeAlerts.map((alert) => (
                                <div key={alert.id} className="flex items-start gap-3">
                                    {alert.type === "warning" && (
                                        <AlertCircle size={18} className="text-amber-500 mt-0.5" />
                                    )}
                                    {alert.type === "info" && (
                                        <AlertCircle size={18} className="text-blue-500 mt-0.5" />
                                    )}
                                    {alert.type === "success" && (
                                        <CheckCircle size={18} className="text-emerald-500 mt-0.5" />
                                    )}
                                    <div className="flex-1">
                                        <p className="text-sm font-medium">{alert.title}</p>
                                        <p className="text-xs text-slate-500">{alert.description}</p>
                                        <p className="text-xs text-slate-400 mt-1">{alert.time}</p>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    {/* Forecast */}
                    <Card className="bg-gradient-to-br from-slate-900 to-slate-800 text-white">
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Sparkles size={18} className="text-amber-400" />
                                Next Week Forecast
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-slate-400">Predicted Sales</p>
                                    <p className="text-2xl font-bold">{forecast.nextWeek.predictedSales}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-slate-400">Revenue</p>
                                    <p className="text-2xl font-bold">
                                        PKR {(forecast.nextWeek.predictedRevenue / 1000).toFixed(0)}K
                                    </p>
                                </div>
                            </div>
                            <div>
                                <p className="text-sm text-slate-400 mb-2">Key Factors:</p>
                                <ul className="text-sm space-y-1">
                                    {forecast.nextWeek.factors.map((factor, i) => (
                                        <li key={i} className="flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                            {factor}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Action Items */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Clock size={18} className="text-blue-500" />
                                Action Items
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {actionItems.map((item, i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <div
                                        className={`w-5 h-5 rounded border-2 flex items-center justify-center ${item.status === "completed"
                                                ? "bg-emerald-500 border-emerald-500"
                                                : "border-slate-300"
                                            }`}
                                    >
                                        {item.status === "completed" && (
                                            <CheckCircle size={12} className="text-white" />
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <p
                                            className={`text-sm ${item.status === "completed" ? "line-through text-slate-400" : ""
                                                }`}
                                        >
                                            {item.task}
                                        </p>
                                        <p className="text-xs text-slate-400">{item.dueIn}</p>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
