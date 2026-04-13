import React from 'react';
import { HelpCircle, Mail, Book, MessageSquare, ExternalLink } from 'lucide-react';

export default function SupportPage() {
    return (
        <div className="space-y-8 max-w-5xl">
            <div>
                <h1 className="text-3xl font-black text-[#111827] tracking-tight">Help & Support</h1>
                <p className="mt-1 text-sm text-gray-500 font-medium">Find resources and contact information to help you manage your store.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Documentation Card */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 group hover:border-blue-200 transition-all duration-200">
                    <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4">
                        <Book className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Documentation</h3>
                    <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                        Explore our comprehensive guides on managing products, orders, and store settings.
                    </p>
                    <a href="#" className="inline-flex items-center text-sm font-bold text-blue-600 hover:text-blue-700">
                        Read Guides <ExternalLink className="w-4 h-4 ml-2" />
                    </a>
                </div>

                {/* Community/FAQs Card */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 group hover:border-purple-200 transition-all duration-200">
                    <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center mb-4">
                        <HelpCircle className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">FAQs</h3>
                    <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                        Find quick answers to common questions about payouts, shipping, and customer management.
                    </p>
                    <a href="#" className="inline-flex items-center text-sm font-bold text-purple-600 hover:text-purple-700">
                        View FAQs <ExternalLink className="w-4 h-4 ml-2" />
                    </a>
                </div>
            </div>

            {/* Direct Contact Section */}
            <div className="bg-[#f9fafb] p-8 rounded-3xl border border-gray-100">
                <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="max-w-md">
                        <h2 className="text-2xl font-black text-gray-900 mb-4">Still need help?</h2>
                        <p className="text-gray-600 leading-relaxed font-medium">
                            Our support team is available 24/7 to assist you with any technical issues or business inquiries.
                        </p>
                    </div>
                    <div className="flex flex-col gap-4 w-full md:w-auto">
                        <button className="flex items-center justify-center gap-2 px-6 py-3 bg-[#111827] text-white rounded-xl font-bold hover:bg-black transition-colors">
                            <MessageSquare className="w-5 h-5" />
                            Live Chat
                        </button>
                        <button className="flex items-center justify-center gap-2 px-6 py-3 bg-white border border-gray-200 text-gray-900 rounded-xl font-bold hover:bg-gray-50 transition-colors">
                            <Mail className="w-5 h-5" />
                            Email Support
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
