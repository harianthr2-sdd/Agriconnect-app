'use client';

import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { TransitMilestone } from '@/types';

// Fix Leaflet icon paths in React / Next.js
const createCustomIcon = (color: string, label: string) => {
  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: `
      <div style="
        background-color: ${color};
        width: 32px;
        height: 32px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: 800;
        font-size: 11px;
        border: 2px solid white;
        box-shadow: 0 4px 10px rgba(0,0,0,0.3);
      ">
        ${label}
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -18],
  });
};

const truckIcon = L.divIcon({
  className: 'custom-truck-marker',
  html: `
    <div style="
      background-color: #1B4332;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #74C69D;
      border: 3px solid #52B788;
      box-shadow: 0 0 15px rgba(82, 183, 136, 0.7);
      animation: pulse 2s infinite;
    ">
      🚚
    </div>
  `,
  iconSize: [40, 40],
  iconAnchor: [20, 20],
  popupAnchor: [0, -22],
});

// Corridor Waypoints: Salem -> Dharmapuri -> Krishnagiri -> Chennai Koyambedu
const CORRIDOR_WAYPOINTS: { name: string; position: [number, number]; label: string; desc: string }[] = [
  {
    name: 'Salem FPO Aggregation Hub',
    position: [11.6643, 78.146],
    label: 'SLM',
    desc: 'Origin farm collection yard (Omalur / Mecheri smallholders)',
  },
  {
    name: 'Dharmapuri Consolidation Yard',
    position: [12.1211, 78.1582],
    label: 'DPI',
    desc: 'Pre-cooling & quality audit checkpoint',
  },
  {
    name: 'Krishnagiri Cold-Depot',
    position: [12.5255, 78.2144],
    label: 'KGI',
    desc: 'NH-44 Express transit reefer telemetry relay',
  },
  {
    name: 'Koyambedu Wholesale Market, Chennai',
    position: [13.0692, 80.1948],
    label: 'CHN',
    desc: 'Destination wholesale receiving bays & escrow clearing',
  },
];

const CORRIDOR_POLYLINE: [number, number][] = [
  [11.6643, 78.146],
  [12.1211, 78.1582],
  [12.5255, 78.2144],
  [12.9056, 79.1333], // Vellore corridor node
  [12.9815, 79.9723], // Sriperumbudur node
  [13.0692, 80.1948], // Koyambedu Chennai
];

// Helper component to auto-pan when truck position changes
function MapRecenter({ position }: { position: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(position, map.getZoom(), { animate: true, duration: 1.2 });
  }, [position, map]);
  return null;
}

interface InteractiveCorridorMapProps {
  currentCoordinates: [number, number];
  currentMilestone: TransitMilestone;
  truckNumber: string;
  reeferTemp: number;
}

export const InteractiveCorridorMap: React.FC<InteractiveCorridorMapProps> = ({
  currentCoordinates,
  currentMilestone,
  truckNumber,
  reeferTemp,
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="h-[400px] w-full rounded-2xl bg-[#E8F5E9] flex items-center justify-center border border-[#B7E4C7]">
        <span className="text-xs font-bold text-[#1B4332] animate-pulse">
          Loading South Indian Agricultural Transit Corridor Map...
        </span>
      </div>
    );
  }

  return (
    <div className="h-[400px] w-full rounded-2xl overflow-hidden border border-[#E5E7EB] shadow-inner relative">
      <MapContainer
        center={currentCoordinates}
        zoom={8}
        scrollWheelZoom={false}
        className="h-full w-full z-0"
      >
        <MapRecenter position={currentCoordinates} />

        {/* Free OpenStreetMap Tiles — zero API keys required */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Route Polyline */}
        <Polyline
          positions={CORRIDOR_POLYLINE}
          pathOptions={{
            color: '#2D6A4F',
            weight: 5,
            opacity: 0.85,
            dashArray: '8, 8',
          }}
        />

        {/* Waypoint Markers */}
        {CORRIDOR_WAYPOINTS.map((wp, idx) => (
          <Marker
            key={idx}
            position={wp.position}
            icon={createCustomIcon(idx === 3 ? '#F39C12' : '#2D6A4F', wp.label)}
          >
            <Popup>
              <div className="p-1 text-xs">
                <p className="font-bold text-[#1B4332]">{wp.name}</p>
                <p className="text-[#4B5563] text-[11px] mt-0.5">{wp.desc}</p>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Real-time moving truck marker */}
        <Marker position={currentCoordinates} icon={truckIcon}>
          <Popup>
            <div className="p-1.5 text-xs space-y-1">
              <p className="font-bold text-[#1B4332]">Reefer Vehicle: {truckNumber}</p>
              <p className="text-[#4B5563]">Status: {currentMilestone}</p>
              <p className="text-[#2D6A4F] font-bold">Cold Temp: {reeferTemp}°C (Optimal)</p>
            </div>
          </Popup>
        </Marker>
      </MapContainer>

      {/* Floating HUD Overlay on Map */}
      <div className="absolute bottom-3 left-3 z-30 bg-white/90 backdrop-blur-md px-3.5 py-2 rounded-xl border border-[#E5E7EB] shadow-md text-xs space-y-0.5">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#52B788] animate-ping" />
          <span className="font-black text-[#1B4332]">Corridor NH-44 / NH-48</span>
        </div>
        <p className="text-[11px] text-[#4B5563]">
          Salem Hub ➔ Dharmapuri ➔ Krishnagiri ➔ Koyambedu Market
        </p>
      </div>
    </div>
  );
};
