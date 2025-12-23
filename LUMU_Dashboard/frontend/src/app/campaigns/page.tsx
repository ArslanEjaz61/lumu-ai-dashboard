"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    TrendingUp,
    TrendingDown,
    Play,
    Pause,
    ExternalLink,
    Loader2,
    RefreshCw,
} from "lucide-react";
import { useEffect, useState } from "react";
import { api, Campaign } from "@/lib/api";

interface CampaignTableProps {
    campaigns: Campaign[];
    loading: boolean;
}

function CampaignTable({ campaigns, loading }: CampaignTableProps) {
    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
            </div>
        );
    }

    if (campaigns.length === 0) {
        return (
            <div className="text-center py-12 text-slate-500">
                No campaigns found
            </div>
        );
    }

    return (
        <div className="rounded-lg border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Campaign</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Spend</TableHead>
                        <TableHead className="text-right">Clicks</TableHead>
                        <TableHead className="text-right">CTR</TableHead>
                        <TableHead className="text-right">Conv.</TableHead>
                        <TableHead className="text-right">Revenue</TableHead>
                        <TableHead className="text-right">ROAS</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {campaigns.map((campaign) => (
                        <TableRow key={campaign.id}>
                            <TableCell>
                                <div className="font-medium">{campaign.name}</div>
                                <div className="text-xs text-slate-500">
                                    Budget: PKR {(campaign.budget / 1000).toFixed(0)}K
                                </div>
                            </TableCell>
                            <TableCell>
                                <Badge
                                    variant="outline"
                                    className={
                                        campaign.status === "ACTIVE" || campaign.status === "ENABLED"
                                            ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                                            : "bg-slate-50 text-slate-600 border-slate-200"
                                    }
                                >
                                    <span className="flex items-center gap-1">
                                        {campaign.status === "ACTIVE" || campaign.status === "ENABLED" ? (
                                            <Play size={10} />
                                        ) : (
                                            <Pause size={10} />
                                        )}
                                        {campaign.status}
                                    </span>
                                </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                                PKR {(campaign.spend / 1000).toFixed(1)}K
                            </TableCell>
                            <TableCell className="text-right">
                                {campaign.clicks.toLocaleString()}
                            </TableCell>
                            <TableCell className="text-right">{campaign.ctr}%</TableCell>
                            <TableCell className="text-right">{campaign.conversions}</TableCell>
                            <TableCell className="text-right">
                                PKR {(campaign.revenue / 1000).toFixed(0)}K
                            </TableCell>
                            <TableCell className="text-right">
                                <span
                                    className={`flex items-center justify-end gap-1 font-bold ${campaign.roas >= 3 ? "text-emerald-600" : campaign.roas >= 2 ? "text-amber-600" : "text-red-600"
                                        }`}
                                >
                                    {campaign.roas >= 3 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                                    {campaign.roas}x
                                </span>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}

export default function CampaignsPage() {
    const [metaCampaigns, setMetaCampaigns] = useState<Campaign[]>([]);
    const [googleCampaigns, setGoogleCampaigns] = useState<Campaign[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchCampaigns = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await api.getAllCampaigns();
            setMetaCampaigns(data.meta || []);
            setGoogleCampaigns(data.google || []);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load campaigns");
            // Use fallback mock data
            setMetaCampaigns([
                { id: "meta_1", name: "Winter Sale - Lahore", status: "ACTIVE", platform: "meta", budget: 50000, spend: 42500, impressions: 125000, clicks: 3750, ctr: 3.0, cpc: 11.33, conversions: 85, revenue: 127500, roas: 3.0 },
                { id: "meta_2", name: "Instagram Stories - Karachi", status: "ACTIVE", platform: "meta", budget: 35000, spend: 28000, impressions: 95000, clicks: 2850, ctr: 3.0, cpc: 9.82, conversions: 62, revenue: 93000, roas: 3.32 },
                { id: "meta_3", name: "Retargeting - Cart Abandoners", status: "ACTIVE", platform: "meta", budget: 20000, spend: 18500, impressions: 45000, clicks: 1800, ctr: 4.0, cpc: 10.28, conversions: 48, revenue: 72000, roas: 3.89 },
            ]);
            setGoogleCampaigns([
                { id: "google_1", name: "Search - Brand Keywords", status: "ENABLED", platform: "google", budget: 40000, spend: 35200, impressions: 85000, clicks: 4250, ctr: 5.0, cpc: 8.28, conversions: 95, revenue: 142500, roas: 4.05 },
                { id: "google_2", name: "Shopping - All Products", status: "ENABLED", platform: "google", budget: 35000, spend: 31200, impressions: 145000, clicks: 5800, ctr: 4.0, cpc: 5.38, conversions: 125, revenue: 187500, roas: 6.01 },
                { id: "google_3", name: "Display - Remarketing", status: "ENABLED", platform: "google", budget: 25000, spend: 21800, impressions: 320000, clicks: 1920, ctr: 0.6, cpc: 11.35, conversions: 42, revenue: 63000, roas: 2.89 },
                { id: "google_4", name: "YouTube - Product Showcase", status: "ENABLED", platform: "google", budget: 30000, spend: 26500, impressions: 180000, clicks: 2700, ctr: 1.5, cpc: 9.81, conversions: 38, revenue: 57000, roas: 2.15 },
            ]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCampaigns();
    }, []);

    const totalMetaSpend = metaCampaigns.reduce((sum, c) => sum + c.spend, 0);
    const totalGoogleSpend = googleCampaigns.reduce((sum, c) => sum + c.spend, 0);
    const totalMetaRevenue = metaCampaigns.reduce((sum, c) => sum + c.revenue, 0);
    const totalGoogleRevenue = googleCampaigns.reduce((sum, c) => sum + c.revenue, 0);

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                        Campaign Performance
                    </h1>
                    <p className="text-slate-500">Monitor and compare your ad campaigns across platforms</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={fetchCampaigns} disabled={loading}>
                        <RefreshCw size={16} className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                    <Button className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600">
                        <ExternalLink size={16} className="mr-2" />
                        Open Ads Manager
                    </Button>
                </div>
            </div>

            {error && (
                <div className="bg-amber-50 text-amber-700 px-4 py-3 rounded-lg text-sm">
                    ⚠️ Using demo data. {error}
                </div>
            )}

            {/* Platform Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="border-l-4 border-l-blue-500">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <div className="w-8 h-8 rounded bg-blue-100 flex items-center justify-center">
                                <span className="text-blue-600 font-bold text-sm">M</span>
                            </div>
                            Meta Ads
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <p className="text-sm text-slate-500">Spend</p>
                                <p className="text-xl font-bold">PKR {(totalMetaSpend / 1000).toFixed(0)}K</p>
                            </div>
                            <div>
                                <p className="text-sm text-slate-500">Revenue</p>
                                <p className="text-xl font-bold">PKR {(totalMetaRevenue / 1000).toFixed(0)}K</p>
                            </div>
                            <div>
                                <p className="text-sm text-slate-500">ROAS</p>
                                <p className="text-xl font-bold text-emerald-600">
                                    {totalMetaSpend > 0 ? (totalMetaRevenue / totalMetaSpend).toFixed(2) : '0.00'}x
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-emerald-500">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <div className="w-8 h-8 rounded bg-emerald-100 flex items-center justify-center">
                                <span className="text-emerald-600 font-bold text-sm">G</span>
                            </div>
                            Google Ads
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <p className="text-sm text-slate-500">Spend</p>
                                <p className="text-xl font-bold">PKR {(totalGoogleSpend / 1000).toFixed(0)}K</p>
                            </div>
                            <div>
                                <p className="text-sm text-slate-500">Revenue</p>
                                <p className="text-xl font-bold">PKR {(totalGoogleRevenue / 1000).toFixed(0)}K</p>
                            </div>
                            <div>
                                <p className="text-sm text-slate-500">ROAS</p>
                                <p className="text-xl font-bold text-emerald-600">
                                    {totalGoogleSpend > 0 ? (totalGoogleRevenue / totalGoogleSpend).toFixed(2) : '0.00'}x
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Campaign Tables */}
            <Tabs defaultValue="all" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="all">All Campaigns</TabsTrigger>
                    <TabsTrigger value="meta">Meta Ads ({metaCampaigns.length})</TabsTrigger>
                    <TabsTrigger value="google">Google Ads ({googleCampaigns.length})</TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded bg-blue-100 flex items-center justify-center">
                                    <span className="text-blue-600 font-bold text-xs">M</span>
                                </div>
                                Meta Campaigns
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <CampaignTable campaigns={metaCampaigns} loading={loading} />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded bg-emerald-100 flex items-center justify-center">
                                    <span className="text-emerald-600 font-bold text-xs">G</span>
                                </div>
                                Google Campaigns
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <CampaignTable campaigns={googleCampaigns} loading={loading} />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="meta">
                    <Card>
                        <CardHeader>
                            <CardTitle>Meta Campaigns</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <CampaignTable campaigns={metaCampaigns} loading={loading} />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="google">
                    <Card>
                        <CardHeader>
                            <CardTitle>Google Campaigns</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <CampaignTable campaigns={googleCampaigns} loading={loading} />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
