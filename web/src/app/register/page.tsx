"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/store/authStore";

export default function RegisterPage() {
  const router = useRouter();
  const { startOAuthLogin, error, isAuthenticated } = useAuthStore();

  useEffect(() => {
    // 이미 로그인되어 있으면 대시보드로 이동
    if (isAuthenticated) {
      router.push("/dashboard");
      return;
    }

    // 회원가입도 OAuth를 통해 진행 (PPOP Auth로 리다이렉트)
    const redirectToAuth = async () => {
      try {
        await startOAuthLogin();
      } catch (err) {
        console.error("Failed to redirect to PPOP Auth:", err);
      }
    };

    redirectToAuth();
  }, [isAuthenticated, router, startOAuthLogin]);

  // 에러가 있으면 에러 화면 표시
  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white px-4 py-12">
        <div className="w-full max-w-md text-center">
          <Link href="/" className="text-3xl font-extrabold text-primary">
            PPOPLINK
          </Link>
          
          <div className="mt-8 rounded-lg bg-red-50 p-6">
            <h1 className="mb-2 text-xl font-bold text-red-600">
              Registration Error
            </h1>
            <p className="mb-4 text-sm text-red-600">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="rounded-lg bg-primary px-6 py-2 text-white hover:bg-primary/90"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 로딩 화면 (PPOP Auth로 리다이렉트 중)
  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-4 py-12">
      <div className="w-full max-w-md text-center">
        <Link href="/" className="text-3xl font-extrabold text-primary">
          PPOPLINK
        </Link>
        
        <div className="mt-8 flex flex-col items-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-primary"></div>
          <p className="text-gray-600">Redirecting to registration...</p>
        </div>
      </div>
    </div>
  );
}

