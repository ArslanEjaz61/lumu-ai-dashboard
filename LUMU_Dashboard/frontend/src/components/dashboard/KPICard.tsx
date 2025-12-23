"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface KPICardProps {
    title: string;
    value: string | number;
    change?: number;
    changeLabel?: string;
    icon: LucideIcon;
    iconColor?: string;
    trend?: "up" | "down" | "neutral";
}

export function KPICard({
    title,
    value,
    change,
    changeLabel = "vs last period",
    icon: Icon,
    iconColor = "from-emerald-400 to-cyan-500",
    trend = "neutral",
}: KPICardProps) {
    return (
        <Card className="relative overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    {title}
                </CardTitle>
                <div className={cn(
                    "w-10 h-10 rounded-lg bg-gradient-to-br flex items-center justify-center",
                    iconColor
                )}>
                    <Icon className="text-white" size={20} />
                </div>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                {change !== undefined && (
                    <p className={cn(
                        "text-xs mt-1",
                        trend === "up" && "text-emerald-500",
                        trend === "down" && "text-red-500",
                        trend === "neutral" && "text-slate-500"
                    )}>
                        {trend === "up" && "↑"}
                        {trend === "down" && "↓"}
                        {change > 0 ? "+" : ""}{change}% {changeLabel}
                    </p>
                )}
            </CardContent>
            {/* Decorative gradient */}
            <div className="absolute -right-8 -bottom-8 w-24 h-24 rounded-full bg-gradient-to-br opacity-10 blur-2xl from-emerald-400 to-cyan-500" />
        </Card>
    );
}
