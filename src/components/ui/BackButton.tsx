'use client';

import React from 'react';

interface BackButtonProps {
    className?: string;
    children?: React.ReactNode;
}

export default function BackButton({ className, children }: BackButtonProps) {
    return (
        <button 
            onClick={() => window.history.back()}
            className={className}
        >
            {children || 'Go Back'}
        </button>
    );
}
