import React from 'react';
import { parseAdUrl } from '../utils/adPreviewHelper';
import { ExternalLink, Play, Video, Globe, Film, AlertCircle } from 'lucide-react';

interface AdPreviewCardProps {
  url: string;
  label?: string;
  platform?: string;
  notes?: string;
  onRemove?: () => void;
  compact?: boolean;
}

export const AdPreviewCard: React.FC<AdPreviewCardProps> = ({
  url,
  label,
  platform,
  notes,
  onRemove,
  compact = false,
}) => {
  if (!url) return null;
  const preview = parseAdUrl(url);

  return (
    <div className="bg-white border border-neutral-200/90 rounded-2xl overflow-hidden shadow-2xs hover:shadow-xs transition-shadow">
      {/* Header Slot */}
      <div className="px-3.5 py-2.5 bg-neutral-50/80 border-b border-neutral-150 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${preview.badgeBg}`}>
            {preview.displayDomain}
          </span>
          {label && (
            <span className="text-xs font-bold text-neutral-800 truncate">
              {label}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            className="p-1 rounded-lg text-neutral-500 hover:text-emerald-700 hover:bg-emerald-50 transition-colors flex items-center gap-1 text-[11px] font-semibold cursor-pointer"
            title="Deschide în tab nou"
          >
            <span className="hidden sm:inline">Deschide</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          {onRemove && (
            <button
              type="button"
              onClick={onRemove}
              className="p-1 text-neutral-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
              title="Șterge acest link"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Preview Content */}
      <div className="p-3">
        {preview.platform === 'youtube' && preview.embedUrl ? (
          <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black shadow-inner">
            <iframe
              src={preview.embedUrl}
              title={label || 'YouTube Ad Preview'}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        ) : preview.platform === 'video' && preview.embedUrl ? (
          <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black">
            <video
              src={preview.embedUrl}
              controls
              className="w-full h-full object-contain"
            />
          </div>
        ) : preview.platform === 'tiktok' ? (
          <div className="space-y-2">
            {preview.embedUrl ? (
              <div className="relative w-full aspect-9/16 max-h-[380px] mx-auto rounded-xl overflow-hidden bg-neutral-900 border border-neutral-800">
                <iframe
                  src={preview.embedUrl}
                  title={label || 'TikTok Ad Video'}
                  className="w-full h-full border-0"
                  allowFullScreen
                />
              </div>
            ) : null}
            <div className="p-3 bg-neutral-950 text-white rounded-xl flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-pink-500/20 text-pink-400 flex items-center justify-center font-bold text-xs">
                  TT
                </div>
                <div>
                  <span className="text-xs font-semibold block text-neutral-200">Reclamă TikTok Ads</span>
                  <span className="text-[10px] text-neutral-400 truncate max-w-[200px] block font-mono">
                    {url}
                  </span>
                </div>
              </div>
              <a
                href={url}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 rounded-lg bg-pink-600 hover:bg-pink-700 text-white text-[11px] font-bold flex items-center gap-1.5 shrink-0 transition-colors"
              >
                <Play className="w-3 h-3 fill-current" />
                <span>Vezi pe TikTok</span>
              </a>
            </div>
          </div>
        ) : preview.platform === 'facebook' ? (
          <div className="p-3.5 bg-blue-50/70 border border-blue-150 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-2xs font-bold text-xs">
                FB
              </div>
              <div>
                <span className="text-xs font-bold text-neutral-900 block">
                  Reclamă Facebook / Meta Ads Library
                </span>
                <span className="text-[11px] text-neutral-500 font-mono truncate max-w-[240px] block mt-0.5">
                  {url}
                </span>
              </div>
            </div>
            <a
              href={url}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold flex items-center gap-1.5 shrink-0 self-start sm:self-auto transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Deschide în Ad Library</span>
            </a>
          </div>
        ) : preview.platform === 'instagram' ? (
          <div className="p-3.5 bg-pink-50/70 border border-pink-150 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white flex items-center justify-center shrink-0 shadow-2xs font-bold text-xs">
                IG
              </div>
              <div>
                <span className="text-xs font-bold text-neutral-900 block">
                  Postare / Story / Reel Instagram
                </span>
                <span className="text-[11px] text-neutral-500 font-mono truncate max-w-[240px] block mt-0.5">
                  {url}
                </span>
              </div>
            </div>
            <a
              href={url}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-rose-600 to-purple-600 text-white text-[11px] font-bold flex items-center gap-1.5 shrink-0 self-start sm:self-auto transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Deschide Instagram</span>
            </a>
          </div>
        ) : (
          <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-xl flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-neutral-200 text-neutral-700 flex items-center justify-center shrink-0">
                <Globe className="w-4 h-4" />
              </div>
              <span className="text-xs font-mono text-neutral-700 truncate">
                {url}
              </span>
            </div>
            <a
              href={url}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-900 text-white text-[11px] font-bold flex items-center gap-1 shrink-0"
            >
              <span>Accesează</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        )}

        {notes && (
          <div className="mt-2.5 text-[11px] text-neutral-600 bg-neutral-50 p-2 rounded-lg border border-neutral-150">
            <strong className="text-neutral-700 font-semibold">Notă:</strong> {notes}
          </div>
        )}
      </div>
    </div>
  );
};
