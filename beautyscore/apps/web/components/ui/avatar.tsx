'use client';

import { useState } from 'react';
import Image from 'next/image';

interface AvatarProps {
  src?: string | null;
  alt?: string;
  fallback?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeClasses = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-16 h-16 text-lg',
};

export function Avatar({ src, alt = 'Avatar', fallback = 'U', size = 'md', className = '' }: AvatarProps) {
  const [imageError, setImageError] = useState(false);

  const sizeClass = sizeClasses[size];
  const fallbackLetter = fallback?.[0]?.toUpperCase() || 'U';

  if (!src || imageError) {
    return (
      <div
        className={`${sizeClass} rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-semibold ${className}`}
        role="img"
        aria-label={alt}
      >
        {fallbackLetter}
      </div>
    );
  }

  return (
    <div className={`${sizeClass} rounded-full overflow-hidden relative ${className}`}>
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover"
        onError={() => setImageError(true)}
      />
    </div>
  );
}
