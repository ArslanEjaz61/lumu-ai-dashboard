"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Megaphone,
    Users,
    MapPin,
    ShieldAlert,
    Lightbulb,
    Settings,
    Menu,
    X,
    Sparkles,
    Rocket,
    DollarSign,
    Cloud,
    Target,
    RefreshCw,
    Play,
} from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { api, BrandingData } from "@/lib/api";

const navItems = [
    { href: "/", label: "Overview", icon: LayoutDashboard },
    { href: "/studio", label: "Creative Studio", icon: Sparkles },
    { href: "/campaigns", label: "Campaigns", icon: Megaphone },
    { href: "/publish", label: "Publish Ads", icon: Rocket },
    { href: "/running-ads", label: "Running Ads", icon: Play },
    { href: "/budget", label: "Budget AI", icon: DollarSign },
    { href: "/audience", label: "Audience", icon: Users },
    { href: "/geo", label: "Geo Analytics", icon: MapPin },
    { href: "/triggers", label: "Weather Triggers", icon: Cloud },
    { href: "/cro", label: "CRO & Funnel", icon: Target },
    { href: "/retargeting", label: "Retargeting", icon: RefreshCw },
    { href: "/fraud", label: "Fraud Report", icon: ShieldAlert },
    { href: "/insights", label: "AI Insights", icon: Lightbulb },
];

export function Sidebar() {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);
    const [branding, setBranding] = useState<BrandingData>({
        dashboardName: 'Bambly AI',
        tagline: 'AI Marketing OS',
        logoUrl: '',
        primaryColor: '#10b981'
    });

    useEffect(() => {
        const fetchBranding = async () => {
            try {
                const data = await api.getBranding();
                setBranding(data);
            } catch (error) {
                // Use defaults if API fails
                console.error('Failed to fetch branding:', error);
            }
        };
        fetchBranding();
    }, []);

    return (
        <>
            {/* Mobile Menu Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-slate-900 rounded-lg text-white"
            >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Overlay */}
            {isOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black/50 z-40"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={cn(
                    "fixed left-0 top-0 z-40 h-screen w-64 bg-gradient-to-b from-slate-900 to-slate-800 text-white transition-transform duration-300 flex flex-col",
                    "lg:translate-x-0",
                    isOpen ? "translate-x-0" : "-translate-x-full"
                )}
            >
                {/* Logo */}
                <div className="flex items-center gap-3 px-6 py-6 border-b border-slate-700">
                    {branding.logoUrl ? (
                        <img 
                            src={branding.logoUrl} 
                            alt={branding.dashboardName} 
                            className="w-10 h-10 object-contain rounded-lg"
                        />
                    ) : (
                        <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg"
                            style={{ background: `linear-gradient(135deg, ${branding.primaryColor}, #06b6d4)` }}
                        >
                            {branding.dashboardName.charAt(0).toUpperCase()}
                        </div>
                    )}
                    <div>
                        <h1 className="font-bold text-lg">{branding.dashboardName}</h1>
                        <p className="text-xs text-slate-400">{branding.tagline}</p>
                    </div>
                </div>

                {/* Navigation - Scrollable */}
                <nav className="flex-1 overflow-y-auto p-4 space-y-1 scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-transparent">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        const Icon = item.icon;

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setIsOpen(false)}
                                className={cn(
                                    "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
                                    isActive
                                        ? "bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 text-emerald-400 border-l-2 border-emerald-400"
                                        : "text-slate-400 hover:text-white hover:bg-slate-700/50"
                                )}
                            >
                                <Icon size={20} />
                                <span className="font-medium">{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                {/* Bottom Section - Fixed at bottom */}
                <div className="shrink-0 p-4 border-t border-slate-700 bg-slate-900">
                    <Link
                        href="/settings"
                        className={cn(
                            "flex items-center gap-3 px-4 py-3 rounded-lg transition-all",
                            pathname === "/settings"
                                ? "bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 text-emerald-400 border-l-2 border-emerald-400"
                                : "text-slate-400 hover:text-white hover:bg-slate-700/50"
                        )}
                    >
                        <Settings size={20} />
                        <span className="font-medium">Settings</span>
                    </Link>
                </div>
            </aside>
        </>
    );
}
