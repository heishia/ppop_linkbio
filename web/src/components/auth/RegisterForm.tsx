"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/store/authStore";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export function RegisterForm() {
  const router = useRouter();
  const { register, isLoading, error, clearError } = useAuthStore();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    display_name: "",
  });

  const [formErrors, setFormErrors] = useState<{
    username?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  const validateForm = () => {
    const errors: {
      username?: string;
      email?: string;
      password?: string;
      confirmPassword?: string;
    } = {};

    if (!formData.username) {
      errors.username = "사용자명을 입력해주세요";
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      errors.username = "영문, 숫자, 언더스코어만 사용 가능합니다";
    } else if (formData.username.length < 3) {
      errors.username = "최소 3자 이상 입력해주세요";
    }

    if (!formData.email) {
      errors.email = "이메일을 입력해주세요";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "올바른 이메일 형식이 아닙니다";
    }

    if (!formData.password) {
      errors.password = "비밀번호를 입력해주세요";
    } else if (formData.password.length < 8) {
      errors.password = "최소 8자 이상 입력해주세요";
    }

    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "비밀번호가 일치하지 않습니다";
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
      await register({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        display_name: formData.display_name || undefined,
      });
      router.push("/dashboard");
    } catch (error) {
      // Error is handled in the store
      console.error("Registration failed:", error);
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
        label="사용자명"
        type="text"
        name="username"
        value={formData.username}
        onChange={handleChange}
        error={formErrors.username}
        placeholder="your_username"
        disabled={isLoading}
        autoComplete="username"
      />

      <Input
        label="표시 이름 (선택사항)"
        type="text"
        name="display_name"
        value={formData.display_name}
        onChange={handleChange}
        placeholder="Your Name"
        disabled={isLoading}
        autoComplete="name"
      />

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
        placeholder="최소 8자 이상"
        disabled={isLoading}
        autoComplete="new-password"
      />

      <Input
        label="비밀번호 확인"
        type="password"
        name="confirmPassword"
        value={formData.confirmPassword}
        onChange={handleChange}
        error={formErrors.confirmPassword}
        placeholder="비밀번호를 다시 입력하세요"
        disabled={isLoading}
        autoComplete="new-password"
      />

      <Button
        type="submit"
        variant="primary"
        disabled={isLoading}
        className="w-full"
      >
        {isLoading ? "계정 생성 중..." : "계정 만들기"}
      </Button>

      <p className="text-center text-sm text-gray-600">
        이미 계정이 있으신가요?{" "}
        <Link href="/login" className="font-semibold text-primary hover:underline">
          로그인
        </Link>
      </p>
    </form>
  );
}
