import React from 'react';

interface SkeletonProps {
    className?: string;
    variant?: 'text' | 'circular' | 'rectangular';
    width?: string | number;
    height?: string | number;
}

/**
 * A highly reusable industrial-minimalist Skeleton component with shimmering animation.
 */
const Skeleton: React.FC<SkeletonProps> = ({ 
    className = "", 
    variant = 'rectangular',
    width,
    height 
}) => {
    const baseClass = "animate-pulse bg-zinc-200/60";
    
    // Variant styles
    const variantClasses = {
        text: "rounded h-3 w-full",
        circular: "rounded-full",
        rectangular: "rounded-lg"
    };

    const style: React.CSSProperties = {
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
    };

    return (
        <div 
            className={`${baseClass} ${variantClasses[variant]} ${className}`}
            style={style}
        />
    );
};

export default Skeleton;
