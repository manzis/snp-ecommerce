'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    TrendingUp,
    CreditCard,
    ShoppingBag,
    Tag,
    Wallet,
    Calendar,
    ChevronDown,
    ChevronUp,
    Download,
    Filter,
    ArrowUpRight,
    ArrowDownRight,
    Search,
    History,
    Activity,
    BarChart3,
    LineChart as LineChartIcon
} from 'lucide-react';
import { fetchFinanceDashboardDataAction, FinanceDashboardData } from '@/app/actions/financeActions';
import { useAdminToast } from '@/components/admin/ui/AdminToastProvider';
import AdminSubNav from '@/components/admin/layout/AdminSubNav';
import DynamicAdminNav from '@/components/layout/DynamicAdminNav';
import FinanceFilters from '@/components/admin/finance/FinanceFilters';

const MetricCard = ({ title, value, subValue, icon: Icon, trend }: any) => (
    <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-5 rounded-xl border border-gray-100 hover:border-gray-300 transition-all group cursor-default"
    >
        <div className="flex justify-between items-start mb-4">
            <div className="p-2.5 rounded-lg bg-gray-50 group-hover:bg-gray-100 transition-colors duration-300">
                <Icon className="w-5 h-5 text-[#242424]" />
            </div>
            {trend && (
                <div className={`flex items-center gap-0.5 text-[11px] font-bold px-1.5 py-0.5 rounded-full ${trend > 0 ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'}`}>
                    {trend > 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    {Math.abs(trend)}%
                </div>
            )}
        </div>
        <div>
            <p className="text-[#71717a] text-[10px] font-semibold uppercase tracking-wider mb-1">{title}</p>
            <h3 className="text-xl md:text-2xl font-semibold font-rubik text-[#242424] tracking-tight">{value}</h3>
            {subValue && <p className="text-[10px] text-[#a1a1aa] mt-1 font-normal">{subValue}</p>}
        </div>
    </motion.div>
);

const SectionHeader = ({ title, description, isOpen, onToggle }: any) => (
    <button
        onClick={onToggle}
        className="w-full flex items-center justify-between py-4 group"
    >
        <div className="text-left">
            <h4 className="text-sm font-semibold text-[#242424] group-hover:text-blue-600 transition-colors">{title}</h4>
            <p className="text-[11px] text-[#71717a] font-normal">{description}</p>
        </div>
        {isOpen ? <ChevronUp className="w-4 h-4 text-[#a1a1aa]" /> : <ChevronDown className="w-4 h-4 text-[#a1a1aa]" />}
    </button>
);

const RevenueChart = ({ timeSeries, stats }: { timeSeries: FinanceDashboardData['timeSeries'], stats: FinanceDashboardData['stats'] }) => {
    const [chartMode, setChartMode] = useState<'bar' | 'line'>('bar');
    const [interval, setInterval] = useState<'daily' | 'monthly' | 'yearly'>('daily');

    const processedData = useMemo(() => {
        if (!timeSeries) return [];
        if (interval === 'daily') {
            return timeSeries.map(d => {
                const date = new Date(d.date);
                return {
                    ...d,
                    label: date.getDate().toString(), // Just day
                    fullDate: d.date
                };
            });
        }

        const aggregated: Record<string, { revenue: number, label: string, fullDate: string }> = {};
        timeSeries.forEach(d => {
            const date = new Date(d.date);
            const key = interval === 'monthly'
                ? `${date.toLocaleString('default', { month: 'short' })}`
                : `${date.getFullYear()}`;

            if (!aggregated[key]) {
                aggregated[key] = {
                    revenue: 0,
                    label: key,
                    fullDate: interval === 'monthly' ? `${key} ${date.getFullYear()}` : key
                };
            }
            aggregated[key].revenue += d.revenue;
        });

        return Object.values(aggregated);
    }, [timeSeries, interval]);

    if (!processedData || processedData.length === 0) return (
        <div className="h-[320px] flex items-center justify-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
            <p className="text-sm text-gray-400">No data available for the selected period</p>
        </div>
    );

    const maxRevenue = Math.max(...processedData.map(d => d.revenue), 100);
    const chartMax = maxRevenue * 1.15; // 15% headroom

    return (
        <div className="bg-white rounded-xl border border-gray-100 p-4 md:p-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.01)] hover:border-gray-200 transition-all overflow-hidden relative">
            {/* Soft Background Gradient */}
            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-gray-50/50 to-transparent pointer-events-none" />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 md:mb-10 gap-6 relative z-10">
                <div>
                    <h3 className="font-semibold text-base text-[#242424]">Revenue Analytics</h3>
                    <p className="text-[11px] text-[#71717a] font-normal uppercase tracking-wider">Financial performance visualization</p>
                </div>

                <div className="flex flex-wrap items-center gap-3 bg-gray-50/80 p-1.5 rounded-2xl w-full sm:w-auto">
                    <div className="relative flex items-center bg-white rounded-xl shadow-sm p-0.5 border border-gray-100 flex-1 sm:flex-none">
                        <motion.div
                            layoutId="chartTab"
                            className="absolute inset-y-0.5 bg-[#242424] rounded-lg z-0"
                            initial={false}
                            animate={{
                                left: chartMode === 'bar' ? '2px' : '50%',
                                right: chartMode === 'bar' ? '50%' : '2px'
                            }}
                            transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
                        />
                        <button
                            onClick={() => setChartMode('bar')}
                            className={`relative z-10 flex-1 sm:flex-none px-4 py-2 flex items-center justify-center gap-2 text-[11px] font-semibold transition-colors ${chartMode === 'bar' ? 'text-white' : 'text-[#a1a1aa] hover:text-[#242424]'}`}
                        >
                            <BarChart3 className="w-3.5 h-3.5" />
                            <span className="hidden xs:inline">Bar</span>
                        </button>
                        <button
                            onClick={() => setChartMode('line')}
                            className={`relative z-10 flex-1 sm:flex-none px-4 py-2 flex items-center justify-center gap-2 text-[11px] font-semibold transition-colors ${chartMode === 'line' ? 'text-white' : 'text-[#a1a1aa] hover:text-[#242424]'}`}
                        >
                            <LineChartIcon className="w-3.5 h-3.5" />
                            <span className="hidden xs:inline">Line</span>
                        </button>
                    </div>

                    <div className="hidden xs:block h-5 w-px bg-gray-200 mx-1" />

                    <div className="flex items-center gap-1 flex-1 sm:flex-none">
                        {(['daily', 'monthly', 'yearly'] as const).map((int) => (
                            <button
                                key={int}
                                onClick={() => setInterval(int)}
                                className={`flex-1 sm:flex-none px-3 py-2 rounded-xl text-[10px] font-semibold uppercase tracking-widest transition-all ${interval === int ? 'bg-white text-[#242424] shadow-sm border border-gray-100' : 'text-[#a1a1aa] hover:text-[#242424]'}`}
                            >
                                {int[0]}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="h-[260px] md:h-[320px] w-full relative z-10 flex flex-col">
                <AnimatePresence mode="wait">
                    {chartMode === 'bar' ? (
                        <motion.div
                            key="bar"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex-1 flex flex-col"
                        >
                            <div className="flex-1 flex items-end justify-between gap-1 md:gap-2 px-1 pt-10">
                                {processedData.map((d, i) => {
                                    const heightPercent = (d.revenue / chartMax) * 100;
                                    return (
                                        <div key={i} className="relative flex-1 flex flex-col items-center group h-full justify-end min-w-0">
                                            {/* Static Amount Label */}
                                            <div className="absolute transition-all duration-300" style={{ bottom: `${heightPercent + 2}%` }}>
                                                <span className="text-[7px] md:text-[8px] font-semibold text-[#a1a1aa] group-hover:text-[#242424] whitespace-nowrap">
                                                    {d.revenue >= 1000 ? `${(d.revenue / 1000).toFixed(1)}k` : d.revenue}
                                                </span>
                                            </div>

                                            {/* Tooltip on Hover */}
                                            <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-[#242424] text-white text-[10px] font-semibold px-3 py-2 rounded-xl opacity-0 group-hover:opacity-100 transition-all whitespace-nowrap z-[150] shadow-2xl pointer-events-none scale-75 group-hover:scale-100">
                                                <div className="text-[8px] text-gray-400 font-semibold uppercase mb-0.5 tracking-widest">{d.fullDate}</div>
                                                रु {d.revenue.toLocaleString()}
                                                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-[#242424]"></div>
                                            </div>

                                            <motion.div
                                                initial={{ height: 0 }}
                                                animate={{ height: `${Math.max(heightPercent, 2)}%` }}
                                                className={`w-full max-w-[28px] rounded-t-[4px] relative overflow-hidden ${heightPercent > 0 ? 'bg-[#242424] group-hover:bg-blue-600' : 'bg-gray-100'}`}
                                            >
                                                {heightPercent > 0 && <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />}
                                            </motion.div>
                                        </div>
                                    );
                                })}
                            </div>
                            <div className="h-6 flex justify-between items-center mt-3 px-1 text-[8px] md:text-[9px] font-semibold text-[#a1a1aa] uppercase tracking-widest border-t border-gray-50 pt-2">
                                {processedData.map((d, i) => (
                                    <span key={i} className="flex-1 text-center truncate">{d.label}</span>
                                ))}
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="line"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex-1 flex flex-col"
                        >
                            <div className="flex-1 flex gap-2 md:gap-4 min-h-0">
                                {/* Y-Axis - Precise Alignment                                 <div className="flex flex-col justify-between py-6 text-[8px] md:text-[9px] font-semibold text-[#a1a1aa] uppercase tracking-tighter w-8 md:w-14 text-right select-none relative">
                                    {[1, 0.75, 0.5, 0.25, 0].map((step) => {
                                        const val = chartMax * step;
                                        const formatted = val >= 10000
                                            ? `रु ${(val / 1000).toFixed(step === 0 ? 0 : 1)}k`
                                            : `रु ${Math.round(val).toLocaleString()}`;
                                        return (
                                            <div key={step} className="h-0 flex items-center justify-end">
                                                <span className="whitespace-nowrap">{formatted}</span>
                                            </div>
                                        );
                                    })}
                                </div>
     </div>

                                {/* Main Chart & X-Axis Column */}
                                <div className="flex-1 flex flex-col min-w-0">
                                    <div className="flex-1 relative">
                                        {/* Grid Lines */}
                                        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20 py-6">
                                            {[0, 1, 2, 3, 4].map(i => <div key={i} className="w-full border-t border-gray-100"></div>)}
                                        </div>

                                        {/* Canvas with Bleed */}
                                        <div className="absolute inset-x-2 inset-y-6">
                                            <svg className="w-full h-full overflow-visible" viewBox="-4 0 1008 100" preserveAspectRatio="none">
                                                <defs>
                                                    <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="0%" stopColor="#242424" stopOpacity="0.08" />
                                                        <stop offset="100%" stopColor="#242424" stopOpacity="0" />
                                                    </linearGradient>
                                                </defs>

                                                <motion.path
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    d={`${processedData.map((d, i) => {
                                                        const safeLength = Math.max(processedData.length - 1, 1);
                                                        const x = (i / safeLength) * 1000;
                                                        const y = 100 - ((d.revenue / chartMax) * 100);
                                                        if (i === 0) return `M ${x} ${y}`;
                                                        const prevX = ((i - 1) / safeLength) * 1000;
                                                        const prevY = 100 - ((processedData[i - 1].revenue / chartMax) * 100);
                                                        const cpX1 = prevX + (x - prevX) / 2;
                                                        return `C ${cpX1} ${prevY}, ${cpX1} ${y}, ${x} ${y}`;
                                                    }).join(' ')} L 1000 100 L 0 100 Z`}
                                                    fill="url(#areaGradient)"
                                                />

                                                <motion.path
                                                    initial={{ pathLength: 0, opacity: 0 }}
                                                    animate={{ pathLength: 1, opacity: 1 }}
                                                    transition={{ duration: 1.5, ease: "easeInOut" }}
                                                    d={processedData.map((d, i) => {
                                                        const safeLength = Math.max(processedData.length - 1, 1);
                                                        const x = (i / safeLength) * 1000;
                                                        const y = 100 - ((d.revenue / chartMax) * 100);
                                                        if (i === 0) return `M ${x} ${y}`;
                                                        const prevX = ((i - 1) / safeLength) * 1000;
                                                        const prevY = 100 - ((processedData[i - 1].revenue / chartMax) * 100);
                                                        const cpX1 = prevX + (x - prevX) / 2;
                                                        return `C ${cpX1} ${prevY}, ${cpX1} ${y}, ${x} ${y}`;
                                                    }).join(' ')}
                                                    fill="none"
                                                    stroke="#242424"
                                                    strokeWidth="2.2"
                                                    vectorEffect="non-scaling-stroke"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                />
                                            </svg>

                                            {/* Interaction Dots */}
                                            <div className="absolute inset-0 pointer-events-none">
                                                {processedData.map((d, i) => {
                                                    const safeLength = Math.max(processedData.length - 1, 1);
                                                    const left = (i / safeLength) * 100;
                                                    const top = 100 - ((d.revenue / chartMax) * 100);
                                                    return (
                                                        <div
                                                            key={i}
                                                            className="absolute group pointer-events-auto"
                                                            style={{ left: `${left}%`, top: `${top}%`, transform: 'translate(-50%, -50%)' }}
                                                        >
                                                            <div className="w-2.5 h-2.5 bg-[#242424] rounded-full border-2 border-white shadow-sm transition-all group-hover:scale-150 cursor-pointer" />
                                                            <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-[#242424] text-white text-[10px] font-semibold px-3 py-2 rounded-xl opacity-0 group-hover:opacity-100 transition-all whitespace-nowrap z-[150] shadow-2xl pointer-events-none scale-75 group-hover:scale-100">
                                                                <div className="text-[8px] text-[#a1a1aa] font-semibold uppercase mb-0.5 tracking-widest">{d.fullDate}</div>
                                                                रु {d.revenue.toLocaleString()}
                                                                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-[#242424]"></div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>

                                    {/* X-Axis labels mathematically aligned with dots */}
                                    <div className="h-6 relative mt-4 mx-2">
                                        {processedData.map((d, i) => {
                                            const safeLength = Math.max(processedData.length - 1, 1);
                                            const left = (i / safeLength) * 100;
                                            return (
                                                <span
                                                    key={i}
                                                    className="absolute -translate-x-1/2 text-[8px] md:text-[9px] font-semibold text-[#a1a1aa] uppercase tracking-widest whitespace-nowrap"
                                                    style={{ left: `${left}%` }}
                                                >
                                                    {d.label}
                                                </span>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <div className="mt-12 flex justify-between text-[8px] md:text-[10px] font-semibold text-[#a1a1aa] uppercase tracking-widest border-t border-gray-100 pt-5 relative z-10">
                <span className="bg-gray-100 px-3 py-1 rounded-full">{processedData[0].fullDate || processedData[0].label}</span>
                <span className="bg-gray-100 px-3 py-1 rounded-full">{processedData[processedData.length - 1].fullDate || processedData[processedData.length - 1].label}</span>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-3 gap-6 relative z-10">
                <div className="flex flex-col">
                    <span className="text-[9px] font-semibold text-[#a1a1aa] uppercase tracking-[0.15em] mb-2">Delivered (Period)</span>
                    <span className="text-xl md:text-2xl font-semibold text-[#242424] tracking-tight">रु {processedData.reduce((acc, d) => acc + d.revenue, 0).toLocaleString()}</span>
                    <p className="text-[9px] text-[#a1a1aa] mt-1 uppercase font-semibold">Successfully Delivered</p>
                </div>
                <div className="flex flex-col border-l-0 sm:border-l border-gray-100 pl-0 sm:pl-6">
                    <span className="text-[9px] font-semibold text-[#a1a1aa] uppercase tracking-[0.15em] mb-2">Total Orders Value</span>
                    <span className="text-xl md:text-2xl font-semibold text-blue-600 tracking-tight">रु {stats.totalGrossRevenue.toLocaleString()}</span>
                    <p className="text-[9px] text-[#a1a1aa] mt-1 uppercase font-semibold">All Orders (Excl. Cancelled)</p>
                </div>
                <div className="flex flex-col border-l-0 sm:border-l border-gray-100 pl-0 sm:pl-6">
                    <span className="text-[9px] font-semibold text-[#a1a1aa] uppercase tracking-[0.15em] mb-2">Overall Receivables</span>
                    <span className="text-xl md:text-2xl font-semibold text-amber-600 tracking-tight">रु {stats.totalPendingRevenue.toLocaleString()}</span>
                    <p className="text-[9px] text-[#a1a1aa] mt-1 uppercase font-semibold">Pending Collection</p>
                </div>
            </div>
        </div>
    );
};

export default function FinanceClient() {
    const [isMounted, setIsMounted] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [data, setData] = useState<FinanceDashboardData | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [status, setStatus] = useState('all');
    const [datePreset, setDatePreset] = useState('30d');
    const [dateRange, setDateRange] = useState({
        start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        end: new Date().toISOString().split('T')[0]
    });
    const [openSections, setOpenSections] = useState<Record<string, boolean>>({
        revenue: true,
        expenses: false,
        payment: false
    });

    const { showAdminToast } = useAdminToast();

    const calculateDateFromPreset = (preset: string) => {
        const end = new Date();
        let start = new Date();

        switch (preset) {
            case '7d':
                start.setDate(end.getDate() - 7);
                break;
            case '30d':
                start.setDate(end.getDate() - 30);
                break;
            case '90d':
                start.setDate(end.getDate() - 90);
                break;
            case '1y':
                start.setFullYear(end.getFullYear() - 1);
                break;
            case 'all_time':
                start = new Date('2020-01-01');
                break;
            default:
                return;
        }

        setDateRange({
            start: start.toISOString().split('T')[0],
            end: end.toISOString().split('T')[0]
        });
    };

    const handleDatePresetChange = (preset: string) => {
        setDatePreset(preset);
        if (preset !== 'custom') {
            calculateDateFromPreset(preset);
        }
    };

    const loadFinanceData = async () => {
        setIsLoading(true);
        try {
            const result = await fetchFinanceDashboardDataAction(dateRange.start, dateRange.end);
            if (result.success && result.data) {
                setData(result.data);
            } else {
                showAdminToast(result.message || 'Failed to load financial data', 'error');
            }
        } catch (error) {
            console.error('Error loading finance data:', error);
            showAdminToast('An unexpected error occurred', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        setIsMounted(true);
        loadFinanceData();
    }, [dateRange]);

    const toggleSection = (id: string) => {
        setOpenSections(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const handleResetFilters = () => {
        setDatePreset('30d');
        calculateDateFromPreset('30d');
        setStatus('all');
        setSearchQuery('');
    };

    const filteredTransactions = useMemo(() => {
        if (!data?.recentTransactions) return [];
        return data.recentTransactions.filter(tx => {
            const matchesSearch = tx.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
                tx.id.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesStatus = status === 'all' || tx.status.toLowerCase() === status.toLowerCase();
            return matchesSearch && matchesStatus;
        });
    }, [data, searchQuery, status]);

    if (!isMounted) return null;

    return (
        <div className="flex flex-col h-full bg-white rounded-[12px] overflow-hidden font-rubik tracking-tight">

            <DynamicAdminNav />

            <AdminSubNav
                onSearch={setSearchQuery}
                searchPlaceholder="Search transactions..."
                searchOnLeft={true}
                onRefresh={loadFinanceData}
                refreshLoading={isLoading}
                filterDropdown={
                    <div className="flex items-center gap-3">
                        {(datePreset === 'custom') && (
                            <div className="hidden lg:flex items-center bg-gray-100 rounded-xl px-3 py-1.5 gap-2 border border-transparent focus-within:border-gray-200 transition-all shadow-sm">
                                <Calendar className="w-3.5 h-3.5 text-gray-400" />
                                <input
                                    type="date"
                                    value={dateRange.start}
                                    onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                                    className="bg-transparent text-[11px] font-bold outline-none text-[#242424] w-28"
                                />
                                <span className="text-[#a1a1aa] text-[10px] font-bold uppercase">To</span>
                                <input
                                    type="date"
                                    value={dateRange.end}
                                    onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                                    className="bg-transparent text-[11px] font-bold outline-none text-[#242424] w-28"
                                />
                            </div>
                        )}

                        <FinanceFilters
                            datePreset={datePreset}
                            onDatePresetChange={handleDatePresetChange}
                            status={status}
                            onStatusChange={setStatus}
                            onReset={handleResetFilters}
                        />
                    </div>
                }
            />

            <div className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto pb-[200px] flex flex-col gap-8 md:gap-10">
                {isLoading ? (
                    <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="h-32 bg-gray-50 rounded-xl animate-pulse border border-gray-100"></div>
                        ))}
                    </div>
                ) : data && (
                    <>
                        {!searchQuery && (
                            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                                <MetricCard
                                    title="Gross Revenue"
                                    value={`रु ${data.stats.totalDeliveredRevenue.toLocaleString()}`}
                                    subValue={`${data.stats.totalOrders} Total Orders`}
                                    icon={TrendingUp}
                                    trend={12.5}
                                />
                                <MetricCard
                                    title="Net Revenue"
                                    value={`रु ${data.stats.totalNetRevenue.toLocaleString()}`}
                                    subValue={data.stats.totalDeliveredPendingRevenue > 0 
                                        ? `रु ${data.stats.totalDeliveredPendingRevenue.toLocaleString()} Pending` 
                                        : "Paid & Delivered"
                                    }
                                    icon={Wallet}
                                />
                                <MetricCard
                                    title="Avg Order"
                                    value={`रु ${Math.round(data.stats.avgOrderValue).toLocaleString()}`}
                                    subValue="Per sale"
                                    icon={ShoppingBag}
                                    trend={5.2}
                                />
                                <MetricCard
                                    title="Coupons"
                                    value={`रु ${data.stats.totalCouponDiscount.toLocaleString()}`}
                                    subValue="Given out"
                                    icon={Tag}
                                />
                            </div>
                        )}

                        {!searchQuery && (
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-10">
                                {/* Main Revenue Chart */}
                                <div className="lg:col-span-2">
                                    <RevenueChart timeSeries={data.timeSeries} stats={data.stats} />
                                </div>

                                {/* Finance Detail Breakdown */}
                                <div className="space-y-6">
                                    <div className="bg-white rounded-xl border border-gray-100 p-5 md:p-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.02)]">
                                        <h3 className="font-bold text-base text-[#242424] mb-6 flex items-center gap-2">
                                            <Activity className="w-4 h-4 text-[#242424]" />
                                            Finance Insights
                                        </h3>

                                        <div className="divide-y divide-gray-50">
                                            <div className="py-1 md:py-2">
                                                <SectionHeader
                                                    title="Revenue Distribution"
                                                    description="Gross vs Fees"
                                                    isOpen={openSections.revenue}
                                                    onToggle={() => toggleSection('revenue')}
                                                />
                                                <AnimatePresence>
                                                    {openSections.revenue && (
                                                        <motion.div
                                                            initial={{ height: 0, opacity: 0 }}
                                                            animate={{ height: "auto", opacity: 1 }}
                                                            exit={{ height: 0, opacity: 0 }}
                                                            className="overflow-hidden space-y-3 pb-4"
                                                        >
                                                            <div className="flex justify-between items-center text-[11px]">
                                                                <span className="text-[#71717a] font-medium">Gross Sales</span>
                                                                <span className="text-[#242424] font-semibold">रु {data.stats.totalGrossRevenue.toLocaleString()}</span>
                                                            </div>
                                                            <div className="flex justify-between items-center text-[11px]">
                                                                <span className="text-[#71717a] font-medium">COD Collection Fees</span>
                                                                <span className="text-[#242424] font-semibold">रु {data.stats.totalCodFees.toLocaleString()}</span>
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>

                                            <div className="py-1 md:py-2">
                                                <SectionHeader
                                                    title="Cost & Discounts"
                                                    description="Coupons/Delivery"
                                                    isOpen={openSections.expenses}
                                                    onToggle={() => toggleSection('expenses')}
                                                />
                                                <AnimatePresence>
                                                    {openSections.expenses && (
                                                        <motion.div
                                                            initial={{ height: 0, opacity: 0 }}
                                                            animate={{ height: "auto", opacity: 1 }}
                                                            exit={{ height: 0, opacity: 0 }}
                                                            className="overflow-hidden space-y-3 pb-4"
                                                        >
                                                            <div className="flex justify-between items-center text-[11px]">
                                                                <span className="text-[#71717a] font-medium">Coupons Applied</span>
                                                                <span className="text-red-500 font-semibold">- रु {data.stats.totalCouponDiscount.toLocaleString()}</span>
                                                            </div>
                                                            <div className="flex justify-between items-center text-[11px]">
                                                                <span className="text-[#71717a] font-medium">Delivery Charges</span>
                                                                <span className="text-green-600 font-semibold">रु {data.stats.totalDeliveryCharges.toLocaleString()}</span>
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>

                                            <div className="py-1 md:py-2">
                                                <SectionHeader
                                                    title="Payment Channels"
                                                    description="Distribution"
                                                    isOpen={openSections.payment}
                                                    onToggle={() => toggleSection('payment')}
                                                />
                                                <AnimatePresence>
                                                    {openSections.payment && (
                                                        <motion.div
                                                            initial={{ height: 0, opacity: 0 }}
                                                            animate={{ height: "auto", opacity: 1 }}
                                                            exit={{ height: 0, opacity: 0 }}
                                                            className="overflow-hidden space-y-4 pb-4"
                                                        >
                                                            {(() => {
                                                                const qrMethods = data.paymentMethods.filter(m => 
                                                                    m.method.toLowerCase().includes('qr')
                                                                );
                                                                const nonQrMethods = data.paymentMethods.filter(m => 
                                                                    !m.method.toLowerCase().includes('qr')
                                                                );
                                                                
                                                                const qrTotalAmount = qrMethods.reduce((acc, m) => acc + m.amount, 0);

                                                                return (
                                                                    <>
                                                                        {qrMethods.length > 0 && (
                                                                            <>
                                                                                <div className="flex justify-between items-center text-[11px] mb-3 px-1">
                                                                                    <span className="text-[#242424] font-semibold uppercase tracking-wider">
                                                                                        QR (Combined)
                                                                                    </span>
                                                                                    <span className="text-[#242424] font-semibold text-[13px]">रु {qrTotalAmount.toLocaleString()}</span>
                                                                                </div>
                                                                                <div className="space-y-2 mb-8">
                                                                                    {qrMethods.map((m, i) => (
                                                                                        <div key={i} className="bg-gray-50/80 p-4 rounded-xl border-b border-gray-100 last:border-b-0 space-y-2">
                                                                                            <div className="flex justify-between items-center text-[10px]">
                                                                                                <span className="text-gray-600 font-semibold uppercase tracking-wider">{m.method}</span>
                                                                                                <span className="text-[#242424] font-semibold">रु {m.amount.toLocaleString()}</span>
                                                                                            </div>
                                                                                            <div className="w-full h-1.5 bg-white rounded-full overflow-hidden border border-gray-100">
                                                                                                <motion.div
                                                                                                    initial={{ width: 0 }}
                                                                                                    animate={{ width: `${(m.amount / data.stats.totalGrossRevenue) * 100}%` }}
                                                                                                    className="h-full bg-[#242424] rounded-full"
                                                                                                ></motion.div>
                                                                                            </div>
                                                                                            <div className="text-[8px] text-[#a1a1aa] font-semibold uppercase tracking-tighter">{m.count} Sales</div>
                                                                                        </div>
                                                                                    ))}
                                                                                </div>
                                                                            </>
                                                                        )}
                                                                        {nonQrMethods.map((m, i) => (
                                                                            <div key={i} className="space-y-2 px-1 mb-6 last:mb-0">
                                                                                <div className="flex justify-between items-center text-[11px]">
                                                                                    <span className="text-[#242424] font-semibold uppercase tracking-wider">{m.method}</span>
                                                                                    <span className="text-[#242424] font-semibold text-[13px]">रु {m.amount.toLocaleString()}</span>
                                                                                </div>
                                                                                <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden">
                                                                                    <motion.div
                                                                                        initial={{ width: 0 }}
                                                                                        animate={{ width: `${(m.amount / data.stats.totalGrossRevenue) * 100}%` }}
                                                                                        className="h-full bg-[#242424] rounded-full"
                                                                                    ></motion.div>
                                                                                </div>
                                                                                <div className="text-[9px] text-[#a1a1aa] font-semibold uppercase">{m.count} Sales</div>
                                                                            </div>
                                                                        ))}
                                                                    </>
                                                                );
                                                            })()}
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Recent Transactions Section */}
                        <div className="grid grid-cols-1">
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_1px_3px_0_rgba(0,0,0,0.02)] overflow-hidden">
                                <div className="px-6 py-5 border-b border-gray-50 flex items-center justify-between bg-gray-50/20">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-white rounded-xl border border-gray-100">
                                            <History className="w-4 h-4 text-gray-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-base text-[#242424]">Recent Transactions</h3>
                                            <p className="text-[11px] text-[#71717a] font-normal uppercase tracking-wider">Audit trail</p>
                                        </div>
                                    </div>
                                    <button className="text-[11px] font-semibold text-blue-600 flex items-center gap-1 hover:underline">
                                        Export
                                        <Download className="w-3 h-3" />
                                    </button>
                                </div>
                                {searchQuery && (
                                    <div className="px-6 py-4 bg-[#bef264]/10 border-b border-[#bef264]/20">
                                        <p className="text-[11px] font-semibold text-[#242424] uppercase tracking-wider">
                                            Search Results for "{searchQuery}" — {filteredTransactions.length} found
                                        </p>
                                    </div>
                                )}
                                <div className="overflow-x-auto scrollbar-hide">
                                    <table className="w-full text-left border-collapse min-w-[600px]">
                                        <thead>
                                            <tr className="bg-gray-50/50 text-[#a1a1aa] text-[10px] uppercase tracking-[0.1em] font-semibold">
                                                <th className="px-6 py-5">Customer</th>
                                                <th className="px-6 py-5">Method</th>
                                                <th className="px-6 py-5 text-center">Status</th>
                                                <th className="px-6 py-5">Date</th>
                                                <th className="px-6 py-5 text-right">Amount</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {filteredTransactions.slice(0, 10).map((tx) => (
                                                <tr key={tx.id} className="group hover:bg-gray-50/80 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <div className="flex flex-col">
                                                            <span className="text-[13px] font-semibold text-[#242424] tracking-tight">{tx.customer}</span>
                                                            <span className="text-[10px] text-[#a1a1aa] font-normal uppercase mt-0.5 tracking-wider">#{tx.id.split('-')[0]}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="text-[11px] font-semibold text-[#71717a] uppercase tracking-tighter">{tx.method}</span>
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[9px] font-semibold uppercase tracking-widest ${tx.status.toLowerCase() === 'paid' ? 'bg-green-50 text-green-600' :
                                                            tx.status.toLowerCase() === 'pending' ? 'bg-amber-50 text-amber-600' :
                                                                'bg-red-50 text-red-600'
                                                            }`}>
                                                            {tx.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-[11px] text-[#a1a1aa] font-semibold uppercase">{tx.date}</td>
                                                    <td className="px-6 py-4 text-right text-[14px] font-semibold text-[#242424]">रु {tx.amount.toLocaleString()}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
