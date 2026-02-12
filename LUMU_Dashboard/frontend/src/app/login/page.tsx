"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Mail,
    Lock,
    Eye,
    EyeOff,
    Loader2,
    AlertCircle,
    Sparkles,
    TrendingUp,
    BarChart3,
    Target
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await fetch(`${API_URL}/users/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await res.json();

            if (res.ok && data.success) {
                // Store user in localStorage
                localStorage.setItem('user', JSON.stringify(data.user));
                localStorage.setItem('isLoggedIn', 'true');

                // Hard redirect to dashboard (ensures AuthContext re-reads localStorage)
                window.location.href = '/';
            } else {
                setError(data.error || 'Login failed');
            }
        } catch (err) {
            setError('Connection error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const features = [
        { icon: Sparkles, text: "AI-Powered Ad Generation" },
        { icon: TrendingUp, text: "Real-time Performance Analytics" },
        { icon: BarChart3, text: "Multi-Platform Campaign Management" },
        { icon: Target, text: "Smart Audience Targeting" },
    ];

    return (
        <div className="min-h-screen flex">
            {/* Left Side - Branding */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-emerald-600 via-cyan-600 to-blue-700 p-12 flex-col justify-between relative overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-20 left-20 w-72 h-72 bg-white rounded-full blur-3xl"></div>
                    <div className="absolute bottom-20 right-20 w-96 h-96 bg-white rounded-full blur-3xl"></div>
                </div>

                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
                            <Sparkles className="text-white" size={28} />
                        </div>
                        <h1 className="text-3xl font-bold text-white">Bambly AI</h1>
                    </div>
                    <p className="text-white/80 text-lg">Marketing Operating System</p>
                </div>

                <div className="relative z-10 space-y-6">
                    <h2 className="text-4xl font-bold text-white leading-tight">
                        Supercharge Your<br />
                        <span className="text-yellow-300">Marketing with AI</span>
                    </h2>
                    <p className="text-white/80 text-lg max-w-md">
                        Create, optimize, and publish high-performing ads across Facebook, Instagram, and Google with AI-powered intelligence.
                    </p>

                    <div className="grid grid-cols-2 gap-4 pt-4">
                        {features.map((feature, idx) => {
                            const Icon = feature.icon;
                            return (
                                <div key={idx} className="flex items-center gap-3 text-white/90">
                                    <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                                        <Icon size={20} />
                                    </div>
                                    <span className="text-sm">{feature.text}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="relative z-10">
                    <p className="text-white/60 text-sm">
                        Trusted by marketing teams across Pakistan
                    </p>
                </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-slate-50">
                <div className="w-full max-w-md">
                    {/* Mobile Logo */}
                    <div className="lg:hidden text-center mb-8">
                        <div className="flex items-center justify-center gap-2 mb-2">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center">
                                <Sparkles className="text-white" size={20} />
                            </div>
                            <h1 className="text-2xl font-bold text-slate-900">Bambly AI</h1>
                        </div>
                    </div>

                    <Card className="border-0 shadow-xl">
                        <CardHeader className="text-center pb-2">
                            <CardTitle className="text-2xl">Welcome Back</CardTitle>
                            <p className="text-slate-500 text-sm">Sign in to your account</p>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleLogin} className="space-y-5">
                                {/* Error Message */}
                                {error && (
                                    <div className="flex items-center gap-2 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
                                        <AlertCircle size={16} />
                                        {error}
                                    </div>
                                )}

                                {/* Email Field */}
                                <div>
                                    <label className="text-sm font-medium text-slate-700">Email</label>
                                    <div className="relative mt-1">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="you@company.com"
                                            className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Password Field */}
                                <div>
                                    <label className="text-sm font-medium text-slate-700">Password</label>
                                    <div className="relative mt-1">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="••••••••"
                                            className="w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                        >
                                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>

                                {/* Remember & Forgot */}
                                <div className="flex items-center justify-between">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="checkbox" className="rounded border-slate-300" />
                                        <span className="text-sm text-slate-600">Remember me</span>
                                    </label>
                                    <a href="#" className="text-sm text-emerald-600 hover:underline">
                                        Forgot password?
                                    </a>
                                </div>

                                {/* Login Button */}
                                <Button
                                    type="submit"
                                    disabled={loading || !email || !password}
                                    className="w-full py-6 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-lg"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 size={20} className="mr-2 animate-spin" />
                                            Signing in...
                                        </>
                                    ) : (
                                        'Sign In'
                                    )}
                                </Button>
                            </form>

                            {/* Demo Credentials */}
                            <div className="mt-6 p-4 bg-slate-50 rounded-lg">
                                <p className="text-xs text-slate-500 text-center mb-2">Demo Credentials</p>
                                <div className="flex items-center justify-center gap-4 text-sm">
                                    <div className="text-center">
                                        <Badge variant="outline" className="mb-1">Admin</Badge>
                                        <p className="text-xs text-slate-500">admin@bambly.ai</p>
                                    </div>
                                    <div className="text-center">
                                        <Badge variant="outline" className="mb-1">Manager</Badge>
                                        <p className="text-xs text-slate-500">manager@bambly.ai</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <p className="text-center text-sm text-slate-500 mt-6">
                        © 2024 Bambly AI. All rights reserved.
                    </p>
                </div>
            </div>
        </div>
    );
}
