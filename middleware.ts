
import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"
import { query } from "./lib/db-server"

const PUBLIC_PREFIXES = ["/login", "/auth"]

async function validateSession(token: string): Promise<boolean> {
  try {
    const result = await query(
      `
        SELECT s.id 
        FROM sessions s
        WHERE s.session_token = $1 AND s.expires_at > NOW()
        LIMIT 1
      `,
      [token]
    )
    return result.rows.length > 0
  } catch (error) {
    console.error("Session validation error:", error)
    return false
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const sessionToken = request.cookies.get("gm_session")?.value

  // Root route: send to dashboard if logged in, otherwise to login
  if (pathname === "/") {
    const url = request.nextUrl.clone()
    if (sessionToken) {
      const isValidSession = await validateSession(sessionToken)
      url.pathname = isValidSession ? "/dashboard" : "/login"
    } else {
      url.pathname = "/login"
    }
    return NextResponse.redirect(url)
  }

  const isPublic = PUBLIC_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`))
  if (isPublic) {
    // Prevent accessing login if already authenticated
    if (pathname === "/login" && sessionToken) {
      const isValidSession = await validateSession(sessionToken)
      if (isValidSession) {
        const url = request.nextUrl.clone()
        url.pathname = "/dashboard"
        return NextResponse.redirect(url)
      }
    }
    return NextResponse.next()
  }

  // Protect everything else - validate session properly
  if (!sessionToken) {
    const url = request.nextUrl.clone()
    url.pathname = "/login"
    return NextResponse.redirect(url)
  }

  const isValidSession = await validateSession(sessionToken)
  if (!isValidSession) {
    const url = request.nextUrl.clone()
    url.pathname = "/login"
    // Clear invalid session cookie
    const response = NextResponse.redirect(url)
    response.cookies.delete("gm_session")
    return response
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
