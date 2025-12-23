"use client";

import { KPICard } from "@/components/dashboard/KPICard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DollarSign,
  TrendingUp,
  Users,
  MousePointer,
  ShieldCheck,
  Target,
  ArrowUpRight,
  Loader2,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";
import { useApi } from "@/hooks/useApi";
import { api } from "@/lib/api";
import { useEffect, useState } from "react";

// Types for dashboard data
interface DashboardData {
  overview: {
    totalSales: number;
    revenue: number;
    roas: number;
    conversions: number;
    totalClicks: number;
    activeUsers: number;
    moneySaved: number;
  };
  salesTrend: { date: string; sales: number; conversions: number }[];
  platformSpend: { name: string; value: number; color: string }[];
  topCities: { city: string; sales: number }[];
  topCampaigns: { name: string; platform: string; roas: number; spend: number }[];
}

// Fallback mock data
const defaultData: DashboardData = {
  overview: {
    totalSales: 742000,
    revenue: 742000,
    roas: 3.64,
    conversions: 495,
    totalClicks: 23070,
    activeUsers: 15420,
    moneySaved: 18450,
  },
  salesTrend: [
    { date: "Dec 18", sales: 45000, conversions: 45 },
    { date: "Dec 19", sales: 52000, conversions: 52 },
    { date: "Dec 20", sales: 48000, conversions: 48 },
    { date: "Dec 21", sales: 61000, conversions: 61 },
    { date: "Dec 22", sales: 55000, conversions: 55 },
    { date: "Dec 23", sales: 68000, conversions: 68 },
    { date: "Dec 24", sales: 72000, conversions: 72 },
  ],
  platformSpend: [
    { name: "Meta Ads", value: 89000, color: "#3b82f6" },
    { name: "Google Ads", value: 114700, color: "#10b981" },
  ],
  topCities: [
    { city: "Karachi", sales: 125000 },
    { city: "Lahore", sales: 98000 },
    { city: "Islamabad", sales: 85000 },
    { city: "Rawalpindi", sales: 42000 },
    { city: "Faisalabad", sales: 28000 },
  ],
  topCampaigns: [
    { name: "Shopping - All Products", platform: "Google", roas: 6.01, spend: 31200 },
    { name: "Search - Brand Keywords", platform: "Google", roas: 4.05, spend: 35200 },
    { name: "Retargeting - Cart Abandoners", platform: "Meta", roas: 3.89, spend: 18500 },
    { name: "Instagram Stories - Karachi", platform: "Meta", roas: 3.32, spend: 28000 },
  ],
};

