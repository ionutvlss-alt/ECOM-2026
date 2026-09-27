import React, { useState, useMemo } from 'react';
import { Product, ProfitSimulation } from '../types/product';
import {
  Calculator,
  TrendingUp,
  Percent,
  AlertCircle,
  HelpCircle,
  DollarSign,
  PackageCheck,
  Plane,
  ShieldAlert,
  Layers,
  Truck,
  RotateCcw,
  Sparkles,
  ArrowRight,
  ChevronRight,
  Info
} from 'lucide-react';
import { safeFormatNumber } from '../utils/productNormalizer';

interface ProfitSimulatorProps {
  products: Product[];
  onUpdateProductSimulation?: (productId: string, simulation: ProfitSimulation) => void;
  onOpenProductDetail?: (product: Product) => void;
  onOpenEditProduct?: (product: Product) => void;
}

export const ProfitSimulatorView: React.FC<ProfitSimulatorProps> = ({
  products,
  onUpdateProductSimulation,
  onOpenProductDetail,
  onOpenEditProduct,
}) => {
  // Produs selectat pentru simulare detaliată
  const [selectedProductId, setSelectedProductId] = useState<string>(() => {
    return products.length > 0 ? products[0].id : '';
  });

  const selectedProduct = useMemo(() => {
    return products.find((p) => p.id === selectedProductId) || products[0] || null;
  }, [products, selectedProductId]);

  // Valori configurabile pentru simulare (cu valori implicite orientative solicitate de user)
  const defaultSim: ProfitSimulation = useMemo(() => {
    const p = selectedProduct;
    const baseSalePrice = p ? (Number(p.price) || 149) : 149;
    const existing = p?.profitSimulation;

    return {
      purchaseCost: existing?.purchaseCost ?? Math.round(baseSalePrice * 0.22), // ~20-25% din preț (ex: 32 lei)
      shippingChina: existing?.shippingChina ?? 18, // orientativ 15-22 lei per produs
      customsDuty: existing?.customsDuty ?? 5, // taxe vamale orientativ ~4-6 lei
      importVat: existing?.importVat ?? 10, // TVA de import orientativ ~8-12 lei
      adCpa: existing?.adCpa ?? 28, // CPA reclame 20-35 lei
      returnReserve: existing?.returnReserve ?? 6, // rezervă / taxa retur 5-8 lei
      packagingCost: existing?.packagingCost ?? 3, // ambalaj, pungă curier, etichetă AWB
      courierDeliveryCost: existing?.courierDeliveryCost ?? 17, // curier intern (livrare client)
      otherExpenses: existing?.otherExpenses ?? 3, // procesator plăți / comisioane
      salePrice: existing?.salePrice ?? baseSalePrice,
      targetOrdersPerDay: existing?.targetOrdersPerDay ?? 10,
    };
  }, [selectedProduct]);

  const [simValues, setSimValues] = useState<ProfitSimulation>(defaultSim);

  // Sincronizare la schimbarea produsului selectat
  React.useEffect(() => {
    setSimValues(defaultSim);
  }, [defaultSim]);

  // Calcule Unit Economics per comandă
  const calculations = useMemo(() => {
    const sale = Number(simValues.salePrice) || 0;
    const cogs = Number(simValues.purchaseCost) || 0;
    const chinaShip = Number(simValues.shippingChina) || 0;
    const customs = Number(simValues.customsDuty) || 0;
    const vat = Number(simValues.importVat) || 0;
    
    // Cost landed total per bucată intrată în depozit
    const landedCostPerUnit = cogs + chinaShip + customs + vat;

    const adsCpa = Number(simValues.adCpa) || 0;
    const retReserve = Number(simValues.returnReserve) || 0;
    const packaging = Number(simValues.packagingCost) || 0;
    const courier = Number(simValues.courierDeliveryCost) || 0;
    const other = Number(simValues.otherExpenses) || 0;

    // Cost total variabil per comandă livrată
    const totalCostPerOrder = landedCostPerUnit + adsCpa + retReserve + packaging + courier + other;

    // Profit net per produs vândut
    const netProfitPerOrder = sale - totalCostPerOrder;

    // Marjă netă procentuală
    const netMarginPercent = sale > 0 ? (netProfitPerOrder / sale) * 100 : 0;

    // Break-even CPA (CPA maxim înainte să intri pe pierdere dacă toate celelalte costuri rămân fixe)
    const maxAllowableCpa = Math.max(0, sale - (landedCostPerUnit + retReserve + packaging + courier + other));

    // Break-even ROAS (ROAS minim necesar pe reclame)
    const breakEvenRoas = adsCpa > 0 ? (sale / adsCpa) : 0;

    // Proiecție lunară (30 zile)
    const ordersPerDay = Number(simValues.targetOrdersPerDay) || 10;
    const monthlyOrders = ordersPerDay * 30;
    const monthlyRevenue = monthlyOrders * sale;
    const monthlyNetProfit = monthlyOrders * netProfitPerOrder;
    const monthlyAdSpend = monthlyOrders * adsCpa;

    return {
      landedCostPerUnit,
      totalCostPerOrder,
      netProfitPerOrder,
      netMarginPercent,
      maxAllowableCpa,
      breakEvenRoas,
      monthlyOrders,
      monthlyRevenue,
      monthlyNetProfit,
      monthlyAdSpend,
    };
  }, [simValues]);

  const handleFieldChange = (field: keyof ProfitSimulation, val: number) => {
    setSimValues((prev) => ({
      ...prev,
      [field]: val,
    }));
  };

  const handleSaveToProduct = () => {
    if (!selectedProduct || !onUpdateProductSimulation) return;
    onUpdateProductSimulation(selectedProduct.id, simValues);
  };

  return (
    <div className="space-y-6">
      {/* Header Secțiune */}
      <div className="bg-gradient-to-r from-[#0f4a3c] to-[#156350] rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-xs text-emerald-200 text-xs font-semibold">
            <Calculator className="w-3.5 h-3.5" />
            <span>Simulator Realist de Rentabilitate & Unit Economics</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            Calculator Profit Net & Costuri Orientative E-commerce
          </h2>
          <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
            Include toate cheltuielile ascunse: transport din China, taxe vamale, TVA de import, CPA reclame (20-35 lei), provizion pentru retururi și ambalare. Află exact cât câștigi pe fiecare colet livrat!
          </p>
        </div>

        {/* Decorative background glow */}
        <div className="absolute right-0 top-0 w-80 h-80 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
      </div>

      {/* Selector Produs dacă sunt produse */}
      {products.length > 0 ? (
        <div className="bg-white border border-neutral-200 rounded-2xl p-4 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
              Alege produs din catalog:
            </span>
            <select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="bg-neutral-50 border border-neutral-200 rounded-xl px-3.5 py-1.5 text-xs font-semibold text-neutral-900 focus:outline-none focus:border-[#0f4a3c] cursor-pointer"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title} ({p.price} {p.currency})
                </option>
              ))}
            </select>
          </div>

          {selectedProduct && onUpdateProductSimulation && (
            <button
              type="button"
              onClick={handleSaveToProduct}
              className="px-4 py-2 bg-[#0f4a3c] hover:bg-[#0c3c31] text-white text-xs font-semibold rounded-xl shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Salvează calculul pe acest produs</span>
            </button>
          )}
        </div>
      ) : (
        <div className="bg-amber-50 border border-amber-200 text-amber-900 p-4 rounded-2xl text-xs flex items-center gap-2">
          <Info className="w-4 h-4 text-amber-700 shrink-0" />
          <span>Nu ai produse încă în catalog. Poți folosi valorile de simulare de mai jos ca model orientativ!</span>
        </div>
      )}

      {/* Grid Principal: Parametri Stânga | Rezultate & P&L Dreapta */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* COLOANA STÂNGA: Câmpuri de Intrare (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Card 1: Achiziție & Import din China */}
          <div className="bg-white border border-neutral-200 rounded-2xl p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-xs">
                  1
                </div>
                <h3 className="text-sm font-bold text-neutral-900">
                  Cost Produs & Import China (Landed Cost)
                </h3>
              </div>
              <span className="text-[11px] font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
                Subtotal: {calculations.landedCostPerUnit} lei / buc
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
              <div>
                <label className="block text-neutral-600 font-medium mb-1">
                  Cost achiziție produs (furnizor):
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min={0}
                    value={simValues.purchaseCost}
                    onChange={(e) => handleFieldChange('purchaseCost', Number(e.target.value))}
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 pr-12 font-mono font-semibold text-neutral-900 focus:outline-none focus:border-[#0f4a3c] focus:bg-white"
                  />
                  <span className="absolute right-3 top-2 text-neutral-400 font-mono">lei</span>
                </div>
                <span className="text-[10px] text-neutral-400">Prețul pe Alibaba / 1688 / AliExpress</span>
              </div>

              <div>
                <label className="block text-neutral-600 font-medium mb-1 flex items-center gap-1">
                  <Plane className="w-3 h-3 text-neutral-400" />
                  <span>Livrare China per produs:</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min={0}
                    value={simValues.shippingChina}
                    onChange={(e) => handleFieldChange('shippingChina', Number(e.target.value))}
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 pr-12 font-mono font-semibold text-neutral-900 focus:outline-none focus:border-[#0f4a3c] focus:bg-white"
                  />
                  <span className="absolute right-3 top-2 text-neutral-400 font-mono">lei</span>
                </div>
                <span className="text-[10px] text-neutral-400">Transport aerian/maritim împărțit pe bucată (12-25 lei)</span>
              </div>

              <div>
                <label className="block text-neutral-600 font-medium mb-1">
                  Taxe vamale per produs:
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min={0}
                    value={simValues.customsDuty}
                    onChange={(e) => handleFieldChange('customsDuty', Number(e.target.value))}
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 pr-12 font-mono font-semibold text-neutral-900 focus:outline-none focus:border-[#0f4a3c] focus:bg-white"
                  />
                  <span className="absolute right-3 top-2 text-neutral-400 font-mono">lei</span>
                </div>
                <span className="text-[10px] text-neutral-400">Comision vămuire & taxă vamală (~3-7 lei)</span>
              </div>

              <div>
                <label className="block text-neutral-600 font-medium mb-1">
                  TVA de import per produs:
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min={0}
                    value={simValues.importVat}
                    onChange={(e) => handleFieldChange('importVat', Number(e.target.value))}
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 pr-12 font-mono font-semibold text-neutral-900 focus:outline-none focus:border-[#0f4a3c] focus:bg-white"
                  />
                  <span className="absolute right-3 top-2 text-neutral-400 font-mono">lei</span>
                </div>
                <span className="text-[10px] text-neutral-400">TVA 19% achitat în vamă (~8-15 lei)</span>
              </div>
            </div>
          </div>

          {/* Card 2: Marketing & Reclame (CPA) */}
          <div className="bg-white border border-neutral-200 rounded-2xl p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-50 text-[#0f4a3c] flex items-center justify-center font-bold text-xs">
                  2
                </div>
                <h3 className="text-sm font-bold text-neutral-900">
                  Buget Reclame & CPA (TikTok / Meta Ads)
                </h3>
              </div>
              <span className="text-[11px] font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md">
                CPA: {simValues.adCpa} lei
              </span>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <label className="text-neutral-700 font-semibold">
                  CPA Reclame (Cost achiziție per comandă):
                </label>
                <span className="font-mono font-bold text-sm text-[#0f4a3c]">
                  {simValues.adCpa} RON
                </span>
              </div>

              {/* Slider rapid CPA 10 - 70 lei cu markere 20-35 lei */}
              <input
                type="range"
                min={10}
                max={70}
                step={1}
                value={simValues.adCpa}
                onChange={(e) => handleFieldChange('adCpa', Number(e.target.value))}
                className="w-full accent-[#0f4a3c] cursor-pointer"
              />

              <div className="flex items-center justify-between text-[11px] text-neutral-400 font-mono">
                <span>10 lei (Super viral)</span>
                <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded">
                  20 - 35 lei (Standard E-com România)
                </span>
                <span>70 lei (Scump)</span>
              </div>
            </div>
          </div>

          {/* Card 3: Livrare internă, Retururi & Ambalaje */}
          <div className="bg-white border border-neutral-200 rounded-2xl p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-800 flex items-center justify-center font-bold text-xs">
                  3
                </div>
                <h3 className="text-sm font-bold text-neutral-900">
                  Curier, Ambalare & Rezervă Retur
                </h3>
              </div>
              <span className="text-[11px] font-mono font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md">
                Operare: {Number(simValues.courierDeliveryCost) + Number(simValues.returnReserve) + Number(simValues.packagingCost) + Number(simValues.otherExpenses)} lei
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
              <div>
                <label className="block text-neutral-600 font-medium mb-1 flex items-center gap-1">
                  <RotateCcw className="w-3 h-3 text-rose-500" />
                  <span>Rezervă / Taxă retur per colet:</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min={0}
                    value={simValues.returnReserve}
                    onChange={(e) => handleFieldChange('returnReserve', Number(e.target.value))}
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 pr-12 font-mono font-semibold text-neutral-900 focus:outline-none focus:border-[#0f4a3c] focus:bg-white"
                  />
                  <span className="absolute right-3 top-2 text-neutral-400 font-mono">lei</span>
                </div>
                <span className="text-[10px] text-neutral-400">Provizion pentru 10-15% colete refuzate la livrare (4-8 lei)</span>
              </div>

              <div>
                <label className="block text-neutral-600 font-medium mb-1 flex items-center gap-1">
                  <Layers className="w-3 h-3 text-neutral-400" />
                  <span>Cost ambalare & etichete AWB:</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min={0}
                    value={simValues.packagingCost}
                    onChange={(e) => handleFieldChange('packagingCost', Number(e.target.value))}
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 pr-12 font-mono font-semibold text-neutral-900 focus:outline-none focus:border-[#0f4a3c] focus:bg-white"
                  />
                  <span className="absolute right-3 top-2 text-neutral-400 font-mono">lei</span>
                </div>
                <span className="text-[10px] text-neutral-400">Cutie, pungă curier, bandă adezivă, print AWB (2-5 lei)</span>
              </div>

              <div>
                <label className="block text-neutral-600 font-medium mb-1 flex items-center gap-1">
                  <Truck className="w-3 h-3 text-neutral-400" />
                  <span>Curier livrare client (Sameday / Fan / DPD):</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min={0}
                    value={simValues.courierDeliveryCost}
                    onChange={(e) => handleFieldChange('courierDeliveryCost', Number(e.target.value))}
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 pr-12 font-mono font-semibold text-neutral-900 focus:outline-none focus:border-[#0f4a3c] focus:bg-white"
                  />
                  <span className="absolute right-3 top-2 text-neutral-400 font-mono">lei</span>
                </div>
                <span className="text-[10px] text-neutral-400">Cost suportat dacă oferi transport gratuit (sau 0 dacă plătește clientul)</span>
              </div>

              <div>
                <label className="block text-neutral-600 font-medium mb-1">
                  Alte comisioane / Procesare card:
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min={0}
                    value={simValues.otherExpenses}
                    onChange={(e) => handleFieldChange('otherExpenses', Number(e.target.value))}
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 pr-12 font-mono font-semibold text-neutral-900 focus:outline-none focus:border-[#0f4a3c] focus:bg-white"
                  />
                  <span className="absolute right-3 top-2 text-neutral-400 font-mono">lei</span>
                </div>
                <span className="text-[10px] text-neutral-400">Taxă procesator card, comisioane platformă (2-4 lei)</span>
              </div>
            </div>
          </div>

          {/* Card 4: Preț Vânzare & Target Vânzări */}
          <div className="bg-white border border-neutral-200 rounded-2xl p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-800 flex items-center justify-center font-bold text-xs">
                  4
                </div>
                <h3 className="text-sm font-bold text-neutral-900">
                  Preț Vânzare Către Client & Volum Țintă
                </h3>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
              <div>
                <label className="block text-neutral-700 font-bold mb-1">
                  Preț de vânzare pe site (către client):
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min={1}
                    value={simValues.salePrice}
                    onChange={(e) => handleFieldChange('salePrice', Number(e.target.value))}
                    className="w-full bg-white border-2 border-[#0f4a3c]/30 rounded-xl px-3.5 py-2.5 pr-12 font-mono font-bold text-base text-neutral-900 focus:outline-none focus:border-[#0f4a3c]"
                  />
                  <span className="absolute right-3.5 top-2.5 text-neutral-500 font-mono font-bold">RON</span>
                </div>
                <span className="text-[10px] text-neutral-400">Prețul final afișat pe landing page</span>
              </div>

              <div>
                <label className="block text-neutral-700 font-bold mb-1">
                  Obiectiv vânzări zilnice (comenzi/zi):
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min={1}
                    value={simValues.targetOrdersPerDay || 10}
                    onChange={(e) => handleFieldChange('targetOrdersPerDay', Number(e.target.value))}
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3.5 py-2.5 pr-14 font-mono font-bold text-base text-neutral-900 focus:outline-none focus:border-[#0f4a3c] focus:bg-white"
                  />
                  <span className="absolute right-3.5 top-2.5 text-neutral-400 font-mono">com/zi</span>
                </div>
                <span className="text-[10px] text-neutral-400">Folosit pentru proiecția lunară (30 zile)</span>
              </div>
            </div>
          </div>
        </div>

        {/* COLOANA DREAPTA: TABLOU DE PROFITABILITATE & UNIT ECONOMICS (5 cols) */}
        <div className="lg:col-span-5 space-y-5 sticky top-20">
          
          {/* Box Principal: Rezultat Profit Net per Bucată */}
          <div className={`rounded-2xl p-6 border-2 shadow-lg transition-all ${
            calculations.netProfitPerOrder > 0
              ? 'bg-gradient-to-b from-[#f5fbf7] to-white border-emerald-500/80 text-emerald-950'
              : 'bg-gradient-to-b from-rose-50 to-white border-rose-400 text-rose-950'
          }`}>
            <div className="flex items-center justify-between pb-3 border-b border-neutral-200/60">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                PROFIT NET PER COMANDĂ
              </span>
              <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded-full ${
                calculations.netMarginPercent >= 25
                  ? 'bg-emerald-100 text-emerald-800'
                  : calculations.netMarginPercent > 0
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-rose-100 text-rose-800'
              }`}>
                {calculations.netMarginPercent.toFixed(1)}% Marjă Netă
              </span>
            </div>

            <div className="py-4 space-y-1">
              <div className="text-3xl sm:text-4xl font-extrabold font-mono tracking-tight">
                {calculations.netProfitPerOrder > 0 ? '+' : ''}
                {calculations.netProfitPerOrder.toFixed(2)} RON
              </div>
              <p className="text-xs text-neutral-600">
                {calculations.netProfitPerOrder > 0 ? (
                  <span className="text-emerald-700 font-semibold flex items-center gap-1">
                    <TrendingUp className="w-3.5 h-3.5" />
                    Produs profitabil! Rămâi cu bani în buzunar după toate cheltuielile.
                  </span>
                ) : (
                  <span className="text-rose-600 font-semibold flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    Atenție! Ești pe minus cu {Math.abs(calculations.netProfitPerOrder).toFixed(2)} lei per vânzare.
                  </span>
                )}
              </p>
            </div>

            {/* Indicatori Cheie: Break-Even ROAS & CPA Maxim */}
            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-neutral-200/60">
              <div className="bg-white/80 border border-neutral-200/80 rounded-xl p-3">
                <span className="text-[10px] text-neutral-500 block uppercase font-bold">
                  CPA Maxim Admisibil
                </span>
                <span className="text-base font-mono font-bold text-neutral-900 block mt-0.5">
                  {calculations.maxAllowableCpa.toFixed(0)} RON
                </span>
                <span className="text-[10px] text-neutral-400">până la break-even</span>
              </div>

              <div className="bg-white/80 border border-neutral-200/80 rounded-xl p-3">
                <span className="text-[10px] text-neutral-500 block uppercase font-bold">
                  ROAS Minim Necesar
                </span>
                <span className="text-base font-mono font-bold text-[#0f4a3c] block mt-0.5">
                  {calculations.breakEvenRoas > 0 ? `${calculations.breakEvenRoas.toFixed(2)}x` : '—'}
                </span>
                <span className="text-[10px] text-neutral-400">pe Facebook/TikTok</span>
              </div>
            </div>
          </div>

          {/* Breakdown Detaliat al Costurilor per Colet */}
          <div className="bg-white border border-neutral-200 rounded-2xl p-5 shadow-2xs space-y-3">
            <h4 className="text-xs font-bold text-neutral-700 uppercase tracking-wider">
              Descompunere Cost per Produs Vândut ({simValues.salePrice} lei)
            </h4>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between text-neutral-600">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                  Cost achiziție marfă (COGS):
                </span>
                <span className="font-mono font-bold text-neutral-900">{simValues.purchaseCost} lei</span>
              </div>

              <div className="flex items-center justify-between text-neutral-600">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-sky-400" />
                  Livrare din China:
                </span>
                <span className="font-mono font-bold text-neutral-900">{simValues.shippingChina} lei</span>
              </div>

              <div className="flex items-center justify-between text-neutral-600">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-indigo-400" />
                  Taxe vamale + TVA import:
                </span>
                <span className="font-mono font-bold text-neutral-900">{Number(simValues.customsDuty) + Number(simValues.importVat)} lei</span>
              </div>

              <div className="flex items-center justify-between text-neutral-600">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  Reclame Ads (CPA):
                </span>
                <span className="font-mono font-bold text-neutral-900">{simValues.adCpa} lei</span>
              </div>

              <div className="flex items-center justify-between text-neutral-600">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-400" />
                  Provizion retururi (refuz colet):
                </span>
                <span className="font-mono font-bold text-neutral-900">{simValues.returnReserve} lei</span>
              </div>

              <div className="flex items-center justify-between text-neutral-600">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  Curier + Ambalare + Alte taxe:
                </span>
                <span className="font-mono font-bold text-neutral-900">
                  {Number(simValues.courierDeliveryCost) + Number(simValues.packagingCost) + Number(simValues.otherExpenses)} lei
                </span>
              </div>

              <div className="pt-2 border-t border-neutral-150 flex items-center justify-between font-bold text-neutral-900">
                <span>Total Cheltuieli:</span>
                <span className="font-mono text-neutral-900">{calculations.totalCostPerOrder.toFixed(2)} lei</span>
              </div>

              <div className="pt-1 flex items-center justify-between font-bold text-emerald-800 bg-emerald-50/70 p-2 rounded-lg">
                <span>Profit Rămas:</span>
                <span className="font-mono text-emerald-800">+{calculations.netProfitPerOrder.toFixed(2)} lei</span>
              </div>
            </div>
          </div>

          {/* Proiecție Lunară (30 zile) */}
          <div className="bg-neutral-900 text-white rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5" />
                <span>Proiecție Lunară ({calculations.monthlyOrders} comenzi)</span>
              </span>
              <span className="text-[11px] font-mono text-neutral-400">
                {simValues.targetOrdersPerDay || 10} comenzi / zi
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <span className="text-[10px] text-neutral-400 block">Încasări Lunare (Rulaj):</span>
                <span className="text-base font-mono font-bold text-white">
                  {safeFormatNumber(Math.round(calculations.monthlyRevenue))} RON
                </span>
              </div>

              <div>
                <span className="text-[10px] text-neutral-400 block">Buget Reclame Lunar:</span>
                <span className="text-base font-mono font-bold text-amber-300">
                  {safeFormatNumber(Math.round(calculations.monthlyAdSpend))} RON
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-neutral-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-emerald-300 block uppercase font-bold">
                  Profit Curat Lunar:
                </span>
                <span className={`text-xl font-mono font-extrabold ${
                  calculations.monthlyNetProfit > 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}>
                  {calculations.monthlyNetProfit > 0 ? '+' : ''}
                  {safeFormatNumber(Math.round(calculations.monthlyNetProfit))} RON
                </span>
              </div>

              {selectedProduct && onOpenProductDetail && (
                <button
                  type="button"
                  onClick={() => onOpenProductDetail(selectedProduct)}
                  className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 rounded-lg text-xs font-semibold text-neutral-200 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <span>Vezi produs</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
