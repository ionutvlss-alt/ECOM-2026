import React, { useState } from 'react';
import { Product } from '../types/product';
import {
  TrendingUp,
  Package,
  Megaphone,
  DollarSign,
  ArrowUpRight,
  ExternalLink,
  Plus,
  Play,
  Layers,
  ChevronRight
} from 'lucide-react';
import { CAMPAIGN_STATUS_LABELS } from '../data/initialProducts';

interface DashboardOverviewProps {
  products: Product[];
  onSelectProduct: (product: Product) => void;
  onOpenAddModal: () => void;
  userName?: string;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  products,
  onSelectProduct,
  onOpenAddModal,
  userName = 'ionutvlss',
}) => {
  const [chartTimeframe, setChartTimeframe] = useState<'6' | '12'>('6');

  // Calcule KPI din datele reale
  const totalProducts = products.length;
  const winners = products.filter((p) => p.campaign?.status === 'winner');
  const testingNow = products.filter((p) => (p.campaign?.status || 'testing') === 'testing');
  const totalSpend = products.reduce((sum, p) => sum + (p.campaign?.adSpend || 0), 0);
  const totalRevenue = products.reduce((sum, p) => sum + (p.campaign?.revenue || 0), 0);
  const totalProfit = totalRevenue - totalSpend;
  const globalRoas = totalSpend > 0 ? (totalRevenue / totalSpend).toFixed(2) : '0';

  // Calcul platforma de top (Facebook vs TikTok)
  const tiktokSpend = products.filter((p) => (p.campaign?.platform || '').toLowerCase().includes('tiktok')).reduce((s, p) => s + (p.campaign?.adSpend || 0), 0);
  const tiktokRev = products.filter((p) => (p.campaign?.platform || '').toLowerCase().includes('tiktok')).reduce((s, p) => s + (p.campaign?.revenue || 0), 0);
  const tiktokRoas = tiktokSpend > 0 ? (tiktokRev / tiktokSpend).toFixed(2) : '0';

  const fbSpend = products.filter((p) => (p.campaign?.platform || '').toLowerCase().includes('facebook') || (p.campaign?.platform || '').toLowerCase().includes('meta')).reduce((s, p) => s + (p.campaign?.adSpend || 0), 0);
  const fbRev = products.filter((p) => (p.campaign?.platform || '').toLowerCase().includes('facebook') || (p.campaign?.platform || '').toLowerCase().includes('meta')).reduce((s, p) => s + (p.campaign?.revenue || 0), 0);
  const fbRoas = fbSpend > 0 ? (fbRev / fbSpend).toFixed(2) : '0';

  let topPlatformText = 'Adaugă campanii pe TikTok Ads și Facebook Ads pentru a compara performanța în timp real.';
  if (tiktokSpend > 0 || fbSpend > 0) {
    if (Number(tiktokRoas) >= Number(fbRoas)) {
      topPlatformText = `TikTok Ads are în prezent cel mai bun ROAS (${tiktokRoas}x) din portofoliu.`;
    } else {
      topPlatformText = `Facebook Ads generează cel mai bun ROAS (${fbRoas}x) din portofoliu.`;
    }
  }

  // Generare dinamică activitate ultimele 6 luni
  const monthNames = ['Ian', 'Feb', 'Mar', 'Apr', 'Mai', 'Iun', 'Iul', 'Aug', 'Sep', 'Oct', 'Noi', 'Dec'];
  const now = new Date();
  const currentMonthIdx = now.getMonth();

  const monthsToDisplay = Array.from({ length: 6 }).map((_, i) => {
    const idx = (currentMonthIdx - 5 + i + 12) % 12;
    return {
      monthIdx: idx,
      name: monthNames[idx],
      year: idx > currentMonthIdx ? now.getFullYear() - 1 : now.getFullYear()
    };
  });

  const monthlyCounts = monthsToDisplay.map((m) => {
    const count = products.filter((p) => {
      const d = p.createdAt ? new Date(p.createdAt) : null;
      return d && d.getMonth() === m.monthIdx;
    }).length;
    return { name: m.name, count };
  });

  const maxMonthly = Math.max(...monthlyCounts.map((m) => m.count), 1);

  return (
    <div className="space-y-6">
      {/* Greeting and Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
            {new Date().toLocaleDateString('ro-RO', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 mt-0.5">
            Bună, {userName} .
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1">
            Urmărește performanța produselor testate în campaniile de Facebook și TikTok Ads.
          </p>
        </div>

        <button
          onClick={onOpenAddModal}
          className="self-start sm:self-auto bg-[#0f4a3c] hover:bg-[#0c3c31] text-white px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Adaugă produs & campanie</span>
        </button>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Produse */}
        <div className="bg-white border border-neutral-200/80 rounded-2xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-500">Total produse</span>
            <div className="w-7 h-7 rounded-lg bg-[#eaf3ee] flex items-center justify-center text-[#0f4a3c]">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-mono font-bold text-neutral-900 tabular-nums">
              {totalProducts}
            </div>
            <div className="text-[11px] text-neutral-400 mt-0.5">
              în portofoliu
            </div>
          </div>
        </div>

        {/* Campanii Winner */}
        <div className="bg-white border border-neutral-200/80 rounded-2xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-500">Campanii Winner</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-700">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-mono font-bold text-emerald-700 tabular-nums">
              {winners.length}
            </div>
            <div className="text-[11px] text-neutral-400 mt-0.5">
              {totalProducts > 0 ? `${Math.round((winners.length / totalProducts) * 100)}% rată de scalare` : '0 scalate'}
            </div>
          </div>
        </div>

        {/* ROAS Global */}
        <div className="bg-white border border-neutral-200/80 rounded-2xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-500">ROAS Global</span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center text-blue-700">
              <Megaphone className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-mono font-bold text-[#0f4a3c] tabular-nums">
              {globalRoas}x
            </div>
            <div className={`text-[11px] font-mono mt-0.5 ${totalProfit >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
              {totalProfit >= 0 ? `+${totalProfit.toLocaleString('ro-RO')}` : totalProfit.toLocaleString('ro-RO')} RON profit net
            </div>
          </div>
        </div>

        {/* Buget Total Ads */}
        <div className="bg-white border border-neutral-200/80 rounded-2xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-500">Ad Spend Total</span>
            <div className="w-7 h-7 rounded-lg bg-neutral-100 flex items-center justify-center text-neutral-700">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-mono font-bold text-neutral-900 tabular-nums">
              {totalSpend.toLocaleString('ro-RO')} RON
            </div>
            <div className="text-[11px] text-neutral-400 mt-0.5">
              Venit: {totalRevenue.toLocaleString('ro-RO')} RON
            </div>
          </div>
        </div>
      </div>

      {/* Middle Row: Activity Chart & Platform Insight */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Activity Chart */}
        <div className="lg:col-span-8 bg-white border border-neutral-200/80 rounded-2xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-sm font-bold text-neutral-900">Activitatea de testare</h3>
              <p className="text-xs text-neutral-500">Numărul de produse adăugate și testate pe luni</p>
            </div>
            <span className="text-xs font-mono text-neutral-500 bg-neutral-100 px-2.5 py-1 rounded-lg">
              Ultimele 6 luni
            </span>
          </div>

          <div className="h-44 flex items-end justify-between gap-3 pt-4 border-b border-neutral-100 pb-2">
            {monthlyCounts.map((m, idx) => {
              const isCurrent = idx === monthlyCounts.length - 1;
              const heightPercent = m.count === 0 ? 8 : Math.max(15, Math.round((m.count / maxMonthly) * 100));

              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                  <span className="text-[10px] font-mono text-neutral-400 group-hover:text-neutral-900 transition-colors">
                    {m.count > 0 ? m.count : ''}
                  </span>
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className={`w-full max-w-[44px] rounded-t-lg transition-all duration-300 ${
                      isCurrent
                        ? 'bg-[#0f4a3c] shadow-xs'
                        : 'bg-[#d2e7dd] group-hover:bg-[#a9d3c1]'
                    }`}
                  />
                  <span className={`text-[11px] font-medium ${isCurrent ? 'text-[#0f4a3c] font-bold' : 'text-neutral-500'}`}>
                    {m.name}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Insight Card */}
        <div className="lg:col-span-4 bg-linear-to-br from-[#0f4a3c] to-[#07241d] rounded-2xl p-6 text-white flex flex-col justify-between shadow-md">
          <div>
            <div className="flex items-center justify-between text-emerald-300">
              <span className="text-[11px] font-bold uppercase tracking-wider">INSIGHT CAMPANII</span>
              <ArrowUpRight className="w-4 h-4" />
            </div>

            <h4 className="text-base sm:text-lg font-bold mt-3 leading-snug">
              Comparație Facebook Ads vs TikTok Ads
            </h4>

            <p className="text-xs text-emerald-100/90 mt-2 leading-relaxed">
              {topPlatformText}
            </p>
          </div>

          <div className="pt-4 border-t border-emerald-800/60 mt-4 space-y-2 text-xs">
            <div className="flex justify-between font-mono">
              <span className="text-emerald-200">TikTok Spend / ROAS:</span>
              <span className="font-bold text-white">{tiktokSpend} RON · {tiktokRoas}x</span>
            </div>
            <div className="flex justify-between font-mono">
              <span className="text-emerald-200">Facebook Spend / ROAS:</span>
              <span className="font-bold text-white">{fbSpend} RON · {fbRoas}x</span>
            </div>
          </div>
        </div>
      </div>

      {/* Produse aflate activ în testare */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-neutral-900">
              Campanii active în testare ({testingNow.length})
            </h3>
            <p className="text-xs text-neutral-500">
              Produsele care rulează reclame în acest moment pe Facebook sau TikTok.
            </p>
          </div>
        </div>

        {testingNow.length === 0 ? (
          <div className="border border-dashed border-neutral-200 bg-white rounded-2xl p-8 text-center">
            <Package className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
            <p className="text-xs text-neutral-500">
              Nicio campanie activă în testare. Apasă pe „Adaugă produs & campanie” pentru a începe.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {testingNow.map((p) => (
              <div
                key={p.id}
                onClick={() => onSelectProduct(p)}
                className="bg-white border border-neutral-200/80 hover:border-neutral-300 rounded-xl p-4 transition-all shadow-2xs hover:shadow-xs cursor-pointer flex items-center justify-between gap-3 group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-12 h-12 rounded-lg bg-neutral-100 overflow-hidden shrink-0 border border-neutral-200">
                    {p.images?.[0] ? (
                      <img src={p.images[0]} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[10px] text-neutral-400">N/A</div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold text-white bg-neutral-900 px-1.5 py-0.5 rounded">
                      {p.campaign?.platform || 'Ads'}
                    </span>
                    <h4 className="text-xs font-bold text-neutral-900 truncate group-hover:text-[#0f4a3c] transition-colors mt-0.5">
                      {p.title}
                    </h4>
                    <span className="text-[10px] font-mono text-neutral-500">
                      Spend: {p.campaign?.adSpend} RON · ROAS: {p.campaign?.roas || '0'}x
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-neutral-400 group-hover:text-neutral-900 transition-colors shrink-0" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
