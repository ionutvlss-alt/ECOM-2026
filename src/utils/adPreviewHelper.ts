export interface AdPreviewInfo {
  platform: 'tiktok' | 'facebook' | 'instagram' | 'youtube' | 'pinterest' | 'video' | 'web';
  embedUrl?: string;
  isEmbeddable: boolean;
  directUrl: string;
  displayDomain: string;
  iconName: string;
  colorClass: string;
  badgeBg: string;
}

export function parseAdUrl(rawUrl: string): AdPreviewInfo {
  const url = (rawUrl || '').trim();
  let lower = url.toLowerCase();
  let domain = '';
  try {
    const parsed = new URL(url.startsWith('http') ? url : `https://${url}`);
    domain = parsed.hostname.replace('www.', '');
  } catch {
    domain = 'link-extern';
  }

  // 1. YouTube
  if (lower.includes('youtube.com') || lower.includes('youtu.be')) {
    let videoId = '';
    if (lower.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1]?.split('?')[0]?.split('&')[0] || '';
    } else if (lower.includes('/shorts/')) {
      videoId = url.split('/shorts/')[1]?.split('?')[0]?.split('&')[0] || '';
    } else if (lower.includes('watch?v=') || lower.includes('&v=')) {
      const match = url.match(/[?&]v=([^&#]+)/);
      videoId = match ? match[1] : '';
    }

    if (videoId) {
      return {
        platform: 'youtube',
        embedUrl: `https://www.youtube-nocookie.com/embed/${videoId}`,
        isEmbeddable: true,
        directUrl: url,
        displayDomain: 'youtube.com',
        iconName: 'youtube',
        colorClass: 'text-red-600',
        badgeBg: 'bg-red-50 text-red-700 border-red-200',
      };
    }
  }

  // 2. TikTok
  if (lower.includes('tiktok.com')) {
    // Verificăm dacă are /video/123456789
    const match = url.match(/\/video\/(\d+)/);
    const videoId = match ? match[1] : '';

    return {
      platform: 'tiktok',
      embedUrl: videoId ? `https://www.tiktok.com/embed/v2/${videoId}` : undefined,
      isEmbeddable: Boolean(videoId),
      directUrl: url,
      displayDomain: 'tiktok.com',
      iconName: 'tiktok',
      colorClass: 'text-neutral-900',
      badgeBg: 'bg-neutral-900 text-white border-neutral-700',
    };
  }

  // 3. Facebook / Meta Ads Library
  if (lower.includes('facebook.com') || lower.includes('fb.watch') || lower.includes('meta.com')) {
    const isAdLibrary = lower.includes('ads/library') || lower.includes('ad_library');
    return {
      platform: 'facebook',
      isEmbeddable: false, // Facebook blochează iframe-urile fără token OAuth de developer
      directUrl: url,
      displayDomain: isAdLibrary ? 'Facebook Ads Library' : 'facebook.com',
      iconName: 'facebook',
      colorClass: 'text-blue-600',
      badgeBg: 'bg-blue-50 text-blue-700 border-blue-200',
    };
  }

  // 4. Instagram
  if (lower.includes('instagram.com')) {
    return {
      platform: 'instagram',
      isEmbeddable: false,
      directUrl: url,
      displayDomain: 'instagram.com',
      iconName: 'instagram',
      colorClass: 'text-pink-600',
      badgeBg: 'bg-pink-50 text-pink-700 border-pink-200',
    };
  }

  // 5. Fișiere Video directe (.mp4, .webm)
  if (lower.endsWith('.mp4') || lower.endsWith('.webm') || lower.includes('.mp4?')) {
    return {
      platform: 'video',
      embedUrl: url,
      isEmbeddable: true,
      directUrl: url,
      displayDomain: 'Fișier Video MP4',
      iconName: 'video',
      colorClass: 'text-emerald-600',
      badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    };
  }

  // 6. Generic Web
  return {
    platform: 'web',
    isEmbeddable: false,
    directUrl: url,
    displayDomain: domain || 'Link Campanie',
    iconName: 'globe',
    colorClass: 'text-neutral-600',
    badgeBg: 'bg-neutral-100 text-neutral-700 border-neutral-200',
  };
}
