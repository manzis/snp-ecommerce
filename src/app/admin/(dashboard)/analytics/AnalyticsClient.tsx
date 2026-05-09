'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  Users,
  ShoppingBag,
  Eye,
  Search,
  MessageCircle,
  MousePointer2,
  X
} from 'lucide-react';
import { useState, useEffect } from 'react';
import AdminSubNav from '@/components/admin/layout/AdminSubNav';
import AnalyticsFilters from '@/components/admin/analytics/AnalyticsFilters';
import AdminModal from '@/components/admin/shared/AdminModal';
import { useAdminUI } from '@/context/AdminUIContext';

import { MetricCard } from '@/components/admin/analytics/MetricCard';
import { SearchAnalysis } from '@/components/admin/analytics/SearchAnalysis';
import { SearchModal } from '@/components/admin/analytics/SearchModal';
import { MarketingPanel } from '@/components/admin/analytics/MarketingPanel';
import { MostViewedSection } from '@/components/admin/analytics/MostViewedSection';
import { TopSellingSection } from '@/components/admin/analytics/TopSellingSection';

import { getAnalyticsDataAction } from '@/app/actions/analyticsActions';

interface AnalyticsClientProps {
  initialData?: {
    stats: any;
    topViewed: any[];
    trendingSearches: any[];
    topSelling: any[];
  };
}

