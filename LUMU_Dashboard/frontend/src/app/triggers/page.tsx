"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Cloud,
    Sun,
    CloudRain,
    Snowflake,
    Wind,
    Thermometer,
    Calendar,
    Moon,
    Star,
    Gift,
    Sparkles,
    Plus,
    Clock,
    Check,
    X,
    Zap,
    TrendingUp,
    Bell
} from "lucide-react";

// Weather conditions
const weatherConditions = [
    { id: 'sunny', name: 'Sunny', icon: Sun, color: '#f59e0b', temp: '32°C' },
    { id: 'cloudy', name: 'Cloudy', icon: Cloud, color: '#64748b', temp: '28°C' },
    { id: 'rainy', name: 'Rainy', icon: CloudRain, color: '#3b82f6', temp: '24°C' },
    { id: 'cold', name: 'Cold', icon: Snowflake, color: '#06b6d4', temp: '15°C' },
];

// Seasonal events
const seasonalEvents = [
    {
        id: 'ramadan',
        name: 'Ramadan',
        icon: Moon,
        date: 'Mar 10 - Apr 9, 2026',
        active: true,
        rules: ['Night ads +50% budget', 'Iftar time messaging', 'Sehri promos'],
        impact: '+45% engagement'
    },
    {
        id: 'eid',
        name: 'Eid ul Fitr',
        icon: Star,
        date: 'Apr 10-12, 2026',
        active: true,
        rules: ['Family messaging', 'Gift offers', 'Festive creatives'],
        impact: '+80% sales'
    },
    {
        id: 'independence',
        name: 'Independence Day',
        icon: Gift,
        date: 'Aug 14, 2026',
        active: false,
        rules: ['Patriotic theme', 'Green/White colors', 'National spirit'],
        impact: '+35% engagement'
    },
    {
        id: 'summer',
        name: 'Summer Sale',
        icon: Sun,
        date: 'Jun 1 - Aug 31, 2026',
        active: false,
        rules: ['Hot weather products', 'AC/Fan promos', 'Beverage ads'],
        impact: '+60% conversions'
    },
];

// Weather-based rules
const weatherRules = [
    {
        id: 1,
        condition: 'Temperature > 35°C',
        action: 'Promote AC, beverages, summer wear',
        status: 'active',
        triggered: 12,
        lastTriggered: '2 hours ago'
    },
    {
        id: 2,
        condition: 'Rain detected',
        action: 'Push raincoat, umbrella, indoor products',
        status: 'active',
        triggered: 5,
        lastTriggered: 'Yesterday'
    },
    {
        id: 3,
        condition: 'Weekend + Sunny',
        action: 'Promote outdoor activities, picnic items',
        status: 'inactive',
        triggered: 8,
        lastTriggered: '3 days ago'
    },
    {
        id: 4,
        condition: 'Evening (6-10 PM)',
        action: 'Food delivery, entertainment ads',
        status: 'active',
        triggered: 45,
        lastTriggered: '1 hour ago'
    },
];

const cities = ['Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Faisalabad'];

