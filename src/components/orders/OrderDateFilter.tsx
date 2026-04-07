import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ChevronLeftIcon from '@/components/icons/ChevronLeftIcon';
import ChevronRightIcon from '@/components/icons/ChevronRightIcon';
import CloseIcon from '@/components/icons/CloseIcon';

interface OrderDateFilterProps {
    isOpen: boolean;
    onClose: () => void;
    onApply: (from: Date | null, to: Date | null) => void;
    initialFrom: Date | null;
    initialTo: Date | null;
}

const OrderDateFilter: React.FC<OrderDateFilterProps> = ({ isOpen, onClose, onApply, initialFrom, initialTo }) => {
    const [currentMonth, setCurrentMonth] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
    const [selectionStart, setSelectionStart] = useState<Date | null>(initialFrom);
    const [selectionEnd, setSelectionEnd] = useState<Date | null>(initialTo);
    const [hoverDate, setHoverDate] = useState<Date | null>(null);
    const [errorMsg, setErrorMsg] = useState('');
    
    // Close on click outside
    const popoverRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
                onClose();
            }
        };
        if (isOpen) document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen, onClose]);

    // Calendar generation
    const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
    const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();

    const days = useMemo(() => {
        const result = [];
        for (let i = 0; i < firstDay; i++) result.push(null);
        for (let i = 1; i <= daysInMonth; i++) result.push(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i));
        return result;
    }, [currentMonth, daysInMonth, firstDay]);

    const handleDateClick = (date: Date) => {
        setErrorMsg('');
        if (!selectionStart || (selectionStart && selectionEnd)) {
            setSelectionStart(date);
            setSelectionEnd(null);
        } else {
            if (date < selectionStart) {
                setSelectionStart(date);
                setSelectionEnd(null);
            } else {
                const diffTime = Math.abs(date.getTime() - selectionStart.getTime());
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
                if (diffDays > 30) {
                    setErrorMsg('Date range cannot exceed 30 days');
                } else {
                    setSelectionEnd(date);
                }
            }
        }
    };

    const isDateInRange = (date: Date) => {
        if (!selectionStart) return false;
        if (selectionStart && selectionEnd) return date >= selectionStart && date <= selectionEnd;
        if (selectionStart && hoverDate && hoverDate > selectionStart) return date >= selectionStart && date <= hoverDate;
        return false;
    };

    const isDateSelected = (date: Date) => {
        return (selectionStart && date.getTime() === selectionStart.getTime()) || (selectionEnd && date.getTime() === selectionEnd.getTime());
    };

    const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
    const prevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));

    const handleApply = () => {
        onApply(selectionStart, selectionEnd);
        onClose();
    };

    const handleReset = () => {
        setSelectionStart(null);
        setSelectionEnd(null);
        setHoverDate(null);
        setErrorMsg('');
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="absolute right-0 top-[60px] z-[100] w-[320px] rounded-[16px] border border-[#f1f5f9] bg-white p-[16px] shadow-[0px_4px_24px_rgba(0,0,0,0.06)]"
                    ref={popoverRef}
                >
                    <div className="flex items-center justify-between pb-[12px] border-b border-[#f1f5f9] mb-[12px]">
                        <h3 className="font-titillium text-[16px] font-[600] text-[#242424]">Filter by Date</h3>
                        <button onClick={onClose} className="p-[4px] opacity-50 hover:opacity-100 transition-opacity">
                            <CloseIcon className="w-[12px] h-[12px] text-[#242424]" />
                        </button>
                    </div>

                    <div className="flex items-center justify-between mb-[16px]">
                        <button onClick={prevMonth} className="flex items-center justify-center w-[28px] h-[28px] rounded-full hover:bg-gray-100 transition-colors">
                            <ChevronLeftIcon className="w-[14px] h-[14px] text-[#242424]" />
                        </button>
                        <span className="font-titillium text-[14px] font-[600] text-[#242424]">
                            {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
                        </span>
                        <button onClick={nextMonth} className="flex items-center justify-center w-[28px] h-[28px] rounded-full hover:bg-gray-100 transition-colors">
                            <ChevronRightIcon className="w-[14px] h-[14px] text-[#242424]" />
                        </button>
                    </div>

                    <div className="grid grid-cols-7 gap-y-[8px] gap-x-[4px] mb-[16px]">
                        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                            <div key={day} className="text-center font-titillium text-[12px] font-[600] text-[#838383]">
                                {day}
                            </div>
                        ))}
                        {days.map((date, idx) => {
                            if (!date) return <div key={`empty-${idx}`} />;
                            const selected = isDateSelected(date);
                            const inRange = isDateInRange(date);
                            const isStart = selectionStart?.getTime() === date.getTime();
                            const isEnd = selectionEnd?.getTime() === date.getTime();

                            return (
                                <button
                                    key={date.toISOString()}
                                    onClick={() => handleDateClick(date)}
                                    onMouseEnter={() => setHoverDate(date)}
                                    onMouseLeave={() => setHoverDate(null)}
                                    className={`relative flex items-center justify-center w-[36px] h-[36px] text-[13px] font-titillium transition-all
                                        ${selected ? 'font-[600] text-white z-10' : 'text-[#242424] hover:bg-gray-100'}
                                    `}
                                >
                                    {inRange && !selected && (
                                        <div className="absolute inset-0 bg-[#eaffcc] opacity-50 z-0"></div>
                                    )}
                                    {inRange && selected && isStart && selectionEnd && (
                                        <div className="absolute inset-0 bg-[#eaffcc] opacity-50 z-0 left-1/2 w-1/2"></div>
                                    )}
                                    {inRange && selected && isEnd && (
                                        <div className="absolute inset-0 bg-[#eaffcc] opacity-50 z-0 right-1/2 w-1/2"></div>
                                    )}
                                    
                                    {selected && (
                                        <div className="absolute inset-[4px] rounded-full bg-[#308026] z-0"></div>
                                    )}
                                    <span className="relative z-10">{date.getDate()}</span>
                                </button>
                            );
                        })}
                    </div>

                    {errorMsg && (
                        <p className="font-titillium text-[12px] text-[#d92d20] mb-[12px] text-center">{errorMsg}</p>
                    )}

                    <div className="flex items-center gap-[8px] justify-between border-t border-[#f1f5f9] pt-[12px]">
                        <button 
                            onClick={handleReset}
                            className="font-titillium text-[13px] font-[600] text-[#838383] hover:text-[#242424] transition-colors"
                        >
                            Reset
                        </button>
                        <button 
                            onClick={handleApply}
                            className="bg-[#308026] text-white font-titillium text-[14px] font-[600] px-[16px] py-[8px] rounded-[8px] hover:bg-opacity-90 transition-opacity active:scale-95"
                        >
                            Apply Filter
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default OrderDateFilter;
