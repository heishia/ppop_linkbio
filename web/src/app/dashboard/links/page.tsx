"use client";

import React, { useEffect, useState } from "react";
import { useLinksStore } from "@/store/linksStore";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { LinkItem } from "@/components/dashboard/LinkItem";

export default function LinksPage() {
  const { links, isLoading, error, fetchLinks, createLink, clearError } =
    useLinksStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newLink, setNewLink] = useState({ title: "", url: "" });
  const [formErrors, setFormErrors] = useState<{
    title?: string;
    url?: string;
  }>({});

  useEffect(() => {
    fetchLinks();
  }, [fetchLinks]);

  const validateForm = () => {
    const errors: { title?: string; url?: string } = {};

    if (!newLink.title.trim()) {
      errors.title = "제목을 입력해주세요";
    }

    if (!newLink.url.trim()) {
      errors.url = "URL을 입력해주세요";
    } else if (
      !/^https?:\/\/.+/.test(newLink.url)
    ) {
      errors.url = "URL은 http:// 또는 https://로 시작해야 합니다";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateLink = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      await createLink(newLink);
      setIsModalOpen(false);
      setNewLink({ title: "", url: "" });
      setFormErrors({});
    } catch (error) {
      console.error("Failed to create link:", error);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setNewLink({ title: "", url: "" });
    setFormErrors({});
    clearError();
  };

  if (isLoading && links.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">링크</h1>
          <p className="mt-1 text-sm text-gray-600">
            링크를 관리하세요
          </p>
        </div>
        <Button variant="primary" onClick={() => setIsModalOpen(true)}>
          링크 추가
        </Button>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      <Card>
        <CardContent>
          {links.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-gray-600">아직 링크가 없습니다</p>
              <p className="mt-2 text-sm text-gray-500">
                "링크 추가" 버튼을 클릭하여 첫 번째 링크를 만들어보세요
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {links.map((link) => (
                <LinkItem key={link.id} link={link} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title="새 링크 추가"
      >
        <div className="space-y-4">
          <Input
            label="제목"
            value={newLink.title}
            onChange={(e) =>
              setNewLink((prev) => ({ ...prev, title: e.target.value }))
            }
            error={formErrors.title}
            placeholder="My awesome link"
          />
          <Input
            label="URL"
            value={newLink.url}
            onChange={(e) =>
              setNewLink((prev) => ({ ...prev, url: e.target.value }))
            }
            error={formErrors.url}
            placeholder="https://example.com"
          />
          <div className="flex gap-3">
            <Button
              variant="primary"
              onClick={handleCreateLink}
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? "생성 중..." : "링크 만들기"}
            </Button>
            <Button
              variant="secondary"
              onClick={handleCloseModal}
              className="flex-1"
            >
              취소
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
