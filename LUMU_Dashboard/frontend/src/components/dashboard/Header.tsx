"use client";

import { useState } from "react";
import { Bell, Search, User, LogOut, Settings, ChevronDown, Check, AlertTriangle, TrendingUp, Megaphone, X, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

// Mock notifications data
const mockNotifications = [
    {
        id: 1,
        type: 'success',
        title: 'Campaign Published',
        message: 'Winter Sale campaign is now live on Facebook & Instagram',
        time: '2 min ago',
        read: false
    },
    {
        id: 2,
        type: 'warning',
        title: 'Budget Alert',
        message: 'Summer Collection campaign has used 85% of daily budget',
        time: '1 hour ago',
        read: false
    },
    {
        id: 3,
        type: 'info',
        title: 'Performance Update',
        message: 'Your ads are performing 15% better than last week',
        time: '3 hours ago',
        read: true
    },
    {
        id: 4,
        type: 'campaign',
        title: 'New Creative Ready',
        message: 'AI has generated 3 new ad creatives for review',
        time: '5 hours ago',
        read: true
    }
];

export function Header() {
    const { user, logout } = useAuth();
    const [showDropdown, setShowDropdown] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [notifications, setNotifications] = useState(mockNotifications);

    const unreadCount = notifications.filter(n => !n.read).length;

    const markAsRead = (id: number) => {
        setNotifications(prev =>
            prev.map(n => n.id === id ? { ...n, read: true } : n)
        );
    };

    const markAllAsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    };

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'success': return <Check size={16} className="text-emerald-500" />;
            case 'warning': return <AlertTriangle size={16} className="text-amber-500" />;
            case 'info': return <TrendingUp size={16} className="text-blue-500" />;
            case 'campaign': return <Megaphone size={16} className="text-purple-500" />;
            default: return <Bell size={16} className="text-slate-500" />;
        }
    };

    const getNotificationBg = (type: string) => {
        switch (type) {
            case 'success': return 'bg-emerald-50';
            case 'warning': return 'bg-amber-50';
            case 'info': return 'bg-blue-50';
            case 'campaign': return 'bg-purple-50';
            default: return 'bg-slate-50';
        }
    };

    return (
        <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-6">
            {/* Search */}
            <div className="flex-1 max-w-md">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search campaigns, metrics..."
                        className="w-full pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                </div>
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-4">
                {/* Notifications */}
                <div className="relative">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="relative"
                        onClick={() => {
                            setShowNotifications(!showNotifications);
                            setShowDropdown(false);
                        }}
                    >
                        <Bell size={20} />
                        {unreadCount > 0 && (
                            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center font-semibold">
                                {unreadCount}
                            </span>
                        )}
                    </Button>

                    {/* Notifications Dropdown */}
                    {showNotifications && (
                        <>
                            <div
                                className="fixed inset-0 z-40"
                                onClick={() => setShowNotifications(false)}
                            />
                            <div className="absolute right-0 mt-2 w-80 md:w-96 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 z-50 overflow-hidden">
                                {/* Header */}
                                <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900">
                                    <div>
                                        <h3 className="font-semibold text-slate-800 dark:text-white">Notifications</h3>
                                        <p className="text-xs text-slate-500">{unreadCount} unread</p>
                                    </div>
                                    {unreadCount > 0 && (
                                        <button
                                            onClick={markAllAsRead}
                                            className="text-xs text-emerald-600 hover:text-emerald-700 font-medium"
                                        >
                                            Mark all as read
                                        </button>
                                    )}
                                </div>

                                {/* Notifications List */}
                                <div className="max-h-80 overflow-y-auto">
                                    {notifications.length === 0 ? (
                                        <div className="py-8 text-center">
                                            <Bell size={32} className="mx-auto text-slate-300 mb-2" />
                                            <p className="text-slate-500 text-sm">No notifications</p>
                                        </div>
                                    ) : (
                                        notifications.map((notification) => (
                                            <div
                                                key={notification.id}
                                                onClick={() => markAsRead(notification.id)}
                                                className={`px-4 py-3 border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer transition-colors ${!notification.read ? 'bg-emerald-50/50 dark:bg-emerald-900/10' : ''
                                                    }`}
                                            >
                                                <div className="flex gap-3">
                                                    <div className={`w-10 h-10 rounded-full ${getNotificationBg(notification.type)} flex items-center justify-center flex-shrink-0`}>
                                                        {getNotificationIcon(notification.type)}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-start justify-between gap-2">
                                                            <p className={`text-sm font-medium ${!notification.read ? 'text-slate-900' : 'text-slate-600'} dark:text-white`}>
                                                                {notification.title}
                                                            </p>
                                                            {!notification.read && (
                                                                <span className="w-2 h-2 bg-emerald-500 rounded-full flex-shrink-0 mt-2" />
                                                            )}
                                                        </div>
                                                        <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">
                                                            {notification.message}
                                                        </p>
                                                        <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                                                            <Clock size={10} />
                                                            {notification.time}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>

                                {/* Footer */}
                                <div className="px-4 py-2 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                                    <button
                                        className="w-full text-center text-sm text-emerald-600 hover:text-emerald-700 font-medium py-1"
                                        onClick={() => setShowNotifications(false)}
                                    >
                                        View All Notifications
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* User Dropdown */}
                <div className="relative">
                    <button
                        onClick={() => {
                            setShowDropdown(!showDropdown);
                            setShowNotifications(false);
                        }}
                        className="flex items-center gap-3 hover:bg-slate-100 dark:hover:bg-slate-800 p-1 pr-2 rounded-lg transition-colors"
                    >
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-medium">{user?.name || 'User'}</p>
                            <p className="text-xs text-slate-400 capitalize">{user?.role || 'Admin'}</p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center">
                            <User size={20} className="text-white" />
                        </div>
                        <ChevronDown size={16} className="text-slate-400" />
                    </button>

                    {/* Dropdown Menu */}
                    {showDropdown && (
                        <>
                            <div
                                className="fixed inset-0 z-40"
                                onClick={() => setShowDropdown(false)}
                            />
                            <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 py-2 z-50">
                                <div className="px-4 py-2 border-b border-slate-200 dark:border-slate-700">
                                    <p className="font-medium">{user?.name}</p>
                                    <p className="text-xs text-slate-500">{user?.email}</p>
                                </div>
                                <a href="/settings" className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-700">
                                    <Settings size={16} />
                                    Settings
                                </a>
                                <button
                                    onClick={() => {
                                        setShowDropdown(false);
                                        logout();
                                    }}
                                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                                >
                                    <LogOut size={16} />
                                    Logout
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
}
