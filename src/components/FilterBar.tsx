import React from 'react';
import { FilterOptions, CampaignStatus } from '../types/product';
import { Search, LayoutGrid, List, X, Filter } from 'lucide-react';

interface FilterBarProps {
  filterOptions: FilterOptions;
  categories: string[];
  onFilterChange: (newOptions: Partial<FilterOptions>) => void;
  viewMode: 'grid' | 'table';
  onViewModeChange: (mode: 'grid' | 'table') => void;
  totalFilteredCount: number;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filterOptions,
  categories,
  onFilterChange,
  viewMode,
  onViewModeChange,
  totalFilteredCount,
}) => {
  const statusChips: { id: CampaignStatus | 'all'; label: string }[] = [
    { id: 'all', label: 'Toate' },
    { id: 'winner', label: 'Winner (Scalat)' },
    { id: 'testing', label: 'În testare' },
    { id: 'promising', label: 'Promițător' },
    { id: 'stopped', label: 'Oprit' },
  ];

  return (
    <div className="bg-white border border-neutral-200/80 rounded-2xl p-4 shadow-[0_1px_3px_rgba(0,0,0,0.03)] space-y-3">
      {/* Top row: Search input + View Switch */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        {/* Search Field */}
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            value={filterOptions.search}
            onChange={(e) => onFilterChange({ search: e.target.value })}
            placeholder="Caută după produs, brand, categorie, platformă sau note..."
            className="w-full bg-neutral-50 border border-neutral-200 rounded-xl pl-9 pr-8 py-2 text-xs text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-[#0f4a3c] focus:bg-white transition-all"
          />
          {filterOptions.search && (
            <button
              onClick={() => onFilterChange({ search: '' })}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* View Toggle Buttons & Counter */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <span className="text-xs font-mono text-neutral-500 tabular-nums">
            {totalFilteredCount} {totalFilteredCount === 1 ? 'produs' : 'produse'}
          </span>

          <div className="flex items-center p-1 bg-neutral-100 rounded-xl border border-neutral-200/60">
            <button
              type="button"
              onClick={() => onViewModeChange('grid')}
              className={`p-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-white text-neutral-900 shadow-2xs'
                  : 'text-neutral-500 hover:text-neutral-900'
              }`}
              title="Vizualizare Carduri"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => onViewModeChange('table')}
              className={`p-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-white text-neutral-900 shadow-2xs'
                  : 'text-neutral-500 hover:text-neutral-900'
              }`}
              title="Vizualizare Tabel"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom row: Campaign Status Filter Chips & Category/Platform Dropdowns */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-neutral-100">
        {/* Status Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {statusChips.map((chip) => {
            const isActive = filterOptions.campaignStatus === chip.id;
            return (
              <button
                key={chip.id}
                onClick={() => onFilterChange({ campaignStatus: chip.id })}
                className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-[#0f4a3c] text-white shadow-2xs'
                    : 'bg-neutral-100 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200/70'
                }`}
              >
                {chip.label}
              </button>
            );
          })}
        </div>

        {/* Dropdowns: Category, Platform, Sort */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {/* Category Dropdown */}
          <select
            value={filterOptions.category}
            onChange={(e) => onFilterChange({ category: e.target.value })}
            className="bg-neutral-50 border border-neutral-200 rounded-xl px-2.5 py-1.5 text-xs text-neutral-700 focus:outline-none focus:border-[#0f4a3c] cursor-pointer"
          >
            <option value="all">Toate categoriile</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          {/* Platform Dropdown */}
          <select
            value={filterOptions.platform}
            onChange={(e) => onFilterChange({ platform: e.target.value })}
            className="bg-neutral-50 border border-neutral-200 rounded-xl px-2.5 py-1.5 text-xs text-neutral-700 focus:outline-none focus:border-[#0f4a3c] cursor-pointer"
          >
            <option value="all">Toate platformele</option>
            <option value="TikTok Ads">TikTok Ads</option>
            <option value="Facebook Ads">Facebook Ads</option>
            <option value="Google Ads">Google Ads</option>
            <option value="Altele">Altele</option>
          </select>

          {/* Sort By Dropdown */}
          <select
            value={filterOptions.sortBy}
            onChange={(e) => onFilterChange({ sortBy: e.target.value as any })}
            className="bg-neutral-50 border border-neutral-200 rounded-xl px-2.5 py-1.5 text-xs text-neutral-700 focus:outline-none focus:border-[#0f4a3c] cursor-pointer"
          >
            <option value="date_desc">Cele mai recente</option>
            <option value="roas_desc">ROAS (cel mai mare)</option>
            <option value="revenue_desc">Venit (descrescător)</option>
            <option value="spend_desc">Buget cheltuit</option>
            <option value="price_desc">Preț produs (mare la mic)</option>
            <option value="name_asc">Nume (A - Z)</option>
          </select>
        </div>
      </div>
    </div>
  );
};
