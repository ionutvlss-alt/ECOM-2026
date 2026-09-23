import React, { useState } from 'react';
import { Product } from '../types/product';
import {
  Package,
  Check,
  Star,
  TrendingUp,
  Sparkles,
  ArrowUpRight,
  Plus,
  Calendar,
  ChevronDown,
  Clock,
  ChevronRight,
  ExternalLink,
  Tag
} from 'lucide-react';

interface DashboardOverviewProps {
  products: Product[];
  onSelectProduct: (product: Product) => void;
  onNavigateToCatalog: (statusFilter?: string) => void;
  onNavigateToCampaigns: () => void;
  onOpenNewProduct: () => void;
  userName?: string;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  products,
  onSelectProduct,
  onNavigateToCatalog,
  onNavigateToCampaigns,
  onOpenNewProduct,
  userName = 'ionutvlss',
}) => {
  const [chartRange, setChartRange] = useState('6_months');

  // Metrics computation
  const totalProducts = products.length;
  const testedProducts = products.filter((p) => p.status === 'tested');
  const testingProducts = products.filter((p) => p.status === 'testing');
  const toTestProducts = products.filter((p) => p.status === 'to_test');

  const testedPercent = totalProducts > 0 ? Math.round((testedProducts.length / totalProducts) * 100) : 0;

  // Average rating
  const ratedProducts = products.filter((p) => p.overallRating && p.overallRating > 0);
  const avgRating = ratedProducts.length > 0
    ? (ratedProducts.reduce((sum, p) => sum + (p.overallRating || 0), 0) / ratedProducts.length).toFixed(1)
    : '-';

  // Total spent / value
  const totalSpent = products.reduce((sum, p) => sum + (p.price || 0), 0);

  // Date formatting for the kicker
  const today = new Date();
  const dateString = today.toLocaleDateString('ro-RO', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).toUpperCase();

  // Current month calculations
  const productsThisMonth = products.filter(p => {
    const d = new Date(p.createdAt || '');
    return !isNaN(d.getTime()) && d.getFullYear() === today.getFullYear() && d.getMonth() === today.getMonth();
  }).length;

  const spentThisMonth = products.filter(p => {
    const d = new Date(p.createdAt || '');
    return !isNaN(d.getTime()) && d.getFullYear() === today.getFullYear() && d.getMonth() === today.getMonth();
  }).reduce((sum, p) => sum + (p.price || 0), 0);

  // Dynamic monthly activity chart data calculated from products
  const monthNames = ['Ian', 'Feb', 'Mar', 'Apr', 'Mai', 'Iun', 'Iul', 'Aug', 'Sep', 'Oct', 'Noi', 'Dec'];
  const monthsCount = chartRange === '12_months' ? 12 : 6;
  const rawMonthly = Array.from({ length: monthsCount }).map((_, i) => {
    const d = new Date(today.getFullYear(), today.getMonth() - (monthsCount - 1 - i), 1);
    const mIndex = d.getMonth();
    const yVal = d.getFullYear();
    const count = products.filter(p => {
      const pDate = new Date(p.completedTestingAt || p.createdAt || p.startedTestingAt || '');
      return !isNaN(pDate.getTime()) && pDate.getMonth() === mIndex && pDate.getFullYear() === yVal;
    }).length;
    return {
      month: monthNames[mIndex],
      count,
      isCurrent: i === monthsCount - 1,
    };
  });

  const maxCount = Math.max(...rawMonthly.map(m => m.count), 1);
  const monthlyData = rawMonthly.map(m => ({
    ...m,
    height: m.count > 0 ? `${Math.max(15, Math.round((m.count / maxCount) * 100))}%` : '4px',
  }));

  // Audio best rating insight computation
  const audioProducts = products.filter(
    (p) => p.category.toLowerCase().includes('audio') || p.title.toLowerCase().includes('căști')
  );
  const audioAvg = audioProducts.length > 0
    ? (audioProducts.reduce((sum, p) => sum + (p.overallRating || 0), 0) / audioProducts.length).toFixed(1)
    : null;

  return (
    <div className="space-y-8">
      {/* Top Banner: Date + Greeting + Add Product Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-[11px] font-bold tracking-widest text-neutral-400 uppercase">
            {dateString}
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-neutral-900 mt-1">
            Bună, {userName} <span className="text-[#0f4a3c]">.</span>
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1">
            Iată cum arată colecția ta de produse astăzi.
          </p>
        </div>

        <button
          onClick={onOpenNewProduct}
          className="self-start sm:self-auto bg-[#0f4a3c] hover:bg-[#0c3c31] text-white px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Adaugă produs</span>
        </button>
      </div>

      {/* 4 KPI Cards Grid matching the screenshot */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total produse */}
        <div
          onClick={() => onNavigateToCatalog('all')}
          className="bg-white border border-neutral-200/80 rounded-2xl p-5 hover:border-neutral-300 transition-all cursor-pointer shadow-[0_1px_3px_rgba(0,0,0,0.03)]"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-8 h-8 rounded-lg bg-[#eaf3ee] flex items-center justify-center text-[#0f4a3c]">
              <Package className="w-4 h-4" />
            </div>
            {productsThisMonth > 0 ? (
              <span className="text-xs font-semibold text-[#0f4a3c] flex items-center gap-0.5">
                <TrendingUp className="w-3 h-3" />
                +{productsThisMonth}
              </span>
            ) : null}
          </div>
          <div className="text-xs text-neutral-500 font-medium">Total produse</div>
          <div className="text-3xl font-bold font-mono tracking-tight text-neutral-900 mt-1 tabular-nums">
            {totalProducts}
          </div>
          <div className="text-[11px] text-neutral-400 mt-1">
            {totalProducts === 0 ? '0 produse adăugate' : `+${productsThisMonth} luna aceasta`}
          </div>
        </div>

        {/* Card 2: Testate */}
        <div
          onClick={() => onNavigateToCatalog('tested')}
          className="bg-white border border-neutral-200/80 rounded-2xl p-5 hover:border-neutral-300 transition-all cursor-pointer shadow-[0_1px_3px_rgba(0,0,0,0.03)]"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-8 h-8 rounded-lg bg-[#eaf3ee] flex items-center justify-center text-[#0f4a3c]">
              <Check className="w-4 h-4" />
            </div>
            {testedProducts.length > 0 ? (
              <span className="text-xs font-semibold text-[#0f4a3c] flex items-center gap-0.5">
                <TrendingUp className="w-3 h-3" />
                {testedPercent}%
              </span>
            ) : null}
          </div>
          <div className="text-xs text-neutral-500 font-medium">Testate</div>
          <div className="text-3xl font-bold font-mono tracking-tight text-neutral-900 mt-1 tabular-nums">
            {testedProducts.length}
          </div>
          <div className="text-[11px] text-neutral-400 mt-1">
            {testedPercent}% din colecție
          </div>
        </div>

        {/* Card 3: Rating mediu */}
        <div
          onClick={() => onNavigateToCatalog('tested')}
          className="bg-white border border-neutral-200/80 rounded-2xl p-5 hover:border-neutral-300 transition-all cursor-pointer shadow-[0_1px_3px_rgba(0,0,0,0.03)]"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-8 h-8 rounded-lg bg-[#eaf3ee] flex items-center justify-center text-[#0f4a3c]">
              <Star className="w-4 h-4 fill-[#0f4a3c]/20" />
            </div>
          </div>
          <div className="text-xs text-neutral-500 font-medium">Rating mediu</div>
          <div className="text-3xl font-bold font-mono tracking-tight text-neutral-900 mt-1 tabular-nums">
            {avgRating}
          </div>
          <div className="text-[11px] text-neutral-400 mt-1">
            {ratedProducts.length > 0 ? `${ratedProducts.length} produse evaluate` : 'din 5.0'}
          </div>
        </div>

        {/* Card 4: Cheltuit anul acesta */}
        <div className="bg-white border border-neutral-200/80 rounded-2xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
          <div className="flex items-center justify-between mb-3">
            <div className="w-8 h-8 rounded-lg bg-[#eaf3ee] flex items-center justify-center text-[#0f4a3c]">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xs text-neutral-500 font-medium">Cheltuit anul acesta</div>
          <div className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-neutral-900 mt-1 tabular-nums truncate">
            {totalSpent.toLocaleString('ro-RO')} RON
          </div>
          <div className="text-[11px] text-neutral-400 mt-1">
            {spentThisMonth > 0 ? `+${spentThisMonth.toLocaleString('ro-RO')} RON luna aceasta` : '0 RON luna aceasta'}
          </div>
        </div>
      </div>

      {/* Row 2: Activity Chart (Left 2/3) + Insight Săptămânal (Right 1/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Activity Chart Card (8 cols) */}
        <div className="lg:col-span-8 bg-white border border-neutral-200/80 rounded-2xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div className="flex items-center justify-between pb-6">
            <div>
              <h3 className="text-sm font-bold text-neutral-900">Activitatea ta</h3>
              <p className="text-xs text-neutral-500 mt-0.5">
                Progresul testărilor din ultimele 6 luni
              </p>
            </div>

            <div className="relative">
              <select
                value={chartRange}
                onChange={(e) => setChartRange(e.target.value)}
                className="appearance-none bg-neutral-50 border border-neutral-200 text-xs font-medium rounded-xl px-3 py-1.5 pr-7 text-neutral-700 focus:outline-none focus:border-[#0f4a3c] cursor-pointer"
              >
                <option value="6_months">Ultimele 6 luni</option>
                <option value="12_months">Ultimul an</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-neutral-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Bar Chart Area */}
          <div className="h-44 flex items-end justify-between gap-3 sm:gap-6 pt-4 pb-2 px-2 sm:px-6">
            {monthlyData.map((item) => (
              <div key={item.month} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                <div className="text-[11px] font-mono text-neutral-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  {item.count}
                </div>
                <div className="w-full max-w-[48px] h-full flex items-end">
                  <div
                    className={`w-full rounded-lg transition-all duration-300 ${
                      item.isCurrent
                        ? 'bg-[#0f4a3c]'
                        : item.count > 0
                        ? 'bg-[#d2e8dd] hover:bg-[#beddcc]'
                        : 'bg-neutral-200/70 hover:bg-neutral-300'
                    }`}
                    style={{ height: item.height }}
                  />
                </div>
                <span className="text-xs font-medium text-neutral-500">
                  {item.month}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Insight Săptămânal Card (4 cols) matching screenshot */}
        <div className="lg:col-span-4 bg-[#12392f] text-white rounded-2xl p-6 relative flex flex-col justify-between shadow-sm overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-8 h-8 rounded-full bg-[#1f4a3e] text-[#a7f3d0] flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <button
                onClick={() => onNavigateToCatalog('all')}
                className="text-emerald-200/80 hover:text-white transition-colors"
                title="Deschide"
              >
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>

            <div className="text-[10px] font-bold tracking-widest text-[#a7f3d0] uppercase">
              INSIGHT SĂPTĂMÂNAL
            </div>
            <h4 className="text-base sm:text-lg font-bold text-white mt-1 leading-snug">
              {totalProducts === 0
                ? 'Workspace-ul tău este pregătit.'
                : audioAvg
                ? 'Produsele audio au cel mai bun scor mediu.'
                : 'Jurnalul tău de testare se dezvoltă.'}
            </h4>
            <p className="text-xs text-emerald-100/70 mt-2 leading-relaxed">
              {totalProducts === 0
                ? 'Nu ai încă produse înregistrate. Adaugă primul produs pentru a începe monitorizarea activității și obținerea recomandărilor automate.'
                : audioAvg
                ? `Căștile și accesoriile de sunet testate au o medie de ${audioAvg}★.`
                : `Ai ${totalProducts} produse înregistrate în colecția ta personală.`}
            </p>
          </div>

          <div className="pt-6 border-t border-emerald-900/40 mt-4 flex items-center justify-between text-xs">
            <span className="text-emerald-200 font-medium cursor-pointer hover:underline" onClick={() => onNavigateToCatalog('all')}>
              Vezi raportul detaliat →
            </span>
            <span className="text-[11px] text-emerald-300/60 font-mono">
              Actualizat azi
            </span>
          </div>
        </div>
      </div>

      {/* Row 3: Active Testing Spotlight */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-neutral-900">
              Produse aflate activ în testare ({testingProducts.length})
            </h3>
            <p className="text-xs text-neutral-500 mt-0.5">
              Dispozitive și mostre pe care le evaluezi în prezent.
            </p>
          </div>

          <button
            onClick={() => onNavigateToCatalog('testing')}
            className="text-xs font-semibold text-[#0f4a3c] hover:underline flex items-center gap-1"
          >
            <span>Vezi toate produsele în testare</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {testingProducts.length === 0 ? (
          <div className="bg-white border border-neutral-200/80 rounded-2xl p-8 text-center">
            <Clock className="w-8 h-8 text-neutral-400 mx-auto mb-2" />
            <div className="text-sm font-semibold text-neutral-800">
              Niciun produs nu este marcat ca fiind în testare activă
            </div>
            <p className="text-xs text-neutral-500 mt-1">
              Selectează un produs din colecție și mută-l în stadiul „În testare”.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {testingProducts.map((product) => {
              const lastLog = product.logs?.[product.logs.length - 1];

              return (
                <div
                  key={product.id}
                  onClick={() => onSelectProduct(product)}
                  className="bg-white border border-neutral-200/80 hover:border-neutral-300 rounded-2xl p-4 transition-all cursor-pointer shadow-[0_1px_3px_rgba(0,0,0,0.03)] flex gap-4 group"
                >
                  <div className="w-20 h-20 rounded-xl overflow-hidden bg-neutral-100 shrink-0 border border-neutral-200/60">
                    {product.images?.[0] ? (
                      <img
                        src={product.images[0]}
                        alt={product.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-neutral-400">
                        Foto
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between text-[11px] text-neutral-500 mb-0.5">
                        <span className="truncate">{product.brand} · {product.category}</span>
                        <span className="font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full text-[10px]">
                          În testare
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-neutral-900 truncate group-hover:text-[#0f4a3c] transition-colors">
                        {product.title}
                      </h4>
                      {lastLog && (
                        <p className="text-[11px] text-neutral-500 line-clamp-1 mt-1 italic">
                          „{lastLog.note}”
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-2 text-xs font-mono border-t border-neutral-100 mt-2">
                      <span className="font-bold text-neutral-900">
                        {product.price.toLocaleString('ro-RO')} {product.currency}
                      </span>
                      <span className="text-[11px] text-[#0f4a3c] font-sans font-semibold group-hover:underline">
                        Deschide fișa →
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
