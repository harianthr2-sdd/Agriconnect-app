'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { PRODUCE_CATALOG, getProduceByKey } from '@/lib/catalog';
import { ProduceImage } from '@/components/common/ProduceImage';
import { ProduceGrade } from '@/types';
import {
  ShoppingCart,
  Sparkles,
  ShieldCheck,
  Building2,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  MapPin,
  Clock,
  Lock,
  PlusCircle,
  FileText,
  Boxes,
  Calendar,
  Layers,
} from 'lucide-react';

export const BuyerDashboard: React.FC = () => {
  const {
    language,
    t,
    aggregatedBatches,
    buyerDemands,
    postBuyerDemand,
    buyBatchAndLockEscrow,
    acceptMatchedSupplyForDemand,
    currentUser,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'batches' | 'postDemand' | 'myDemands'>('batches');
  const [filterCategory, setFilterCategory] = useState<'all' | 'daily' | 'fruits'>('all');

  // Form State for Demand Posting
  const [demandCrop, setDemandCrop] = useState<string>('veg_tomato');
  const [demandVolume, setDemandVolume] = useState<number>(5000);
  const [demandGrade, setDemandGrade] = useState<ProduceGrade>('Grade A');
  const [demandMaxPrice, setDemandMaxPrice] = useState<number>(34);
  const [demandHub, setDemandHub] = useState<string>('Koyambedu Wholesale Complex, Chennai');
  const [demandDate, setDemandDate] = useState<string>('2026-10-02');
  const [demandSpecialInstructions, setDemandSpecialInstructions] = useState<string>(
    'Cold-chain reefer mandatory. Palletized delivery in 20kg returnable plastic crates.'
  );

  const readyBatches = aggregatedBatches.filter(
    (b) => b.status === 'ReadyForBuyer' || b.status === 'Matched'
  );

  const handlePostDemandSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const prod = getProduceByKey(demandCrop) || PRODUCE_CATALOG[0];

    postBuyerDemand({
      destinationHub: demandHub,
      produceId: prod.id,
      produceKey: demandCrop,
      requiredWeightKg: demandVolume,
      acceptableGrade: demandGrade,
      targetMaxPricePerKg: demandMaxPrice,
      deliveryWindowHours: 12,
      deliveryDate: demandDate,
      specialInstructions: demandSpecialInstructions,
    });

    setActiveTab('myDemands');
  };

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-300">
      {/* Wholesale Buyer Header */}
      <div className="bg-white rounded-2xl p-5 md:p-6 border border-[#E5E7EB] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#1B4332] to-[#2D6A4F] text-white flex items-center justify-center font-black text-lg shadow-md shadow-[#1B4332]/15">
            <ShoppingCart className="w-6 h-6 text-[#74C69D]" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg md:text-xl font-black text-[#1B4332]">
                {currentUser.name}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#E8F5E9] text-[#2D6A4F] border border-[#B7E4C7]">
                GSTIN: {currentUser.identifier}
              </span>
            </div>
            <p className="text-xs text-[#4B5563] mt-0.5 font-medium">
              {currentUser.location} • {t('buyerSubtitle')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3.5 py-1.5 rounded-xl bg-[#E8F5E9] text-xs font-bold text-[#1B4332] border border-[#B7E4C7] flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-[#40916C]" />
            {t('escrowSecured')}
          </span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-[#E5E7EB] bg-white rounded-2xl p-1.5 shadow-xs gap-1.5">
        <button
          onClick={() => setActiveTab('batches')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'batches'
              ? 'bg-[#1B4332] text-white shadow-sm'
              : 'text-[#4B5563] hover:bg-[#F3F6F3] hover:text-[#1B4332]'
          }`}
        >
          <Boxes className="w-4 h-4" />
          <span>{t('tabBrowseBatches')}</span>
        </button>

        <button
          onClick={() => setActiveTab('postDemand')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'postDemand'
              ? 'bg-[#1B4332] text-white shadow-sm'
              : 'text-[#4B5563] hover:bg-[#F3F6F3] hover:text-[#1B4332]'
          }`}
        >
          <PlusCircle className="w-4 h-4 text-[#52B788]" />
          <span>{t('tabPostDemand')}</span>
        </button>

        <button
          onClick={() => setActiveTab('myDemands')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'myDemands'
              ? 'bg-[#1B4332] text-white shadow-sm'
              : 'text-[#4B5563] hover:bg-[#F3F6F3] hover:text-[#1B4332]'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>{t('tabMyDemands')} ({buyerDemands.length})</span>
        </button>
      </div>

      {/* TAB 1: BROWSE VERIFIED FPO BATCHES */}
      {activeTab === 'batches' && (
        <div className="space-y-6">
          {/* Intelligence Engine Banner */}
          <div className="p-4 md:p-5 rounded-2xl bg-gradient-to-r from-[#1B4332] to-[#2D6A4F] text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
                <Sparkles className="w-5 h-5 text-[#74C69D]" />
              </div>
              <div>
                <h3 className="text-sm md:text-base font-bold text-white">
                  {t('buyerDemandMatching')}
                </h3>
                <p className="text-xs text-white/80">
                  Supervised multi-parameter compatibility evaluating volume fill-rate, grade tolerance, and cold transit
                </p>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full bg-[#52B788] text-[#1B4332] text-xs font-black self-start sm:self-auto">
              {t('optimalMatch')} • 98% Compatibility
            </span>
          </div>

          {/* Batches Grid */}
          <div className="bg-white rounded-2xl p-5 md:p-6 border border-[#E5E7EB] shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-[#F3F4F6]">
              <div>
                <h2 className="text-base font-black text-[#1B4332]">
                  Verified FPO Aggregated Batches Ready for Procurement
                </h2>
                <p className="text-xs text-[#4B5563] mt-0.5">
                  100% Quality Inspected • Direct Farm Gate Pickup • Automated Escrow Protection
                </p>
              </div>

              <div className="flex items-center gap-1 bg-[#F3F6F3] p-1 rounded-xl border border-[#E5E7EB]">
                <button
                  onClick={() => setFilterCategory('all')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    filterCategory === 'all' ? 'bg-[#1B4332] text-white shadow-xs' : 'text-[#4B5563]'
                  }`}
                >
                  {t('catAll')}
                </button>
                <button
                  onClick={() => setFilterCategory('daily')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    filterCategory === 'daily' ? 'bg-[#1B4332] text-white shadow-xs' : 'text-[#4B5563]'
                  }`}
                >
                  {t('catDaily')}
                </button>
                <button
                  onClick={() => setFilterCategory('fruits')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    filterCategory === 'fruits' ? 'bg-[#1B4332] text-white shadow-xs' : 'text-[#4B5563]'
                  }`}
                >
                  {t('catFruits')}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {readyBatches.map((batch) => {
                const prod = getProduceByKey(batch.produceKey) || PRODUCE_CATALOG[0];
                const isMatched = batch.status === 'Matched';

                return (
                  <div
                    key={batch.id}
                    className={`rounded-2xl border p-4 transition-all flex flex-col justify-between ${
                      isMatched
                        ? 'border-[#74C69D] bg-[#E8F5E9]/50 shadow-sm'
                        : 'border-[#E5E7EB] bg-[#F8FAF8] hover:bg-white hover:border-[#40916C] hover:shadow-md'
                    }`}
                  >
                    <div>
                      <div className="w-full h-40 rounded-xl overflow-hidden relative mb-3">
                        <ProduceImage
                          src={prod.imageUrl}
                          alt={prod.name[language] || prod.name.en}
                          className="w-full h-full"
                          category={prod.category}
                        />
                        <span className="absolute top-2 left-2 px-2.5 py-1 rounded-md bg-[#1B4332]/90 text-white text-[11px] font-black backdrop-blur-xs">
                          {(batch.totalWeightKg / 1000).toFixed(1)} MT Batch
                        </span>
                        <span className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-[#52B788] text-[#1B4332] text-[10px] font-black">
                          {batch.clusteringCompatibilityScore}% Match
                        </span>
                      </div>

                      <h3 className="text-base font-black text-[#1B4332]">
                        {prod.name[language] || prod.name.en}
                      </h3>
                      <p className="text-xs text-[#4B5563] font-medium mt-0.5">
                        {batch.fpoName} • {batch.hubLocation}
                      </p>

                      <div className="mt-3 py-2 px-3 rounded-xl bg-white border border-[#E5E7EB] space-y-1 text-xs">
                        <div className="flex justify-between text-[#4B5563]">
                          <span>Quality Grade:</span>
                          <span className="font-bold text-[#1B4332]">{batch.grade}</span>
                        </div>
                        <div className="flex justify-between text-[#4B5563]">
                          <span>Total Net Weight:</span>
                          <span className="font-bold text-[#1B4332]">{batch.totalWeightKg.toLocaleString()} kg</span>
                        </div>
                        <div className="flex justify-between text-[#4B5563]">
                          <span>Hub Direct Fulfillment:</span>
                          <span className="font-bold text-[#2D6A4F]">{t('zeroTransshipment')}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-[#E5E7EB] flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider block">
                          Wholesale Benchmark
                        </span>
                        <span className="text-lg font-black text-[#1B4332]">
                          ₹{batch.fpoBasePricePerKg} <span className="text-xs font-semibold text-[#4B5563]">/ kg</span>
                        </span>
                      </div>

                      {isMatched ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#2D6A4F] text-white text-xs font-bold shadow-xs">
                          <CheckCircle2 className="w-4 h-4 text-[#74C69D]" />
                          Escrow Locked
                        </span>
                      ) : (
                        <button
                          onClick={() => buyBatchAndLockEscrow(batch.id, currentUser.id)}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1B4332] hover:bg-[#2D6A4F] text-white text-xs font-bold shadow-md shadow-[#1B4332]/20 transition-all hover:scale-[1.02]"
                        >
                          <Lock className="w-3.5 h-3.5 text-[#74C69D]" />
                          <span>{t('btnBuyBatch')}</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: POST PROCUREMENT DEMAND FORM */}
      {activeTab === 'postDemand' && (
        <div className="bg-white rounded-2xl p-6 md:p-8 border border-[#E5E7EB] shadow-xs max-w-3xl mx-auto">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#F3F4F6]">
            <div className="w-10 h-10 rounded-xl bg-[#E8F5E9] text-[#1B4332] flex items-center justify-center font-bold">
              <PlusCircle className="w-5 h-5 text-[#2D6A4F]" />
            </div>
            <div>
              <h2 className="text-lg font-black text-[#1B4332]">
                {t('buyerPostDemandTitle')}
              </h2>
              <p className="text-xs text-[#4B5563]">
                {t('buyerPostDemandSubtitle')}
              </p>
            </div>
          </div>

          <form onSubmit={handlePostDemandSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Target Crop */}
              <div>
                <label className="block text-xs font-bold text-[#374151] mb-1">
                  {t('labelTargetCrop')}
                </label>
                <select
                  value={demandCrop}
                  onChange={(e) => setDemandCrop(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D1D5DB] text-xs font-bold text-[#111827] outline-none focus:ring-2 focus:ring-[#40916C]"
                >
                  {PRODUCE_CATALOG.map((p) => (
                    <option key={p.key} value={p.key}>
                      {p.name[language] || p.name.en} (Benchmark: ₹{p.baseBenchmarkPrice}/kg)
                    </option>
                  ))}
                </select>
              </div>

              {/* Required Volume */}
              <div>
                <label className="block text-xs font-bold text-[#374151] mb-1">
                  {t('labelRequiredVolume')}
                </label>
                <input
                  type="number"
                  step="500"
                  value={demandVolume}
                  onChange={(e) => setDemandVolume(parseInt(e.target.value, 10) || 0)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D1D5DB] text-xs font-bold text-[#111827] outline-none focus:ring-2 focus:ring-[#40916C]"
                  placeholder="5000"
                />
              </div>

              {/* Quality Grade */}
              <div>
                <label className="block text-xs font-bold text-[#374151] mb-1">
                  {t('labelGradeRequirement')}
                </label>
                <select
                  value={demandGrade}
                  onChange={(e) => setDemandGrade(e.target.value as ProduceGrade)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D1D5DB] text-xs font-bold text-[#111827] outline-none focus:ring-2 focus:ring-[#40916C]"
                >
                  <option value="Grade A">{t('gradeA')}</option>
                  <option value="Grade B">{t('gradeB')}</option>
                  <option value="Mixed">{t('gradeMixed')}</option>
                </select>
              </div>

              {/* Target Max Price */}
              <div>
                <label className="block text-xs font-bold text-[#374151] mb-1">
                  {t('labelTargetMaxPrice')}
                </label>
                <input
                  type="number"
                  value={demandMaxPrice}
                  onChange={(e) => setDemandMaxPrice(parseInt(e.target.value, 10) || 0)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D1D5DB] text-xs font-bold text-[#111827] outline-none focus:ring-2 focus:ring-[#40916C]"
                  placeholder="34"
                />
              </div>

              {/* Destination Wholesale Hub */}
              <div>
                <label className="block text-xs font-bold text-[#374151] mb-1">
                  {t('labelDeliveryHub')}
                </label>
                <input
                  type="text"
                  value={demandHub}
                  onChange={(e) => setDemandHub(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D1D5DB] text-xs font-medium text-[#111827] outline-none"
                />
              </div>

              {/* Target Delivery Date */}
              <div>
                <label className="block text-xs font-bold text-[#374151] mb-1">
                  {t('labelDeliveryDate')}
                </label>
                <input
                  type="date"
                  value={demandDate}
                  onChange={(e) => setDemandDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D1D5DB] text-xs font-medium text-[#111827] outline-none"
                />
              </div>
            </div>

            {/* Special Instructions */}
            <div>
              <label className="block text-xs font-bold text-[#374151] mb-1">
                {t('labelSpecialInstructions')}
              </label>
              <textarea
                rows={2}
                value={demandSpecialInstructions}
                onChange={(e) => setDemandSpecialInstructions(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#D1D5DB] text-xs font-medium text-[#111827] outline-none"
                placeholder="e.g. Cold-chain reefer mandatory, 20kg crates"
              />
            </div>

            {/* Escrow Commitment Preview */}
            <div className="p-4 rounded-xl bg-[#E8F5E9] border border-[#B7E4C7] flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-[#1B4332] block">
                  Total Escrow Commitment
                </span>
                <span className="text-[10px] text-[#2D6A4F]">
                  {demandVolume.toLocaleString()} kg × ₹{demandMaxPrice}/kg max cap
                </span>
              </div>
              <span className="text-xl font-black text-[#1B4332]">
                ₹{(demandVolume * demandMaxPrice).toLocaleString()}
              </span>
            </div>

            <div className="pt-2 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setActiveTab('batches')}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-[#4B5563] hover:bg-[#F3F4F6]"
              >
                {t('btnCancel')}
              </button>
              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#1B4332] hover:bg-[#2D6A4F] text-white text-xs font-black shadow-md shadow-[#1B4332]/20 transition-all hover:scale-[1.02]"
              >
                <span>{t('btnSubmitDemand')}</span>
                <ArrowRight className="w-4 h-4 text-[#74C69D]" />
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 3: MY POSTED DEMANDS & MATCHED FPO BATCHES */}
      {activeTab === 'myDemands' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-5 md:p-6 border border-[#E5E7EB] shadow-xs">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#F3F4F6]">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#2D6A4F]" />
                <h2 className="text-base font-black text-[#1B4332]">
                  Active Procurement Requirements & Supply Matches
                </h2>
              </div>
              <button
                onClick={() => setActiveTab('postDemand')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#E8F5E9] text-[#1B4332] text-xs font-bold border border-[#B7E4C7]"
              >
                <PlusCircle className="w-3.5 h-3.5 text-[#2D6A4F]" />
                <span>Post New Demand</span>
              </button>
            </div>

            <div className="space-y-4">
              {buyerDemands.map((demand) => {
                const prod = getProduceByKey(demand.produceKey) || PRODUCE_CATALOG[0];
                const matchingBatch = aggregatedBatches.find(
                  (b) => b.produceKey === demand.produceKey && (b.status === 'ReadyForBuyer' || b.status === 'Matched')
                );

                return (
                  <div
                    key={demand.id}
                    className="p-5 rounded-2xl border border-[#E5E7EB] bg-[#F8FAF8] hover:bg-white transition-all space-y-4 shadow-xs"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
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
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-black text-[#1B4332]">
                              {prod.name[language] || prod.name.en}
                            </h3>
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-[#E8F5E9] text-[#1B4332]">
                              {demand.requiredWeightKg.toLocaleString()} kg Required
                            </span>
                          </div>
                          <p className="text-xs text-[#4B5563] font-medium mt-0.5">
                            {demand.destinationHub} • Max ₹{demand.targetMaxPricePerKg}/kg • Due: {demand.deliveryDate || 'Within 24h'}
                          </p>
                          {demand.specialInstructions && (
                            <p className="text-[11px] text-[#6B7280] italic mt-0.5">
                              Note: {demand.specialInstructions}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#E8F5E9] text-[#1B4332] border border-[#B7E4C7]">
                          Status: {demand.status}
                        </span>
                      </div>
                    </div>

                    {/* Matching Engine Output Card */}
                    {matchingBatch && (
                      <div className="p-3.5 rounded-xl bg-[#E8F5E9]/60 border border-[#B7E4C7] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-[#2D6A4F]" />
                            <span className="text-xs font-black text-[#1B4332]">
                              Available FPO Match: {matchingBatch.fpoName} ({matchingBatch.totalWeightKg.toLocaleString()} kg)
                            </span>
                          </div>
                          <p className="text-[11px] text-[#4B5563] mt-0.5">
                            Rate: ₹{matchingBatch.fpoBasePricePerKg}/kg • {t('batchCompatibilityScore')}: <strong>96% Direct Hub Dispatch</strong>
                          </p>
                        </div>

                        {demand.status === 'Open' && (
                          <button
                            onClick={() => acceptMatchedSupplyForDemand(demand.id, matchingBatch.id)}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1B4332] hover:bg-[#2D6A4F] text-white text-xs font-black shadow-xs transition-all"
                          >
                            <Lock className="w-3.5 h-3.5 text-[#74C69D]" />
                            <span>{t('btnAcceptMatchedSupply')}</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
