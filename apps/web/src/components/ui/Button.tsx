import React from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "tertiary";
  children: React.ReactNode;
}

export function Button({
  variant = "primary",
  children,
  className,
  ...props
}: ButtonProps) {
  const variantStyles = {
    primary: "bg-primary text-white hover:opacity-90",
    secondary: "bg-black/[0.04] text-black hover:bg-black/[0.06]",
    tertiary:
      "bg-transparent text-black border-2 border-black/[0.12] hover:border-black/[0.2]",
  };

  return (
    <button
      className={cn(
        "h-[50px] w-full rounded-button font-extrabold text-button transition-all duration-200",
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

