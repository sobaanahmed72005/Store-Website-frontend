import React, { useState } from 'react';

/**
 * SafeImage Component
 * Enforces best practices automatically for ALL images:
 * 1. Native Lazy Loading (loading="lazy") by default unless priority={true} (e.g. Hero images).
 * 2. Async Decoding (decoding="async") to prevent main-thread UI lag during decoding.
 * 3. Fallback / Error Handling (shows fallback placeholder if image URL breaks).
 * 4. Image dimensions reservation to reduce layout shift (CLS).
 */
export default function SafeImage({
  src,
  alt = '',
  loading,
  decoding = 'async',
  priority = false,
  fallback = '/og-image.jpg',
  className = '',
  width,
  height,
  ...props
}) {
  const [error, setError] = useState(false);

  const finalLoading = priority ? 'eager' : (loading || 'lazy');
  const finalSrc = error ? fallback : (src || fallback);

  return (
    <img
      src={finalSrc}
      alt={alt}
      loading={finalLoading}
      decoding={decoding}
      width={width}
      height={height}
      onError={() => {
        if (!error) setError(true);
      }}
      className={className}
      {...props}
    />
  );
}
