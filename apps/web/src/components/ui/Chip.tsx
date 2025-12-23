import React from "react";
import { cn } from "@/lib/utils";

interface ChipProps {
  label: string;
  className?: string;
}

export function Chip({ label, className }: ChipProps) {
  return (
    <div
      className={cn(
        "flex-shrink-0 rounded-chip border border-[#444444] bg-[#f5f5f5] px-4 py-1.5 font-bold text-chip",
        className
      )}
    >
      {label}
    </div>
  );
}

