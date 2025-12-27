import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8005";
const PPOP_AUTH_CLIENT_ORIGIN = process.env.NEXT_PUBLIC_PPOP_AUTH_CLIENT_ORIGIN || "https://auth-client-production-04b4.up.railway.app";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // 백엔드로 프록시
    const response = await fetch(`${BACKEND_URL}/api/auth/login`, {
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
    console.error("Auth login proxy error:", error);
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

