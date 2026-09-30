'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { PRODUCE_CATALOG, getProduceByKey } from '@/lib/catalog';
import { ProduceImage } from '@/components/common/ProduceImage';
import { SubscriptionFrequency } from '@/types';
import {
  ShoppingBag,
  Zap,
  Users,
  Calendar,
  Plus,
  Minus,
  CheckCircle2,
  Clock,
  Sparkles,
  TrendingDown,
  Building2,
  CreditCard,
  Banknote,
  Smartphone,
  ShieldCheck,
  ChevronRight,
  ArrowRight,
  Receipt,
  X,
} from 'lucide-react';

export const ConsumerPortal: React.FC = () => {
  const {
    language,
    t,
    cart,
    addToCart,
    updateCartQuantity,
    clearCart,
    placeConsumerOrder,
    communityClusters,
    activeClusterId,
    setActiveClusterId,
    joinCommunityClusterOrder,
    subscriptionBasket,
    updateSubscriptionBasket,
    currentUser,
  } = useApp();

  const [activeMode, setActiveMode] = useState<'modeA' | 'modeB' | 'modeC'>('modeA');
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'UPI' | 'Card' | 'COD'>('UPI');

  // Subscription local customization
  const [subFreq, setSubFreq] = useState<SubscriptionFrequency>(subscriptionBasket.frequency);
  const [subSlot, setSubSlot] = useState<string>(subscriptionBasket.timeSlot);
  const [subItems, setSubItems] = useState(subscriptionBasket.items);

  const activeCluster = communityClusters.find((c) => c.id === activeClusterId) || communityClusters[0];

  // Cart Calculations
  const cartItemCount = cart.reduce((acc, i) => acc + i.quantityKg, 0);
  const cartSubtotal = cart.reduce((acc, i) => {
    const p = getProduceByKey(i.produceKey) || PRODUCE_CATALOG[0];
    const unitRate = activeMode === 'modeB' ? Math.round(p.baseBenchmarkPrice * 0.8) : p.baseBenchmarkPrice;
    return acc + i.quantityKg * unitRate;
  }, 0);
  const deliveryFee = cartSubtotal > 300 || activeMode === 'modeB' ? 0 : 25;
  const cartGrandTotal = cartSubtotal + deliveryFee;

  const handleCheckout = () => {
    placeConsumerOrder(selectedPaymentMethod, activeMode === 'modeB');
    setIsCartDrawerOpen(false);
  };

  const handleSubItemQtyChange = (key: string, delta: number) => {
    setSubItems((prev) =>
      prev.map((item) => {
        if (item.produceKey === key) {
          const newQty = Math.max(0.5, Number((item.quantityKg + delta).toFixed(1)));
          return { ...item, quantityKg: newQty };
        }
        return item;
      })
    );
  };

  const saveSubscription = () => {
    const monthlyCost = subItems.reduce((acc, i) => {
      const p = getProduceByKey(i.produceKey) || PRODUCE_CATALOG[0];
      const factor = subFreq === 'daily' ? 30 : subFreq === 'alternate' ? 15 : 8;
      return acc + i.quantityKg * p.baseBenchmarkPrice * factor;
    }, 0);

    updateSubscriptionBasket({
      frequency: subFreq,
      timeSlot: subSlot,
      items: subItems,
      monthlyEstimateRupees: Math.round(monthlyCost),
      monthlySupermarketSavings: Math.round(monthlyCost * 0.35),
      isActive: true,
    });
  };

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-300">
      {/* Consumer Portal Header */}
      <div className="bg-white rounded-2xl p-5 md:p-6 border border-[#E5E7EB] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#1B4332] to-[#2D6A4F] text-white flex items-center justify-center font-black text-lg shadow-md shadow-[#1B4332]/15">
            <ShoppingBag className="w-6 h-6 text-[#74C69D]" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg md:text-xl font-black text-[#1B4332]">
                {currentUser.name}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#E8F5E9] text-[#2D6A4F] border border-[#B7E4C7]">
                Consumer ID: {currentUser.identifier}
              </span>
            </div>
            <p className="text-xs text-[#4B5563] mt-0.5 font-medium">
              {currentUser.location} • {t('consumerSubtitle')}
            </p>
          </div>
        </div>

        {/* View Cart Button */}
        <button
          onClick={() => setIsCartDrawerOpen(true)}
          className="relative flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1B4332] hover:bg-[#2D6A4F] text-white text-xs font-black shadow-md shadow-[#1B4332]/20 transition-all hover:scale-[1.02]"
        >
          <ShoppingBag className="w-4 h-4 text-[#74C69D]" />
          <span>{t('cartDrawerTitle')}</span>
          {cart.length > 0 && (
            <span className="w-5 h-5 rounded-full bg-[#52B788] text-[#1B4332] text-[10px] font-black flex items-center justify-center ml-1">
              {cart.length}
            </span>
          )}
        </button>
      </div>

      {/* 3 Shopping Mode Selector Pills */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Mode A */}
        <button
          onClick={() => setActiveMode('modeA')}
          className={`p-4 rounded-2xl border text-left transition-all ${
            activeMode === 'modeA'
              ? 'bg-[#1B4332] text-white border-[#1B4332] shadow-md ring-2 ring-[#74C69D]/30'
              : 'bg-white text-[#111827] border-[#E5E7EB] hover:border-[#74C69D]'
          }`}
        >
          <div className="flex items-center gap-2 mb-1">
            <Zap className={`w-4 h-4 ${activeMode === 'modeA' ? 'text-[#74C69D]' : 'text-[#2D6A4F]'}`} />
            <h3 className="text-sm font-black">{t('modeA_Title')}</h3>
          </div>
          <p className={`text-xs ${activeMode === 'modeA' ? 'text-white/80' : 'text-[#4B5563]'}`}>
            {t('modeA_Sub')}
          </p>
        </button>

        {/* Mode B */}
        <button
          onClick={() => setActiveMode('modeB')}
          className={`p-4 rounded-2xl border text-left transition-all ${
            activeMode === 'modeB'
              ? 'bg-[#1B4332] text-white border-[#1B4332] shadow-md ring-2 ring-[#74C69D]/30'
              : 'bg-white text-[#111827] border-[#E5E7EB] hover:border-[#74C69D]'
          }`}
        >
          <div className="flex items-center gap-2 mb-1">
            <Users className={`w-4 h-4 ${activeMode === 'modeB' ? 'text-[#74C69D]' : 'text-[#2D6A4F]'}`} />
            <h3 className="text-sm font-black">{t('modeB_Title')}</h3>
          </div>
          <p className={`text-xs ${activeMode === 'modeB' ? 'text-white/80' : 'text-[#4B5563]'}`}>
            {t('modeB_Sub')}
          </p>
        </button>

        {/* Mode C */}
        <button
          onClick={() => setActiveMode('modeC')}
          className={`p-4 rounded-2xl border text-left transition-all ${
            activeMode === 'modeC'
              ? 'bg-[#1B4332] text-white border-[#1B4332] shadow-md ring-2 ring-[#74C69D]/30'
              : 'bg-white text-[#111827] border-[#E5E7EB] hover:border-[#74C69D]'
          }`}
        >
          <div className="flex items-center gap-2 mb-1">
            <Calendar className={`w-4 h-4 ${activeMode === 'modeC' ? 'text-[#74C69D]' : 'text-[#2D6A4F]'}`} />
            <h3 className="text-sm font-black">{t('modeC_Title')}</h3>
          </div>
          <p className={`text-xs ${activeMode === 'modeC' ? 'text-white/80' : 'text-[#4B5563]'}`}>
            {t('modeC_Sub')}
          </p>
        </button>
      </div>

      {/* MODE A: INSTANT ZEPTO-STYLE QUICK COMMERCE */}
      {activeMode === 'modeA' && (
        <div className="space-y-6">
          {/* 45 Mins Delivery Banner */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-[#1B4332] to-[#2D6A4F] text-white flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-[#52B788] animate-ping" />
              <span className="text-xs md:text-sm font-black">
                {t('deliveryEtaBanner')}
              </span>
            </div>
            <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-white/20">
              Salem Farm Hub #01
            </span>
          </div>

          {/* 8 Commodities Catalog Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {PRODUCE_CATALOG.map((item) => {
              const inCart = cart.find((i) => i.produceKey === item.key);
              const qtyInCart = inCart ? inCart.quantityKg : 0;

              return (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl border border-[#E5E7EB] p-4 shadow-xs hover:border-[#74C69D] transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="w-full h-40 rounded-xl overflow-hidden relative mb-3">
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

                    <h3 className="text-sm font-black text-[#1B4332]">
                      {item.name[language] || item.name.en}
                    </h3>
                    <p className="text-xs text-[#4B5563] font-medium mt-0.5">
                      {item.subtitle[language] || item.subtitle.en}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#E5E7EB] flex items-center justify-between">
                    <div>
                      <span className="text-sm font-black text-[#1B4332]">
                        ₹{item.baseBenchmarkPrice}
                      </span>
                      <span className="text-[11px] font-medium text-[#4B5563]"> / kg</span>
                    </div>

                    {qtyInCart > 0 ? (
                      <div className="flex items-center gap-2 bg-[#E8F5E9] border border-[#B7E4C7] rounded-xl px-2 py-1">
                        <button
                          onClick={() => addToCart(item.key, -0.5)}
                          className="w-6 h-6 rounded-lg bg-white flex items-center justify-center text-[#1B4332] font-bold hover:bg-[#D8F3DC]"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-black text-[#1B4332] min-w-[32px] text-center">
                          {qtyInCart} kg
                        </span>
                        <button
                          onClick={() => addToCart(item.key, 0.5)}
                          className="w-6 h-6 rounded-lg bg-white flex items-center justify-center text-[#1B4332] font-bold hover:bg-[#D8F3DC]"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => addToCart(item.key, 1.0)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1B4332] hover:bg-[#2D6A4F] text-white text-xs font-bold transition-all shadow-xs"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>{t('btnAddToCart')}</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MODE B: APARTMENT & HOUSING SOCIETY CLUSTER (GROUP BUYING) */}
      {activeMode === 'modeB' && (
        <div className="space-y-6">
          {/* Cluster Selector & Pooled Progress Card */}
          <div className="bg-white rounded-2xl p-6 border border-[#E5E7EB] shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold text-[#4B5563] uppercase tracking-wider block">
                  {t('selectClusterLabel')}
                </span>
                <select
                  value={activeClusterId}
                  onChange={(e) => setActiveClusterId(e.target.value)}
                  className="mt-1 px-3.5 py-2.5 rounded-xl border border-[#D1D5DB] text-xs font-bold text-[#111827] outline-none"
                >
                  {communityClusters.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.activeHouseholds} Households participating)
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-3 py-1.5 rounded-xl bg-[#E8F5E9] text-[#1B4332] text-xs font-black border border-[#B7E4C7] flex items-center gap-1.5">
                  <TrendingDown className="w-4 h-4 text-[#2D6A4F]" />
                  20% Wholesale Discount & Zero Delivery Fee
                </span>
              </div>
            </div>

            {/* Community Progress Bar */}
            <div className="p-4 rounded-xl bg-[#F8FAF8] border border-[#E5E7EB] space-y-2">
              <div className="flex justify-between text-xs">
                <span className="font-bold text-[#1B4332]">{t('clusterProgressTitle')}</span>
                <span className="font-black text-[#2D6A4F]">
                  {activeCluster.currentPooledKg} kg / {activeCluster.targetThresholdKg} kg
                </span>
              </div>
              <div className="w-full h-3 rounded-full bg-[#E5E7EB] overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#40916C] to-[#52B788] rounded-full transition-all duration-500"
                  style={{ width: `${(activeCluster.currentPooledKg / activeCluster.targetThresholdKg) * 100}%` }}
                />
              </div>
              <p className="text-[11px] text-[#4B5563]">
                {activeCluster.targetThresholdKg - activeCluster.currentPooledKg} kg {t('neededForDiscount')}
              </p>
            </div>
          </div>

          {/* Catalog with Group-Buying 20% Discount */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {PRODUCE_CATALOG.map((item) => {
              const clusterPrice = Math.round(item.baseBenchmarkPrice * 0.8);
              return (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl border border-[#B7E4C7] p-4 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="w-full h-36 rounded-xl overflow-hidden relative mb-3">
                      <ProduceImage
                        src={item.imageUrl}
                        alt={item.name[language] || item.name.en}
                        className="w-full h-full"
                        category={item.category}
                      />
                      <span className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-[#52B788] text-[#1B4332] text-[10px] font-black">
                        -20% Group Price
                      </span>
                    </div>

                    <h3 className="text-sm font-black text-[#1B4332]">
                      {item.name[language] || item.name.en}
                    </h3>
                  </div>

                  <div className="mt-3 pt-3 border-t border-[#E5E7EB] flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-[#9CA3AF] line-through block">
                        ₹{item.baseBenchmarkPrice}/kg
                      </span>
                      <span className="text-sm font-black text-[#2D6A4F]">
                        ₹{clusterPrice} / kg
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        addToCart(item.key, 2.0);
                        joinCommunityClusterOrder(activeCluster.id, 2.0);
                      }}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#2D6A4F] hover:bg-[#1B4332] text-white text-xs font-bold transition-all"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>{t('btnJoinCluster')} (2kg)</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MODE C: COUNTRY DELIGHT RECURRING SUBSCRIPTION BASKET */}
      {activeMode === 'modeC' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left 7 cols: Basket Builder */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-white rounded-2xl p-6 border border-[#E5E7EB] shadow-xs space-y-5">
              <div>
                <h2 className="text-base font-black text-[#1B4332]">
                  {t('subBuilderTitle')}
                </h2>
                <p className="text-xs text-[#4B5563] mt-0.5">
                  {t('subBuilderSub')}
                </p>
              </div>

              {/* Delivery Frequency Toggle */}
              <div>
                <label className="block text-xs font-bold text-[#374151] mb-1.5">
                  {t('subFrequencyLabel')}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    onClick={() => setSubFreq('daily')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                      subFreq === 'daily'
                        ? 'bg-[#1B4332] text-white border-[#1B4332]'
                        : 'bg-[#F8FAF8] text-[#4B5563] border-[#E5E7EB]'
                    }`}
                  >
                    {t('freqDaily')}
                  </button>
                  <button
                    onClick={() => setSubFreq('alternate')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                      subFreq === 'alternate'
                        ? 'bg-[#1B4332] text-white border-[#1B4332]'
                        : 'bg-[#F8FAF8] text-[#4B5563] border-[#E5E7EB]'
                    }`}
                  >
                    {t('freqAlternate')}
                  </button>
                  <button
                    onClick={() => setSubFreq('weekends')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                      subFreq === 'weekends'
                        ? 'bg-[#1B4332] text-white border-[#1B4332]'
                        : 'bg-[#F8FAF8] text-[#4B5563] border-[#E5E7EB]'
                    }`}
                  >
                    {t('freqWeekends')}
                  </button>
                </div>
              </div>

              {/* Time Slot Picker */}
              <div>
                <label className="block text-xs font-bold text-[#374151] mb-1.5">
                  {t('timeSlotLabel')}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setSubSlot('6:00 AM - 7:30 AM')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border flex items-center justify-center gap-2 ${
                      subSlot.includes('6:00')
                        ? 'bg-[#E8F5E9] text-[#1B4332] border-[#74C69D]'
                        : 'bg-[#F8FAF8] text-[#4B5563] border-[#E5E7EB]'
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5 text-[#2D6A4F]" />
                    <span>{t('morningSlot')}</span>
                  </button>
                  <button
                    onClick={() => setSubSlot('5:30 PM - 7:00 PM')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border flex items-center justify-center gap-2 ${
                      subSlot.includes('5:30')
                        ? 'bg-[#E8F5E9] text-[#1B4332] border-[#74C69D]'
                        : 'bg-[#F8FAF8] text-[#4B5563] border-[#E5E7EB]'
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5 text-[#2D6A4F]" />
                    <span>{t('eveningSlot')}</span>
                  </button>
                </div>
              </div>

              {/* Produce Recurring Quantities */}
              <div className="space-y-3 pt-3 border-t border-[#E5E7EB]">
                <h3 className="text-xs font-bold text-[#374151] uppercase tracking-wider">
                  Adjust Basket Items Per Delivery
                </h3>
                {subItems.map((item) => {
                  const prod = getProduceByKey(item.produceKey) || PRODUCE_CATALOG[0];

                  return (
                    <div
                      key={item.produceKey}
                      className="p-3 rounded-xl bg-[#F8FAF8] border border-[#E5E7EB] flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg overflow-hidden relative shrink-0 border border-[#E5E7EB]">
                          <ProduceImage
                            src={prod.imageUrl}
                            alt={prod.name[language] || prod.name.en}
                            className="w-full h-full"
                            category={prod.category}
                          />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-[#1B4332]">
                            {prod.name[language] || prod.name.en}
                          </h4>
                          <span className="text-[10px] text-[#6B7280]">
                            ₹{prod.baseBenchmarkPrice}/kg
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleSubItemQtyChange(item.produceKey, -0.5)}
                          className="w-7 h-7 rounded-lg bg-white border border-[#D1D5DB] flex items-center justify-center text-[#1B4332] font-bold"
                        >
                          -
                        </button>
                        <span className="text-xs font-black min-w-[35px] text-center">
                          {item.quantityKg} kg
                        </span>
                        <button
                          onClick={() => handleSubItemQtyChange(item.produceKey, 0.5)}
                          className="w-7 h-7 rounded-lg bg-white border border-[#D1D5DB] flex items-center justify-center text-[#1B4332] font-bold"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right 5 cols: Monthly Wallet & Savings Card */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-gradient-to-br from-[#1B4332] to-[#2D6A4F] text-white rounded-2xl p-6 shadow-md border border-[#40916C]/40 space-y-5">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#74C69D]" />
                <h3 className="text-base font-black">
                  {t('monthlyWalletTitle')}
                </h3>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between text-white/80">
                  <span>{t('estimatedMonthlyCost')}:</span>
                  <span className="font-bold text-white text-sm">₹{subscriptionBasket.monthlyEstimateRupees}</span>
                </div>
                <div className="flex justify-between text-white/80">
                  <span>{t('supermarketCost')}:</span>
                  <span className="font-bold text-white/60 line-through">
                    ₹{subscriptionBasket.monthlyEstimateRupees + subscriptionBasket.monthlySupermarketSavings}
                  </span>
                </div>
                <div className="pt-3 border-t border-white/20 flex justify-between items-center">
                  <span className="font-bold text-[#74C69D]">{t('monthlySavingsTag')}:</span>
                  <span className="text-xl font-black text-[#52B788]">
                    +₹{subscriptionBasket.monthlySupermarketSavings} / mo
                  </span>
                </div>
              </div>

              <div className="p-3 bg-white/10 rounded-xl border border-white/15 text-[11px] space-y-1">
                <p className="font-bold text-[#74C69D]">✓ Zero Delivery Charges</p>
                <p className="text-white/80">✓ Harvested fresh at 4:00 AM in Salem farms</p>
                <p className="text-white/80">✓ Pause or modify delivery anytime with 1-tap</p>
              </div>

              <button
                onClick={saveSubscription}
                className="w-full py-3 rounded-xl bg-[#52B788] hover:bg-[#74C69D] text-[#1B4332] text-xs font-black transition-all shadow-md"
              >
                {t('btnActivateSubscription')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* LIVE CART DRAWER MODAL */}
      {isCartDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between overflow-hidden">
            {/* Drawer Header */}
            <div className="bg-[#1B4332] p-5 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <ShoppingBag className="w-5 h-5 text-[#74C69D]" />
                <h3 className="text-base font-bold">{t('cartDrawerTitle')}</h3>
              </div>
              <button
                onClick={() => setIsCartDrawerOpen(false)}
                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cart Body */}
            <div className="p-5 flex-1 overflow-y-auto space-y-4">
              {cart.length === 0 ? (
                <div className="text-center py-12 text-xs text-[#6B7280]">
                  {t('cartEmpty')}
                </div>
              ) : (
                <div className="space-y-3">
                  {cart.map((item) => {
                    const prod = getProduceByKey(item.produceKey) || PRODUCE_CATALOG[0];

                    return (
                      <div
                        key={item.produceKey}
                        className="p-3.5 rounded-xl border border-[#E5E7EB] bg-[#F8FAF8] flex items-center justify-between gap-3"
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
                            <h4 className="text-xs font-black text-[#1B4332]">
                              {prod.name[language] || prod.name.en}
                            </h4>
                            <span className="text-[11px] text-[#4B5563]">
                              ₹{prod.baseBenchmarkPrice} / kg
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => addToCart(item.produceKey, -0.5)}
                            className="w-6 h-6 rounded bg-white border border-[#D1D5DB] flex items-center justify-center text-xs font-bold"
                          >
                            -
                          </button>
                          <span className="text-xs font-bold min-w-[28px] text-center">
                            {item.quantityKg} kg
                          </span>
                          <button
                            onClick={() => addToCart(item.produceKey, 0.5)}
                            className="w-6 h-6 rounded bg-white border border-[#D1D5DB] flex items-center justify-center text-xs font-bold"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Payment Method Selector */}
              {cart.length > 0 && (
                <div className="pt-4 border-t border-[#E5E7EB] space-y-2">
                  <span className="text-xs font-bold text-[#374151] block">
                    Select Payment Method
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => setSelectedPaymentMethod('UPI')}
                      className={`p-2.5 rounded-xl text-xs font-bold border text-center ${
                        selectedPaymentMethod === 'UPI'
                          ? 'bg-[#E8F5E9] text-[#1B4332] border-[#40916C]'
                          : 'bg-[#F8FAF8] text-[#4B5563] border-[#E5E7EB]'
                      }`}
                    >
                      {t('payUPI')}
                    </button>
                    <button
                      onClick={() => setSelectedPaymentMethod('Card')}
                      className={`p-2.5 rounded-xl text-xs font-bold border text-center ${
                        selectedPaymentMethod === 'Card'
                          ? 'bg-[#E8F5E9] text-[#1B4332] border-[#40916C]'
                          : 'bg-[#F8FAF8] text-[#4B5563] border-[#E5E7EB]'
                      }`}
                    >
                      {t('payCard')}
                    </button>
                    <button
                      onClick={() => setSelectedPaymentMethod('COD')}
                      className={`p-2.5 rounded-xl text-xs font-bold border text-center ${
                        selectedPaymentMethod === 'COD'
                          ? 'bg-[#E8F5E9] text-[#1B4332] border-[#40916C]'
                          : 'bg-[#F8FAF8] text-[#4B5563] border-[#E5E7EB]'
                      }`}
                    >
                      {t('payCOD')}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Drawer Footer & Checkout */}
            {cart.length > 0 && (
              <div className="p-5 bg-[#F8FAF8] border-t border-[#E5E7EB] space-y-3">
                <div className="space-y-1.5 text-xs text-[#4B5563]">
                  <div className="flex justify-between">
                    <span>{t('itemSubtotal')}</span>
                    <span className="font-bold text-[#111827]">₹{cartSubtotal}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t('sharedDeliveryFee')}</span>
                    <span className="font-bold text-[#2D6A4F]">
                      {deliveryFee === 0 ? t('freeDeliveryTag') : `₹${deliveryFee}`}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-[#E5E7EB] flex justify-between text-sm font-black text-[#1B4332]">
                    <span>{t('cartTotal')}</span>
                    <span>₹{cartGrandTotal}</span>
                  </div>
                </div>

                <button
                  onClick={handleCheckout}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#1B4332] hover:bg-[#2D6A4F] text-white text-xs font-black shadow-md shadow-[#1B4332]/20 transition-all"
                >
                  <span>{t('btnInstantCheckout')} (₹{cartGrandTotal})</span>
                  <ArrowRight className="w-4 h-4 text-[#74C69D]" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