export default function WeatherTriggersPage() {
    const [selectedCity, setSelectedCity] = useState('Karachi');
    const [showAddRule, setShowAddRule] = useState(false);
    const [rules, setRules] = useState(weatherRules);

    const toggleRule = (id: number) => {
        setRules(prev => prev.map(rule =>
            rule.id === id ? { ...rule, status: rule.status === 'active' ? 'inactive' : 'active' } : rule
        ));
    };

    const currentWeather = weatherConditions[0]; // Mock sunny

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <Cloud className="text-blue-500" size={28} />
                        Weather & Seasonal Triggers
                    </h1>
                    <p className="text-slate-500">Automate ads based on weather and events</p>
                </div>
                <div className="flex items-center gap-3">
                    <select
                        value={selectedCity}
                        onChange={(e) => setSelectedCity(e.target.value)}
                        className="px-3 py-2 border rounded-lg bg-white"
                    >
                        {cities.map(city => (
                            <option key={city} value={city}>{city}</option>
                        ))}
                    </select>
                    <Button onClick={() => setShowAddRule(true)} className="bg-blue-600 hover:bg-blue-700">
                        <Plus size={16} className="mr-2" />
                        Add Rule
                    </Button>
                </div>
            </div>

            {/* Current Weather */}
            <Card className="bg-gradient-to-r from-amber-400 to-orange-500 text-white overflow-hidden relative">
                <div className="absolute right-0 top-0 opacity-20">
                    <Sun size={180} />
                </div>
                <CardContent className="pt-6 relative z-10">
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-4">
                            <currentWeather.icon size={64} />
                            <div>
                                <p className="text-4xl font-bold">{currentWeather.temp}</p>
                                <p className="text-lg">{currentWeather.name}</p>
                            </div>
                        </div>
                        <div className="border-l border-white/30 pl-6">
                            <p className="text-sm opacity-80">Current Location</p>
                            <p className="text-xl font-semibold">{selectedCity}, Pakistan</p>
                            <p className="text-sm opacity-80 mt-1">3 weather rules active</p>
                        </div>
                        <div className="ml-auto bg-white/20 backdrop-blur rounded-lg p-4">
                            <p className="text-sm opacity-80">AI Suggestion</p>
                            <p className="font-medium">Push cold drinks & summer wear ads</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Seasonal Events */}
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Calendar size={20} />
                                Seasonal Events
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {seasonalEvents.map((event) => {
                                    const Icon = event.icon;
                                    return (
                                        <div
                                            key={event.id}
                                            className={`p-4 rounded-xl border-2 ${event.active
                                                    ? 'border-emerald-500 bg-emerald-50'
                                                    : 'border-slate-200 bg-white'
                                                }`}
                                        >
                                            <div className="flex items-start justify-between mb-3">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${event.active ? 'bg-emerald-100' : 'bg-slate-100'
                                                        }`}>
                                                        <Icon size={20} className={event.active ? 'text-emerald-600' : 'text-slate-500'} />
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold">{event.name}</p>
                                                        <p className="text-xs text-slate-500">{event.date}</p>
                                                    </div>
                                                </div>
                                                <Badge className={event.active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}>
                                                    {event.active ? 'Active' : 'Upcoming'}
                                                </Badge>
                                            </div>

                                            <div className="space-y-1 mb-3">
                                                {event.rules.map((rule, idx) => (
                                                    <div key={idx} className="flex items-center gap-2 text-sm text-slate-600">
                                                        <Check size={14} className="text-emerald-500" />
                                                        {rule}
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="flex items-center justify-between pt-3 border-t">
                                                <div className="flex items-center gap-1 text-sm">
                                                    <TrendingUp size={14} className="text-emerald-500" />
                                                    <span className="text-emerald-600 font-medium">{event.impact}</span>
                                                </div>
                                                <Button size="sm" variant={event.active ? "outline" : "default"}>
                                                    {event.active ? 'Edit Rules' : 'Activate'}
                                                </Button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Weather-Based Rules */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Zap size={20} />
                                Automated Weather Rules
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {rules.map((rule) => (
                                    <div
                                        key={rule.id}
                                        className={`p-4 rounded-lg border flex items-center justify-between ${rule.status === 'active' ? 'bg-blue-50 border-blue-200' : 'bg-slate-50 border-slate-200'
                                            }`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${rule.status === 'active' ? 'bg-blue-100' : 'bg-slate-200'
                                                }`}>
                                                <Thermometer size={20} className={rule.status === 'active' ? 'text-blue-600' : 'text-slate-500'} />
                                            </div>
                                            <div>
                                                <p className="font-medium">{rule.condition}</p>
                                                <p className="text-sm text-slate-500">{rule.action}</p>
                                                <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                                                    <span>Triggered {rule.triggered}x</span>
                                                    <span>•</span>
                                                    <span>Last: {rule.lastTriggered}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={() => toggleRule(rule.id)}
                                                className={`w-12 h-6 rounded-full transition-colors ${rule.status === 'active' ? 'bg-blue-500' : 'bg-slate-300'
                                                    }`}
                                            >
                                                <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${rule.status === 'active' ? 'translate-x-6' : 'translate-x-0.5'
                                                    }`} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right: Weather Conditions & AI */}
                <div className="space-y-6">
                    {/* Weather Forecast */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">5-Day Forecast</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {['Today', 'Tomorrow', 'Wed', 'Thu', 'Fri'].map((day, idx) => {
                                const weather = weatherConditions[idx % weatherConditions.length];
                                const Icon = weather.icon;
                                return (
                                    <div key={day} className="flex items-center justify-between p-2 hover:bg-slate-50 rounded">
                                        <span className="text-sm font-medium w-20">{day}</span>
                                        <Icon size={20} style={{ color: weather.color }} />
                                        <span className="text-sm">{weather.temp}</span>
                                        <span className="text-xs text-slate-500">{weather.name}</span>
                                    </div>
                                );
                            })}
                        </CardContent>
                    </Card>

                    {/* AI Suggestions */}
                    <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-purple-700">
                                <Sparkles size={20} />
                                AI Suggestions
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="p-3 bg-white rounded-lg border">
                                <p className="text-sm font-medium">🌙 Ramadan Timing</p>
                                <p className="text-xs text-slate-500 mt-1">
                                    Schedule Iftar promotions for 6:30-7:30 PM for best engagement
                                </p>
                            </div>
                            <div className="p-3 bg-white rounded-lg border">
                                <p className="text-sm font-medium">☀️ Heat Wave Alert</p>
                                <p className="text-xs text-slate-500 mt-1">
                                    Temperature rising to 40°C next week - increase AC and beverage ads
                                </p>
                            </div>
                            <div className="p-3 bg-white rounded-lg border">
                                <p className="text-sm font-medium">🎉 Eid Prep</p>
                                <p className="text-xs text-slate-500 mt-1">
                                    Start Eid shopping campaigns 2 weeks before for max conversions
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Quick Toggles */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Quick Toggles</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <Button variant="outline" className="w-full justify-start">
                                <Bell size={16} className="mr-2" />
                                Weather Alerts
                            </Button>
                            <Button variant="outline" className="w-full justify-start">
                                <Clock size={16} className="mr-2" />
                                Time-Based Rules
                            </Button>
                            <Button variant="outline" className="w-full justify-start">
                                <Calendar size={16} className="mr-2" />
                                Event Calendar
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Add Rule Modal */}
            {showAddRule && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <Card className="w-full max-w-md">
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                                <span>Add Weather Rule</span>
                                <button onClick={() => setShowAddRule(false)}>
                                    <X size={20} className="text-slate-400" />
                                </button>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <label className="text-sm font-medium">Condition</label>
                                <select className="w-full mt-1 px-3 py-2 border rounded-lg">
                                    <option>Temperature above 35°C</option>
                                    <option>Temperature below 20°C</option>
                                    <option>Rain detected</option>
                                    <option>Weekend + Sunny</option>
                                    <option>Evening hours (6-10 PM)</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-sm font-medium">Action</label>
                                <textarea
                                    className="w-full mt-1 px-3 py-2 border rounded-lg"
                                    rows={3}
                                    placeholder="What should happen when this condition is met?"
                                />
                            </div>
                            <div className="flex gap-3">
                                <Button variant="outline" onClick={() => setShowAddRule(false)} className="flex-1">
                                    Cancel
                                </Button>
                                <Button className="flex-1 bg-blue-600">
                                    Add Rule
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
