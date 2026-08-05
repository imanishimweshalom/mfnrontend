import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Safely fetches data, preventing memory leaks on mobile when components unmount early.
 */
export const useFetch = (fetcher, deps = []) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Use a ref to always hold the latest fetcher function without
  // needing to include it in the dependency array (prevents infinite loops)
  const fetcherRef = useRef(fetcher);
  useEffect(() => { fetcherRef.current = fetcher; });

  const load = useCallback(async () => {
    let isMounted = true; // Prevent state updates if component unmounts
    setLoading(true);
    setError(null);
    
    try {
      const res = await fetcherRef.current();
      if (isMounted) setData(res.data);
    } catch (err) {
      if (isMounted) setError(err.response?.data?.error || err.message);
    } finally {
      if (isMounted) setLoading(false);
    }

    return () => { isMounted = false; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    const cleanup = load();
    return () => {
      if (typeof cleanup === 'function') cleanup();
    };
  }, [load]);

  return { data, loading, error, refetch: load };
};

/**
 * Reactive time-ago hook. Automatically updates the UI every 60 seconds.
 * This is much better for mobile because it doesn't force constant re-renders.
 */
export const useTimeAgo = (dateStr) => {
  const calculateTime = () => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return ''; // Prevent crashes on invalid dates

    const diff = Math.floor((Date.now() - date.getTime()) / 1000);
    
    if (diff < 0) return 'just now';
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  const [timeAgo, setTimeAgo] = useState(calculateTime);

  useEffect(() => {
    if (!dateStr) return;
    
    // Recalculate every 60 seconds so the UI stays accurate
    const interval = setInterval(() => {
      setTimeAgo(calculateTime());
    }, 60000);

    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateStr]);

  return timeAgo;
};

/**
 * Secure Image URL formatter. Fixes the 404 error and prevents XSS.
 */
export const useImageUrl = (path) => {
  // Fix: Point to your actual backend server instead of the frontend root folder
  const API_BASE = process.env.REACT_APP_API_URL?.replace('/api', '') || 'https://mahokofridaynewsbackend.onrender.com';
  const PLACEHOLDER = `${API_BASE}/uploads/placeholder.jpg`;

  if (!path || typeof path !== 'string') return PLACEHOLDER;

  // Security: Explicitly allow only http and https protocols to prevent XSS
  if (path.startsWith('http://') || path.startsWith('https://')) {
    try {
      const url = new URL(path);
      if (url.protocol === 'http:' || url.protocol === 'https:') return path;
    } catch {
      return PLACEHOLDER; // Invalid URL
    }
  }

  // Security: Prevent Directory Traversal (e.g., ../../../etc/passwd)
  if (path.includes('..')) return PLACEHOLDER;

  // Sanitize path and construct URL
  const cleanPath = path.replace(/^uploads?\//, '').replace(/^\/+/, ''); 
  return `${API_BASE}/uploads/${cleanPath}`;
};
