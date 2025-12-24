import { LoginForm } from "@/components/auth/LoginForm";
import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/" className="text-3xl font-extrabold text-primary">
            PPOP LinkBio
          </Link>
          <h1 className="mt-6 text-2xl font-bold text-gray-900">
            다시 오신 것을 환영합니다
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            링크를 한 곳에 모아보세요
          </p>
        </div>

        <div className="rounded-2xl bg-white p-8 shadow-lg">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
