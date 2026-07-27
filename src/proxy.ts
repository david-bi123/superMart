import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const publicRoutes = ["/login", "/register", "/forgot-password", "/reset-password", "/verify-email", "/two-factor"];

const publicPrefixes = ["/api/", "/receipt/", "/_next/", "/favicon"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isPublic =
    publicRoutes.some((route) => pathname.startsWith(route)) ||
    publicPrefixes.some((prefix) => pathname.startsWith(prefix)) ||
    pathname === "/";

  if (isPublic) {
    return NextResponse.next();
  }

  const sessionToken = request.cookies.get("next-auth.session-token")?.value ||
    request.cookies.get("__Secure-next-auth.session-token")?.value;

  if (!sessionToken) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
