"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/Button";

export default function LoginPage() {
  const router = useRouter();
  const { startOAuthLogin, isLoading, error, clearError, isAuthenticated } = useAuthStore();

  // 이미 로그인되어 있으면 대시보드로 이동
  useEffect(() => {
    if (isAuthenticated) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, router]);

  const handleLogin = async () => {
    clearError();
    try {
      await startOAuthLogin();
      // PPOP Auth 페이지로 리다이렉트됨
    } catch (err) {
      console.error("Login start failed:", err);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/" className="text-3xl font-extrabold text-primary">
            PPOPLINK
          </Link>
          <h1 className="mt-6 text-2xl font-bold text-gray-900">
            Welcome Back
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to manage your links
          </p>
        </div>

        <div className="space-y-6">
          {error && (
            <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600">
              {error}
            </div>
          )}

          <Button
            type="button"
            variant="primary"
            onClick={handleLogin}
            disabled={isLoading}
            className="w-full py-3 text-lg"
          >
            {isLoading ? "Redirecting..." : "Sign in with PPOP"}
          </Button>

          <p className="text-center text-sm text-gray-500">
            PPOP Auth를 통해 안전하게 로그인합니다
          </p>
        </div>
      </div>
    </div>
  );
}
