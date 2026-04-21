import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export const middleware = (
    request: NextRequest
) => {
    const token = request.cookies.get('refreshToken')?.value;

    const iswallet = request.nextUrl.pathname.startsWith('/wallet');

    if (!token && iswallet) {
        const loginUrl = new URL('/login', request.url)
        loginUrl.searchParams.set('from', request.nextUrl.pathname)
        return NextResponse.redirect(loginUrl)
    }
    return NextResponse.next()
}


export const config = {
  matcher: ['/wallet/:path*'],
};