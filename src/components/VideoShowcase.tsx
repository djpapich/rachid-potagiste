import React, { useEffect, useState } from 'react';
import { ExternalLink, Play } from 'lucide-react';
import { Language } from '../types/index.ts';
import { translations } from '../lib/translations.ts';

interface Video {
  id: string;
  title: string;
  thumbUrl: string;
  youtubeUrl: string;
}

const VIDEO_ID = /^[A-Za-z0-9_-]{11}$/;

/** Keeps only well-formed entries: local thumbnail and a real youtube.com watch link. */
function sanitizeVideos(raw: unknown): Video[] {
  if (!Array.isArray(raw)) return [];
  const out: Video[] = [];
  for (const item of raw) {
    if (!item || typeof item !== 'object') continue;
    const v = item as Record<string, unknown>;
    if (typeof v.id !== 'string' || !VIDEO_ID.test(v.id)) continue;
    if (typeof v.title !== 'string' || typeof v.thumbUrl !== 'string') continue;
    if (!/^\/images\/[A-Za-z0-9_.-]+\.jpg$/.test(v.thumbUrl)) continue;
    out.push({
      id: v.id,
      title: v.title.slice(0, 140),
      thumbUrl: v.thumbUrl,
      youtubeUrl: `https://www.youtube.com/watch?v=${v.id}`,
    });
  }
  return out;
}

/** Real thumbnails of the videos published on Rachid's own YouTube channel. */
export const VideoShowcase: React.FC<{ lang: Language }> = ({ lang }) => {
  const t = translations[lang] || translations.fr;
  const [videos, setVideos] = useState<Video[]>([]);

  useEffect(() => {
    let cancelled = false;
    fetch('/rachid_verified_videos.json')
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (!cancelled) setVideos(sanitizeVideos(data).slice(0, 8));
      })
      .catch(() => {
        // the section simply stays hidden
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (videos.length === 0) return null;

  return (
    <section aria-labelledby="videos-title" className="mb-12">
      <h2 id="videos-title" className="font-title text-xl sm:text-2xl font-black text-[#1F3D2B] dark:text-[#F4F1EA]">
        {t.videosTitle}
      </h2>
      <p className="text-xs sm:text-sm text-[#1F3D2B]/70 dark:text-[#F4F1EA]/70 mb-5">{t.videosSubtitle}</p>

      <ul className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {videos.map((video) => (
          <li key={video.id}>
            <a
              href={video.youtubeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group block rounded-2xl overflow-hidden border border-[#E5DFC9] dark:border-[#273D2C] bg-[#FBFAF5] dark:bg-[#152219] card-lift"
            >
              <span className="relative block aspect-video bg-black">
                <img src={video.thumbUrl} alt="" loading="lazy" decoding="async" className="w-full h-full object-cover" />
                <span className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/35 transition-colors">
                  <span className="w-10 h-10 rounded-full bg-[#FBFAF5]/95 text-[#1F3D2B] flex items-center justify-center shadow-md">
                    <Play className="w-4 h-4 fill-current" aria-hidden="true" />
                  </span>
                </span>
              </span>
              <span dir="auto" className="block p-2.5 text-[11px] sm:text-xs font-semibold text-[#1F3D2B] dark:text-[#F4F1EA] line-clamp-2 min-h-[2.75rem]">
                {video.title}
              </span>
              <span className="flex items-center gap-1 px-2.5 pb-2.5 text-[10px] font-semibold text-[#8C6D23] dark:text-[#E5B834]">
                <ExternalLink className="w-3 h-3" aria-hidden="true" />
                {t.watchOnYoutube}
              </span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
};
