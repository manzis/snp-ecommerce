'use client';

import Script from 'next/script';
import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, Suspense } from 'react';

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

function GAPageViewTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!GA_ID || typeof window === 'undefined' || !(window as any).gtag) return;

    const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '');
    (window as any).gtag('config', GA_ID, {
      page_path: url,
    });
  }, [pathname, searchParams]);

  return null;
}

export default function GoogleAnalytics() {
  if (!GA_ID) return null;

  return (
    <>
      {/* Google Analytics 4 - Load after interactive for performance */}
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
      />
      <Script
        id="ga4-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_ID}', {
              page_path: window.location.pathname,
              send_page_view: true,
              anonymize_ip: false,
              cookie_flags: 'SameSite=None;Secure',
            });
          `,
        }}
      />
      {/* SPA Navigation Tracking (tracks route changes in Next.js) */}
      <Suspense fallback={null}>
        <GAPageViewTracker />
      </Suspense>
    </>
  );
}
