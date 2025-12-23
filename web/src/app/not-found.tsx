import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4">
      <div className="text-center">
        <h1 className="text-6xl font-extrabold text-gray-900">404</h1>
        <h2 className="mt-4 text-2xl font-bold text-gray-700">
          Profile Not Found
        </h2>
        <p className="mt-2 text-gray-600">
          The profile you're looking for doesn't exist.
        </p>
        <div className="mt-8">
          <Link href="/">
            <Button variant="primary">Go Home</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

