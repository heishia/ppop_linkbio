"use client";

import React, { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface AvatarProps {
  src: string;
  alt: string;
  className?: string;
}

export function Avatar({ src, alt, className }: AvatarProps) {
  const [imageError, setImageError] = useState(false);

  // Extract size from className or use default
  const sizeMatch = className?.match(/[hw]-\[?(\d+)(?:px)?\]?/);
  const size = sizeMatch ? sizeMatch[1] : "120";

  return (
    <div
      className={cn(
        "relative h-[120px] w-[120px] overflow-hidden rounded-full bg-gradient-to-br from-primary/20 to-primary/40",
        className
      )}
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
        <div className="flex h-full w-full items-center justify-center text-2xl font-extrabold text-primary">
          {alt.charAt(0).toUpperCase()}
        </div>
      )}
    </div>
  );
}

