'use client';

import React from 'react';
import { motion } from 'framer-motion';
import BankingIcon from '@/components/icons/BankingIcon';
import ArrowUpIcon from '@/components/icons/CaretUpIcon'; // Reusing for trend

const FINANCE_STATS = [
    { label: 'Total Revenue', value: 'रु 45,280.00', trend: '+12.5%', color: 'text-green-600' },
    { label: 'Net Profit', value: 'रु 12,840.00', trend: '+8.2%', color: 'text-green-600' },
    { label: 'Pending Payouts', value: 'रु 5,420.00', trend: '-2.4%', color: 'text-red-600' },
    { label: 'Total Sales', value: '1,240', trend: '+15.0%', color: 'text-green-600' },
];

const TRANSACTIONS = [
    { id: 'TRX-9821', customer: 'Anish Giri', amount: 'रु 1,200.00', date: 'Oct 12, 2023', status: 'Completed' },
    { id: 'TRX-9822', customer: 'Sita Ram', amount: 'रु 2,500.00', date: 'Oct 11, 2023', status: 'Pending' },
    { id: 'TRX-9823', customer: 'Hari Prasad', amount: 'रु 850.00', date: 'Oct 11, 2023', status: 'Completed' },
    { id: 'TRX-9824', customer: 'Maya Thapa', amount: 'रु 4,200.00', date: 'Oct 10, 2023', status: 'Completed' },
    { id: 'TRX-9825', customer: 'Kiran KC', amount: 'रु 150.00', date: 'Oct 10, 2023', status: 'Failed' },
];

export default function FinancePage() {
    return (
        <div className="flex flex-col gap-6 animate-in fade-in duration-500">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {FINANCE_STATS.map((stat, i) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-white p-5 rounded-xl border border-gray-100 shadow-[0_1px_3px_0_rgba(0,0,0,0.02)] hover:shadow-md transition-shadow"
                    >
                        <p className="text-gray-500 text-sm font-medium mb-1">{stat.label}</p>
                        <div className="flex items-end justify-between">
                            <h3 className="text-2xl font-bold font-rubik text-gray-900">{stat.value}</h3>
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${stat.color} bg-opacity-10 bg-current`}>
                                {stat.trend}
                            </span>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Revenue Overview (Chart Placeholder) */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="lg:col-span-2 bg-white rounded-xl border border-gray-100 p-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.02)]"
                >
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold text-lg text-gray-900">Revenue Overview</h3>
                        <select className="bg-gray-50 border border-gray-200 text-gray-600 text-xs rounded-lg px-2 py-1 outline-none">
                            <option>Last 7 Days</option>
                            <option>Last 30 Days</option>
                            <option>Last Year</option>
                        </select>
                    </div>
                    <div className="h-[240px] w-full flex items-center justify-center bg-gray-50 rounded-lg relative overflow-hidden group">
                        <div className="flex items-end gap-3 h-[120px]">
                            {[40, 60, 45, 90, 65, 80, 55].map((h, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ height: 0 }}
                                    animate={{ height: `${h}%` }}
                                    transition={{ delay: 0.5 + (i * 0.1), duration: 0.5 }}
                                    className="w-10 bg-[#bef264] rounded-t-sm"
                                />
                            ))}
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-white/20 backdrop-blur-[2px]">
                            <span className="text-sm font-medium text-gray-900 bg-white px-3 py-1 rounded-full shadow-lg">Metric Chart Loaded</span>
                        </div>
                    </div>
                </motion.div>

                {/* Payout Summary */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-white rounded-xl border border-gray-100 p-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.02)]"
                >
                    <h3 className="font-bold text-lg text-gray-900 mb-6">Payout Information</h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                                    <BankingIcon className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Next Payout</p>
                                    <p className="text-sm font-bold text-gray-900">Oct 15, 2023</p>
                                </div>
                            </div>
                            <p className="text-lg font-bold text-gray-900">रु 420.00</p>
                        </div>
                        
                        <div className="pt-4 border-t border-gray-100">
                            <div className="flex justify-between mb-2">
                                <span className="text-sm text-gray-600">Pending Amount</span>
                                <span className="text-sm font-semibold text-gray-900">रु 5,420.00</span>
                            </div>
                            <div className="flex justify-between mb-2">
                                <span className="text-sm text-gray-600">Processing Fee</span>
                                <span className="text-sm font-semibold text-gray-900">- रु 120.00</span>
                            </div>
                            <div className="flex justify-between pt-2 border-t border-gray-100">
                                <span className="text-sm font-bold text-gray-900">Net Estimated</span>
                                <span className="text-sm font-bold text-gray-900">रु 5,300.00</span>
                            </div>
                        </div>

                        <button className="w-full mt-4 bg-gray-900 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-black transition-colors active:scale-[0.98]">
                            View All Payouts
                        </button>
                    </div>
                </motion.div>
            </div>

            {/* Transactions Table */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-xl border border-gray-100 shadow-[0_1px_3px_0_rgba(0,0,0,0.02)] overflow-hidden"
            >
                <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
                    <h3 className="font-bold text-lg text-gray-900">Recent Transactions</h3>
                    <button className="text-sm text-blue-600 font-medium hover:underline">Download CSV</button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50 text-gray-500 text-[11px] uppercase tracking-wider font-semibold">
                                <th className="px-6 py-3">Transaction ID</th>
                                <th className="px-6 py-3">Customer</th>
                                <th className="px-6 py-3">Date</th>
                                <th className="px-6 py-3">Amount</th>
                                <th className="px-6 py-3">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {TRANSACTIONS.map((tx) => (
                                <tr key={tx.id} className="hover:bg-gray-50 transition-colors group">
                                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{tx.id}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{tx.customer}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{tx.date}</td>
                                    <td className="px-6 py-4 text-sm font-bold text-gray-900">{tx.amount}</td>
                                    <td className="px-6 py-4">
                                        <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full ${
                                            tx.status === 'Completed' ? 'bg-green-100 text-green-700' :
                                            tx.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                                            'bg-red-100 text-red-700'
                                        }`}>
                                            {tx.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </motion.div>
        </div>
    );
}
