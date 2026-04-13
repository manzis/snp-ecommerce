'use client';

import React, { useRef, useEffect, useState } from 'react';

interface RichTextEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
}

export default function RichTextEditor({
    value,
    onChange,
    placeholder = 'Start writing description...',
    className = ''
}: RichTextEditorProps) {
    const editorRef = useRef<HTMLDivElement>(null);
    const [isFocused, setIsFocused] = useState(false);
    const [activeStates, setActiveStates] = useState<Record<string, boolean>>({});

    const updateActiveStates = () => {
        const states = {
            bold: document.queryCommandState('bold'),
            italic: document.queryCommandState('italic'),
            underline: document.queryCommandState('underline'),
            insertUnorderedList: document.queryCommandState('insertUnorderedList'),
            insertOrderedList: document.queryCommandState('insertOrderedList'),
            h3: document.queryCommandValue('formatBlock') === 'h3',
            p: document.queryCommandValue('formatBlock') === 'p' || document.queryCommandValue('formatBlock') === '',
        };
        setActiveStates(states);
    };

    // Initial value sync and selection listener
    useEffect(() => {
        if (editorRef.current && editorRef.current.innerHTML !== value) {
            editorRef.current.innerHTML = value || '';
        }

        const handleSelectionChange = () => {
            if (isFocused) updateActiveStates();
        };

        document.addEventListener('selectionchange', handleSelectionChange);
        return () => document.removeEventListener('selectionchange', handleSelectionChange);
    }, [isFocused]);

    const execCommand = (command: string, value?: string) => {
        document.execCommand(command, false, value);
        updateActiveStates();
        if (editorRef.current) {
            onChange(editorRef.current.innerHTML);
        }
    };

    const handleInput = () => {
        if (editorRef.current) {
            onChange(editorRef.current.innerHTML);
        }
        updateActiveStates();
    };

    const ToolbarButton = ({ command, icon, label, arg }: any) => {
        const isActive = arg ? activeStates[arg] : activeStates[command];
        return (
            <button
                type="button"
                onClick={() => execCommand(command, arg)}
                className={`p-2 rounded-lg transition-all ${
                    isActive 
                        ? 'bg-[#242424] text-white shadow-sm scale-[0.98]' 
                        : 'hover:bg-gray-100 text-[#71717a] hover:text-[#242424]'
                }`}
                title={label}
            >
                {icon}
            </button>
        );
    };

    return (
        <div className={`relative flex flex-col border border-gray-200 rounded-2xl overflow-hidden bg-white transition-all ${isFocused ? 'ring-2 ring-black/5 border-black/20' : ''} ${className} font-rubik`}>
            {/* Toolbar */}
            <div className="flex items-center gap-1 p-2 border-b border-gray-100 bg-gray-50/50">
                <ToolbarButton 
                    command="bold" 
                    label="Bold" 
                    icon={<BoldIcon className="w-4 h-4" />} 
                />
                <ToolbarButton 
                    command="italic" 
                    label="Italic" 
                    icon={<ItalicIcon className="w-4 h-4" />} 
                />
                <ToolbarButton 
                    command="underline" 
                    label="Underline" 
                    icon={<UnderlineIcon className="w-4 h-4" />} 
                />
                
                <div className="w-[1px] h-4 bg-gray-200 mx-1" />

                <ToolbarButton 
                    command="insertUnorderedList" 
                    label="Bullet List" 
                    icon={<ListIcon className="w-4 h-4" />} 
                />
                <ToolbarButton 
                    command="insertOrderedList" 
                    label="Numbered List" 
                    icon={<OrderedListIcon className="w-4 h-4" />} 
                />

                <div className="w-[1px] h-4 bg-gray-200 mx-1" />

                <ToolbarButton 
                    command="formatBlock" 
                    arg="h3" 
                    label="Heading" 
                    icon={<span className="text-[11px] font-bold">H3</span>} 
                />
                <ToolbarButton 
                    command="formatBlock" 
                    arg="p" 
                    label="Paragraph" 
                    icon={<span className="text-[11px] font-bold">P</span>} 
                />
            </div>

            {/* Editable Area */}
            <div 
                ref={editorRef}
                contentEditable
                onInput={handleInput}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                className="flex-1 min-h-[300px] p-6 outline-none prose prose-sm max-w-none text-[14px] font-regular leading-relaxed text-[#242424]"
            />
            
            {/* Placeholder simulation for contenteditable */}
            {(!value || value === '<br>' || value === '<div><br></div>' || value === '') && !isFocused && (
                <div className="absolute top-[72px] left-6 text-zinc-400 pointer-events-none text-[14px] font-regular">
                    {placeholder}
                </div>
            )}
        </div>
    );
}

// --- Icons ---

function BoldIcon({ className }: { className?: string }) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" /><path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" />
        </svg>
    );
}

function ItalicIcon({ className }: { className?: string }) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <line x1="19" y1="4" x2="10" y2="4" /><line x1="14" y1="20" x2="5" y2="20" /><line x1="15" y1="4" x2="9" y2="20" />
        </svg>
    );
}

function UnderlineIcon({ className }: { className?: string }) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M6 3v7a6 6 0 0 0 6 6 6 6 0 0 0 6-6V3" /><line x1="4" y1="21" x2="20" y2="21" />
        </svg>
    );
}

function ListIcon({ className }: { className?: string }) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" />
        </svg>
    );
}

function OrderedListIcon({ className }: { className?: string }) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <line x1="10" y1="6" x2="21" y2="6" /><line x1="10" y1="12" x2="21" y2="12" /><line x1="10" y1="18" x2="21" y2="18" /><path d="M4 6h1v4" /><path d="M4 10h2" /><path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1" />
        </svg>
    );
}
