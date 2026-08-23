'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { updateStoreSettingsAction } from '@/app/actions/settingsActions';
import { toast } from 'sonner';
import SaveIcon from '@/components/icons/TickIcon';
import { useAdminUI } from '@/context/AdminUIContext';

const TABS = [
  { id: 'general', label: 'General' },
  { id: 'business', label: 'Business Details' },
  { id: 'payment', label: 'Payment Methods' },
  { id: 'shipping', label: 'Shipping' },
];

export default function SettingsTabs({ initialSettings }: { initialSettings: any }) {
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState(initialSettings);
  const [isSaving, setIsSaving] = useState(false);
  const { setHeaderActionNode } = useAdminUI();

  const handleChange = (section: string, field: string, value: any) => {
    if (section) {
      setSettings((prev: any) => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: value
        }
      }));
    } else {
      setSettings((prev: any) => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    const toastId = toast.loading('Saving settings...');
    
    const result = await updateStoreSettingsAction(settings);
    
    if (result.success) {
      toast.success('Settings saved successfully!', { id: toastId });
    } else {
      toast.error(result.message || 'Failed to save settings', { id: toastId });
    }
    setIsSaving(false);
  };

  useEffect(() => {
    setHeaderActionNode(
      <button
        onClick={handleSave}
        disabled={isSaving}
        className="flex items-center justify-center gap-2 bg-[#242424] text-white px-5 py-2 rounded-full text-[13px] font-medium hover:bg-black transition-all active:scale-95 disabled:opacity-50"
      >
        {isSaving ? (
          <div className="w-[16px] h-[16px] border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
          <SaveIcon className="w-[16px] h-[16px]" />
        )}
        <span className="inline">{isSaving ? 'Saving...' : 'Save'}</span>
      </button>
    );

    return () => {
      setHeaderActionNode(null);
    };
  }, [isSaving, settings, handleSave]); // Add settings here to ensure it uses latest state if handleSave isn't memoized

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-white font-rubik overflow-hidden">
      {/* Top Tabs */}
      <div className="flex-none bg-white z-[90] border-b border-gray-100">
        <div className="w-full px-6 bg-white overflow-hidden">
          <div className="flex items-center gap-8 relative overflow-x-auto no-scrollbar">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative py-4 px-1 text-[13.5px] whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? 'text-[#242424] font-medium'
                    : 'text-[#a1a1aa] font-regular hover:text-[#242424]'
                }`}
              >
                <span className="flex items-center gap-2 whitespace-nowrap">
                  {tab.label}
                </span>
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="settingsTabIndicator"
                    className="absolute bottom-[-1px] left-0 right-0 h-[2.5px] bg-[#242424] z-10"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-6 lg:p-10 pb-[100px] custom-scrollbar">
        <div className="max-w-3xl mr-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
            >
              {activeTab === 'general' && (
                <div className="space-y-8">
                  <div className="border-b border-gray-100 pb-6">
                    <h2 className="text-[15px] font-medium text-[#242424] tracking-tight">Store Availability</h2>
                    <p className="text-[12px] text-[#71717a] mt-1 font-regular">Control whether the storefront is accessible to customers.</p>
                    
                    <div className="mt-5 flex items-center justify-between bg-gray-50/50 p-4 rounded-[12px] border border-gray-100">
                      <div>
                        <h3 className="text-[13px] font-medium text-[#242424]">Live Store Mode</h3>
                        <p className="text-[11px] text-[#71717a] mt-0.5">Toggle to instantly take the store offline.</p>
                      </div>
                      <button 
                        onClick={() => handleChange('', 'is_live', !settings.is_live)}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${settings.is_live ? 'bg-[#242424]' : 'bg-gray-300'}`}
                      >
                        <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${settings.is_live ? 'translate-x-5' : 'translate-x-0'}`} />
                      </button>
                    </div>

                    <div className="mt-3 flex items-center justify-between bg-gray-50/50 p-4 rounded-[12px] border border-gray-100">
                      <div>
                        <h3 className="text-[13px] font-medium text-[#242424]">Disable Orders (Catalog Mode)</h3>
                        <p className="text-[11px] text-[#71717a] mt-0.5">Prevent customers from placing new orders while keeping the store visible.</p>
                      </div>
                      <button 
                        onClick={() => handleChange('', 'orders_disabled', !settings.orders_disabled)}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${settings.orders_disabled ? 'bg-[#242424]' : 'bg-gray-300'}`}
                      >
                        <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${settings.orders_disabled ? 'translate-x-5' : 'translate-x-0'}`} />
                      </button>
                    </div>
                  </div>

                  <div className="border-b border-gray-100 pb-6 space-y-3">
                    <div>
                      <h2 className="text-[15px] font-medium text-[#242424] tracking-tight">Maintenance Message</h2>
                      <p className="text-[12px] text-[#71717a] mt-1 font-regular">Displayed on the storefront when the store is offline.</p>
                    </div>
                    <textarea
                      value={settings.maintenance_message || ''}
                      onChange={(e) => handleChange('', 'maintenance_message', e.target.value)}
                      rows={3}
                      className="w-full bg-gray-50 border-transparent rounded-[10px] py-[10px] px-4 text-[13px] focus:bg-white focus:ring-1 focus:ring-gray-200 focus:border-gray-200 outline-none transition-all placeholder:text-gray-400 resize-none"
                      placeholder="The store is currently not available!"
                    />
                  </div>
                  
                  <div className="border-b border-gray-100 pb-6">
                    <h2 className="text-[15px] font-medium text-[#242424] tracking-tight">Notifications</h2>
                    <p className="text-[12px] text-[#71717a] mt-1 font-regular">Manage system-generated emails.</p>
                    
                    <div className="mt-5 flex items-center justify-between">
                      <div>
                        <h3 className="text-[13px] font-medium text-[#242424]">Order Confirmation Emails</h3>
                        <p className="text-[11px] text-[#71717a] mt-0.5">Automatically send a receipt when an order is placed.</p>
                      </div>
                      <button 
                        onClick={() => handleChange('', 'mail_notifications', !settings.mail_notifications)}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${settings.mail_notifications ? 'bg-[#242424]' : 'bg-gray-300'}`}
                      >
                        <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${settings.mail_notifications ? 'translate-x-5' : 'translate-x-0'}`} />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'business' && (
                <div className="space-y-8">
                  <div className="border-b border-gray-100 pb-6">
                    <h2 className="text-[15px] font-medium text-[#242424] tracking-tight">Contact Information</h2>
                    <p className="text-[12px] text-[#71717a] mt-1 font-regular">Details shown to customers for support.</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-gray-100">
                    <div className="space-y-2">
                      <label className="text-[12px] font-medium text-[#242424]">Support Email</label>
                      <input
                        type="email"
                        value={settings.business_details?.email || ''}
                        onChange={(e) => handleChange('business_details', 'email', e.target.value)}
                        placeholder="support@example.com"
                        className="w-full bg-gray-50 border-transparent rounded-[10px] py-[8px] px-4 text-[13px] focus:bg-white focus:ring-1 focus:ring-gray-200 focus:border-gray-200 outline-none transition-all placeholder:text-gray-400"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[12px] font-medium text-[#242424]">Contact Phone</label>
                      <input
                        type="text"
                        value={settings.business_details?.phone || ''}
                        onChange={(e) => handleChange('business_details', 'phone', e.target.value)}
                        placeholder="+977 9800000000"
                        className="w-full bg-gray-50 border-transparent rounded-[10px] py-[8px] px-4 text-[13px] focus:bg-white focus:ring-1 focus:ring-gray-200 focus:border-gray-200 outline-none transition-all placeholder:text-gray-400"
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-[12px] font-medium text-[#242424]">Opening Hours</label>
                      <input
                        type="text"
                        value={settings.business_details?.opening_hours || ''}
                        onChange={(e) => handleChange('business_details', 'opening_hours', e.target.value)}
                        placeholder="Mon - Fri, 9:00 AM - 6:00 PM"
                        className="w-full bg-gray-50 border-transparent rounded-[10px] py-[8px] px-4 text-[13px] focus:bg-white focus:ring-1 focus:ring-gray-200 focus:border-gray-200 outline-none transition-all placeholder:text-gray-400"
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-[12px] font-medium text-[#242424]">Physical Address</label>
                      <textarea
                        value={settings.business_details?.address || ''}
                        onChange={(e) => handleChange('business_details', 'address', e.target.value)}
                        rows={2}
                        placeholder="Kathmandu, Nepal"
                        className="w-full bg-gray-50 border-transparent rounded-[10px] py-[10px] px-4 text-[13px] focus:bg-white focus:ring-1 focus:ring-gray-200 focus:border-gray-200 outline-none transition-all placeholder:text-gray-400 resize-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <h2 className="text-[15px] font-medium text-[#242424] tracking-tight">Social Media</h2>
                      <p className="text-[12px] text-[#71717a] mt-1 font-regular">Links to your social profiles.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[12px] font-medium text-[#242424]">Facebook URL</label>
                        <input
                          type="url"
                          value={settings.business_details?.facebook || ''}
                          onChange={(e) => handleChange('business_details', 'facebook', e.target.value)}
                          placeholder="https://facebook.com/..."
                          className="w-full bg-gray-50 border-transparent rounded-[10px] py-[8px] px-4 text-[13px] focus:bg-white focus:ring-1 focus:ring-gray-200 focus:border-gray-200 outline-none transition-all placeholder:text-gray-400"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[12px] font-medium text-[#242424]">Instagram URL</label>
                        <input
                          type="url"
                          value={settings.business_details?.instagram || ''}
                          onChange={(e) => handleChange('business_details', 'instagram', e.target.value)}
                          placeholder="https://instagram.com/..."
                          className="w-full bg-gray-50 border-transparent rounded-[10px] py-[8px] px-4 text-[13px] focus:bg-white focus:ring-1 focus:ring-gray-200 focus:border-gray-200 outline-none transition-all placeholder:text-gray-400"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'payment' && (
                <div className="space-y-6">
                  <div className="border-b border-gray-100 pb-6">
                    <h2 className="text-[15px] font-medium text-[#242424] tracking-tight">Payment Gateways</h2>
                    <p className="text-[12px] text-[#71717a] mt-1 font-regular mb-6">Enable or disable payment methods available to customers at checkout.</p>
                    
                    <div className="grid gap-4">
                      {[
                        { id: 'cod', label: 'Cash on Delivery (COD)' },
                        { id: 'esewa', label: 'eSewa Integration' },
                        { id: 'khalti', label: 'Khalti Wallet' },
                        { id: 'fonepay', label: 'Fonepay QR' },
                        { id: 'bank_transfer', label: 'Direct Bank Transfer' },
                      ].map((method) => (
                        <div key={method.id} className="flex items-center justify-between bg-gray-50/50 p-4 rounded-[12px] border border-gray-100">
                          <h3 className="text-[13px] font-medium text-[#242424]">{method.label}</h3>
                          <button 
                            onClick={() => handleChange('payment_methods', method.id, !settings.payment_methods?.[method.id])}
                            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${settings.payment_methods?.[method.id] ? 'bg-[#242424]' : 'bg-gray-300'}`}
                          >
                            <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${settings.payment_methods?.[method.id] ? 'translate-x-5' : 'translate-x-0'}`} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'shipping' && (
                <div className="space-y-8">
                  <div className="border-b border-gray-100 pb-6">
                    <h2 className="text-[15px] font-medium text-[#242424] tracking-tight">Delivery Rules</h2>
                    <p className="text-[12px] text-[#71717a] mt-1 font-regular">Configure how shipping costs are calculated at checkout.</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[12px] font-medium text-[#242424]">Standard Shipping Cost (NPR)</label>
                      <input
                        type="number"
                        value={settings.shipping?.standard_cost || ''}
                        onChange={(e) => handleChange('shipping', 'standard_cost', Number(e.target.value))}
                        placeholder="e.g. 100"
                        className="w-full bg-gray-50 border-transparent rounded-[10px] py-[8px] px-4 text-[13px] focus:bg-white focus:ring-1 focus:ring-gray-200 focus:border-gray-200 outline-none transition-all placeholder:text-gray-400"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[12px] font-medium text-[#242424]">Free Shipping Threshold (NPR)</label>
                      <input
                        type="number"
                        value={settings.shipping?.free_threshold || ''}
                        onChange={(e) => handleChange('shipping', 'free_threshold', Number(e.target.value))}
                        placeholder="e.g. 5000"
                        className="w-full bg-gray-50 border-transparent rounded-[10px] py-[8px] px-4 text-[13px] focus:bg-white focus:ring-1 focus:ring-gray-200 focus:border-gray-200 outline-none transition-all placeholder:text-gray-400"
                      />
                      <p className="text-[11px] text-[#71717a] mt-1">Cart total required for the customer to receive free shipping.</p>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
