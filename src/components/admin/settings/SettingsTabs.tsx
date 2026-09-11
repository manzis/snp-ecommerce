'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { updateStoreSettingsAction } from '@/app/actions/settingsActions';
import SaveIcon from '@/components/icons/TickIcon';
import { useAdminUI } from '@/context/AdminUIContext';
import { useAdminToast } from '@/components/admin/ui/AdminToastProvider';
import { Clock, Timer, Plus, Calendar, AlertCircle, Sparkles } from 'lucide-react';

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
  const { showAdminToast } = useAdminToast();

  const [adminTimerRemaining, setAdminTimerRemaining] = useState<{
    hours: number;
    minutes: number;
    seconds: number;
    isExpired: boolean;
    formatted: string;
  } | null>(null);
  const [isCustomDateOpen, setIsCustomDateOpen] = useState(false);

  useEffect(() => {
    if (!settings.orders_disabled || !settings.orders_disabled_until) {
      setAdminTimerRemaining(null);
      return;
    }

    const calculateTime = () => {
      const target = new Date(settings.orders_disabled_until).getTime();
      const now = Date.now();
      const diff = target - now;

      if (diff <= 0) {
        setAdminTimerRemaining({
          hours: 0,
          minutes: 0,
          seconds: 0,
          isExpired: true,
          formatted: '00h : 00m : 00s (Expired - will auto-enable)',
        });
        return;
      }

      const totalSec = Math.floor(diff / 1000);
      const hours = Math.floor(totalSec / 3600);
      const minutes = Math.floor((totalSec % 3600) / 60);
      const seconds = totalSec % 60;

      const pad = (n: number) => String(n).padStart(2, '0');
      setAdminTimerRemaining({
        hours,
        minutes,
        seconds,
        isExpired: false,
        formatted: `${pad(hours)}h : ${pad(minutes)}m : ${pad(seconds)}s`,
      });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [settings.orders_disabled, settings.orders_disabled_until]);

  const PRESET_DURATIONS = [
    { label: '15m', minutes: 15 },
    { label: '30m', minutes: 30 },
    { label: '1h', minutes: 60 },
    { label: '2h', minutes: 120 },
    { label: '4h', minutes: 240 },
    { label: '12h', minutes: 720 },
    { label: '24h', minutes: 1440 },
  ];

  const handleApplyPreset = (minutes: number) => {
    const target = new Date(Date.now() + minutes * 60 * 1000).toISOString();
    setSettings((prev: any) => ({
      ...prev,
      orders_disabled: true,
      orders_disabled_until: target,
    }));
  };

  const handleAddMinutes = (extraMinutes: number) => {
    const base = settings.orders_disabled_until && new Date(settings.orders_disabled_until).getTime() > Date.now()
      ? new Date(settings.orders_disabled_until).getTime()
      : Date.now();
    const target = new Date(base + extraMinutes * 60 * 1000).toISOString();
    setSettings((prev: any) => ({
      ...prev,
      orders_disabled: true,
      orders_disabled_until: target,
    }));
  };

  const handleMakeIndefinite = () => {
    setSettings((prev: any) => ({
      ...prev,
      orders_disabled: true,
      orders_disabled_until: null,
    }));
  };

  const handleEnableOrdersNow = () => {
    setSettings((prev: any) => ({
      ...prev,
      orders_disabled: false,
      orders_disabled_until: null,
    }));
  };

  const handleToggleOrdersDisabled = () => {
    const nextVal = !settings.orders_disabled;
    if (!nextVal) {
      setSettings((prev: any) => ({
        ...prev,
        orders_disabled: false,
        orders_disabled_until: null,
      }));
    } else {
      // Default to 1 hour on toggle if no previous timer set
      const defaultTarget = new Date(Date.now() + 60 * 60 * 1000).toISOString();
      setSettings((prev: any) => ({
        ...prev,
        orders_disabled: true,
        orders_disabled_until: prev.orders_disabled_until || defaultTarget,
      }));
    }
  };

  const formatTargetTime = (isoString?: string | null) => {
    if (!isoString) return '';
    try {
      const d = new Date(isoString);
      return d.toLocaleString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
    } catch {
      return isoString;
    }
  };

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
    
    const result = await updateStoreSettingsAction(settings);
    
    if (result.success) {
      showAdminToast('Settings saved successfully!', 'success');
    } else {
      showAdminToast(result.message || 'Failed to save settings', 'error');
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

                    <div className="mt-3 bg-gray-50/50 p-4 rounded-[12px] border border-gray-100 transition-all">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-[13px] font-medium text-[#242424]">Disable Orders</h3>
                          <p className="text-[11px] text-[#71717a] mt-0.5">Prevent customers from placing new orders while keeping the store visible.</p>
                        </div>
                        <button 
                          onClick={handleToggleOrdersDisabled}
                          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${settings.orders_disabled ? 'bg-[#242424]' : 'bg-gray-300'}`}
                        >
                          <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${settings.orders_disabled ? 'translate-x-5' : 'translate-x-0'}`} />
                        </button>
                      </div>

                      {/* Expandable Timer Configuration */}
                      <AnimatePresence>
                        {settings.orders_disabled && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden mt-4 pt-4 border-t border-gray-100 space-y-4"
                          >
                            {/* Live Timer Status Card if timer is active */}
                            {settings.orders_disabled_until ? (
                              <div className="p-3.5 bg-gradient-to-r from-red-50 to-orange-50/60 rounded-[12px] border border-red-200/80 shadow-xs flex flex-col gap-3">
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                  <div className="flex items-center gap-2">
                                    <Timer className="w-4 h-4 text-red-600 shrink-0 animate-pulse" />
                                    <span className="text-[12px] font-semibold text-red-900 uppercase tracking-wider">
                                      Auto-Enable Timer
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1.5 font-mono text-[13px] font-bold text-red-700 bg-white/80 px-2.5 py-1 rounded-md border border-red-200 shadow-xs">
                                    <Clock className="w-3.5 h-3.5 text-red-500" />
                                    <span>{adminTimerRemaining ? adminTimerRemaining.formatted : 'Calculating...'}</span>
                                  </div>
                                </div>

                                <p className="text-[11px] text-red-800/80">
                                  Orders will automatically re-enable on <span className="font-semibold text-red-900">{formatTargetTime(settings.orders_disabled_until)}</span> without requiring manual action.
                                </p>

                                <div className="flex flex-wrap items-center justify-between gap-2 pt-2.5 border-t border-red-200/60">
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-[11px] font-medium text-red-800 mr-0.5">Extend:</span>
                                    <button
                                      type="button"
                                      onClick={() => handleAddMinutes(15)}
                                      className="px-2 py-0.5 text-[11px] font-medium bg-white hover:bg-red-50 text-red-700 border border-red-200 rounded-[6px] transition-all active:scale-95"
                                    >
                                      +15m
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleAddMinutes(30)}
                                      className="px-2 py-0.5 text-[11px] font-medium bg-white hover:bg-red-50 text-red-700 border border-red-200 rounded-[6px] transition-all active:scale-95"
                                    >
                                      +30m
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleAddMinutes(60)}
                                      className="px-2 py-0.5 text-[11px] font-medium bg-white hover:bg-red-50 text-red-700 border border-red-200 rounded-[6px] transition-all active:scale-95"
                                    >
                                      +1h
                                    </button>
                                    <button
                                      type="button"
                                      onClick={handleMakeIndefinite}
                                      className="ml-2 text-[11px] text-red-700/80 hover:text-red-900 underline transition-colors"
                                    >
                                      Clear Timer (Indefinite)
                                    </button>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={handleEnableOrdersNow}
                                    className="px-2.5 py-1 text-[11px] font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-[6px] transition-all active:scale-95 shadow-xs"
                                  >
                                    Enable Orders Now
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="p-3 bg-red-50/70 rounded-[12px] border border-red-200/80 shadow-xs flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2">
                                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                                  <span className="text-[12px] font-medium text-red-900">
                                    Orders disabled indefinitely (No timer set). Select a duration below to enable auto-reopening.
                                  </span>
                                </div>
                                <button
                                  type="button"
                                  onClick={handleEnableOrdersNow}
                                  className="px-2.5 py-1 text-[11px] font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-[6px] transition-all active:scale-95 shadow-xs shrink-0"
                                >
                                  Enable Orders Now
                                </button>
                              </div>
                            )}

                            {/* Duration Presets */}
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <label className="text-[12px] font-medium text-[#242424]">
                                  Auto-Enable Duration
                                </label>
                                <button
                                  type="button"
                                  onClick={() => setIsCustomDateOpen(!isCustomDateOpen)}
                                  className="text-[11px] text-[#71717a] hover:text-[#242424] transition-colors flex items-center gap-1"
                                >
                                  <Calendar className="w-3.5 h-3.5" />
                                  {isCustomDateOpen ? 'Hide Custom Time' : 'Set Custom Date & Time'}
                                </button>
                              </div>

                              <div className="flex flex-wrap gap-1.5">
                                {PRESET_DURATIONS.map((preset) => (
                                  <button
                                    key={preset.label}
                                    type="button"
                                    onClick={() => handleApplyPreset(preset.minutes)}
                                    className="px-3 py-1.5 text-[12px] font-medium bg-white hover:bg-gray-50 text-[#242424] border border-gray-200 rounded-[8px] transition-all active:scale-95"
                                  >
                                    {preset.label}
                                  </button>
                                ))}
                                <button
                                  type="button"
                                  onClick={handleMakeIndefinite}
                                  className={`px-3 py-1.5 text-[12px] font-medium rounded-[8px] transition-all active:scale-95 border ${
                                    !settings.orders_disabled_until
                                      ? 'bg-gray-100 text-[#242424] border-gray-300 font-semibold'
                                      : 'bg-white hover:bg-gray-50 text-[#71717a] border-gray-200'
                                  }`}
                                >
                                  Indefinite
                                </button>
                              </div>

                              {isCustomDateOpen && (
                                <div className="mt-2.5 p-3 bg-white rounded-[10px] border border-gray-100">
                                  <label className="text-[11px] text-[#71717a] block mb-1">
                                    Select exact date & time orders should re-enable:
                                  </label>
                                  <input
                                    type="datetime-local"
                                    onChange={(e) => {
                                      if (e.target.value) {
                                        const d = new Date(e.target.value);
                                        if (!isNaN(d.getTime())) {
                                          setSettings((prev: any) => ({
                                            ...prev,
                                            orders_disabled: true,
                                            orders_disabled_until: d.toISOString(),
                                          }));
                                        }
                                      }
                                    }}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-[8px] py-1.5 px-3 text-[12px] text-[#242424] outline-none focus:border-gray-300 focus:bg-white"
                                  />
                                </div>
                              )}
                            </div>

                            {/* Customer Announcement Notice Input */}
                            <div className="space-y-1.5">
                              <label className="text-[12px] font-medium text-[#242424]">
                                Customer Announcement Notice (Optional)
                              </label>
                              <input
                                type="text"
                                value={settings.orders_disabled_reason || ''}
                                onChange={(e) => handleChange('', 'orders_disabled_reason', e.target.value)}
                                placeholder="e.g. Taking a short break for restocking. Checkout will reopen shortly!"
                                className="w-full bg-gray-50 border-transparent rounded-[10px] py-[8px] px-4 text-[13px] focus:bg-white focus:ring-1 focus:ring-gray-200 focus:border-gray-200 outline-none transition-all placeholder:text-gray-400"
                              />
                              <p className="text-[11px] text-[#71717a]">
                                Displayed to customers inside the storefront order notice popup alongside the live timer.
                              </p>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
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
                    <p className="text-[12px] text-[#71717a] mt-1 font-regular mb-6">Enable or disable payment methods available to customers at checkout and configure fees.</p>
                    
                    <div className="grid gap-4">
                      {/* Cash on Delivery */}
                      <div className="flex flex-col gap-3 bg-gray-50/50 p-4 rounded-[12px] border border-gray-100">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-[13px] font-medium text-[#242424]">Cash on Delivery (COD)</h3>
                            <p className="text-[11px] text-[#71717a] mt-0.5">Allow customers to pay with cash upon receiving their order.</p>
                          </div>
                          <button 
                            onClick={() => handleChange('payment_methods', 'cod', !settings.payment_methods?.cod)}
                            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${settings.payment_methods?.cod ? 'bg-[#242424]' : 'bg-gray-300'}`}
                          >
                            <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${settings.payment_methods?.cod ? 'translate-x-5' : 'translate-x-0'}`} />
                          </button>
                        </div>

                        {settings.payment_methods?.cod && (
                          <div className="mt-2 pt-3 border-t border-gray-100 flex items-center justify-between gap-4">
                            <div>
                              <label className="text-[12px] font-medium text-[#242424]">COD Extra Charge / Handling Fee (NPR)</label>
                              <p className="text-[11px] text-[#71717a]">Additional fee applied to orders when customer selects COD payment.</p>
                            </div>
                            <div className="w-32 flex-none">
                              <input
                                type="number"
                                min="0"
                                value={settings.payment_methods?.cod_fee ?? 0}
                                onChange={(e) => handleChange('payment_methods', 'cod_fee', Math.max(0, Number(e.target.value)))}
                                placeholder="e.g. 23"
                                className="w-full bg-white border border-gray-200 rounded-[8px] py-[6px] px-3 text-[13px] font-medium focus:ring-1 focus:ring-gray-300 outline-none"
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      {[
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
                    <h2 className="text-[15px] font-medium text-[#242424] tracking-tight">Delivery Rules & Shipping Charges</h2>
                    <p className="text-[12px] text-[#71717a] mt-1 font-regular">Configure dynamic shipping costs and thresholds applied at checkout.</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <label className="text-[12px] font-medium text-[#242424]">Home Delivery Cost (NPR)</label>
                      <input
                        type="number"
                        min="0"
                        value={settings.shipping?.standard_cost ?? 150}
                        onChange={(e) => handleChange('shipping', 'standard_cost', Math.max(0, Number(e.target.value)))}
                        placeholder="e.g. 150"
                        className="w-full bg-gray-50 border-transparent rounded-[10px] py-[8px] px-4 text-[13px] focus:bg-white focus:ring-1 focus:ring-gray-200 focus:border-gray-200 outline-none transition-all placeholder:text-gray-400"
                      />
                      <p className="text-[11px] text-[#71717a] mt-1">Doorstep home delivery charge.</p>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[12px] font-medium text-[#242424]">Pickup Station Cost (NPR)</label>
                      <input
                        type="number"
                        min="0"
                        value={settings.shipping?.pickup_cost ?? 100}
                        onChange={(e) => handleChange('shipping', 'pickup_cost', Math.max(0, Number(e.target.value)))}
                        placeholder="e.g. 100"
                        className="w-full bg-gray-50 border-transparent rounded-[10px] py-[8px] px-4 text-[13px] focus:bg-white focus:ring-1 focus:ring-gray-200 focus:border-gray-200 outline-none transition-all placeholder:text-gray-400"
                      />
                      <p className="text-[11px] text-[#71717a] mt-1">Nearest station pickup charge.</p>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[12px] font-medium text-[#242424]">Free Shipping Threshold (NPR)</label>
                      <input
                        type="number"
                        min="0"
                        value={settings.shipping?.free_threshold ?? 5000}
                        onChange={(e) => handleChange('shipping', 'free_threshold', Math.max(0, Number(e.target.value)))}
                        placeholder="e.g. 5000"
                        className="w-full bg-gray-50 border-transparent rounded-[10px] py-[8px] px-4 text-[13px] focus:bg-white focus:ring-1 focus:ring-gray-200 focus:border-gray-200 outline-none transition-all placeholder:text-gray-400"
                      />
                      <p className="text-[11px] text-[#71717a] mt-1">Cart subtotal required for free shipping.</p>
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