export default function AnalyticsClient({ initialData }: AnalyticsClientProps) {
  const [mounted, setMounted] = useState(false);
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(!initialData);
  const [datePreset, setDatePreset] = React.useState('30d');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isViewedModalOpen, setIsViewedModalOpen] = useState(false);
  const [isSellingModalOpen, setIsSellingModalOpen] = useState(false);

  const { setPrimaryAction, setOverrideTitle } = useAdminUI();

  useEffect(() => {
    setMounted(true);
    setOverrideTitle(null); // Use default title from TITLE_MAP
    setPrimaryAction(null); // No primary action for analytics
    if (!initialData) {
      loadData();
    }
  }, []);

  const loadData = async () => {
    setLoading(true);
    const result = await getAnalyticsDataAction();
    if (result.success) {
      setData(result.data);
    }
    setLoading(false);
  };

  const stats = data?.stats || { revenue: 0, orders: 0, views: 0, customers: 0 };
  const topViewed = data?.topViewed || [];
  const trendingSearches = data?.trendingSearches || [];
  const topSelling = data?.topSelling || [];

  return (
    <div className="flex flex-col h-full bg-[#FAFAFA] rounded-[12px] overflow-hidden font-rubik tracking-tight">
      {/* Layer 1: Global Actions & Title (Now in Layout) */}

      {/* Layer 2: Search & Filters */}
      <AdminSubNav
        onSearch={setSearchQuery}
        searchPlaceholder="Search products or metrics..."
        searchOnLeft={true}
        onRefresh={loadData}
        refreshLoading={loading}
        filterDropdown={
          <AnalyticsFilters
            datePreset={datePreset}
            onDatePresetChange={setDatePreset}
            onReset={() => setDatePreset('30d')}
          />
        }
      />

      {/* Content Area: Scrolling Container */}
      <div className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto overflow-x-hidden pb-[200px] flex flex-col gap-8 md:gap-10 bg-white">
        {loading || !mounted ? (
          <div className="flex flex-col gap-8 md:gap-10 animate-pulse">
            {/* Top Metrics Grid Skeleton */}
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-[140px] bg-white border border-gray-100 rounded-[12px]" />
              ))}
            </div>

            {/* Most Viewed Section Skeleton */}
            <div className="h-[200px] bg-white border border-gray-100 rounded-[12px]" />

            {/* Main Analysis Section Skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                <div className="h-[400px] bg-white border border-gray-100 rounded-[12px]" />
                <div className="h-[300px] bg-white border border-gray-100 rounded-[12px]" />
              </div>
              <div className="space-y-8">
                <div className="h-[350px] bg-white border border-gray-100 rounded-[12px]" />
                <div className="h-[450px] bg-white border border-gray-100 rounded-[12px]" />
              </div>
            </div>
          </div>
        ) : (
          <>
            {searchQuery && (
              <div className="bg-[#bef264]/10 border border-[#bef264]/20 p-6 rounded-2xl">
                <h2 className="text-[12px] font-semibold text-[#242424] uppercase tracking-[0.2em] mb-4">
                  Search Results for "{searchQuery}"
                </h2>
                <div className="py-[100px] text-center bg-white border border-gray-100 rounded-xl">
                  <p className="text-[#a1a1aa] text-sm font-normal">Showing detailed metrics for your search term.</p>
                </div>
              </div>
            )}

            {!searchQuery && (
              <>
                {/* Top Metrics Grid */}
                <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3">
                  <MetricCard
                    title="Total Revenue"
                    value={`रु ${(stats.revenue || 0).toLocaleString()}`}
                    subtext={`From ${stats.orders || 0} orders`}
                    icon={ShoppingBag}
                    trend={12.4}
                  />
                  <MetricCard
                    title="Product Views"
                    value={(stats.views || 0).toLocaleString()}
                    subtext="Total unique visits"
                    icon={Eye}
                    trend={8.2}
                  />
                  <MetricCard
                    title="Total Customers"
                    value={(stats.customers || 0).toLocaleString()}
                    subtext="Registered users"
                    icon={Users}
                    trend={5.1}
                  />
                  <MetricCard
                    title="Avg. Order Value"
                    value={`रु ${stats.orders > 0 ? Math.round(stats.revenue / stats.orders).toLocaleString() : 0}`}
                    subtext="Per successful order"
                    icon={TrendingUp}
                    trend={-2.1}
                  />
                </div>

                <MostViewedSection
                  topViewed={topViewed}
                  totalViews={stats.views || 1}
                  onViewAll={() => setIsViewedModalOpen(true)}
                />

                <TopSellingSection
                  topSelling={topSelling}
                  onViewAll={() => setIsSellingModalOpen(true)}
                />

                {/* Main Analysis Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 space-y-8">
                    {/* Main Graph Card */}
                    <div className="bg-white p-6 rounded-[12px] border border-gray-100 h-[400px]">
                      <div className="flex items-center justify-between mb-8">
                        <div>
                          <h3 className="text-base font-semibold text-[#242424] font-rubik">Sales Revenue Trend</h3>
                          <p className="text-[10px] text-[#71717a] font-semibold uppercase tracking-widest mt-0.5">Performance visualization</p>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1.5">
                            <div className="w-2.5 h-2.5 rounded-full bg-[#bef264]" />
                            <span className="text-[10px] font-semibold text-[#71717a] uppercase tracking-tight">Gross</span>
                          </div>
                        </div>
                      </div>

                      {/* Custom Chart Area */}
                      <div className="flex items-end justify-between h-[280px] gap-2 px-2">
                        {[65, 45, 75, 55, 95, 80, 60, 85, 45, 70, 90, 75].map((h, i) => (
                          <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                            <motion.div
                              initial={{ height: 0 }}
                              animate={{ height: `${h}%` }}
                              transition={{ duration: 1, delay: i * 0.05 }}
                              className="w-full bg-gray-50 rounded-t-[6px] group-hover:bg-[#bef264] transition-all duration-300 relative"
                            >
                              <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-[#242424] text-white text-[10px] font-semibold px-3 py-2 rounded-xl opacity-0 group-hover:opacity-100 transition-all whitespace-nowrap z-20 scale-75 group-hover:scale-100 border border-white/10">
                                रु {(h * 10).toFixed(0)}k
                                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-[#242424]"></div>
                              </div>
                            </motion.div>
                            <span className="text-[8px] md:text-[9px] font-semibold text-[#a1a1aa] uppercase tracking-widest">M{i + 1}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <MarketingPanel />
                  </div>

                  {/* Right Column Analysis */}
                  <div className="space-y-8">
                    <SearchAnalysis
                      trendingSearches={trendingSearches}
                      onViewAll={() => setIsSearchModalOpen(true)}
                    />

                    {/* Search Modal */}
                    <SearchModal
                      isOpen={isSearchModalOpen}
                      onClose={() => setIsSearchModalOpen(false)}
                      data={trendingSearches}
                    />

                    {/* Most Viewed Full List Modal */}
                    <AdminModal
                      isOpen={isViewedModalOpen}
                      onClose={() => setIsViewedModalOpen(false)}
                      title="All Trending Products"
                    >
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-4">
                        {topViewed.map((item: any, i: number) => (
                          <div key={i} className="flex flex-col gap-3 group">
                            <div className="aspect-square bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 group-hover:border-[#bef264] transition-all">
                              <img src={item.thumbnail || '/images/protein.webp'} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                            </div>
                            <div>
                              <h4 className="text-sm font-semibold text-[#242424] truncate">{item.name}</h4>
                              <p className="text-[10px] font-bold text-[#a1a1aa] uppercase tracking-widest mt-1">{item.view_count} Total Views</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </AdminModal>

                    {/* Top Selling Full List Modal */}
                    <AdminModal
                      isOpen={isSellingModalOpen}
                      onClose={() => setIsSellingModalOpen(false)}
                      title="Best Selling Products"
                    >
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-4">
                        {topSelling.map((item: any, i: number) => (
                          <div key={i} className="flex flex-col gap-3 group">
                            <div className="aspect-square bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 group-hover:border-green-600 transition-all">
                              <img src={item.thumbnail || '/images/protein.webp'} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                            </div>
                            <div>
                              <h4 className="text-sm font-semibold text-[#242424] truncate">{item.name}</h4>
                              <p className="text-[10px] font-bold text-[#a1a1aa] uppercase tracking-widest mt-1">{item.order_count} Orders Received</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </AdminModal>
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
