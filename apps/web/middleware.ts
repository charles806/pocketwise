import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export const middleware = async (request: NextRequest) => {
  // The refreshToken is httpOnly and set on the API domain,
  // so this middleware (on the frontend domain) can't read it.
  // Instead, we check a lightweight session flag set by the client after login.
  const token = request.cookies.get("auth_session")?.value;

  const iswallet = request.nextUrl.pathname.startsWith("/wallet");

  if (!token && iswallet) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }
  return NextResponse.next();
};

export const config = {
  matcher: ["/wallet/:path*"],
};
