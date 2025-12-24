import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4">
      <div className="text-center">
        <h1 className="text-6xl font-extrabold text-gray-900">404</h1>
        <h2 className="mt-4 text-2xl font-bold text-gray-700">
          프로필을 찾을 수 없습니다
        </h2>
        <p className="mt-2 text-gray-600">
          찾고 계신 프로필이 존재하지 않습니다.
        </p>
        <div className="mt-8">
          <Link href="/">
            <Button variant="primary">홈으로 가기</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
