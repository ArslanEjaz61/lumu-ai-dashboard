"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface User {
    _id: string;
    name: string;
    email: string;
    role: string;
    avatar?: string;
    department?: string;
}

interface AuthContextType {
    user: User | null;
    isLoggedIn: boolean;
    isLoading: boolean;
    login: (userData: User) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        // Check localStorage on mount
        const checkAuth = () => {
            try {
                const storedUser = localStorage.getItem('user');
                const loggedIn = localStorage.getItem('isLoggedIn');

                if (storedUser && loggedIn === 'true') {
                    setUser(JSON.parse(storedUser));
                    setIsLoggedIn(true);
                } else {
                    setUser(null);
                    setIsLoggedIn(false);
                }
            } catch (error) {
                console.error('Auth check error:', error);
                setUser(null);
                setIsLoggedIn(false);
            } finally {
                setIsLoading(false);
            }
        };

        checkAuth();
    }, []);

    // Redirect to login if not authenticated (except for login page)
    useEffect(() => {
        if (!isLoading && !isLoggedIn && pathname !== '/login') {
            router.push('/login');
        }
        // Redirect to dashboard if logged in and on login page
        if (!isLoading && isLoggedIn && pathname === '/login') {
            router.push('/');
        }
    }, [isLoading, isLoggedIn, pathname, router]);

    const login = (userData: User) => {
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('isLoggedIn', 'true');
        setUser(userData);
        setIsLoggedIn(true);
    };

    const logout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('isLoggedIn');
        setUser(null);
        setIsLoggedIn(false);
        router.push('/login');
    };

    return (
        <AuthContext.Provider value={{ user, isLoggedIn, isLoading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
