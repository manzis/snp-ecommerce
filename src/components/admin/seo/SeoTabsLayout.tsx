"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GlobalSeoTab from './tabs/GlobalSeoTab';
import PagesSeoTab from './tabs/PagesSeoTab';
import ProductsSeoTab from './tabs/ProductsSeoTab';
import RedirectsTab from './tabs/RedirectsTab';
import SitemapTab from './tabs/SitemapTab';
import ContentBlocksTab from './tabs/ContentBlocksTab';
import SeoPreviewTab from './tabs/SeoPreviewTab';
import { SeoGlobal } from '@/lib/seo/seoTypes';

const TABS = [
  { id: 'global', label: 'Global Settings' },
  { id: 'pages', label: 'Pages (Static)' },
  { id: 'products', label: 'Products Override' },
  { id: 'content', label: 'SEO Content Blocks' },
  { id: 'redirects', label: 'Redirects' },
  { id: 'sitemap', label: 'Sitemap & Intl' },
  { id: 'preview', label: 'Preview Engine ⚡' }
];

interface SeoTabsLayoutProps {
  initialGlobal: SeoGlobal | null;
}

export default function SeoTabsLayout({ initialGlobal }: SeoTabsLayoutProps) {
  const [activeTab, setActiveTab] = useState(TABS[0].id);

  const renderContent = () => {
    switch (activeTab) {
      case 'global': return <GlobalSeoTab initialData={initialGlobal} />;
      case 'pages': return <PagesSeoTab />;
      case 'products': return <ProductsSeoTab />;
      case 'redirects': return <RedirectsTab />;
      case 'sitemap': return <SitemapTab />;
      case 'content': return <ContentBlocksTab />;
      case 'preview': return <SeoPreviewTab />;
      default: return null;
    }
  };

  return (
    <div className="flex flex-col h-full font-rubik">
      {/* Scrollable Tab Navigation */}
      <div className="flex overflow-x-auto no-scrollbar border-b border-[#e5e5e5] px-[12px] md:px-[24px] lg:px-[32px] pt-2 shrink-0">
        <div className="flex gap-[8px] md:gap-[16px] min-w-max">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative py-[10px] px-[4px] text-[13px] md:text-[14px] font-medium transition-colors ${
                activeTab === tab.id ? 'text-[#242424]' : 'text-[#71717a] hover:text-[#242424]'
              }`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <motion.div
                  layoutId="activeSeoTab"
                  className="absolute bottom-[-1px] left-0 right-0 h-[2px] bg-[#242424]"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Payload Panel */}
      <div className="flex-1 overflow-y-auto w-full p-[12px] md:p-[24px] lg:p-[32px] bg-[#fafa-fb]">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.15 }}
            className="w-full h-full max-w-[1200px]"
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
