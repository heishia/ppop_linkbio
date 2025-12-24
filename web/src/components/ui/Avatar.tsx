"use client";

import React, { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface AvatarProps {
  src: string;
  alt: string;
  size?: number;
  className?: string;
}

export function Avatar({ src, alt, size = 120, className }: AvatarProps) {
  const [imageError, setImageError] = useState(false);

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-full bg-gradient-to-br from-primary/20 to-primary/40 flex-shrink-0",
        className
      )}
      style={{ width: size, height: size }}
    >
      {!imageError ? (
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover"
          sizes={`${size}px`}
          priority
          onError={() => setImageError(true)}
        />
      ) : (
        <div 
          className="flex h-full w-full items-center justify-center font-extrabold text-primary"
          style={{ fontSize: size * 0.4 }}
        >
          {alt.charAt(0).toUpperCase()}
        </div>
      )}
    </div>
  );
}

