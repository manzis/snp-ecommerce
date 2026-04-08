'use client';

import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';

// Fix for default Leaflet icons missing in Next.js builds
import 'leaflet-defaulticon-compatibility';
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css';

export interface DynamicMapProps {
  defaultLat: number;
  defaultLng: number;
  onLocationSelect: (lat: number, lng: number) => void;
}

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

  return (
    <MapContainer center={[defaultLat, defaultLng]} zoom={13} style={{ height: '100%', width: '100%' }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <LocationMarker position={position} setPosition={setPosition} onLocationSelect={onLocationSelect} />
    </MapContainer>
  );
};

export default DynamicMap;
