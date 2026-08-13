import { NextRequest, NextResponse } from "next/server";

const AUTH_ENTRY_PATHS = "/login";
const SESSION_COOKIE = "auth_session";

export function proxy(request: NextRequest) {
    const session = request.cookies.get(SESSION_COOKIE)?.value;
    const { pathname } = request.nextUrl;

    console.log(`[Proxy] Path: ${pathname} | Session Cookie (auth_session): ${session ? "Present" : "Missing"}`);

    const isAuthEntry = pathname === AUTH_ENTRY_PATHS;

    if (isAuthEntry && session) {
        console.log(`[Proxy] Redirecting authenticated user from ${pathname} to /dashboard`);
        return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    if (!isAuthEntry && !session) {
        console.log(`[Proxy] Redirecting unauthenticated user from ${pathname} to /login`);
        return NextResponse.redirect(new URL("/login", request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico|images).*)"],
};
