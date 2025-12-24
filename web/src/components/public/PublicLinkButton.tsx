"use client";

import React from "react";
import { Link } from "@/lib/api/links";
import { publicApi } from "@/lib/api/public";
import { ButtonStyle } from "@/lib/api/auth";

interface PublicLinkButtonProps {
  link: Link;
  publicLinkId: string;
  buttonStyle?: ButtonStyle;
}

// 버튼 스타일별 클래스 정의
const BUTTON_STYLE_CLASSES: Record<ButtonStyle, string> = {
  // 기본: primary 색상 배경
  default:
    "bg-primary text-white hover:bg-primary/90 border-transparent",
  // 아웃라인: 흰색 배경 + 검은 얇은 외곽선
  outline:
    "bg-white text-gray-900 border border-gray-900 hover:bg-gray-50",
  // 채움: 검은 배경 + 흰 텍스트
  filled:
    "bg-gray-900 text-white border-transparent hover:bg-gray-800",
};

export function PublicLinkButton({ link, publicLinkId, buttonStyle = "default" }: PublicLinkButtonProps) {
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
    <button
      onClick={handleClick}
      className={`w-full rounded-xl px-4 py-3 font-semibold transition-all shadow-sm hover:shadow ${BUTTON_STYLE_CLASSES[buttonStyle]}`}
    >
      {link.title}
    </button>
  );
}

