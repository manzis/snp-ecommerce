import React from 'react';

export default function StoreLoading() {
  return (
    <div className="relative min-h-screen w-full bg-[#081908] flex items-center justify-center">
      <div className="flex flex-col items-center justify-center gap-4">
        {/* Simple minimal spinner that fits the brand color */}
        <div className="w-10 h-10 border-4 border-[#308026]/30 border-t-[#95FF00] rounded-full animate-spin"></div>
      </div>
    </div>
  );
}
