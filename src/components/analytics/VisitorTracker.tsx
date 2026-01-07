'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function VisitorTracker() {
    const pathname = usePathname();

    useEffect(() => {
        // Don't track Admin pages (or API calls if somehow client-side navigated)
        if (pathname?.startsWith('/admin')) return;

        // 1. Identify Visitor
        let visitorId = localStorage.getItem('visitor_id');
        if (!visitorId) {
            visitorId = crypto.randomUUID();
            localStorage.setItem('visitor_id', visitorId);
        }

        // 2. Detect Device Type (Simple)
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        const device = isMobile ? 'mobile' : 'desktop';

        // 3. Send Heartbeat
        const track = async () => {
            try {
                // Determine absolute URL or just allow relative if on same domain
                await fetch('/api/track', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        visitorId,
                        page: pathname,
                        device
                    })
                });
            } catch (err) {
                // Fail silently, don't disrupt user
                console.error('Tracking failed', err);
            }
        };

        track();

        // Optional: Ping every minute to keep session alive even if staying on same page
        const interval = setInterval(track, 60000); // 1 minute

        return () => clearInterval(interval);
    }, [pathname]);

    return null; // Renderless component
}
