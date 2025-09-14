'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { initAnalytics, trackPageView, identifyUser } from '@/lib/analytics';

export default function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session } = useSession();

  useEffect(() => {
    // Initialize analytics
    initAnalytics();
  }, []);

  useEffect(() => {
    // Track page views
    if (pathname) {
      trackPageView(pathname);
    }
  }, [pathname]);

  useEffect(() => {
    // Identify user when session changes
    if (session?.user?.email) {
      identifyUser(session.user.email, {
        name: session.user.name,
        email: session.user.email,
        signup_date: new Date().toISOString(),
      });
    }
  }, [session]);

  return <>{children}</>;
}
