"use client";

import React, { useEffect, useState } from "react";
import { useProfileStore } from "@/store/profileStore";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";

export default function AppearancePage() {
  const { profile, isLoading, error, fetchProfile, updateProfile, clearError } =
    useProfileStore();

  const [formData, setFormData] = useState({
    display_name: "",
    bio: "",
    background_color: "#ffffff",
  });

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  useEffect(() => {
    if (profile) {
      setFormData({
        display_name: profile.display_name || "",
        bio: profile.bio || "",
        background_color: profile.background_color || "#ffffff",
      });
    }
  }, [profile]);

  const handleSave = async () => {
    try {
      await updateProfile(formData);
      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Failed to update profile:", error);
    }
  };

  if (isLoading && !profile) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Appearance</h1>
        <p className="mt-1 text-sm text-gray-600">
          Customize how your profile looks
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Editor */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col items-center gap-4">
                <Avatar
                  src={profile?.profile_image_url || "/avatar-placeholder.jpg"}
                  alt={profile?.username || "User"}
                />
                <Button variant="secondary" className="text-sm">
                  Upload Photo
                </Button>
              </div>

              <Input
                label="Display Name"
                value={formData.display_name}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    display_name: e.target.value,
                  }))
                }
                placeholder="Your Name"
              />

              <Textarea
                label="Bio"
                value={formData.bio}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, bio: e.target.value }))
                }
                placeholder="Tell people about yourself"
                rows={4}
              />

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Background Color
                </label>
                <div className="flex gap-3">
                  <input
                    type="color"
                    value={formData.background_color}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        background_color: e.target.value,
                      }))
                    }
                    className="h-12 w-12 cursor-pointer rounded-lg border border-gray-300"
                  />
                  <Input
                    value={formData.background_color}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        background_color: e.target.value,
                      }))
                    }
                    placeholder="#ffffff"
                    className="flex-1"
                  />
                </div>
              </div>

              <Button
                variant="primary"
                onClick={handleSave}
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Theme</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Theme customization coming soon...
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Preview */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className="rounded-lg border border-gray-200 p-6"
                style={{ backgroundColor: formData.background_color }}
              >
                <div className="flex flex-col items-center">
                  <Avatar
                    src={
                      profile?.profile_image_url || "/avatar-placeholder.jpg"
                    }
                    alt={profile?.username || "User"}
                  />
                  <h2 className="mt-4 text-center font-extrabold text-username">
                    {formData.display_name || profile?.username || "Username"}
                  </h2>
                  {formData.bio && (
                    <p className="mt-2 text-center font-normal text-bio">
                      {formData.bio}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

