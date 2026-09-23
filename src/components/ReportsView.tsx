import React from 'react';
import { Product } from '../types/product';
import { BarChart2, Star, TrendingUp, Award, Clock, DollarSign } from 'lucide-react';
import { CATEGORIES_LIST } from '../data/initialProducts';

interface ReportsViewProps {
  products: Product[];
  onSelectProduct: (product: Product) => void;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  products,
  onSelectProduct,
}) => {
  const testedProducts = products.filter((p) => p.status === 'tested');
  const ratedProducts = products.filter((p) => p.overallRating && p.overallRating > 0);

  // Category stats
  const categoryStats = CATEGORIES_LIST.map((cat) => {
    const catProducts = products.filter((p) => p.category === cat);
    const catRated = catProducts.filter((p) => p.overallRating && p.overallRating > 0);
    const avgScore = catRated.length > 0
      ? (catRated.reduce((sum, p) => sum + (p.overallRating || 0), 0) / catRated.length).toFixed(1)
      : '0';
    const totalSpent = catProducts.reduce((sum, p) => sum + (p.price || 0), 0);

    return {
      category: cat,
      count: catProducts.length,
      avgScore: Number(avgScore),
      totalSpent,
    };
  }).filter((stat) => stat.count > 0);

  // Top rated product
  const topRated = [...ratedProducts].sort((a, b) => (b.overallRating || 0) - (a.overallRating || 0))[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-neutral-200">
        <h2 className="text-2xl font-bold tracking-tight text-neutral-900 flex items-center gap-2">
          <BarChart2 className="w-6 h-6 text-[#0f4a3c]" />
          <span>Rapoarte & Analiză Detaliată</span>
        </h2>
        <p className="text-xs sm:text-sm text-neutral-500 mt-1">
          Performanța categoriilor testate, medii de scoruri și distribuția bugetului.
        </p>
      </div>

      {/* Summary KPI grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-neutral-200/80 rounded-2xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
          <div className="text-xs text-neutral-500 font-medium flex items-center gap-1.5">
            <Award className="w-4 h-4 text-[#0f4a3c]" />
            <span>Produsul cu cel mai mare scor</span>
          </div>
          {topRated ? (
            <div
              onClick={() => onSelectProduct(topRated)}
              className="mt-2 cursor-pointer group"
            >
              <div className="font-bold text-sm text-neutral-900 group-hover:text-[#0f4a3c] truncate">
                {topRated.title}
              </div>
              <div className="flex items-center gap-1.5 text-xs text-amber-500 font-mono font-bold mt-0.5">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>{topRated.overallRating?.toFixed(1)} / 5.0</span>
                <span className="text-neutral-400 font-normal">({topRated.brand})</span>
              </div>
            </div>
          ) : (
            <div className="text-xs text-neutral-400 mt-2 italic">Niciun produs notat</div>
          )}
        </div>

        <div className="bg-white border border-neutral-200/80 rounded-2xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
          <div className="text-xs text-neutral-500 font-medium flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-[#0f4a3c]" />
            <span>Rată de finalizare recenzii</span>
          </div>
          <div className="text-2xl font-bold font-mono text-neutral-900 mt-2">
            {products.length > 0 ? Math.round((testedProducts.length / products.length) * 100) : 0}%
          </div>
          <div className="text-[11px] text-neutral-400 mt-0.5">
            {testedProducts.length} din {products.length} produse testate complet
          </div>
        </div>

        <div className="bg-white border border-neutral-200/80 rounded-2xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
          <div className="text-xs text-neutral-500 font-medium flex items-center gap-1.5">
            <DollarSign className="w-4 h-4 text-[#0f4a3c]" />
            <span>Preț mediu per produs testat</span>
          </div>
          <div className="text-2xl font-bold font-mono text-neutral-900 mt-2">
            {products.length > 0
              ? Math.round(products.reduce((s, p) => s + (p.price || 0), 0) / products.length).toLocaleString('ro-RO')
              : 0}{' '}
            RON
          </div>
          <div className="text-[11px] text-neutral-400 mt-0.5">
            Investiție medie per dispozitiv
          </div>
        </div>
      </div>

      {/* Category Breakdown Table */}
      <div className="bg-white border border-neutral-200/80 rounded-2xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.03)] space-y-4">
        <h3 className="text-sm font-bold text-neutral-900">
          Performanță pe Categorii de Produse
        </h3>

        <div className="space-y-4">
          {categoryStats.map((stat) => (
            <div key={stat.category} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-neutral-900">{stat.category}</span>
                  <span className="text-[11px] text-neutral-400">({stat.count} produse)</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-neutral-500">
                    {stat.totalSpent.toLocaleString('ro-RO')} RON
                  </span>
                  <div className="flex items-center gap-1 font-mono font-bold text-amber-500">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <span>{stat.avgScore > 0 ? stat.avgScore.toFixed(1) : '—'}</span>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-neutral-100 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-[#0f4a3c] h-full rounded-full transition-all duration-500"
                  style={{ width: `${stat.avgScore > 0 ? (stat.avgScore / 5) * 100 : 15}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
