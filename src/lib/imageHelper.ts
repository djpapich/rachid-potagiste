import React from 'react';

// Default trusted fallback image featuring Rachid's lacto-fermented creation
export const DEFAULT_FALLBACK_IMAGE = '/assets/products/photos-site-1600x1600/chou-vert-carotte-lacto-fermente.jpg';

/**
 * Resolves an image path to a clean, absolute URL guaranteed to work on Netlify,
 * Vite development, and production builds.
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

  if (trimmed.startsWith('/assets/products/')) {
    return trimmed;
  }

  if (trimmed.startsWith('assets/products/')) {
    return '/' + trimmed;
  }

  return trimmed;
}

/**
 * Image error handler that gracefully recovers without showing broken image icons.
 */
export function handleImageError(
  e: React.SyntheticEvent<HTMLImageElement, Event>,
  fallback = DEFAULT_FALLBACK_IMAGE
) {
  const target = e.currentTarget;
  if (!target.dataset.triedFallback) {
    target.dataset.triedFallback = 'true';
    target.src = fallback;
  }
}
