"use client";

import { useState, useEffect, useCallback } from 'react';

interface UseApiState<T> {
    data: T | null;
    loading: boolean;
    error: string | null;
}

export function useApi<T>(
    fetchFn: () => Promise<T>,
    dependencies: unknown[] = []
): UseApiState<T> & { refetch: () => void } {
    const [state, setState] = useState<UseApiState<T>>({
        data: null,
        loading: true,
        error: null,
    });

    const fetchData = useCallback(async () => {
        setState(prev => ({ ...prev, loading: true, error: null }));
        try {
            const data = await fetchFn();
            setState({ data, loading: false, error: null });
        } catch (err) {
            setState({
                data: null,
                loading: false,
                error: err instanceof Error ? err.message : 'An error occurred',
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, dependencies);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return { ...state, refetch: fetchData };
}

// Hook for periodic refetch (real-time updates)
export function useApiPolling<T>(
    fetchFn: () => Promise<T>,
    intervalMs: number = 30000,
    dependencies: unknown[] = []
): UseApiState<T> & { refetch: () => void } {
    const result = useApi(fetchFn, dependencies);

    useEffect(() => {
        const interval = setInterval(() => {
            result.refetch();
        }, intervalMs);

        return () => clearInterval(interval);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [intervalMs]);

    return result;
}
