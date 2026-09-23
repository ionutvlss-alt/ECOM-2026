import React from 'react';
import { Bell, Menu, Database } from 'lucide-react';

interface HeaderBarProps {
  currentTab: string;
  onOpenMobileSidebar: () => void;
  onOpenExportImport: () => void;
  userName?: string;
}

const TAB_TITLES: Record<string, string> = {
  dashboard: 'Overview',
  catalog: 'Produsele mele',
  kanban: 'Workflow Campanii',
  campaigns: 'Campanii Ads (Facebook & TikTok)',
  categories: 'Categorii Produse',
  gallery: 'Galerie Foto',
  reports: 'Rapoarte & ROAS',
};

export const HeaderBar: React.FC<HeaderBarProps> = ({
  currentTab,
  onOpenMobileSidebar,
  onOpenExportImport,
  userName = 'ionutvlss',
}) => {
  return (
    <header className="h-14 border-b border-neutral-200/80 bg-white/80 backdrop-blur-md sticky top-0 z-30 px-4 sm:px-8 flex items-center justify-between">
      {/* Left: Mobile menu toggle + Breadcrumbs */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileSidebar}
          className="p-1.5 rounded-lg text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 md:hidden transition-colors cursor-pointer"
          title="Meniu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 text-xs text-neutral-500 font-medium">
          <span>Workspace</span>
          <span className="text-neutral-300">/</span>
          <span className="text-neutral-900 font-semibold">
            {TAB_TITLES[currentTab] || 'Overview'}
          </span>
        </div>
      </div>

      {/* Right: Actions & Profile */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenExportImport}
          className="px-2.5 py-1 text-xs font-medium text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg flex items-center gap-1.5 border border-neutral-200 transition-colors cursor-pointer"
          title="Backup & Export date"
        >
          <Database className="w-3.5 h-3.5 text-neutral-500" />
          <span className="hidden sm:inline">Backup / Export</span>
        </button>

        <div className="w-px h-4 bg-neutral-200 mx-1" />

        <div className="flex items-center gap-2 p-1 rounded-lg">
          <div className="w-7 h-7 rounded-full bg-[#0f4a3c] text-white font-bold text-xs flex items-center justify-center shadow-xs">
            IV
          </div>
          <span className="text-xs font-semibold text-neutral-800 hidden sm:inline">
            {userName}
          </span>
        </div>
      </div>
    </header>
  );
};
