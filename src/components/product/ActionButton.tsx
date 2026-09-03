import React, { ComponentProps } from 'react';

type ActionButtonProps = {
  icon: React.ReactNode;
  label: string;
} & ComponentProps<'button'>;

const ActionButton = ({ icon, label, className, ...props }: ActionButtonProps) => {
  return (
    <button
      type="button"
      aria-label={label}
      // blur() on pointerUp is the secret to removing the sticky focus highlight on mobile
      onPointerUp={(e) => e.currentTarget.blur()}
      className={`
        flex h-[42px] w-[42px] items-center justify-center shrink-0 
        rounded-[10px] border border-[#eaebf0] bg-[#ffffff] p-[8px] 
        shadow-[0_1px_2px_0_rgba(16,24,40,0.04)] overflow-hidden
        outline-none focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0
        select-none transition-all duration-150
        
        /* HOVER: Only enabled for desktop/tablet (md and up) */
        md:hover:bg-[#f2f3f5] 
        md:hover:border-[#d1d5db]

        /* TAP/CLICK: Works on all devices, provides gentle feedback */
        active:bg-[#fafbfc]
        active:scale-95
        
        ${className || ''}
      `}
      {...props}
    >
      <div className="flex items-center justify-center w-[20px] h-[20px] shrink-0 pointer-events-none">
        {icon}
      </div>
    </button>
  );
};

export default ActionButton;
