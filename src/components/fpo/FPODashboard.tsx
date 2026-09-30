'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { PRODUCE_CATALOG, getProduceByKey } from '@/lib/catalog';
import { ProduceImage } from '@/components/common/ProduceImage';
import {
  Building2,
  CheckCircle2,
  Layers,
  Sparkles,
  MapPin,
  Scale,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  Boxes,
  Truck,
  Check,
} from 'lucide-react';

export const FPODashboard: React.FC = () => {
  const {
    language,
    t,
    farmerLots,
    aggregatedBatches,
    qcVerifyLot,
    createAggregatedBatch,
    currentUser,
  } = useApp();

  const [selectedLotIds, setSelectedLotIds] = useState<string[]>([]);

  const toggleSelectLot = (id: string) => {
    setSelectedLotIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleBatchCreation = () => {
    if (selectedLotIds.length === 0) return;
    createAggregatedBatch(selectedLotIds, 'Salem FPO Consolidation Hub');
    setSelectedLotIds([]);
  };

  const pendingLots = farmerLots.filter((l) => l.status === 'Listed' || l.status === 'Verified');
  const totalAggregatedKg = aggregatedBatches.reduce((acc, b) => acc + b.totalWeightKg, 0);

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-300">
      {/* FPO Hub Header */}
      <div className="bg-white rounded-2xl p-5 md:p-6 border border-[#E5E7EB] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#1B4332] to-[#2D6A4F] text-white flex items-center justify-center font-black text-lg shadow-md shadow-[#1B4332]/15">
            <Building2 className="w-6 h-6 text-[#74C69D]" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg md:text-xl font-black text-[#1B4332]">
                {currentUser.name}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#E8F5E9] text-[#2D6A4F] border border-[#B7E4C7]">
                CIN: {currentUser.identifier}
              </span>
            </div>
            <p className="text-xs text-[#4B5563] mt-0.5 font-medium">
              {currentUser.location} • {t('fpoSubtitle')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-[#E8F5E9] text-xs font-bold text-[#1B4332] border border-[#B7E4C7] flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#40916C]" />
            Geographic Clustering Engine Active
          </span>
        </div>
      </div>

      {/* Aggregation Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <div className="bg-white p-4 md:p-5 rounded-2xl border border-[#E5E7EB] shadow-xs">
          <span className="text-xs font-bold text-[#4B5563] uppercase tracking-wider block mb-1">
            {t('fpoPendingLots')}
          </span>
          <p className="text-2xl md:text-3xl font-black text-[#1B4332]">
            {pendingLots.length} <span className="text-xs font-semibold text-[#4B5563]">Lots</span>
          </p>
          <p className="text-[11px] text-[#40916C] font-semibold mt-1">
            Salem & Dharmapuri Cluster
          </p>
        </div>

        <div className="bg-white p-4 md:p-5 rounded-2xl border border-[#E5E7EB] shadow-xs">
          <span className="text-xs font-bold text-[#4B5563] uppercase tracking-wider block mb-1">
            {t('fpoClusteredBatches')}
          </span>
          <p className="text-2xl md:text-3xl font-black text-[#1B4332]">
            {aggregatedBatches.length} <span className="text-xs font-semibold text-[#4B5563]">Batches</span>
          </p>
          <p className="text-[11px] text-[#40916C] font-semibold mt-1">
            Commercial 5 MT Truckloads
          </p>
        </div>

        <div className="bg-white p-4 md:p-5 rounded-2xl border border-[#E5E7EB] shadow-xs">
          <span className="text-xs font-bold text-[#4B5563] uppercase tracking-wider block mb-1">
            {t('clusterSummary')}
          </span>
          <p className="text-2xl md:text-3xl font-black text-[#1B4332]">
            {(totalAggregatedKg / 1000).toFixed(1)} <span className="text-xs font-semibold text-[#4B5563]">MT</span>
          </p>
          <p className="text-[11px] text-[#2D6A4F] font-bold mt-1">
            Aggregated Total Volume
          </p>
        </div>

        <div className="bg-gradient-to-br from-[#E8F5E9] to-[#D8F3DC] p-4 md:p-5 rounded-2xl border border-[#B7E4C7] shadow-xs">
          <span className="text-xs font-black text-[#1B4332] uppercase tracking-wider block mb-1">
            {t('batchCompatibilityScore')}
          </span>
          <p className="text-2xl md:text-3xl font-black text-[#1B4332]">
            97.8%
          </p>
          <p className="text-[11px] text-[#2D6A4F] font-black mt-1">
            Zero Transshipment Efficiency
          </p>
        </div>
      </div>

      {/* Two Column Layout: QC Verification Queue & Aggregated Batches */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Incoming Smallholder Lots Queue (QC & Selection) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-white rounded-2xl p-5 border border-[#E5E7EB] shadow-xs">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#F3F4F6]">
              <div className="flex items-center gap-2">
                <Scale className="w-5 h-5 text-[#2D6A4F]" />
                <h2 className="text-base font-black text-[#1B4332]">
                  {t('fpoPendingLots')}
                </h2>
              </div>
              <span className="text-xs text-[#4B5563] font-bold">
                {pendingLots.length} Lots
              </span>
            </div>

            {pendingLots.length === 0 ? (
              <p className="py-8 text-center text-xs text-[#6B7280]">
                All incoming smallholder lots have been verified and batched!
              </p>
            ) : (
              <div className="space-y-3">
                {pendingLots.map((lot) => {
                  const prod = getProduceByKey(lot.produceKey) || PRODUCE_CATALOG[0];
                  const isSelected = selectedLotIds.includes(lot.id);
                  const isVerified = lot.status === 'Verified';

                  return (
                    <div
                      key={lot.id}
                      className={`p-4 rounded-xl border transition-all ${
                        isSelected
                          ? 'border-[#2D6A4F] bg-[#E8F5E9]/60 shadow-xs'
                          : 'border-[#E5E7EB] bg-[#F8FAF8] hover:bg-white hover:border-[#74C69D]'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelectLot(lot.id)}
                            className="w-4 h-4 rounded text-[#2D6A4F] focus:ring-[#40916C]"
                          />
                          <div className="w-12 h-12 rounded-xl overflow-hidden relative shrink-0 border border-[#E5E7EB]">
                            <ProduceImage
                              src={prod.imageUrl}
                              alt={prod.name[language] || prod.name.en}
                              className="w-full h-full"
                              category={prod.category}
                            />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-black text-[#1B4332]">
                                {prod.name[language] || prod.name.en}
                              </h4>
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#E8F5E9] text-[#1B4332]">
                                {lot.grade}
                              </span>
                            </div>
                            <p className="text-xs text-[#4B5563] font-medium mt-0.5">
                              {lot.farmerName} • {lot.farmerLocation}
                            </p>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-sm font-black text-[#1B4332] block">
                            {lot.quantityKg} kg
                          </span>
                          <span className="text-[10px] text-[#40916C] font-semibold">
                            ₹{lot.expectedPricePerKg}/kg
                          </span>
                        </div>
                      </div>

                      {/* QC Action Bar */}
                      <div className="mt-3 pt-3 border-t border-[#E5E7EB] flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-[11px] text-[#4B5563]">
                          <MapPin className="w-3.5 h-3.5 text-[#2D6A4F]" />
                          <span>Spatial Cluster: Salem North</span>
                        </div>

                        {!isVerified ? (
                          <button
                            onClick={() => qcVerifyLot(lot.id)}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#2D6A4F] hover:bg-[#1B4332] text-white text-xs font-bold transition-colors"
                          >
                            <ShieldCheck className="w-3.5 h-3.5 text-[#74C69D]" />
                            <span>{t('btnVerifyLot')}</span>
                          </button>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-[#2D6A4F]">
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#40916C]" />
                            Inspected & Grade Approved
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Batching Action Trigger */}
            {selectedLotIds.length > 0 && (
              <div className="mt-4 p-3.5 rounded-xl bg-[#1B4332] text-white flex items-center justify-between">
                <div>
                  <span className="text-xs font-black block">
                    {selectedLotIds.length} Lots Selected for Consolidation
                  </span>
                  <span className="text-[10px] text-[#74C69D]">
                    Spatial Aggregation Match Score: 98%
                  </span>
                </div>
                <button
                  onClick={handleBatchCreation}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#52B788] hover:bg-[#74C69D] text-[#1B4332] text-xs font-black transition-all"
                >
                  <Boxes className="w-4 h-4" />
                  <span>{t('btnCreateBatch')}</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right: Aggregated Commercial Batches (Geographic Clustering Engine Output) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-white rounded-2xl p-5 border border-[#E5E7EB] shadow-xs">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#F3F4F6]">
              <div className="flex items-center gap-2">
                <Boxes className="w-5 h-5 text-[#2D6A4F]" />
                <h2 className="text-base font-black text-[#1B4332]">
                  {t('fpoClusteredBatches')}
                </h2>
              </div>
              <span className="text-xs text-[#4B5563] font-bold">
                {aggregatedBatches.length} Ready Batches
              </span>
            </div>

            <div className="space-y-4">
              {aggregatedBatches.map((batch) => {
                const prod = getProduceByKey(batch.produceKey) || PRODUCE_CATALOG[0];

                return (
                  <div
                    key={batch.id}
                    className="p-4 rounded-xl border border-[#B7E4C7] bg-[#F8FAF8] hover:bg-white transition-all space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-14 h-14 rounded-xl overflow-hidden relative shrink-0 border border-[#E5E7EB]">
                          <ProduceImage
                            src={prod.imageUrl}
                            alt={prod.name[language] || prod.name.en}
                            className="w-full h-full"
                            category={prod.category}
                          />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-black text-[#1B4332]">
                              {prod.name[language] || prod.name.en}
                            </h4>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#1B4332] text-white">
                              {(batch.totalWeightKg / 1000).toFixed(1)} MT Batch
                            </span>
                          </div>
                          <p className="text-xs text-[#4B5563] font-medium mt-0.5">
                            {batch.hubLocation} • {batch.grade}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-black text-[#2D6A4F] block">
                          ₹{batch.fpoBasePricePerKg}/kg
                        </span>
                        <span className="text-[10px] text-[#6B7280] font-medium">
                          FPO Benchmark
                        </span>
                      </div>
                    </div>

                    {/* Engine Output Badges (Strictly No Algorithm Names) */}
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#E5E7EB] text-[11px]">
                      <div className="p-2 rounded-lg bg-[#E8F5E9] border border-[#B7E4C7] text-[#1B4332]">
                        <span className="font-bold block">{t('batchCompatibilityScore')}</span>
                        <span className="text-[#2D6A4F] font-black text-xs">
                          {batch.clusteringCompatibilityScore}% Optimal
                        </span>
                      </div>
                      <div className="p-2 rounded-lg bg-[#E8F5E9] border border-[#B7E4C7] text-[#1B4332]">
                        <span className="font-bold block">{t('directHubFulfillment')}</span>
                        <span className="text-[#2D6A4F] font-semibold text-xs">
                          {t('zeroTransshipment')}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-[#4B5563] pt-1">
                      <span>Target: {batch.targetBuyerSegment}</span>
                      <span className="font-bold text-[#1B4332]">
                        Status: <span className="text-[#40916C]">{batch.status}</span>
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
