import React from "react";
import { Chip } from "@/components/ui/Chip";
import { Chip as ChipType } from "@/types/profile";
import { cn } from "@/lib/utils";

interface ChipCarouselProps {
  chips: ChipType[];
  className?: string;
}

export function ChipCarousel({ chips, className }: ChipCarouselProps) {
  return (
    <section className={cn("py-4", className)}>
      <div className="scrollbar-hide flex gap-2 overflow-x-auto scroll-smooth">
        {chips.map((chip) => (
          <Chip key={chip.id} label={chip.label} />
        ))}
      </div>
    </section>
  );
}

