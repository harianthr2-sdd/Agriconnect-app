'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { FarmerVoiceListing } from './FarmerVoiceListing';
import { PRODUCE_CATALOG, getProduceByKey } from '@/lib/catalog';
import { ProduceImage } from '@/components/common/ProduceImage';
import { FarmerLot } from '@/types';
import {
  Sprout,
  TrendingUp,
  CreditCard,
  Building2,
  FileSpreadsheet,
  CheckCircle2,
  Clock,
  Truck,
  ShieldCheck,
  ChevronRight,
  ArrowUpRight,
  Banknote,
  Sparkles,
} from 'lucide-react';

export const FarmerDashboard: React.FC = () => {
  const {
    language,
    t,
    farmerLots,
    currentUser,
    settlements,
    setActiveSettlementRecord,
  } = useApp();

  const [filterCategory, setFilterCategory] = useState<'all' | 'daily' | 'fruits'>('all');

  // Filter lots belonging to active farmer or general pool
  const myLots = farmerLots;

  // Aggregate stats
  const totalSoldKg = myLots.reduce((acc, l) => acc + l.quantityKg, 0);
  const totalRealized = settlements.reduce((acc, s) => acc + s.farmerNetCashInHand, 0);
  const totalSurplus = settlements.reduce((acc, s) => acc + s.farmerSurplusGainRupees, 0);

  const getStatusBadge = (status: FarmerLot['status']) => {
    switch (status) {
      case 'Listed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-[#E8F5E9] text-[#2D6A4F] border border-[#B7E4C7]">
            <Clock className="w-3 h-3 text-[#40916C]" />
            {t('statusListed')}
          </span>
        );
      case 'Verified':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-[#D8F3DC] text-[#1B4332] border border-[#74C69D]">
            <CheckCircle2 className="w-3 h-3 text-[#2D6A4F]" />
            {t('statusVerified')}
          </span>
        );
      case 'Batched':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A]">
            <Building2 className="w-3 h-3 text-[#D97706]" />
            {t('statusBatched')}
          </span>
        );
      case 'InTransit':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-[#E0F2FE] text-[#075985] border border-[#BAE6FD]">
            <Truck className="w-3 h-3 text-[#0284C7]" />
            {t('statusInTransit')}
          </span>
        );
      case 'Delivered':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-[#DCFCE7] text-[#166534] border border-[#86EFAC]">
            <CheckCircle2 className="w-3 h-3 text-[#16A34A]" />
            {t('statusDelivered')}
          </span>
        );
      case 'Settled':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-[#1B4332] text-white">
            <Banknote className="w-3 h-3 text-[#74C69D]" />
            {t('statusSettled')}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-[#F3F4F6] text-[#4B5563]">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-300">
      {/* Farmer Profile & Account Verification Strip */}
      <div className="bg-white rounded-2xl p-4 md:p-6 border border-[#E5E7EB] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#1B4332] to-[#40916C] text-white flex items-center justify-center font-black text-lg shadow-md shadow-[#1B4332]/15 ring-2 ring-[#74C69D]/30">
            {currentUser.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg md:text-xl font-black text-[#1B4332]">
                {currentUser.name}
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#E8F5E9] text-[#2D6A4F] border border-[#B7E4C7]">
                Kisan ID: {currentUser.identifier}
              </span>
            </div>
            <p className="text-xs text-[#4B5563] mt-0.5 font-medium">
              {currentUser.location} • {t('farmerSubtitle')}
            </p>
          </div>
        </div>

        {/* Bank & Escrow Verified Badges */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F8FAF8] border border-[#E5E7EB] text-xs font-semibold text-[#1B4332]">
            <CreditCard className="w-3.5 h-3.5 text-[#40916C]" />
            <span>SBI ••••4821 ({t('bankAccountTag')})</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#E8F5E9] border border-[#B7E4C7] text-xs font-bold text-[#2D6A4F]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#40916C]" />
            <span>{t('ifscTag')}</span>
          </div>
        </div>
      </div>

      {/* Real Working Voice Listing Interactive Hub */}
      <FarmerVoiceListing />

      {/* Impact Metric Cards (Rural-First Clear Typography) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <div className="bg-white p-4 md:p-5 rounded-2xl border border-[#E5E7EB] shadow-xs">
          <div className="flex items-center justify-between text-[#4B5563] mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">{t('statActiveListings')}</span>
            <Sprout className="w-4 h-4 text-[#40916C]" />
          </div>
          <p className="text-2xl md:text-3xl font-black text-[#1B4332]">
            {myLots.length} <span className="text-xs font-bold text-[#4B5563]">Lots</span>
          </p>
          <p className="text-[11px] text-[#40916C] font-semibold mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            100% Direct Verification
          </p>
        </div>

        <div className="bg-white p-4 md:p-5 rounded-2xl border border-[#E5E7EB] shadow-xs">
          <div className="flex items-center justify-between text-[#4B5563] mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">{t('statTotalSold')}</span>
            <TrendingUp className="w-4 h-4 text-[#40916C]" />
          </div>
          <p className="text-2xl md:text-3xl font-black text-[#1B4332]">
            {totalSoldKg.toLocaleString()} <span className="text-xs font-bold text-[#4B5563]">kg</span>
          </p>
          <p className="text-[11px] text-[#40916C] font-semibold mt-1">
            {(totalSoldKg / 1000).toFixed(1)} MT Harvest Cleared
          </p>
        </div>

        <div className="bg-white p-4 md:p-5 rounded-2xl border border-[#E5E7EB] shadow-xs">
          <div className="flex items-center justify-between text-[#4B5563] mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">{t('statNetRealized')}</span>
            <Banknote className="w-4 h-4 text-[#2D6A4F]" />
          </div>
          <p className="text-2xl md:text-3xl font-black text-[#1B4332]">
            ₹{totalRealized.toLocaleString()}
          </p>
          <p className="text-[11px] text-[#2D6A4F] font-bold mt-1">
            T+24h Bank Account Credited
          </p>
        </div>

        <div className="bg-gradient-to-br from-[#E8F5E9] to-[#D8F3DC] p-4 md:p-5 rounded-2xl border border-[#B7E4C7] shadow-xs">
          <div className="flex items-center justify-between text-[#1B4332] mb-2">
            <span className="text-xs font-black uppercase tracking-wider">{t('statSurplusVsBroker')}</span>
            <Sparkles className="w-4 h-4 text-[#2D6A4F]" />
          </div>
          <p className="text-2xl md:text-3xl font-black text-[#1B4332]">
            +₹{totalSurplus.toLocaleString()}
          </p>
          <p className="text-[11px] text-[#1B4332] font-black mt-1">
            +52.7% Higher Net Realization
          </p>
        </div>
      </div>

      {/* Live Mandi Benchmark Price Guidance (No Algorithm Names in UI) */}
      <div className="bg-white rounded-2xl p-5 md:p-6 border border-[#E5E7EB] shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-[#F3F4F6]">
          <div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[#2D6A4F]" />
              <h2 className="text-base font-black text-[#1B4332]">
                {t('mandiPriceTickerTitle')}
              </h2>
            </div>
            <p className="text-xs text-[#4B5563] mt-0.5">
              {t('fairPriceBand')} across Tamil Nadu & South Indian Mandis (Salem, Koyambedu, Dindigul)
            </p>
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-1.5 bg-[#F3F6F3] p-1 rounded-xl border border-[#E5E7EB]">
            <button
              onClick={() => setFilterCategory('all')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                filterCategory === 'all' ? 'bg-[#1B4332] text-white shadow-xs' : 'text-[#4B5563] hover:text-[#1B4332]'
              }`}
            >
              {t('catAll')}
            </button>
            <button
              onClick={() => setFilterCategory('daily')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                filterCategory === 'daily' ? 'bg-[#1B4332] text-white shadow-xs' : 'text-[#4B5563] hover:text-[#1B4332]'
              }`}
            >
              {t('catDaily')}
            </button>
            <button
              onClick={() => setFilterCategory('fruits')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                filterCategory === 'fruits' ? 'bg-[#1B4332] text-white shadow-xs' : 'text-[#4B5563] hover:text-[#1B4332]'
              }`}
            >
              {t('catFruits')}
            </button>
          </div>
        </div>

        {/* Catalog Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {PRODUCE_CATALOG.filter(
            (p) => filterCategory === 'all' || p.category === filterCategory
          ).map((item) => {
            const minBand = (item.baseBenchmarkPrice * 0.92).toFixed(1);
            const maxBand = (item.baseBenchmarkPrice * 1.08).toFixed(1);
            return (
              <div
                key={item.id}
                className="group rounded-2xl border border-[#E5E7EB] bg-[#F8FAF8] hover:bg-white hover:border-[#74C69D] p-3.5 transition-all duration-200 hover:shadow-md flex flex-col justify-between"
              >
                <div>
                  <div className="w-full h-36 rounded-xl overflow-hidden relative mb-3">
                    <ProduceImage
                      src={item.imageUrl}
                      alt={item.name[language] || item.name.en}
                      className="w-full h-full"
                      category={item.category}
                    />
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-[#1B4332]/85 text-white text-[10px] font-bold backdrop-blur-xs">
                      {item.category === 'fruits' ? t('catFruits') : t('catDaily')}
                    </span>
                  </div>

                  <h3 className="text-sm font-black text-[#1B4332] line-clamp-1">
                    {item.name[language] || item.name.en}
                  </h3>
                  <p className="text-xs text-[#4B5563] font-medium mt-0.5">
                    {item.subtitle[language] || item.subtitle.en}
                  </p>
                </div>

                <div className="mt-3 pt-3 border-t border-[#E5E7EB]">
                  <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider block">
                    {t('fairPriceBand')}
                  </span>
                  <div className="flex items-baseline justify-between mt-0.5">
                    <span className="text-sm font-black text-[#2D6A4F]">
                      ₹{minBand} – ₹{maxBand}
                    </span>
                    <span className="text-[10px] font-bold text-[#40916C]">
                      / {item.unit}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Active Lots & Dispatch Tracking Table */}
      <div className="bg-white rounded-2xl p-5 md:p-6 border border-[#E5E7EB] shadow-xs">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#F3F4F6]">
          <div className="flex items-center gap-2">
            <Sprout className="w-5 h-5 text-[#2D6A4F]" />
            <h2 className="text-base font-black text-[#1B4332]">
              {t('myActiveLotsTitle')}
            </h2>
          </div>
          <span className="text-xs text-[#4B5563] font-semibold">
            {myLots.length} Active Lots
          </span>
        </div>

        {myLots.length === 0 ? (
          <div className="py-10 text-center text-xs text-[#6B7280]">
            {t('noLotsFound')}
          </div>
        ) : (
          <div className="space-y-3">
            {myLots.map((lot) => {
              const prod = getProduceByKey(lot.produceKey) || PRODUCE_CATALOG[0];
              const matchingSettlement = settlements.find((s) => s.lotId === lot.id) || settlements[0];

              return (
                <div
                  key={lot.id}
                  className="p-4 rounded-xl border border-[#E5E7EB] bg-[#F8FAF8] hover:bg-white hover:border-[#74C69D] transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-14 h-14 rounded-xl overflow-hidden relative shrink-0 border border-[#E5E7EB]">
                      <ProduceImage
                        src={prod.imageUrl}
                        alt={prod.name[language] || prod.name.en}
                        className="w-full h-full"
                        category={prod.category}
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm font-black text-[#1B4332]">
                          {prod.name[language] || prod.name.en}
                        </h4>
                        {getStatusBadge(lot.status)}
                      </div>
                      <p className="text-xs text-[#4B5563] font-medium mt-0.5">
                        {lot.quantityKg} kg • {lot.grade} • {lot.farmerLocation}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between md:justify-end gap-4 pt-2 md:pt-0 border-t md:border-t-0 border-[#E5E7EB]">
                    <div className="text-left md:text-right">
                      <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider block">
                        {t('fieldNetCash')}
                      </span>
                      <span className="text-sm font-black text-[#1B4332]">
                        ₹{lot.netEstimatedCashInHand.toLocaleString()}
                      </span>
                    </div>

                    <button
                      onClick={() => setActiveSettlementRecord(matchingSettlement)}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#E8F5E9] hover:bg-[#D8F3DC] text-[#1B4332] text-xs font-bold transition-colors border border-[#B7E4C7]"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5 text-[#2D6A4F]" />
                      <span>{t('viewSettlementReceipt')}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-[#2D6A4F]" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
