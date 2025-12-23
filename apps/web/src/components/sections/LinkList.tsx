import React from "react";
import { Button } from "@/components/ui/Button";
import { Link } from "@/types/profile";
import { cn } from "@/lib/utils";

interface LinkListProps {
  links: Link[];
  className?: string;
}

export function LinkList({ links, className }: LinkListProps) {
  return (
    <section className={cn("flex flex-col gap-4 py-6", className)}>
      {links.map((link) => (
        <a
          key={link.id}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button variant={link.variant}>{link.title}</Button>
        </a>
      ))}
    </section>
  );
}

