import React, { useRef, useState } from 'react';
import { Product } from '../types/product';
import { storageService } from '../services/storageService';
import { X, Download, Upload, RefreshCw, CheckCircle2, AlertTriangle, FileText, Search, Database } from 'lucide-react';

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
  const [isScanning, setIsScanning] = useState(false);

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

  const handleScanRecovery = async () => {
    setIsScanning(true);
    setErrorStatus(null);
    try {
      const scanResult = await storageService.deepScanBrowserStorage();
      const allFound = scanResult.recovered;

      if (allFound.length > products.length) {
        setImportStatus(`Recuperare reușită! S-au găsit ${allFound.length - products.length} produse suplimentare în memoria browserului! Total: ${allFound.length}`);
        onImportSuccess(allFound);
      } else {
        setImportStatus(`Scanare completă: ${allFound.length} produse sunt active și securizate în baza locală.`);
      }
    } catch (err: any) {
      setErrorStatus('Eroare la scanarea bazei de date: ' + err.message);
    } finally {
      setIsScanning(false);
    }
  };

  const handleReset = () => {
    if (window.confirm('Ești sigur că vrei să resetezi lista de produse? Toate datele vor fi golite.')) {
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
        className="relative w-full max-w-lg bg-white border border-neutral-200/90 rounded-2xl overflow-hidden shadow-2xl p-6 space-y-5 text-neutral-900"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-neutral-150">
          <div>
            <h3 className="text-base font-bold text-neutral-900 flex items-center gap-2">
              <Database className="w-5 h-5 text-[#0f4a3c]" />
              <span>Gestionare Date & Bază Locală</span>
            </h3>
            <p className="text-xs text-neutral-500 mt-0.5">
              Stocare permanentă în browser (IndexedDB + Backup local).
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status messages */}
        {importStatus && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{importStatus}</span>
          </div>
        )}

        {errorStatus && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorStatus}</span>
          </div>
        )}

        {/* Diagnostic & Quick Recovery Button */}
        <div className="p-3.5 bg-neutral-50 border border-neutral-200 rounded-xl flex items-center justify-between gap-3">
          <div>
            <span className="text-xs font-bold text-neutral-900 block">Sincronizare Bază Locală</span>
            <span className="text-[11px] text-neutral-500 block">
              Scanează IndexedDB și memoria cache pentru a asigura salvarea fiecărui produs.
            </span>
          </div>
          <button
            type="button"
            onClick={handleScanRecovery}
            disabled={isScanning}
            className="px-3 py-1.5 bg-white hover:bg-neutral-100 border border-neutral-200 rounded-lg text-xs font-semibold text-neutral-800 transition-colors shrink-0 flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <Search className="w-3.5 h-3.5 text-[#0f4a3c]" />
            <span>{isScanning ? 'Scanare...' : 'Verifică / Restaurează'}</span>
          </button>
        </div>

        {/* Export Options */}
        <div className="space-y-3">
          <span className="text-xs font-bold text-neutral-700 uppercase tracking-wider block">
            Exportă Datele Curente ({products.length} produse)
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={handleExportJSON}
              className="p-3.5 bg-neutral-50 hover:bg-[#f0f7f3] border border-neutral-200 hover:border-[#0f4a3c]/40 rounded-xl text-left transition-colors flex flex-col justify-between group cursor-pointer"
            >
              <div className="flex items-center justify-between w-full mb-1">
                <span className="text-xs font-bold text-neutral-900 group-hover:text-[#0f4a3c]">Backup JSON</span>
                <Download className="w-4 h-4 text-neutral-400 group-hover:text-[#0f4a3c]" />
              </div>
              <p className="text-[11px] text-neutral-500">
                Păstrează toate datele complete: poze, rezultate campanie, ROAS, link-uri.
              </p>
            </button>

            <button
              onClick={handleExportCSV}
              className="p-3.5 bg-neutral-50 hover:bg-[#f0f7f3] border border-neutral-200 hover:border-[#0f4a3c]/40 rounded-xl text-left transition-colors flex flex-col justify-between group cursor-pointer"
            >
              <div className="flex items-center justify-between w-full mb-1">
                <span className="text-xs font-bold text-neutral-900 group-hover:text-[#0f4a3c]">Export Tabel CSV</span>
                <FileText className="w-4 h-4 text-neutral-400 group-hover:text-[#0f4a3c]" />
              </div>
              <p className="text-[11px] text-neutral-500">
                Pentru deschidere în Microsoft Excel sau Google Sheets.
              </p>
            </button>
          </div>
        </div>

        {/* Import Option */}
        <div className="space-y-2 pt-2 border-t border-neutral-150">
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
            className="w-full p-3 bg-[#f5f9f6] hover:bg-[#eaf3ee] border border-dashed border-[#cfe5d9] hover:border-[#0f4a3c] rounded-xl flex items-center justify-center gap-2 text-xs font-semibold text-[#0f4a3c] transition-colors cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            <span>Selectează fișierul JSON de pe computer</span>
          </button>
        </div>

        {/* Reset Option */}
        <div className="pt-2 border-t border-neutral-150 flex items-center justify-between">
          <button
            onClick={handleReset}
            className="text-xs text-neutral-400 hover:text-rose-600 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Golește toate produsele</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs text-neutral-600 hover:text-neutral-900 font-semibold cursor-pointer"
          >
            Închide
          </button>
        </div>
      </div>
    </div>
  );
};
