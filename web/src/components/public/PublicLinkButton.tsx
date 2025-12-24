"use client";

import React from "react";
import { Link } from "@/lib/api/links";
import { publicApi } from "@/lib/api/public";
import { Button } from "@/components/ui/Button";

interface PublicLinkButtonProps {
  link: Link;
  publicLinkId: string;
}

export function PublicLinkButton({ link, publicLinkId }: PublicLinkButtonProps) {
  const handleClick = async () => {
    try {
      // Record click using public_link_id
      await publicApi.recordClick(publicLinkId, link.id);
      // Redirect to URL
      window.open(link.url, "_blank", "noopener,noreferrer");
    } catch (error) {
      console.error("Failed to record click:", error);
      // Still redirect even if tracking fails
      window.open(link.url, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <Button
      variant="primary"
      onClick={handleClick}
      className="w-full"
    >
      {link.title}
    </Button>
  );
}

