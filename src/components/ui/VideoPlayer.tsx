'use client';

import { useState } from 'react';

interface VideoPlayerProps {
  url: string;
  title: string;
}

// Parse video URL to get embed URL
function getEmbedUrl(url: string): { embedUrl: string; platform: string } | null {
  // YouTube
  const youtubeMatch = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  if (youtubeMatch) {
    return {
      embedUrl: `https://www.youtube.com/embed/${youtubeMatch[1]}`,
      platform: 'youtube',
    };
  }

  // Bilibili
  const bilibiliMatch = url.match(/bilibili\.com\/video\/(BV[a-zA-Z0-9]+)/);
  if (bilibiliMatch) {
    return {
      embedUrl: `https://player.bilibili.com/player.html?bvid=${bilibiliMatch[1]}&high_quality=1`,
      platform: 'bilibili',
    };
  }

  // Bilibili with aid
  const bilibiliAidMatch = url.match(/bilibili\.com\/video\/av(\d+)/);
  if (bilibiliAidMatch) {
    return {
      embedUrl: `https://player.bilibili.com/player.html?aid=${bilibiliAidMatch[1]}&high_quality=1`,
      platform: 'bilibili',
    };
  }

  // Vimeo
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) {
    return {
      embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}`,
      platform: 'vimeo',
    };
  }

  return null;
}

export function VideoPlayer({ url, title }: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const embedInfo = getEmbedUrl(url);

  if (!embedInfo) {
    // Not a supported video URL, show link instead
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-3 p-3 rounded-lg bg-card hover:bg-secondary transition-colors group"
      >
        <div className="p-2 rounded-lg bg-red-500/10 text-red-500">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm truncate group-hover:text-primary transition-colors">
            {title}
          </p>
          <p className="text-xs text-muted-foreground">Video</p>
        </div>
        <svg
          className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
      </a>
    );
  }

  if (!isPlaying) {
    // Show thumbnail/preview with play button
    return (
      <div className="relative rounded-xl overflow-hidden bg-black/5 dark:bg-white/5">
        <div className="aspect-video flex items-center justify-center">
          <button
            onClick={() => setIsPlaying(true)}
            className="flex flex-col items-center gap-3 p-6 group"
          >
            <div className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
            <div className="text-center">
              <p className="font-medium text-sm">{title}</p>
              <p className="text-xs text-muted-foreground capitalize mt-1">
                {embedInfo.platform === 'youtube' && 'YouTube'}
                {embedInfo.platform === 'bilibili' && 'Bilibili'}
                {embedInfo.platform === 'vimeo' && 'Vimeo'}
              </p>
            </div>
          </button>
        </div>
      </div>
    );
  }

  // Show embedded video
  return (
    <div className="relative rounded-xl overflow-hidden bg-black">
      <div className="aspect-video">
        <iframe
          src={embedInfo.embedUrl}
          title={title}
          className="w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
      <button
        onClick={() => setIsPlaying(false)}
        className="absolute top-2 right-2 p-2 rounded-lg bg-black/50 text-white hover:bg-black/70 transition-colors"
        title="关闭视频"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

// Compact video link that can expand to player
export function VideoLink({ url, title }: VideoPlayerProps) {
  const [showPlayer, setShowPlayer] = useState(false);
  const embedInfo = getEmbedUrl(url);

  if (!embedInfo) {
    // Not embeddable, just show link
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-3 p-3 rounded-lg bg-card hover:bg-secondary transition-colors group"
      >
        <div className="p-2 rounded-lg bg-red-500/10 text-red-500">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm truncate group-hover:text-primary transition-colors">
            {title}
          </p>
          <p className="text-xs text-muted-foreground">Video</p>
        </div>
        <svg
          className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
      </a>
    );
  }

  return (
    <div className="space-y-3">
      {/* Video Link/Button */}
      <button
        onClick={() => setShowPlayer(!showPlayer)}
        className="w-full flex items-center gap-3 p-3 rounded-lg bg-card hover:bg-secondary transition-colors group text-left"
      >
        <div className="p-2 rounded-lg bg-red-500/10 text-red-500">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm truncate group-hover:text-primary transition-colors">
            {title}
          </p>
          <p className="text-xs text-muted-foreground capitalize">
            {embedInfo.platform === 'youtube' && 'YouTube'}
            {embedInfo.platform === 'bilibili' && 'Bilibili'}
            {embedInfo.platform === 'vimeo' && 'Vimeo'}
            {' - '}
            {showPlayer ? '点击收起' : '点击播放'}
          </p>
        </div>
        <svg
          className={`w-5 h-5 text-muted-foreground transition-transform shrink-0 ${showPlayer ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Embedded Player */}
      {showPlayer && (
        <div className="rounded-xl overflow-hidden bg-black">
          <div className="aspect-video">
            <iframe
              src={embedInfo.embedUrl}
              title={title}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      )}
    </div>
  );
}