export default function HomePage() {
  const [dashboardData, setDashboardData] = useState<DashboardData>(defaultData);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Fetch all data
  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const [campaigns, fraud, geo] = await Promise.all([
          api.getAllCampaigns().catch(() => null),
          api.getFraudOverview().catch(() => null),
          api.getCityData().catch(() => null),
        ]);

        // Process campaigns data
        if (campaigns) {
          const metaSpend = campaigns.meta?.reduce((sum, c) => sum + c.spend, 0) || 0;
          const googleSpend = campaigns.google?.reduce((sum, c) => sum + c.spend, 0) || 0;
          const metaRevenue = campaigns.meta?.reduce((sum, c) => sum + c.revenue, 0) || 0;
          const googleRevenue = campaigns.google?.reduce((sum, c) => sum + c.revenue, 0) || 0;
          const totalRevenue = metaRevenue + googleRevenue;
          const totalSpend = metaSpend + googleSpend;
          const conversions = [...(campaigns.meta || []), ...(campaigns.google || [])].reduce(
            (sum, c) => sum + c.conversions, 0
          );

          // Get top campaigns by ROAS
          const allCampaigns = [...(campaigns.meta || []), ...(campaigns.google || [])]
            .sort((a, b) => b.roas - a.roas)
            .slice(0, 4)
            .map(c => ({
              name: c.name,
              platform: c.platform === "meta" ? "Meta" : "Google",
              roas: c.roas,
              spend: c.spend,
            }));

          setDashboardData(prev => ({
            ...prev,
            overview: {
              ...prev.overview,
              revenue: totalRevenue,
              roas: totalSpend > 0 ? totalRevenue / totalSpend : 0,
              conversions,
              totalClicks: [...(campaigns.meta || []), ...(campaigns.google || [])].reduce(
                (sum, c) => sum + c.clicks, 0
              ),
            },
            platformSpend: [
              { name: "Meta Ads", value: metaSpend, color: "#3b82f6" },
              { name: "Google Ads", value: googleSpend, color: "#10b981" },
            ],
            topCampaigns: allCampaigns.length > 0 ? allCampaigns : prev.topCampaigns,
          }));
        }

        // Process fraud data
        if (fraud) {
          setDashboardData(prev => ({
            ...prev,
            overview: {
              ...prev.overview,
              moneySaved: fraud.moneySaved,
            },
          }));
        }

        // Process geo data
        if (geo && geo.length > 0) {
          setDashboardData(prev => ({
            ...prev,
            topCities: geo.slice(0, 5).map(c => ({
              city: c.name,
              sales: c.revenue,
            })),
          }));
        }

        setLastUpdated(new Date());
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();

    // Refresh every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const { overview, salesTrend, platformSpend, topCities, topCampaigns } = dashboardData;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Dashboard Overview
          </h1>
          <p className="text-slate-500">Welcome back! Here's what's happening today.</p>
        </div>
        <div className="flex items-center gap-2">
          {loading ? (
            <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200">
              <Loader2 size={12} className="mr-1 animate-spin" />
              Loading...
            </Badge>
          ) : (
            <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-emerald-200">
              Live Data
            </Badge>
          )}
          <span className="text-sm text-slate-500">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <KPICard
          title="Total Revenue"
          value={`PKR ${(overview.revenue / 1000).toFixed(0)}K`}
          change={12.5}
          icon={DollarSign}
          trend="up"
          iconColor="from-emerald-400 to-emerald-600"
        />
        <KPICard
          title="ROAS"
          value={`${overview.roas.toFixed(2)}x`}
          change={8.2}
          icon={TrendingUp}
          trend="up"
          iconColor="from-blue-400 to-blue-600"
        />
        <KPICard
          title="Conversions"
          value={overview.conversions.toString()}
          change={15.3}
          icon={Target}
          trend="up"
          iconColor="from-purple-400 to-purple-600"
        />
        <KPICard
          title="Total Clicks"
          value={overview.totalClicks.toLocaleString()}
          change={-2.1}
          icon={MousePointer}
          trend="down"
          iconColor="from-orange-400 to-orange-600"
        />
        <KPICard
          title="Active Users"
          value={overview.activeUsers.toLocaleString()}
          change={5.8}
          icon={Users}
          trend="up"
          iconColor="from-cyan-400 to-cyan-600"
        />
        <KPICard
          title="Fraud Blocked"
          value={`PKR ${(overview.moneySaved / 1000).toFixed(1)}K`}
          change={-12}
          changeLabel="less fraud"
          icon={ShieldCheck}
          trend="up"
          iconColor="from-red-400 to-red-600"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Trend Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Sales & Conversions Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={salesTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} />
                  <YAxis stroke="#94a3b8" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1e293b",
                      border: "none",
                      borderRadius: "8px",
                      color: "#fff",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="sales"
                    stroke="#10b981"
                    strokeWidth={3}
                    dot={{ fill: "#10b981", strokeWidth: 2 }}
                    name="Sales (PKR)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Platform Split */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Ad Spend by Platform</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={platformSpend}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {platformSpend.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => `PKR ${(Number(value) / 1000).toFixed(1)}K`}
                    contentStyle={{
                      backgroundColor: "#1e293b",
                      border: "none",
                      borderRadius: "8px",
                      color: "#fff",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-6 mt-4">
              {platformSpend.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm text-slate-600">{item.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Cities */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Top Cities by Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topCities} layout="vertical">
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
                  <Bar dataKey="sales" fill="#10b981" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Top Campaigns */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Top Performing Campaigns</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topCampaigns.map((campaign, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg"
                >
                  <div className="flex-1">
                    <p className="font-medium text-sm">{campaign.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge
                        variant="outline"
                        className={
                          campaign.platform === "Google"
                            ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                            : "bg-blue-50 text-blue-600 border-blue-200"
                        }
                      >
                        {campaign.platform}
                      </Badge>
                      <span className="text-xs text-slate-500">
                        Spend: PKR {(campaign.spend / 1000).toFixed(1)}K
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-emerald-600">
                      <ArrowUpRight size={16} />
                      <span className="font-bold">{campaign.roas.toFixed(2)}x</span>
                    </div>
                    <span className="text-xs text-slate-500">ROAS</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
