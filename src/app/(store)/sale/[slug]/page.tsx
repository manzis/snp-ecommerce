import React, { Suspense } from 'react';
import { fetchSaleBySlugAction } from '@/app/actions/saleActions';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import DynamicPageNav from '@/components/layout/DynamicPageNav';
import type { Metadata } from 'next';
import { getSeoGlobal } from '@/lib/seo/getSeoData';
import SaleProductSection from './SaleProductSection';
import { Tag, Clock } from 'lucide-react';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { success, data: sale } = await fetchSaleBySlugAction(slug);
  const gSeo = await getSeoGlobal();

  if (!success || !sale) return { title: 'Sale Not Found | SNP Store' };

  const canonical = `https://www.brightsupplements.store/sale/${slug}`;
  const saleCover = sale.banner_image || gSeo?.default_og_image || '/icon.png';
  const title = `${sale.name} - Special Offers & Discounts | Supplyment Nepal`;
  const description = `Shop the exclusive ${sale.name} at Supplyment Nepal. Get amazing discounts on top supplement brands.`;

  return {
    title,
    description,
    alternates: {
      canonical,
      languages: { 'en-NP': canonical },
    },
    robots: 'index, follow',
    openGraph: {
      title,
      description,
      url: canonical,
      type: 'website',
      siteName: 'Supplyment Nepal',
      locale: 'en_NP',
      images: [{ url: saleCover, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [saleCover],
    },
  };
}

const SaleSkeleton = () => (
  <div className="min-h-screen mx-auto w-full bg-white mt-[80px] pb-[60px] animate-pulse">
    <div className="w-full h-[140px] lg:h-[300px] bg-red-50" />
    <div className="w-full lg:max-w-[1280px] mx-auto mt-6 px-6">
      <div className="h-[120px] w-full bg-gray-50 rounded mb-6" />
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {[...Array(10)].map((_, i) => (
          <div key={i} className="aspect-[3/4] bg-gray-50 rounded" />
        ))}
      </div>
    </div>
  </div>
);

async function SaleDataWrapper({ slug }: { slug: string }) {
  const { success, data: sale } = await fetchSaleBySlugAction(slug);

  if (!success || !sale) {
    notFound();
  }

  const products = sale.products || [];
  const banner = sale.banner_image || 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1470&auto=format&fit=crop';
  
  const discountText = sale.discount_type === 'PERCENTAGE' ? `${sale.discount_value}% OFF` : `रु ${sale.discount_value} OFF`;
  const endsAtDate = new Date(sale.ends_at);
  const now = new Date();
  const isExpired = endsAtDate < now;
  const isExpiringSoon = endsAtDate.getTime() - now.getTime() < 86400000;

  let agoText = '';
  if (isExpired) {
      const diffMs = Math.abs(now.getTime() - endsAtDate.getTime());
      const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const minutes = Math.floor(diffMs / (1000 * 60));
      
      if (days > 0) agoText = `${days} day${days > 1 ? 's' : ''}`;
      else if (hours > 0) agoText = `${hours} hour${hours > 1 ? 's' : ''}`;
      else if (minutes > 0) agoText = `${minutes} minute${minutes > 1 ? 's' : ''}`;
      else agoText = 'a few seconds';
  }

  return (
    <div className="flex flex-col w-full lg:items-center bg-[#fcfcfc]">
      <DynamicPageNav title={sale.name} subtitle={`${products.length} Products`} />
      
      <header className="relative w-full h-[160px] lg:h-[350px] shrink-0 bg-black overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/10 z-10" />
        <Image
          src={banner}
          alt={`${sale.name} Banner`}
          fill
          priority
          className="object-cover opacity-80"
          sizes="(max-width: 1280px) 100vw, 1280px"
        />
        
        <div className="absolute inset-0 z-20 flex flex-col justify-end p-6 lg:p-12 lg:max-w-[1280px] mx-auto w-full">
            <div className="flex flex-wrap items-center gap-3 mb-3">
                <span className="bg-red-600 text-white text-[10px] lg:text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5 shadow-lg shadow-red-900/50 uppercase tracking-wider">
                    <Tag className="w-3.5 h-3.5" />
                    {sale.max_discount_percentage > 0 ? `Up to ${sale.max_discount_percentage}% OFF` : discountText + ' Additional'}
                </span>
                <span className={`flex items-center gap-1.5 text-[10px] lg:text-xs font-semibold px-3 py-1 rounded-full backdrop-blur-md ${isExpired ? 'bg-gray-500/80 text-white border border-gray-400' : isExpiringSoon ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-white/20 text-white border border-white/20'}`}>
                    <Clock className="w-3.5 h-3.5" />
                    {isExpired ? `Ended ${agoText} ago` : isExpiringSoon ? 'Ending Soon!' : `Ends ${endsAtDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`}
                </span>
            </div>
            <h1 className="font-rajdhani text-3xl lg:text-5xl font-bold text-white tracking-tight uppercase">
                {sale.name}
            </h1>
        </div>
      </header>

      <main className="w-full lg:max-w-[1280px] lg:mt-[24px]">
        <SaleProductSection products={products} sale={isExpired ? null : sale} />
        
        {isExpired && (
          <div className="fixed bottom-[110px] lg:bottom-12 left-0 right-0 z-50 px-4 pointer-events-none flex justify-center">
            <div className="bg-red-600 text-white px-5 py-3 shadow-2xl flex items-center gap-3 w-full max-w-md mx-auto pointer-events-auto border border-red-500">
              <Clock className="w-6 h-6 text-red-200 shrink-0" />
              <div className="flex flex-col">
                <span className="font-rajdhani font-bold text-lg uppercase tracking-tight leading-tight">
                  Sale Ended {agoText} ago !
                </span>
                <span className="text-red-100 text-xs mt-0.5">
                  Products are now at their regular prices.
                </span>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default async function SaleDetailPage(props: Props) {
  const { slug } = await props.params;

  return (
    <div className="min-h-screen mx-auto w-full bg-[#fcfcfc] mt-[80px] pb-[60px]">
      <Suspense fallback={<SaleSkeleton />}>
        <SaleDataWrapper slug={slug} />
      </Suspense>
    </div>
  );
}
