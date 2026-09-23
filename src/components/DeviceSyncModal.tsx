import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import {
  X,
  Smartphone,
  Laptop,
  QrCode,
  ArrowRightLeft,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Download,
  Upload,
  Cloud,
  Copy,
  Check,
  RefreshCw,
} from 'lucide-react';
import { Product } from '../types/product';
import { storageService } from '../services/storageService';
import { PeerSyncManager, SyncPayload } from '../services/peerSyncService';
import { cloudSyncService, CloudConfig } from '../services/cloudSyncService';

interface DeviceSyncModalProps {
  products: Product[];
  onSyncSuccess: (newProducts: Product[]) => void;
  onClose: () => void;
  initialSyncCode?: string | null;
}

export const DeviceSyncModal: React.FC<DeviceSyncModalProps> = ({
  products,
  onSyncSuccess,
  onClose,
  initialSyncCode = null,
}) => {
  const [activeTab, setActiveTab] = useState<'qr' | 'code' | 'cloud' | 'file'>(
    initialSyncCode ? 'code' : 'qr'
  );

  // QR / P2P State
  const [roomCode, setRoomCode] = useState<string>('');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [p2pStatus, setP2pStatus] = useState<'idle' | 'waiting' | 'connected' | 'success' | 'error'>(
    'idle'
  );
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [copiedLink, setCopiedLink] = useState(false);
  const peerSenderRef = useRef<PeerSyncManager | null>(null);
  const peerReceiverRef = useRef<PeerSyncManager | null>(null);

  // Manual PIN code state
  const [inputCode, setInputCode] = useState<string>(initialSyncCode || '');
  const [isReceiving, setIsReceiving] = useState(false);

  // Cloud Config State
  const [cloudCfg, setCloudCfg] = useState<CloudConfig>(cloudSyncService.getConfig());
  const [isCloudTesting, setIsCloudTesting] = useState(false);
  const [cloudStatusMsg, setCloudStatusMsg] = useState<string | null>(null);

  // File import ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Inițiază Sender (PC) pentru Cod QR
  useEffect(() => {
    if (activeTab === 'qr') {
      const manager = new PeerSyncManager();
      peerSenderRef.current = manager;
      setP2pStatus('waiting');
      setStatusMessage('Se generează codul de transfer...');

      const controls = manager.initSender(
        async (code) => {
          setRoomCode(code);
          const fullUrl = `${window.location.origin}${window.location.pathname}?sync_room=${code}`;
          try {
            const url = await QRCode.toDataURL(fullUrl, {
              width: 260,
              margin: 2,
              color: {
                dark: '#0f4a3c',
                light: '#ffffff',
              },
            });
            setQrDataUrl(url);
            setStatusMessage('Scanează codul QR cu camera telefonului!');
          } catch (err) {
            console.error('Eroare generare QR:', err);
          }
        },
        () => {
          setP2pStatus('connected');
          setStatusMessage('Telefonul s-a conectat! Se transferă produsele...');
        },
        (count) => {
          setP2pStatus('success');
          setStatusMessage(`Gata! ${count} produse au fost transferate cu succes pe telefon!`);
        },
        (err) => {
          setP2pStatus('error');
          setStatusMessage(err);
        }
      );

      return () => {
        controls.destroy();
      };
    }
  }, [activeTab]);

  // Handle manual code receive (Telefon)
  const handleConnectByCode = () => {
    if (!inputCode.trim()) return;
    setIsReceiving(true);
    setP2pStatus('waiting');
    setStatusMessage('Se conectează la calculator...');

    const manager = new PeerSyncManager();
    peerReceiverRef.current = manager;

    const controls = manager.initReceiver(
      inputCode.trim(),
      () => {
        setP2pStatus('connected');
        setStatusMessage('Conectat! Se descarcă produsele...');
      },
      (payload: SyncPayload) => {
        setP2pStatus('success');
        setIsReceiving(false);
        setStatusMessage(
          `Sincronizare completă! S-au descărcat ${payload.products.length} produse.`
        );
        onSyncSuccess(payload.products);
        setTimeout(() => {
          onClose();
        }, 1500);
      },
      (err) => {
        setP2pStatus('error');
        setIsReceiving(false);
        setStatusMessage(err);
      }
    );

    return () => {
      controls.destroy();
    };
  };

  // Auto connect if initialSyncCode provided
  useEffect(() => {
    if (initialSyncCode) {
      handleConnectByCode();
    }
  }, [initialSyncCode]);

  const handleCopyLink = () => {
    if (!roomCode) return;
    const fullUrl = `${window.location.origin}${window.location.pathname}?sync_room=${roomCode}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleSaveCloud = async () => {
    cloudSyncService.saveConfig(cloudCfg);
    setIsCloudTesting(true);
    setCloudStatusMsg(null);
    try {
      await cloudSyncService.pushToCloud(products);
      setCloudStatusMsg('Configurare salvată cu succes! Datele au fost sincronizate în Cloud.');
    } catch (err: any) {
      setCloudStatusMsg('Eroare salvare cloud: ' + err.message);
    } finally {
      setIsCloudTesting(false);
    }
  };

  const handleFileImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const loaded = await storageService.importFromJSON(file);
      onSyncSuccess(loaded);
      onClose();
    } catch (err: any) {
      alert('Eroare import: ' + err.message);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/45 backdrop-blur-xs flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg bg-white border border-neutral-200/90 rounded-2xl overflow-hidden shadow-2xl p-6 space-y-5 text-neutral-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-neutral-150">
          <div>
            <h3 className="text-base font-bold text-neutral-900 flex items-center gap-2">
              <ArrowRightLeft className="w-5 h-5 text-[#0f4a3c]" />
              <span>Sincronizare Dispozitive (PC ⇄ Telefon)</span>
            </h3>
            <p className="text-xs text-neutral-500 mt-0.5">
              Accesează aceleași produse pe telefon și calculator fără bătăi de cap.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="grid grid-cols-3 gap-1 p-1 bg-neutral-100 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setActiveTab('qr')}
            className={`py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'qr'
                ? 'bg-white text-neutral-900 shadow-2xs font-bold'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <QrCode className="w-3.5 h-3.5 text-[#0f4a3c]" />
            <span>Cod QR (1-Click)</span>
          </button>

          <button
            onClick={() => setActiveTab('code')}
            className={`py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'code'
                ? 'bg-white text-neutral-900 shadow-2xs font-bold'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5 text-[#0f4a3c]" />
            <span>Descarcă pe Telefon</span>
          </button>

          <button
            onClick={() => setActiveTab('cloud')}
            className={`py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'cloud'
                ? 'bg-white text-neutral-900 shadow-2xs font-bold'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <Cloud className="w-3.5 h-3.5 text-[#0f4a3c]" />
            <span>Cloud Automat</span>
          </button>
        </div>

        {/* TAB 1: QR CODE (SENDER / DE PE PC PE TELEFON) */}
        {activeTab === 'qr' && (
          <div className="space-y-4 text-center">
            <div className="p-3 bg-[#f5f9f6] border border-[#d6ebd9] rounded-xl text-left">
              <span className="text-xs font-bold text-[#0f4a3c] block mb-0.5">
                Cum funcționează transferul instant:
              </span>
              <ol className="text-[11px] text-neutral-600 space-y-1 list-decimal list-inside">
                <li>Deschide camera telefonului și scanează codul QR de mai jos.</li>
                <li>Telefonul va deschide pagina și se va conecta direct la calculator.</li>
                <li>Toate cele {products.length} produse se descarcă automat în câteva secunde!</li>
              </ol>
            </div>

            <div className="flex flex-col items-center justify-center py-2">
              {qrDataUrl ? (
                <div className="p-3 bg-white border-2 border-neutral-200 rounded-2xl shadow-sm inline-block">
                  <img src={qrDataUrl} alt="Cod QR Sincronizare" className="w-52 h-52 mx-auto" />
                </div>
              ) : (
                <div className="w-52 h-52 flex flex-col items-center justify-center border-2 border-dashed border-neutral-200 rounded-2xl">
                  <Loader2 className="w-8 h-8 text-[#0f4a3c] animate-spin mb-2" />
                  <span className="text-xs text-neutral-500">Se creează conexiunea securizată...</span>
                </div>
              )}

              {roomCode && (
                <div className="mt-3 flex items-center gap-2">
                  <span className="text-xs text-neutral-500">Cod manual:</span>
                  <span className="px-2.5 py-1 bg-neutral-100 border border-neutral-200 rounded-lg text-sm font-mono font-bold text-[#0f4a3c] tracking-widest">
                    {roomCode}
                  </span>
                  <button
                    onClick={handleCopyLink}
                    className="p-1.5 text-neutral-500 hover:text-neutral-900 border border-neutral-200 hover:bg-neutral-50 rounded-lg transition-colors cursor-pointer"
                    title="Copiază link-ul"
                  >
                    {copiedLink ? (
                      <Check className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Status Feedback */}
            <div
              className={`p-3 rounded-xl text-xs flex items-center justify-center gap-2 font-medium ${
                p2pStatus === 'waiting'
                  ? 'bg-amber-50 border border-amber-200 text-amber-800'
                  : p2pStatus === 'connected'
                  ? 'bg-blue-50 border border-blue-200 text-blue-800'
                  : p2pStatus === 'success'
                  ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                  : p2pStatus === 'error'
                  ? 'bg-rose-50 border border-rose-200 text-rose-800'
                  : 'bg-neutral-50 border border-neutral-200 text-neutral-600'
              }`}
            >
              {p2pStatus === 'waiting' && <Loader2 className="w-4 h-4 animate-spin text-amber-600" />}
              {p2pStatus === 'connected' && <Loader2 className="w-4 h-4 animate-spin text-blue-600" />}
              {p2pStatus === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
              {p2pStatus === 'error' && <AlertTriangle className="w-4 h-4 text-rose-600" />}
              <span>{statusMessage || 'Așteptare conectare...'}</span>
            </div>
          </div>
        )}

        {/* TAB 2: RECEIVE BY PIN (PENTRU TELEFON) */}
        {activeTab === 'code' && (
          <div className="space-y-4">
            <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-600">
              Dacă ești pe telefon și ai deschis fereastra de sincronizare de pe calculator, introdu
              codul din 6 litere/cifre afișat pe ecranul PC-ului:
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-neutral-700 block">Cod Sincronizare:</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  maxLength={6}
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                  placeholder="EX: K9X2P4"
                  className="flex-1 px-4 py-2.5 border border-neutral-200 rounded-xl text-center font-mono font-bold text-lg tracking-widest text-neutral-900 uppercase focus:outline-none focus:border-[#0f4a3c]"
                />
                <button
                  onClick={handleConnectByCode}
                  disabled={!inputCode.trim() || isReceiving}
                  className="px-5 py-2.5 bg-[#0f4a3c] hover:bg-[#0c3b30] disabled:bg-neutral-300 text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  {isReceiving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Se descarcă...</span>
                    </>
                  ) : (
                    <span>Conectează</span>
                  )}
                </button>
              </div>
            </div>

            {statusMessage && (
              <div
                className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                  p2pStatus === 'success'
                    ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                    : p2pStatus === 'error'
                    ? 'bg-rose-50 border border-rose-200 text-rose-800'
                    : 'bg-blue-50 border border-blue-200 text-blue-800'
                }`}
              >
                {p2pStatus === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                {p2pStatus === 'error' && <AlertTriangle className="w-4 h-4 text-rose-600" />}
                {p2pStatus !== 'success' && p2pStatus !== 'error' && (
                  <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                )}
                <span>{statusMessage}</span>
              </div>
            )}

            <div className="pt-3 border-t border-neutral-150">
              <span className="text-xs font-bold text-neutral-700 block mb-2">
                Sau trimite prin fișier (WhatsApp / Email):
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => storageService.exportToJSON(products)}
                  className="p-2.5 bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 rounded-xl text-xs font-semibold text-neutral-800 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-[#0f4a3c]" />
                  <span>Descarcă fișier</span>
                </button>

                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".json,application/json"
                  onChange={handleFileImport}
                  className="hidden"
                />

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2.5 bg-[#f5f9f6] hover:bg-[#eaf3ee] border border-[#cfe5d9] rounded-xl text-xs font-semibold text-[#0f4a3c] flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Încarcă fișier</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: CLOUD PERMANENT */}
        {activeTab === 'cloud' && (
          <div className="space-y-4">
            <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-600">
              Pentru ca modificările să se sincronizeze <strong>automat și permanent</strong> de
              fiecare dată când adaugi un produs (fără să mai scanezi coduri), poți conecta un
              backend gratuit precum <strong>Firebase Realtime Database</strong> sau{' '}
              <strong>Supabase</strong>.
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-neutral-700 block mb-1">
                  Furnizor Cloud:
                </label>
                <select
                  value={cloudCfg.provider}
                  onChange={(e) =>
                    setCloudCfg({ ...cloudCfg, provider: e.target.value as any })
                  }
                  className="w-full px-3 py-2 border border-neutral-200 rounded-xl text-xs bg-white text-neutral-800 focus:outline-none focus:border-[#0f4a3c]"
                >
                  <option value="none">Fără Cloud (Stocare doar pe acest dispozitiv)</option>
                  <option value="firebase_rest">Firebase Realtime Database (Gratuit)</option>
                  <option value="supabase">Supabase PostgreSQL REST (Gratuit)</option>
                </select>
              </div>

              {cloudCfg.provider !== 'none' && (
                <>
                  <div>
                    <label className="text-xs font-bold text-neutral-700 block mb-1">
                      URL Proiect / Bază de date:
                    </label>
                    <input
                      type="text"
                      placeholder={
                        cloudCfg.provider === 'firebase_rest'
                          ? 'https://proiectul-tau-default-rtdb.firebaseio.com'
                          : 'https://xyzcompany.supabase.co'
                      }
                      value={cloudCfg.url}
                      onChange={(e) => setCloudCfg({ ...cloudCfg, url: e.target.value })}
                      className="w-full px-3 py-2 border border-neutral-200 rounded-xl text-xs text-neutral-800 font-mono focus:outline-none focus:border-[#0f4a3c]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-neutral-700 block mb-1">
                      Cheie API / Secret (opțional):
                    </label>
                    <input
                      type="password"
                      placeholder="Cheia anon / secretă"
                      value={cloudCfg.apiKey}
                      onChange={(e) => setCloudCfg({ ...cloudCfg, apiKey: e.target.value })}
                      className="w-full px-3 py-2 border border-neutral-200 rounded-xl text-xs text-neutral-800 font-mono focus:outline-none focus:border-[#0f4a3c]"
                    />
                  </div>

                  <button
                    onClick={handleSaveCloud}
                    disabled={isCloudTesting}
                    className="w-full py-2.5 bg-[#0f4a3c] hover:bg-[#0c3b30] text-white text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                  >
                    {isCloudTesting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Cloud className="w-4 h-4" />
                    )}
                    <span>Salvează și Sincronizează Acum</span>
                  </button>
                </>
              )}
            </div>

            {cloudStatusMsg && (
              <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-800">
                {cloudStatusMsg}
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="pt-2 border-t border-neutral-150 flex items-center justify-between">
          <div className="text-[11px] text-neutral-400">
            {products.length} produse pregătite pentru sincronizare
          </div>
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
