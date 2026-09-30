'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  LanguageCode,
  UserRole,
  UserProfile,
  FarmerLot,
  AggregatedBatch,
  BuyerDemand,
  TransitMission,
  SettlementRecord,
  TransitMilestone,
  CartItem,
  ConsumerOrder,
  CommunityCluster,
  SubscriptionBasket,
} from '@/types';
import {
  DEMO_USERS,
  INITIAL_FARMER_LOTS,
  INITIAL_AGGREGATED_BATCHES,
  INITIAL_BUYER_DEMANDS,
  INITIAL_TRANSIT_MISSION,
  INITIAL_SETTLEMENT_RECORD,
  COMMUNITY_CLUSTERS,
  INITIAL_SUBSCRIPTION_BASKET,
} from '@/lib/demoData';
import { getTranslation } from '@/lib/translations';

interface AppContextType {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  t: (key: string, fallback?: string) => string;
  currentUser: UserProfile;
  currentRole: UserRole;
  switchRole: (role: UserRole) => void;
  switchUser: (user: UserProfile) => void;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;

  // Domain state
  farmerLots: FarmerLot[];
  aggregatedBatches: AggregatedBatch[];
  buyerDemands: BuyerDemand[];
  transitMission: TransitMission;
  settlements: SettlementRecord[];

  // Farmer Actions
  addFarmerLot: (lot: Omit<FarmerLot, 'id' | 'createdAt' | 'status' | 'grossEstimatedValue' | 'netEstimatedCashInHand' | 'sharedLogisticsCost' | 'fpoHandlingCost' | 'platformCoordinationFee'>) => FarmerLot;
  qcVerifyLot: (lotId: string) => void;
  createAggregatedBatch: (lotIds: string[], targetLocation?: string) => AggregatedBatch;

  // Buyer Actions
  postBuyerDemand: (demand: Omit<BuyerDemand, 'id' | 'createdAt' | 'buyerId' | 'buyerName' | 'status'>) => BuyerDemand;
  buyBatchAndLockEscrow: (batchId: string, buyerId: string) => void;
  acceptMatchedSupplyForDemand: (demandId: string, batchId: string) => void;

  // Logistics & Settlement
  advanceTransitMilestone: () => void;
  activeSettlementRecord: SettlementRecord | null;
  setActiveSettlementRecord: (record: SettlementRecord | null) => void;

  // Consumer Marketplace State & Actions
  cart: CartItem[];
  addToCart: (produceKey: string, deltaKg?: number) => void;
  updateCartQuantity: (produceKey: string, quantityKg: number) => void;
  clearCart: () => void;
  consumerOrders: ConsumerOrder[];
  placeConsumerOrder: (paymentMethod: 'UPI' | 'Card' | 'COD', isClusterOrder?: boolean) => ConsumerOrder;
  communityClusters: CommunityCluster[];
  activeClusterId: string;
  setActiveClusterId: (id: string) => void;
  joinCommunityClusterOrder: (clusterId: string, addedWeightKg: number) => void;
  subscriptionBasket: SubscriptionBasket;
  updateSubscriptionBasket: (updated: Partial<SubscriptionBasket>) => void;

