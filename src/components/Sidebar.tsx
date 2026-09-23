import React from 'react';
import {
  LayoutGrid,
  Package,
  Bookmark,
  BarChart2,
  Tag,
  Archive,
  Image as ImageIcon,
  CheckCircle2,
  Settings,
  MoreHorizontal,
  Sparkles,
  Inbox
} from 'lucide-react';

interface SidebarProps {
  currentTab: 'dashboard' | 'catalog' | 'kanban' | 'campaigns' | 'gallery' | 'reports';
  onTabChange: (tab: 'dashboard' | 'catalog' | 'kanban' | 'campaigns' | 'gallery' | 'reports') => void;
  productsCount: number;
  testedCount: number;
  testingCount: number;
  userName?: string;
  userEmail?: string;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onTabChange,
  productsCount,
  testedCount,
  testingCount,
  userName = 'Alex M.',
  userEmail = 'Personal workspace',
  isOpenMobile,
  onCloseMobile,
}) => {
  const percentTested = productsCount > 0 ? Math.round((testedCount / productsCount) * 100) : 0;

  const handleNav = (tab: typeof currentTab) => {
    onTabChange(tab);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-xs md:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-white border-r border-neutral-200/80 flex flex-col justify-between transition-transform duration-200 ease-in-out md:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-6">
          {/* Brand Lockup */}
          <div className="flex items-center gap-3 px-2">
            <div className="w-9 h-9 rounded-xl bg-[#0f4a3c] flex items-center justify-center text-emerald-300 shadow-sm">
              <Sparkles className="w-5 h-5 fill-emerald-300/30" />
            </div>
            <div>
              <div className="text-base font-bold tracking-tight text-neutral-900 leading-tight">
                Collective
              </div>
              <div className="text-[10px] font-semibold tracking-widest text-neutral-400 uppercase">
                PRODUCT JOURNAL
              </div>
            </div>
          </div>

          {/* Section: WORKSPACE */}
          <div className="space-y-1">
            <div className="text-[11px] font-bold tracking-wider text-neutral-400 uppercase px-3 py-1.5">
              WORKSPACE
            </div>

            <button
              onClick={() => handleNav('dashboard')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                currentTab === 'dashboard'
                  ? 'bg-[#eaf3ee] text-[#134e48] font-semibold'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
              }`}
            >
              <LayoutGrid className={`w-4 h-4 ${currentTab === 'dashboard' ? 'text-[#134e48]' : 'text-neutral-500'}`} />
              <span>Overview</span>
            </button>

            <button
              onClick={() => handleNav('catalog')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                currentTab === 'catalog'
                  ? 'bg-[#eaf3ee] text-[#134e48] font-semibold'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <Package className={`w-4 h-4 ${currentTab === 'catalog' ? 'text-[#134e48]' : 'text-neutral-500'}`} />
                <span>Produsele mele</span>
              </div>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-600">
                {productsCount}
              </span>
            </button>

            <button
              onClick={() => handleNav('kanban')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                currentTab === 'kanban'
                  ? 'bg-[#eaf3ee] text-[#134e48] font-semibold'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
              }`}
            >
              <Bookmark className={`w-4 h-4 ${currentTab === 'kanban' ? 'text-[#134e48]' : 'text-neutral-500'}`} />
              <span>Colecții & Workflow</span>
            </button>

            <button
              onClick={() => handleNav('reports')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                currentTab === 'reports'
                  ? 'bg-[#eaf3ee] text-[#134e48] font-semibold'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
              }`}
            >
              <BarChart2 className={`w-4 h-4 ${currentTab === 'reports' ? 'text-[#134e48]' : 'text-neutral-500'}`} />
              <span>Rapoarte</span>
            </button>
          </div>

          {/* Section: ORGANIZEAZĂ */}
          <div className="space-y-1">
            <div className="text-[11px] font-bold tracking-wider text-neutral-400 uppercase px-3 py-1.5">
              ORGANIZEAZĂ
            </div>

            <button
              onClick={() => handleNav('campaigns')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                currentTab === 'campaigns'
                  ? 'bg-[#eaf3ee] text-[#134e48] font-semibold'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
              }`}
            >
              <Tag className={`w-4 h-4 ${currentTab === 'campaigns' ? 'text-[#134e48]' : 'text-neutral-500'}`} />
              <span>Etichete & Reclame</span>
            </button>

            <button
              onClick={() => handleNav('gallery')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                currentTab === 'gallery'
                  ? 'bg-[#eaf3ee] text-[#134e48] font-semibold'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
              }`}
            >
              <ImageIcon className={`w-4 h-4 ${currentTab === 'gallery' ? 'text-[#134e48]' : 'text-neutral-500'}`} />
              <span>Galerie Foto</span>
            </button>

            <button
              onClick={() => handleNav('catalog')}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50 transition-colors"
            >
              <Archive className="w-4 h-4 text-neutral-500" />
              <span>Arhivă</span>
            </button>
          </div>

          {/* Progress Widget matching image */}
          <div className="bg-[#f0f7f3] border border-[#e0ece5] rounded-2xl p-4 space-y-2.5">
            <div className="w-8 h-8 rounded-lg bg-white border border-[#d3e5db] flex items-center justify-center text-[#134e48] shadow-2xs">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-neutral-900">
                Ai testat {percentTested}% din listă
              </div>
              <div className="text-[11px] text-neutral-500 mt-0.5">
                {testedCount} din {productsCount} produse
              </div>
            </div>
            <div className="w-full bg-[#dcefe5] h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-[#134e48] h-full rounded-full transition-all duration-500"
                style={{ width: `${percentTested}%` }}
              />
            </div>
          </div>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-neutral-200/80 space-y-3 bg-white">
          <button
            onClick={() => alert('Panoul de setări Collective')}
            className="w-full flex items-center gap-3 px-2 py-1.5 text-xs text-neutral-600 hover:text-neutral-900 transition-colors"
          >
            <Settings className="w-4 h-4 text-neutral-400" />
            <span>Setări</span>
          </button>

          <div className="flex items-center justify-between px-2 pt-1">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#edd9ce] text-[#784d3b] font-bold text-xs flex items-center justify-center">
                AM
              </div>
              <div className="text-left">
                <div className="text-xs font-semibold text-neutral-900 leading-tight">
                  {userName}
                </div>
                <div className="text-[11px] text-neutral-400 leading-tight">
                  {userEmail}
                </div>
              </div>
            </div>
            <MoreHorizontal className="w-4 h-4 text-neutral-400" />
          </div>
        </div>
      </aside>
    </>
  );
};
