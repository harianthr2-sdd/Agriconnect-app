export type LanguageCode = 'en' | 'ta' | 'te' | 'ml' | 'hi';

export type UserRole = 'farmer' | 'fpo' | 'buyer' | 'consumer' | 'logistics' | 'admin';

export type ProduceCategory = 'daily' | 'fruits';

export type ProduceGrade = 'Grade A' | 'Grade B' | 'Standard' | 'Mixed';

export interface LocalizedText {
  en: string;
  ta: string;
  te: string;
  ml: string;
  hi: string;
}

export interface ProduceItem {
  id: string;
  key: string;
  imageUrl: string;
  category: ProduceCategory;
  name: LocalizedText;
  subtitle: LocalizedText;
  baseBenchmarkPrice: number; // in ₹/kg
  unit: string;
  shelfLifeDays: number;
  perishabilityIndex: 'High' | 'Medium' | 'Low';
  defaultGrade: ProduceGrade;
}

export interface FarmerLot {
  id: string;
  farmerId: string;
  farmerName: string;
  farmerPhone: string;
  farmerLocation: string; // e.g., 'Omalur, Salem'
  produceId: string;
  produceKey: string;
  quantityKg: number;
  grade: ProduceGrade;
  expectedPricePerKg: number;
  grossEstimatedValue: number;
  netEstimatedCashInHand: number;
  sharedLogisticsCost: number;
  fpoHandlingCost: number;
  platformCoordinationFee: number;
  status: 'Draft' | 'Listed' | 'Verified' | 'Batched' | 'InTransit' | 'Delivered' | 'Settled';
  createdAt: string;
  voiceRecorded?: boolean;
  assignedBatchId?: string;
}

export interface AggregatedBatch {
  id: string;
  fpoId: string;
  fpoName: string;
  hubLocation: string;
  produceId: string;
  produceKey: string;
  totalWeightKg: number;
  lotIds: string[];
  grade: ProduceGrade;
  fpoBasePricePerKg: number;
  targetBuyerSegment: string;
  status: 'Aggregating' | 'ReadyForBuyer' | 'Matched' | 'Dispatched' | 'Completed';
  clusteringCompatibilityScore: number; // e.g. 96%
  createdAt: string;
  transshipmentHops: number;
}

export interface BuyerDemand {
  id: string;
  buyerId: string;
  buyerName: string;
  destinationHub: string;
  produceId: string;
  produceKey: string;
  requiredWeightKg: number;
  acceptableGrade: ProduceGrade;
  targetMaxPricePerKg: number;
  deliveryWindowHours: number;
  deliveryDate?: string;
  specialInstructions?: string;
  status: 'Open' | 'Partially Matched' | 'ContractSigned' | 'InFulfillment' | 'Delivered';
  createdAt: string;
  matchedBatchId?: string;
  compatibilityScore?: number;
}

export type TransitMilestone = 'Scheduled' | 'PickedUp' | 'InTransit' | 'Delivered' | 'Settled';

export interface ColdChainTelemetry {
  truckNumber: string;
  driverName: string;
  driverPhone: string;
  reeferTemperature: number; // e.g. 12.4
  targetTempMin: number;
  targetTempMax: number;
  relativeHumidity: number; // e.g. 88
  vehicleSpeedKmH: number; // e.g. 54
  currentCoordinates: [number, number]; // [lat, lng]
  remainingDistanceKm: number;
  etaHours: number;
  originHub: string;
  destinationHub: string;
  currentMilestone: TransitMilestone;
  updatedAt: string;
}

export interface TransitMission {
  id: string;
  batchId: string;
  buyerDemandId: string;
  truckNumber: string;
  driverName: string;
  originHub: string;
  destinationHub: string;
  produceKey: string;
  totalWeightKg: number;
  telemetry: ColdChainTelemetry;
  milestonesHistory: {
    milestone: TransitMilestone;
    timestamp: string;
    completed: boolean;
    locationNote: string;
  }[];
  status: 'Assigned' | 'Active' | 'Delivered' | 'Settled';
}

export interface SettlementRecord {
  id: string;
  lotId: string;
  farmerId: string;
  farmerName: string;
  produceKey: string;
  quantityKg: number;
  grossClearedValue: number; // Qty * Price
  clearedRatePerKg: number;
  sharedRouteFreight: number; // e.g. -₹1.80/kg
  fpoWeighmentStorage: number; // e.g. -₹0.40/kg
  platformFee: number; // 1.5%
  farmerNetCashInHand: number;
  effectiveRatePerKg: number;
  villageBrokerBaselineRate: number; // e.g. 40% less (₹19.20/kg)
  villageBrokerGross: number;
  farmerSurplusGainRupees: number;
  farmerSurplusGainPercentage: number;
  payoutStatus: 'Escrow Hold' | 'Quality Verified' | 'Transferred to Bank Account (T+24h)';
  bankReferenceNumber: string;
  settledAt: string;
}

export interface UserProfile {
  id: string;
  role: UserRole;
  identifier: string; // Phone / CIN / GSTIN / Driver ID / Admin ID / Consumer Mobile
  name: string;
  location: string;
  accountNumber?: string;
  ifscCode?: string;
  avatarSeed: string;
  clusterId?: string;
}

// Consumer Marketplace Domain Types
export interface CartItem {
  produceKey: string;
  quantityKg: number;
  unitPrice: number;
}

export type SubscriptionFrequency = 'daily' | 'alternate' | 'weekends';

export interface SubscriptionItemConfig {
  produceKey: string;
  quantityKg: number;
}

export interface SubscriptionBasket {
  id: string;
  name: string;
  frequency: SubscriptionFrequency;
  items: SubscriptionItemConfig[];
  timeSlot: string; // e.g. "6:00 AM - 7:30 AM"
  startDate: string;
  monthlyEstimateRupees: number;
  monthlySupermarketSavings: number;
  isActive: boolean;
}

export interface CommunityCluster {
  id: string;
  name: string;
  location: string;
  activeHouseholds: number;
  currentPooledKg: number;
  targetThresholdKg: number; // e.g. 500 kg
  discountPercentage: number; // e.g. 20%
  hubOrigin: string;
}

export interface ConsumerOrder {
  id: string;
  orderType: 'instant' | 'cluster' | 'subscription';
  items: CartItem[];
  subtotal: number;
  deliveryCharge: number;
  discount: number;
  totalPaid: number;
  paymentMethod: 'UPI' | 'Card' | 'COD';
  status: 'Confirmed' | 'Dispatched' | 'Delivered';
  etaMinutes: number;
  createdAt: string;
}
