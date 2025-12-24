import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Link2, Sparkles, BarChart3 } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Hero Section */}
      <section className="px-4 py-20 sm:py-32">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-5xl font-extrabold text-gray-900 sm:text-6xl font-heading">
            모든 것을 위한{" "}
            <span className="text-primary">하나의 링크</span>
          </h1>
          <p className="mt-6 text-xl text-gray-600">
            하나의 링크에 여러 링크들을 예쁘게 넣어보세요! 간단하고 예쁜 링크바이오 뽑링크
          </p>
          <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Link href="/register">
              <Button variant="primary" className="w-full sm:w-auto px-8 py-4 text-lg">
                무료로 시작하기
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="secondary" className="w-full sm:w-auto px-8 py-4 text-lg">
                로그인
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-4 py-20 bg-white">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-center text-3xl font-bold text-gray-900 font-heading">
            필요한 모든 기능
          </h2>
          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Link2 className="h-8 w-8 text-primary" strokeWidth={2} />
              </div>
              <h3 className="mt-4 text-xl font-semibold text-gray-900 font-heading">
                무제한 링크
              </h3>
              <p className="mt-2 text-gray-600">
                원하는 만큼 링크를 추가하세요. 제한이 없습니다.
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Sparkles className="h-8 w-8 text-primary" strokeWidth={2} />
              </div>
              <h3 className="mt-4 text-xl font-semibold text-gray-900 font-heading">
                커스터마이징
              </h3>
              <p className="mt-2 text-gray-600">
                테마와 색상으로 나만의 스타일을 만들어보세요.
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <BarChart3 className="h-8 w-8 text-primary" strokeWidth={2} />
              </div>
              <h3 className="mt-4 text-xl font-semibold text-gray-900 font-heading">
                분석
              </h3>
              <p className="mt-2 text-gray-600">
                링크의 클릭 수와 조회수를 추적하세요.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Free Appeal Section */}
      <section className="px-4 py-20 bg-gradient-to-r from-primary via-blue-500 to-indigo-600">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-lg text-white/80 font-medium">
            링크인바이오 기능 추가하면 유료?
          </p>
          <h2 className="mt-4 text-4xl sm:text-5xl font-extrabold text-white font-heading">
            뽑링크는 가입만하면
            <span className="block mt-2 text-yellow-300">무료!</span>
          </h2>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <div className="bg-white/20 backdrop-blur-sm rounded-full px-6 py-3 text-white font-medium">
              무제한 링크
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-full px-6 py-3 text-white font-medium">
              커스텀 테마
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-full px-6 py-3 text-white font-medium">
              분석 기능
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-full px-6 py-3 text-white font-medium">
              평생 무료
            </div>
          </div>
          <div className="mt-10">
            <Link href="/register">
              <Button variant="secondary" className="px-10 py-4 text-lg bg-white text-primary hover:bg-gray-100 font-bold shadow-xl">
                지금 바로 시작하기
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-20">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold text-gray-900 font-heading">
            시작할 준비가 되셨나요?
          </h2>
          <p className="mt-4 text-xl text-gray-600">
            수천 명의 크리에이터들과 함께 콘텐츠를 공유하세요.
          </p>
          <div className="mt-8">
            <Link href="/register">
              <Button variant="primary" className="px-8 py-4 text-lg">
                링크 바이오 만들기
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white px-4 py-12">
        <div className="mx-auto max-w-6xl text-center">
          <p className="text-sm text-gray-600">
            © 2024 PPOPLINK. All rights reserved.
          </p>
        </div>
      </footer>
    </main>
  );
}
