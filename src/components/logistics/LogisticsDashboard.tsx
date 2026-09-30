'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { useApp } from '@/context/AppContext';
import { getProduceByKey } from '@/lib/catalog';
import { PRODUCE_CATALOG } from '@/lib/catalog';
import { ProduceImage } from '@/components/common/ProduceImage';
import {
  Truck,
  Thermometer,
  Droplets,
  Gauge,
  MapPin,
  Clock,
  CheckCircle2,
  Navigation,
  ArrowRight,
  ShieldAlert,
  Sparkles,
  Zap,
} from 'lucide-react';

// SSR-safe dynamic import for Leaflet map component
const InteractiveCorridorMap = dynamic(
  () =>
    import('./InteractiveCorridorMap').then((mod) => mod.InteractiveCorridorMap),
  {
    ssr: false,
    loading: () => (
      <div className="h-[400px] w-full rounded-2xl bg-[#E8F5E9] flex items-center justify-center border border-[#B7E4C7]">
        <span className="text-xs font-bold text-[#1B4332] animate-pulse">
          Initializing Live GPS Corridor Telemetry...
        </span>
      </div>
    ),
  }
);

export const LogisticsDashboard: React.FC = () => {
  const {
    language,
    t,
    transitMission,
    advanceTransitMilestone,
    currentUser,
  } = useApp();

  const { telemetry, milestonesHistory } = transitMission;
  const prod = getProduceByKey(transitMission.produceKey) || PRODUCE_CATALOG[0];

  const isAllDone = telemetry.currentMilestone === 'Settled';

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-300">
      {/* Logistics Fleet Header */}
      <div className="bg-white rounded-2xl p-5 md:p-6 border border-[#E5E7EB] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#1B4332] to-[#2D6A4F] text-white flex items-center justify-center font-black text-lg shadow-md shadow-[#1B4332]/15">
            <Truck className="w-6 h-6 text-[#74C69D]" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg md:text-xl font-black text-[#1B4332]">
                {currentUser.name}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#E8F5E9] text-[#2D6A4F] border border-[#B7E4C7]">
                Fleet ID: {currentUser.identifier}
              </span>
            </div>
            <p className="text-xs text-[#4B5563] mt-0.5 font-medium">
              {currentUser.location} • {t('logisticsSubtitle')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3.5 py-1.5 rounded-xl bg-[#E8F5E9] text-xs font-bold text-[#1B4332] border border-[#B7E4C7] flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#40916C]" />
            Route Optimization Engine Active
          </span>
        </div>
      </div>

      {/* Live Cold-Chain Telemetry HUD */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {/* Reefer Temperature */}
        <div className="bg-white p-4 md:p-5 rounded-2xl border border-[#E5E7EB] shadow-xs">
          <div className="flex items-center justify-between text-[#4B5563] mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">{t('reeferTemp')}</span>
            <Thermometer className="w-4 h-4 text-[#40916C]" />
          </div>
          <p className="text-2xl md:text-3xl font-black text-[#1B4332]">
            {telemetry.reeferTemperature.toFixed(1)}°C
          </p>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="w-2 h-2 rounded-full bg-[#52B788] animate-ping" />
            <span className="text-[11px] text-[#2D6A4F] font-bold">
              Optimal Cold-Chain (8-14°C)
            </span>
          </div>
        </div>

        {/* Relative Humidity */}
        <div className="bg-white p-4 md:p-5 rounded-2xl border border-[#E5E7EB] shadow-xs">
          <div className="flex items-center justify-between text-[#4B5563] mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">{t('relativeHumidity')}</span>
            <Droplets className="w-4 h-4 text-[#0284C7]" />
          </div>
          <p className="text-2xl md:text-3xl font-black text-[#1B4332]">
            {telemetry.relativeHumidity}%
          </p>
          <p className="text-[11px] text-[#40916C] font-semibold mt-1">
            Produce Freshness Preserved
          </p>
        </div>

        {/* Speed */}
        <div className="bg-white p-4 md:p-5 rounded-2xl border border-[#E5E7EB] shadow-xs">
          <div className="flex items-center justify-between text-[#4B5563] mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">{t('vehicleSpeed')}</span>
            <Gauge className="w-4 h-4 text-[#D97706]" />
          </div>
          <p className="text-2xl md:text-3xl font-black text-[#1B4332]">
            {telemetry.vehicleSpeedKmH} <span className="text-xs font-bold text-[#4B5563]">km/h</span>
          </p>
          <p className="text-[11px] text-[#40916C] font-semibold mt-1">
            NH-44 Express Corridor
          </p>
        </div>

        {/* Remaining Distance & ETA */}
        <div className="bg-gradient-to-br from-[#E8F5E9] to-[#D8F3DC] p-4 md:p-5 rounded-2xl border border-[#B7E4C7] shadow-xs">
          <div className="flex items-center justify-between text-[#1B4332] mb-1">
            <span className="text-xs font-black uppercase tracking-wider">{t('remainingDistance')}</span>
            <Navigation className="w-4 h-4 text-[#2D6A4F]" />
          </div>
          <p className="text-2xl md:text-3xl font-black text-[#1B4332]">
            {telemetry.remainingDistanceKm} <span className="text-xs font-bold text-[#1B4332]">km</span>
          </p>
          <p className="text-[11px] text-[#1B4332] font-bold mt-1">
            ETA: {telemetry.etaHours > 0 ? `${telemetry.etaHours} hrs` : 'Arrived at Destination'}
          </p>
        </div>
      </div>

      {/* Main Grid: Interactive Map + Milestone Progression Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 cols: Interactive Leaflet Map */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white rounded-2xl p-5 border border-[#E5E7EB] shadow-xs">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#F3F4F6]">
              <div className="flex items-center gap-2">
                <Navigation className="w-5 h-5 text-[#2D6A4F]" />
                <h2 className="text-base font-black text-[#1B4332]">
                  {t('transitCorridorTitle')}
                </h2>
              </div>
              <span className="text-xs font-bold text-[#2D6A4F] bg-[#E8F5E9] px-2.5 py-1 rounded-full border border-[#B7E4C7]">
                Reefer: {telemetry.truckNumber}
              </span>
            </div>

            {/* Leaflet OpenStreetMap View */}
            <InteractiveCorridorMap
              currentCoordinates={telemetry.currentCoordinates}
              currentMilestone={telemetry.currentMilestone}
              truckNumber={telemetry.truckNumber}
              reeferTemp={telemetry.reeferTemperature}
            />

            <div className="mt-3 p-3 bg-[#F8FAF8] rounded-xl border border-[#E5E7EB] flex items-center justify-between text-xs text-[#4B5563]">
              <span>Assigned Driver: <strong>{telemetry.driverName}</strong></span>
              <span>Cargo: <strong>{prod.name[language] || prod.name.en} ({transitMission.totalWeightKg.toLocaleString()} kg)</strong></span>
            </div>
          </div>
        </div>

        {/* Right 5 cols: Milestone Advancement Stepper & Workflow Trigger */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-2xl p-5 border border-[#E5E7EB] shadow-xs flex flex-col justify-between h-full">
            <div>
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#F3F4F6]">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-[#2D6A4F]" />
                  <h2 className="text-base font-black text-[#1B4332]">
                    {t('milestoneStepperTitle')}
                  </h2>
                </div>
              </div>

              {/* Stepper Timeline */}
              <div className="space-y-4 relative before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#E5E7EB]">
                {milestonesHistory.map((step, idx) => {
                  const isCurrent = telemetry.currentMilestone === step.milestone;
                  const isPast = step.completed;

                  return (
                    <div key={idx} className="relative flex items-start gap-3.5 pl-1">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 z-10 font-bold text-xs transition-all ${
                          isPast
                            ? 'bg-[#1B4332] text-white ring-2 ring-[#74C69D]'
                            : isCurrent
                            ? 'bg-[#52B788] text-[#1B4332] ring-4 ring-[#D8F3DC] animate-pulse'
                            : 'bg-[#F3F4F6] text-[#9CA3AF] border border-[#D1D5DB]'
                        }`}
                      >
                        {isPast ? <CheckCircle2 className="w-4 h-4 text-[#74C69D]" /> : idx + 1}
                      </div>

                      <div className="flex-1">
                        <h4 className={`text-xs font-black ${isPast || isCurrent ? 'text-[#1B4332]' : 'text-[#9CA3AF]'}`}>
                          {t(`milestone${step.milestone}` as string, step.milestone)}
                        </h4>
                        <p className="text-[11px] text-[#4B5563] mt-0.5">
                          {step.locationNote}
                        </p>
                        {step.timestamp !== 'Pending' && (
                          <span className="text-[10px] text-[#6B7280] block mt-0.5 font-mono">
                            {new Date(step.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Advance Milestone CTA */}
            <div className="mt-6 pt-4 border-t border-[#E5E7EB]">
              {!isAllDone ? (
                <button
                  onClick={advanceTransitMilestone}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#1B4332] hover:bg-[#2D6A4F] text-white text-xs font-black shadow-md shadow-[#1B4332]/20 transition-all hover:scale-[1.01]"
                >
                  <span>{t('btnAdvanceMilestone')}</span>
                  <ArrowRight className="w-4 h-4 text-[#74C69D]" />
                </button>
              ) : (
                <div className="p-3 bg-[#E8F5E9] rounded-xl border border-[#B7E4C7] text-center text-xs font-black text-[#1B4332]">
                  🎉 {t('allMilestonesCompleted')}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
