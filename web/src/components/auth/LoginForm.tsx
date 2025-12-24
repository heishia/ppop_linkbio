"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/store/authStore";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export function LoginForm() {
  const router = useRouter();
  const { login, isLoading, error, clearError } = useAuthStore();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [formErrors, setFormErrors] = useState<{
    email?: string;
    password?: string;
  }>({});

  const validateForm = () => {
    const errors: { email?: string; password?: string } = {};

    if (!formData.email) {
      errors.email = "이메일을 입력해주세요";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "올바른 이메일 형식이 아닙니다";
    }

    if (!formData.password) {
      errors.password = "비밀번호를 입력해주세요";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    if (!validateForm()) {
      return;
    }

    try {
      await login(formData);
      router.push("/dashboard");
    } catch (error) {
      // Error is handled in the store
      console.error("Login failed:", error);
    }
  };

  const handleDevLogin = async () => {
    clearError();
    setFormData({
      email: "test@example.com",
      password: "Test1234!",
    });
    try {
      await login({ email: "test@example.com", password: "Test1234!" });
      router.push("/dashboard");
    } catch (error) {
      console.error("Dev login failed:", error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear field error when user starts typing
    if (formErrors[name as keyof typeof formErrors]) {
      setFormErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      <Input
        label="이메일"
        type="email"
        name="email"
        value={formData.email}
        onChange={handleChange}
        error={formErrors.email}
        placeholder="you@example.com"
        disabled={isLoading}
        autoComplete="email"
      />

      <Input
        label="비밀번호"
        type="password"
        name="password"
        value={formData.password}
        onChange={handleChange}
        error={formErrors.password}
        placeholder="비밀번호를 입력하세요"
        disabled={isLoading}
        autoComplete="current-password"
      />

      <Button
        type="submit"
        variant="primary"
        disabled={isLoading}
        className="w-full"
      >
        {isLoading ? "로그인 중..." : "로그인"}
      </Button>

      <Button
        type="button"
        variant="secondary"
        onClick={handleDevLogin}
        disabled={isLoading}
        className="w-full"
      >
        개발자 로그인 (test@example.com)
      </Button>

      <p className="text-center text-sm text-gray-600">
        계정이 없으신가요?{" "}
        <Link
          href="/register"
          className="font-semibold text-primary hover:underline"
        >
          회원가입
        </Link>
      </p>
    </form>
  );
}
