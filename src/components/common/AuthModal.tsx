'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { UserRole } from '@/types';
import { DEMO_USERS } from '@/lib/demoData';
import {
  X,
  Sprout,
  Building2,
  ShoppingCart,
  ShoppingBag,
  Truck,
  ShieldCheck,
  KeyRound,
  ArrowRight,
  Check,
  Lock,
} from 'lucide-react';

interface AuthTabConfig {
  role: UserRole;
  labelKey: string;
  icon: React.FC<{ className?: string }>;
  idLabel: string;
  demoId: string;
  demoPass: string;
  subtitle: string;
}

const AUTH_TABS: AuthTabConfig[] = [
  {
    role: 'farmer',
    labelKey: 'roleFarmer',
    icon: Sprout,
    idLabel: 'Kisan Passbook ID / Mobile',
    demoId: 'TN-SLM-FARM-4821',
    demoPass: 'kisan@2026',
    subtitle: 'Farmer direct access for 5-turn harvest listing and escrow bank credits',
  },
  {
    role: 'fpo',
    labelKey: 'roleFPO',
    icon: Building2,
    idLabel: 'FPO CIN / Registration No.',
    demoId: 'FPO-TN-ERD-1092',
    demoPass: 'fpo@hub2026',
    subtitle: 'Aggregation hub operations, QC grading & commercial batching',
  },
  {
    role: 'buyer',
    labelKey: 'roleBuyer',
    icon: ShoppingCart,
    idLabel: 'GSTIN / Corporate Buyer ID',
    demoId: '33AABCT9981Q1Z5',
    demoPass: 'buyer@fresh2026',
    subtitle: 'B2B institutional bulk demand posting with escrow settlement',
  },
  {
    role: 'consumer',
    labelKey: 'roleConsumer',
    icon: ShoppingBag,
    idLabel: 'Consumer Mobile Number',
    demoId: 'CONSUMER-FRESH-01',
    demoPass: 'consumer@fresh2026',
    subtitle: 'Zepto instant delivery, housing society clusters & morning subscriptions',
  },
  {
    role: 'logistics',
    labelKey: 'roleLogistics',
    icon: Truck,
    idLabel: 'Transport License / Driver ID',
    demoId: 'TN-LOG-TRUCK-88',
    demoPass: 'fleet@move2026',
    subtitle: 'Cold-chain telemetry tracking, reefer sensors & transit milestones',
  },
  {
    role: 'admin',
    labelKey: 'roleAdmin',
    icon: ShieldCheck,
    idLabel: 'Super Admin Security Key',
    demoId: 'ADMIN-AGRICONNECT-01',
    demoPass: 'admin@root2026',
    subtitle: 'System-wide governance, dispute escrow clearing & SLA audits',
  },
];

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, setIsAuthModalOpen, currentRole, switchUser, t, setNotification } = useApp();
  const [activeTab, setActiveTab] = useState<UserRole>(currentRole);
  const [identifierInput, setIdentifierInput] = useState<string>('');
  const [passwordInput, setPasswordInput] = useState<string>('');

  if (!isAuthModalOpen) return null;

  const currentConfig = AUTH_TABS.find((tab) => tab.role === activeTab) || AUTH_TABS[0];

  const handle1ClickLogin = (role: UserRole) => {
    const user = DEMO_USERS[role];
    if (user) {
      switchUser(user);
      setIsAuthModalOpen(false);
      setNotification(`Switched to ${user.name} (${t(`role${role.charAt(0).toUpperCase() + role.slice(1)}` as string, role)})`);
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handle1ClickLogin(activeTab);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-[#E5E7EB] overflow-hidden">
        {/* Modal Header */}
        <div className="bg-[#1B4332] px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
              <Lock className="w-5 h-5 text-[#74C69D]" />
            </div>
            <div>
              <h2 className="text-lg font-bold">AgriConnect Role-Based Authentication</h2>
              <p className="text-xs text-white/80">
                Select your persona or click 1-Tap Instant Demo Login
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsAuthModalOpen(false)}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Persona Tabs */}
        <div className="flex border-b border-[#E5E7EB] bg-[#F8FAF8] overflow-x-auto p-2 gap-1 scrollbar-none">
          {AUTH_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.role;
            return (
              <button
                key={tab.role}
                onClick={() => {
                  setActiveTab(tab.role);
                  setIdentifierInput('');
                  setPasswordInput('');
                }}
                className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex-1 justify-center ${
                  isActive
                    ? 'bg-white text-[#1B4332] shadow-sm border border-[#D1D5DB]'
                    : 'text-[#4B5563] hover:text-[#1B4332] hover:bg-white/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#2D6A4F]' : 'text-[#6B7280]'}`} />
                <span>{t(tab.labelKey).split('/')[0].trim()}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content Body */}
        <div className="p-6">
          <div className="mb-6 p-4 rounded-xl bg-[#E8F5E9] border border-[#B7E4C7] flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#1B4332] bg-[#D8F3DC] px-2 py-0.5 rounded">
                  Instant Demo Credentials
                </span>
              </div>
              <p className="text-xs text-[#2D6A4F] mt-1.5 font-medium leading-relaxed">
                {currentConfig.subtitle}
              </p>
              <div className="mt-2.5 flex flex-wrap items-center gap-3 text-xs">
                <span className="font-mono bg-white px-2.5 py-1 rounded-md border border-[#B7E4C7] text-[#1B4332] font-semibold">
                  ID: {currentConfig.demoId}
                </span>
                <span className="font-mono bg-white px-2.5 py-1 rounded-md border border-[#B7E4C7] text-[#1B4332] font-semibold">
                  Pass: {currentConfig.demoPass}
                </span>
              </div>
            </div>

            <button
              onClick={() => handle1ClickLogin(activeTab)}
              className="shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1B4332] hover:bg-[#2D6A4F] text-white text-xs font-bold shadow-md shadow-[#1B4332]/20 transition-all hover:scale-[1.02]"
            >
              <span>1-Tap Demo Login</span>
              <ArrowRight className="w-4 h-4 text-[#74C69D]" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#374151] mb-1">
                {currentConfig.idLabel}
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={identifierInput || currentConfig.demoId}
                  onChange={(e) => setIdentifierInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D1D5DB] text-xs focus:ring-2 focus:ring-[#40916C] focus:border-transparent outline-none bg-[#F9FAFB] font-medium"
                  placeholder={currentConfig.demoId}
                />
                <Check className="absolute right-3 top-2.5 w-4 h-4 text-[#40916C]" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#374151] mb-1">
                Secret Access Key / Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={passwordInput || currentConfig.demoPass}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D1D5DB] text-xs focus:ring-2 focus:ring-[#40916C] focus:border-transparent outline-none bg-[#F9FAFB] font-medium"
                  placeholder="••••••••••••"
                />
                <KeyRound className="absolute right-3 top-2.5 w-4 h-4 text-[#6B7280]" />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsAuthModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-[#4B5563] hover:bg-[#F3F4F6]"
              >
                {t('btnCancel')}
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-[#2D6A4F] hover:bg-[#1B4332] text-white text-xs font-bold shadow-sm transition-all"
              >
                {t('quickLogin')} ({t(currentConfig.labelKey).split('/')[0].trim()})
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
