"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import Link from "next/link";

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { handleOAuthCallback, error } = useAuthStore();
  const [callbackError, setCallbackError] = useState<string | null>(null);

  useEffect(() => {
    const processCallback = async () => {
      const code = searchParams.get("code");
      const state = searchParams.get("state");
      const errorParam = searchParams.get("error");
      const errorDescription = searchParams.get("error_description");

      // 에러 파라미터가 있으면 에러 처리
      if (errorParam) {
        setCallbackError(errorDescription || errorParam);
        return;
      }

      // code와 state가 없으면 에러
      if (!code || !state) {
        setCallbackError("Invalid callback parameters. Please try logging in again.");
        return;
      }

      try {
        await handleOAuthCallback({ code, state });
        // 성공 시 대시보드로 이동
        router.push("/dashboard");
      } catch (err) {
        console.error("OAuth callback error:", err);
        // 에러는 store에서 처리됨
      }
    };

    processCallback();
  }, [searchParams, handleOAuthCallback, router]);

  // 에러 상태
  if (callbackError || error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white px-4 py-12">
        <div className="w-full max-w-md text-center">
          <div className="mb-8">
            <Link href="/" className="text-3xl font-extrabold text-primary">
              PPOPLINK
            </Link>
          </div>
          
          <div className="rounded-lg bg-red-50 p-6">
            <h1 className="mb-2 text-xl font-bold text-red-600">
              Login Failed
            </h1>
            <p className="mb-4 text-sm text-red-600">
              {callbackError || error}
            </p>
            <Link
              href="/login"
              className="inline-block rounded-lg bg-primary px-6 py-2 text-white hover:bg-primary/90"
            >
              Try Again
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 로딩 상태
  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-4 py-12">
      <div className="w-full max-w-md text-center">
        <div className="mb-8">
          <Link href="/" className="text-3xl font-extrabold text-primary">
            PPOPLINK
          </Link>
        </div>
        
        <div className="flex flex-col items-center">
          {/* 로딩 스피너 */}
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-primary"></div>
          <p className="text-gray-600">Completing login...</p>
        </div>
      </div>
    </div>
  );
}

