'use client';

import React, { useState } from 'react';
import Image from 'next/image';

interface ProduceImageProps {
  src: string;
  alt: string;
  className?: string;
  category?: 'daily' | 'fruits';
  priority?: boolean;
}

export const ProduceImage: React.FC<ProduceImageProps> = ({
  src,
  alt,
  className = '',
  category = 'daily',
  priority = false,
}) => {
  const [hasError, setHasError] = useState(false);

  if (hasError || !src) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-gradient-to-br from-[#E8F5E9] to-[#D8F3DC] border border-[#B7E4C7] text-[#1B4332] rounded-xl overflow-hidden p-3 select-none ${className}`}
        aria-label={alt}
      >
        <svg
          className="w-10 h-10 mb-1 text-[#2D6A4F] opacity-90"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          viewBox="0 0 24 24"
        >
          {category === 'fruits' ? (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 14h-2v-2h2v2zm0-4h-2V7h2v5z"
            />
          ) : (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
            />
          )}
        </svg>
        <span className="text-[11px] font-semibold text-[#1B4332] text-center leading-tight line-clamp-1">
          {alt}
        </span>
        <span className="text-[9px] text-[#2D6A4F] opacity-75 font-medium mt-0.5">
          AgriConnect Fresh
        </span>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden bg-[#F3F6F3] ${className}`}>
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        priority={priority}
        className="object-cover transition-transform duration-300 hover:scale-105"
        onError={() => setHasError(true)}
      />
    </div>
  );
};
