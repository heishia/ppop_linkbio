import React from "react";
import { cn } from "@/lib/utils";

interface MobileContainerProps {
  children: React.ReactNode;
  className?: string;
}

export function MobileContainer({ children, className }: MobileContainerProps) {
  return (
    <div
      className={cn(
        "mx-auto w-full max-w-[393px] px-4 sm:px-6 md:px-8",
        className
      )}
    >
      {children}
    </div>
  );
}

