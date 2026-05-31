'use client';

import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { searchLocations, reverseGeocode } from '@/utils/geocode';

// Fix for default Leaflet icons
import 'leaflet-defaulticon-compatibility';
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css';

export interface DynamicMapProps {
  defaultLat: number;
  defaultLng: number;
  onLocationSelect: (lat: number, lng: number) => void;
}

const MapSearchControl: React.FC<{ onLocationSelect: (lat: number, lng: number, name: string) => void }> = ({ onLocationSelect }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.trim().length > 2) {
        const data = await searchLocations(query.trim());
        setResults(data);
        setIsOpen(true);
      } else {
        setResults([]);
        setIsOpen(false);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (lat: string, lon: string, displayName: string) => {
    const numLat = parseFloat(lat);
    const numLon = parseFloat(lon);

    setQuery(displayName.split(',')[0]); // Use short name
    setIsOpen(false);

    onLocationSelect(numLat, numLon, displayName);
  };

  return (
    <div ref={searchContainerRef} className="relative w-full z-[1000] shrink-0">
      {isOpen && results.length > 0 && (
        <div className="absolute bottom-[56px] left-0 w-full bg-white rounded-[10px] shadow-[0_4px_12px_rgba(0,0,0,0.1)] border border-[#eaebf0] overflow-hidden max-h-[250px] overflow-y-auto mb-[8px]">
          {results.map((res: any, idx: number) => (
            <div
              key={idx}
              className="px-[16px] py-[12px] border-b border-[#eaebf0] cursor-pointer hover:bg-[#fafbfb] active:bg-[#f1f5f9] transition-colors last:border-b-0"
              onClick={() => handleSelect(res.lat, res.lon, res.display_name)}
            >
              <p className="font-rajdhani text-[13px] text-[#242424] line-clamp-2 leading-[18px]">
                {res.display_name}
              </p>
            </div>
          ))}
        </div>
      )}

      <div className="relative w-full shadow-[0_4px_16px_rgba(0,0,0,0.08)] rounded-[12px]">
        <input
          type="text"
          placeholder="Search location..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full h-[52px] px-[16px] rounded-[12px] bg-white border border-[#ffffff] font-rajdhani text-[16px] outline-none focus:border-[#242424] focus:border-[1.5px] transition-colors"
        />
        {query && (
          <button
            className="absolute right-[16px] top-[16px] w-[20px] h-[20px] flex items-center justify-center text-[#838383] bg-[#e2e8f0] rounded-full text-[12px] active:scale-95"
            onClick={() => { setQuery(''); setResults([]); setIsOpen(false); }}
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
};

const LocationMarker: React.FC<{
  position: [number, number];
  setPosition: (pos: [number, number]) => void;
  onLocationSelect: (lat: number, lng: number) => void;
}> = ({ position, setPosition, onLocationSelect }) => {
  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });

  return position === null ? null : (
    <Marker position={position}></Marker>
  );
};

const DynamicMap: React.FC<DynamicMapProps> = ({ defaultLat, defaultLng, onLocationSelect }) => {
  const [position, setPosition] = useState<[number, number]>([defaultLat, defaultLng]);
  const [mapRef, setMapRef] = useState<L.Map | null>(null);
  const [displayAddress, setDisplayAddress] = useState('Finding location...');

  useEffect(() => {
    const resolveAddress = async () => {
      setDisplayAddress('Fetching address...');
      const res = await reverseGeocode(position[0], position[1]);
      if (res && res.address_line_1) {
        setDisplayAddress(res.address_line_1);
      } else {
        setDisplayAddress('Unknown location');
      }
    };
    resolveAddress();
  }, [position[0], position[1]]);

  useEffect(() => {
    if (mapRef) {
      // Modals and transitions can cause the map height to be miscalculated (gray tiles). 
      // Force invalidateSize a few times after mount to ensure perfect tile rendering.
      const t1 = setTimeout(() => mapRef.invalidateSize(), 150);
      const t2 = setTimeout(() => mapRef.invalidateSize(), 400);
      return () => { clearTimeout(t1); clearTimeout(t2); };
    }
  }, [mapRef]);

  const handleSearchSelect = (lat: number, lng: number) => {
    setPosition([lat, lng]);
    onLocationSelect(lat, lng);
    if (mapRef) {
      mapRef.flyTo([lat, lng], 15);
    }
  };

  return (
    <div className="flex flex-col w-full h-full gap-[12px]">

      {/* Map display */}
      <div className="flex-1 w-full rounded-[16px] overflow-hidden border border-[#eaebf0] shadow-inner relative z-0 min-h-[300px]">
        <MapContainer
          center={[defaultLat, defaultLng]}
          zoom={14}
          style={{ height: '100%', width: '100%', position: 'relative' }}
          ref={setMapRef}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            keepBuffer={8}
          />
          <LocationMarker position={position} setPosition={setPosition} onLocationSelect={onLocationSelect} />
        </MapContainer>

        {/* Search Input overlaying map at the bottom */}
        <div className="absolute bottom-[16px] left-[16px] right-[16px] z-[1000]">
          <MapSearchControl onLocationSelect={handleSearchSelect} />
        </div>
      </div>

      {/* Selected Address UI Component */}
      <div className="flex flex-col shrink-0 gap-[12px] z-[100]">

        {/* Dynamic Address Label */}
        <div className="flex items-start gap-[12px] bg-[#f7f8f9] p-[16px] rounded-[10px] border border-[#eaebf0]">
          <div className="mt-[2px] text-[#308026] shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
          </div>
          <div className="flex flex-col min-w-0">
 <span className="font-rajdhani font-bold text-[14px] text-[#242424]">Selected Place</span>
            <span className="font-rajdhani text-[13px] text-[#838383] leading-[18px] line-clamp-2">{displayAddress}</span>
          </div>
        </div>

      </div>

    </div>
  );
};

export default DynamicMap;
