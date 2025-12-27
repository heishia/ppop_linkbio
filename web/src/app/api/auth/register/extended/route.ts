import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8005";
const PPOP_AUTH_CLIENT_ORIGIN = process.env.NEXT_PUBLIC_PPOP_AUTH_CLIENT_ORIGIN;

// 환경변수가 없으면 에러 반환 (보안상 하드코딩된 값 사용 금지)
if (!PPOP_AUTH_CLIENT_ORIGIN) {
  console.error("NEXT_PUBLIC_PPOP_AUTH_CLIENT_ORIGIN environment variable is not set");
}

export async function POST(request: NextRequest) {
  // 환경변수 확인
  if (!PPOP_AUTH_CLIENT_ORIGIN) {
    return NextResponse.json(
      { error: "Server configuration error" },
      { status: 500 }
    );
  }

  try {
    const body = await request.json();
    
    // 백엔드로 프록시
    const response = await fetch(`${BACKEND_URL}/api/auth/register/extended`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    // CORS 헤더 추가
    return NextResponse.json(data, {
      status: response.status,
      headers: {
        "Access-Control-Allow-Origin": PPOP_AUTH_CLIENT_ORIGIN,
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Credentials": "true",
      },
    });
  } catch (error) {
    console.error("Register extended proxy error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      {
        status: 500,
        headers: {
          "Access-Control-Allow-Origin": PPOP_AUTH_CLIENT_ORIGIN,
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      }
    );
  }
}

export async function OPTIONS() {
  // 환경변수 확인
  if (!PPOP_AUTH_CLIENT_ORIGIN) {
    return new NextResponse(null, { status: 500 });
  }

  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": PPOP_AUTH_CLIENT_ORIGIN,
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Allow-Credentials": "true",
    },
  });
}

