import React from 'react';

// Default trusted fallback image featuring Rachid's heirloom seeds
export const DEFAULT_FALLBACK_IMAGE = '/images/rachid_graines_paysannes_1791482677509.jpg';

/**
 * Resolves an image path to a clean, absolute URL guaranteed to work on Netlify,
 * Vite development, and production builds.
 *
 * Automatically converts legacy paths like '/src/assets/images/...' to '/images/...'.
 */
export function resolveImageUrl(url?: string | null): string {
  if (!url || typeof url !== 'string' || !url.trim()) {
    return DEFAULT_FALLBACK_IMAGE;
  }

  const trimmed = url.trim();

  // If already full http(s) link or data URI
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('data:')) {
    return trimmed;
  }

  // Convert /src/assets/images/ to /images/
  if (trimmed.startsWith('/src/assets/images/')) {
    return '/images/' + trimmed.substring('/src/assets/images/'.length);
  }

  // Convert /src/assets/ to /images/
  if (trimmed.startsWith('/src/assets/')) {
    return '/images/' + trimmed.substring('/src/assets/'.length);
  }

  // Convert /public/images/ or public/images/ to /images/
  if (trimmed.startsWith('/public/images/')) {
    return '/images/' + trimmed.substring('/public/images/'.length);
  }
  if (trimmed.startsWith('public/images/')) {
    return '/images/' + trimmed.substring('public/images/'.length);
  }

  // Convert relative images/... to /images/...
  if (trimmed.startsWith('images/')) {
    return '/' + trimmed;
  }

  return trimmed;
}

/**
 * Image error handler that gracefully recovers without showing broken image icons.
 * If Netlify fails to find a path, it tries an alternate path before falling back to default image.
 */
export function handleImageError(
  e: React.SyntheticEvent<HTMLImageElement, Event>,
  fallback = DEFAULT_FALLBACK_IMAGE
) {
  const target = e.currentTarget;
  const currentSrc = target.getAttribute('src') || '';

  // If we haven't tried rewriting /src/assets/images/ to /images/
  if (!target.dataset.triedRewrite && currentSrc.includes('/src/assets/images/')) {
    target.dataset.triedRewrite = 'true';
    target.src = currentSrc.replace('/src/assets/images/', '/images/');
    return;
  }

  // If we haven't tried the fallback yet
  if (!target.dataset.triedFallback) {
    target.dataset.triedFallback = 'true';
    target.src = fallback;
    return;
  }
}
