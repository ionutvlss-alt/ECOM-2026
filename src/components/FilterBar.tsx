import React from 'react';
import { FilterOptions, ProductCategory, ProductStatus, SponsorshipType } from '../types/product';
import { CATEGORIES_LIST } from '../data/initialProducts';
import { Search, LayoutGrid, List, ArrowUpDown, X } from 'lucide-react';

interface FilterBarProps {
  filterOptions: FilterOptions;
  onFilterChange: (newOptions: Partial<FilterOptions>) => void;
  viewMode: 'grid' | 'table';
  onViewModeChange: (mode: 'grid' | 'table') => void;
  totalFilteredCount: number;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filterOptions,
  onFilterChange,
  viewMode,
  onViewModeChange,
  totalFilteredCount,
}) => {
  const statusChips: { id: ProductStatus | 'all'; label: string }[] = [
    { id: 'all', label: 'Toate' },
    { id: 'to_test', label: 'De testat' },
    { id: 'testing', label: 'În testare' },
    { id: 'tested', label: 'Testate' },
    { id: 'rejected', label: 'Respinse' },
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
            placeholder="Caută după nume, brand, notițe..."
            className="w-full bg-neutral-50 border border-neutral-200 rounded-xl pl-9 pr-8 py-2 text-xs text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-[#0f4a3c] focus:bg-white transition-all"
          />
          {filterOptions.search && (
            <button
              onClick={() => onFilterChange({ search: '' })}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700"
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
              className={`p-1.5 rounded-lg text-xs font-medium transition-colors ${
                viewMode === 'grid'
                  ? 'bg-white text-neutral-900 shadow-2xs'
                  : 'text-neutral-500 hover:text-neutral-900'
              }`}
              title="Vizualizare Carduri (Grid)"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => onViewModeChange('table')}
              className={`p-1.5 rounded-lg text-xs font-medium transition-colors ${
                viewMode === 'table'
                  ? 'bg-white text-neutral-900 shadow-2xs'
                  : 'text-neutral-500 hover:text-neutral-900'
              }`}
              title="Vizualizare Tabel (SaaS Table)"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom row: Status Filter Chips & Category Select */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-neutral-100">
        {/* Status Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {statusChips.map((chip) => {
            const isActive = filterOptions.status === chip.id;
            return (
              <button
                key={chip.id}
                onClick={() => onFilterChange({ status: chip.id })}
                className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors shrink-0 ${
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

        {/* Dropdowns: Category, Sponsorship, Sort */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* Category Dropdown */}
          <select
            value={filterOptions.category}
            onChange={(e) => onFilterChange({ category: e.target.value as any })}
            className="bg-neutral-50 border border-neutral-200 rounded-xl px-2.5 py-1.5 text-xs text-neutral-700 focus:outline-none focus:border-[#0f4a3c]"
          >
            <option value="all">Toate categoriile</option>
            {CATEGORIES_LIST.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          {/* Sort Dropdown */}
          <select
            value={filterOptions.sortBy}
            onChange={(e) => onFilterChange({ sortBy: e.target.value as any })}
            className="bg-neutral-50 border border-neutral-200 rounded-xl px-2.5 py-1.5 text-xs text-neutral-700 focus:outline-none focus:border-[#0f4a3c]"
          >
            <option value="date_desc">Cele mai noi</option>
            <option value="date_asc">Cele mai vechi</option>
            <option value="rating_desc">Scor descrescător</option>
            <option value="rating_asc">Scor crescător</option>
            <option value="price_desc">Preț descrescător</option>
            <option value="price_asc">Preț crescător</option>
            <option value="name_asc">Alfabetic (A-Z)</option>
          </select>
        </div>
      </div>
    </div>
  );
};
