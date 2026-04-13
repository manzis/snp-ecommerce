'use client';

import React from 'react';
import SaveIcon from '@/components/icons/TickIcon';

interface MobileFloatingControlsProps {
    activeTab: string;
    tabs: { id: string; label: string }[];
    onNext: () => void;
    onSave: () => void;
    onDiscard: () => void;
}

export default function MobileFloatingControls({
    activeTab,
    tabs,
    onNext,
    onSave,
    onDiscard
}: MobileFloatingControlsProps) {
    const isLastTab = activeTab === tabs[tabs.length - 1].id;

    return (
        <div className="lg:hidden fixed bottom-[75px] right-0 z-[200] w-[60%] pointer-events-none">
            <div className="flex items-center gap-[4px] h-[54px] w-[200px] bg-white backdrop-blur-md border border-gray-100 p-[4px] rounded-[16px] shadow-[0_8px_24px_rgb(0,0,0,0.1)] pointer-events-auto">
                <button
                    onClick={onDiscard}
                    className="flex h-full w-full items-center justify-center text-[11.5px] font-medium text-[#71717a] hover:text-[#242424] transition-colors  rounded-[12px]"
                >
                    Discard
                </button>
                <button
                    onClick={isLastTab ? onSave : onNext}
                    className="flex h-full w-[260px] items-center justify-center bg-[#242424] text-white text-[11.5px] font-medium rounded-[12px] hover:bg-black transition-all active:scale-95 shadow-md shadow-black/5 flex items-center justify-center gap-1.5"
                >
                    {isLastTab ? (
                        <>
                            <SaveIcon className="w-3.5 h-3.5" />
                            <span>Create</span>
                        </>
                    ) : (
                        <>
                            <span>Next</span>
                            <ArrowRightIcon className="w-3.5 h-3.5" />
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}

function ArrowRightIcon({ className }: { className?: string }) {
    return (
        <svg fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className={className}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
        </svg>
    );
}
