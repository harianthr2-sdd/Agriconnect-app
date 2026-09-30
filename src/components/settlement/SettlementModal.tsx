'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { getProduceByKey } from '@/lib/catalog';
import { PRODUCE_CATALOG } from '@/lib/catalog';
import { ProduceImage } from '@/components/common/ProduceImage';
import {
  X,
  FileSpreadsheet,
  CheckCircle2,
  TrendingUp,
  ShieldCheck,
  CreditCard,
  Building2,
  Sparkles,
  ArrowDownRight,
  ArrowUpRight,
  Receipt,
  Scale,
} from 'lucide-react';

export const SettlementModal: React.FC = () => {
  const {
    language,
    t,
    activeSettlementRecord,
    setActiveSettlementRecord,
  } = useApp();

  if (!activeSettlementRecord) return null;

  const record = activeSettlementRecord;
  const prod = getProduceByKey(record.produceKey) || PRODUCE_CATALOG[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white text-[#111827] rounded-3xl max-w-2xl w-full shadow-2xl border border-[#E5E7EB] overflow-hidden">
        {/* Header */}
        <div className="bg-[#1B4332] px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
              <Receipt className="w-5 h-5 text-[#74C69D]" />
            </div>
            <div>
              <h2 className="text-base md:text-lg font-bold">
                {t('settlementTitle')}
              </h2>
              <p className="text-xs text-white/80">
                {t('settlementSubtitle')}
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveSettlementRecord(null)}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Modal Body */}
        <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Produce & Transaction Header Strip */}
          <div className="p-4 rounded-2xl bg-[#F3F6F3] border border-[#E5E7EB] flex items-center justify-between gap-4">
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
                <h3 className="text-sm font-black text-[#1B4332]">
                  {prod.name[language] || prod.name.en}
                </h3>
                <p className="text-xs text-[#4B5563] font-medium mt-0.5">
                  Farmer: {record.farmerName} • Qty: {record.quantityKg.toLocaleString()} kg
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider block">
                Gross Mandi Cleared Rate
              </span>
              <span className="text-sm font-black text-[#1B4332]">
                ₹{record.clearedRatePerKg.toFixed(2)} / kg
              </span>
            </div>
          </div>

          {/* Mathematical Model Equation Bar */}
          <div className="p-3.5 rounded-xl bg-[#E8F5E9] border border-[#B7E4C7] text-center">
            <span className="text-[10px] font-black uppercase tracking-wider text-[#2D6A4F] block mb-1">
              {t('formulaTitle')}
            </span>
            <p className="font-mono text-xs font-bold text-[#1B4332]">
              Net Realization = Gross Value - (Logistics + FPO Handling + Platform Fee)
            </p>
          </div>

          {/* Itemized Breakdown Table */}
          <div className="border border-[#E5E7EB] rounded-2xl overflow-hidden bg-white shadow-xs">
            <div className="bg-[#F8FAF8] px-4 py-2.5 border-b border-[#E5E7EB] text-xs font-bold text-[#4B5563] uppercase tracking-wider flex justify-between">
              <span>Itemized Settlement Line</span>
              <span>Amount (INR)</span>
            </div>

            <div className="divide-y divide-[#E5E7EB] text-xs">
              {/* Gross Cleared */}
              <div className="p-4 flex items-center justify-between">
                <div>
                  <span className="font-bold text-[#1B4332] block">
                    {t('grossMarketValue')}
                  </span>
                  <span className="text-[11px] text-[#4B5563]">
                    {record.quantityKg} kg × ₹{record.clearedRatePerKg.toFixed(2)} / kg
                  </span>
                </div>
                <span className="text-sm font-black text-[#1B4332]">
                  ₹{record.grossClearedValue.toLocaleString()}
                </span>
              </div>

              {/* Shared Logistics */}
              <div className="p-4 flex items-center justify-between bg-[#FDFBF7]">
                <div>
                  <span className="font-bold text-[#4B5563] block">
                    {t('sharedRouteFreight')}
                  </span>
                  <span className="text-[11px] text-[#6B7280]">
                    Pooled Cold-Chain Freight (₹1.80 / kg)
                  </span>
                </div>
                <span className="text-sm font-bold text-[#DC2626]">
                  -₹{record.sharedRouteFreight.toLocaleString()}
                </span>
              </div>

              {/* FPO Handling */}
              <div className="p-4 flex items-center justify-between bg-[#FDFBF7]">
                <div>
                  <span className="font-bold text-[#4B5563] block">
                    {t('fpoWeighmentStorage')}
                  </span>
                  <span className="text-[11px] text-[#6B7280]">
                    Electronic Weighment & QC Certification (₹0.40 / kg)
                  </span>
                </div>
                <span className="text-sm font-bold text-[#DC2626]">
                  -₹{record.fpoWeighmentStorage.toLocaleString()}
                </span>
              </div>

              {/* Platform Fee */}
              <div className="p-4 flex items-center justify-between bg-[#FDFBF7]">
                <div>
                  <span className="font-bold text-[#4B5563] block">
                    {t('platformCoordinationFee')}
                  </span>
                  <span className="text-[11px] text-[#6B7280]">
                    1.5% Matching & Escrow Protection Fee
                  </span>
                </div>
                <span className="text-sm font-bold text-[#DC2626]">
                  -₹{record.platformFee.toLocaleString()}
                </span>
              </div>

              {/* Net Bank Credit */}
              <div className="p-4 flex items-center justify-between bg-[#E8F5E9]/60">
                <div>
                  <span className="text-sm font-black text-[#1B4332] block">
                    {t('netBankCredit')}
                  </span>
                  <span className="text-xs text-[#2D6A4F] font-bold">
                    Effective Realized Rate: ₹{record.effectiveRatePerKg.toFixed(2)} / kg
                  </span>
                </div>
                <span className="text-xl font-black text-[#1B4332]">
                  ₹{record.farmerNetCashInHand.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Benchmark Comparison Card: vs Traditional Village Broker */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-[#E8F5E9] to-[#D8F3DC] border border-[#B7E4C7] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#2D6A4F]" />
                <h4 className="text-xs font-black uppercase tracking-wider text-[#1B4332]">
                  {t('brokerComparisonTitle')}
                </h4>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-[#1B4332] text-white text-[10px] font-black">
                +52.7% Surplus Income
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="p-3 bg-white/80 rounded-xl border border-[#B7E4C7]">
                <span className="text-[10px] text-[#4B5563] font-bold block">
                  {t('traditionalBrokerOffer')}
                </span>
                <span className="text-sm font-black text-[#4B5563] block mt-0.5">
                  ₹{record.villageBrokerBaselineRate.toFixed(2)} / kg
                </span>
                <span className="text-[10px] text-[#6B7280] font-medium">
                  Total Payout: ₹{record.villageBrokerGross.toLocaleString()}
                </span>
              </div>

              <div className="p-3 bg-[#1B4332] text-white rounded-xl shadow-xs">
                <span className="text-[10px] text-[#74C69D] font-bold block">
                  {t('farmerSurplusGain')}
                </span>
                <span className="text-base font-black text-white block mt-0.5">
                  +₹{record.farmerSurplusGainRupees.toLocaleString()}
                </span>
                <span className="text-[10px] text-[#D8F3DC] font-semibold">
                  Direct Bank Credit (No Middleman Cut)
                </span>
              </div>
            </div>
          </div>

          {/* Payment Status & Bank Reference Flags */}
          <div className="p-3.5 rounded-xl bg-[#F8FAF8] border border-[#E5E7EB] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#52B788]" />
              <span className="font-bold text-[#1B4332]">{t('bankTransferred')}</span>
            </div>
            <div className="font-mono text-[11px] text-[#4B5563]">
              {t('utrNumber')}: <strong>{record.bankReferenceNumber}</strong>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-[#F8FAF8] border-t border-[#E5E7EB] flex items-center justify-end">
          <button
            onClick={() => setActiveSettlementRecord(null)}
            className="px-6 py-2.5 rounded-xl bg-[#1B4332] hover:bg-[#2D6A4F] text-white text-xs font-bold shadow-xs transition-colors"
          >
            {t('btnClose')}
          </button>
        </div>
      </div>
    </div>
  );
};
