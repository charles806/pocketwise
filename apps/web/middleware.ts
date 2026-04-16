import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export const middleware = (
    request: NextRequest
) => {
    const token = request.cookies.get('refreshToken')?.value;

    const isDashboard = request.nextUrl.pathname.startsWith('/dashboard');

    if (!token && isDashboard) {
        const loginUrl = new URL('/login', request.url)
        loginUrl.searchParams.set('from', request.nextUrl.pathname)
        return NextResponse.redirect(loginUrl)
    }
    return NextResponse.next()
}


export const config = {
  matcher: ['/dashboard/:path*'],
};