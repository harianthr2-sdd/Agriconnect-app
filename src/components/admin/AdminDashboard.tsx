'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { PRODUCE_CATALOG, getProduceByKey } from '@/lib/catalog';
import { ProduceImage } from '@/components/common/ProduceImage';
import {
  ShieldCheck,
  TrendingUp,
  Lock,
  Truck,
  Users,
  CheckCircle2,
  AlertTriangle,
  Receipt,
  Building2,
  ShoppingCart,
  Banknote,
  Sparkles,
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const {
    language,
    t,
    farmerLots,
    aggregatedBatches,
    buyerDemands,
    settlements,
    setActiveSettlementRecord,
    currentUser,
  } = useApp();

  const totalGMV = farmerLots.reduce((acc, l) => acc + l.grossEstimatedValue, 0) + 120000;
  const escrowBalance = buyerDemands.reduce((acc, d) => acc + (d.requiredWeightKg * d.targetMaxPricePerKg), 0);

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-300">
      {/* Super Admin Header */}
      <div className="bg-white rounded-2xl p-5 md:p-6 border border-[#E5E7EB] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#1B4332] to-[#2D6A4F] text-white flex items-center justify-center font-black text-lg shadow-md shadow-[#1B4332]/15">
            <ShieldCheck className="w-6 h-6 text-[#74C69D]" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg md:text-xl font-black text-[#1B4332]">
                {currentUser.name}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#E8F5E9] text-[#2D6A4F] border border-[#B7E4C7]">
                Master ID: {currentUser.identifier}
              </span>
            </div>
            <p className="text-xs text-[#4B5563] mt-0.5 font-medium">
              {currentUser.location} • {t('adminSubtitle')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-[#E8F5E9] text-xs font-bold text-[#1B4332] border border-[#B7E4C7] flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#40916C]" />
            Escrow Clearing Engine: Healthy
          </span>
        </div>
      </div>

      {/* Platform-Wide Key Performance Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <div className="bg-white p-4 md:p-5 rounded-2xl border border-[#E5E7EB] shadow-xs">
          <div className="flex items-center justify-between text-[#4B5563] mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">{t('statTotalGMV')}</span>
            <TrendingUp className="w-4 h-4 text-[#40916C]" />
          </div>
          <p className="text-2xl md:text-3xl font-black text-[#1B4332]">
            ₹{totalGMV.toLocaleString()}
          </p>
          <p className="text-[11px] text-[#40916C] font-semibold mt-1">
            +38.4% MoM Direct Trade
          </p>
        </div>

        <div className="bg-white p-4 md:p-5 rounded-2xl border border-[#E5E7EB] shadow-xs">
          <div className="flex items-center justify-between text-[#4B5563] mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">{t('statEscrowLocked')}</span>
            <Lock className="w-4 h-4 text-[#2D6A4F]" />
          </div>
          <p className="text-2xl md:text-3xl font-black text-[#1B4332]">
            ₹{escrowBalance.toLocaleString()}
          </p>
          <p className="text-[11px] text-[#2D6A4F] font-bold mt-1">
            100% Zero-Loss Vault Guaranteed
          </p>
        </div>

        <div className="bg-white p-4 md:p-5 rounded-2xl border border-[#E5E7EB] shadow-xs">
          <div className="flex items-center justify-between text-[#4B5563] mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">{t('statActiveTrucks')}</span>
            <Truck className="w-4 h-4 text-[#0284C7]" />
          </div>
          <p className="text-2xl md:text-3xl font-black text-[#1B4332]">
            12 Reefers
          </p>
          <p className="text-[11px] text-[#40916C] font-semibold mt-1">
            {t('slaOnTime')}
          </p>
        </div>

        <div className="bg-gradient-to-br from-[#E8F5E9] to-[#D8F3DC] p-4 md:p-5 rounded-2xl border border-[#B7E4C7] shadow-xs">
          <div className="flex items-center justify-between text-[#1B4332] mb-1">
            <span className="text-xs font-black uppercase tracking-wider">{t('statFarmersBenefited')}</span>
            <Users className="w-4 h-4 text-[#2D6A4F]" />
          </div>
          <p className="text-2xl md:text-3xl font-black text-[#1B4332]">
            4,821
          </p>
          <p className="text-[11px] text-[#1B4332] font-bold mt-1">
            Across 24 South Indian FPOs
          </p>
        </div>
      </div>

      {/* Multi-Role Realtime Activity & Governance Table */}
      <div className="bg-white rounded-2xl p-5 md:p-6 border border-[#E5E7EB] shadow-xs">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#F3F4F6]">
          <div className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-[#2D6A4F]" />
            <h2 className="text-base font-black text-[#1B4332]">
              {t('liveTransactionFeed')}
            </h2>
          </div>
          <span className="text-xs font-bold text-[#4B5563]">
            {settlements.length + farmerLots.length} Live Operations
          </span>
        </div>

        <div className="space-y-3">
          {settlements.map((st) => {
            const prod = getProduceByKey(st.produceKey) || PRODUCE_CATALOG[0];

            return (
              <div
                key={st.id}
                className="p-4 rounded-xl border border-[#E5E7EB] bg-[#F8FAF8] hover:bg-white hover:border-[#74C69D] transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
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
                        {st.farmerName} • {prod.name[language] || prod.name.en}
                      </h4>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#E8F5E9] text-[#1B4332] border border-[#B7E4C7]">
                        Verified Settlement
                      </span>
                    </div>
                    <p className="text-xs text-[#4B5563] font-medium mt-0.5">
                      Qty: {st.quantityKg} kg • UTR: {st.bankReferenceNumber}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-4">
                  <div className="text-left md:text-right">
                    <span className="text-xs font-black text-[#1B4332] block">
                      Net Payout: ₹{st.farmerNetCashInHand.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-[#40916C] font-semibold">
                      Surplus: +₹{st.farmerSurplusGainRupees.toLocaleString()} (+{st.farmerSurplusGainPercentage}%)
                    </span>
                  </div>

                  <button
                    onClick={() => setActiveSettlementRecord(st)}
                    className="px-3.5 py-1.5 rounded-xl bg-[#1B4332] text-white text-xs font-bold hover:bg-[#2D6A4F] transition-colors"
                  >
                    Audit Slip
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
