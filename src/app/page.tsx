'use client';

import React from 'react';
import { AppProvider, useApp } from '@/context/AppContext';
import { Navbar } from '@/components/common/Navbar';
import { AuthModal } from '@/components/common/AuthModal';
import { SettlementModal } from '@/components/settlement/SettlementModal';
import { FarmerDashboard } from '@/components/farmer/FarmerDashboard';
import { FPODashboard } from '@/components/fpo/FPODashboard';
import { BuyerDashboard } from '@/components/buyer/BuyerDashboard';
import { ConsumerPortal } from '@/components/consumer/ConsumerPortal';
import { LogisticsDashboard } from '@/components/logistics/LogisticsDashboard';
import { AdminDashboard } from '@/components/admin/AdminDashboard';
import { Sprout } from 'lucide-react';

function AppContent() {
  const { currentRole, t } = useApp();

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAF8] text-[#111827]">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        {currentRole === 'farmer' && <FarmerDashboard />}
        {currentRole === 'fpo' && <FPODashboard />}
        {currentRole === 'buyer' && <BuyerDashboard />}
        {currentRole === 'consumer' && <ConsumerPortal />}
        {currentRole === 'logistics' && <LogisticsDashboard />}
        {currentRole === 'admin' && <AdminDashboard />}
      </main>

      {/* Global Modals */}
      <AuthModal />
      <SettlementModal />

      {/* Clean Rural-First Footer */}
      <footer className="bg-white border-t border-[#E5E7EB] py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#4B5563]">
          <div className="flex items-center gap-2">
            <Sprout className="w-4 h-4 text-[#40916C]" />
            <span className="font-bold text-[#1B4332]">AgriConnect</span>
            <span>• Direct Farm-to-Market Supply Chain Network</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span className="font-semibold text-[#2D6A4F]">5 Languages: English, தமிழ், తెలుగు, മലയാളം, हिन्दी</span>
            <span>•</span>
            <span>Zero Middleman Cuts</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function HomePage() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
