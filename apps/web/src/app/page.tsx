import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Hero Section */}
      <section className="px-4 py-20 sm:py-32">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-5xl font-extrabold text-gray-900 sm:text-6xl">
            One link for{" "}
            <span className="text-primary">everything</span>
          </h1>
          <p className="mt-6 text-xl text-gray-600">
            Share your content, grow your audience, and connect with your fans
            all in one place.
          </p>
          <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Link href="/register">
              <Button variant="primary" className="w-full sm:w-auto px-8 py-4 text-lg">
                Get Started Free
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="secondary" className="w-full sm:w-auto px-8 py-4 text-lg">
                Log In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-4 py-20 bg-white">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-center text-3xl font-bold text-gray-900">
            Everything you need
          </h2>
          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <span className="text-3xl">🔗</span>
              </div>
              <h3 className="mt-4 text-xl font-semibold text-gray-900">
                Unlimited Links
              </h3>
              <p className="mt-2 text-gray-600">
                Add as many links as you want. No limits.
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <span className="text-3xl">🎨</span>
              </div>
              <h3 className="mt-4 text-xl font-semibold text-gray-900">
                Customizable
              </h3>
              <p className="mt-2 text-gray-600">
                Make it yours with themes and colors.
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <span className="text-3xl">📊</span>
              </div>
              <h3 className="mt-4 text-xl font-semibold text-gray-900">
                Analytics
              </h3>
              <p className="mt-2 text-gray-600">
                Track clicks and views on your links.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-20">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold text-gray-900">
            Ready to get started?
          </h2>
          <p className="mt-4 text-xl text-gray-600">
            Join thousands of creators sharing their content.
          </p>
          <div className="mt-8">
            <Link href="/register">
              <Button variant="primary" className="px-8 py-4 text-lg">
                Create Your Link Bio
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white px-4 py-12">
        <div className="mx-auto max-w-6xl text-center">
          <p className="text-sm text-gray-600">
            © 2024 PPOP LinkBio. All rights reserved.
          </p>
        </div>
      </footer>
    </main>
  );
}

