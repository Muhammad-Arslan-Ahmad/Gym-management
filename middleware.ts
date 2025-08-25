import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"

const PUBLIC_PREFIXES = ["/login", "/auth"]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const hasSession = Boolean(request.cookies.get("gm_session")?.value)

  // Root route: send to dashboard if logged in, otherwise to login
  if (pathname === "/") {
    const url = request.nextUrl.clone()
    url.pathname = hasSession ? "/dashboard" : "/login"
    return NextResponse.redirect(url)
  }

  const isPublic = PUBLIC_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`))
  if (isPublic) {
    // Prevent accessing login if already authenticated
    if (pathname === "/login" && hasSession) {
      const url = request.nextUrl.clone()
      url.pathname = "/dashboard"
      return NextResponse.redirect(url)
    }
    return NextResponse.next()
  }

  // Protect everything else
  if (!hasSession) {
    const url = request.nextUrl.clone()
    url.pathname = "/login"
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