  // Voice playback & notifications
  speakText: (text: string, overrideLang?: LanguageCode) => void;
  isSpeaking: boolean;
  notification: string | null;
  setNotification: (msg: string | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const WAYPOINT_COORDINATES: Record<TransitMilestone, [number, number]> = {
  Scheduled: [11.6643, 78.146], // Salem Hub
  PickedUp: [12.1211, 78.1582], // Dharmapuri
  InTransit: [12.5255, 78.2144], // Krishnagiri
  Delivered: [13.0692, 80.1948], // Koyambedu Chennai
  Settled: [13.0692, 80.1948],
};

const WAYPOINT_DISTANCES: Record<TransitMilestone, { dist: number; eta: number; speed: number; temp: number }> = {
  Scheduled: { dist: 345, eta: 7.0, speed: 0, temp: 16.0 },
  PickedUp: { dist: 295, eta: 5.8, speed: 42, temp: 13.5 },
  InTransit: { dist: 238, eta: 4.5, speed: 54, temp: 12.4 },
  Delivered: { dist: 0, eta: 0.0, speed: 0, temp: 12.0 },
  Settled: { dist: 0, eta: 0.0, speed: 0, temp: 12.0 },
};

export function AppProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<LanguageCode>('en');
  const [currentUser, setCurrentUser] = useState<UserProfile>(DEMO_USERS.farmer);
  const [currentRole, setCurrentRole] = useState<UserRole>('farmer');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Core domain records
  const [farmerLots, setFarmerLots] = useState<FarmerLot[]>(INITIAL_FARMER_LOTS);
  const [aggregatedBatches, setAggregatedBatches] = useState<AggregatedBatch[]>(INITIAL_AGGREGATED_BATCHES);
  const [buyerDemands, setBuyerDemands] = useState<BuyerDemand[]>(INITIAL_BUYER_DEMANDS);
  const [transitMission, setTransitMission] = useState<TransitMission>(INITIAL_TRANSIT_MISSION);
  const [settlements, setSettlements] = useState<SettlementRecord[]>([INITIAL_SETTLEMENT_RECORD]);
  const [activeSettlementRecord, setActiveSettlementRecord] = useState<SettlementRecord | null>(null);

  // Consumer Marketplace State
  const [cart, setCart] = useState<CartItem[]>([
    { produceKey: 'veg_tomato', quantityKg: 1.0, unitPrice: 32 },
    { produceKey: 'veg_onion', quantityKg: 1.0, unitPrice: 36 },
  ]);
  const [consumerOrders, setConsumerOrders] = useState<ConsumerOrder[]>([]);
  const [communityClusters, setCommunityClusters] = useState<CommunityCluster[]>(COMMUNITY_CLUSTERS);
  const [activeClusterId, setActiveClusterId] = useState<string>('cluster_salem_01');
  const [subscriptionBasket, setSubscriptionBasket] = useState<SubscriptionBasket>(INITIAL_SUBSCRIPTION_BASKET);

  // Load persisted language and session on client mount
  useEffect(() => {
    try {
      const savedLang = localStorage.getItem('agriconnect_lang') as LanguageCode;
      if (savedLang && ['en', 'ta', 'te', 'ml', 'hi'].includes(savedLang)) {
        setLanguageState(savedLang);
      }
      const savedRole = localStorage.getItem('agriconnect_role') as UserRole;
      if (savedRole && DEMO_USERS[savedRole]) {
        setCurrentRole(savedRole);
        setCurrentUser(DEMO_USERS[savedRole]);
      }
    } catch {
      // Storage safety
    }
  }, []);

  const setLanguage = (lang: LanguageCode) => {
    setLanguageState(lang);
    try {
      localStorage.setItem('agriconnect_lang', lang);
    } catch {
      // no-op
    }
  };

  const switchRole = (role: UserRole) => {
    setCurrentRole(role);
    if (DEMO_USERS[role]) {
      setCurrentUser(DEMO_USERS[role]);
    }
    try {
      localStorage.setItem('agriconnect_role', role);
    } catch {
      // no-op
    }
  };

  const switchUser = (user: UserProfile) => {
    setCurrentUser(user);
    setCurrentRole(user.role);
    try {
      localStorage.setItem('agriconnect_role', user.role);
    } catch {
      // no-op
    }
  };

  const t = (key: string, fallback?: string): string => {
    return getTranslation(language, key, fallback);
  };

  // Speech Synthesis helper tuned for rural comprehension (rate 0.85)
  const speakText = (text: string, overrideLang?: LanguageCode) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return;
    }
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      const targetLang = overrideLang || language;
      const langCodes: Record<LanguageCode, string> = {
        en: 'en-IN',
        ta: 'ta-IN',
        te: 'te-IN',
        ml: 'ml-IN',
        hi: 'hi-IN',
      };
      utterance.lang = langCodes[targetLang] || 'en-IN';
      utterance.rate = 0.85; // Rural tuned slower pace
      utterance.pitch = 1.0;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
    } catch {
      setIsSpeaking(false);
    }
  };

  // Farmer creates a lot with explicit expected price
  const addFarmerLot = (lotData: Omit<FarmerLot, 'id' | 'createdAt' | 'status' | 'grossEstimatedValue' | 'netEstimatedCashInHand' | 'sharedLogisticsCost' | 'fpoHandlingCost' | 'platformCoordinationFee'>): FarmerLot => {
    const gross = lotData.quantityKg * lotData.expectedPricePerKg;
    const freight = Math.round(lotData.quantityKg * 1.8);
    const handling = Math.round(lotData.quantityKg * 0.4);
    const fee = Math.round(gross * 0.015);
    const net = gross - (freight + handling + fee);

    const newLot: FarmerLot = {
      ...lotData,
      id: `lot_slm_${Date.now().toString().slice(-4)}`,
      grossEstimatedValue: gross,
      sharedLogisticsCost: freight,
      fpoHandlingCost: handling,
      platformCoordinationFee: fee,
      netEstimatedCashInHand: net,
      status: 'Listed',
      createdAt: new Date().toISOString(),
    };

    setFarmerLots((prev) => [newLot, ...prev]);
    setNotification(t('successListing'));
    setTimeout(() => setNotification(null), 4000);
    return newLot;
  };

  // FPO verifies incoming lot
  const qcVerifyLot = (lotId: string) => {
    setFarmerLots((prev) =>
      prev.map((lot) => (lot.id === lotId ? { ...lot, status: 'Verified' } : lot))
    );
    setNotification('Lot quality inspected & verified (Grade Approved)!');
    setTimeout(() => setNotification(null), 3000);
  };

  // FPO aggregates lots into a commercial batch
  const createAggregatedBatch = (lotIds: string[], targetLocation = 'Salem FPO Consolidation Hub'): AggregatedBatch => {
    const selectedLots = farmerLots.filter((l) => lotIds.includes(l.id));
    const totalWeight = selectedLots.reduce((acc, l) => acc + l.quantityKg, 0) || 5000;
    const firstLot = selectedLots[0] || farmerLots[0];

    const newBatch: AggregatedBatch = {
      id: `batch_erd_${Date.now().toString().slice(-4)}`,
      fpoId: currentUser.id || 'usr_fpo_01',
      fpoName: currentUser.name || 'Salem-Erode Farmers Producer Co.',
      hubLocation: targetLocation,
      produceId: firstLot.produceId,
      produceKey: firstLot.produceKey,
      totalWeightKg: totalWeight,
      lotIds: lotIds,
      grade: firstLot.grade,
      fpoBasePricePerKg: firstLot.expectedPricePerKg,
      targetBuyerSegment: 'Direct Wholesale Hubs (Chennai Koyambedu)',
      status: 'ReadyForBuyer',
      clusteringCompatibilityScore: 97,
      createdAt: new Date().toISOString(),
      transshipmentHops: 0,
    };

    setAggregatedBatches((prev) => [newBatch, ...prev]);
    setFarmerLots((prev) =>
      prev.map((lot) => (lotIds.includes(lot.id) ? { ...lot, status: 'Batched', assignedBatchId: newBatch.id } : lot))
    );

    setNotification(t('successBatching'));
    setTimeout(() => setNotification(null), 4000);
    return newBatch;
  };

  // Buyer posts procurement requirement
  const postBuyerDemand = (demandData: Omit<BuyerDemand, 'id' | 'createdAt' | 'buyerId' | 'buyerName' | 'status'>): BuyerDemand => {
    const newDemand: BuyerDemand = {
      ...demandData,
      id: `demand_chn_${Date.now().toString().slice(-4)}`,
      buyerId: currentUser.id,
      buyerName: currentUser.name,
      status: 'Open',
      createdAt: new Date().toISOString(),
      compatibilityScore: 94,
    };

    setBuyerDemands((prev) => [newDemand, ...prev]);
    setNotification(t('demandSuccessToast'));
    setTimeout(() => setNotification(null), 4000);
    return newDemand;
  };

  // Wholesale Buyer procures batch and locks Escrow
  const buyBatchAndLockEscrow = (batchId: string, buyerId: string) => {
    setAggregatedBatches((prev) =>
      prev.map((b) => (b.id === batchId ? { ...b, status: 'Matched' } : b))
    );

    const targetBatch = aggregatedBatches.find((b) => b.id === batchId);
    if (targetBatch) {
      setBuyerDemands((prev) => [
        {
          id: `demand_chn_${Date.now().toString().slice(-4)}`,
          buyerId: buyerId,
          buyerName: currentUser.name,
          destinationHub: 'Koyambedu Wholesale Market, Chennai',
          produceId: targetBatch.produceId,
          produceKey: targetBatch.produceKey,
          requiredWeightKg: targetBatch.totalWeightKg,
          acceptableGrade: targetBatch.grade,
          targetMaxPricePerKg: targetBatch.fpoBasePricePerKg + 1.5,
          deliveryWindowHours: 12,
          deliveryDate: '2026-10-02',
          specialInstructions: 'Cold-chain Reefer Required',
          status: 'ContractSigned',
          createdAt: new Date().toISOString(),
          matchedBatchId: batchId,
          compatibilityScore: 98,
        },
        ...prev,
      ]);

      // Update farmer lots
      setFarmerLots((prev) =>
        prev.map((lot) =>
          targetBatch.lotIds.includes(lot.id) ? { ...lot, status: 'InTransit' } : lot
        )
      );

      // Reset transit mission
      setTransitMission({
        ...INITIAL_TRANSIT_MISSION,
        id: `msn_corridor_${Date.now().toString().slice(-4)}`,
        batchId: batchId,
        produceKey: targetBatch.produceKey,
        totalWeightKg: targetBatch.totalWeightKg,
        telemetry: {
          ...INITIAL_TRANSIT_MISSION.telemetry,
          currentMilestone: 'Scheduled',
          currentCoordinates: WAYPOINT_COORDINATES.Scheduled,
          remainingDistanceKm: WAYPOINT_DISTANCES.Scheduled.dist,
          etaHours: WAYPOINT_DISTANCES.Scheduled.eta,
          vehicleSpeedKmH: WAYPOINT_DISTANCES.Scheduled.speed,
          reeferTemperature: WAYPOINT_DISTANCES.Scheduled.temp,
        },
        status: 'Active',
      });
    }

    setNotification(t('successPurchased'));
    setTimeout(() => setNotification(null), 4000);
  };

  // Buyer accepts matched supply for posted demand
  const acceptMatchedSupplyForDemand = (demandId: string, batchId: string) => {
    setBuyerDemands((prev) =>
      prev.map((d) => (d.id === demandId ? { ...d, status: 'ContractSigned', matchedBatchId: batchId } : d))
    );
    buyBatchAndLockEscrow(batchId, currentUser.id);
  };

  // Advance Transit Milestone
  const advanceTransitMilestone = () => {
    const milestoneSequence: TransitMilestone[] = ['Scheduled', 'PickedUp', 'InTransit', 'Delivered', 'Settled'];
    const currentIndex = milestoneSequence.indexOf(transitMission.telemetry.currentMilestone);

    if (currentIndex < milestoneSequence.length - 1) {
      const nextMilestone = milestoneSequence[currentIndex + 1];
      const stats = WAYPOINT_DISTANCES[nextMilestone];
      const coords = WAYPOINT_COORDINATES[nextMilestone];

      const updatedHistory = transitMission.milestonesHistory.map((m, idx) => {
        if (idx <= currentIndex + 1) {
          return { ...m, completed: true, timestamp: m.timestamp === 'Pending' ? new Date().toISOString() : m.timestamp };
        }
        return m;
      });

      setTransitMission((prev) => ({
        ...prev,
        telemetry: {
          ...prev.telemetry,
          currentMilestone: nextMilestone,
          currentCoordinates: coords,
          remainingDistanceKm: stats.dist,
          etaHours: stats.eta,
          vehicleSpeedKmH: stats.speed,
          reeferTemperature: stats.temp,
          updatedAt: new Date().toISOString(),
        },
        milestonesHistory: updatedHistory,
        status: nextMilestone === 'Settled' ? 'Settled' : 'Active',
      }));

      // If Delivered or Settled, trigger settlement records
      if (nextMilestone === 'Delivered' || nextMilestone === 'Settled') {
        setFarmerLots((prev) =>
          prev.map((lot) => ({
            ...lot,
            status: nextMilestone === 'Settled' ? 'Settled' : 'Delivered',
          }))
        );

        const sampleLot = farmerLots[0];
        if (sampleLot && nextMilestone === 'Settled') {
          const gross = sampleLot.quantityKg * sampleLot.expectedPricePerKg;
          const freight = sampleLot.sharedLogisticsCost;
          const handling = sampleLot.fpoHandlingCost;
          const fee = sampleLot.platformCoordinationFee;
          const net = gross - (freight + handling + fee);
          const brokerRate = sampleLot.expectedPricePerKg * 0.6;
          const brokerGross = sampleLot.quantityKg * brokerRate;
          const surplus = net - brokerGross;

          const newSettlement: SettlementRecord = {
            id: `stl_tx_${Date.now().toString().slice(-6)}`,
            lotId: sampleLot.id,
            farmerId: sampleLot.farmerId,
            farmerName: sampleLot.farmerName,
            produceKey: sampleLot.produceKey,
            quantityKg: sampleLot.quantityKg,
            clearedRatePerKg: sampleLot.expectedPricePerKg,
            grossClearedValue: gross,
            sharedRouteFreight: freight,
            fpoWeighmentStorage: handling,
            platformFee: fee,
            farmerNetCashInHand: net,
            effectiveRatePerKg: Number((net / sampleLot.quantityKg).toFixed(2)),
            villageBrokerBaselineRate: Number(brokerRate.toFixed(2)),
            villageBrokerGross: Math.round(brokerGross),
            farmerSurplusGainRupees: Math.round(surplus),
            farmerSurplusGainPercentage: Number(((surplus / brokerGross) * 100).toFixed(1)),
            payoutStatus: 'Transferred to Bank Account (T+24h)',
            bankReferenceNumber: `UTR-AGRI-${Date.now().toString().slice(-8)}`,
            settledAt: new Date().toISOString(),
          };

          setSettlements((prev) => [newSettlement, ...prev]);
        }
      }

      setNotification(t('successMilestone'));
      setTimeout(() => setNotification(null), 3000);
    }
  };

  // Consumer Marketplace: Cart management
  const addToCart = (produceKey: string, deltaKg = 0.5) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.produceKey === produceKey);
      if (existing) {
        const newQty = Number((existing.quantityKg + deltaKg).toFixed(1));
        if (newQty <= 0) {
          return prev.filter((item) => item.produceKey !== produceKey);
        }
        return prev.map((item) => (item.produceKey === produceKey ? { ...item, quantityKg: newQty } : item));
      } else {
        return [...prev, { produceKey, quantityKg: deltaKg, unitPrice: 35 }];
      }
    });
  };

  const updateCartQuantity = (produceKey: string, quantityKg: number) => {
    setCart((prev) => {
      if (quantityKg <= 0) {
        return prev.filter((item) => item.produceKey !== produceKey);
      }
      return prev.map((item) => (item.produceKey === produceKey ? { ...item, quantityKg } : item));
    });
  };

  const clearCart = () => setCart([]);

  const placeConsumerOrder = (paymentMethod: 'UPI' | 'Card' | 'COD', isClusterOrder = false): ConsumerOrder => {
    const subtotal = cart.reduce((acc, item) => acc + item.quantityKg * item.unitPrice, 0);
    const discount = isClusterOrder ? Math.round(subtotal * 0.2) : 0;
    const delivery = isClusterOrder || subtotal > 300 ? 0 : 25;
    const total = subtotal - discount + delivery;

    const newOrder: ConsumerOrder = {
      id: `ord_csm_${Date.now().toString().slice(-5)}`,
      orderType: isClusterOrder ? 'cluster' : 'instant',
      items: [...cart],
      subtotal,
      deliveryCharge: delivery,
      discount,
      totalPaid: total,
      paymentMethod,
      status: 'Confirmed',
      etaMinutes: 45,
      createdAt: new Date().toISOString(),
    };

    setConsumerOrders((prev) => [newOrder, ...prev]);
    clearCart();
    setNotification(t('checkoutSuccess'));
    setTimeout(() => setNotification(null), 4000);
    return newOrder;
  };

  const joinCommunityClusterOrder = (clusterId: string, addedWeightKg: number) => {
    setCommunityClusters((prev) =>
      prev.map((c) =>
        c.id === clusterId
          ? {
              ...c,
              currentPooledKg: Math.min(c.targetThresholdKg, c.currentPooledKg + addedWeightKg),
              activeHouseholds: c.activeHouseholds + 1,
            }
          : c
      )
    );
    setNotification(t('joinedClusterToast'));
    setTimeout(() => setNotification(null), 3000);
  };

  const updateSubscriptionBasket = (updated: Partial<SubscriptionBasket>) => {
    setSubscriptionBasket((prev) => ({
      ...prev,
      ...updated,
    }));
    setNotification(t('subActivatedToast'));
    setTimeout(() => setNotification(null), 3000);
  };

  return (
    <AppContext.Provider
      value={{
        language,
        setLanguage,
        t,
        currentUser,
        currentRole,
        switchRole,
        switchUser,
        isAuthModalOpen,
        setIsAuthModalOpen,
        farmerLots,
        aggregatedBatches,
        buyerDemands,
        transitMission,
        settlements,
        addFarmerLot,
        qcVerifyLot,
        createAggregatedBatch,
        postBuyerDemand,
        buyBatchAndLockEscrow,
        acceptMatchedSupplyForDemand,
        advanceTransitMilestone,
        activeSettlementRecord,
        setActiveSettlementRecord,
        cart,
        addToCart,
        updateCartQuantity,
        clearCart,
        consumerOrders,
        placeConsumerOrder,
        communityClusters,
        activeClusterId,
        setActiveClusterId,
        joinCommunityClusterOrder,
        subscriptionBasket,
        updateSubscriptionBasket,
        speakText,
        isSpeaking,
        notification,
        setNotification,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
