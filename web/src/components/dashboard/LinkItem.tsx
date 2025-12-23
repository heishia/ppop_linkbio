"use client";

import React, { useState } from "react";
import { Link } from "@/lib/api/links";
import { useLinksStore } from "@/store/linksStore";
import { Input } from "@/components/ui/Input";
import { Switch } from "@/components/ui/Switch";
import { Button } from "@/components/ui/Button";

interface LinkItemProps {
  link: Link;
}

export function LinkItem({ link }: LinkItemProps) {
  const { updateLink, deleteLink } = useLinksStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    title: link.title,
    url: link.url,
  });

  const handleSave = async () => {
    try {
      await updateLink(link.id, editData);
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update link:", error);
    }
  };

  const handleCancel = () => {
    setEditData({ title: link.title, url: link.url });
    setIsEditing(false);
  };

  const handleToggle = async (checked: boolean) => {
    try {
      await updateLink(link.id, { is_active: checked });
    } catch (error) {
      console.error("Failed to toggle link:", error);
    }
  };

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this link?")) {
      try {
        await deleteLink(link.id);
      } catch (error) {
        console.error("Failed to delete link:", error);
      }
    }
  };

  if (isEditing) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <div className="space-y-3">
          <Input
            label="Title"
            value={editData.title}
            onChange={(e) =>
              setEditData((prev) => ({ ...prev, title: e.target.value }))
            }
            placeholder="Link title"
          />
          <Input
            label="URL"
            value={editData.url}
            onChange={(e) =>
              setEditData((prev) => ({ ...prev, url: e.target.value }))
            }
            placeholder="https://example.com"
          />
          <div className="flex gap-2">
            <Button variant="primary" onClick={handleSave} className="flex-1">
              Save
            </Button>
            <Button
              variant="secondary"
              onClick={handleCancel}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4 rounded-lg border border-gray-200 bg-white p-4">
      <div className="cursor-grab text-gray-400">
        <svg
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 8h16M4 16h16"
          />
        </svg>
      </div>

      <div className="flex-1">
        <h3 className="font-semibold text-gray-900">{link.title}</h3>
        <p className="text-sm text-gray-500 truncate">{link.url}</p>
        <p className="text-xs text-gray-400 mt-1">
          {link.click_count} clicks
        </p>
      </div>

      <div className="flex items-center gap-3">
        <Switch
          checked={link.is_active}
          onChange={handleToggle}
        />
        <button
          onClick={() => setIsEditing(true)}
          className="text-gray-600 hover:text-primary transition-colors"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
            />
          </svg>
        </button>
        <button
          onClick={handleDelete}
          className="text-gray-600 hover:text-red-500 transition-colors"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}

