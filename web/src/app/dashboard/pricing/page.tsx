"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Check, Crown, Zap, X } from "lucide-react";

interface PricingPlan {
  id: string;
  name: string;
  price: number;
  period: string;
  description: string;
  features: { text: string; included: boolean }[];
  isPopular: boolean;
  icon: React.ReactNode;
}

const plans: PricingPlan[] = [
  {
    id: "free",
    name: "평생 무료로 쓰기",
    price: 0,
    period: "forever",
    description: "기본 기능을 무료로 사용하세요",
    features: [
      { text: "무제한 링크 추가", included: true },
      { text: "기본 분석 기능", included: true },
      { text: "기본 고객 지원", included: true },
      { text: "PPOPLINK 워터마크 표시", included: false },
    ],
    isPopular: false,
    icon: <Zap className="h-6 w-6" />,
  },
  {
    id: "pro",
    name: "워터마크 제거하기",
    price: 1500,
    period: "month",
    description: "깔끔한 프로필 페이지를 만들어보세요",
    features: [
      { text: "무료 플랜의 모든 기능", included: true },
      { text: "PPOPLINK 워터마크 제거", included: true },
      { text: "상세 분석 기능", included: true },
      { text: "우선 고객 지원", included: true },
      { text: "커스텀 테마", included: true },
    ],
    isPopular: true,
    icon: <Crown className="h-6 w-6" />,
  },
];

export default function PricingPage() {
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState<string>("pro");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSelectPlan = (planId: string) => {
    setSelectedPlan(planId);
  };

  const handlePurchase = async () => {
    if (selectedPlan === "free") {
      router.push("/dashboard/links");
      return;
    }

    setIsProcessing(true);
    
    // TODO: 실제 결제 로직 구현
    // 현재는 시뮬레이션만 수행
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    alert("결제 기능은 곧 제공될 예정입니다! 조금만 기다려주세요.");
    setIsProcessing(false);
  };

  const formatPrice = (price: number) => {
    if (price === 0) return "무료";
    return new Intl.NumberFormat("ko-KR").format(price) + "원";
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12 px-4">
      <div className="mx-auto max-w-4xl">
        {/* 헤더 */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Crown className="h-4 w-4" />
            <span>PRO 업그레이드 가능</span>
          </div>
          <h1 className="text-4xl font-extrabold text-gray-900 font-heading">
            PPOPLINK 워터마크 제거
          </h1>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            PRO 업그레이드로 워터마크 없는 깔끔한 링크 페이지를 만들어보세요!
          </p>
        </div>

        {/* 가격표 */}
        <div className="grid gap-8 md:grid-cols-2 max-w-3xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.id}
              onClick={() => handleSelectPlan(plan.id)}
              className={`relative cursor-pointer rounded-2xl border-2 bg-white p-8 transition-all duration-300 hover:shadow-xl ${
                selectedPlan === plan.id
                  ? "border-primary shadow-lg scale-105"
                  : "border-gray-200 hover:border-gray-300"
              } ${plan.isPopular ? "ring-2 ring-primary ring-offset-2" : ""}`}
            >
              {/* 인기 뱃지 */}
              {plan.isPopular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="bg-primary text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-md">
                    추천
                  </span>
                </div>
              )}

              {/* 플랜 아이콘 */}
              <div
                className={`inline-flex items-center justify-center w-12 h-12 rounded-xl mb-4 ${
                  selectedPlan === plan.id
                    ? "bg-primary text-white"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {plan.icon}
              </div>

              {/* 플랜 이름 */}
              <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
              <p className="mt-1 text-sm text-gray-500">{plan.description}</p>

              {/* 가격 */}
              <div className="mt-6 mb-6">
                <span className="text-4xl font-extrabold text-gray-900">
                  {formatPrice(plan.price)}
                </span>
                {plan.price > 0 && (
                  <span className="text-gray-500 ml-1">/월</span>
                )}
              </div>

              {/* 기능 리스트 */}
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    {feature.included ? (
                      <Check
                        className={`h-5 w-5 flex-shrink-0 ${
                          selectedPlan === plan.id
                            ? "text-primary"
                            : "text-green-500"
                        }`}
                      />
                    ) : (
                      <X className="h-5 w-5 flex-shrink-0 text-red-400" />
                    )}
                    <span
                      className={`text-sm ${
                        feature.included
                          ? feature.text.includes("워터마크 제거")
                            ? "text-primary font-semibold"
                            : "text-gray-600"
                          : "text-gray-400 line-through"
                      }`}
                    >
                      {feature.text}
                    </span>
                  </li>
                ))}
              </ul>

              {/* 선택 버튼 */}
              <Button
                variant={selectedPlan === plan.id ? "primary" : "secondary"}
                className="w-full py-3"
              >
                {selectedPlan === plan.id ? "선택됨" : "선택하기"}
              </Button>
            </div>
          ))}
        </div>

        {/* 결제 버튼 */}
        <div className="mt-12 text-center">
          <Button
            variant="primary"
            onClick={handlePurchase}
            disabled={isProcessing}
            className="px-12 py-4 text-lg font-bold shadow-lg hover:shadow-xl transition-shadow"
          >
            {isProcessing ? (
              <span className="flex items-center gap-2">
                <svg
                  className="animate-spin h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                처리 중...
              </span>
            ) : selectedPlan === "free" ? (
              "무료로 계속 사용하기"
            ) : (
              "워터마크 제거하기"
            )}
          </Button>

          <p className="mt-4 text-sm text-gray-500">
            안전한 결제 시스템을 통해 처리됩니다. 언제든지 취소 가능합니다.
          </p>
        </div>

        {/* 뒤로 가기 */}
        <div className="mt-8 text-center">
          <button
            onClick={() => router.back()}
            className="text-gray-500 hover:text-gray-700 text-sm underline"
          >
            대시보드로 돌아가기
          </button>
        </div>

        {/* FAQ 섹션 */}
        <div className="mt-20 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8 font-heading">
            자주 묻는 질문
          </h2>
          
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-semibold text-gray-900">
                PRO로 업그레이드하면 어떻게 되나요?
              </h3>
              <p className="mt-2 text-gray-600 text-sm">
                PRO로 업그레이드하면 링크 페이지에서 PPOPLINK 워터마크가 자동으로 제거됩니다.
                추가로 상세 분석 기능과 커스텀 테마도 사용할 수 있어요.
              </p>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-semibold text-gray-900">
                언제든지 취소할 수 있나요?
              </h3>
              <p className="mt-2 text-gray-600 text-sm">
                네! 언제든지 구독을 취소할 수 있습니다. 취소 후에도 결제 기간이 끝날 때까지 PRO 기능을 계속 사용할 수 있어요.
              </p>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-semibold text-gray-900">
                어떤 결제 방법을 지원하나요?
              </h3>
              <p className="mt-2 text-gray-600 text-sm">
                신용카드, 체크카드는 물론 카카오페이, 네이버페이 등 다양한 결제 수단을 지원합니다.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
