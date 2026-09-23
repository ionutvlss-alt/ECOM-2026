import React from 'react';
import { Product } from '../types/product';
import { BarChart2, TrendingUp, Award, DollarSign, Layers, Megaphone } from 'lucide-react';

interface ReportsViewProps {
  products: Product[];
  categories: string[];
  onSelectProduct: (product: Product) => void;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  products,
  categories,
  onSelectProduct,
}) => {
  const winners = products.filter((p) => p.campaign?.status === 'winner');
  const totalSpend = products.reduce((sum, p) => sum + (p.campaign?.adSpend || 0), 0);
  const totalRev = products.reduce((sum, p) => sum + (p.campaign?.revenue || 0), 0);
  const totalProfit = totalRev - totalSpend;
  const globalRoas = totalSpend > 0 ? (totalRev / totalSpend).toFixed(2) : '0';
  const totalOrders = products.reduce((sum, p) => sum + (p.campaign?.ordersCount || 0), 0);
  const avgCpa = totalOrders > 0 ? (totalSpend / totalOrders).toFixed(1) : '0';

  // Cel mai mare ROAS
  const topProduct = [...products].sort((a, b) => (b.campaign?.roas || 0) - (a.campaign?.roas || 0))[0];

  // Platform breakdown (TikTok vs Facebook vs Google etc.)
  const platforms = ['TikTok Ads', 'Facebook Ads', 'Google Ads'];
  const platformStats = platforms.map((plat) => {
    const platProducts = products.filter((p) => (p.campaign?.platform || '').toLowerCase().includes(plat.toLowerCase().split(' ')[0]));
    const spend = platProducts.reduce((sum, p) => sum + (p.campaign?.adSpend || 0), 0);
    const rev = platProducts.reduce((sum, p) => sum + (p.campaign?.revenue || 0), 0);
    const orders = platProducts.reduce((sum, p) => sum + (p.campaign?.ordersCount || 0), 0);
    const roas = spend > 0 ? (rev / spend).toFixed(2) : '0';
    const profit = rev - spend;

    return {
      platform: plat,
      count: platProducts.length,
      spend,
      rev,
      orders,
      roas,
      profit,
    };
  });

  // Categorii breakdown
  const categoryStats = categories.map((cat) => {
    const catProducts = products.filter((p) => (p.category || '').toLowerCase() === cat.toLowerCase());
    const spend = catProducts.reduce((sum, p) => sum + (p.campaign?.adSpend || 0), 0);
    const rev = catProducts.reduce((sum, p) => sum + (p.campaign?.revenue || 0), 0);
    const orders = catProducts.reduce((sum, p) => sum + (p.campaign?.ordersCount || 0), 0);
    const roas = spend > 0 ? (rev / spend).toFixed(2) : '-';

    return {
      category: cat,
      count: catProducts.length,
      spend,
      rev,
      orders,
      roas,
    };
  }).filter((stat) => stat.count > 0 || stat.spend > 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-neutral-200">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 flex items-center gap-2">
          <BarChart2 className="w-6 h-6 text-[#0f4a3c]" />
          <span>Rapoarte & Analiză ROAS</span>
        </h2>
        <p className="text-xs sm:text-sm text-neutral-500 mt-1">
          Performanța campaniilor Facebook & TikTok Ads, marje de profit și distribuția pe categorii.
        </p>
      </div>

      {/* Summary KPI grid */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-neutral-200/80 rounded-2xl p-5 shadow-2xs">
          <div className="text-xs text-neutral-500 font-medium flex items-center gap-1.5">
            <Award className="w-4 h-4 text-[#0f4a3c]" />
            <span>Top ROAS (Campania No. 1)</span>
          </div>
          {topProduct && (topProduct.campaign?.roas || 0) > 0 ? (
            <div
              onClick={() => onSelectProduct(topProduct)}
              className="mt-2 cursor-pointer group"
            >
              <div className="font-bold text-sm text-neutral-900 group-hover:text-[#0f4a3c] truncate">
                {topProduct.title}
              </div>
              <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-mono font-bold mt-0.5">
                <span>{topProduct.campaign?.roas?.toFixed(2)}x ROAS</span>
                <span className="text-neutral-400 font-normal">({topProduct.campaign?.platform})</span>
              </div>
            </div>
          ) : (
            <div className="text-xs text-neutral-400 mt-2 italic">Nicio campanie cu vânzări</div>
          )}
        </div>

        <div className="bg-white border border-neutral-200/80 rounded-2xl p-5 shadow-2xs">
          <div className="text-xs text-neutral-500 font-medium flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-[#0f4a3c]" />
            <span>Rată produse Winner</span>
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-700 mt-2">
            {products.length > 0 ? Math.round((winners.length / products.length) * 100) : 0}%
          </div>
          <div className="text-[11px] text-neutral-400 mt-0.5">
            {winners.length} din {products.length} produse scalate
          </div>
        </div>

        <div className="bg-white border border-neutral-200/80 rounded-2xl p-5 shadow-2xs">
          <div className="text-xs text-neutral-500 font-medium flex items-center gap-1.5">
            <DollarSign className="w-4 h-4 text-[#0f4a3c]" />
            <span>Profit Net din Reclame</span>
          </div>
          <div className={`text-2xl font-bold font-mono mt-2 ${totalProfit >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
            {totalProfit >= 0 ? `+${totalProfit.toLocaleString('ro-RO')}` : totalProfit.toLocaleString('ro-RO')} RON
          </div>
          <div className="text-[11px] text-neutral-400 mt-0.5">
            ROAS mediu: {globalRoas}x
          </div>
        </div>

        <div className="bg-white border border-neutral-200/80 rounded-2xl p-5 shadow-2xs">
          <div className="text-xs text-neutral-500 font-medium flex items-center gap-1.5">
            <Megaphone className="w-4 h-4 text-[#0f4a3c]" />
            <span>Cost mediu per achiziție (CPA)</span>
          </div>
          <div className="text-2xl font-bold font-mono text-neutral-900 mt-2">
            {avgCpa} RON
          </div>
          <div className="text-[11px] text-neutral-400 mt-0.5">
            {totalOrders} comenzi înregistrate
          </div>
        </div>
      </div>

      {/* Comparație Platforme Ads */}
      <div className="bg-white border border-neutral-200/80 rounded-2xl p-6 shadow-2xs space-y-4">
        <h3 className="text-sm font-bold text-neutral-900">
          Comparație pe Platforme (TikTok Ads vs Facebook Ads)
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-neutral-200 text-neutral-400 text-[10px] uppercase font-bold tracking-wider">
                <th className="py-2 px-3">Platformă</th>
                <th className="py-2 px-3">Produse Testate</th>
                <th className="py-2 px-3">Buget Cheltuit</th>
                <th className="py-2 px-3">Venit Generat</th>
                <th className="py-2 px-3">Profit Net</th>
                <th className="py-2 px-3">ROAS</th>
                <th className="py-2 px-3">Comenzi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {platformStats.map((p) => (
                <tr key={p.platform} className="hover:bg-neutral-50">
                  <td className="py-3 px-3 font-bold text-neutral-900">{p.platform}</td>
                  <td className="py-3 px-3 font-mono">{p.count}</td>
                  <td className="py-3 px-3 font-mono">{p.spend.toLocaleString('ro-RO')} RON</td>
                  <td className="py-3 px-3 font-mono font-semibold">{p.rev.toLocaleString('ro-RO')} RON</td>
                  <td className={`py-3 px-3 font-mono font-bold ${p.profit >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
                    {p.profit >= 0 ? `+${p.profit.toLocaleString('ro-RO')}` : p.profit.toLocaleString('ro-RO')} RON
                  </td>
                  <td className="py-3 px-3 font-mono font-bold text-[#0f4a3c]">{p.roas}x</td>
                  <td className="py-3 px-3 font-mono">{p.orders}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Performanță pe Categorii */}
      <div className="bg-white border border-neutral-200/80 rounded-2xl p-6 shadow-2xs space-y-4">
        <h3 className="text-sm font-bold text-neutral-900">
          Performanță pe Categorii de Produse
        </h3>

        {categoryStats.length === 0 ? (
          <p className="text-xs text-neutral-400 italic">
            Nu există date pentru categorii încă. Adaugă produse în categoriile create.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-neutral-200 text-neutral-400 text-[10px] uppercase font-bold tracking-wider">
                  <th className="py-2 px-3">Categorie</th>
                  <th className="py-2 px-3">Produse</th>
                  <th className="py-2 px-3">Buget Cheltuit</th>
                  <th className="py-2 px-3">Venit</th>
                  <th className="py-2 px-3">ROAS Mediu</th>
                  <th className="py-2 px-3">Comenzi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {categoryStats.map((c) => (
                  <tr key={c.category} className="hover:bg-neutral-50">
                    <td className="py-3 px-3 font-bold text-neutral-900">{c.category}</td>
                    <td className="py-3 px-3 font-mono">{c.count}</td>
                    <td className="py-3 px-3 font-mono">{c.spend.toLocaleString('ro-RO')} RON</td>
                    <td className="py-3 px-3 font-mono font-semibold">{c.rev.toLocaleString('ro-RO')} RON</td>
                    <td className="py-3 px-3 font-mono font-bold text-[#0f4a3c]">{c.roas !== '-' ? `${c.roas}x` : '—'}</td>
                    <td className="py-3 px-3 font-mono">{c.orders}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
