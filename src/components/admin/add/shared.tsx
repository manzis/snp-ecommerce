import React from 'react';

export function ErrorText({ children, show }: { children: React.ReactNode, show?: boolean }) {
    if (show === false) return null;
    return <p data-error="true" className="text-[11px] text-red-500 mt-1 font-regular">{children}</p>;
}
