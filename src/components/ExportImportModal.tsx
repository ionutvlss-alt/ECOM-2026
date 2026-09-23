import React, { useRef, useState } from 'react';
import { Product } from '../types/product';
import { storageService } from '../services/storageService';
import { X, Download, Upload, RefreshCw, CheckCircle2, AlertTriangle, FileText } from 'lucide-react';

interface ExportImportModalProps {
  products: Product[];
  onImportSuccess: (products: Product[]) => void;
  onResetSuccess: (products: Product[]) => void;
  onClose: () => void;
}

export const ExportImportModal: React.FC<ExportImportModalProps> = ({
  products,
  onImportSuccess,
  onResetSuccess,
  onClose,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);

  const handleExportJSON = () => {
    storageService.exportToJSON(products);
  };

  const handleExportCSV = () => {
    storageService.exportToCSV(products);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setErrorStatus(null);
      const loaded = await storageService.importFromJSON(file);
      setImportStatus(`Succes: ${loaded.length} produse importate cu succes!`);
      setTimeout(() => {
        onImportSuccess(loaded);
        onClose();
      }, 1200);
    } catch (err: any) {
      setErrorStatus(err.message || 'Eroare la importul fișierului.');
    }
  };

  const handleReset = () => {
    if (window.confirm('Ești sigur că vrei să resetezi lista de produse la valorile inițiale demonstrative? Toate modificările curente vor fi înlocuite.')) {
      const reset = storageService.resetToDefault();
      onResetSuccess(reset);
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg bg-white border border-neutral-200/90 rounded-2xl overflow-hidden shadow-2xl p-6 space-y-6 text-neutral-900"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-neutral-150">
          <div>
            <h3 className="text-base font-bold text-neutral-900">Gestionare Date & Backup</h3>
            <p className="text-xs text-neutral-500 mt-0.5">
              Exportă sau importă colecția ta de produse, recenzii și fotografii.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status messages */}
        {importStatus && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{importStatus}</span>
          </div>
        )}

        {errorStatus && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            <span>{errorStatus}</span>
          </div>
        )}

        {/* Export Options */}
        <div className="space-y-3">
          <span className="text-xs font-bold text-neutral-700 uppercase tracking-wider block">
            Exportă Datele Curente ({products.length} produse)
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={handleExportJSON}
              className="p-4 bg-neutral-50 hover:bg-[#f0f7f3] border border-neutral-200 hover:border-[#0f4a3c]/40 rounded-xl text-left transition-colors flex flex-col justify-between group"
            >
              <div className="flex items-center justify-between w-full mb-2">
                <span className="text-xs font-bold text-neutral-900 group-hover:text-[#0f4a3c]">Backup JSON</span>
                <Download className="w-4 h-4 text-neutral-400 group-hover:text-[#0f4a3c]" />
              </div>
              <p className="text-[11px] text-neutral-500">
                Păstrează toate datele complete: poze, jurnale, criterii și setări.
              </p>
            </button>

            <button
              onClick={handleExportCSV}
              className="p-4 bg-neutral-50 hover:bg-[#f0f7f3] border border-neutral-200 hover:border-[#0f4a3c]/40 rounded-xl text-left transition-colors flex flex-col justify-between group"
            >
              <div className="flex items-center justify-between w-full mb-2">
                <span className="text-xs font-bold text-neutral-900 group-hover:text-[#0f4a3c]">Export CSV</span>
                <FileText className="w-4 h-4 text-neutral-400 group-hover:text-[#0f4a3c]" />
              </div>
              <p className="text-[11px] text-neutral-500">
                Pentru deschidere în Microsoft Excel sau Google Sheets.
              </p>
            </button>
          </div>
        </div>

        {/* Import Option */}
        <div className="space-y-3 pt-3 border-t border-neutral-150">
          <span className="text-xs font-bold text-neutral-700 uppercase tracking-wider block">
            Restaurează din fișier JSON
          </span>

          <input
            type="file"
            ref={fileInputRef}
            accept=".json,application/json"
            onChange={handleFileChange}
            className="hidden"
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full p-4 bg-[#f5f9f6] hover:bg-[#eaf3ee] border border-dashed border-[#cfe5d9] hover:border-[#0f4a3c] rounded-xl flex items-center justify-center gap-2 text-xs font-semibold text-[#0f4a3c] transition-colors"
          >
            <Upload className="w-4 h-4" />
            <span>Selectează fișierul JSON de pe computer</span>
          </button>
        </div>

        {/* Reset Option */}
        <div className="pt-3 border-t border-neutral-150 flex items-center justify-between">
          <button
            onClick={handleReset}
            className="text-xs text-neutral-400 hover:text-rose-600 flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Resetează la datele din fabrică</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs text-neutral-500 hover:text-neutral-900"
          >
            Închide
          </button>
        </div>
      </div>
    </div>
  );
};
