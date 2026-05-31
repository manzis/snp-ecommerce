'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';

import type { DynamicMapProps } from './DynamicMap';

// Dynamic import for the actual map wrapper to avoid "window is not defined" Server-Side Rendering errors in Next.js
const DynamicMap = dynamic<DynamicMapProps>(() => import('./DynamicMap'), {
  ssr: false,
  loading: () => <div className="w-full h-full min-h-[300px] bg-[#f1f5f9] animate-pulse flex items-center justify-center text-[#838383] font-rajdhani rounded-[16px]">Loading Map...</div>,
});

interface MapSelectorProps {
  onLocationSelect: (lat: number, lng: number) => void;
  defaultLat?: number;
  defaultLng?: number;
}

const MapSelector: React.FC<MapSelectorProps> = ({ onLocationSelect, defaultLat = 27.7172, defaultLng = 85.3240 }) => {
  return (
    <div className="w-full h-full flex flex-col shrink-0 min-h-0">
      <DynamicMap
        defaultLat={defaultLat}
        defaultLng={defaultLng}
        onLocationSelect={onLocationSelect}
      />
    </div>
  );
};

export default MapSelector;
