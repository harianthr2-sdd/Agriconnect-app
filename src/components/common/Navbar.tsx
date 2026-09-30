'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { LanguageCode, UserRole } from '@/types';
import {
  Sprout,
  Globe,
  ShieldCheck,
  Building2,
  ShoppingCart,
  ShoppingBag,
  Truck,
  SlidersHorizontal,
  ChevronDown,
  Sparkles,
  CheckCircle2,
  BellRing,
} from 'lucide-react';

const LANGUAGES: { code: LanguageCode; label: string; nativeName: string }[] = [
  { code: 'en', label: 'English', nativeName: 'English' },
  { code: 'ta', label: 'Tamil', nativeName: 'தமிழ்' },
  { code: 'te', label: 'Telugu', nativeName: 'తెలుగు' },
  { code: 'ml', label: 'Malayalam', nativeName: 'മലയാളം' },
  { code: 'hi', label: 'Hindi', nativeName: 'हिन्दी' },
];

const ROLES: { id: UserRole; labelKey: string; icon: React.FC<{ className?: string }> }[] = [
  { id: 'farmer', labelKey: 'roleFarmer', icon: Sprout },
  { id: 'fpo', labelKey: 'roleFPO', icon: Building2 },
  { id: 'buyer', labelKey: 'roleBuyer', icon: ShoppingCart },
  { id: 'consumer', labelKey: 'roleConsumer', icon: ShoppingBag },
  { id: 'logistics', labelKey: 'roleLogistics', icon: Truck },
  { id: 'admin', labelKey: 'roleAdmin', icon: ShieldCheck },
];

export const Navbar: React.FC = () => {
  const {
    language,
    setLanguage,
    t,
    currentRole,
    switchRole,
    currentUser,
    setIsAuthModalOpen,
    notification,
  } = useApp();

  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E5E7EB] shadow-xs transition-all">
      {/* Realtime Notification Toast */}
      {notification && (
        <div className="bg-[#1B4332] text-white text-xs md:text-sm font-medium px-4 py-2 flex items-center justify-center gap-2 shadow-inner animate-in fade-in slide-in-from-top-2 duration-300">
          <BellRing className="w-4 h-4 text-[#52B788] animate-bounce" />
          <span>{notification}</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-18">
          {/* Brand Logo & Tagline */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 md:w-11 md:h-11 rounded-xl bg-gradient-to-br from-[#1B4332] to-[#2D6A4F] flex items-center justify-center shadow-md shadow-[#1B4332]/10 ring-2 ring-[#52B788]/30">
              <Sprout className="w-6 h-6 text-[#74C69D]" strokeWidth={2.2} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl md:text-2xl font-black tracking-tight text-[#1B4332]">
                  AgriConnect
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#E8F5E9] text-[#2D6A4F] border border-[#B7E4C7]">
                  <Sparkles className="w-3 h-3 text-[#40916C]" />
                  {t('demoBadge')}
                </span>
              </div>
              <p className="text-[11px] text-[#4B5563] hidden md:block font-medium">
                {t('tagline')}
              </p>
            </div>
          </div>

          {/* Center Navigation Role Selector (Desktop) */}
          <div className="hidden lg:flex items-center bg-[#F3F6F3] p-1 rounded-xl border border-[#E5E7EB]">
            {ROLES.map(({ id, labelKey, icon: Icon }) => {
              const isActive = currentRole === id;
              return (
                <button
                  key={id}
                  onClick={() => switchRole(id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-[#1B4332] text-white shadow-sm ring-1 ring-[#1B4332]'
                      : 'text-[#374151] hover:text-[#1B4332] hover:bg-[#E8F5E9]'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#74C69D]' : 'text-[#4B5563]'}`} />
                  <span>{t(labelKey).split('/')[0].trim()}</span>
                </button>
              );
            })}
          </div>

          {/* Right Controls: Language Selector + User Session */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* 5-Language Selector Dropdown */}
            <div className="relative">
              <button
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 md:px-3 md:py-2 rounded-xl border border-[#D1D5DB] bg-white hover:bg-[#F8FAF8] text-[#1B4332] text-xs font-semibold shadow-xs transition-colors"
                aria-label={t('switchLanguage')}
              >
                <Globe className="w-4 h-4 text-[#40916C]" />
                <span className="hidden sm:inline">
                  {LANGUAGES.find((l) => l.code === language)?.nativeName}
                </span>
                <span className="sm:hidden uppercase font-bold text-[11px]">{language}</span>
                <ChevronDown className="w-3.5 h-3.5 text-[#6B7280]" />
              </button>

              {langDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setLangDropdownOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-[#E5E7EB] py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-3 py-1.5 text-[11px] font-bold text-[#6B7280] uppercase tracking-wider border-b border-[#F3F4F6]">
                      {t('switchLanguage')} (5)
                    </div>
                    {LANGUAGES.map((l) => (
                      <button
                        key={l.code}
                        onClick={() => {
                          setLanguage(l.code);
                          setLangDropdownOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3.5 py-2 text-xs text-left transition-colors ${
                          language === l.code
                            ? 'bg-[#E8F5E9] text-[#1B4332] font-bold'
                            : 'text-[#374151] hover:bg-[#F9FAFB]'
                        }`}
                      >
                        <div>
                          <p className="leading-tight">{l.nativeName}</p>
                          <p className="text-[10px] text-[#6B7280]">{l.label}</p>
                        </div>
                        {language === l.code && (
                          <CheckCircle2 className="w-4 h-4 text-[#40916C]" />
                        )}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Mobile Role Dropdown */}
            <div className="lg:hidden relative">
              <button
                onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-[#1B4332] text-white text-xs font-semibold shadow-xs"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-[#74C69D]" />
                <span className="capitalize">{currentRole}</span>
                <ChevronDown className="w-3 h-3 text-white/70" />
              </button>

              {roleDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setRoleDropdownOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-[#E5E7EB] py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-3 py-1.5 text-[11px] font-bold text-[#6B7280] uppercase tracking-wider border-b border-[#F3F4F6]">
                      {t('switchRole')}
                    </div>
                    {ROLES.map(({ id, labelKey, icon: Icon }) => (
                      <button
                        key={id}
                        onClick={() => {
                          switchRole(id);
                          setRoleDropdownOpen(false);
                        }}
                        className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 text-xs text-left transition-colors ${
                          currentRole === id
                            ? 'bg-[#E8F5E9] text-[#1B4332] font-bold'
                            : 'text-[#374151] hover:bg-[#F9FAFB]'
                        }`}
                      >
                        <Icon className="w-4 h-4 text-[#40916C]" />
                        <span>{t(labelKey)}</span>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* User Session Button & Auth Modal Trigger */}
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 md:py-2 rounded-xl bg-[#F3F6F3] hover:bg-[#E8F5E9] border border-[#E5E7EB] text-[#1B4332] text-xs font-semibold shadow-xs transition-colors"
            >
              <div className="w-6 h-6 rounded-full bg-[#2D6A4F] text-white flex items-center justify-center font-bold text-[11px]">
                {currentUser.name.charAt(0)}
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-xs font-bold leading-tight line-clamp-1 max-w-[110px]">
                  {currentUser.name}
                </p>
                <p className="text-[10px] text-[#4B5563] font-medium leading-tight">
                  {currentUser.identifier.slice(0, 14)}
                </p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
