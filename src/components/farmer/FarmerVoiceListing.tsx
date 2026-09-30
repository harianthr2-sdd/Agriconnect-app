'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useApp } from '@/context/AppContext';
import { PRODUCE_CATALOG, getProduceByKey } from '@/lib/catalog';
import { ProduceGrade } from '@/types';
import { ProduceImage } from '@/components/common/ProduceImage';
import {
  Mic,
  Volume2,
  CheckCircle2,
  X,
  FileEdit,
  ArrowRight,
  Sparkles,
  TrendingUp,
  Tag,
} from 'lucide-react';

interface ExtractedListingData {
  produceKey: string;
  produceId: string;
  quantityKg: number;
  grade: ProduceGrade;
  expectedPricePerKg: number;
  farmerLocation: string;
  grossValue: number;
  deductions: number;
  netCashInHand: number;
}

type MicState = 'idle' | 'listening' | 'processing' | 'speaking';

export const FarmerVoiceListing: React.FC<{ onComplete?: () => void }> = ({ onComplete }) => {
  const { language, t, addFarmerLot, speakText, isSpeaking, currentUser } = useApp();

  const [micState, setMicState] = useState<MicState>('idle');
  const [currentTurn, setCurrentTurn] = useState<number>(1);
  const [transcript, setTranscript] = useState<string>('');
  const [systemPromptText, setSystemPromptText] = useState<string>('');
  const [isReviewModalOpen, setIsReviewModalOpen] = useState<boolean>(false);
  const [isManualDrawerOpen, setIsManualDrawerOpen] = useState<boolean>(false);
  const [, setSpeechSupported] = useState<boolean>(true);

  // Extracted Form State
  const [extractedData, setExtractedData] = useState<ExtractedListingData>({
    produceKey: 'veg_tomato',
    produceId: 'prod_1',
    quantityKg: 500,
    grade: 'Grade A',
    expectedPricePerKg: 32,
    farmerLocation: 'Dindigul / Salem Rural Cluster, Tamil Nadu',
    grossValue: 16000,
    deductions: 1340,
    netCashInHand: 14660,
  });

  const recognitionRef = useRef<unknown>(null);

  // Calculate net cash in hand dynamically
  const calculateFinancials = useCallback((key: string, qty: number, grade: ProduceGrade, priceOverride?: number): ExtractedListingData => {
    const prod = getProduceByKey(key) || PRODUCE_CATALOG[0];
    const finalPrice = priceOverride !== undefined && priceOverride > 0
      ? priceOverride
      : (grade === 'Grade A' ? prod.baseBenchmarkPrice : Math.round(prod.baseBenchmarkPrice * 0.85));

    const gross = qty * finalPrice;
    const freight = Math.round(qty * 1.8);
    const handling = Math.round(qty * 0.4);
    const fee = Math.round(gross * 0.015);
    const totalDeductions = freight + handling + fee;
    const net = gross - totalDeductions;

    return {
      produceKey: key,
      produceId: prod.id,
      quantityKg: qty,
      grade,
      expectedPricePerKg: finalPrice,
      farmerLocation: extractedData.farmerLocation || 'Omalur, Salem',
      grossValue: gross,
      deductions: totalDeductions,
      netCashInHand: net,
    };
  }, [extractedData.farmerLocation]);

  // Exact 5-Turn prompt generator
  const getTurnPrompt = useCallback((turn: number): string => {
    if (turn === 1) return t('voiceTurn1Prompt');
    if (turn === 2) return t('voiceTurn2Prompt');
    if (turn === 3) return t('voiceTurn3Prompt');
    if (turn === 4) return t('voiceTurn4Prompt');
    if (turn === 5) {
      const prod = getProduceByKey(extractedData.produceKey) || PRODUCE_CATALOG[0];
      const cropName = prod.name[language] || prod.name.en;
      const promptTemplate = t('voiceTurn5Prompt');
      return promptTemplate
        .replace('{location}', extractedData.farmerLocation)
        .replace('{qty}', extractedData.quantityKg.toString())
        .replace('{crop}', cropName)
        .replace('{grade}', extractedData.grade)
        .replace('{price}', extractedData.expectedPricePerKg.toString())
        .replace('{in_hand_cash}', extractedData.netCashInHand.toLocaleString());
    }
    return '';
  }, [extractedData, language, t]);

  // Setup Web Speech Recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as unknown as { SpeechRecognition?: unknown; webkitSpeechRecognition?: unknown }).SpeechRecognition ||
        (window as unknown as { SpeechRecognition?: unknown; webkitSpeechRecognition?: unknown }).webkitSpeechRecognition;

      if (!SpeechRecognition) {
        setSpeechSupported(false);
      }
    }
  }, []);

  // Sync turn prompt text
  useEffect(() => {
    setSystemPromptText(getTurnPrompt(currentTurn));
  }, [currentTurn, getTurnPrompt]);

  // Start Voice Session
  const startListeningSession = () => {
    if (typeof window === 'undefined') return;

    const SpeechRecognition =
      (window as unknown as { SpeechRecognition?: new () => unknown; webkitSpeechRecognition?: new () => unknown }).SpeechRecognition ||
      (window as unknown as { SpeechRecognition?: new () => unknown; webkitSpeechRecognition?: new () => unknown }).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsManualDrawerOpen(true);
      return;
    }

    try {
      const localeMap: Record<string, string> = {
        en: 'en-IN',
        ta: 'ta-IN',
        te: 'te-IN',
        ml: 'ml-IN',
        hi: 'hi-IN',
      };

      const recog = new SpeechRecognition() as {
        lang: string;
        continuous: boolean;
        interimResults: boolean;
        start: () => void;
        stop: () => void;
        abort: () => void;
        onstart: () => void;
        onresult: (event: { results: { [key: number]: { [key: number]: { transcript: string } } } }) => void;
        onerror: (err: unknown) => void;
        onend: () => void;
      };

      recog.lang = localeMap[language] || 'en-IN';
      recog.continuous = false;
      recog.interimResults = false;

      recog.onstart = () => {
        setMicState('listening');
      };

      recog.onresult = (event) => {
        const text = event.results[0][0].transcript;
        setTranscript(text);
        setMicState('processing');
        processVoiceInput(text);
      };

      recog.onerror = () => {
        setMicState('idle');
      };

      recog.onend = () => {
        if (micState === 'listening') {
          setMicState('idle');
        }
      };

      recognitionRef.current = recog;
      recog.start();
    } catch {
      setMicState('idle');
      setIsManualDrawerOpen(true);
    }
  };

  // 5-Turn Conversational State Machine
  const processVoiceInput = (speechText: string) => {
    const textLower = speechText.toLowerCase();

    // Turn 1: Match Produce
    if (currentTurn === 1) {
      let matchedKey = 'veg_tomato';
      if (textLower.includes('onion') || textLower.includes('வெங்காயம்') || textLower.includes('ఉల్లి') || textLower.includes('ഉള്ളി') || textLower.includes('प्याज')) {
        matchedKey = 'veg_onion';
      } else if (textLower.includes('potato') || textLower.includes('உருளை') || textLower.includes('బంగాళా') || textLower.includes('ഉരുളക്കിഴങ്ങ്') || textLower.includes('आलू')) {
        matchedKey = 'veg_potato';
      } else if (textLower.includes('carrot') || textLower.includes('கேரட்') || textLower.includes('క్యారెట్') || textLower.includes('കാരറ്റ്') || textLower.includes('गाजर')) {
        matchedKey = 'veg_carrot';
      } else if (textLower.includes('beans') || textLower.includes('பீன்ஸ்') || textLower.includes('அவரை') || textLower.includes('చిక్కుడు') || textLower.includes('ബീൻസ്') || textLower.includes('बीन्स')) {
        matchedKey = 'veg_beans';
      } else if (textLower.includes('mango') || textLower.includes('மாம்பழம்') || textLower.includes('మామిడి') || textLower.includes('മാമ്പഴം') || textLower.includes('आम')) {
        matchedKey = 'fruit_mango';
      } else if (textLower.includes('banana') || textLower.includes('வாழை') || textLower.includes('అరటి') || textLower.includes('வாഴപ്പഴം') || textLower.includes('केला')) {
        matchedKey = 'fruit_banana';
      } else if (textLower.includes('guava') || textLower.includes('கொய்யா') || textLower.includes('జామ') || textLower.includes('പേരയ്ക്ക') || textLower.includes('अमरूद')) {
        matchedKey = 'fruit_guava';
      }

      const updated = calculateFinancials(matchedKey, extractedData.quantityKg, extractedData.grade);
      setExtractedData(updated);
      setCurrentTurn(2);
      const prompt2 = t('voiceTurn2Prompt');
      setSystemPromptText(prompt2);
      setMicState('speaking');
      speakText(prompt2);
      setTimeout(() => setMicState('idle'), 2500);
      return;
    }

    // Turn 2: Match Quantity & Grade
    if (currentTurn === 2) {
      const numbersFound = speechText.match(/\d+/g);
      let qty = extractedData.quantityKg;
      if (numbersFound && numbersFound.length > 0) {
        qty = parseInt(numbersFound[0], 10);
      } else if (textLower.includes('five hundred') || textLower.includes('ஐநூறு') || textLower.includes('500') || textLower.includes('पाँच सौ')) {
        qty = 500;
      } else if (textLower.includes('thousand') || textLower.includes('ஆயிரம்') || textLower.includes('1000') || textLower.includes('हजार')) {
        qty = 1000;
      }

      let grade: ProduceGrade = 'Grade A';
      if (textLower.includes('second') || textLower.includes('இரண்டாம்') || textLower.includes('రెండవ') || textLower.includes('രണ്ടാം') || textLower.includes('दूसरा') || textLower.includes('grade b') || textLower.includes('b')) {
        grade = 'Grade B';
      }

      const updated = calculateFinancials(extractedData.produceKey, qty, grade);
      setExtractedData(updated);
      setCurrentTurn(3); // Go to Turn 3: Price
      const prompt3 = t('voiceTurn3Prompt');
      setSystemPromptText(prompt3);
      setMicState('speaking');
      speakText(prompt3);
      setTimeout(() => setMicState('idle'), 2500);
      return;
    }

    // Turn 3: Match Expected Selling Price (NEW)
    if (currentTurn === 3) {
      const numbersFound = speechText.match(/\d+/g);
      let price = extractedData.expectedPricePerKg;
      if (numbersFound && numbersFound.length > 0) {
        price = parseInt(numbersFound[0], 10);
      } else if (textLower.includes('thirty') || textLower.includes('முப்பது') || textLower.includes('तीस')) {
        price = 30;
      } else if (textLower.includes('forty') || textLower.includes('நாற்பது') || textLower.includes('चालीस')) {
        price = 40;
      } else if (textLower.includes('fifty') || textLower.includes('ஐம்பது') || textLower.includes('पचास')) {
        price = 50;
      }

      const updated = calculateFinancials(extractedData.produceKey, extractedData.quantityKg, extractedData.grade, price);
      setExtractedData(updated);
      setCurrentTurn(4); // Go to Turn 4: Location
      const prompt4 = t('voiceTurn4Prompt');
      setSystemPromptText(prompt4);
      setMicState('speaking');
      speakText(prompt4);
      setTimeout(() => setMicState('idle'), 2500);
      return;
    }

    // Turn 4: Match Location
    if (currentTurn === 4) {
      let loc = speechText.trim();
      if (!loc || loc.length < 2) {
        loc = 'Omalur, Salem';
      }
      const updated = {
        ...extractedData,
        farmerLocation: loc,
      };
      setExtractedData(updated);

      setCurrentTurn(5); // Go to Turn 5: Summary & Affirmation
      const prod = getProduceByKey(extractedData.produceKey) || PRODUCE_CATALOG[0];
      const cropName = prod.name[language] || prod.name.en;
      const prompt5 = t('voiceTurn5Prompt')
        .replace('{location}', loc)
        .replace('{qty}', extractedData.quantityKg.toString())
        .replace('{crop}', cropName)
        .replace('{grade}', extractedData.grade)
        .replace('{price}', extractedData.expectedPricePerKg.toString())
        .replace('{in_hand_cash}', extractedData.netCashInHand.toLocaleString());

      setSystemPromptText(prompt5);
      setMicState('speaking');
      speakText(prompt5);
      setTimeout(() => {
        setMicState('idle');
        setIsReviewModalOpen(true);
      }, 4000);
      return;
    }

    // Turn 5: Affirmation ("Yes", "சரி", "సరే", "ശരി", "हाँ")
    if (currentTurn === 5) {
      const isAffirmative =
        textLower.includes('yes') ||
        textLower.includes('சரி') ||
        textLower.includes('సరే') ||
        textLower.includes('ശരി') ||
        textLower.includes('हाँ') ||
        textLower.includes('ha') ||
        textLower.includes('sari') ||
        textLower.includes('correct') ||
        textLower.includes('ok');

      if (isAffirmative) {
        handleFinalSubmission();
      } else {
        setIsReviewModalOpen(true);
        setMicState('idle');
      }
    }
  };

  const handleFinalSubmission = () => {
    addFarmerLot({
      farmerId: currentUser.id,
      farmerName: currentUser.name,
      farmerPhone: '+91 98421 76540',
      farmerLocation: extractedData.farmerLocation,
      produceId: extractedData.produceId,
      produceKey: extractedData.produceKey,
      quantityKg: extractedData.quantityKg,
      grade: extractedData.grade,
      expectedPricePerKg: extractedData.expectedPricePerKg,
      voiceRecorded: true,
    });

    setIsReviewModalOpen(false);
    setIsManualDrawerOpen(false);
    setMicState('idle');
    setCurrentTurn(1);
    setTranscript('');
    if (onComplete) onComplete();
  };

  const activeProduce = getProduceByKey(extractedData.produceKey) || PRODUCE_CATALOG[0];

  return (
    <div className="bg-gradient-to-b from-[#1B4332] to-[#2D6A4F] text-white rounded-3xl p-5 md:p-8 shadow-xl shadow-[#1B4332]/20 border border-[#40916C]/40 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-[#52B788]/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-64 h-64 bg-[#D4A373]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header section */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white text-xs font-semibold backdrop-blur-xs mb-2 border border-white/15">
            <Sparkles className="w-3.5 h-3.5 text-[#74C69D]" />
            <span>{t('voiceTitle')}</span>
          </div>
          <h2 className="text-xl md:text-2xl font-black tracking-tight text-white">
            {t('quickSellBannerTitle')}
          </h2>
          <p className="text-xs md:text-sm text-white/80 mt-1 max-w-xl font-normal">
            {t('voiceSubtitle')}
          </p>
        </div>

        <button
          onClick={() => setIsManualDrawerOpen(true)}
          className="self-start md:self-auto flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all border border-white/20"
        >
          <FileEdit className="w-4 h-4 text-[#74C69D]" />
          <span>{t('manualFallbackBtn')}</span>
        </button>
      </div>

      {/* Center Conversational Mic Hub */}
      <div className="relative z-10 py-6 md:py-8 flex flex-col items-center text-center">
        <div className="mb-4">
          {micState === 'idle' && (
            <span className="px-3.5 py-1 rounded-full bg-white/10 text-xs font-medium text-white/90 border border-white/10">
              {t('micIdleDesc')}
            </span>
          )}
          {micState === 'listening' && (
            <span className="px-3.5 py-1 rounded-full bg-[#52B788] text-xs font-bold text-[#1B4332] animate-pulse">
              {t('listening')}
            </span>
          )}
          {micState === 'processing' && (
            <span className="px-3.5 py-1 rounded-full bg-[#F39C12] text-xs font-bold text-white">
              {t('processingVoice')}
            </span>
          )}
          {micState === 'speaking' && (
            <span className="px-3.5 py-1 rounded-full bg-[#74C69D] text-xs font-bold text-[#1B4332]">
              {t('speakingFeedback')}
            </span>
          )}
        </div>

        {/* Big One-Tap Mic Button */}
        <div className="relative my-2">
          {micState === 'listening' && (
            <div className="absolute -inset-4 rounded-full bg-[#52B788]/30 animate-ping pointer-events-none" />
          )}
          <button
            onClick={() => {
              if (micState === 'listening') {
                setMicState('idle');
              } else {
                startListeningSession();
              }
            }}
            className={`relative w-24 h-24 md:w-28 md:h-28 rounded-full flex flex-col items-center justify-center transition-all duration-300 shadow-2xl focus:outline-none ${
              micState === 'listening'
                ? 'bg-[#52B788] text-[#1B4332] scale-105 shadow-[#52B788]/50 ring-4 ring-white'
                : micState === 'processing'
                ? 'bg-[#F39C12] text-white scale-100 ring-4 ring-[#FEF3C7]'
                : micState === 'speaking'
                ? 'bg-[#74C69D] text-[#1B4332] ring-4 ring-white scale-105'
                : 'bg-white text-[#1B4332] hover:bg-[#E8F5E9] hover:scale-105 shadow-black/20 ring-4 ring-white/30'
            }`}
            aria-label={t('tapToSpeak')}
          >
            {micState === 'speaking' || isSpeaking ? (
              <Volume2 className="w-10 h-10 animate-bounce" />
            ) : (
              <Mic className={`w-10 h-10 ${micState === 'listening' ? 'animate-pulse' : ''}`} />
            )}
            <span className="text-[10px] font-black uppercase tracking-wider mt-1">
              {micState === 'idle' ? t('tapToSpeak') : micState}
            </span>
          </button>
        </div>

        {/* Live Spoken Prompt Card */}
        <div className="mt-5 max-w-xl w-full bg-black/25 backdrop-blur-md rounded-2xl p-4 border border-white/10 text-left">
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <span className="text-[11px] font-bold text-[#74C69D] uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#74C69D]" />
              Turn {currentTurn} of 5 • Assistant
            </span>
            <button
              onClick={() => speakText(systemPromptText)}
              className="text-white/70 hover:text-white flex items-center gap-1 text-[11px] transition-colors"
              title="Repeat audio"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>Replay</span>
            </button>
          </div>
          <p className="text-sm md:text-base font-semibold text-white leading-snug">
            &ldquo;{systemPromptText}&rdquo;
          </p>

          {transcript && (
            <div className="mt-3 pt-3 border-t border-white/10 text-xs text-white/90">
              <span className="text-[#D4A373] font-bold">You said: </span>
              <span className="italic font-medium">&ldquo;{transcript}&rdquo;</span>
            </div>
          )}
        </div>

        {/* 5 Turn Indicator Dots */}
        <div className="flex items-center gap-2 mt-4">
          {[1, 2, 3, 4, 5].map((step) => (
            <div
              key={step}
              className={`h-2 rounded-full transition-all ${
                currentTurn === step
                  ? 'w-8 bg-[#52B788]'
                  : currentTurn > step
                  ? 'w-2 bg-white/60'
                  : 'w-2 bg-white/20'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Quick 8-Item Bar for 1-Tap Crop Selection */}
      <div className="relative z-10 pt-4 border-t border-white/10">
        <p className="text-[11px] font-bold text-white/70 uppercase tracking-wider mb-3">
          Exact 8 Supported Crops & Fresh Produce (1-Tap Selection)
        </p>
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
          {PRODUCE_CATALOG.map((item) => {
            const isSelected = extractedData.produceKey === item.key;
            return (
              <button
                key={item.key}
                onClick={() => {
                  const updated = calculateFinancials(item.key, extractedData.quantityKg, extractedData.grade);
                  setExtractedData(updated);
                  setCurrentTurn(2);
                }}
                className={`flex flex-col items-center p-2 rounded-xl transition-all border text-center ${
                  isSelected
                    ? 'bg-white text-[#1B4332] border-white shadow-lg scale-105'
                    : 'bg-white/10 hover:bg-white/20 border-white/10 text-white'
                }`}
              >
                <div className="w-10 h-10 rounded-lg overflow-hidden relative mb-1.5">
                  <ProduceImage
                    src={item.imageUrl}
                    alt={item.name[language] || item.name.en}
                    className="w-full h-full"
                    category={item.category}
                  />
                </div>
                <span className="text-[10px] font-bold leading-tight line-clamp-1">
                  {item.name[language] || item.name.en}
                </span>
                <span className={`text-[9px] font-medium mt-0.5 ${isSelected ? 'text-[#2D6A4F]' : 'text-[#74C69D]'}`}>
                  ₹{item.baseBenchmarkPrice}/kg
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* EXTRACTION REVIEW MODAL (INCLUDES EXPECTED PRICE) */}
      {isReviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white text-[#111827] rounded-2xl max-w-xl w-full shadow-2xl border border-[#E5E7EB] overflow-hidden">
            <div className="bg-[#1B4332] px-6 py-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-[#52B788]" />
                <h3 className="text-base font-bold">{t('reviewTitle')}</h3>
              </div>
              <button
                onClick={() => setIsReviewModalOpen(false)}
                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <p className="text-xs text-[#4B5563]">
                {t('reviewSubtitle')}
              </p>

              {/* Crop & Photo Banner */}
              <div className="p-3.5 rounded-xl bg-[#F3F6F3] border border-[#E5E7EB] flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl overflow-hidden relative shrink-0">
                  <ProduceImage
                    src={activeProduce.imageUrl}
                    alt={activeProduce.name[language] || activeProduce.name.en}
                    className="w-full h-full"
                    category={activeProduce.category}
                  />
                </div>
                <div className="flex-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#E8F5E9] text-[#1B4332]">
                    {activeProduce.category === 'fruits' ? t('catFruits') : t('catDaily')}
                  </span>
                  <h4 className="text-base font-black text-[#1B4332] mt-0.5">
                    {activeProduce.name[language] || activeProduce.name.en}
                  </h4>
                  <p className="text-xs text-[#4B5563] font-medium">
                    {activeProduce.subtitle[language] || activeProduce.subtitle.en} • Base ₹{activeProduce.baseBenchmarkPrice}/kg
                  </p>
                </div>
              </div>

              {/* Editable Fields Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                {/* Quantity */}
                <div>
                  <label className="block text-xs font-bold text-[#374151] mb-1">
                    {t('fieldQuantity')}
                  </label>
                  <input
                    type="number"
                    value={extractedData.quantityKg}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10) || 0;
                      setExtractedData(calculateFinancials(extractedData.produceKey, val, extractedData.grade, extractedData.expectedPricePerKg));
                    }}
                    className="w-full px-3.5 py-2 rounded-xl border border-[#D1D5DB] text-xs font-bold text-[#111827] focus:ring-2 focus:ring-[#40916C] outline-none"
                  />
                </div>

                {/* Grade */}
                <div>
                  <label className="block text-xs font-bold text-[#374151] mb-1">
                    {t('fieldGrade')}
                  </label>
                  <select
                    value={extractedData.grade}
                    onChange={(e) => {
                      const g = e.target.value as ProduceGrade;
                      setExtractedData(calculateFinancials(extractedData.produceKey, extractedData.quantityKg, g, extractedData.expectedPricePerKg));
                    }}
                    className="w-full px-3.5 py-2 rounded-xl border border-[#D1D5DB] text-xs font-bold text-[#111827] focus:ring-2 focus:ring-[#40916C] outline-none"
                  >
                    <option value="Grade A">{t('gradeA')}</option>
                    <option value="Grade B">{t('gradeB')}</option>
                  </select>
                </div>

                {/* Farmer Expected Price (₹/kg) */}
                <div>
                  <label className="block text-xs font-bold text-[#374151] mb-1">
                    {t('fieldExpectedPrice')}
                  </label>
                  <input
                    type="number"
                    value={extractedData.expectedPricePerKg}
                    onChange={(e) => {
                      const p = parseInt(e.target.value, 10) || 0;
                      setExtractedData(calculateFinancials(extractedData.produceKey, extractedData.quantityKg, extractedData.grade, p));
                    }}
                    className="w-full px-3.5 py-2 rounded-xl border border-[#B7E4C7] bg-[#E8F5E9]/50 text-xs font-black text-[#1B4332] focus:ring-2 focus:ring-[#40916C] outline-none"
                  />
                </div>

                {/* Location */}
                <div className="sm:col-span-3">
                  <label className="block text-xs font-bold text-[#374151] mb-1">
                    {t('fieldLocation')}
                  </label>
                  <input
                    type="text"
                    value={extractedData.farmerLocation}
                    onChange={(e) => setExtractedData((prev) => ({ ...prev, farmerLocation: e.target.value }))}
                    className="w-full px-3.5 py-2 rounded-xl border border-[#D1D5DB] text-xs font-medium text-[#111827] focus:ring-2 focus:ring-[#40916C] outline-none"
                  />
                </div>
              </div>

              {/* Net Payout Card */}
              <div className="p-4 rounded-xl bg-[#E8F5E9] border border-[#B7E4C7] space-y-2">
                <div className="flex items-center justify-between text-xs text-[#2D6A4F]">
                  <span>{t('fieldGrossValue')} ({extractedData.quantityKg} kg × ₹{extractedData.expectedPricePerKg})</span>
                  <span className="font-bold">₹{extractedData.grossValue.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-[#DC2626]">
                  <span>{t('fieldDeductions')} (Freight + Handling + Fee)</span>
                  <span className="font-bold">-₹{extractedData.deductions.toLocaleString()}</span>
                </div>
                <div className="pt-2 border-t border-[#B7E4C7] flex items-center justify-between">
                  <div>
                    <span className="text-xs font-black text-[#1B4332] block">
                      {t('fieldNetCash')}
                    </span>
                    <span className="text-[10px] text-[#40916C] font-semibold">
                      Effective Realized: ₹{(extractedData.netCashInHand / extractedData.quantityKg).toFixed(2)} / kg
                    </span>
                  </div>
                  <span className="text-xl font-black text-[#1B4332]">
                    ₹{extractedData.netCashInHand.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="px-6 py-4 bg-[#F8FAF8] border-t border-[#E5E7EB] flex items-center justify-end gap-3">
              <button
                onClick={() => setIsReviewModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-[#4B5563] hover:bg-[#E5E7EB]"
              >
                {t('btnCancel')}
              </button>
              <button
                onClick={handleFinalSubmission}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#1B4332] hover:bg-[#2D6A4F] text-white text-xs font-black shadow-md shadow-[#1B4332]/20 transition-all hover:scale-[1.02]"
              >
                <span>{t('btnConfirmListing')}</span>
                <ArrowRight className="w-4 h-4 text-[#74C69D]" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 1-TAP MANUAL LISTING DRAWER */}
      {isManualDrawerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white text-[#111827] rounded-2xl max-w-lg w-full shadow-2xl border border-[#E5E7EB] overflow-hidden">
            <div className="bg-[#1B4332] px-6 py-4 text-white flex items-center justify-between">
              <h3 className="text-base font-bold">{t('manualListingBtn')}</h3>
              <button
                onClick={() => setIsManualDrawerOpen(false)}
                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleFinalSubmission();
              }}
              className="p-6 space-y-4"
            >
              <div>
                <label className="block text-xs font-bold text-[#374151] mb-1">
                  {t('selectCrop')}
                </label>
                <select
                  value={extractedData.produceKey}
                  onChange={(e) => {
                    const k = e.target.value;
                    setExtractedData(calculateFinancials(k, extractedData.quantityKg, extractedData.grade));
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D1D5DB] text-xs font-bold text-[#111827] outline-none"
                >
                  {PRODUCE_CATALOG.map((p) => (
                    <option key={p.key} value={p.key}>
                      {p.name[language] || p.name.en} — Base ₹{p.baseBenchmarkPrice}/kg
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#374151] mb-1">
                    {t('fieldQuantity')}
                  </label>
                  <input
                    type="number"
                    value={extractedData.quantityKg}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10) || 0;
                      setExtractedData(calculateFinancials(extractedData.produceKey, val, extractedData.grade, extractedData.expectedPricePerKg));
                    }}
                    className="w-full px-3.5 py-2 rounded-xl border border-[#D1D5DB] text-xs font-bold text-[#111827]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#374151] mb-1">
                    {t('fieldGrade')}
                  </label>
                  <select
                    value={extractedData.grade}
                    onChange={(e) => {
                      const g = e.target.value as ProduceGrade;
                      setExtractedData(calculateFinancials(extractedData.produceKey, extractedData.quantityKg, g, extractedData.expectedPricePerKg));
                    }}
                    className="w-full px-3.5 py-2 rounded-xl border border-[#D1D5DB] text-xs font-bold text-[#111827]"
                  >
                    <option value="Grade A">{t('gradeA')}</option>
                    <option value="Grade B">{t('gradeB')}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#374151] mb-1">
                    Price (₹/kg)
                  </label>
                  <input
                    type="number"
                    value={extractedData.expectedPricePerKg}
                    onChange={(e) => {
                      const p = parseInt(e.target.value, 10) || 0;
                      setExtractedData(calculateFinancials(extractedData.produceKey, extractedData.quantityKg, extractedData.grade, p));
                    }}
                    className="w-full px-3.5 py-2 rounded-xl border border-[#B7E4C7] bg-[#E8F5E9]/50 text-xs font-black text-[#1B4332]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#374151] mb-1">
                  {t('fieldLocation')}
                </label>
                <input
                  type="text"
                  value={extractedData.farmerLocation}
                  onChange={(e) => setExtractedData((prev) => ({ ...prev, farmerLocation: e.target.value }))}
                  className="w-full px-3.5 py-2 rounded-xl border border-[#D1D5DB] text-xs font-medium text-[#111827]"
                  placeholder="e.g. Omalur, Salem"
                />
              </div>

              {/* Payout Preview */}
              <div className="p-3.5 rounded-xl bg-[#E8F5E9] border border-[#B7E4C7] flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-[#2D6A4F] block">
                    {t('fieldNetCash')}
                  </span>
                  <span className="text-[10px] text-[#40916C]">
                    ₹{(extractedData.netCashInHand / extractedData.quantityKg).toFixed(2)}/kg
                  </span>
                </div>
                <span className="text-lg font-black text-[#1B4332]">
                  ₹{extractedData.netCashInHand.toLocaleString()}
                </span>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsManualDrawerOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[#4B5563]"
                >
                  {t('btnCancel')}
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#1B4332] text-white text-xs font-bold shadow-sm"
                >
                  {t('btnConfirmListing')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
