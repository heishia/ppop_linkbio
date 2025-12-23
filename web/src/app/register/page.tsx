import { RegisterForm } from "@/components/auth/RegisterForm";
import Link from "next/link";

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/" className="text-3xl font-extrabold text-primary">
            PPOP LinkBio
          </Link>
          <h1 className="mt-6 text-2xl font-bold text-gray-900">
            Create your account
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Start sharing your links in one place
          </p>
        </div>

        <div className="rounded-2xl bg-white p-8 shadow-lg">
          <RegisterForm />
        </div>
      </div>
    </div>
  );
}

